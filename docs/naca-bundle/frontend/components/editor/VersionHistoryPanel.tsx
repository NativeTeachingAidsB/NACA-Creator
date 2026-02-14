import React, { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Save, 
  RotateCcw, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Clock,
  Archive,
  Plus,
} from "lucide-react";
import type { Checkpoint, VersionHistoryAPI } from "@/hooks/use-version-history";

interface VersionHistoryPanelProps {
  checkpoints: Checkpoint[];
  lastSavedTimestamp: number | null;
  onSaveCheckpoint: (name: string) => Checkpoint | null;
  onRestoreCheckpoint: (checkpointId: string) => boolean;
  onDeleteCheckpoint: (checkpointId: string) => void;
  getRelativeTime: (timestamp: number) => string;
  formatTimestamp: (timestamp: number) => string;
  checkpointCount: number;
  maxCheckpoints: number;
  disabled?: boolean;
}

export function VersionHistoryPanel({
  checkpoints,
  lastSavedTimestamp,
  onSaveCheckpoint,
  onRestoreCheckpoint,
  onDeleteCheckpoint,
  getRelativeTime,
  formatTimestamp,
  checkpointCount,
  maxCheckpoints,
  disabled = false,
}: VersionHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [checkpointName, setCheckpointName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [restoreConfirmId, setRestoreConfirmId] = useState<string | null>(null);

  const handleSaveCheckpoint = useCallback(() => {
    if (disabled) return;
    
    setIsSaving(true);
    const result = onSaveCheckpoint(checkpointName || `Checkpoint ${checkpointCount + 1}`);
    setIsSaving(false);
    
    if (result) {
      setCheckpointName("");
    }
  }, [disabled, checkpointName, checkpointCount, onSaveCheckpoint]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveCheckpoint();
    }
  }, [handleSaveCheckpoint]);

  const handleConfirmRestore = useCallback(() => {
    if (restoreConfirmId) {
      onRestoreCheckpoint(restoreConfirmId);
      setRestoreConfirmId(null);
    }
  }, [restoreConfirmId, onRestoreCheckpoint]);

  const handleConfirmDelete = useCallback(() => {
    if (deleteConfirmId) {
      onDeleteCheckpoint(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  }, [deleteConfirmId, onDeleteCheckpoint]);

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
        <CollapsibleTrigger 
          className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors border-b border-border" 
          data-testid="version-history-panel-trigger"
        >
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase text-muted-foreground">
              Version History
            </span>
            {checkpointCount > 0 && (
              <span className="text-xs text-muted-foreground">({checkpointCount})</span>
            )}
          </div>
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="p-3 space-y-3">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={checkpointName}
                  onChange={(e) => setCheckpointName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Checkpoint name..."
                  className="h-8 text-xs"
                  disabled={disabled || isSaving}
                  data-testid="input-checkpoint-name"
                />
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleSaveCheckpoint}
                      disabled={disabled || isSaving}
                      className="h-8 px-3"
                      data-testid="button-save-checkpoint"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Save current state as checkpoint</TooltipContent>
                </Tooltip>
              </div>
              
              {checkpointCount >= maxCheckpoints && (
                <p className="text-[10px] text-amber-500">
                  Limit reached ({maxCheckpoints}). Oldest will be removed.
                </p>
              )}
            </div>

            {checkpoints.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-xs">
                <Archive className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No checkpoints saved</p>
                <p className="text-[10px] mt-1">Save a checkpoint to preserve your work</p>
              </div>
            ) : (
              <ScrollArea className="h-[220px]">
                <div className="space-y-1">
                  {checkpoints.map((checkpoint) => (
                    <CheckpointItem
                      key={checkpoint.id}
                      checkpoint={checkpoint}
                      getRelativeTime={getRelativeTime}
                      formatTimestamp={formatTimestamp}
                      onRestore={() => setRestoreConfirmId(checkpoint.id)}
                      onDelete={() => setDeleteConfirmId(checkpoint.id)}
                      disabled={disabled}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!restoreConfirmId} onOpenChange={() => setRestoreConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore all objects to their saved state. Any unsaved changes will be lost.
              Do you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-restore">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRestore} data-testid="button-confirm-restore">
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Checkpoint</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this checkpoint? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

interface CheckpointItemProps {
  checkpoint: Checkpoint;
  getRelativeTime: (timestamp: number) => string;
  formatTimestamp: (timestamp: number) => string;
  onRestore: () => void;
  onDelete: () => void;
  disabled?: boolean;
}

function CheckpointItem({ 
  checkpoint, 
  getRelativeTime,
  formatTimestamp,
  onRestore, 
  onDelete,
  disabled = false,
}: CheckpointItemProps) {
  const objectCount = checkpoint.snapshot.length;
  
  return (
    <div
      className={cn(
        "group flex items-center gap-2 px-2 py-2 rounded-md",
        "hover:bg-accent/60 transition-colors",
        "border border-transparent hover:border-border/50"
      )}
      data-testid={`checkpoint-item-${checkpoint.id}`}
    >
      <div className="flex-shrink-0 w-7 h-7 rounded bg-muted flex items-center justify-center">
        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs font-medium truncate" data-testid={`text-checkpoint-name-${checkpoint.id}`}>
            {checkpoint.name}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {getRelativeTime(checkpoint.timestamp)}
          </span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-[10px] text-muted-foreground truncate cursor-help">
              {objectCount} object{objectCount !== 1 ? "s" : ""}
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            {formatTimestamp(checkpoint.timestamp)}
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRestore}
              disabled={disabled}
              data-testid={`button-restore-${checkpoint.id}`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-primary" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Restore this checkpoint</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onDelete}
              disabled={disabled}
              data-testid={`button-delete-${checkpoint.id}`}
            >
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete checkpoint</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

interface LastSavedIndicatorProps {
  lastSavedTimestamp: number | null;
  getRelativeTime: (timestamp: number) => string;
}

export function LastSavedIndicator({ lastSavedTimestamp, getRelativeTime }: LastSavedIndicatorProps) {
  const [, forceUpdate] = useState({});

  React.useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!lastSavedTimestamp) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="last-saved-indicator">
        <Clock className="w-3.5 h-3.5" />
        <span>Not saved</span>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help" 
          data-testid="last-saved-indicator"
        >
          <Clock className="w-3.5 h-3.5 text-green-500" />
          <span>Saved {getRelativeTime(lastSavedTimestamp)}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent>
        Last checkpoint: {new Date(lastSavedTimestamp).toLocaleString()}
      </TooltipContent>
    </Tooltip>
  );
}
