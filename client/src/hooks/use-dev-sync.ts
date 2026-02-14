import { useState, useEffect, useCallback, useRef } from "react";

interface DevSyncMessage {
  type: string;
  componentId?: string;
  payload?: any;
}

interface UseDevSyncOptions {
  componentId?: string;
  autoConnect?: boolean;
  onMessage?: (message: DevSyncMessage) => void;
}

export type NacaMessageType = 
  | "capabilities_update"
  | "media_upload"
  | "media_link"
  | "media_delete"
  | "media_update"
  | "media_library_updated"
  | "vocabulary_updated";

export function useDevSync(options: UseDevSyncOptions = {}) {
  const { componentId, autoConnect = false, onMessage } = options;
  const [isConnected, setIsConnected] = useState(false);
  const [clientCount, setClientCount] = useState(0);
  const [lastMessage, setLastMessage] = useState<DevSyncMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messageHandlersRef = useRef<Map<string, Set<(payload: any) => void>>>(new Map());
  const onMessageRef = useRef(onMessage);
  
  onMessageRef.current = onMessage;

  const subscribe = useCallback((messageType: string, handler: (payload: any) => void) => {
    if (!messageHandlersRef.current.has(messageType)) {
      messageHandlersRef.current.set(messageType, new Set());
    }
    messageHandlersRef.current.get(messageType)!.add(handler);
    
    return () => {
      messageHandlersRef.current.get(messageType)?.delete(handler);
    };
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || 
        wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws/dev-sync`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log("[DevSync] Connected to server");
      
      if (componentId) {
        ws.send(JSON.stringify({
          type: "identify",
          componentId
        }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        
        if (message.type === "client_count") {
          setClientCount(message.payload?.count ?? 0);
        }
        
        const handlers = messageHandlersRef.current.get(message.type);
        if (handlers) {
          handlers.forEach(handler => handler(message.payload));
        }
        
        onMessageRef.current?.(message);
      } catch (e) {
        console.error("[DevSync] Failed to parse message:", e);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      console.log("[DevSync] Disconnected from server");
      
      if (autoConnect) {
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      }
    };

    ws.onerror = (error) => {
      console.error("[DevSync] WebSocket error:", error);
    };
  }, [componentId, autoConnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const send = useCallback((message: DevSyncMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  const requestActivity = useCallback(() => {
    send({ type: "request_activity", componentId });
  }, [send, componentId]);

  const broadcastActivityUpdate = useCallback((activityId: string) => {
    send({ 
      type: "activity_update", 
      componentId,
      payload: { activityId }
    });
  }, [send, componentId]);

  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    clientCount,
    lastMessage,
    connect,
    disconnect,
    send,
    subscribe,
    requestActivity,
    broadcastActivityUpdate
  };
}
