import React, { useCallback, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Undo2, 
  Redo2, 
  History, 
  Move, 
  Plus, 
  Trash2, 
  RotateCw, 
  Scale, 
  Eye, 
  Layers,
  AlignLeft,
  MousePointer2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useOptionalHistoryContext } from "@/contexts/HistoryContext";
import type { HistoryEntry, HistoryActionType } from "@/hooks/use-history";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const actionIcons: Record<HistoryActionType, React.ElementType> = {
  create: Plus,
  delete: Trash2,
  move: Move,
  resize: Scale,
  rotate: RotateCw,
  scale: Scale,
  opacity: Eye,
  visibility: Eye,
  property: MousePointer2,
  "z-order": Layers,
  align: AlignLeft,
  distribute: AlignLeft,
  batch: History,
};

interface HistoryPanelProps {
  onUndo?: () => void;
  onRedo?: () => void;
}

export function HistoryPanel({ onUndo, onRedo }: HistoryPanelProps) {
  const historyContext = useOptionalHistoryContext();
  const [isOpen, setIsOpen] = useState(true);
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate({});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUndo = useCallback(() => {
    if (onUndo) {
      onUndo();
    } else if (historyContext) {
      historyContext.undo();
    }
  }, [onUndo, historyContext]);

  const handleRedo = useCallback(() => {
    if (onRedo) {
      onRedo();
    } else if (historyContext) {
      historyContext.redo();
    }
  }, [onRedo, historyContext]);

  const handleJumpTo = useCallback((entryId: string) => {
    if (!historyContext) return;
    historyContext.jumpTo(entryId);
  }, [historyContext]);

  if (!historyContext) {
    return (
      <div className="p-3 text-muted-foreground text-sm text-center">
        History not available
      </div>
    );
  }

  const { 
    entries, 
    currentIndex, 
    canUndo, 
    canRedo, 
    getRelativeTime 
  } = historyContext;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-accent/50 transition-colors border-b border-border" data-testid="history-panel-trigger">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase text-muted-foreground">History</span>
          {entries.length > 0 && (
            <span className="text-xs text-muted-foreground">({entries.length})</span>
          )}
        </div>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </CollapsibleTrigger>
      
      <CollapsibleContent>
        <div className="p-2 space-y-2">
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex-1 h-8"
                  data-testid="button-undo"
                >
                  <Undo2 className="w-4 h-4 mr-1" />
                  Undo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (⌘Z)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="flex-1 h-8"
                  data-testid="button-redo"
                >
                  <Redo2 className="w-4 h-4 mr-1" />
                  Redo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
            </Tooltip>
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No history yet</p>
              <p className="text-[10px] mt-1">Actions will appear here</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-0.5">
                {entries.map((entry, index) => (
                  <HistoryEntryItem
                    key={entry.id}
                    entry={entry}
                    isCurrent={index === currentIndex}
                    isPast={index <= currentIndex}
                    getRelativeTime={getRelativeTime}
                    onClick={() => handleJumpTo(entry.id)}
                  />
                )).reverse()}
              </div>
            </ScrollArea>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface HistoryEntryItemProps {
  entry: HistoryEntry;
  isCurrent: boolean;
  isPast: boolean;
  getRelativeTime: (timestamp: number) => string;
  onClick: () => void;
}

function HistoryEntryItem({ 
  entry, 
  isCurrent, 
  isPast,
  getRelativeTime, 
  onClick 
}: HistoryEntryItemProps) {
  const Icon = actionIcons[entry.actionType] || History;
  const objectsLabel = entry.affectedObjectNames.length > 1
    ? `${entry.affectedObjectNames.length} objects`
    : entry.affectedObjectNames[0] || "Unknown";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
        "hover:bg-accent/80",
        isCurrent && "bg-primary/15 border border-primary/30",
        !isPast && "opacity-50"
      )}
      data-testid={`history-entry-${entry.id}`}
    >
      <div className={cn(
        "flex-shrink-0 w-6 h-6 rounded flex items-center justify-center",
        isCurrent ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
      )}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <span className={cn(
            "text-xs font-medium truncate",
            !isPast && "text-muted-foreground"
          )}>
            {entry.actionName}
          </span>
          <span className="text-[10px] text-muted-foreground flex-shrink-0">
            {getRelativeTime(entry.timestamp)}
          </span>
        </div>
        <div className="text-[10px] text-muted-foreground truncate">
          {objectsLabel}
        </div>
      </div>
      
      {isCurrent && (
        <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      )}
    </button>
  );
}

export function MiniHistoryControls({ onUndo, onRedo }: HistoryPanelProps) {
  const historyContext = useOptionalHistoryContext();

  const handleUndo = useCallback(() => {
    if (onUndo) {
      onUndo();
    } else if (historyContext) {
      historyContext.undo();
    }
  }, [onUndo, historyContext]);

  const handleRedo = useCallback(() => {
    if (onRedo) {
      onRedo();
    } else if (historyContext) {
      historyContext.redo();
    }
  }, [onRedo, historyContext]);

  const canUndo = historyContext?.canUndo ?? false;
  const canRedo = historyContext?.canRedo ?? false;

  return (
    <div className="flex items-center gap-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            className="h-7 w-7"
            data-testid="button-mini-undo"
          >
            <Undo2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Undo (⌘Z)</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            className="h-7 w-7"
            data-testid="button-mini-redo"
          >
            <Redo2 className="w-4 h-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Redo (⌘⇧Z)</TooltipContent>
      </Tooltip>
    </div>
  );
}
