import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Cloud, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  Bell,
  BellOff,
  Code,
  Server,
  Wifi,
  WifiOff,
  ChevronDown,
  ChevronRight,
  Globe,
  Radio,
  Eye
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface NacaApiDocStatus {
  available: boolean;
  version?: string;
  codeHash?: string;
  lastUpdated?: string;
  endpointCount?: number;
  categories?: string[];
  websocketTopicCount?: number;
  hasChanges?: boolean;
  changes?: {
    newEndpoints?: string[];
    removedEndpoints?: string[];
    changedSchemas?: string[];
    newWebsocketTopics?: string[];
  };
  storedVersion?: string;
  storedCodeHash?: string;
  reviewedAt?: string;
  lastFetched?: string;
  error?: string;
  connectionError?: boolean;
}

interface MarkReviewedResult {
  success: boolean;
  reviewedAt?: string;
  message?: string;
}

const POLL_INTERVAL = 60000;

export function NacaApiMonitor() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastNotifiedHash, setLastNotifiedHash] = useState<string | null>(null);
  const [showEndpoints, setShowEndpoints] = useState(false);
  const [showWebsocketTopics, setShowWebsocketTopics] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading, error, refetch } = useQuery<NacaApiDocStatus>({
    queryKey: ["/api/naca-api/compare"],
    queryFn: async () => {
      const res = await fetch("/api/naca-api/compare");
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return {
          available: false,
          error: errorData.error || `Server returned ${res.status}`,
          connectionError: res.status === 503,
        };
      }
      return res.json();
    },
    refetchInterval: POLL_INTERVAL,
    staleTime: 30000,
  });

  const markReviewedMutation = useMutation<MarkReviewedResult, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/naca-api/mark-reviewed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark as reviewed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/naca-api/compare"] });
      toast({
        title: "Changes Reviewed",
        description: "NACA API changes have been marked as reviewed.",
      });
      setLastNotifiedHash(status?.codeHash || null);
    },
    onError: (error) => {
      toast({
        title: "Failed to Mark Reviewed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const showChangeNotification = useCallback(() => {
    if (notificationsEnabled && status?.hasChanges && status?.codeHash !== lastNotifiedHash) {
      toast({
        title: "NACA API Updated",
        description: "The remote NACA API documentation has changed.",
        action: (
          <Button 
            size="sm" 
            onClick={() => markReviewedMutation.mutate()}
            disabled={markReviewedMutation.isPending}
          >
            Mark Reviewed
          </Button>
        ),
      });
      setLastNotifiedHash(status.codeHash || null);
    }
  }, [status, notificationsEnabled, lastNotifiedHash, toast, markReviewedMutation]);

  useEffect(() => {
    if (status?.hasChanges) {
      showChangeNotification();
    }
  }, [status?.hasChanges, status?.codeHash, showChangeNotification]);

  const getStatusColor = () => {
    if (!status?.available) return "bg-gray-500";
    if (status.connectionError) return "bg-red-500";
    if (status.hasChanges) return "bg-amber-500";
    return "bg-green-500";
  };

  const getStatusText = () => {
    if (isLoading) return "Loading...";
    if (!status?.available) return "Unavailable";
    if (status.connectionError) return "Connection Error";
    if (status.hasChanges) return "Changes Detected";
    return "In Sync";
  };

  const getStatusIcon = () => {
    if (!status?.available || status.connectionError) {
      return <WifiOff className="h-4 w-4" />;
    }
    if (status.hasChanges) {
      return <AlertTriangle className="h-4 w-4" />;
    }
    return <Wifi className="h-4 w-4" />;
  };

  if (error) {
    return (
      <Alert variant="destructive" data-testid="naca-api-monitor-error">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load NACA API status</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full" data-testid="naca-api-monitor">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">NACA Remote API</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    data-testid="naca-toggle-notifications"
                  >
                    {notificationsEnabled ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {notificationsEnabled ? "Disable notifications" : "Enable notifications"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Badge 
              variant="outline" 
              className={`${getStatusColor()} text-white border-0 flex items-center gap-1`}
              data-testid="naca-status-badge"
            >
              {getStatusIcon()}
              {getStatusText()}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Monitor remote NACA API documentation for changes
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status?.connectionError && (
          <Alert variant="destructive" data-testid="naca-connection-error">
            <WifiOff className="h-4 w-4" />
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              Unable to reach the NACA server. Check your network connection or server availability.
              {status.error && <span className="block mt-1 text-xs">{status.error}</span>}
            </AlertDescription>
          </Alert>
        )}

        {status?.hasChanges && !status.connectionError && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20" data-testid="naca-changes-alert">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">API Changes Detected</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              The remote NACA API has been updated since your last review.
              Review the changes below and update your implementation if needed.
            </AlertDescription>
          </Alert>
        )}

        {status?.available && !status.hasChanges && !status.connectionError && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400" data-testid="naca-status-synced">
            <CheckCircle className="h-4 w-4" />
            <span>Remote API documentation matches your last reviewed version</span>
          </div>
        )}

        {status?.available && (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  API Version
                </div>
                <div className="font-mono text-xs" data-testid="naca-version">
                  {status.version || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Code Hash
                </div>
                <div className="font-mono text-xs" data-testid="naca-code-hash">
                  {status.codeHash?.slice(0, 8) || "—"}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Updated
                </div>
                <div className="text-xs" data-testid="naca-last-updated">
                  {status.lastUpdated 
                    ? formatDistanceToNow(new Date(status.lastUpdated), { addSuffix: true })
                    : "—"
                  }
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Server className="h-3 w-3" />
                  Endpoints
                </div>
                <div className="text-xs" data-testid="naca-endpoint-count">
                  <Badge variant="outline" className="text-xs">
                    {status.endpointCount || 0} endpoints
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Radio className="h-3 w-3" />
                  WebSocket Topics
                </div>
                <div className="text-xs" data-testid="naca-websocket-count">
                  <Badge variant="outline" className="text-xs">
                    {status.websocketTopicCount || 0} topics
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  Last Reviewed
                </div>
                <div className="text-xs" data-testid="naca-reviewed-at">
                  {status.reviewedAt 
                    ? formatDistanceToNow(new Date(status.reviewedAt), { addSuffix: true })
                    : "Never"
                  }
                </div>
              </div>
            </div>

            {status.categories && status.categories.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">API Categories</div>
                <div className="flex flex-wrap gap-1" data-testid="naca-categories">
                  {status.categories.map((category, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {status.hasChanges && status.changes && (
              <div className="space-y-3 pt-2 border-t">
                <div className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Detected Changes
                </div>

                {status.changes.newEndpoints && status.changes.newEndpoints.length > 0 && (
                  <Collapsible open={showEndpoints} onOpenChange={setShowEndpoints}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between" data-testid="naca-toggle-endpoints">
                        <span className="flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          Endpoints ({status.changes.newEndpoints.length})
                        </span>
                        {showEndpoints ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-muted/50 rounded p-2" data-testid="naca-endpoint-list">
                        {status.changes.newEndpoints.map((endpoint, idx) => (
                          <div key={idx} className="text-xs font-mono text-muted-foreground">
                            {endpoint}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {status.changes.newWebsocketTopics && status.changes.newWebsocketTopics.length > 0 && (
                  <Collapsible open={showWebsocketTopics} onOpenChange={setShowWebsocketTopics}>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between" data-testid="naca-toggle-websocket">
                        <span className="flex items-center gap-1">
                          <Radio className="h-3 w-3" />
                          WebSocket Topics ({status.changes.newWebsocketTopics.length})
                        </span>
                        {showWebsocketTopics ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <div className="max-h-48 overflow-y-auto space-y-1 bg-muted/50 rounded p-2" data-testid="naca-websocket-list">
                        {status.changes.newWebsocketTopics.map((topic, idx) => (
                          <div key={idx} className="text-xs font-mono text-muted-foreground">
                            {topic}
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}
          </>
        )}

        <div className="flex flex-wrap gap-2 pt-2">
          {status?.hasChanges && (
            <Button
              variant="default"
              size="sm"
              onClick={() => markReviewedMutation.mutate()}
              disabled={markReviewedMutation.isPending}
              data-testid="naca-mark-reviewed-button"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {markReviewedMutation.isPending ? "Marking..." : "Mark as Reviewed"}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="naca-refresh-button"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  data-testid="naca-view-json-button"
                >
                  <a href="/api/naca-api/docs" target="_blank" rel="noopener noreferrer">
                    <Code className="h-4 w-4 mr-2" />
                    View JSON
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View full remote API documentation JSON</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

export function NacaApiMonitorCompact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<NacaApiDocStatus>({
    queryKey: ["/api/naca-api/compare"],
    queryFn: async () => {
      const res = await fetch("/api/naca-api/compare");
      if (!res.ok) {
        return { available: false, connectionError: true };
      }
      return res.json();
    },
    refetchInterval: POLL_INTERVAL,
    staleTime: 30000,
  });

  const markReviewedMutation = useMutation<MarkReviewedResult, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/naca-api/mark-reviewed", { method: "POST" });
      if (!res.ok) throw new Error("Failed to mark as reviewed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/naca-api/compare"] });
      toast({
        title: "Changes Reviewed",
        description: "NACA API changes have been marked as reviewed.",
      });
    },
  });

  if (isLoading || !status) {
    return null;
  }

  if (!status.hasChanges) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5"
      data-testid="naca-api-monitor-compact"
    >
      <Card className="border-amber-500 shadow-lg">
        <CardContent className="p-4 flex items-center gap-3">
          <Cloud className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">NACA API Updated</p>
            <p className="text-xs text-muted-foreground">Remote API documentation changed</p>
          </div>
          <Button
            size="sm"
            onClick={() => markReviewedMutation.mutate()}
            disabled={markReviewedMutation.isPending}
            data-testid="naca-compact-mark-reviewed"
          >
            {markReviewedMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              "Review"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
