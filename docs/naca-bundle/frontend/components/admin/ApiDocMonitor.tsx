import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  FileText, 
  RefreshCw, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  ExternalLink,
  Bell,
  BellOff,
  Eye,
  Code,
  Server,
  Laptop
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface DocStatus {
  exists: boolean;
  slug?: string;
  version?: string;
  lastUpdated?: string;
  publishStatus?: string;
  publishedAt?: string;
  publishedToDev?: boolean;
  publishedToProd?: boolean;
  schemaHash?: string;
  needsRebuild: boolean;
}

interface RebuildResult {
  success: boolean;
  message: string;
  schemaHash?: string;
  lastUpdated?: string;
}

interface PublishResult {
  success: boolean;
  message: string;
  publishedAt?: string;
}

const POLL_INTERVAL = 30000; // 30 seconds

export function ApiDocMonitor() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [lastNotifiedHash, setLastNotifiedHash] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading, error, refetch } = useQuery<DocStatus>({
    queryKey: ["/api/docs/activity-editor/status"],
    queryFn: async () => {
      const res = await fetch("/api/docs/activity-editor/status");
      if (!res.ok) throw new Error("Failed to fetch documentation status");
      return res.json();
    },
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });

  const rebuildMutation = useMutation<RebuildResult, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/docs/activity-editor/rebuild", { method: "POST" });
      if (!res.ok) throw new Error("Failed to rebuild documentation");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/activity-editor/status"] });
      toast({
        title: "Documentation Rebuilt",
        description: `API documentation updated successfully. Hash: ${data.schemaHash?.slice(0, 8)}`,
      });
      setLastNotifiedHash(data.schemaHash || null);
    },
    onError: (error) => {
      toast({
        title: "Rebuild Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation<PublishResult, Error, string>({
    mutationFn: async (environment: string) => {
      const res = await fetch("/api/docs/activity-editor/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment }),
      });
      if (!res.ok) throw new Error("Failed to publish documentation");
      return res.json();
    },
    onSuccess: (data, environment) => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/activity-editor/status"] });
      toast({
        title: "Documentation Published",
        description: `API documentation published to ${environment === 'both' ? 'all environments' : environment}`,
      });
    },
    onError: (error) => {
      toast({
        title: "Publish Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const showDriftNotification = useCallback(() => {
    if (notificationsEnabled && status?.needsRebuild && status?.schemaHash !== lastNotifiedHash) {
      toast({
        title: "API Schema Changed",
        description: "Your API has changed. Documentation needs to be updated.",
        action: (
          <Button 
            size="sm" 
            onClick={() => rebuildMutation.mutate()}
            disabled={rebuildMutation.isPending}
          >
            Update Now
          </Button>
        ),
      });
      setLastNotifiedHash(status.schemaHash || null);
    }
  }, [status, notificationsEnabled, lastNotifiedHash, toast, rebuildMutation]);

  useEffect(() => {
    if (status?.needsRebuild) {
      showDriftNotification();
    }
  }, [status?.needsRebuild, status?.schemaHash, showDriftNotification]);

  const getStatusColor = () => {
    if (!status?.exists) return "bg-gray-500";
    if (status.needsRebuild) return "bg-amber-500";
    if (status.publishedToProd && status.publishedToDev) return "bg-green-500";
    if (status.publishedToProd || status.publishedToDev) return "bg-blue-500";
    return "bg-gray-500";
  };

  const getStatusText = () => {
    if (!status?.exists) return "Not Generated";
    if (status.needsRebuild) return "Needs Update";
    if (status.publishedToProd && status.publishedToDev) return "Published (All)";
    if (status.publishedToProd) return "Published (Prod)";
    if (status.publishedToDev) return "Published (Dev)";
    return "Draft";
  };

  if (error) {
    return (
      <Alert variant="destructive" data-testid="api-doc-monitor-error">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load documentation status</AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="w-full" data-testid="api-doc-monitor">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">API Documentation</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    data-testid="toggle-notifications"
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
              className={`${getStatusColor()} text-white border-0`}
              data-testid="doc-status-badge"
            >
              {isLoading ? "Loading..." : getStatusText()}
            </Badge>
          </div>
        </div>
        <CardDescription>
          Monitor API schema changes and update documentation automatically
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {status?.needsRebuild && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/20" data-testid="drift-alert">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-800 dark:text-amber-200">Schema Drift Detected</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Your API routes or schema have changed since the last documentation build.
              Update the documentation to reflect these changes.
            </AlertDescription>
          </Alert>
        )}

        {status?.exists && !status.needsRebuild && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400" data-testid="status-synced">
            <CheckCircle className="h-4 w-4" />
            <span>Documentation is in sync with API schema</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <Code className="h-3 w-3" />
              Schema Hash
            </div>
            <div className="font-mono text-xs" data-testid="schema-hash">
              {status?.schemaHash?.slice(0, 8) || "—"}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last Updated
            </div>
            <div className="text-xs" data-testid="last-updated">
              {status?.lastUpdated 
                ? formatDistanceToNow(new Date(status.lastUpdated), { addSuffix: true })
                : "—"
              }
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <Laptop className="h-3 w-3" />
              Development
            </div>
            <div data-testid="dev-status">
              {status?.publishedToDev ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                  Published
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                  Not Published
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-muted-foreground flex items-center gap-1">
              <Server className="h-3 w-3" />
              Production
            </div>
            <div data-testid="prod-status">
              {status?.publishedToProd ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs">
                  Published
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-600 text-xs">
                  Not Published
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant={status?.needsRebuild ? "default" : "outline"}
            size="sm"
            onClick={() => rebuildMutation.mutate()}
            disabled={rebuildMutation.isPending}
            data-testid="rebuild-button"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${rebuildMutation.isPending ? 'animate-spin' : ''}`} />
            {rebuildMutation.isPending ? "Rebuilding..." : "Rebuild Docs"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => publishMutation.mutate("dev")}
            disabled={publishMutation.isPending || !status?.exists}
            data-testid="publish-dev-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            Publish Dev
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => publishMutation.mutate("prod")}
            disabled={publishMutation.isPending || !status?.exists}
            data-testid="publish-prod-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            Publish Prod
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => publishMutation.mutate("both")}
            disabled={publishMutation.isPending || !status?.exists}
            data-testid="publish-all-button"
          >
            <Upload className="h-4 w-4 mr-2" />
            Publish All
          </Button>
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  data-testid="view-json-button"
                >
                  <a href="/api/docs/activity-editor" target="_blank" rel="noopener noreferrer">
                    <Code className="h-4 w-4 mr-2" />
                    JSON
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View machine-readable JSON documentation</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  data-testid="view-markdown-button"
                >
                  <a href="/api/docs/activity-editor/markdown" target="_blank" rel="noopener noreferrer">
                    <Eye className="h-4 w-4 mr-2" />
                    Markdown
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View human-readable Markdown documentation</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="refresh-status-button"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function ApiDocMonitorCompact() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<DocStatus>({
    queryKey: ["/api/docs/activity-editor/status"],
    queryFn: async () => {
      const res = await fetch("/api/docs/activity-editor/status");
      if (!res.ok) throw new Error("Failed to fetch documentation status");
      return res.json();
    },
    refetchInterval: POLL_INTERVAL,
    staleTime: 10000,
  });

  const rebuildMutation = useMutation<RebuildResult, Error>({
    mutationFn: async () => {
      const res = await fetch("/api/docs/activity-editor/rebuild", { method: "POST" });
      if (!res.ok) throw new Error("Failed to rebuild documentation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/docs/activity-editor/status"] });
      toast({
        title: "Documentation Rebuilt",
        description: "API documentation has been updated.",
      });
    },
  });

  if (isLoading || !status) {
    return null;
  }

  if (!status.needsRebuild) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5"
      data-testid="api-doc-monitor-compact"
    >
      <Card className="border-amber-500 shadow-lg">
        <CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <div className="flex-1">
            <p className="text-sm font-medium">API Schema Changed</p>
            <p className="text-xs text-muted-foreground">Documentation needs updating</p>
          </div>
          <Button
            size="sm"
            onClick={() => rebuildMutation.mutate()}
            disabled={rebuildMutation.isPending}
            data-testid="compact-rebuild-button"
          >
            {rebuildMutation.isPending ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              "Update"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
