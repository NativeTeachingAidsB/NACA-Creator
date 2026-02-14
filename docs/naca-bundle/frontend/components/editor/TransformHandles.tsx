import React, { useCallback, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RotateCw } from "lucide-react";

type HandleType = 
  | "nw" | "n" | "ne" 
  | "w" | "e" 
  | "sw" | "s" | "se" 
  | "rotate";

interface TransformPreview {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

interface TransformHandlesProps {
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  zoom: number;
  isIsolated?: boolean;
  isFigmaLayer?: boolean;
  isDirectSelect?: boolean;
  touchPadding?: number;
  onTransformStart?: () => void;
  onTransformEnd?: () => void;
  onTransformPreview?: (preview: TransformPreview) => void;
  onScale: (scaleX: number, scaleY: number, newWidth?: number, newHeight?: number, deltaX?: number, deltaY?: number) => void;
  onRotate: (rotation: number) => void;
  onMove?: (deltaX: number, deltaY: number) => void;
}

const FIGMA_BLUE = "#0D99FF";
const BASE_HANDLE_SIZE = 10;
const TOUCH_HANDLE_SIZE = 20;
const BASE_HIT_AREA = 24;
const TOUCH_HIT_AREA = 44;
const BASE_MIN_SIZE = 10;

const degToRad = (deg: number) => (deg * Math.PI) / 180;
const radToDeg = (rad: number) => (rad * 180) / Math.PI;

const ROTATE_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9'/%3E%3Cpolyline points='21 3 21 9 15 9'/%3E%3C/svg%3E") 12 12, crosshair`;
const ROTATE_CURSOR_ACTIVE = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%230D99FF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 12a9 9 0 1 1-9-9'/%3E%3Cpolyline points='21 3 21 9 15 9'/%3E%3C/svg%3E") 12 12, crosshair`;

const HANDLE_ANGLES: Record<HandleType, number> = {
  "e": 0,
  "se": 45,
  "s": 90,
  "sw": 135,
  "w": 180,
  "nw": 225,
  "n": 270,
  "ne": 315,
  "rotate": 0,
};

const getCursorForAngle = (angle: number): string => {
  const normalized = ((angle % 360) + 360) % 360;
  
  if (normalized >= 337.5 || normalized < 22.5) return "ew-resize";
  if (normalized >= 22.5 && normalized < 67.5) return "nwse-resize";
  if (normalized >= 67.5 && normalized < 112.5) return "ns-resize";
  if (normalized >= 112.5 && normalized < 157.5) return "nesw-resize";
  if (normalized >= 157.5 && normalized < 202.5) return "ew-resize";
  if (normalized >= 202.5 && normalized < 247.5) return "nwse-resize";
  if (normalized >= 247.5 && normalized < 292.5) return "ns-resize";
  if (normalized >= 292.5 && normalized < 337.5) return "nesw-resize";
  
  return "default";
};

export function TransformHandles({
  width,
  height,
  x,
  y,
  rotation,
  scaleX,
  scaleY,
  zoom,
  isIsolated = false,
  isFigmaLayer = false,
  isDirectSelect = false,
  touchPadding = 0,
  onTransformStart,
  onTransformEnd,
  onTransformPreview,
  onScale,
  onRotate,
  onMove,
}: TransformHandlesProps) {
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const [hoveredHandle, setHoveredHandle] = useState<HandleType | null>(null);
  const [previewRotation, setPreviewRotation] = useState<number | null>(null);
  const [previewSize, setPreviewSize] = useState<{ width: number; height: number } | null>(null);
  
  const transformRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
    startRotation: number;
    startScaleX: number;
    startScaleY: number;
    centerX: number;
    centerY: number;
    originalX: number;
    originalY: number;
    canvasBounds: DOMRect | null;
    rotationRad: number;
  } | null>(null);

  const rafIdRef = useRef<number | null>(null);
  const pendingTransformRef = useRef<TransformPreview | null>(null);
  const lastCommitRef = useRef<TransformPreview | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const captureElementRef = useRef<HTMLElement | null>(null);

  const isTouchDevice = touchPadding > 0;
  
  const zoomScale = zoom / 100;
  const handleSize = Math.max(6, Math.min(14, (isTouchDevice ? TOUCH_HANDLE_SIZE : BASE_HANDLE_SIZE) / Math.sqrt(zoomScale)));
  const hitAreaSize = isTouchDevice ? TOUCH_HIT_AREA : BASE_HIT_AREA;
  const rotateHandleDistance = isTouchDevice ? 32 : 28;
  const minSize = Math.max(4, BASE_MIN_SIZE / zoomScale);

  const getHandlePosition = (handle: HandleType): { left: number; top: number } => {
    const hw = width / 2;
    const hh = height / 2;
    
    switch (handle) {
      case "nw": return { left: touchPadding - handleSize / 2, top: touchPadding - handleSize / 2 };
      case "n": return { left: touchPadding + hw - handleSize / 2, top: touchPadding - handleSize / 2 };
      case "ne": return { left: touchPadding + width - handleSize / 2, top: touchPadding - handleSize / 2 };
      case "w": return { left: touchPadding - handleSize / 2, top: touchPadding + hh - handleSize / 2 };
      case "e": return { left: touchPadding + width - handleSize / 2, top: touchPadding + hh - handleSize / 2 };
      case "sw": return { left: touchPadding - handleSize / 2, top: touchPadding + height - handleSize / 2 };
      case "s": return { left: touchPadding + hw - handleSize / 2, top: touchPadding + height - handleSize / 2 };
      case "se": return { left: touchPadding + width - handleSize / 2, top: touchPadding + height - handleSize / 2 };
      case "rotate": return { left: touchPadding + hw - handleSize / 2, top: touchPadding - rotateHandleDistance - handleSize / 2 };
      default: return { left: 0, top: 0 };
    }
  };

  const getCursor = useCallback((handle: HandleType): string => {
    if (handle === "rotate") {
      return activeHandle === "rotate" ? ROTATE_CURSOR_ACTIVE : ROTATE_CURSOR;
    }
    
    const baseAngle = HANDLE_ANGLES[handle] || 0;
    const adjustedAngle = baseAngle + rotation;
    return getCursorForAngle(adjustedAngle);
  }, [rotation, activeHandle]);

  const cleanupRef = useRef<(() => void) | null>(null);
  
  const cleanupTransform = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setActiveHandle(null);
    setPreviewRotation(null);
    setPreviewSize(null);
    transformRef.current = null;
    pendingTransformRef.current = null;
    lastCommitRef.current = null;
    pointerIdRef.current = null;
    onTransformEnd?.();
  }, [onTransformEnd]);

  const transformToLocal = useCallback((dx: number, dy: number, rotRad: number): { localDx: number; localDy: number } => {
    const cos = Math.cos(-rotRad);
    const sin = Math.sin(-rotRad);
    return {
      localDx: dx * cos - dy * sin,
      localDy: dx * sin + dy * cos,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, handle: HandleType) => {
    e.stopPropagation();
    e.preventDefault();
    
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    pointerIdRef.current = e.pointerId;
    captureElementRef.current = target;
    
    setActiveHandle(handle);
    onTransformStart?.();
    
    const canvas = document.querySelector('[data-canvas-container]');
    const canvasBounds = canvas?.getBoundingClientRect() || null;
    
    const rotRad = degToRad(rotation);
    
    const startTransformData = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: width,
      startHeight: height,
      startRotation: rotation,
      startScaleX: scaleX,
      startScaleY: scaleY,
      centerX: x + width / 2,
      centerY: y + height / 2,
      originalX: x,
      originalY: y,
      canvasBounds,
      rotationRad: rotRad,
    };
    
    transformRef.current = startTransformData;
    pendingTransformRef.current = null;
    lastCommitRef.current = null;
    
    const scheduleUpdate = () => {
      if (rafIdRef.current !== null) return;
      
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        const pending = pendingTransformRef.current;
        if (!pending) return;
        
        if (pending.rotation !== undefined) {
          setPreviewRotation(pending.rotation);
        }
        if (pending.width !== undefined && pending.height !== undefined) {
          setPreviewSize({ width: pending.width, height: pending.height });
        }
        
        if (onTransformPreview) {
          onTransformPreview(pending);
        }
      });
    };
    
    const handleMove = (ev: PointerEvent) => {
      if (pointerIdRef.current !== ev.pointerId) return;
      
      const data = transformRef.current;
      if (!data) return;
      
      const scale = zoom / 100;
      const rawDeltaX = (ev.clientX - data.startX) / scale;
      const rawDeltaY = (ev.clientY - data.startY) / scale;
      
      if (handle === "rotate") {
        const centerScreenX = data.canvasBounds 
          ? data.canvasBounds.left + (data.centerX * scale)
          : data.startX;
        const centerScreenY = data.canvasBounds 
          ? data.canvasBounds.top + (data.centerY * scale)
          : data.startY;
        
        const startAngle = Math.atan2(
          data.startY - centerScreenY,
          data.startX - centerScreenX
        );
        const currentAngle = Math.atan2(
          ev.clientY - centerScreenY,
          ev.clientX - centerScreenX
        );
        
        let angleDiff = radToDeg(currentAngle - startAngle);
        let newRotation = data.startRotation + angleDiff;
        
        if (ev.shiftKey) {
          newRotation = Math.round(newRotation / 15) * 15;
        }
        
        while (newRotation < 0) newRotation += 360;
        while (newRotation >= 360) newRotation -= 360;
        
        pendingTransformRef.current = { rotation: newRotation };
        scheduleUpdate();
      } else {
        const { localDx, localDy } = transformToLocal(rawDeltaX, rawDeltaY, data.rotationRad);
        
        let newWidth = data.startWidth;
        let newHeight = data.startHeight;
        let offsetX = 0;
        let offsetY = 0;
        
        const maintainAspect = ev.shiftKey;
        const centerPivot = ev.altKey;
        
        switch (handle) {
          case "se":
            newWidth = Math.max(minSize, data.startWidth + localDx);
            newHeight = Math.max(minSize, data.startHeight + localDy);
            break;
          case "sw":
            newWidth = Math.max(minSize, data.startWidth - localDx);
            newHeight = Math.max(minSize, data.startHeight + localDy);
            offsetX = data.startWidth - newWidth;
            break;
          case "ne":
            newWidth = Math.max(minSize, data.startWidth + localDx);
            newHeight = Math.max(minSize, data.startHeight - localDy);
            offsetY = data.startHeight - newHeight;
            break;
          case "nw":
            newWidth = Math.max(minSize, data.startWidth - localDx);
            newHeight = Math.max(minSize, data.startHeight - localDy);
            offsetX = data.startWidth - newWidth;
            offsetY = data.startHeight - newHeight;
            break;
          case "e":
            newWidth = Math.max(minSize, data.startWidth + localDx);
            break;
          case "w":
            newWidth = Math.max(minSize, data.startWidth - localDx);
            offsetX = data.startWidth - newWidth;
            break;
          case "s":
            newHeight = Math.max(minSize, data.startHeight + localDy);
            break;
          case "n":
            newHeight = Math.max(minSize, data.startHeight - localDy);
            offsetY = data.startHeight - newHeight;
            break;
        }
        
        if (maintainAspect) {
          const aspectRatio = data.startWidth / data.startHeight;
          const isCorner = ["nw", "ne", "sw", "se"].includes(handle);
          
          if (isCorner) {
            const scaleRatioW = newWidth / data.startWidth;
            const scaleRatioH = newHeight / data.startHeight;
            const scaleRatio = Math.max(scaleRatioW, scaleRatioH);
            
            newWidth = Math.max(minSize, data.startWidth * scaleRatio);
            newHeight = Math.max(minSize, data.startHeight * scaleRatio);
            
            if (handle === "nw" || handle === "sw") {
              offsetX = data.startWidth - newWidth;
            }
            if (handle === "nw" || handle === "ne") {
              offsetY = data.startHeight - newHeight;
            }
          } else if (handle === "e" || handle === "w") {
            newHeight = newWidth / aspectRatio;
            if (handle === "w") offsetX = data.startWidth - newWidth;
          } else if (handle === "n" || handle === "s") {
            newWidth = newHeight * aspectRatio;
            if (handle === "n") offsetY = data.startHeight - newHeight;
          }
        }
        
        if (centerPivot) {
          const widthDelta = newWidth - data.startWidth;
          const heightDelta = newHeight - data.startHeight;
          
          offsetX = -widthDelta / 2;
          offsetY = -heightDelta / 2;
        }
        
        const cos = Math.cos(data.rotationRad);
        const sin = Math.sin(data.rotationRad);
        const worldOffsetX = offsetX * cos - offsetY * sin;
        const worldOffsetY = offsetX * sin + offsetY * cos;
        
        const newScaleX = (newWidth / data.startWidth) * data.startScaleX;
        const newScaleY = (newHeight / data.startHeight) * data.startScaleY;
        
        pendingTransformRef.current = {
          width: newWidth,
          height: newHeight,
          x: data.originalX + worldOffsetX,
          y: data.originalY + worldOffsetY,
          scaleX: newScaleX,
          scaleY: newScaleY,
        };
        scheduleUpdate();
      }
    };
    
    const handleUp = (ev: PointerEvent) => {
      if (pointerIdRef.current !== ev.pointerId) return;
      
      if (captureElementRef.current?.hasPointerCapture?.(ev.pointerId)) {
        captureElementRef.current.releasePointerCapture(ev.pointerId);
      }
      captureElementRef.current = null;
      
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      
      const pending = pendingTransformRef.current;
      const data = transformRef.current;
      
      if (pending && data) {
        if (pending.rotation !== undefined) {
          onRotate(pending.rotation);
        } else if (pending.scaleX !== undefined && pending.scaleY !== undefined) {
          const offsetX = pending.x !== undefined ? pending.x - data.originalX : 0;
          const offsetY = pending.y !== undefined ? pending.y - data.originalY : 0;
          onScale(pending.scaleX, pending.scaleY, pending.width, pending.height, offsetX, offsetY);
        }
      }
      
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
      cleanupRef.current = null;
      setActiveHandle(null);
      setPreviewRotation(null);
      setPreviewSize(null);
      transformRef.current = null;
      pendingTransformRef.current = null;
      lastCommitRef.current = null;
      pointerIdRef.current = null;
      onTransformEnd?.();
    };
    
    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    
    cleanupRef.current = () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [width, height, rotation, scaleX, scaleY, x, y, zoom, onTransformStart, onTransformEnd, onRotate, onScale, onTransformPreview, transformToLocal]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);


  const handles: HandleType[] = ["nw", "n", "ne", "w", "e", "sw", "s", "se"];

  const getHandleBackgroundColor = () => {
    if (isIsolated) return "#22c55e";
    if (isDirectSelect) return "#06b6d4";
    return FIGMA_BLUE;
  };

  const getHandleBorderColor = () => {
    if (isIsolated) return "#16a34a";
    if (isDirectSelect) return "#0891b2";
    return "#0284c7";
  };

  const bgColor = getHandleBackgroundColor();
  const borderColor = getHandleBorderColor();

  const formatAngle = (angle: number): string => {
    const normalized = ((angle % 360) + 360) % 360;
    return `${normalized.toFixed(1)}°`;
  };

  const formatSize = (w: number, h: number): string => {
    return `${Math.round(w)} × ${Math.round(h)}`;
  };

  return (
    <div 
      data-transform-container
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Rotation angle indicator */}
      {activeHandle === "rotate" && previewRotation !== null && (
        <div
          className="absolute px-2 py-1 rounded text-xs font-mono bg-black/80 text-white whitespace-nowrap"
          style={{
            left: touchPadding + width / 2,
            top: touchPadding - rotateHandleDistance - handleSize - 24,
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
          data-testid="rotation-indicator"
        >
          {formatAngle(previewRotation)}
        </div>
      )}

      {/* Size indicator */}
      {activeHandle && activeHandle !== "rotate" && previewSize && (
        <div
          className="absolute px-2 py-1 rounded text-xs font-mono bg-black/80 text-white whitespace-nowrap"
          style={{
            left: touchPadding + width / 2,
            top: touchPadding + height + 12,
            transform: 'translateX(-50%)',
            zIndex: 20,
          }}
          data-testid="size-indicator"
        >
          {formatSize(previewSize.width, previewSize.height)}
        </div>
      )}

      {/* Rotation handle connector line */}
      <div 
        className="absolute w-px"
        style={{
          left: touchPadding + width / 2,
          top: touchPadding - rotateHandleDistance,
          height: rotateHandleDistance,
          backgroundColor: bgColor,
        }}
      />
      
      {/* Center pivot indicator (shown during rotation) */}
      {activeHandle === "rotate" && (
        <div
          className="absolute rounded-full"
          style={{
            left: touchPadding + width / 2 - 4,
            top: touchPadding + height / 2 - 4,
            width: 8,
            height: 8,
            backgroundColor: bgColor,
            border: `2px solid ${borderColor}`,
          }}
          data-testid="pivot-indicator"
        />
      )}
      
      {/* Rotation handle with touch-friendly hit area */}
      <div
        className="absolute pointer-events-auto flex items-center justify-center"
        style={{
          left: getHandlePosition("rotate").left - (hitAreaSize - handleSize - 4) / 2,
          top: getHandlePosition("rotate").top - (hitAreaSize - handleSize - 4) / 2,
          width: hitAreaSize,
          height: hitAreaSize,
          cursor: getCursor("rotate"),
          touchAction: 'none',
        }}
        onPointerDown={(e) => handlePointerDown(e, "rotate")}
        onPointerEnter={() => setHoveredHandle("rotate")}
        onPointerLeave={() => setHoveredHandle(null)}
        onClick={(e) => e.stopPropagation()}
        data-testid="handle-rotate"
      >
        <div
          className={cn(
            "rounded-full flex items-center justify-center transition-all duration-100",
            (hoveredHandle === "rotate" || activeHandle === "rotate") && "scale-110"
          )}
          style={{
            width: handleSize + 4,
            height: handleSize + 4,
            backgroundColor: hoveredHandle === "rotate" || activeHandle === "rotate" ? "#fff" : bgColor,
            borderWidth: 2,
            borderStyle: "solid",
            borderColor: borderColor,
            boxShadow: hoveredHandle === "rotate" || activeHandle === "rotate" 
              ? `0 0 0 2px ${bgColor}` 
              : 'none',
          }}
        >
          <RotateCw 
            className={cn(
              isTouchDevice ? "w-4 h-4" : "w-2.5 h-2.5"
            )} 
            style={{ 
              color: hoveredHandle === "rotate" || activeHandle === "rotate" ? bgColor : "#fff" 
            }}
          />
        </div>
      </div>
      
      {/* Corner and edge handles with touch-friendly hit areas */}
      {handles.map((handle) => {
        const pos = getHandlePosition(handle);
        const isCorner = ["nw", "ne", "sw", "se"].includes(handle);
        const hitOffset = (hitAreaSize - handleSize) / 2;
        const isActive = activeHandle === handle;
        const isHovered = hoveredHandle === handle;
        
        return (
          <div
            key={handle}
            className="absolute pointer-events-auto flex items-center justify-center"
            style={{
              left: pos.left - hitOffset,
              top: pos.top - hitOffset,
              width: hitAreaSize,
              height: hitAreaSize,
              cursor: getCursor(handle),
              touchAction: 'none',
            }}
            onPointerDown={(e) => handlePointerDown(e, handle)}
            onPointerEnter={() => setHoveredHandle(handle)}
            onPointerLeave={() => setHoveredHandle(null)}
            onClick={(e) => e.stopPropagation()}
            data-testid={`handle-${handle}`}
          >
            <div
              className={cn(
                "transition-all duration-100",
                isCorner ? "rounded-sm" : "rounded-full"
              )}
              style={{
                width: handleSize,
                height: handleSize,
                backgroundColor: isHovered || isActive ? "#fff" : bgColor,
                borderWidth: 2,
                borderStyle: "solid",
                borderColor: borderColor,
                transform: isHovered || isActive ? 'scale(1.2)' : 'scale(1)',
                boxShadow: isHovered || isActive 
                  ? `0 0 0 2px ${bgColor}` 
                  : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
