import { createContext, useContext, useEffect, useCallback, useState, ReactNode, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { nacaKeys } from "@/hooks/use-naca";
import { nacaApi } from "@/lib/naca-api";
import { nacaAuth } from "@/lib/naca-auth";
import { notificationPoller } from "@/lib/naca-notification-poller";
import { offlineQueue } from "@/lib/naca-offline-queue";

interface DevSyncMessage {
  type: string;
  componentId?: string;
  payload?: any;
}

interface DevSyncContextValue {
  isConnected: boolean;
  isPollingMode: boolean;
  isRetrying: boolean;
  retryCount: number;
  clientCount: number;
  componentId: string | undefined;
  setComponentId: (id: string | undefined) => void;
  connect: () => void;
  connectToNACA: () => void;
  disconnect: () => void;
  send: (message: DevSyncMessage) => void;
  subscribe: (messageType: string, handler: (payload: any) => void) => () => void;
  subscribeToNACA: (topics: string[], handler: (type: string, payload: any) => void) => () => void;
  requestActivity: () => void;
  broadcastActivityUpdate: (activityId: string) => void;
}

const DevSyncContext = createContext<DevSyncContextValue | null>(null);

interface DevSyncProviderProps {
  children: ReactNode;
  initialComponentId?: string;
  autoConnect?: boolean;
}

const POLLING_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes
const WS_MAX_RETRIES = 3;

export function DevSyncProvider({ children, initialComponentId, autoConnect = false }: DevSyncProviderProps) {
  const queryClient = useQueryClient();
  const [componentId, setComponentId] = useState<string | undefined>(initialComponentId);
  const [isConnected, setIsConnected] = useState(false);
  const [isPollingMode, setIsPollingMode] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());
  const componentIdRef = useRef(componentId);
  const wsRetryCountRef = useRef(0);
  const lastETagRef = useRef<string | null>(null);
  
  useEffect(() => {
    componentIdRef.current = componentId;
    if (wsRef.current?.readyState === WebSocket.OPEN && componentId) {
      wsRef.current.send(JSON.stringify({
        type: "identify",
        componentId
      }));
    }
  }, [componentId]);
  
  const handleNacaMessage = useCallback((message: DevSyncMessage) => {
    const { type, payload } = message;
    
    switch (type) {
      case "activityDiff":
      case "activity_diff":
        console.log("[DevSync] Activity diff received:", payload);
        break;
        
      case "capabilitiesUpdate":
      case "capabilities_update":
        nacaApi.clearCache();
        queryClient.invalidateQueries({ queryKey: nacaKeys.capabilities() });
        console.log("[DevSync] NACA capabilities updated, cache cleared");
        break;
        
      case "mediaUpload":
      case "media_upload":
        queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
        if (payload?.communityId) {
          queryClient.invalidateQueries({ queryKey: nacaKeys.community(payload.communityId) });
        }
        console.log("[DevSync] Media uploaded:", payload?.file?.filename);
        break;
        
      case "mediaDelete":
      case "media_delete":
        queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
        if (payload?.communityId) {
          queryClient.invalidateQueries({ queryKey: nacaKeys.community(payload.communityId) });
        }
        console.log("[DevSync] Media deleted:", payload?.fileId);
        break;
        
      case "mediaLink":
      case "media_link":
      case "mediaUpdate":
      case "media_update":
        queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
        console.log(`[DevSync] Media ${type}:`, payload?.fileId);
        break;
        
      case "media_library_updated":
        queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
        if (payload?.communityId) {
          queryClient.invalidateQueries({ queryKey: nacaKeys.community(payload.communityId) });
        }
        console.log("[DevSync] Media library updated for community:", payload?.communityId);
        break;
        
      case "vocabulary_updated":
        console.log("[DevSync] Vocabulary updated:", payload);
        break;
        
      case "config_update":
      case "configUpdate":
        if (payload?.baseUrl) {
          nacaApi.setBaseUrl(payload.baseUrl, payload.communityId || undefined);
          console.log("[DevSync] Configuration updated from host:", payload.baseUrl);
        }
        nacaApi.clearCache();
        queryClient.invalidateQueries({ queryKey: nacaKeys.capabilities() });
        queryClient.invalidateQueries({ queryKey: nacaKeys.communities() });
        queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
        break;
        
      case "preview_ready":
      case "previewReady":
        console.log("[DevSync] Preview ready:", payload?.sceneId);
        break;
    }
  }, [queryClient]);
  
  const subscribe = useCallback((messageType: string, handler: (payload: any) => void) => {
    if (!messageHandlersRef.current.has(messageType)) {
      messageHandlersRef.current.set(messageType, new Set());
    }
    messageHandlersRef.current.get(messageType)!.add(handler);
    
    return () => {
      messageHandlersRef.current.get(messageType)?.delete(handler);
    };
  }, []);
  
  const subscribeToNACA = useCallback((topics: string[], handler: (type: string, payload: any) => void) => {
    const unsubscribers: (() => void)[] = [];
    
    topics.forEach(topic => {
      const camelCase = topic.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
      const underscore = topic.replace(/([A-Z])/g, '_$1').toLowerCase();
      
      unsubscribers.push(subscribe(camelCase, (p) => handler(camelCase, p)));
      if (camelCase !== underscore) {
        unsubscribers.push(subscribe(underscore, (p) => handler(underscore, p)));
      }
    });
    
    return () => unsubscribers.forEach(unsub => unsub());
  }, [subscribe]);
  
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPollingMode(false);
  }, []);
  
  const pollForUpdates = useCallback(async () => {
    if (!nacaApi.isConfigured()) return;
    
    try {
      const response = await fetch('/api/naca/capabilities', { 
        method: 'HEAD',
        cache: 'no-store'
      });
      
      const etag = response.headers.get('ETag');
      const lastModified = response.headers.get('Last-Modified');
      const cacheKey = etag || lastModified;
      
      if (cacheKey && lastETagRef.current && cacheKey !== lastETagRef.current) {
        console.log("[DevSync] Polling detected changes, invalidating caches");
        nacaApi.clearCache();
        queryClient.invalidateQueries({ queryKey: nacaKeys.capabilities() });
        queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
      }
      
      if (cacheKey) {
        lastETagRef.current = cacheKey;
      }
    } catch (error) {
      console.warn("[DevSync] Polling failed:", error);
    }
  }, [queryClient]);
  
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) return;
    
    console.log("[DevSync] Starting polling fallback mode");
    setIsPollingMode(true);
    
    pollForUpdates();
    pollingIntervalRef.current = setInterval(pollForUpdates, POLLING_INTERVAL_MS);
  }, [pollForUpdates]);
  
  // Internal function that attempts connection without resetting retry state
  const attemptConnection = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/dev-sync`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsRetrying(false);
      setRetryCount(0);
      wsRetryCountRef.current = 0;
      console.log("[DevSync] Connected to server");
      
      const currentComponentId = componentIdRef.current;
      if (currentComponentId) {
        ws.send(JSON.stringify({
          type: "identify",
          componentId: currentComponentId
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as DevSyncMessage;
        
        if (message.type === "client_count") {
          setClientCount(message.payload?.count ?? 0);
        }
        
        handleNacaMessage(message);
        
        const handlers = messageHandlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.payload));
        }
      } catch (e) {
        console.error("[DevSync] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      console.log("[DevSync] Disconnected from server");
      
      if (autoConnect) {
        wsRetryCountRef.current++;
        const currentRetry = wsRetryCountRef.current;
        setRetryCount(currentRetry);
        
        if (currentRetry >= WS_MAX_RETRIES) {
          console.log(`[DevSync] WebSocket failed after ${WS_MAX_RETRIES} retries, switching to polling mode`);
          setIsRetrying(false);
          startPolling();
        } else {
          console.log(`[DevSync] Retrying connection (${currentRetry}/${WS_MAX_RETRIES})...`);
          setIsRetrying(true);
          reconnectTimeoutRef.current = setTimeout(() => {
            attemptConnection();
          }, 3000);
        }
      }
    };

    ws.onerror = (error) => {
      console.error("[DevSync] WebSocket error:", error);
    };
  }, [autoConnect, handleNacaMessage, startPolling, stopPolling]);

  // Public connect function - resets retry state and initiates connection
  const connect = useCallback(() => {
    stopPolling();
    wsRetryCountRef.current = 0;
    setIsRetrying(false);
    setRetryCount(0);
    attemptConnection();
  }, [stopPolling, attemptConnection]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    stopPolling();
    notificationPoller.stop();
    wsRetryCountRef.current = 0;
    setIsRetrying(false);
    setRetryCount(0);
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [stopPolling]);

  const send = useCallback((message: DevSyncMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const requestActivity = useCallback(() => {
    send({ type: "request_activity", componentId: componentIdRef.current });
  }, [send]);

  const broadcastActivityUpdate = useCallback((activityId: string) => {
    send({ 
      type: "activity_update", 
      componentId: componentIdRef.current,
      payload: { activityId }
    });
  }, [send]);

  // Connect to NACA WebSocket with token authentication
  const connectToNACA = useCallback(() => {
    stopPolling();
    wsRetryCountRef.current = 0;
    setIsRetrying(false);
    setRetryCount(0);
    
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) {
      wsRef.current.close();
    }

    const nacaBaseUrl = nacaApi.getBaseUrl();
    if (!nacaBaseUrl) {
      console.warn("[DevSync] Cannot connect to NACA: no base URL configured");
      return;
    }

    // Get token for authentication
    const token = nacaAuth.getToken();
    if (!token) {
      console.warn("[DevSync] Cannot connect to NACA: no auth token available");
      return;
    }

    // Build NACA WebSocket URL with token
    const urlObj = new URL(nacaBaseUrl);
    const wsProtocol = urlObj.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${urlObj.host}/ws/dev-sync?token=${encodeURIComponent(token)}`;
    
    console.log("[DevSync] Connecting to NACA WebSocket:", urlObj.host);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setIsRetrying(false);
      setRetryCount(0);
      wsRetryCountRef.current = 0;
      console.log("[DevSync] Connected to NACA WebSocket");
      
      const currentComponentId = componentIdRef.current;
      if (currentComponentId) {
        ws.send(JSON.stringify({
          type: "identify",
          componentId: currentComponentId
        }));
      }
      
      notificationPoller.start();
      offlineQueue.flush();
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as DevSyncMessage;
        
        if (message.type === "client_count") {
          setClientCount(message.payload?.count ?? 0);
        }
        
        handleNacaMessage(message);
        
        const handlers = messageHandlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.payload));
        }
      } catch (e) {
        console.error("[DevSync] Failed to parse NACA message:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      console.log("[DevSync] Disconnected from NACA WebSocket");
      
      // Don't auto-retry NACA connections, fall back to polling
      startPolling();
    };

    ws.onerror = (error) => {
      console.error("[DevSync] NACA WebSocket error:", error);
    };
  }, [stopPolling, startPolling, handleNacaMessage]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      // Ensure all timers are cleaned up on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
  
  const contextValue: DevSyncContextValue = {
    isConnected,
    isPollingMode,
    isRetrying,
    retryCount,
    clientCount,
    componentId,
    setComponentId,
    connect,
    connectToNACA,
    disconnect,
    send,
    subscribe,
    subscribeToNACA,
    requestActivity,
    broadcastActivityUpdate
  };
  
  return (
    <DevSyncContext.Provider value={contextValue}>
      {children}
    </DevSyncContext.Provider>
  );
}

export function useDevSyncContext() {
  const context = useContext(DevSyncContext);
  if (!context) {
    throw new Error("useDevSyncContext must be used within a DevSyncProvider");
  }
  return context;
}

export function useDevSyncOptional() {
  return useContext(DevSyncContext);
}
