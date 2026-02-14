import { useState, useRef, useEffect } from "react";
import { Wifi, WifiOff, Radio, RefreshCw, Download, Upload, FileUp, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useDevSyncOptional } from "@/contexts/DevSyncContext";
import { useExportActivity, useImportActivity } from "@/hooks/use-game-data";
import { toast } from "@/hooks/use-toast";

interface DevSyncIndicatorProps {
  projectId?: string;
  onProjectImported?: (projectId: string) => void;
}

interface ActivityDefinition {
  id: string;
  componentId: string;
  version: string;
  screens: any[];
}

export function DevSyncIndicator({ projectId, onProjectImported }: DevSyncIndicatorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState<ActivityDefinition | null>(null);
  const [importProjectName, setImportProjectName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const devSync = useDevSyncOptional();
  
  const isConnected = devSync?.isConnected ?? false;
  const isPollingMode = devSync?.isPollingMode ?? false;
  const isRetrying = devSync?.isRetrying ?? false;
  const retryCount = devSync?.retryCount ?? 0;
  const clientCount = devSync?.clientCount ?? 0;
  const connect = devSync?.connect ?? (() => {});
  const disconnect = devSync?.disconnect ?? (() => {});
  const broadcastActivityUpdate = devSync?.broadcastActivityUpdate ?? (() => {});
  const setComponentId = devSync?.setComponentId;
  
  useEffect(() => {
    if (setComponentId) {
      setComponentId(projectId);
    }
    return () => {
      if (setComponentId) {
        setComponentId(undefined);
      }
    };
  }, [projectId, setComponentId]);

  const { data: activityExport, refetch: refetchExport, isLoading: isExporting } = 
    useExportActivity(projectId);
  
  const importActivity = useImportActivity();

  const handleConnect = () => {
    if (isConnected) {
      disconnect();
      toast({ title: "DevSync disconnected" });
    } else {
      connect();
      toast({ title: "Connecting to DevSync..." });
    }
  };

  const handleExport = async () => {
    const result = await refetchExport();
    if (result.data) {
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `activity_${projectId}_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Activity exported", description: "JSON file downloaded" });
    }
  };

  const handleBroadcast = () => {
    if (projectId && isConnected) {
      broadcastActivityUpdate(projectId);
      toast({ title: "Activity update broadcasted" });
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content) as ActivityDefinition;
        
        if (!data.id || typeof data.id !== 'string') {
          toast({ 
            title: "Invalid file", 
            description: "Missing required field: id",
            variant: "destructive" 
          });
          return;
        }
        
        if (!Array.isArray(data.screens)) {
          toast({ 
            title: "Invalid file", 
            description: "Missing required field: screens",
            variant: "destructive" 
          });
          return;
        }

        setPendingImport(data);
        setImportProjectName(`Imported - ${data.id}`);
        setImportDialogOpen(true);
      } catch (error) {
        toast({ 
          title: "Invalid JSON", 
          description: "Could not parse the file as JSON",
          variant: "destructive" 
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!pendingImport) return;

    try {
      const result = await importActivity.mutateAsync({
        data: pendingImport,
        projectName: importProjectName || undefined
      });
      
      toast({ 
        title: "Activity imported", 
        description: result.message 
      });
      
      setImportDialogOpen(false);
      setPendingImport(null);
      setImportProjectName("");
      setIsOpen(false);
      
      if (onProjectImported && result.projectId) {
        onProjectImported(result.projectId);
      }
    } catch (error) {
      toast({ 
        title: "Import failed", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  };

  const handleCancelImport = () => {
    setImportDialogOpen(false);
    setPendingImport(null);
    setImportProjectName("");
  };

  const getTotalObjects = () => {
    if (!pendingImport) return 0;
    return pendingImport.screens.reduce((acc, screen) => acc + (screen.objects?.length || 0), 0);
  };

  const getTotalScenes = () => {
    if (!pendingImport) return 0;
    return pendingImport.screens.reduce((acc, screen) => acc + (screen.scenes?.length || 0), 0);
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json,application/json"
        className="hidden"
        data-testid="input-import-file"
      />
      
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-2"
            data-testid="button-devsync"
          >
            {isConnected ? (
              <Radio className="h-4 w-4 text-green-500 animate-pulse" />
            ) : isRetrying ? (
              <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />
            ) : isPollingMode ? (
              <Clock className="h-4 w-4 text-yellow-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs hidden sm:inline">
              {isConnected ? "Connected" : isRetrying ? `Retrying (${retryCount}/3)` : isPollingMode ? "Polling" : "DevSync"}
            </span>
            {isConnected && clientCount > 0 && (
              <Badge variant="secondary" className="text-xs px-1.5">
                {clientCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">NACA DevSync</h4>
              <Badge variant={isConnected ? "default" : isRetrying ? "outline" : isPollingMode ? "outline" : "secondary"}>
                {isConnected ? "Online" : isRetrying ? "Retrying" : isPollingMode ? "Polling" : "Offline"}
              </Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              {isRetrying 
                ? `Reconnecting to server (attempt ${retryCount}/3)...`
                : isPollingMode 
                ? "WebSocket unavailable. Checking for updates every 15 minutes." 
                : "Real-time sync with NACA platform for live preview and testing."}
            </p>

            <div className="space-y-2">
              <Button 
                variant={isConnected ? "destructive" : "default"}
                size="sm"
                className="w-full gap-2"
                onClick={handleConnect}
                data-testid="button-devsync-toggle"
              >
                {isConnected ? (
                  <>
                    <WifiOff className="h-4 w-4" />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4" />
                    Connect
                  </>
                )}
              </Button>

              {isConnected && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleBroadcast}
                  data-testid="button-devsync-broadcast"
                >
                  <RefreshCw className="h-4 w-4" />
                  Broadcast Update
                </Button>
              )}

              <div className="border-t pt-2 mt-2">
                <p className="text-xs text-muted-foreground mb-2">Import / Export</p>
                
                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={handleExport}
                  disabled={!projectId || isExporting}
                  data-testid="button-export-activity"
                >
                  <Download className="h-4 w-4" />
                  Export Activity JSON
                </Button>

                <Button 
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 mt-2"
                  onClick={handleFileSelect}
                  disabled={importActivity.isPending}
                  data-testid="button-import-activity"
                >
                  <Upload className="h-4 w-4" />
                  Import Activity JSON
                </Button>
              </div>
            </div>

            {(isConnected || isPollingMode || isRetrying) && (
              <div className="text-xs text-muted-foreground border-t pt-2">
                {isConnected && (
                  <>
                    <div className="flex justify-between">
                      <span>Connected clients:</span>
                      <span className="font-mono">{clientCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>WebSocket:</span>
                      <span className="font-mono text-green-500">/ws/dev-sync</span>
                    </div>
                  </>
                )}
                {isRetrying && (
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="font-mono text-orange-500">Retrying ({retryCount}/3)</span>
                  </div>
                )}
                {isPollingMode && (
                  <div className="flex justify-between">
                    <span>Mode:</span>
                    <span className="font-mono text-yellow-500">Polling (15 min)</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5" />
              Import Activity
            </DialogTitle>
            <DialogDescription>
              Review the activity details before importing. This will create a new project.
            </DialogDescription>
          </DialogHeader>
          
          {pendingImport && (
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={importProjectName}
                  onChange={(e) => setImportProjectName(e.target.value)}
                  placeholder="Enter project name"
                  data-testid="input-import-project-name"
                />
              </div>
              
              <div className="rounded-lg border p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Activity ID:</span>
                  <span className="font-mono">{pendingImport.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-mono">{pendingImport.version || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Screens:</span>
                  <Badge variant="secondary">{pendingImport.screens.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objects:</span>
                  <Badge variant="secondary">{getTotalObjects()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scenes:</span>
                  <Badge variant="secondary">{getTotalScenes()}</Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCancelImport}
              data-testid="button-import-cancel"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmImport}
              disabled={importActivity.isPending}
              data-testid="button-import-confirm"
            >
              {importActivity.isPending ? "Importing..." : "Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
