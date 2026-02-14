import * as React from "react";
import { ChevronLeft, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

interface ResizableDrawerProps {
  side: "left" | "right";
  width: number;
  minWidth: number;
  maxWidth: number;
  collapsedWidth: number;
  isCollapsed: boolean;
  onWidthChange: (width: number) => void;
  onToggleCollapse: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function ResizableDrawer({
  side,
  width,
  minWidth,
  maxWidth,
  collapsedWidth,
  isCollapsed,
  onWidthChange,
  onToggleCollapse,
  children,
  className,
  title,
}: ResizableDrawerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);
  const startXRef = React.useRef(0);
  const startWidthRef = React.useRef(0);

  const currentWidth = isCollapsed ? collapsedWidth : width;

  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return;
    
    e.preventDefault();
    setIsResizing(true);
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  }, [isCollapsed, width]);

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const delta = side === "left" 
      ? e.clientX - startXRef.current
      : startXRef.current - e.clientX;
    
    const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
    onWidthChange(newWidth);
  }, [isResizing, side, minWidth, maxWidth, onWidthChange]);

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
    setTimeout(() => setIsDragging(false), 100);
  }, []);

  const handleDoubleClick = React.useCallback(() => {
    if (isCollapsed) {
      onToggleCollapse();
    } else {
      const defaultWidth = (minWidth + maxWidth) / 2;
      onWidthChange(defaultWidth);
    }
  }, [isCollapsed, minWidth, maxWidth, onWidthChange, onToggleCollapse]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const CollapseIcon = side === "left" 
    ? (isCollapsed ? ChevronRight : ChevronLeft)
    : (isCollapsed ? ChevronLeft : ChevronRight);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex shrink-0 transition-[width] duration-200 ease-out",
        isResizing && "transition-none",
        side === "left" ? "border-r border-border" : "border-l border-border",
        className
      )}
      style={{ width: currentWidth }}
      data-testid={`drawer-${side}`}
    >
      <div className={cn(
        "flex-1 overflow-hidden",
        isCollapsed && "opacity-0 pointer-events-none"
      )}>
        {children}
      </div>

      {isCollapsed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 py-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onToggleCollapse}
                data-testid={`drawer-expand-${side}`}
              >
                <CollapseIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={side === "left" ? "right" : "left"}>
              Expand {title || "panel"}
            </TooltipContent>
          </Tooltip>
          
          {title && (
            <span 
              className="text-xs text-muted-foreground writing-mode-vertical transform rotate-180"
              style={{ writingMode: "vertical-rl" }}
            >
              {title}
            </span>
          )}
        </div>
      )}

      <div
        className={cn(
          "absolute top-0 bottom-0 w-1 cursor-col-resize group z-10",
          "hover:bg-primary/20 active:bg-primary/40",
          isResizing && "bg-primary/40",
          side === "left" ? "right-0" : "left-0"
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        data-testid={`drawer-handle-${side}`}
      >
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity",
          "flex items-center justify-center w-4 h-8 bg-muted rounded",
          side === "left" ? "-right-1.5" : "-left-1.5"
        )}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 h-6 w-6 z-20",
              side === "left" ? "right-2" : "left-2",
              isCollapsed && "hidden"
            )}
            onClick={onToggleCollapse}
            data-testid={`drawer-collapse-${side}`}
          >
            <CollapseIcon className="h-3 w-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side={side === "left" ? "right" : "left"}>
          {isCollapsed ? "Expand" : "Collapse"} {title || "panel"}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
