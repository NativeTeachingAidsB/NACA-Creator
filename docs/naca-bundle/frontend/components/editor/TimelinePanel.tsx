import { useState, useRef, useCallback, useEffect, useMemo, createRef } from "react";
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  ChevronUp, 
  ChevronDown, 
  GripHorizontal,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronRight,
  Diamond,
  Circle,
  Repeat,
  Copy,
  Clipboard,
  HelpCircle,
  Magnet,
  Maximize2,
  MoreHorizontal,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Volume2,
  VolumeX,
  Headphones,
  Palette,
  EyeClosed
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { useToast } from "@/hooks/use-toast";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { cn } from "@/lib/utils";
import type { GameObject, Animation, Keyframe } from "@shared/schema";
import { 
  useAnimations,
  useCreateAnimation,
  useUpdateAnimation,
  useDeleteAnimation,
  useKeyframes,
  useCreateKeyframe,
  useUpdateKeyframe,
  useDeleteKeyframe
} from "@/hooks/use-game-data";
import { useOptionalTimelineContext } from "@/contexts/TimelineContext";

interface TimelinePanelProps {
  objects: GameObject[];
  selectedObjectId: string | null;
  sceneId: string | null;
  onSelectObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<GameObject>) => void;
  height: number;
  minHeight: number;
  maxHeight: number;
  isCollapsed: boolean;
  onHeightChange: (height: number) => void;
  onToggleCollapse: () => void;
}

interface TimelineState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  zoom: number;
  fps: number;
}

const EASE_OPTIONS = [
  { value: "linear", label: "Linear", icon: "linear" },
  { value: "none", label: "Hold/Step", icon: "hold" },
  { value: "power1.in", label: "Ease In", icon: "easeIn" },
  { value: "power1.out", label: "Ease Out", icon: "easeOut" },
  { value: "power1.inOut", label: "Ease InOut", icon: "easeInOut" },
  { value: "power2.in", label: "Ease In (Strong)", icon: "easeIn" },
  { value: "power2.out", label: "Ease Out (Strong)", icon: "easeOut" },
  { value: "power2.inOut", label: "Ease InOut (Strong)", icon: "easeInOut" },
  { value: "elastic.out", label: "Elastic", icon: "easeOut" },
  { value: "bounce.out", label: "Bounce", icon: "easeOut" },
  { value: "back.out", label: "Back", icon: "easeOut" },
];

const LAYER_COLORS = [
  { value: "none", label: "None", color: "transparent" },
  { value: "red", label: "Red", color: "#ef4444" },
  { value: "orange", label: "Orange", color: "#f97316" },
  { value: "yellow", label: "Yellow", color: "#eab308" },
  { value: "green", label: "Green", color: "#22c55e" },
  { value: "cyan", label: "Cyan", color: "#06b6d4" },
  { value: "blue", label: "Blue", color: "#3b82f6" },
  { value: "purple", label: "Purple", color: "#a855f7" },
  { value: "pink", label: "Pink", color: "#ec4899" },
];

interface LayerTrackState {
  isSolo: boolean;
  isMuted: boolean;
  isShy: boolean;
  colorLabel: string;
}

function getEaseIcon(ease: string | null) {
  if (!ease || ease === "linear") return "linear";
  if (ease === "none") return "hold";
  if (ease.includes(".in") && ease.includes("Out")) return "easeInOut";
  if (ease.includes(".in")) return "easeIn";
  if (ease.includes(".out") || ease.includes("Out")) return "easeOut";
  return "linear";
}

function EaseIndicator({ ease, size = 6 }: { ease: string | null; size?: number }) {
  const type = getEaseIcon(ease);
  
  switch (type) {
    case "hold":
      return <Minus className={`w-${size/2} h-${size/2}`} style={{ width: size, height: size }} />;
    case "easeIn":
      return <ArrowUpRight className={`w-${size/2} h-${size/2}`} style={{ width: size, height: size }} />;
    case "easeOut":
      return <ArrowDownRight className={`w-${size/2} h-${size/2}`} style={{ width: size, height: size }} />;
    case "easeInOut":
      return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M2 10 Q 6 10, 6 6 Q 6 2, 10 2" />
        </svg>
      );
    default:
      return <ArrowRight className={`w-${size/2} h-${size/2}`} style={{ width: size, height: size }} />;
  }
}

const PROPERTY_OPTIONS = [
  { value: "x", label: "X Position" },
  { value: "y", label: "Y Position" },
  { value: "width", label: "Width" },
  { value: "height", label: "Height" },
  { value: "rotation", label: "Rotation" },
  { value: "scale", label: "Scale" },
  { value: "scaleX", label: "Scale X" },
  { value: "scaleY", label: "Scale Y" },
  { value: "opacity", label: "Opacity" },
  { value: "visible", label: "Visibility" },
];

function formatTime(seconds: number, fps: number = 30): string {
  const frames = Math.round(seconds * fps);
  const wholeSeconds = Math.floor(seconds);
  const remainingFrames = frames % fps;
  return `${wholeSeconds.toString().padStart(2, '0')}:${remainingFrames.toString().padStart(2, '0')}`;
}

function formatTimecode(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

interface MarqueeState {
  isActive: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

function LayerRow({
  object,
  animation,
  keyframes,
  allKeyframes,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onToggleLock,
  currentTime,
  duration,
  zoom,
  fps,
  onCreateKeyframe,
  onUpdateKeyframe,
  onDeleteKeyframe,
  onSelectKeyframe,
  onBatchUpdateKeyframes,
  onCopyKeyframes,
  onPasteKeyframes,
  onDuplicateKeyframes,
  onChangeKeyframeEase,
  selectedKeyframeIds,
  onMarqueeSelect,
  trackState,
  onToggleSolo,
  onToggleMute,
  onToggleShy,
  onSetColorLabel,
  hasSoloTracks,
}: {
  object: GameObject;
  animation: Animation | null;
  keyframes: Keyframe[];
  allKeyframes: Keyframe[];
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggleExpand: () => void;
  onToggleVisibility: () => void;
  onToggleLock: () => void;
  currentTime: number;
  duration: number;
  zoom: number;
  fps: number;
  onCreateKeyframe: (time: number, property: string) => void;
  onUpdateKeyframe: (id: string, updates: Partial<Keyframe>) => void;
  onDeleteKeyframe: (id: string) => void;
  onSelectKeyframe: (keyframeId: string, event?: React.MouseEvent) => void;
  onBatchUpdateKeyframes: (ids: string[], timeDelta: number) => void;
  onCopyKeyframes: () => void;
  onPasteKeyframes: () => void;
  onDuplicateKeyframes: () => void;
  onChangeKeyframeEase: (ids: string[], ease: string) => void;
  selectedKeyframeIds: Set<string>;
  onMarqueeSelect: (keyframeIds: string[]) => void;
  trackState: LayerTrackState;
  onToggleSolo: () => void;
  onToggleMute: () => void;
  onToggleShy: () => void;
  onSetColorLabel: (color: string) => void;
  hasSoloTracks: boolean;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragKeyframeId, setDragKeyframeId] = useState<string | null>(null);
  const [dragStartTime, setDragStartTime] = useState<number>(0);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("x");
  const [marquee, setMarquee] = useState<MarqueeState>({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const pixelsPerSecond = zoom * 100;
  const trackWidth = duration * pixelsPerSecond;

  const handleTrackClick = (e: React.MouseEvent, property: string = selectedProperty) => {
    if (!trackRef.current || isDragging || marquee.isActive) return;
    const rect = trackRef.current.getBoundingClientRect();
    const paddingLeft = 8;
    const x = e.clientX - rect.left - paddingLeft;
    const time = x / pixelsPerSecond;
    onCreateKeyframe(Math.max(0, Math.min(duration, time)), property);
  };
  
  const handlePropertyTrackClick = (e: React.MouseEvent, property: string, trackElement: HTMLDivElement | null) => {
    if (!trackElement || isDragging || marquee.isActive) return;
    e.stopPropagation();
    const rect = trackElement.getBoundingClientRect();
    const paddingLeft = 8;
    const x = e.clientX - rect.left - paddingLeft;
    const time = x / pixelsPerSecond;
    onCreateKeyframe(Math.max(0, Math.min(duration, time)), property);
  };

  const handleKeyframeMouseDown = (e: React.MouseEvent, keyframeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    const keyframe = keyframes.find(k => k.id === keyframeId);
    if (!keyframe) return;
    
    setIsDragging(true);
    setDragKeyframeId(keyframeId);
    setDragStartTime(keyframe.time);
    setShiftHeld(e.shiftKey);
    
    if (!selectedKeyframeIds.has(keyframeId)) {
      onSelectKeyframe(keyframeId, e);
    }
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[data-keyframe]')) return;
    
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    
    setMarquee({
      isActive: true,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      currentX: e.clientX - rect.left,
      currentY: e.clientY - rect.top,
    });
  };

  useEffect(() => {
    if (!isDragging || !dragKeyframeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const paddingLeft = 8;
      const x = e.clientX - rect.left - paddingLeft;
      const newTime = Math.max(0, Math.min(duration, x / pixelsPerSecond));
      const snappedTime = Math.round(newTime * fps) / fps;
      
      const timeDelta = snappedTime - dragStartTime;
      
      if (selectedKeyframeIds.size > 1 && selectedKeyframeIds.has(dragKeyframeId)) {
        onBatchUpdateKeyframes(Array.from(selectedKeyframeIds), timeDelta);
      } else {
        onUpdateKeyframe(dragKeyframeId, { time: snappedTime });
      }
      
      setDragStartTime(snappedTime);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDragKeyframeId(null);
      setShiftHeld(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(true);
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setShiftHeld(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, [isDragging, dragKeyframeId, dragStartTime, duration, fps, pixelsPerSecond, onUpdateKeyframe, onBatchUpdateKeyframes, selectedKeyframeIds]);

  useEffect(() => {
    if (!marquee.isActive || !trackRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      setMarquee(prev => ({
        ...prev,
        currentX: e.clientX - rect.left,
        currentY: e.clientY - rect.top,
      }));
    };

    const handleMouseUp = () => {
      if (!trackRef.current) {
        setMarquee(prev => ({ ...prev, isActive: false }));
        return;
      }
      
      const minX = Math.min(marquee.startX, marquee.currentX);
      const maxX = Math.max(marquee.startX, marquee.currentX);
      const paddingLeft = 8;
      
      const minTime = (minX - paddingLeft) / pixelsPerSecond;
      const maxTime = (maxX - paddingLeft) / pixelsPerSecond;
      
      const selectedIds = keyframes
        .filter(kf => kf.time >= minTime && kf.time <= maxTime)
        .map(kf => kf.id);
      
      if (selectedIds.length > 0) {
        onMarqueeSelect(selectedIds);
      }
      
      setMarquee(prev => ({ ...prev, isActive: false }));
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [marquee.isActive, marquee.startX, marquee.currentX, keyframes, pixelsPerSecond, onMarqueeSelect]);

  const groupedKeyframes = useMemo(() => {
    const groups: Record<string, Keyframe[]> = {};
    keyframes.forEach(kf => {
      if (!groups[kf.property]) groups[kf.property] = [];
      groups[kf.property].push(kf);
    });
    return groups;
  }, [keyframes]);

  const marqueeRect = useMemo(() => {
    if (!marquee.isActive) return null;
    return {
      left: Math.min(marquee.startX, marquee.currentX),
      top: Math.min(marquee.startY, marquee.currentY),
      width: Math.abs(marquee.currentX - marquee.startX),
      height: Math.abs(marquee.currentY - marquee.startY),
    };
  }, [marquee]);

  return (
    <div 
      className={cn(
        "border-b border-border/50",
        isSelected && "bg-accent/30"
      )}
      data-testid={`timeline-layer-${object.id}`}
    >
      <div className="flex">
        <div 
          className={cn(
            "w-[200px] shrink-0 flex items-center gap-1 px-2 py-1 border-r border-border/50 cursor-pointer hover:bg-accent/20",
            isSelected && "bg-accent/40"
          )}
          onClick={onSelect}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            data-testid={`layer-expand-${object.id}`}
          >
            <ChevronRight className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-90")} />
          </Button>
          
          <span className="text-xs truncate flex-1">{object.name}</span>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-60 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility();
            }}
            data-testid={`layer-visibility-${object.id}`}
          >
            {object.visible !== false ? (
              <Eye className="h-3 w-3" />
            ) : (
              <EyeOff className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-60 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock();
            }}
            data-testid={`layer-lock-${object.id}`}
          >
            {object.locked ? (
              <Lock className="h-3 w-3 text-amber-500" />
            ) : (
              <Unlock className="h-3 w-3" />
            )}
          </Button>
          
          <div className="flex items-center gap-0.5 ml-1 border-l border-border/30 pl-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-5 w-5 opacity-60 hover:opacity-100",
                    trackState.isSolo && "opacity-100 text-amber-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSolo();
                  }}
                  data-testid={`layer-solo-${object.id}`}
                >
                  <Headphones className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Solo (S)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-5 w-5 opacity-60 hover:opacity-100",
                    trackState.isMuted && "opacity-100 text-red-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMute();
                  }}
                  data-testid={`layer-mute-${object.id}`}
                >
                  {trackState.isMuted ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Mute (M)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-5 w-5 opacity-60 hover:opacity-100",
                    trackState.isShy && "opacity-100 text-purple-400"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleShy();
                  }}
                  data-testid={`layer-shy-${object.id}`}
                >
                  <EyeClosed className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">Shy (hide when shy mode on)</TooltipContent>
            </Tooltip>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 opacity-60 hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                  data-testid={`layer-color-${object.id}`}
                >
                  <div 
                    className="h-3 w-3 rounded-sm border border-border/50"
                    style={{ 
                      backgroundColor: LAYER_COLORS.find(c => c.value === trackState.colorLabel)?.color || 'transparent' 
                    }}
                  />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-2" align="start">
                <div className="grid grid-cols-5 gap-1">
                  {LAYER_COLORS.map(color => (
                    <button
                      key={color.value}
                      className={cn(
                        "h-5 w-5 rounded-sm border border-border/50 hover:scale-110 transition-transform",
                        trackState.colorLabel === color.value && "ring-2 ring-primary ring-offset-1"
                      )}
                      style={{ backgroundColor: color.color }}
                      onClick={() => onSetColorLabel(color.value)}
                      title={color.label}
                      data-testid={`color-${color.value}`}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div
          ref={trackRef}
          className="relative flex-1 h-6 bg-muted/20 cursor-crosshair overflow-visible pl-2"
          style={{ minWidth: trackWidth }}
          onClick={(e) => handleTrackClick(e)}
          onMouseDown={handleTrackMouseDown}
          data-testid={`timeline-track-${object.id}`}
        >
          {keyframes.map((kf) => (
            <ContextMenu key={kf.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    data-keyframe="true"
                    className={cn(
                      "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-move z-10 p-0 border-0 bg-transparent",
                      "flex items-center justify-center transition-colors group",
                      selectedKeyframeIds.has(kf.id) 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{ left: kf.time * pixelsPerSecond }}
                    onMouseDown={(e) => handleKeyframeMouseDown(e, kf.id)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectKeyframe(kf.id, e);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      onDeleteKeyframe(kf.id);
                    }}
                    data-testid={`keyframe-${kf.id}`}
                    aria-label={`Keyframe at ${kf.time}s`}
                  >
                    <div className="relative">
                      <Diamond className={cn(
                        "w-4 h-4 fill-current",
                        selectedKeyframeIds.has(kf.id) && "w-5 h-5"
                      )} />
                      <div className={cn(
                        "absolute -bottom-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100",
                        "transition-opacity text-[8px]",
                        selectedKeyframeIds.has(kf.id) && "opacity-100"
                      )}>
                        <EaseIndicator ease={kf.ease} size={8} />
                      </div>
                    </div>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <div className="flex items-center gap-1">
                    <span>{kf.property}: {formatTimecode(kf.time)}</span>
                    <span className="text-muted-foreground">({EASE_OPTIONS.find(e => e.value === kf.ease)?.label || 'Linear'})</span>
                  </div>
                </TooltipContent>
              </Tooltip>
              <ContextMenuContent>
                <ContextMenuItem onClick={onCopyKeyframes} data-testid="ctx-copy">
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                  <span className="ml-auto text-xs text-muted-foreground">⌘C</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={onPasteKeyframes} data-testid="ctx-paste">
                  <Clipboard className="mr-2 h-4 w-4" />
                  Paste
                  <span className="ml-auto text-xs text-muted-foreground">⌘V</span>
                </ContextMenuItem>
                <ContextMenuItem onClick={onDuplicateKeyframes} data-testid="ctx-duplicate">
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                  <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuSub>
                  <ContextMenuSubTrigger>
                    <MoreHorizontal className="mr-2 h-4 w-4" />
                    Interpolation
                  </ContextMenuSubTrigger>
                  <ContextMenuSubContent>
                    {EASE_OPTIONS.map(opt => (
                      <ContextMenuItem 
                        key={opt.value}
                        onClick={() => onChangeKeyframeEase(
                          selectedKeyframeIds.has(kf.id) && selectedKeyframeIds.size > 1 
                            ? Array.from(selectedKeyframeIds) 
                            : [kf.id], 
                          opt.value
                        )}
                        data-testid={`ctx-ease-${opt.value}`}
                      >
                        <EaseIndicator ease={opt.value} size={14} />
                        <span className="ml-2">{opt.label}</span>
                        {kf.ease === opt.value && <span className="ml-auto text-primary">✓</span>}
                      </ContextMenuItem>
                    ))}
                  </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem 
                  onClick={() => {
                    if (selectedKeyframeIds.has(kf.id) && selectedKeyframeIds.size > 1) {
                      Array.from(selectedKeyframeIds).forEach(id => onDeleteKeyframe(id));
                    } else {
                      onDeleteKeyframe(kf.id);
                    }
                  }} 
                  className="text-destructive"
                  data-testid="ctx-delete"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                  <span className="ml-auto text-xs text-muted-foreground">⌫</span>
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          ))}

          {marqueeRect && (
            <div 
              className="absolute bg-primary/20 border border-primary/50 pointer-events-none z-30"
              style={{
                left: marqueeRect.left,
                top: marqueeRect.top,
                width: marqueeRect.width,
                height: marqueeRect.height,
              }}
              data-testid="marquee-selection"
            />
          )}

          <div
            className="absolute top-0 bottom-0 w-px bg-red-500 z-20 pointer-events-none"
            style={{ left: currentTime * pixelsPerSecond }}
          />
        </div>
      </div>

      {isExpanded && (
        <>
          {Object.entries(groupedKeyframes).map(([property, kfs]) => {
            const propertyTrackRef = createRef<HTMLDivElement>();
            return (
              <div key={property} className="flex border-t border-border/30">
                <div className="w-[200px] shrink-0 flex items-center gap-2 px-2 py-0.5 border-r border-border/50 bg-muted/10">
                  <span className="w-5" />
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    {PROPERTY_OPTIONS.find(p => p.value === property)?.label || property}
                  </span>
                </div>
                <div
                  ref={propertyTrackRef}
                  className="relative flex-1 h-4 bg-muted/10 cursor-crosshair overflow-visible pl-2"
                  style={{ minWidth: trackWidth }}
                  onClick={(e) => handlePropertyTrackClick(e, property, propertyTrackRef.current)}
                >
                  {kfs.map((kf) => (
                    <div
                      key={kf.id}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full cursor-move",
                        "transition-colors",
                        selectedKeyframeIds.has(kf.id) 
                          ? "bg-primary" 
                          : "bg-muted-foreground hover:bg-foreground"
                      )}
                      style={{ left: kf.time * pixelsPerSecond }}
                      onMouseDown={(e) => handleKeyframeMouseDown(e, kf.id)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectKeyframe(kf.id, e);
                      }}
                      data-testid={`keyframe-property-${kf.id}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
          
          <div className="flex border-t border-border/30 border-dashed">
            <div className="w-[200px] shrink-0 flex items-center gap-2 px-2 py-0.5 border-r border-border/50 bg-muted/5">
              <span className="w-5" />
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger className="h-5 text-[10px] border-dashed">
                  <SelectValue placeholder="Add property..." />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_OPTIONS.filter(opt => !Object.keys(groupedKeyframes).includes(opt.value)).map(opt => (
                    <SelectItem key={opt.value} value={opt.value} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div
              className="relative flex-1 h-4 bg-muted/5 cursor-crosshair border-t border-border/20 overflow-visible pl-2"
              style={{ minWidth: trackWidth }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const paddingLeft = 8; // pl-2 = 8px
                const x = e.clientX - rect.left - paddingLeft;
                const time = x / pixelsPerSecond;
                onCreateKeyframe(Math.max(0, Math.min(duration, time)), selectedProperty);
              }}
              data-testid={`add-property-track-${object.id}`}
            >
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/50">
                Click to add {PROPERTY_OPTIONS.find(p => p.value === selectedProperty)?.label || selectedProperty} keyframe
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface WorkAreaState {
  enabled: boolean;
  inPoint: number;
  outPoint: number;
}

function TimelineRuler({
  duration,
  zoom,
  fps,
  currentTime,
  onSeek,
  workArea,
  onWorkAreaChange,
  keyframeTimes,
  snapToKeyframes,
}: {
  duration: number;
  zoom: number;
  fps: number;
  currentTime: number;
  onSeek: (time: number) => void;
  workArea: WorkAreaState;
  onWorkAreaChange: (workArea: Partial<WorkAreaState>) => void;
  keyframeTimes: number[];
  snapToKeyframes: boolean;
}) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [isDraggingWorkAreaIn, setIsDraggingWorkAreaIn] = useState(false);
  const [isDraggingWorkAreaOut, setIsDraggingWorkAreaOut] = useState(false);
  const [isDraggingWorkArea, setIsDraggingWorkArea] = useState(false);
  const dragStartXRef = useRef(0);
  const workAreaStartRef = useRef({ inPoint: 0, outPoint: 0 });

  const pixelsPerSecond = zoom * 100;
  const trackWidth = duration * pixelsPerSecond;

  const { majorInterval, minorInterval } = useMemo(() => {
    if (zoom < 0.5) return { majorInterval: 5, minorInterval: 1 };
    if (zoom < 1) return { majorInterval: 2, minorInterval: 0.5 };
    if (zoom < 1.5) return { majorInterval: 1, minorInterval: 0.5 };
    if (zoom < 3) return { majorInterval: 1, minorInterval: 0.25 };
    return { majorInterval: 0.5, minorInterval: 1 / fps };
  }, [zoom, fps]);

  const majorTicks = useMemo(() => {
    const result = [];
    for (let t = 0; t <= duration; t += majorInterval) {
      result.push(t);
    }
    return result;
  }, [duration, majorInterval]);

  const minorTicks = useMemo(() => {
    const result = [];
    for (let t = 0; t <= duration; t += minorInterval) {
      if (!majorTicks.includes(t)) {
        result.push(t);
      }
    }
    return result;
  }, [duration, minorInterval, majorTicks]);

  const snapTime = useCallback((time: number): number => {
    if (!snapToKeyframes || keyframeTimes.length === 0) return time;
    const snapThreshold = 0.1;
    let closestTime = time;
    let minDistance = snapThreshold;
    
    for (const kfTime of keyframeTimes) {
      const distance = Math.abs(kfTime - time);
      if (distance < minDistance) {
        minDistance = distance;
        closestTime = kfTime;
      }
    }
    return closestTime;
  }, [snapToKeyframes, keyframeTimes]);

  const getTimeFromMouseEvent = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!rulerRef.current) return 0;
    const rect = rulerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    return Math.max(0, Math.min(duration, x / pixelsPerSecond));
  }, [duration, pixelsPerSecond]);

  const handleRulerClick = (e: React.MouseEvent) => {
    if (isDraggingPlayhead || isDraggingWorkAreaIn || isDraggingWorkAreaOut || isDraggingWorkArea) return;
    const time = getTimeFromMouseEvent(e);
    onSeek(snapTime(time));
  };

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  const handleWorkAreaInMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingWorkAreaIn(true);
  };

  const handleWorkAreaOutMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingWorkAreaOut(true);
  };

  const handleWorkAreaMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingWorkArea(true);
    dragStartXRef.current = e.clientX;
    workAreaStartRef.current = { inPoint: workArea.inPoint, outPoint: workArea.outPoint };
  };

  useEffect(() => {
    if (!isDraggingPlayhead && !isDraggingWorkAreaIn && !isDraggingWorkAreaOut && !isDraggingWorkArea) return;

    const handleMouseMove = (e: MouseEvent) => {
      const time = getTimeFromMouseEvent(e);
      
      if (isDraggingPlayhead) {
        onSeek(snapTime(time));
      } else if (isDraggingWorkAreaIn) {
        const newInPoint = Math.min(time, workArea.outPoint - 0.1);
        onWorkAreaChange({ inPoint: Math.max(0, newInPoint) });
      } else if (isDraggingWorkAreaOut) {
        const newOutPoint = Math.max(time, workArea.inPoint + 0.1);
        onWorkAreaChange({ outPoint: Math.min(duration, newOutPoint) });
      } else if (isDraggingWorkArea) {
        const deltaX = e.clientX - dragStartXRef.current;
        const deltaTime = deltaX / pixelsPerSecond;
        const workAreaDuration = workAreaStartRef.current.outPoint - workAreaStartRef.current.inPoint;
        let newInPoint = workAreaStartRef.current.inPoint + deltaTime;
        let newOutPoint = workAreaStartRef.current.outPoint + deltaTime;
        
        if (newInPoint < 0) {
          newInPoint = 0;
          newOutPoint = workAreaDuration;
        }
        if (newOutPoint > duration) {
          newOutPoint = duration;
          newInPoint = duration - workAreaDuration;
        }
        
        onWorkAreaChange({ inPoint: newInPoint, outPoint: newOutPoint });
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      setIsDraggingWorkAreaIn(false);
      setIsDraggingWorkAreaOut(false);
      setIsDraggingWorkArea(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPlayhead, isDraggingWorkAreaIn, isDraggingWorkAreaOut, isDraggingWorkArea, workArea, duration, pixelsPerSecond, onSeek, onWorkAreaChange, getTimeFromMouseEvent, snapTime]);

  return (
    <div
      ref={rulerRef}
      className="relative h-8 bg-gradient-to-b from-muted/50 to-muted/30 border-b border-border cursor-pointer select-none"
      style={{ minWidth: trackWidth }}
      onClick={handleRulerClick}
      data-testid="timeline-ruler"
    >
      {workArea.enabled && (
        <>
          <div
            className="absolute top-5 h-3 bg-blue-500/20 border-y border-blue-500/40 cursor-move"
            style={{
              left: workArea.inPoint * pixelsPerSecond,
              width: (workArea.outPoint - workArea.inPoint) * pixelsPerSecond,
            }}
            onMouseDown={handleWorkAreaMouseDown}
            data-testid="work-area-region"
          />
          
          <div
            className="absolute top-5 h-3 w-2 bg-blue-500/60 cursor-ew-resize hover:bg-blue-500/80 rounded-l-sm"
            style={{ left: workArea.inPoint * pixelsPerSecond - 4 }}
            onMouseDown={handleWorkAreaInMouseDown}
            data-testid="work-area-in-handle"
          />
          
          <div
            className="absolute top-5 h-3 w-2 bg-blue-500/60 cursor-ew-resize hover:bg-blue-500/80 rounded-r-sm"
            style={{ left: workArea.outPoint * pixelsPerSecond + 2 }}
            onMouseDown={handleWorkAreaOutMouseDown}
            data-testid="work-area-out-handle"
          />
        </>
      )}

      {minorTicks.map((t) => (
        <div
          key={`minor-${t}`}
          className="absolute top-4 h-2 w-px bg-border/40"
          style={{ left: t * pixelsPerSecond }}
        />
      ))}

      {majorTicks.map((t) => (
        <div
          key={`major-${t}`}
          className="absolute top-0 h-4 border-l border-border/70"
          style={{ left: t * pixelsPerSecond }}
        >
          <span className="absolute top-0.5 left-1 text-[9px] text-muted-foreground font-mono whitespace-nowrap">
            {formatTimecode(t)}
          </span>
        </div>
      ))}

      <div
        className="absolute top-0 bottom-0 z-20 cursor-ew-resize group"
        style={{ left: currentTime * pixelsPerSecond }}
        onMouseDown={handlePlayheadMouseDown}
        data-testid="timeline-playhead-head"
      >
        <div className="absolute -left-[5px] -top-1 w-[10px] h-4 bg-red-500 rounded-t-sm shadow-md group-hover:bg-red-400 transition-colors">
          <div className="absolute left-1/2 top-3 -translate-x-1/2 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-red-500 group-hover:border-t-red-400" />
        </div>
        <div className="absolute left-[-0.5px] top-3 w-px h-[calc(100%-12px)] bg-red-500 group-hover:bg-red-400" />
      </div>

      <div
        className="absolute top-0 h-4 px-1 rounded bg-card/90 border border-border shadow-sm text-[9px] font-mono text-foreground pointer-events-none"
        style={{ 
          left: Math.min(currentTime * pixelsPerSecond + 12, trackWidth - 50),
          opacity: isDraggingPlayhead ? 1 : 0,
          transition: 'opacity 0.15s ease'
        }}
      >
        {formatTimecode(currentTime)}
      </div>
    </div>
  );
}

function GlobalPlayhead({
  currentTime,
  duration,
  zoom,
  onSeek,
  keyframeTimes,
  snapToKeyframes,
  totalHeight,
}: {
  currentTime: number;
  duration: number;
  zoom: number;
  onSeek: (time: number) => void;
  keyframeTimes: number[];
  snapToKeyframes: boolean;
  totalHeight: number;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const pixelsPerSecond = zoom * 100;

  const snapTime = useCallback((time: number): number => {
    if (!snapToKeyframes || keyframeTimes.length === 0) return time;
    const snapThreshold = 0.1;
    let closestTime = time;
    let minDistance = snapThreshold;
    
    for (const kfTime of keyframeTimes) {
      const distance = Math.abs(kfTime - time);
      if (distance < minDistance) {
        minDistance = distance;
        closestTime = kfTime;
      }
    }
    return closestTime;
  }, [snapToKeyframes, keyframeTimes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const container = containerRef.current.parentElement;
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const time = Math.max(0, Math.min(duration, x / pixelsPerSecond));
      onSeek(snapTime(time));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging, duration, pixelsPerSecond, onSeek, snapTime]);

  return (
    <div
      ref={containerRef}
      className="absolute top-0 z-30 pointer-events-none"
      style={{ 
        left: currentTime * pixelsPerSecond,
        height: totalHeight 
      }}
      data-testid="global-playhead"
    >
      <div 
        className={cn(
          "absolute left-[-0.5px] top-0 w-px bg-red-500",
          isDragging && "bg-red-400 w-0.5"
        )}
        style={{ height: totalHeight }}
      />
      <div
        className="absolute left-[-4px] top-0 w-2 h-full cursor-ew-resize pointer-events-auto opacity-0 hover:opacity-30 bg-red-500"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

function extractNumericValue(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "object" && value !== null) {
    const obj = value as Record<string, unknown>;
    if ("value" in obj && typeof obj.value === "number") return obj.value;
  }
  return 0;
}

function getValueStep(property: string): number {
  switch (property) {
    case "opacity":
    case "scaleX":
    case "scaleY":
    case "scale":
      return 0.1;
    case "rotation":
      return 1;
    default:
      return 1;
  }
}

function getValueRange(property: string): { min?: number; max?: number } {
  switch (property) {
    case "opacity":
      return { min: 0, max: 1 };
    case "scaleX":
    case "scaleY":
    case "scale":
      return { min: 0.01 };
    default:
      return {};
  }
}

function KeyframePropertiesPanel({
  keyframe,
  onUpdateKeyframe,
  onClose,
}: {
  keyframe: Keyframe;
  onUpdateKeyframe: (id: string, updates: { time?: number; property?: string; ease?: string | null; value?: unknown }) => void;
  onClose: () => void;
}) {
  const serverValue = extractNumericValue(keyframe.value);
  const step = getValueStep(keyframe.property);
  const range = getValueRange(keyframe.property);
  
  const [localValue, setLocalValue] = useState<string>(serverValue.toString());
  const [localTime, setLocalTime] = useState<string>(keyframe.time.toString());
  
  useEffect(() => {
    setLocalValue(serverValue.toString());
  }, [serverValue]);
  
  useEffect(() => {
    setLocalTime(keyframe.time.toString());
  }, [keyframe.time]);

  const handleValueChange = (newValue: number) => {
    if (typeof keyframe.value === "object" && keyframe.value !== null) {
      onUpdateKeyframe(keyframe.id, { 
        value: { ...(keyframe.value as object), value: newValue } 
      });
    } else {
      onUpdateKeyframe(keyframe.id, { value: { value: newValue } });
    }
  };
  
  const handleValueInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strValue = e.target.value;
    setLocalValue(strValue);
    const numValue = parseFloat(strValue);
    if (!isNaN(numValue)) {
      handleValueChange(numValue);
    }
  };
  
  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const strValue = e.target.value;
    setLocalTime(strValue);
    const numValue = parseFloat(strValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdateKeyframe(keyframe.id, { time: numValue });
    }
  };

  return (
    <div className="flex items-center gap-3 px-2 py-1.5 border-b border-border bg-accent/20 relative z-20" data-testid="keyframe-properties-panel">
      <div className="flex items-center gap-1.5">
        <Diamond className="h-3 w-3 text-primary" />
        <span className="text-xs font-medium">Keyframe</span>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground">Time:</Label>
        <Input
          type="number"
          value={localTime}
          onChange={handleTimeInputChange}
          className="h-6 w-16 text-xs px-1.5"
          step={0.1}
          min={0}
          data-testid="input-keyframe-time"
        />
        <span className="text-xs text-muted-foreground">s</span>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground">Value:</Label>
        <Input
          type="number"
          value={localValue}
          onChange={handleValueInputChange}
          className="h-6 w-20 text-xs px-1.5"
          step={step}
          min={range.min}
          max={range.max}
          data-testid="input-keyframe-value"
        />
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground">Easing:</Label>
        <Select
          value={keyframe.ease || "power2.out"}
          onValueChange={(value) => onUpdateKeyframe(keyframe.id, { ease: value })}
        >
          <SelectTrigger className="h-6 w-32 text-xs" data-testid="select-keyframe-ease">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EASE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="h-4 w-px bg-border" />

      <div className="flex items-center gap-1.5">
        <Label className="text-xs text-muted-foreground">Property:</Label>
        <Select
          value={keyframe.property}
          onValueChange={(value) => onUpdateKeyframe(keyframe.id, { property: value })}
        >
          <SelectTrigger className="h-6 w-24 text-xs" data-testid="select-keyframe-property">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PROPERTY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5"
        onClick={onClose}
        data-testid="btn-close-keyframe-properties"
      >
        <ChevronUp className="h-3 w-3" />
      </Button>
    </div>
  );
}

function TransportControls({
  state,
  onPlay,
  onPause,
  onStop,
  onSeek,
  onToggleLoop,
  onZoomChange,
  onDurationChange,
  isLooping,
  snapToKeyframes,
  onToggleSnap,
  workAreaEnabled,
  onToggleWorkArea,
  showShyLayers,
  onToggleShowShy,
}: {
  state: TimelineState;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek: (time: number) => void;
  onToggleLoop: () => void;
  onZoomChange: (zoom: number) => void;
  onDurationChange: (duration: number) => void;
  isLooping: boolean;
  snapToKeyframes: boolean;
  onToggleSnap: () => void;
  workAreaEnabled: boolean;
  onToggleWorkArea: () => void;
  showShyLayers: boolean;
  onToggleShowShy: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1 border-b border-border bg-card" data-testid="transport-controls">
      <div className="flex items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onStop}
              data-testid="btn-stop"
            >
              <Square className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Stop</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onSeek(0)}
              data-testid="btn-skip-back"
            >
              <SkipBack className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to Start</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={state.isPlaying ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={state.isPlaying ? onPause : onPlay}
              data-testid="btn-play-pause"
            >
              {state.isPlaying ? (
                <Pause className="h-3.5 w-3.5" />
              ) : (
                <Play className="h-3.5 w-3.5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{state.isPlaying ? "Pause" : "Play"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onSeek(state.duration)}
              data-testid="btn-skip-forward"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Go to End</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isLooping ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={onToggleLoop}
              data-testid="btn-loop"
            >
              <Repeat className={cn("h-3.5 w-3.5", isLooping && "text-primary")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Loop Playback</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={workAreaEnabled ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={onToggleWorkArea}
              data-testid="btn-work-area"
            >
              <Maximize2 className={cn("h-3.5 w-3.5", workAreaEnabled && "text-blue-500")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Work Area (Loop Region)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={snapToKeyframes ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={onToggleSnap}
              data-testid="btn-snap"
            >
              <Magnet className={cn("h-3.5 w-3.5", snapToKeyframes && "text-primary")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Snap to Keyframes</TooltipContent>
        </Tooltip>
        
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={!showShyLayers ? "secondary" : "ghost"}
              size="icon"
              className="h-7 w-7"
              onClick={onToggleShowShy}
              data-testid="btn-shy-toggle"
            >
              <EyeClosed className={cn("h-3.5 w-3.5", !showShyLayers && "text-purple-400")} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{showShyLayers ? "Hide Shy Layers" : "Show Shy Layers"}</TooltipContent>
        </Tooltip>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      <div className="flex items-center gap-1.5">
        <span className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-foreground" data-testid="current-timecode">
          {formatTimecode(state.currentTime)}
        </span>
        <span className="text-xs text-muted-foreground">/</span>
        <Input
          type="number"
          value={state.duration}
          onChange={(e) => onDurationChange(Math.max(1, parseFloat(e.target.value) || 1))}
          className="h-6 w-14 text-xs px-1"
          step={0.5}
          min={1}
          max={300}
          data-testid="input-duration"
        />
        <span className="text-xs text-muted-foreground">sec</span>
      </div>

      <div className="h-4 w-px bg-border mx-1" />

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Zoom</Label>
        <Slider
          value={[state.zoom]}
          onValueChange={([v]) => onZoomChange(v)}
          min={0.25}
          max={4}
          step={0.25}
          className="w-20"
          data-testid="slider-zoom"
        />
        <span className="text-xs text-muted-foreground w-8">{Math.round(state.zoom * 100)}%</span>
      </div>
    </div>
  );
}

export function TimelinePanel({
  objects,
  selectedObjectId,
  sceneId,
  onSelectObject,
  onUpdateObject,
  height,
  minHeight,
  maxHeight,
  isCollapsed,
  onHeightChange,
  onToggleCollapse,
}: TimelinePanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const timelineContext = useOptionalTimelineContext();

  const [localTimelineState, setLocalTimelineState] = useState<TimelineState>({
    isPlaying: false,
    currentTime: 0,
    duration: 5,
    zoom: 1,
    fps: 30,
  });
  const [localIsLooping, setLocalIsLooping] = useState(false);

  const timelineState: TimelineState = timelineContext 
    ? { ...timelineContext.state, fps: 30 }
    : localTimelineState;
  const isLooping = timelineContext?.isLooping ?? localIsLooping;

  const [snapToKeyframes, setSnapToKeyframes] = useState(true);
  const [workArea, setWorkArea] = useState<WorkAreaState>({
    enabled: false,
    inPoint: 0,
    outPoint: timelineState.duration,
  });

  useEffect(() => {
    if (!workArea.enabled || workArea.outPoint <= timelineState.duration) return;
    setWorkArea(prev => ({ ...prev, outPoint: timelineState.duration }));
  }, [timelineState.duration, workArea.enabled, workArea.outPoint]);

  const handleWorkAreaChange = useCallback((updates: Partial<WorkAreaState>) => {
    setWorkArea(prev => ({ ...prev, ...updates }));
  }, []);

  const handleToggleWorkArea = useCallback(() => {
    setWorkArea(prev => ({
      ...prev,
      enabled: !prev.enabled,
      inPoint: prev.enabled ? prev.inPoint : 0,
      outPoint: prev.enabled ? prev.outPoint : timelineState.duration,
    }));
  }, [timelineState.duration]);

  const handleToggleSnap = useCallback(() => {
    setSnapToKeyframes(prev => !prev);
  }, []);

  const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set());
  const [selectedKeyframeIds, setSelectedKeyframeIds] = useState<Set<string>>(new Set());
  const [lastSelectedKeyframeId, setLastSelectedKeyframeId] = useState<string | null>(null);
  
  const [trackStates, setTrackStates] = useState<Record<string, LayerTrackState>>({});
  const [showShyLayers, setShowShyLayers] = useState(true);
  
  const getTrackState = useCallback((objectId: string): LayerTrackState => {
    return trackStates[objectId] || { isSolo: false, isMuted: false, isShy: false, colorLabel: 'none' };
  }, [trackStates]);
  
  const hasSoloTracks = useMemo(() => {
    return Object.values(trackStates).some(state => state.isSolo);
  }, [trackStates]);
  
  const handleToggleSolo = useCallback((objectId: string) => {
    setTrackStates(prev => ({
      ...prev,
      [objectId]: {
        ...getTrackState(objectId),
        isSolo: !getTrackState(objectId).isSolo
      }
    }));
  }, [getTrackState]);
  
  const handleToggleMute = useCallback((objectId: string) => {
    setTrackStates(prev => ({
      ...prev,
      [objectId]: {
        ...getTrackState(objectId),
        isMuted: !getTrackState(objectId).isMuted
      }
    }));
  }, [getTrackState]);
  
  const handleToggleShy = useCallback((objectId: string) => {
    setTrackStates(prev => ({
      ...prev,
      [objectId]: {
        ...getTrackState(objectId),
        isShy: !getTrackState(objectId).isShy
      }
    }));
  }, [getTrackState]);
  
  const handleSetColorLabel = useCallback((objectId: string, color: string) => {
    setTrackStates(prev => ({
      ...prev,
      [objectId]: {
        ...getTrackState(objectId),
        colorLabel: color
      }
    }));
  }, [getTrackState]);
  
  const handleToggleShowShy = useCallback(() => {
    setShowShyLayers(prev => !prev);
  }, []);
  
  const visibleObjects = useMemo(() => {
    if (showShyLayers) return objects;
    return objects.filter(obj => !getTrackState(obj.id).isShy);
  }, [objects, showShyLayers, getTrackState]);
  const [clipboardKeyframes, setClipboardKeyframes] = useState<Array<{
    property: string;
    value: Record<string, unknown> | unknown[] | string | number | boolean | null;
    ease: string | null;
    timeOffset: number; // relative to first selected keyframe
  }>>([]);
  
  const { toast } = useToast();

  const currentHeight = isCollapsed ? 32 : height;

  const { data: animations = [] } = useAnimations(selectedObjectId || undefined);
  const createAnimation = useCreateAnimation();
  const updateAnimation = useUpdateAnimation();
  const deleteAnimation = useDeleteAnimation();

  const selectedAnimation = useMemo(() => 
    animations.find(a => a.objectId === selectedObjectId) || null,
    [animations, selectedObjectId]
  );

  const { data: keyframes = [] } = useKeyframes(selectedAnimation?.id);
  const createKeyframe = useCreateKeyframe();
  const updateKeyframe = useUpdateKeyframe();
  const deleteKeyframe = useDeleteKeyframe();

  // Clear keyframe selection when object or animation changes
  useEffect(() => {
    setSelectedKeyframeIds(new Set());
    setLastSelectedKeyframeId(null);
  }, [selectedObjectId, selectedAnimation?.id]);

  // Get selected keyframes sorted by time, filtering out any stale selections
  const selectedKeyframes = useMemo(() => {
    if (selectedKeyframeIds.size === 0) return [];
    const validKeyframes = keyframes.filter(k => selectedKeyframeIds.has(k.id));
    // If selection is stale (no valid keyframes), clear the selection
    if (validKeyframes.length === 0 && selectedKeyframeIds.size > 0) {
      setTimeout(() => {
        setSelectedKeyframeIds(new Set());
        setLastSelectedKeyframeId(null);
      }, 0);
    }
    return validKeyframes.sort((a, b) => a.time - b.time);
  }, [keyframes, selectedKeyframeIds]);

  // Get the last selected keyframe for properties panel
  const selectedKeyframe = useMemo(() => {
    if (!lastSelectedKeyframeId) return null;
    return keyframes.find(k => k.id === lastSelectedKeyframeId) || null;
  }, [keyframes, lastSelectedKeyframeId]);

  // Handler for keyframe selection with Shift and Cmd/Ctrl modifiers
  const handleKeyframeSelect = useCallback((keyframeId: string, event?: React.MouseEvent) => {
    const keyframe = keyframes.find(k => k.id === keyframeId);
    if (!keyframe) return;

    const cmdKey = event?.metaKey || event?.ctrlKey;
    const shiftKey = event?.shiftKey;

    if (shiftKey && lastSelectedKeyframeId) {
      // Shift+click: select range between last selected and clicked keyframe
      // Only works when both keyframes have the same property
      const lastKeyframe = keyframes.find(k => k.id === lastSelectedKeyframeId);
      if (lastKeyframe) {
        if (lastKeyframe.property === keyframe.property) {
          // Same property: select range
          const startTime = Math.min(lastKeyframe.time, keyframe.time);
          const endTime = Math.max(lastKeyframe.time, keyframe.time);
          const rangeKeyframes = keyframes.filter(k => 
            k.time >= startTime && 
            k.time <= endTime && 
            k.property === keyframe.property
          );
          setSelectedKeyframeIds(new Set(rangeKeyframes.map(k => k.id)));
          setLastSelectedKeyframeId(keyframeId);
        } else {
          // Different properties: fall back to single selection
          setSelectedKeyframeIds(new Set([keyframeId]));
          setLastSelectedKeyframeId(keyframeId);
        }
      }
    } else if (cmdKey) {
      // Cmd/Ctrl+click: toggle selection
      setSelectedKeyframeIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(keyframeId)) {
          newSet.delete(keyframeId);
          // If we deselected the last selected keyframe, update to another selected keyframe or clear
          if (keyframeId === lastSelectedKeyframeId) {
            if (newSet.size > 0) {
              setLastSelectedKeyframeId(Array.from(newSet)[0]);
            } else {
              setLastSelectedKeyframeId(null);
            }
          }
        } else {
          newSet.add(keyframeId);
          setLastSelectedKeyframeId(keyframeId);
        }
        return newSet;
      });
    } else {
      // Regular click: single selection
      setSelectedKeyframeIds(new Set([keyframeId]));
      setLastSelectedKeyframeId(keyframeId);
    }
  }, [keyframes, lastSelectedKeyframeId]);

  // Clear selection handler
  const clearKeyframeSelection = useCallback(() => {
    setSelectedKeyframeIds(new Set());
    setLastSelectedKeyframeId(null);
  }, []);

  // Copy/Paste keyboard shortcuts for keyframes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      
      // Use both metaKey (Mac) and ctrlKey (Windows/Linux) for cross-platform support
      const cmdKey = e.metaKey || e.ctrlKey;
      
      // Cmd/Ctrl+C - Copy selected keyframes
      if (cmdKey && e.key === 'c' && selectedKeyframes.length > 0 && !isInInput) {
        e.preventDefault();
        const baseTime = selectedKeyframes[0].time;
        const clipboardData = selectedKeyframes.map(kf => ({
          property: kf.property,
          value: kf.value as Record<string, unknown>,
          ease: kf.ease,
          timeOffset: kf.time - baseTime,
        }));
        setClipboardKeyframes(clipboardData);
        const count = selectedKeyframes.length;
        toast({ 
          title: count === 1 ? "Keyframe copied" : `${count} keyframes copied`,
          description: count === 1 ? `${selectedKeyframes[0].property} keyframe copied to clipboard` : `Copied to clipboard`
        });
      }
      
      // Cmd/Ctrl+V - Paste keyframes at current time
      if (cmdKey && e.key === 'v' && clipboardKeyframes.length > 0 && selectedAnimation && !isInInput) {
        e.preventDefault();
        const currentTime = timelineState.currentTime;
        const count = clipboardKeyframes.length;
        
        // Create all keyframes from clipboard
        let successCount = 0;
        clipboardKeyframes.forEach((clipboardKf, index) => {
          createKeyframe.mutate({
            animationId: selectedAnimation.id,
            time: currentTime + clipboardKf.timeOffset,
            property: clipboardKf.property,
            value: clipboardKf.value,
            ease: clipboardKf.ease,
          }, {
            onSuccess: () => {
              successCount++;
              if (successCount === count) {
                toast({ 
                  title: count === 1 ? "Keyframe pasted" : `${count} keyframes pasted`,
                  description: `Pasted at ${currentTime.toFixed(2)}s`
                });
              }
            }
          });
        });
      }
      
      // Delete/Backspace - Delete selected keyframes
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedKeyframes.length > 0 && !isInInput) {
        e.preventDefault();
        e.stopPropagation(); // Prevent event from bubbling to window (GameCanvas listener)
        e.stopImmediatePropagation(); // Prevent other document listeners
        const count = selectedKeyframes.length;
        selectedKeyframes.forEach(kf => {
          deleteKeyframe.mutate(kf.id);
        });
        clearKeyframeSelection();
        toast({ title: count === 1 ? "Keyframe deleted" : `${count} keyframes deleted` });
      }
      
      // Cmd/Ctrl+A - Select all keyframes (when focused on timeline)
      if (cmdKey && e.key === 'a' && !isInInput && keyframes.length > 0) {
        e.preventDefault();
        setSelectedKeyframeIds(new Set(keyframes.map(k => k.id)));
        if (keyframes.length > 0) {
          setLastSelectedKeyframeId(keyframes[0].id);
        }
        toast({ title: `${keyframes.length} keyframes selected` });
      }
      
      // Cmd/Ctrl+D - Duplicate selected keyframes
      if (cmdKey && e.key === 'd' && selectedKeyframes.length > 0 && selectedAnimation && !isInInput) {
        e.preventDefault();
        const offset = 0.5;
        const count = selectedKeyframes.length;
        selectedKeyframes.forEach(kf => {
          createKeyframe.mutate({
            animationId: selectedAnimation.id,
            time: Math.min(timelineState.duration, kf.time + offset),
            property: kf.property,
            value: kf.value as Record<string, unknown>,
            ease: kf.ease,
          });
        });
        toast({ 
          title: count === 1 ? "Keyframe duplicated" : `${count} keyframes duplicated`,
        });
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeyframes, clipboardKeyframes, selectedAnimation, timelineState.currentTime, timelineState.duration, createKeyframe, deleteKeyframe, keyframes, clearKeyframeSelection, toast]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return;
    e.preventDefault();
    setIsResizing(true);
    startYRef.current = e.clientY;
    startHeightRef.current = height;
  }, [isCollapsed, height]);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startYRef.current - e.clientY;
      const newHeight = Math.min(maxHeight, Math.max(minHeight, startHeightRef.current + delta));
      onHeightChange(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, maxHeight, minHeight, onHeightChange]);

  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (timelineContext) return;
    
    if (!localTimelineState.isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setLocalTimelineState(prev => {
        let newTime = prev.currentTime + delta;
        if (newTime >= prev.duration) {
          if (localIsLooping) {
            newTime = 0;
          } else {
            return { ...prev, currentTime: prev.duration, isPlaying: false };
          }
        }
        return { ...prev, currentTime: newTime };
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [timelineContext, localTimelineState.isPlaying, localIsLooping]);

  const allKeyframesByAnimation = useMemo(() => {
    const result: Record<string, Keyframe[]> = {};
    if (selectedAnimation && keyframes.length > 0) {
      result[selectedAnimation.id] = keyframes;
    }
    return result;
  }, [selectedAnimation, keyframes]);

  const keyframeTimes = useMemo(() => {
    const times = keyframes.map(kf => kf.time);
    return [...new Set(times)].sort((a, b) => a - b);
  }, [keyframes]);

  const tracksContainerRef = useRef<HTMLDivElement>(null);
  const [tracksHeight, setTracksHeight] = useState(0);

  useEffect(() => {
    if (!tracksContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setTracksHeight(entry.contentRect.height);
      }
    });
    observer.observe(tracksContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const handlePlay = useCallback(() => {
    if (timelineContext) {
      timelineContext.buildAndPlay(objects, animations, allKeyframesByAnimation);
    } else {
      setLocalTimelineState(prev => ({ ...prev, isPlaying: true }));
    }
  }, [timelineContext, objects, animations, allKeyframesByAnimation]);

  const handlePause = useCallback(() => {
    if (timelineContext) {
      timelineContext.pause();
    } else {
      setLocalTimelineState(prev => ({ ...prev, isPlaying: false }));
    }
  }, [timelineContext]);

  const handleStop = useCallback(() => {
    if (timelineContext) {
      timelineContext.stop();
    } else {
      setLocalTimelineState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
    }
  }, [timelineContext]);

  const handleSeek = useCallback((time: number) => {
    if (timelineContext) {
      timelineContext.seek(time);
    } else {
      setLocalTimelineState(prev => ({ ...prev, currentTime: time }));
    }
  }, [timelineContext]);

  const handleToggleLoop = useCallback(() => {
    if (timelineContext) {
      timelineContext.toggleLoop();
    } else {
      setLocalIsLooping(prev => !prev);
    }
  }, [timelineContext]);

  const handleZoomChange = useCallback((zoom: number) => {
    if (timelineContext) {
      timelineContext.setZoom(zoom);
    } else {
      setLocalTimelineState(prev => ({ ...prev, zoom }));
    }
  }, [timelineContext]);

  const handleDurationChange = useCallback((duration: number) => {
    if (timelineContext) {
      timelineContext.setDuration(duration);
    } else {
      setLocalTimelineState(prev => ({ ...prev, duration }));
    }
  }, [timelineContext]);

  const handleToggleVisibility = useCallback((objectId: string) => {
    const obj = objects.find(o => o.id === objectId);
    if (obj) {
      onUpdateObject(objectId, { visible: obj.visible === false ? true : false });
    }
  }, [objects, onUpdateObject]);

  const handleToggleLock = useCallback((objectId: string) => {
    const obj = objects.find(o => o.id === objectId);
    if (obj) {
      onUpdateObject(objectId, { locked: !obj.locked });
    }
  }, [objects, onUpdateObject]);

  const getObjectPropertyValue = useCallback((objectId: string, property: string): number => {
    const obj = objects.find(o => o.id === objectId);
    if (!obj) return 0;
    switch (property) {
      case "x": return obj.x;
      case "y": return obj.y;
      case "width": return obj.width;
      case "height": return obj.height;
      case "rotation": return obj.rotation ?? 0;
      case "scale": return obj.scaleX ?? 1;
      case "scaleX": return obj.scaleX ?? 1;
      case "scaleY": return obj.scaleY ?? 1;
      case "opacity": return obj.opacity ?? 1;
      default: return 0;
    }
  }, [objects]);

  const handleCreateKeyframe = useCallback((objectId: string, time: number, property: string) => {
    let animationId = animations.find(a => a.objectId === objectId)?.id;
    const currentValue = getObjectPropertyValue(objectId, property);
    
    if (!animationId) {
      createAnimation.mutate({
        objectId,
        sceneId: sceneId || undefined,
        duration: timelineState.duration,
        loop: isLooping,
        autoplay: false,
        playbackRate: 1,
        order: 0,
      }, {
        onSuccess: (newAnimation) => {
          createKeyframe.mutate({
            animationId: newAnimation.id,
            time,
            property: property as any,
            value: { value: currentValue },
            ease: "power1.inOut",
          });
          toast({ title: "Keyframe added", description: `${property} = ${currentValue} at ${time.toFixed(2)}s` });
        }
      });
    } else {
      createKeyframe.mutate({
        animationId,
        time,
        property: property as any,
        value: { value: currentValue },
        ease: "power1.inOut",
      });
      toast({ title: "Keyframe added", description: `${property} = ${currentValue} at ${time.toFixed(2)}s` });
    }
  }, [animations, createAnimation, createKeyframe, sceneId, timelineState.duration, isLooping, getObjectPropertyValue, toast]);

  const handleUpdateKeyframe = useCallback((id: string, updates: { time?: number; property?: string; ease?: string | null; value?: unknown }) => {
    const safeUpdates = { ...updates };
    if (updates.value !== undefined) {
      safeUpdates.value = updates.value as Record<string, unknown>;
    }
    updateKeyframe.mutate({ id, ...safeUpdates } as { id: string; time?: number; property?: string; ease?: string | null; value?: Record<string, unknown> });
  }, [updateKeyframe]);

  const handleDeleteKeyframe = useCallback((id: string) => {
    deleteKeyframe.mutate(id);
    if (selectedKeyframeIds.has(id)) {
      setSelectedKeyframeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      if (lastSelectedKeyframeId === id) {
        setLastSelectedKeyframeId(null);
      }
    }
  }, [deleteKeyframe, selectedKeyframeIds, lastSelectedKeyframeId]);

  const handleBatchUpdateKeyframes = useCallback((ids: string[], timeDelta: number) => {
    if (timeDelta === 0) return;
    ids.forEach(id => {
      const kf = keyframes.find(k => k.id === id);
      if (kf) {
        const newTime = Math.max(0, Math.min(timelineState.duration, kf.time + timeDelta));
        updateKeyframe.mutate({ id, time: newTime });
      }
    });
  }, [keyframes, timelineState.duration, updateKeyframe]);

  const handleCopyKeyframes = useCallback(() => {
    if (selectedKeyframes.length === 0) return;
    const baseTime = selectedKeyframes[0].time;
    const clipboardData = selectedKeyframes.map(kf => ({
      property: kf.property,
      value: kf.value as Record<string, unknown>,
      ease: kf.ease,
      timeOffset: kf.time - baseTime,
    }));
    setClipboardKeyframes(clipboardData);
    toast({ 
      title: selectedKeyframes.length === 1 ? "Keyframe copied" : `${selectedKeyframes.length} keyframes copied`,
    });
  }, [selectedKeyframes, toast]);

  const handlePasteKeyframes = useCallback(() => {
    if (clipboardKeyframes.length === 0 || !selectedAnimation) return;
    const currentTime = timelineState.currentTime;
    clipboardKeyframes.forEach(clipboardKf => {
      createKeyframe.mutate({
        animationId: selectedAnimation.id,
        time: currentTime + clipboardKf.timeOffset,
        property: clipboardKf.property,
        value: clipboardKf.value,
        ease: clipboardKf.ease,
      });
    });
    toast({ 
      title: clipboardKeyframes.length === 1 ? "Keyframe pasted" : `${clipboardKeyframes.length} keyframes pasted`,
    });
  }, [clipboardKeyframes, selectedAnimation, timelineState.currentTime, createKeyframe, toast]);

  const handleDuplicateKeyframes = useCallback(() => {
    if (selectedKeyframes.length === 0 || !selectedAnimation) return;
    const offset = 0.5;
    selectedKeyframes.forEach(kf => {
      createKeyframe.mutate({
        animationId: selectedAnimation.id,
        time: Math.min(timelineState.duration, kf.time + offset),
        property: kf.property,
        value: kf.value as Record<string, unknown>,
        ease: kf.ease,
      });
    });
    toast({ 
      title: selectedKeyframes.length === 1 ? "Keyframe duplicated" : `${selectedKeyframes.length} keyframes duplicated`,
    });
  }, [selectedKeyframes, selectedAnimation, timelineState.duration, createKeyframe, toast]);

  const handleChangeKeyframeEase = useCallback((ids: string[], ease: string) => {
    ids.forEach(id => {
      updateKeyframe.mutate({ id, ease });
    });
    toast({ 
      title: ids.length === 1 ? "Interpolation changed" : `${ids.length} keyframes updated`,
      description: EASE_OPTIONS.find(e => e.value === ease)?.label || ease,
    });
  }, [updateKeyframe, toast]);

  const handleMarqueeSelect = useCallback((keyframeIds: string[]) => {
    setSelectedKeyframeIds(new Set(keyframeIds));
    if (keyframeIds.length > 0) {
      setLastSelectedKeyframeId(keyframeIds[0]);
    }
  }, []);

  const toggleLayerExpanded = useCallback((objectId: string) => {
    setExpandedLayers(prev => {
      const next = new Set(prev);
      if (next.has(objectId)) {
        next.delete(objectId);
      } else {
        next.add(objectId);
      }
      return next;
    });
  }, []);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollLeft(e.currentTarget.scrollLeft);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col bg-card border-t border-border transition-[height] duration-200 ease-out",
        isResizing && "transition-none"
      )}
      style={{ height: currentHeight }}
      data-testid="timeline-panel"
    >
      <div
        className={cn(
          "absolute left-0 right-0 -top-1 h-2 cursor-row-resize group z-10",
          "hover:bg-primary/20 active:bg-primary/40",
          isResizing && "bg-primary/40"
        )}
        onMouseDown={handleMouseDown}
        data-testid="timeline-resize-handle"
      >
        <div className={cn(
          "absolute left-1/2 -translate-x-1/2 -top-0 opacity-0 group-hover:opacity-100 transition-opacity",
          "flex items-center justify-center h-4 w-8 bg-muted rounded"
        )}>
          <GripHorizontal className="h-3 w-3 text-muted-foreground" />
        </div>
      </div>

      <div className="flex items-center justify-between px-2 h-8 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={onToggleCollapse}
            data-testid="btn-toggle-timeline"
          >
            {isCollapsed ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm font-medium">Timeline</span>
          <HelpTooltip featureKey="timeline-playback" side="bottom" iconSize={12} />
        </div>

        {!isCollapsed && (
          <div className="flex items-center gap-1">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 relative"
                      onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "x")}
                      disabled={!selectedObjectId}
                      data-testid="btn-add-keyframe"
                    >
                      <Diamond className="h-3 w-3" />
                      <Plus className="h-2 w-2 absolute bottom-1 right-1" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add Keyframe (right-click for options)</TooltipContent>
                </Tooltip>
              </ContextMenuTrigger>
              <ContextMenuContent className="w-48">
                <ContextMenuItem
                  onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "x")}
                  disabled={!selectedObjectId}
                >
                  <ArrowRight className="h-3 w-3 mr-2" />
                  Position X
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "y")}
                  disabled={!selectedObjectId}
                >
                  <ArrowDownRight className="h-3 w-3 mr-2" />
                  Position Y
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "rotation")}
                  disabled={!selectedObjectId}
                >
                  <Repeat className="h-3 w-3 mr-2" />
                  Rotation
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "scaleX")}
                  disabled={!selectedObjectId}
                >
                  <Maximize2 className="h-3 w-3 mr-2" />
                  Scale X
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "scaleY")}
                  disabled={!selectedObjectId}
                >
                  <Maximize2 className="h-3 w-3 mr-2 rotate-90" />
                  Scale Y
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => selectedObjectId && handleCreateKeyframe(selectedObjectId, timelineState.currentTime, "opacity")}
                  disabled={!selectedObjectId}
                >
                  <Eye className="h-3 w-3 mr-2" />
                  Opacity
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onClick={() => {
                    if (!selectedObjectId) return;
                    const time = timelineState.currentTime;
                    handleCreateKeyframe(selectedObjectId, time, "x");
                    handleCreateKeyframe(selectedObjectId, time, "y");
                  }}
                  disabled={!selectedObjectId}
                >
                  <Diamond className="h-3 w-3 mr-2" />
                  All Position (X + Y)
                </ContextMenuItem>
                <ContextMenuItem
                  onClick={() => {
                    if (!selectedObjectId) return;
                    const time = timelineState.currentTime;
                    handleCreateKeyframe(selectedObjectId, time, "x");
                    handleCreateKeyframe(selectedObjectId, time, "y");
                    handleCreateKeyframe(selectedObjectId, time, "rotation");
                    handleCreateKeyframe(selectedObjectId, time, "opacity");
                  }}
                  disabled={!selectedObjectId}
                >
                  <Diamond className="h-3 w-3 mr-2 fill-current" />
                  All Transform Properties
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
            <HelpTooltip featureKey="timeline-keyframes" side="bottom" iconSize={12} />
          </div>
        )}
      </div>

      {!isCollapsed && (
        <>
          <TransportControls
            state={timelineState}
            onPlay={handlePlay}
            onPause={handlePause}
            onStop={handleStop}
            onSeek={handleSeek}
            onToggleLoop={handleToggleLoop}
            onZoomChange={handleZoomChange}
            onDurationChange={handleDurationChange}
            isLooping={isLooping}
            snapToKeyframes={snapToKeyframes}
            onToggleSnap={handleToggleSnap}
            workAreaEnabled={workArea.enabled}
            onToggleWorkArea={handleToggleWorkArea}
            showShyLayers={showShyLayers}
            onToggleShowShy={handleToggleShowShy}
          />

          {selectedKeyframe && (
            <KeyframePropertiesPanel
              keyframe={selectedKeyframe}
              onUpdateKeyframe={handleUpdateKeyframe}
              onClose={clearKeyframeSelection}
            />
          )}

          <div className="flex-1 flex min-h-0 overflow-hidden">
            <div className="w-[200px] shrink-0 border-r border-border bg-muted/20 flex flex-col">
              <div className="h-6 border-b border-border px-2 flex items-center">
                <span className="text-xs font-medium text-muted-foreground">Layers</span>
              </div>
              <ScrollArea className="flex-1">
                {objects.map(obj => (
                  <div
                    key={obj.id}
                    className={cn(
                      "h-6 flex items-center gap-1 px-2 cursor-pointer hover:bg-accent/20 border-b border-border/50",
                      selectedObjectId === obj.id && "bg-accent/40"
                    )}
                    onClick={() => onSelectObject(obj.id)}
                    data-testid={`layer-label-${obj.id}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerExpanded(obj.id);
                      }}
                    >
                      <ChevronRight className={cn(
                        "h-3 w-3 transition-transform",
                        expandedLayers.has(obj.id) && "rotate-90"
                      )} />
                    </Button>
                    <span className="text-xs truncate">{obj.name}</span>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div 
              ref={scrollContainerRef}
              className="flex-1 overflow-auto relative"
              onScroll={handleScroll}
            >
              <TimelineRuler
                duration={timelineState.duration}
                zoom={timelineState.zoom}
                fps={timelineState.fps}
                currentTime={timelineState.currentTime}
                onSeek={handleSeek}
                workArea={workArea}
                onWorkAreaChange={handleWorkAreaChange}
                keyframeTimes={keyframeTimes}
                snapToKeyframes={snapToKeyframes}
              />

              <div ref={tracksContainerRef} className="min-w-max relative">
                {visibleObjects.map(obj => {
                  const objAnimation = animations.find(a => a.objectId === obj.id);
                  const objKeyframes = objAnimation ? keyframes.filter(k => k.animationId === objAnimation.id) : [];
                  
                  return (
                    <LayerRow
                      key={obj.id}
                      object={obj}
                      animation={objAnimation || null}
                      keyframes={objKeyframes}
                      allKeyframes={keyframes}
                      isSelected={selectedObjectId === obj.id}
                      isExpanded={expandedLayers.has(obj.id)}
                      onSelect={() => onSelectObject(obj.id)}
                      onToggleExpand={() => toggleLayerExpanded(obj.id)}
                      onToggleVisibility={() => handleToggleVisibility(obj.id)}
                      onToggleLock={() => handleToggleLock(obj.id)}
                      currentTime={timelineState.currentTime}
                      duration={timelineState.duration}
                      zoom={timelineState.zoom}
                      fps={timelineState.fps}
                      onCreateKeyframe={(time, property) => handleCreateKeyframe(obj.id, time, property)}
                      onUpdateKeyframe={handleUpdateKeyframe}
                      onDeleteKeyframe={handleDeleteKeyframe}
                      onSelectKeyframe={handleKeyframeSelect}
                      onBatchUpdateKeyframes={handleBatchUpdateKeyframes}
                      onCopyKeyframes={handleCopyKeyframes}
                      onPasteKeyframes={handlePasteKeyframes}
                      onDuplicateKeyframes={handleDuplicateKeyframes}
                      onChangeKeyframeEase={handleChangeKeyframeEase}
                      selectedKeyframeIds={selectedKeyframeIds}
                      onMarqueeSelect={handleMarqueeSelect}
                      trackState={getTrackState(obj.id)}
                      onToggleSolo={() => handleToggleSolo(obj.id)}
                      onToggleMute={() => handleToggleMute(obj.id)}
                      onToggleShy={() => handleToggleShy(obj.id)}
                      onSetColorLabel={(color) => handleSetColorLabel(obj.id, color)}
                      hasSoloTracks={hasSoloTracks}
                    />
                  );
                })}
                
                <GlobalPlayhead
                  currentTime={timelineState.currentTime}
                  duration={timelineState.duration}
                  zoom={timelineState.zoom}
                  onSeek={handleSeek}
                  keyframeTimes={keyframeTimes}
                  snapToKeyframes={snapToKeyframes}
                  totalHeight={tracksHeight}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
