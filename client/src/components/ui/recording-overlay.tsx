import * as React from "react";
import { Button } from "@/components/ui/button";
import { Square, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RecordingOverlayProps {
  isRecording: boolean;
  duration: number;
  formatDuration: (seconds: number) => string;
  onStop: () => void;
  onCancel: () => void;
  featureKey: string | null;
}

export function RecordingOverlay({
  isRecording,
  duration,
  formatDuration,
  onStop,
  onCancel,
  featureKey,
}: RecordingOverlayProps) {
  if (!isRecording) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-[9999] flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3"
      data-testid="recording-overlay"
    >
      <div className="flex items-center gap-2">
        <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
        <span className="text-sm font-medium text-red-500">REC</span>
      </div>
      
      <div className="text-sm font-mono tabular-nums text-foreground">
        {formatDuration(duration)}
      </div>
      
      {featureKey && (
        <div className="text-xs text-muted-foreground max-w-32 truncate border-l pl-3">
          {featureKey}
        </div>
      )}
      
      <div className="flex items-center gap-2 border-l pl-3">
        <Button
          variant="destructive"
          size="sm"
          className="h-8 gap-1.5"
          onClick={onStop}
          data-testid="button-stop-recording"
        >
          <Square className="w-3 h-3 fill-current" />
          Save
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="h-8"
          onClick={onCancel}
          data-testid="button-cancel-recording"
        >
          Cancel
        </Button>
      </div>
      
      <div className="text-[10px] text-muted-foreground border-l pl-3">
        <div>Enter = Save</div>
        <div>Esc = Cancel</div>
      </div>
    </div>
  );
}
