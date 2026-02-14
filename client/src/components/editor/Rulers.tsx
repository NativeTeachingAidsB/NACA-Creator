import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface Guide {
  id: string;
  orientation: "horizontal" | "vertical";
  position: number;
}

interface RulersProps {
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
  panX: number;
  panY: number;
  showRulers: boolean;
  showGuides: boolean;
  guides: Guide[];
  selectedGuideId: string | null;
  onCreateGuide: (orientation: "horizontal" | "vertical", position: number) => void;
  onUpdateGuide: (id: string, position: number) => void;
  onSelectGuide: (id: string | null) => void;
  onDeleteGuide: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const RULER_SIZE = 20;
const CORNER_SIZE = RULER_SIZE;

export function Rulers({
  canvasWidth,
  canvasHeight,
  zoom,
  panX,
  panY,
  showRulers,
  showGuides,
  guides,
  selectedGuideId,
  onCreateGuide,
  onUpdateGuide,
  onSelectGuide,
  onDeleteGuide,
  containerRef,
}: RulersProps) {
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDraggingGuide, setIsDraggingGuide] = useState(false);
  const [dragOrientation, setDragOrientation] = useState<"horizontal" | "vertical" | null>(null);
  const [dragPosition, setDragPosition] = useState<number | null>(null);
  const [draggingGuideId, setDraggingGuideId] = useState<string | null>(null);

  const scale = zoom / 100;

  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };

    const rect = container.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const canvasX = (clientX - rect.left - centerX - panX) / scale + canvasWidth / 2;
    const canvasY = (clientY - rect.top - centerY - panY) / scale + canvasHeight / 2;

    return { x: canvasX, y: canvasY };
  }, [panX, panY, scale, canvasWidth, canvasHeight, containerRef]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const pos = screenToCanvas(e.clientX, e.clientY);
      setCursorPosition(pos);

      if (isDraggingGuide && dragOrientation) {
        const newPosition = dragOrientation === "horizontal" ? pos.y : pos.x;
        setDragPosition(Math.round(newPosition));
      }
    };

    const handleMouseUp = () => {
      if (isDraggingGuide && dragOrientation && dragPosition !== null) {
        const position = Math.round(dragPosition);
        if (position >= 0 && (
          (dragOrientation === "horizontal" && position <= canvasHeight) ||
          (dragOrientation === "vertical" && position <= canvasWidth)
        )) {
          if (draggingGuideId) {
            onUpdateGuide(draggingGuideId, position);
          } else {
            onCreateGuide(dragOrientation, position);
          }
        }
      }
      setIsDraggingGuide(false);
      setDragOrientation(null);
      setDragPosition(null);
      setDraggingGuideId(null);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingGuide, dragOrientation, dragPosition, draggingGuideId, screenToCanvas, canvasWidth, canvasHeight, onCreateGuide, onUpdateGuide]);

  const handleRulerMouseDown = useCallback((
    e: React.MouseEvent,
    orientation: "horizontal" | "vertical"
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const pos = screenToCanvas(e.clientX, e.clientY);
    setIsDraggingGuide(true);
    setDragOrientation(orientation);
    setDragPosition(orientation === "horizontal" ? pos.y : pos.x);
    setDraggingGuideId(null);
  }, [screenToCanvas]);

  const handleGuideMouseDown = useCallback((
    e: React.MouseEvent,
    guide: Guide
  ) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectGuide(guide.id);
    setIsDraggingGuide(true);
    setDragOrientation(guide.orientation);
    setDragPosition(guide.position);
    setDraggingGuideId(guide.id);
  }, [onSelectGuide]);

  const getTickInterval = useCallback(() => {
    const zoomLevel = zoom;
    if (zoomLevel >= 200) return { small: 5, medium: 25, large: 50 };
    if (zoomLevel >= 100) return { small: 10, medium: 50, large: 100 };
    if (zoomLevel >= 50) return { small: 20, medium: 100, large: 200 };
    return { small: 50, medium: 250, large: 500 };
  }, [zoom]);

  const renderHorizontalRuler = () => {
    const intervals = getTickInterval();
    const ticks: React.ReactNode[] = [];
    const visibleStart = -canvasWidth / 2;
    const visibleEnd = canvasWidth * 1.5;

    for (let pos = 0; pos <= canvasWidth; pos += intervals.small) {
      const isLarge = pos % intervals.large === 0;
      const isMedium = pos % intervals.medium === 0;
      const height = isLarge ? 12 : isMedium ? 8 : 4;
      const screenX = pos * scale;

      ticks.push(
        <div
          key={`htick-${pos}`}
          className="absolute bottom-0 bg-muted-foreground/50"
          style={{
            left: screenX,
            width: 1,
            height,
          }}
        />
      );

      if (isLarge) {
        ticks.push(
          <span
            key={`hlabel-${pos}`}
            className="absolute text-[9px] text-muted-foreground select-none"
            style={{
              left: screenX + 2,
              top: 2,
            }}
          >
            {pos}
          </span>
        );
      }
    }

    return ticks;
  };

  const renderVerticalRuler = () => {
    const intervals = getTickInterval();
    const ticks: React.ReactNode[] = [];

    for (let pos = 0; pos <= canvasHeight; pos += intervals.small) {
      const isLarge = pos % intervals.large === 0;
      const isMedium = pos % intervals.medium === 0;
      const width = isLarge ? 12 : isMedium ? 8 : 4;
      const screenY = pos * scale;

      ticks.push(
        <div
          key={`vtick-${pos}`}
          className="absolute right-0 bg-muted-foreground/50"
          style={{
            top: screenY,
            height: 1,
            width,
          }}
        />
      );

      if (isLarge) {
        ticks.push(
          <span
            key={`vlabel-${pos}`}
            className="absolute text-[9px] text-muted-foreground select-none origin-top-left"
            style={{
              top: screenY + 2,
              left: 2,
              transform: "rotate(-90deg) translateX(-100%)",
              transformOrigin: "left top",
            }}
          >
            {pos}
          </span>
        );
      }
    }

    return ticks;
  };

  const getCursorIndicatorPositions = () => {
    if (!cursorPosition) return { x: null, y: null };
    const x = cursorPosition.x >= 0 && cursorPosition.x <= canvasWidth ? cursorPosition.x * scale : null;
    const y = cursorPosition.y >= 0 && cursorPosition.y <= canvasHeight ? cursorPosition.y * scale : null;
    return { x, y };
  };

  const cursorIndicators = getCursorIndicatorPositions();

  if (!showRulers) return null;

  return (
    <>
      {/* Corner piece */}
      <div
        className="absolute z-50 bg-background border-r border-b border-border flex items-center justify-center"
        style={{
          left: 0,
          top: 0,
          width: CORNER_SIZE,
          height: CORNER_SIZE,
        }}
      >
        <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
      </div>

      {/* Horizontal ruler */}
      <div
        className="absolute z-40 bg-background border-b border-border cursor-crosshair select-none overflow-hidden"
        style={{
          left: CORNER_SIZE,
          top: 0,
          right: 0,
          height: RULER_SIZE,
        }}
        onMouseDown={(e) => handleRulerMouseDown(e, "horizontal")}
        data-testid="horizontal-ruler"
      >
        <div
          className="relative h-full"
          style={{
            transform: `translateX(${panX + (containerRef.current?.clientWidth || 0) / 2 - CORNER_SIZE - canvasWidth * scale / 2}px)`,
            width: canvasWidth * scale,
          }}
        >
          {renderHorizontalRuler()}
          {cursorIndicators.x !== null && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none"
              style={{ left: cursorIndicators.x }}
            />
          )}
        </div>
      </div>

      {/* Vertical ruler */}
      <div
        className="absolute z-40 bg-background border-r border-border cursor-crosshair select-none overflow-hidden"
        style={{
          left: 0,
          top: CORNER_SIZE,
          width: RULER_SIZE,
          bottom: 0,
        }}
        onMouseDown={(e) => handleRulerMouseDown(e, "vertical")}
        data-testid="vertical-ruler"
      >
        <div
          className="relative w-full"
          style={{
            transform: `translateY(${panY + (containerRef.current?.clientHeight || 0) / 2 - CORNER_SIZE - canvasHeight * scale / 2}px)`,
            height: canvasHeight * scale,
          }}
        >
          {renderVerticalRuler()}
          {cursorIndicators.y !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-primary pointer-events-none"
              style={{ top: cursorIndicators.y }}
            />
          )}
        </div>
      </div>

      {/* Guide lines rendered on canvas */}
      {showGuides && guides.map((guide) => {
        const isSelected = selectedGuideId === guide.id;
        const isBeingDragged = draggingGuideId === guide.id;
        const position = isBeingDragged && dragPosition !== null ? dragPosition : guide.position;

        return (
          <div
            key={guide.id}
            data-testid={`guide-${guide.id}`}
            data-guide-id={guide.id}
            className={cn(
              "absolute pointer-events-auto z-30",
              isSelected ? "cursor-grab" : "cursor-pointer",
              isBeingDragged && "cursor-grabbing"
            )}
            style={{
              ...(guide.orientation === "horizontal"
                ? {
                    left: RULER_SIZE,
                    right: 0,
                    top: RULER_SIZE + (containerRef.current?.clientHeight || 0) / 2 - RULER_SIZE + panY - canvasHeight * scale / 2 + position * scale,
                    height: 1,
                  }
                : {
                    top: RULER_SIZE,
                    bottom: 0,
                    left: RULER_SIZE + (containerRef.current?.clientWidth || 0) / 2 - RULER_SIZE + panX - canvasWidth * scale / 2 + position * scale,
                    width: 1,
                  }),
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectGuide(guide.id);
            }}
            onMouseDown={(e) => handleGuideMouseDown(e, guide)}
          >
            <div
              className={cn(
                "absolute",
                guide.orientation === "horizontal" ? "inset-x-0 h-[3px] -top-[1px]" : "inset-y-0 w-[3px] -left-[1px]",
                isSelected ? "bg-cyan-500" : "bg-cyan-500/70",
                "border",
                guide.orientation === "horizontal"
                  ? "border-t border-b border-dashed border-cyan-600"
                  : "border-l border-r border-dashed border-cyan-600"
              )}
            />
          </div>
        );
      })}

      {/* Drag preview guide */}
      {isDraggingGuide && !draggingGuideId && dragOrientation && dragPosition !== null && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            ...(dragOrientation === "horizontal"
              ? {
                  left: RULER_SIZE,
                  right: 0,
                  top: RULER_SIZE + (containerRef.current?.clientHeight || 0) / 2 - RULER_SIZE + panY - canvasHeight * scale / 2 + dragPosition * scale,
                  height: 1,
                }
              : {
                  top: RULER_SIZE,
                  bottom: 0,
                  left: RULER_SIZE + (containerRef.current?.clientWidth || 0) / 2 - RULER_SIZE + panX - canvasWidth * scale / 2 + dragPosition * scale,
                  width: 1,
                }),
          }}
        >
          <div
            className={cn(
              "absolute bg-cyan-500",
              dragOrientation === "horizontal" ? "inset-x-0 h-0.5" : "inset-y-0 w-0.5"
            )}
          />
          <div
            className={cn(
              "absolute bg-background border border-cyan-500 px-1.5 py-0.5 text-[10px] text-cyan-600 font-medium rounded shadow-sm",
              dragOrientation === "horizontal" ? "left-2 -top-5" : "top-2 -left-8"
            )}
          >
            {Math.round(dragPosition)}px
          </div>
        </div>
      )}
    </>
  );
}

export { RULER_SIZE };
