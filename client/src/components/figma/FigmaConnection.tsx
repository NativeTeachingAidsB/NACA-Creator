import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Link2, RefreshCw, Check, AlertCircle, ExternalLink, KeyRound } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFigmaStatus, useSyncFigma } from "@/hooks/use-projects";
import type { Project } from "@shared/schema";

interface FigmaConnectionProps {
  project: Project | null;
  onConnect?: (fileKey: string, nodeId: string | null) => void;
  onSync?: () => void;
}

interface FigmaFrame {
  id: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
}

interface SyncStatus {
  status: "idle" | "connecting" | "fetching" | "syncing" | "success" | "error";
  message: string;
  framesFound?: number;
  framesUpdated?: number;
}

export function FigmaConnection({ project, onConnect, onSync }: FigmaConnectionProps) {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: "idle", message: "" });
  const queryClient = useQueryClient();
  const { data: figmaStatus } = useFigmaStatus();
  const syncMutation = useSyncFigma();

  const parseUrlMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch("/api/figma/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) throw new Error("Invalid Figma URL");
      return response.json() as Promise<{ fileKey: string; nodeId: string | null }>;
    },
  });

  const connectMutation = useMutation({
    mutationFn: async ({ projectId, fileKey, pageId }: { projectId: string; fileKey: string; pageId?: string }) => {
      const response = await fetch(`/api/projects/${projectId}/figma/connect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileKey, pageId }),
      });
      if (!response.ok) throw new Error("Failed to connect");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const importFrameMutation = useMutation({
    mutationFn: async ({ projectId, frame, imageUrl }: { projectId: string; frame: FigmaFrame; imageUrl: string }) => {
      const response = await fetch(`/api/projects/${projectId}/figma/import-frame`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frameId: frame.id,
          name: frame.name,
          width: frame.width,
          height: frame.height,
          imageUrl,
          hash: `${frame.id}-${Date.now()}`,
        }),
      });
      if (!response.ok) throw new Error("Failed to import frame");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/screens"] });
    },
  });

  const handleConnect = useCallback(async () => {
    if (!figmaUrl.trim() || !project) return;

    try {
      setSyncStatus({ status: "connecting", message: "Parsing Figma URL..." });

      const { fileKey, nodeId } = await parseUrlMutation.mutateAsync(figmaUrl);
      
      setSyncStatus({ status: "connecting", message: "Connecting to Figma file..." });
      await connectMutation.mutateAsync({ projectId: project.id, fileKey });

      setSyncStatus({ status: "success", message: "Connected! Use 'Update from Figma' to import frames." });
      onConnect?.(fileKey, nodeId);
    } catch (error) {
      setSyncStatus({ status: "error", message: error instanceof Error ? error.message : "Connection failed" });
    }
  }, [figmaUrl, project, parseUrlMutation, connectMutation, onConnect]);

  const handleUpdate = useCallback(async () => {
    if (!project?.figmaFileKey) {
      setSyncStatus({ status: "error", message: "No Figma file connected" });
      return;
    }

    if (!figmaStatus?.configured) {
      setSyncStatus({ status: "error", message: "Figma API token not configured. Please add FIGMA_API_TOKEN to your secrets." });
      return;
    }

    try {
      setSyncStatus({ status: "syncing", message: "Fetching frames from Figma..." });
      
      const result = await syncMutation.mutateAsync(project.id);
      
      setSyncStatus({ 
        status: "success", 
        message: `Sync complete! ${result.framesImported} new, ${result.framesUpdated} updated`,
        framesFound: result.framesFound,
        framesUpdated: result.framesImported + result.framesUpdated
      });
      
      onSync?.();
    } catch (error) {
      setSyncStatus({ status: "error", message: error instanceof Error ? error.message : "Sync failed" });
    }
  }, [project, figmaStatus, syncMutation, onSync]);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "Never";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  };

  const isConnected = !!project?.figmaFileKey;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-zinc-100">Figma Connection</CardTitle>
            <CardDescription className="text-xs text-zinc-500">
              Connect to a Figma file for rapid design iteration
            </CardDescription>
          </div>
          {isConnected && (
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Check className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="figma-url" className="text-xs text-zinc-400">Figma File URL</Label>
              <div className="flex gap-2">
                <Input
                  id="figma-url"
                  data-testid="input-figma-url"
                  placeholder="https://figma.com/design/..."
                  value={figmaUrl}
                  onChange={(e) => setFigmaUrl(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 text-sm h-8"
                />
                <Button
                  data-testid="button-figma-connect"
                  size="sm"
                  onClick={handleConnect}
                  disabled={!figmaUrl.trim() || syncStatus.status === "connecting"}
                  className="h-8 px-3"
                >
                  {syncStatus.status === "connecting" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">File Key:</span>
              <code className="bg-zinc-800 px-2 py-0.5 rounded text-zinc-300">{project.figmaFileKey}</code>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Last Synced:</span>
              <span className="text-zinc-300">{formatDate(project.figmaLastSyncedAt)}</span>
            </div>
            <Button
              data-testid="button-figma-update"
              variant="outline"
              size="sm"
              className="w-full h-8 bg-zinc-800 border-zinc-700 text-zinc-100 hover:bg-zinc-700"
              onClick={handleUpdate}
              disabled={syncStatus.status === "syncing" || syncStatus.status === "fetching"}
            >
              {syncStatus.status === "syncing" || syncStatus.status === "fetching" ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {syncStatus.message}
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Update from Figma
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-7 text-xs text-zinc-500 hover:text-zinc-300"
              onClick={() => window.open(`https://figma.com/file/${project.figmaFileKey}`, "_blank")}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Open in Figma
            </Button>
          </div>
        )}

        {syncStatus.status !== "idle" && (
          <div className={`flex items-start gap-2 p-2 rounded text-xs ${
            syncStatus.status === "error" ? "bg-red-500/10 text-red-400" :
            syncStatus.status === "success" ? "bg-green-500/10 text-green-400" :
            "bg-blue-500/10 text-blue-400"
          }`}>
            {syncStatus.status === "error" && <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
            {syncStatus.status === "success" && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
            {(syncStatus.status === "connecting" || syncStatus.status === "fetching" || syncStatus.status === "syncing") && (
              <Loader2 className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
            )}
            <span>{syncStatus.message}</span>
          </div>
        )}

        {syncStatus.framesUpdated !== undefined && (
          <div className="text-xs text-zinc-400">
            {syncStatus.framesUpdated} of {syncStatus.framesFound} frames updated
          </div>
        )}

        {isConnected && figmaStatus && !figmaStatus.configured && (
          <div className="flex items-start gap-2 p-2 rounded text-xs bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Add FIGMA_API_TOKEN to your secrets to enable syncing</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
