import React, { useRef, useState, useCallback, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { 
  ZoomIn, ZoomOut, MousePointer2, Hand, Play, Square, Plus, Trash2, 
  RefreshCw, Eye, EyeOff, Maximize, RotateCcw, MoreVertical, X, Target,
  Keyboard, Copy, ArrowUp, ArrowDown, Search, HelpCircle, Download,
  Ruler, Grid3X3, Layers, Loader2, Book, ImageIcon, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { DevSyncIndicator } from "./DevSyncIndicator";
import { KeyboardShortcutsDialog } from "./KeyboardShortcutsDialog";
import { HelpPanel } from "./HelpPanel";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { SettingsDropdown } from "./SettingsDropdown";
import { CollaborationOverlay, CollaborationToolbarSection, CommentModeButton } from "./CollaborationOverlay";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { TransformHandles } from "./TransformHandles";
import { ObjectContextMenu } from "./ObjectContextMenu";
import { SVGObjectRenderer } from "./SVGObjectRenderer";
import { ExportDialog } from "./ExportDialog";
import { Rulers, RULER_SIZE, type Guide } from "./Rulers";
import { useKeyboardShortcuts, DEFAULT_SHORTCUTS, type ShortcutHandler } from "@/hooks/use-keyboard-shortcuts";
import { useSnapping, type ActiveGuide, type UserGuide } from "@/hooks/use-snapping";
import { toast } from "@/hooks/use-toast";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Screen, GameObject, Scene, ObjectState, Vocabulary } from "@shared/schema";
import { useOptionalTimelineContext } from "@/contexts/TimelineContext";
import { useOptionalHistoryContext } from "@/contexts/HistoryContext";
import type { WorkspacePreset } from "@/hooks/use-panel-state";
import { getObjectInteractions, type ObjectInteraction } from "./AttributeEditor";

gsap.registerPlugin(useGSAP);

interface GameCanvasProps {
  screen: Screen | null;
  objects: GameObject[];
  scenes: Scene[];
  currentScene: Scene | null;
  objectStates: ObjectState[];
  selectedObjectId: string | null;
  selectedObjectIds?: string[];
  isolatedObjectId: string | null;
  isPreviewMode: boolean;
  isLoading?: boolean;
  projectId?: string;
  viewportWidth?: number;
  viewportHeight?: number;
  isMobile?: boolean;
  isTablet?: boolean;
  activePreset?: WorkspacePreset | null;
  vocabulary?: Vocabulary[];
  onApplyPreset?: (preset: WorkspacePreset) => void;
  onResetPanels?: () => void;
  onSelectObject: (id: string | null, addToSelection?: boolean) => void;
  onSelectMultiple?: (ids: string[]) => void;
  onSelectAll?: () => void;
  onIsolateObject: (id: string | null) => void;
  onUpdateObject: (id: string, updates: Partial<GameObject>) => void;
  onCreateObject: (obj: Partial<GameObject>) => void;
  onDeleteObject: (id: string) => void;
  onTogglePreview: () => void;
  onSceneChange?: (sceneId: string) => void;
  onSyncLayers?: () => void;
  onProjectImported?: (projectId: string) => void;
  isObjectMasterComponent?: (objectId: string) => boolean;
  isObjectInstance?: (object: GameObject) => boolean;
  onCreateComponent?: () => void;
  onDetachInstance?: () => void;
  onResetOverrides?: () => void;
}

interface PointerState {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
}

interface GestureState {
  isPinching: boolean;
  initialDistance: number;
  initialZoom: number;
  initialPanX: number;
  initialPanY: number;
  midpointX: number;
  midpointY: number;
}

const MIN_ZOOM = 25;
const MAX_ZOOM = 400;
const ZOOM_PRESETS = [25, 50, 75, 100, 150, 200, 300, 400];
const IS_MAC = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
const CMD_KEY = IS_MAC ? "⌘" : "Ctrl+";
const TOUCH_HIT_AREA_PADDING = 16;
const LONG_PRESS_DURATION = 500;
const INERTIA_FRICTION = 0.92;
const INERTIA_MIN_VELOCITY = 0.5;
const ZOOM_SENSITIVITY = 0.01;

export function GameCanvas({
  screen,
  objects,
  scenes,
  currentScene,
  objectStates,
  selectedObjectId,
  selectedObjectIds = [],
  isolatedObjectId,
  isPreviewMode,
  isLoading = false,
  projectId,
  viewportWidth,
  viewportHeight,
  isMobile = false,
  isTablet = false,
  activePreset,
  vocabulary,
  onApplyPreset,
  onResetPanels,
  onSelectObject,
  onSelectMultiple,
  onSelectAll,
  onIsolateObject,
  onUpdateObject,
  onCreateObject,
  onDeleteObject,
  onTogglePreview,
  onSceneChange,
  onSyncLayers,
  onProjectImported,
  isObjectMasterComponent,
  isObjectInstance,
  onCreateComponent,
  onDetachInstance,
  onResetOverrides,
}: GameCanvasProps) {
  const [zoom, setZoom] = useState(100);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [tool, setTool] = useState<"select" | "directSelect" | "hand">("select");
  const [showLayerOutlines, setShowLayerOutlines] = useState(true);
  const [isOutlineMode, setIsOutlineMode] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showRulers, setShowRulers] = useState(true);
  const [showGuides, setShowGuides] = useState(true);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [isZoomMode, setIsZoomMode] = useState(false);
  const [zoomDragStart, setZoomDragStart] = useState<{ y: number; initialZoom: number } | null>(null);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(true);
  const [duplicateGhost, setDuplicateGhost] = useState<{ x: number; y: number } | null>(null);
  const ghostPositionRef = useRef<{ x: number; y: number } | null>(null);
  const altDragRef = useRef<{
    isAltHeld: boolean;
    originalObject: GameObject | null;
    originalPosition: { x: number; y: number } | null;
    hasDuplicated: boolean;
  }>({ isAltHeld: false, originalObject: null, originalPosition: null, hasDuplicated: false });
  
  const previousToolRef = useRef<"select" | "directSelect" | "hand">("select");
  
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasAreaRef = useRef<HTMLDivElement>(null);
  
  const timelineContext = useOptionalTimelineContext();
  
  useEffect(() => {
    if (timelineContext && containerRef.current) {
      timelineContext.registerCanvasRef(containerRef.current);
    }
    return () => {
      if (timelineContext) {
        timelineContext.registerCanvasRef(null);
      }
    };
  }, [timelineContext]);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
  // Local drag position for smooth dragging without API calls on every move
  const [localDragPosition, setLocalDragPosition] = useState<{ x: number; y: number } | null>(null);
  const dragIntentRef = useRef<{ objectId: string; startX: number; startY: number; hasMovedEnough: boolean } | null>(null);
  const DRAG_THRESHOLD = 3; // pixels before considering it a drag
  
  // Committed position holds the final drag position until mutation completes (prevents snap-back)
  const committedPositionRef = useRef<{ objectId: string; x: number; y: number } | null>(null);
  
  // Multi-select drag: stores offsets from primary drag object for each selected object
  // Map<objectId, { offsetX: number, offsetY: number, startX: number, startY: number }>
  const multiDragOffsetsRef = useRef<Map<string, { offsetX: number; offsetY: number; startX: number; startY: number }>>(new Map());
  
  // Committed positions for multi-select drag (prevents snap-back for all dragged objects)
  const multiCommittedPositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  // RAF-based position updates for smooth 60fps dragging
  const dragPositionRef = useRef<{ x: number; y: number } | null>(null);
  const rafIdRef = useRef<number | null>(null);
  
  // Transform preview for smooth scale/rotation during drag (visual only, commits on pointerup)
  const [transformingObjectId, setTransformingObjectId] = useState<string | null>(null);
  const [transformPreview, setTransformPreview] = useState<{
    width?: number;
    height?: number;
    x?: number;
    y?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
  } | null>(null);
  
  const history = useOptionalHistoryContext();
  
  const pointersRef = useRef<Map<number, PointerState>>(new Map());
  const gestureRef = useRef<GestureState>({
    isPinching: false,
    initialDistance: 0,
    initialZoom: 100,
    initialPanX: 0,
    initialPanY: 0,
    midpointX: 0,
    midpointY: 0,
  });
  
  const longPressTimerRef = useRef<number | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [touchFeedbackId, setTouchFeedbackId] = useState<string | null>(null);
  const [clipboard, setClipboard] = useState<GameObject | null>(null);
  
  const panVelocityRef = useRef({ vx: 0, vy: 0 });
  const lastPanTimeRef = useRef<number>(0);
  const inertiaRafRef = useRef<number | null>(null);
  
  // Marquee selection state
  const [isMarqueeSelecting, setIsMarqueeSelecting] = useState(false);
  const [marqueeStart, setMarqueeStart] = useState<{ x: number; y: number } | null>(null);
  const [marqueeEnd, setMarqueeEnd] = useState<{ x: number; y: number } | null>(null);
  
  // Snapping guides state
  const [activeGuides, setActiveGuides] = useState<ActiveGuide[]>([]);
  
  const lastClickRef = useRef<{ objectId: string; time: number } | null>(null);
  const DOUBLE_CLICK_THRESHOLD = 400;
  
  // Track when an object was just selected via pointer down to prevent canvas click from deselecting
  const justSelectedObjectRef = useRef<boolean>(false);

  const sortedObjects = useMemo(() => {
    return [...objects].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
  }, [objects]);

  const getObjectState = useCallback((objectId: string): Partial<ObjectState> => {
    if (!currentScene) return {};
    return objectStates.find(s => s.objectId === objectId) || {};
  }, [currentScene, objectStates]);

  const getEffectiveProps = useCallback((obj: GameObject) => {
    const state = getObjectState(obj.id);
    return {
      x: state.x ?? obj.x,
      y: state.y ?? obj.y,
      scaleX: state.scaleX ?? obj.scaleX ?? 1,
      scaleY: state.scaleY ?? obj.scaleY ?? 1,
      rotation: state.rotation ?? obj.rotation ?? 0,
      opacity: state.opacity ?? obj.opacity ?? 1,
      visible: state.visible ?? obj.visible ?? true,
    };
  }, [getObjectState]);

  const resolveBindings = useCallback((obj: GameObject) => {
    if (!isPreviewMode) return null;
    
    const resolved: { text?: string; imageUrl?: string; audioUrl?: string } = {};
    
    if (obj.dataKey) {
      if (obj.dataKey.startsWith('vocab:')) {
        const vocabId = obj.dataKey.replace('vocab:', '');
        const vocabItem = vocabulary?.find(v => v.id === vocabId);
        if (vocabItem) {
          resolved.text = vocabItem.word;
          if (vocabItem.imageUrl) resolved.imageUrl = vocabItem.imageUrl;
          if (vocabItem.audioUrl) resolved.audioUrl = vocabItem.audioUrl;
        }
      } else {
        resolved.text = obj.dataKey;
      }
    }
    
    if (obj.mediaUrl) resolved.imageUrl = obj.mediaUrl;
    if (obj.audioUrl) resolved.audioUrl = obj.audioUrl;
    
    return resolved;
  }, [isPreviewMode, vocabulary]);

  // Convert guides to UserGuide format for snapping hook
  const userGuides: UserGuide[] = useMemo(() => {
    return showGuides ? guides.map(g => ({
      id: g.id,
      orientation: g.orientation,
      position: g.position
    })) : [];
  }, [guides, showGuides]);

  // Snapping hook - computes snap candidates and applies snapping during drag
  const { applySnapping } = useSnapping(
    screen,
    objects,
    dragIntentRef.current?.objectId || null,
    selectedObjectIds,
    getEffectiveProps,
    userGuides
  );

  // Guide management handlers
  const handleCreateGuide = useCallback((orientation: "horizontal" | "vertical", position: number) => {
    const newGuide: Guide = {
      id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      orientation,
      position: Math.round(position),
    };
    setGuides(prev => [...prev, newGuide]);
    setSelectedGuideId(newGuide.id);
  }, []);

  const handleUpdateGuide = useCallback((id: string, position: number) => {
    setGuides(prev => prev.map(g => 
      g.id === id ? { ...g, position: Math.round(position) } : g
    ));
  }, []);

  const handleSelectGuide = useCallback((id: string | null) => {
    setSelectedGuideId(id);
    if (id) {
      onSelectObject(null);
    }
  }, [onSelectObject]);

  const handleDeleteGuide = useCallback((id: string) => {
    setGuides(prev => prev.filter(g => g.id !== id));
    if (selectedGuideId === id) {
      setSelectedGuideId(null);
    }
  }, [selectedGuideId]);

  const handleClearAllGuides = useCallback(() => {
    setGuides([]);
    setSelectedGuideId(null);
    toast({ title: "Guides cleared", description: "All guides have been removed" });
  }, []);

  const calculateFitZoom = useCallback(() => {
    if (!screen || !viewportWidth || !viewportHeight) return 100;
    const padding = 50;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = (viewportHeight - (isMobile ? 48 : 96)) - padding * 2;
    const scaleX = availableWidth / screen.width;
    const scaleY = availableHeight / screen.height;
    return Math.min(scaleX, scaleY, 1) * 100;
  }, [screen, viewportWidth, viewportHeight, isMobile]);

  useEffect(() => {
    if (screen && viewportWidth && viewportHeight) {
      const fitZoom = calculateFitZoom();
      setZoom(fitZoom);
      setPanX(0);
      setPanY(0);
    }
  }, [viewportWidth, viewportHeight, screen?.id]);

  useGSAP(() => {
    if (!containerRef.current) return;
    
    objects.forEach(obj => {
      // Skip GSAP animation for objects being dragged, transformed, or with pending committed positions
      // This prevents snap-back glitch where GSAP animates to old position before mutation completes
      const isBeingDraggedOrCommitted = 
        (isDragging && dragIntentRef.current?.objectId === obj.id) ||
        (isDragging && selectedObjectIds.includes(obj.id) && dragIntentRef.current?.objectId) ||
        committedPositionRef.current?.objectId === obj.id ||
        multiDragOffsetsRef.current.has(obj.id) ||
        multiCommittedPositionsRef.current.has(obj.id);
      
      // Skip GSAP for objects being transformed (scale/rotate) - let React inline styles handle it
      const isBeingTransformedByGsap = transformingObjectId === obj.id;
      
      if (isBeingDraggedOrCommitted || isBeingTransformedByGsap) {
        return; // Let React inline styles handle positioning
      }
      
      const props = getEffectiveProps(obj);
      const el = containerRef.current?.querySelector(`[data-object-id="${obj.id}"]`);
      if (el) {
        gsap.to(el, {
          x: props.x,
          y: props.y,
          scaleX: props.scaleX,
          scaleY: props.scaleY,
          rotation: props.rotation,
          opacity: props.opacity,
          display: props.visible ? "block" : "none",
          duration: isPreviewMode ? 0.3 : 0,
          ease: "power2.out",
        });
      }
    });
  }, { scope: containerRef, dependencies: [objects, objectStates, currentScene, isPreviewMode, isDragging, selectedObjectIds, transformingObjectId] });

  // Clear committed positions once the database has the new positions
  useEffect(() => {
    // Handle single-object committed position
    const committed = committedPositionRef.current;
    if (committed) {
      const obj = objects.find(o => o.id === committed.objectId);
      if (obj && Math.abs(obj.x - committed.x) < 1 && Math.abs(obj.y - committed.y) < 1) {
        // Database position matches committed position, safe to clear
        committedPositionRef.current = null;
      }
    }
    
    // Handle multi-select committed positions
    if (multiCommittedPositionsRef.current.size > 0) {
      const toRemove: string[] = [];
      multiCommittedPositionsRef.current.forEach((pos, objId) => {
        const obj = objects.find(o => o.id === objId);
        if (obj && Math.abs(obj.x - pos.x) < 1 && Math.abs(obj.y - pos.y) < 1) {
          toRemove.push(objId);
        }
      });
      toRemove.forEach(id => multiCommittedPositionsRef.current.delete(id));
    }
  }, [objects]);
  
  // Cleanup RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (inertiaRafRef.current) {
        cancelAnimationFrame(inertiaRafRef.current);
      }
    };
  }, []);

  const getDistance = (p1: PointerState, p2: PointerState) => {
    return Math.hypot(p2.x - p1.x, p2.y - p1.y);
  };

  const getMidpoint = (p1: PointerState, p2: PointerState) => {
    return {
      midpointX: (p1.x + p2.x) / 2,
      midpointY: (p1.y + p2.y) / 2,
    };
  };

  // Ref for storing current drag state to avoid stale closures in document listeners
  const dragStateRef = useRef<{
    isDragging: boolean;
    localDragPosition: { x: number; y: number } | null;
    selectedObjectId: string | null;
  }>({ isDragging: false, localDragPosition: null, selectedObjectId: null });

  // Keep refs in sync with state
  useEffect(() => {
    dragStateRef.current = { isDragging, localDragPosition, selectedObjectId };
  }, [isDragging, localDragPosition, selectedObjectId]);

  // Document-level drag handling for reliable event capture (works with programmatic events)
  useEffect(() => {
    const handleDocumentPointerMove = (e: PointerEvent) => {
      // Only process if we have a drag intent and it's being tracked
      let intent = dragIntentRef.current;
      
      // Fallback: if there's a tracked pointer and selectedObjectId but no dragIntent,
      // initialize it now (covers Layer-first selection + canvas drag scenarios)
      if (!intent && selectedObjectId && pointersRef.current.size === 1 && !isPanning && !isMarqueeSelecting) {
        const pointer = Array.from(pointersRef.current.values())[0];
        if (pointer) {
          intent = {
            objectId: selectedObjectId,
            startX: pointer.startX,
            startY: pointer.startY,
            hasMovedEnough: false,
          };
          dragIntentRef.current = intent;
          
          // Also set up dragStart for proper offset calculation
          const obj = objects.find(o => o.id === selectedObjectId);
          if (obj) {
            const props = getEffectiveProps(obj);
            const rect = canvasAreaRef.current?.getBoundingClientRect();
            if (rect) {
              const scale = zoom / 100;
              const objX = (pointer.startX - rect.left - panX) / scale;
              const objY = (pointer.startY - rect.top - panY) / scale;
              setDragStart({ x: objX - props.x, y: objY - props.y });
            }
          }
        }
      }
      
      if (!intent) return;
      
      // Check if we need to start dragging (threshold exceeded)
      if (!intent.hasMovedEnough) {
        const distance = Math.hypot(e.clientX - intent.startX, e.clientY - intent.startY);
        if (distance >= DRAG_THRESHOLD) {
          intent.hasMovedEnough = true;
          setIsDragging(true);
          
          // Initialize multi-select drag offsets for all selected objects
          if (selectedObjectIds.length > 1 && selectedObjectIds.includes(intent.objectId)) {
            const primaryObj = objects.find(o => o.id === intent.objectId);
            if (primaryObj) {
              const primaryProps = getEffectiveProps(primaryObj);
              multiDragOffsetsRef.current.clear();
              
              selectedObjectIds.forEach(objId => {
                if (objId !== intent.objectId) {
                  const obj = objects.find(o => o.id === objId);
                  if (obj) {
                    const objProps = getEffectiveProps(obj);
                    // Store offset relative to primary object
                    multiDragOffsetsRef.current.set(objId, {
                      offsetX: objProps.x - primaryProps.x,
                      offsetY: objProps.y - primaryProps.y,
                      startX: objProps.x,
                      startY: objProps.y,
                    });
                  }
                }
              });
            }
          }
        } else {
          return; // Not yet a drag
        }
      }

      // Process the drag movement
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;

      const scale = zoom / 100;
      const mouseX = (e.clientX - rect.left - panX) / scale;
      const mouseY = (e.clientY - rect.top - panY) / scale;

      const obj = objects.find(o => o.id === intent.objectId);
      if (!obj) return;

      const props = getEffectiveProps(obj);
      
      // Calculate new position
      let newX: number, newY: number;
      if (dragStart) {
        newX = mouseX - dragStart.x;
        newY = mouseY - dragStart.y;
      } else {
        newX = props.x + (e.clientX - intent.startX) / scale;
        newY = props.y + (e.clientY - intent.startY) / scale;
      }

      // Check for Alt key for duplication mode
      const isAltPressed = e.altKey;
      if (isAltPressed && !altDragRef.current.isAltHeld) {
        altDragRef.current.isAltHeld = true;
        setIsDuplicating(true);
        if (altDragRef.current.originalPosition) {
          setLocalDragPosition({
            x: altDragRef.current.originalPosition.x,
            y: altDragRef.current.originalPosition.y
          });
        }
      } else if (!isAltPressed && altDragRef.current.isAltHeld) {
        altDragRef.current.isAltHeld = false;
        setIsDuplicating(false);
        setDuplicateGhost(null);
        ghostPositionRef.current = null;
      }

      // Handle Alt-drag duplication or normal drag
      // Apply snapping to calculate final position
      const effectiveWidth = obj.width * Math.abs(props.scaleX);
      const effectiveHeight = obj.height * Math.abs(props.scaleY);
      
      const snapResult = applySnapping(newX, newY, effectiveWidth, effectiveHeight);
      const roundedX = Math.round(snapResult.x);
      const roundedY = Math.round(snapResult.y);
      
      // Update active guides for rendering (via RAF for smooth updates)
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(() => {
          rafIdRef.current = null;
          setActiveGuides(snapResult.activeGuides);
          
          if (altDragRef.current.isAltHeld && altDragRef.current.originalObject) {
            if (ghostPositionRef.current) {
              setDuplicateGhost(ghostPositionRef.current);
            }
          } else if (dragPositionRef.current) {
            setLocalDragPosition(dragPositionRef.current);
          }
        });
      }
      
      if (altDragRef.current.isAltHeld && altDragRef.current.originalObject) {
        const ghostPos = { x: roundedX, y: roundedY };
        ghostPositionRef.current = ghostPos;
      } else {
        // Store in ref for immediate access
        dragPositionRef.current = { x: roundedX, y: roundedY };
      }
    };

    const handleDocumentPointerUp = (e: PointerEvent) => {
      const intent = dragIntentRef.current;
      if (!intent) return;

      // Clean up pointer tracking
      pointersRef.current.delete(e.pointerId);

      // Create duplicate if Alt-drag was active
      const ghostPos = ghostPositionRef.current;
      if (altDragRef.current.isAltHeld && altDragRef.current.originalObject && ghostPos && screen) {
        const originalObj = altDragRef.current.originalObject;
        const effectiveProps = getEffectiveProps(originalObj);
        
        onCreateObject({
          screenId: screen.id,
          name: `${originalObj.name} copy`,
          type: originalObj.type,
          x: ghostPos.x,
          y: ghostPos.y,
          width: originalObj.width,
          height: originalObj.height,
          rotation: effectiveProps.rotation,
          scaleX: effectiveProps.scaleX,
          scaleY: effectiveProps.scaleY,
          opacity: effectiveProps.opacity,
          customId: originalObj.customId ? `${originalObj.customId}-copy` : undefined,
          classes: originalObj.classes,
          tags: originalObj.tags,
        });
        
        toast({ title: "Object duplicated", description: `Created copy of "${originalObj.name}"` });
      } else if (intent.hasMovedEnough && dragStateRef.current.localDragPosition && intent.objectId) {
        // Normal drag completed - save final position for primary object
        const finalX = dragStateRef.current.localDragPosition.x;
        const finalY = dragStateRef.current.localDragPosition.y;
        
        // Store committed position to prevent snap-back during mutation
        committedPositionRef.current = {
          objectId: intent.objectId,
          x: finalX,
          y: finalY
        };
        
        onUpdateObject(intent.objectId, { x: finalX, y: finalY });
        
        // Handle multi-select: update all other selected objects
        if (multiDragOffsetsRef.current.size > 0) {
          multiDragOffsetsRef.current.forEach((offset, objId) => {
            const newX = finalX + offset.offsetX;
            const newY = finalY + offset.offsetY;
            
            // Store committed positions for secondary objects
            multiCommittedPositionsRef.current.set(objId, { x: newX, y: newY });
            
            onUpdateObject(objId, { x: newX, y: newY });
          });
        }
      }

      // Reset drag state but committed positions persist until mutations complete
      setIsDragging(false);
      setIsPanning(false);
      setIsDuplicating(false);
      setDuplicateGhost(null);
      setLocalDragPosition(null);
      setActiveGuides([]); // Clear snap guides on drag end
      dragPositionRef.current = null;
      ghostPositionRef.current = null;
      dragIntentRef.current = null;
      multiDragOffsetsRef.current.clear();
      
      // Cancel any pending RAF
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      
      altDragRef.current = {
        isAltHeld: false,
        originalObject: null,
        originalPosition: null,
        hasDuplicated: false,
      };
    };

    // Add document-level listeners for reliable drag capture
    document.addEventListener('pointermove', handleDocumentPointerMove);
    document.addEventListener('pointerup', handleDocumentPointerUp);

    return () => {
      document.removeEventListener('pointermove', handleDocumentPointerMove);
      document.removeEventListener('pointerup', handleDocumentPointerUp);
    };
  }, [zoom, panX, panY, objects, dragStart, getEffectiveProps, screen, onCreateObject, onUpdateObject, selectedObjectId, selectedObjectIds, isPanning, isMarqueeSelecting, applySnapping]);

  // Convert screen coordinates to canvas-relative coordinates
  // Uses canvasRef bounding rect which already accounts for all transforms
  const screenToCanvas = useCallback((clientX: number, clientY: number) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect || !screen) return { x: 0, y: 0 };
    
    const scale = zoom / 100;
    
    // The bounding rect is in screen space (already scaled)
    // Divide by scale to get local canvas coordinates
    const x = (clientX - rect.left) / scale;
    const y = (clientY - rect.top) / scale;
    
    return { x, y };
  }, [zoom, screen]);

  // Find objects within a marquee rectangle
  const getObjectsInMarquee = useCallback((start: { x: number; y: number }, end: { x: number; y: number }) => {
    const minX = Math.min(start.x, end.x);
    const maxX = Math.max(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    
    return objects.filter(obj => {
      const props = getEffectiveProps(obj);
      if (!props.visible) return false;
      
      // Account for scaling when computing effective dimensions
      // Use absolute values to handle flipped objects (negative scale)
      const effectiveWidth = obj.width * Math.abs(props.scaleX);
      const effectiveHeight = obj.height * Math.abs(props.scaleY);
      
      // Adjust position for flipped objects (negative scale shifts origin)
      const objLeft = props.scaleX < 0 ? props.x - effectiveWidth : props.x;
      const objTop = props.scaleY < 0 ? props.y - effectiveHeight : props.y;
      const objRight = objLeft + effectiveWidth;
      const objBottom = objTop + effectiveHeight;
      
      // Intersection check (axis-aligned bounding box)
      return objLeft < maxX && objRight > minX && objTop < maxY && objBottom > minY;
    });
  }, [objects, getEffectiveProps]);

  // Find all objects at a given point, useful for Direct Selection drilling
  const getObjectsAtPoint = useCallback((x: number, y: number) => {
    return objects.filter(obj => {
      const props = getEffectiveProps(obj);
      if (!props.visible) return false;
      
      const effectiveWidth = obj.width * Math.abs(props.scaleX);
      const effectiveHeight = obj.height * Math.abs(props.scaleY);
      
      const objLeft = props.scaleX < 0 ? props.x - effectiveWidth : props.x;
      const objTop = props.scaleY < 0 ? props.y - effectiveHeight : props.y;
      const objRight = objLeft + effectiveWidth;
      const objBottom = objTop + effectiveHeight;
      
      return x >= objLeft && x <= objRight && y >= objTop && y <= objBottom;
    });
  }, [objects, getEffectiveProps]);

  // For Direct Selection: get the smallest (most nested) object at a point
  // For Selection: get the topmost object by zIndex
  const getBestObjectAtPoint = useCallback((x: number, y: number, preferSmallest: boolean) => {
    const objectsAtPoint = getObjectsAtPoint(x, y);
    if (objectsAtPoint.length === 0) return null;
    
    if (preferSmallest) {
      // Direct Selection: prefer smaller objects (more likely to be nested children)
      return objectsAtPoint.reduce((smallest, obj) => {
        const smallestArea = smallest.width * smallest.height * 
          Math.abs(getEffectiveProps(smallest).scaleX) * Math.abs(getEffectiveProps(smallest).scaleY);
        const objArea = obj.width * obj.height * 
          Math.abs(getEffectiveProps(obj).scaleX) * Math.abs(getEffectiveProps(obj).scaleY);
        return objArea < smallestArea ? obj : smallest;
      });
    } else {
      // Selection: prefer topmost by zIndex
      return objectsAtPoint.reduce((topmost, obj) => {
        return (obj.zIndex ?? 0) > (topmost.zIndex ?? 0) ? obj : topmost;
      });
    }
  }, [getObjectsAtPoint, getEffectiveProps]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    
    const pointer: PointerState = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    };
    pointersRef.current.set(e.pointerId, pointer);

    if (pointersRef.current.size === 2) {
      const pointers = Array.from(pointersRef.current.values());
      gestureRef.current = {
        isPinching: true,
        initialDistance: getDistance(pointers[0], pointers[1]),
        initialZoom: zoom,
        initialPanX: panX,
        initialPanY: panY,
        ...getMidpoint(pointers[0], pointers[1]),
      };
      clearLongPressTimer();
    } else if (pointersRef.current.size === 1) {
      if (tool === "hand" || e.button === 1) {
        setIsPanning(true);
        setPanStart({ x: panX - e.clientX, y: panY - e.clientY });
      } else if ((tool === "select" || tool === "directSelect") && !isPreviewMode) {
        // Start marquee selection on canvas background (when not clicking on an object)
        const target = e.target as HTMLElement;
        const isOnObject = target.closest('[data-object-id]');
        if (!isOnObject) {
          const canvasPos = screenToCanvas(e.clientX, e.clientY);
          setIsMarqueeSelecting(true);
          setMarqueeStart(canvasPos);
          setMarqueeEnd(canvasPos);
        }
      }
    }
  }, [tool, zoom, panX, panY, isPreviewMode, screenToCanvas]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const pointer = pointersRef.current.get(e.pointerId);
    if (!pointer) return;

    pointer.x = e.clientX;
    pointer.y = e.clientY;

    if (pointersRef.current.size === 2 && gestureRef.current.isPinching) {
      const pointers = Array.from(pointersRef.current.values());
      const currentDistance = getDistance(pointers[0], pointers[1]);
      const currentMidpoint = getMidpoint(pointers[0], pointers[1]);
      
      const scaleFactor = currentDistance / gestureRef.current.initialDistance;
      let newZoom = gestureRef.current.initialZoom * scaleFactor;
      newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
      
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (rect) {
        const zoomRatio = newZoom / gestureRef.current.initialZoom;
        const midX = currentMidpoint.midpointX - rect.left;
        const midY = currentMidpoint.midpointY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const offsetX = midX - centerX;
        const offsetY = midY - centerY;
        
        const deltaX = currentMidpoint.midpointX - gestureRef.current.midpointX;
        const deltaY = currentMidpoint.midpointY - gestureRef.current.midpointY;
        
        const newPanX = gestureRef.current.initialPanX + deltaX - offsetX * (zoomRatio - 1);
        const newPanY = gestureRef.current.initialPanY + deltaY - offsetY * (zoomRatio - 1);
        
        setZoom(newZoom);
        setPanX(newPanX);
        setPanY(newPanY);
      } else {
        const deltaX = currentMidpoint.midpointX - gestureRef.current.midpointX;
        const deltaY = currentMidpoint.midpointY - gestureRef.current.midpointY;
        setZoom(newZoom);
        setPanX(gestureRef.current.initialPanX + deltaX);
        setPanY(gestureRef.current.initialPanY + deltaY);
      }
    } else if (isPanning && pointersRef.current.size === 1) {
      const now = performance.now();
      const dt = Math.max(1, now - lastPanTimeRef.current);
      const newPanX = e.clientX + panStart.x;
      const newPanY = e.clientY + panStart.y;
      
      panVelocityRef.current = {
        vx: (newPanX - panX) / dt * 16,
        vy: (newPanY - panY) / dt * 16,
      };
      lastPanTimeRef.current = now;
      
      setPanX(newPanX);
      setPanY(newPanY);
    } else if (selectedObjectId && pointersRef.current.size === 1 && dragIntentRef.current) {
      // Check if we have a drag intent that hasn't started yet
      if (!dragIntentRef.current.hasMovedEnough) {
        const distance = Math.hypot(
          e.clientX - dragIntentRef.current.startX,
          e.clientY - dragIntentRef.current.startY
        );
        if (distance >= DRAG_THRESHOLD) {
          // User has moved enough - this is now a drag, not a click
          dragIntentRef.current.hasMovedEnough = true;
          setIsDragging(true);
          // Continue to process this first drag move below (don't return)
        } else {
          // Not moved enough yet - still could be a click
          return;
        }
      }
      
      // Process drag movement if hasMovedEnough is true (use ref, not state, for immediate check)
      if (!dragIntentRef.current.hasMovedEnough) return;
      
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const scale = zoom / 100;
      const newX = (e.clientX - rect.left - panX) / scale - dragStart.x;
      const newY = (e.clientY - rect.top - panY) / scale - dragStart.y;
      
      // Dynamically track Alt key state during drag (allows pressing Alt mid-drag)
      const isAltPressed = e.altKey;
      
      // Update Alt state if it changed mid-drag
      if (isAltPressed && !altDragRef.current.isAltHeld && altDragRef.current.originalObject) {
        altDragRef.current.isAltHeld = true;
        setIsDuplicating(true);
        // Initialize ghost at current position when Alt is pressed mid-drag
        const ghostPos = { x: Math.round(newX), y: Math.round(newY) };
        setDuplicateGhost(ghostPos);
        ghostPositionRef.current = ghostPos;
        
        // Reset local drag position to original when Alt is pressed mid-drag
        if (altDragRef.current.originalPosition) {
          setLocalDragPosition({
            x: altDragRef.current.originalPosition.x,
            y: altDragRef.current.originalPosition.y
          });
        }
      } else if (!isAltPressed && altDragRef.current.isAltHeld) {
        // Alt was released mid-drag - cancel duplication mode
        altDragRef.current.isAltHeld = false;
        setIsDuplicating(false);
        setDuplicateGhost(null);
        ghostPositionRef.current = null;
      }
      
      // Handle Alt-drag duplication: show ghost at drag position, keep original in place
      if (altDragRef.current.isAltHeld && altDragRef.current.originalObject) {
        // Update ghost position (duplicate preview) without moving the original
        const ghostPos = { x: Math.round(newX), y: Math.round(newY) };
        setDuplicateGhost(ghostPos);
        ghostPositionRef.current = ghostPos;
      } else {
        // Normal drag: update LOCAL position only (no API calls during drag!)
        // Apply snapping to the drag position
        const draggedObj = objects.find(o => o.id === selectedObjectId);
        const objWidth = draggedObj?.width ?? 100;
        const objHeight = draggedObj?.height ?? 100;
        const snappedResult = applySnapping(
          Math.round(newX),
          Math.round(newY),
          objWidth,
          objHeight
        );
        setLocalDragPosition({ x: snappedResult.x, y: snappedResult.y });
        setActiveGuides(snappedResult.activeGuides);
      }
    } else if (isMarqueeSelecting && pointersRef.current.size === 1) {
      // Update marquee selection rectangle
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      setMarqueeEnd(canvasPos);
    }
  }, [isPanning, isDragging, isMarqueeSelecting, selectedObjectId, panStart, dragStart, zoom, panX, panY, onUpdateObject, screenToCanvas, applySnapping]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    pointersRef.current.delete(e.pointerId);
    
    if (pointersRef.current.size < 2) {
      gestureRef.current.isPinching = false;
    }
    
    if (pointersRef.current.size === 0) {
      // Create duplicate at ghost position if Alt-drag was active - use ref for immediate access
      const ghostPos = ghostPositionRef.current;
      if (altDragRef.current.isAltHeld && altDragRef.current.originalObject && ghostPos && screen) {
        const originalObj = altDragRef.current.originalObject;
        const effectiveProps = getEffectiveProps(originalObj);
        
        // Use effective props (scene-specific) for dimensions and transformations
        onCreateObject({
          screenId: screen.id,
          name: `${originalObj.name} copy`,
          type: originalObj.type,
          x: ghostPos.x,
          y: ghostPos.y,
          width: originalObj.width,
          height: originalObj.height,
          rotation: effectiveProps.rotation,
          scaleX: effectiveProps.scaleX,
          scaleY: effectiveProps.scaleY,
          opacity: effectiveProps.opacity,
          customId: originalObj.customId ? `${originalObj.customId}-copy` : undefined,
          classes: originalObj.classes,
          tags: originalObj.tags,
        });
        
        toast({ title: "Object duplicated", description: `Created copy of "${originalObj.name}"` });
      } else if (isDragging && localDragPosition && selectedObjectId) {
        // Normal drag completed - save final position to database
        const finalX = localDragPosition.x;
        const finalY = localDragPosition.y;
        
        // Get the object to find its original position and name
        const obj = objects.find(o => o.id === selectedObjectId);
        const originalX = obj?.x ?? 0;
        const originalY = obj?.y ?? 0;
        
        // Store committed position to prevent snap-back during mutation
        committedPositionRef.current = {
          objectId: selectedObjectId,
          x: finalX,
          y: finalY
        };
        
        onUpdateObject(selectedObjectId, { x: finalX, y: finalY });
        
        // Record history for the move operation
        if (obj && (finalX !== originalX || finalY !== originalY)) {
          history?.recordMove([obj], [{ id: obj.id, x: originalX, y: originalY }]);
        }
        
        // Handle multi-select: update all other selected objects
        if (multiDragOffsetsRef.current.size > 0) {
          multiDragOffsetsRef.current.forEach((offset, objId) => {
            const newX = finalX + offset.offsetX;
            const newY = finalY + offset.offsetY;
            
            // Store committed positions for secondary objects
            multiCommittedPositionsRef.current.set(objId, { x: newX, y: newY });
            
            onUpdateObject(objId, { x: newX, y: newY });
          });
        }
      }
      
      const wasPanning = isPanning;
      
      setIsDragging(false);
      setIsPanning(false);
      setIsDuplicating(false);
      setDuplicateGhost(null);
      setLocalDragPosition(null);
      setActiveGuides([]); // Clear snap guides on drag end
      ghostPositionRef.current = null;
      dragIntentRef.current = null;
      multiDragOffsetsRef.current.clear();
      
      if (wasPanning) {
        const { vx, vy } = panVelocityRef.current;
        const totalVelocity = Math.hypot(vx, vy);
        
        if (totalVelocity > INERTIA_MIN_VELOCITY * 2) {
          let currentVx = vx;
          let currentVy = vy;
          
          const animateInertia = () => {
            currentVx *= INERTIA_FRICTION;
            currentVy *= INERTIA_FRICTION;
            
            if (Math.hypot(currentVx, currentVy) < INERTIA_MIN_VELOCITY) {
              inertiaRafRef.current = null;
              return;
            }
            
            setPanX(x => x + currentVx);
            setPanY(y => y + currentVy);
            
            inertiaRafRef.current = requestAnimationFrame(animateInertia);
          };
          
          inertiaRafRef.current = requestAnimationFrame(animateInertia);
        }
      }
      
      panVelocityRef.current = { vx: 0, vy: 0 };
      
      // Complete marquee selection
      if (isMarqueeSelecting && marqueeStart && marqueeEnd) {
        const objectsInMarquee = getObjectsInMarquee(marqueeStart, marqueeEnd);
        if (objectsInMarquee.length > 0) {
          // Use bulk selection if available (more reliable)
          if (onSelectMultiple) {
            onSelectMultiple(objectsInMarquee.map(obj => obj.id));
          } else {
            // Fallback: select one by one
            objectsInMarquee.forEach((obj, index) => {
              onSelectObject(obj.id, index > 0);
            });
          }
        } else {
          // No objects in marquee - deselect all
          onSelectObject(null);
        }
      }
      
      // Reset marquee selection state
      setIsMarqueeSelecting(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
      
      // Reset Alt-drag state
      altDragRef.current = {
        isAltHeld: false,
        originalObject: null,
        originalPosition: null,
        hasDuplicated: false,
      };
    }
    
    clearLongPressTimer();
  }, [screen, onCreateObject, getEffectiveProps, isMarqueeSelecting, marqueeStart, marqueeEnd, getObjectsInMarquee, onSelectObject, onSelectMultiple, isDragging, localDragPosition, selectedObjectId, onUpdateObject, objects, history]);

  const clearLongPressTimer = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleObjectPointerDown = useCallback((e: React.PointerEvent, obj: GameObject) => {
    if ((tool !== "select" && tool !== "directSelect") || isPreviewMode) return;
    
    // Stop propagation first to prevent canvas click handler from firing
    e.stopPropagation();
    
    // Don't allow selection or dragging of locked objects
    if (obj.locked) return;
    
    // Set pointer capture on the canvas area and track pointer for move events
    // This is needed because stopPropagation prevents handlePointerDown from firing
    const canvasArea = canvasAreaRef.current;
    if (canvasArea) {
      canvasArea.setPointerCapture(e.pointerId);
    }
    
    // Register pointer for tracking in handlePointerMove
    const pointer: PointerState = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX,
      startY: e.clientY,
    };
    pointersRef.current.set(e.pointerId, pointer);
    
    // Get canvas coordinates for Direct Selection drilling
    const canvasPos = screenToCanvas(e.clientX, e.clientY);
    
    // For Direct Selection tool, find the smallest object at click point
    // This allows drilling into nested/overlapping objects
    let targetObj = obj;
    if (tool === "directSelect") {
      const bestObject = getBestObjectAtPoint(canvasPos.x, canvasPos.y, true);
      if (bestObject) {
        targetObj = bestObject;
      }
    }
    
    const now = Date.now();
    const lastClick = lastClickRef.current;
    
    if (lastClick && lastClick.objectId === targetObj.id && now - lastClick.time < DOUBLE_CLICK_THRESHOLD) {
      onIsolateObject(targetObj.id);
      lastClickRef.current = null;
      return;
    }
    
    lastClickRef.current = { objectId: targetObj.id, time: now };
    
    // Shift+click toggles object in multi-selection
    onSelectObject(targetObj.id, e.shiftKey);
    
    // Mark that we just selected an object - prevents canvas click handler from deselecting
    // This is needed because pointer capture redirects click events to the canvas
    justSelectedObjectRef.current = true;
    
    setTouchFeedbackId(targetObj.id);
    setTimeout(() => setTouchFeedbackId(null), 200);
    
    const rect = canvasAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const scale = zoom / 100;
    const objX = (e.clientX - rect.left - panX) / scale;
    const objY = (e.clientY - rect.top - panY) / scale;
    const props = getEffectiveProps(targetObj);
    
    // Track Alt key state for Alt-drag duplication
    // Store the original object and position regardless of Alt state - Alt can be pressed mid-drag
    altDragRef.current = {
      isAltHeld: e.altKey,
      originalObject: targetObj,
      originalPosition: { x: props.x, y: props.y },
      hasDuplicated: false,
    };
    
    if (e.altKey) {
      setIsDuplicating(true);
      // Initialize ghost at current position when Alt is held from start
      const ghostPos = { x: props.x, y: props.y };
      setDuplicateGhost(ghostPos);
      ghostPositionRef.current = ghostPos;
    }
    
    // Don't set isDragging immediately - use drag intent to detect actual drag vs click
    // isDragging will be set in handlePointerMove once mouse moves past threshold
    dragIntentRef.current = {
      objectId: targetObj.id,
      startX: e.clientX,
      startY: e.clientY,
      hasMovedEnough: false,
    };
    setDragStart({ x: objX - props.x, y: objY - props.y });

    if (isMobile || isTablet) {
      longPressTimerRef.current = window.setTimeout(() => {
        setContextMenuPos({ x: e.clientX, y: e.clientY });
      }, LONG_PRESS_DURATION);
    }
  }, [tool, isPreviewMode, zoom, panX, panY, onSelectObject, onIsolateObject, getEffectiveProps, isMobile, isTablet, screenToCanvas, getBestObjectAtPoint]);

  const handleObjectPointerMove = useCallback((e: React.PointerEvent) => {
    if (longPressTimerRef.current) {
      const pointer = pointersRef.current.get(e.pointerId);
      if (pointer) {
        const distance = Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY);
        if (distance > 10) {
          clearLongPressTimer();
        }
      }
    }
  }, []);

  const handleObjectPointerUp = useCallback(() => {
    clearLongPressTimer();
    setTouchFeedbackId(null);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Skip deselection if we just selected an object via pointer down
    // Pointer capture causes click events to fire on canvas instead of the object
    if (justSelectedObjectRef.current) {
      justSelectedObjectRef.current = false;
      setContextMenuPos(null);
      return;
    }
    
    if (!isDragging && !isPanning && pointersRef.current.size === 0) {
      if (isolatedObjectId) {
        onIsolateObject(null);
      }
      onSelectObject(null);
    }
    setContextMenuPos(null);
  }, [isDragging, isPanning, onSelectObject, onIsolateObject, isolatedObjectId]);
  
  const handleAddObject = useCallback(() => {
    if (!screen) return;
    onCreateObject({
      screenId: screen.id,
      name: `Object ${objects.length + 1}`,
      type: "shape",
      x: 50,
      y: 50,
      width: 100,
      height: 100,
    });
  }, [screen, objects.length, onCreateObject]);

  const handleContextMenu = useCallback((e: React.MouseEvent, obj: GameObject) => {
    if (isPreviewMode) return;
    e.preventDefault();
    e.stopPropagation();
    onSelectObject(obj.id);
    setContextMenuPos({ x: e.clientX, y: e.clientY });
  }, [isPreviewMode, onSelectObject]);

  const handleScale = useCallback((objectId: string, scaleX: number, scaleY: number, newWidth?: number, newHeight?: number, deltaX?: number, deltaY?: number) => {
    const obj = objects.find(o => o.id === objectId);
    if (!obj || obj.locked) return;
    
    const updates: Partial<GameObject> = {};
    
    if (newWidth !== undefined && newHeight !== undefined) {
      updates.width = Math.round(newWidth);
      updates.height = Math.round(newHeight);
    }
    
    if (deltaX !== undefined && deltaY !== undefined) {
      const props = getEffectiveProps(obj);
      updates.x = Math.round(props.x + deltaX);
      updates.y = Math.round(props.y + deltaY);
    }
    
    onUpdateObject(objectId, updates);
  }, [objects, getEffectiveProps, onUpdateObject]);

  const handleRotate = useCallback((objectId: string, rotation: number) => {
    const obj = objects.find(o => o.id === objectId);
    if (!obj || obj.locked) return;
    onUpdateObject(objectId, { rotation: Math.round(rotation) });
  }, [objects, onUpdateObject]);

  const handleToggleVisibility = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    const props = getEffectiveProps(obj);
    onUpdateObject(selectedObjectId, { visible: !props.visible });
  }, [selectedObjectId, objects, getEffectiveProps, onUpdateObject]);

  const handleResetTransform = useCallback(() => {
    if (!selectedObjectId) return;
    onUpdateObject(selectedObjectId, {
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    });
    toast({ title: "Transform reset", description: "Rotation and scale reset to defaults" });
  }, [selectedObjectId, onUpdateObject]);

  const handleEditProperties = useCallback(() => {
    toast({ title: "Edit Properties", description: "Use the Attributes panel on the right to edit properties" });
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(MAX_ZOOM, z + 25));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(MIN_ZOOM, z - 25));
  }, []);

  const handleZoomToPreset = useCallback((preset: number) => {
    setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, preset)));
  }, []);

  const handleZoomToSelection = useCallback(() => {
    if (selectedObjectIds.length === 0 && !selectedObjectId) {
      toast({ title: "No selection", description: "Select one or more objects to zoom to" });
      return;
    }

    const objectsToZoom = selectedObjectIds.length > 0 
      ? objects.filter(o => selectedObjectIds.includes(o.id))
      : selectedObjectId 
        ? objects.filter(o => o.id === selectedObjectId)
        : [];

    if (objectsToZoom.length === 0) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    objectsToZoom.forEach(obj => {
      const props = getEffectiveProps(obj);
      const effectiveWidth = obj.width * Math.abs(props.scaleX);
      const effectiveHeight = obj.height * Math.abs(props.scaleY);
      minX = Math.min(minX, props.x);
      minY = Math.min(minY, props.y);
      maxX = Math.max(maxX, props.x + effectiveWidth);
      maxY = Math.max(maxY, props.y + effectiveHeight);
    });

    const selectionWidth = maxX - minX;
    const selectionHeight = maxY - minY;
    const selectionCenterX = minX + selectionWidth / 2;
    const selectionCenterY = minY + selectionHeight / 2;

    if (!viewportWidth || !viewportHeight || !screen) return;

    const padding = 100;
    const availableWidth = viewportWidth - padding * 2;
    const availableHeight = (viewportHeight - (isMobile ? 48 : 96)) - padding * 2;
    
    const scaleX = availableWidth / selectionWidth;
    const scaleY = availableHeight / selectionHeight;
    const newZoom = Math.min(scaleX, scaleY, MAX_ZOOM / 100) * 100;
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    
    const scale = clampedZoom / 100;
    const screenCenterX = screen.width / 2;
    const screenCenterY = screen.height / 2;
    const offsetX = (screenCenterX - selectionCenterX) * scale;
    const offsetY = (screenCenterY - selectionCenterY) * scale;
    
    setZoom(clampedZoom);
    setPanX(offsetX);
    setPanY(offsetY);
    
    toast({ 
      title: "Zoomed to selection", 
      description: `${objectsToZoom.length} object${objectsToZoom.length > 1 ? 's' : ''} in view at ${Math.round(clampedZoom)}%` 
    });
  }, [selectedObjectIds, selectedObjectId, objects, getEffectiveProps, viewportWidth, viewportHeight, screen, isMobile]);

  const handleFitToScreen = useCallback(() => {
    const fitZoom = calculateFitZoom();
    setZoom(fitZoom);
    setPanX(0);
    setPanY(0);
  }, [calculateFitZoom]);

  const handleResetZoom = useCallback(() => {
    setZoom(100);
    setPanX(0);
    setPanY(0);
  }, []);

  const handleDuplicate = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    
    const props = getEffectiveProps(obj);
    onCreateObject({
      screenId: screen.id,
      name: `${obj.name} copy`,
      type: obj.type,
      x: props.x + 20,
      y: props.y + 20,
      width: obj.width,
      height: obj.height,
      customId: obj.customId ? `${obj.customId}-copy` : undefined,
      classes: obj.classes,
      tags: obj.tags,
    });
    
    toast({ title: "Object duplicated", description: `Created copy of "${obj.name}"` });
  }, [selectedObjectId, screen, objects, getEffectiveProps, onCreateObject]);

  const handleBringForward = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    
    const sorted = [...objects].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    const currentIndex = sorted.findIndex(o => o.id === selectedObjectId);
    
    if (currentIndex < sorted.length - 1) {
      const nextObj = sorted[currentIndex + 1];
      const newZIndex = (nextObj.zIndex ?? 0) + 1;
      const previousObj = { ...obj };
      onUpdateObject(selectedObjectId, { zIndex: newZIndex });
      history?.recordZOrderChange([{ ...obj, zIndex: newZIndex }], [previousObj]);
      toast({ title: "Brought forward", description: `"${obj.name}" moved up one layer` });
    } else {
      toast({ title: "Already at front", description: `"${obj.name}" is already at the top` });
    }
  }, [selectedObjectId, objects, onUpdateObject, history]);

  const handleSendBackward = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    
    const sorted = [...objects].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    const currentIndex = sorted.findIndex(o => o.id === selectedObjectId);
    
    if (currentIndex > 0) {
      const prevObj = sorted[currentIndex - 1];
      const newZIndex = (prevObj.zIndex ?? 0) - 1;
      const previousObj = { ...obj };
      onUpdateObject(selectedObjectId, { zIndex: newZIndex });
      history?.recordZOrderChange([{ ...obj, zIndex: newZIndex }], [previousObj]);
      toast({ title: "Sent backward", description: `"${obj.name}" moved down one layer` });
    } else {
      toast({ title: "Already at back", description: `"${obj.name}" is already at the bottom` });
    }
  }, [selectedObjectId, objects, onUpdateObject, history]);

  const handleBringToFront = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    
    const maxZIndex = Math.max(...objects.map(o => o.zIndex ?? 0));
    if ((obj.zIndex ?? 0) === maxZIndex) {
      toast({ title: "Already at front", description: `"${obj.name}" is already at the top` });
      return;
    }
    const newZIndex = maxZIndex + 1;
    const previousObj = { ...obj };
    onUpdateObject(selectedObjectId, { zIndex: newZIndex });
    history?.recordZOrderChange([{ ...obj, zIndex: newZIndex }], [previousObj]);
    toast({ title: "Brought to front", description: `"${obj.name}" is now at the top` });
  }, [selectedObjectId, objects, onUpdateObject, history]);

  const handleSendToBack = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    
    const minZIndex = Math.min(...objects.map(o => o.zIndex ?? 0));
    if ((obj.zIndex ?? 0) === minZIndex) {
      toast({ title: "Already at back", description: `"${obj.name}" is already at the bottom` });
      return;
    }
    const newZIndex = minZIndex - 1;
    const previousObj = { ...obj };
    onUpdateObject(selectedObjectId, { zIndex: newZIndex });
    history?.recordZOrderChange([{ ...obj, zIndex: newZIndex }], [previousObj]);
    toast({ title: "Sent to back", description: `"${obj.name}" is now at the bottom` });
  }, [selectedObjectId, objects, onUpdateObject, history]);

  const handleUndo = useCallback(() => {
    if (!history) {
      toast({ title: "History not available" });
      return;
    }
    const entry = history.undo();
    if (!entry) {
      toast({ title: "Nothing to undo" });
      return;
    }
    
    // Apply the previous snapshot to restore state
    if (entry.previousSnapshot && entry.affectedObjectIds.length > 0) {
      entry.previousSnapshot.forEach((snapshot, index) => {
        const objectId = entry.affectedObjectIds[index];
        if (objectId) {
          onUpdateObject(objectId, {
            x: snapshot.x,
            y: snapshot.y,
            width: snapshot.width,
            height: snapshot.height,
            rotation: snapshot.rotation,
            scaleX: snapshot.scaleX,
            scaleY: snapshot.scaleY,
            opacity: snapshot.opacity,
            visible: snapshot.visible,
            zIndex: snapshot.zIndex,
            locked: snapshot.locked,
          });
        }
      });
    }
    toast({ title: "Undone", description: entry.actionName });
  }, [history, onUpdateObject]);

  const handleRedo = useCallback(() => {
    if (!history) {
      toast({ title: "History not available" });
      return;
    }
    const entry = history.redo();
    if (!entry) {
      toast({ title: "Nothing to redo" });
      return;
    }
    
    // Apply the snapshot to restore state
    if (entry.snapshot && entry.affectedObjectIds.length > 0) {
      entry.snapshot.forEach((snapshot, index) => {
        const objectId = entry.affectedObjectIds[index];
        if (objectId) {
          onUpdateObject(objectId, {
            x: snapshot.x,
            y: snapshot.y,
            width: snapshot.width,
            height: snapshot.height,
            rotation: snapshot.rotation,
            scaleX: snapshot.scaleX,
            scaleY: snapshot.scaleY,
            opacity: snapshot.opacity,
            visible: snapshot.visible,
            zIndex: snapshot.zIndex,
            locked: snapshot.locked,
          });
        }
      });
    }
    toast({ title: "Redone", description: entry.actionName });
  }, [history, onUpdateObject]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedGuideId) {
      handleDeleteGuide(selectedGuideId);
      return;
    }
    if (selectedObjectId) {
      onDeleteObject(selectedObjectId);
    }
  }, [selectedObjectId, selectedGuideId, onDeleteObject, handleDeleteGuide]);

  const handleCopy = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    setClipboard(obj);
    toast({ title: "Copied", description: `"${obj.name}" copied to clipboard` });
  }, [selectedObjectId, objects]);

  const handlePaste = useCallback(() => {
    if (!clipboard || !screen) return;
    const props = getEffectiveProps(clipboard);
    onCreateObject({
      screenId: screen.id,
      name: `${clipboard.name} copy`,
      type: clipboard.type,
      x: props.x + 30,
      y: props.y + 30,
      width: clipboard.width,
      height: clipboard.height,
      customId: clipboard.customId ? `${clipboard.customId}-copy` : undefined,
      classes: clipboard.classes,
      tags: clipboard.tags,
    });
    toast({ title: "Pasted", description: `Created copy of "${clipboard.name}"` });
  }, [clipboard, screen, getEffectiveProps, onCreateObject]);

  const handleFlipHorizontal = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    const props = getEffectiveProps(obj);
    onUpdateObject(selectedObjectId, { scaleX: -props.scaleX });
    toast({ title: "Flipped horizontally" });
  }, [selectedObjectId, objects, getEffectiveProps, onUpdateObject]);

  const handleFlipVertical = useCallback(() => {
    if (!selectedObjectId) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    const props = getEffectiveProps(obj);
    onUpdateObject(selectedObjectId, { scaleY: -props.scaleY });
    toast({ title: "Flipped vertically" });
  }, [selectedObjectId, objects, getEffectiveProps, onUpdateObject]);

  const handleRename = useCallback((newName: string) => {
    if (!selectedObjectId) return;
    onUpdateObject(selectedObjectId, { name: newName });
    toast({ title: "Renamed", description: `Object renamed to "${newName}"` });
  }, [selectedObjectId, onUpdateObject]);

  const handleAlignLeft = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    onUpdateObject(selectedObjectId, { x: 0 });
  }, [selectedObjectId, screen, onUpdateObject]);

  const handleAlignCenter = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    onUpdateObject(selectedObjectId, { x: Math.round((screen.width - obj.width) / 2) });
  }, [selectedObjectId, screen, objects, onUpdateObject]);

  const handleAlignRight = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    onUpdateObject(selectedObjectId, { x: screen.width - obj.width });
  }, [selectedObjectId, screen, objects, onUpdateObject]);

  const handleAlignTop = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    onUpdateObject(selectedObjectId, { y: 0 });
  }, [selectedObjectId, screen, onUpdateObject]);

  const handleAlignMiddle = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    onUpdateObject(selectedObjectId, { y: Math.round((screen.height - obj.height) / 2) });
  }, [selectedObjectId, screen, objects, onUpdateObject]);

  const handleAlignBottom = useCallback(() => {
    if (!selectedObjectId || !screen) return;
    const obj = objects.find(o => o.id === selectedObjectId);
    if (!obj) return;
    onUpdateObject(selectedObjectId, { y: screen.height - obj.height });
  }, [selectedObjectId, screen, objects, onUpdateObject]);

  const handleAddTrigger = useCallback(() => {
    toast({ 
      title: "Add Trigger", 
      description: "Use the Triggers panel to create an interaction for this object" 
    });
  }, []);

  const handleBindDataKey = useCallback(() => {
    toast({ 
      title: "Bind Data Key", 
      description: "Use the Attributes panel to bind a vocabulary data key to this object" 
    });
  }, []);

  const shortcutHandlers: ShortcutHandler[] = useMemo(() => [
    {
      action: "panMode",
      handler: () => {
        previousToolRef.current = tool;
        setTool("hand");
      },
      onRelease: () => {
        setTool(previousToolRef.current);
      },
    },
    {
      action: "zoomMode",
      handler: () => {
        setIsZoomMode(true);
      },
      onRelease: () => {
        setIsZoomMode(false);
        setZoomDragStart(null);
      },
    },
    { action: "selectTool", handler: () => setTool("select") },
    { action: "directSelectTool", handler: () => setTool("directSelect") },
    { action: "handTool", handler: () => setTool("hand") },
    { action: "deselect", handler: () => {
      if (isolatedObjectId) {
        onIsolateObject(null);
      } else {
        onSelectObject(null);
      }
    }},
    { action: "delete", handler: handleDeleteSelected },
    { action: "undo", handler: handleUndo },
    { action: "redo", handler: handleRedo },
    { action: "copy", handler: handleCopy },
    { action: "paste", handler: handlePaste },
    { action: "selectAll", handler: () => onSelectAll?.() },
    { action: "duplicate", handler: handleDuplicate },
    { action: "bringForward", handler: handleBringForward },
    { action: "sendBackward", handler: handleSendBackward },
    { action: "bringToFront", handler: handleBringToFront },
    { action: "sendToBack", handler: handleSendToBack },
    { action: "togglePreview", handler: onTogglePreview },
    { action: "showHelp", handler: () => setShowShortcutsHelp(true) },
    { action: "zoomIn", handler: handleZoomIn },
    { action: "zoomOut", handler: handleZoomOut },
    { action: "fitToScreen", handler: handleFitToScreen },
    { action: "zoomTo100", handler: handleResetZoom },
    { action: "zoomToSelection", handler: handleZoomToSelection },
    { action: "flipHorizontal", handler: handleFlipHorizontal },
    { action: "flipVertical", handler: handleFlipVertical },
    { action: "export", handler: () => setShowExportDialog(true) },
    { action: "toggleOutlineMode", handler: () => setIsOutlineMode(prev => !prev) },
  ], [
    tool, isolatedObjectId, onIsolateObject, onSelectObject, onSelectAll,
    handleDeleteSelected, handleUndo, handleRedo, handleCopy, handlePaste, handleDuplicate,
    handleBringForward, handleSendBackward, handleBringToFront, handleSendToBack,
    onTogglePreview, handleZoomIn, handleZoomOut, handleFitToScreen, handleResetZoom, handleZoomToSelection,
    handleFlipHorizontal, handleFlipVertical
  ]);

  const { isSpaceHeld, isZHeld, isAltHeld } = useKeyboardShortcuts({
    shortcuts: DEFAULT_SHORTCUTS,
    handlers: shortcutHandlers,
    enabled: !isPreviewMode,
  });

  const canvasCursor = useMemo(() => {
    if (isZoomMode || isZHeld) return "zoom-in";
    if (tool === "hand" || isPanning || isSpaceHeld) return isPanning ? "grabbing" : "grab";
    if (tool === "directSelect") return "crosshair";
    return "default";
  }, [isZoomMode, isZHeld, tool, isPanning, isSpaceHeld]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const rect = canvasAreaRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const pointerX = e.clientX - rect.left;
      const pointerY = e.clientY - rect.top;
      
      const zoomDelta = -e.deltaY * ZOOM_SENSITIVITY;
      const zoomFactor = Math.exp(zoomDelta);
      
      setZoom(prevZoom => {
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prevZoom * zoomFactor));
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = pointerX - centerX;
        const offsetY = pointerY - centerY;
        
        const scale = newZoom / prevZoom;
        
        setPanX(prevPanX => prevPanX - offsetX * (scale - 1));
        setPanY(prevPanY => prevPanY - offsetY * (scale - 1));
        
        return newZoom;
      });
    } else {
      if (inertiaRafRef.current) {
        cancelAnimationFrame(inertiaRafRef.current);
        inertiaRafRef.current = null;
      }
      
      setPanX(x => x - e.deltaX);
      setPanY(y => y - e.deltaY);
      
      const now = performance.now();
      const dt = Math.max(1, now - lastPanTimeRef.current);
      lastPanTimeRef.current = now;
      
      panVelocityRef.current = {
        vx: -e.deltaX / dt * 16,
        vy: -e.deltaY / dt * 16,
      };
    }
  }, []);

  if (!screen) {
    return (
      <div className="h-full flex items-center justify-center bg-secondary/30">
        <div className="text-muted-foreground text-center">
          <Square className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a screen to start editing</p>
        </div>
      </div>
    );
  }

  const isTouchDevice = isMobile || isTablet;
  const toolbarButtonSize = isTouchDevice ? "h-11 w-11" : "h-8 w-8";
  const toolbarIconSize = isTouchDevice ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className="h-full flex flex-col bg-background relative overflow-hidden">
      <div className={cn(
        "border-b border-border flex items-center justify-between bg-card z-10 shrink-0",
        isMobile ? "h-auto flex-wrap gap-2 px-2 py-2" : "h-12 px-4"
      )}>
        <div className={cn("flex items-center", isMobile ? "gap-1" : "gap-1")}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  toolbarButtonSize,
                  "touch-target",
                  tool === "select" && "bg-accent text-accent-foreground"
                )}
                onClick={() => setTool("select")}
                data-testid="tool-select"
              >
                <MousePointer2 className={toolbarIconSize} />
                {isTouchDevice && <span className="sr-only">Select</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Selection Tool (V) - Select whole objects</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  toolbarButtonSize,
                  "touch-target",
                  tool === "directSelect" && "bg-blue-500 text-white"
                )}
                onClick={() => setTool("directSelect")}
                data-testid="tool-direct-select"
              >
                <Target className={toolbarIconSize} />
                {isTouchDevice && <span className="sr-only">Direct Select</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Direct Selection (A) - Select sub-objects</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(
                  toolbarButtonSize,
                  "touch-target",
                  tool === "hand" && "bg-accent text-accent-foreground"
                )}
                onClick={() => setTool("hand")}
                data-testid="tool-hand"
              >
                <Hand className={toolbarIconSize} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Hand Tool (H)</TooltipContent>
          </Tooltip>
          
          {!isMobile && <HelpTooltip featureKey="canvas-navigation" side="bottom" iconSize={12} />}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          {!isMobile && (
            <Button 
              variant="secondary" 
              size="sm" 
              className={cn("gap-2 touch-target", isTouchDevice ? "h-11 px-3" : "h-8 text-xs")}
              onClick={handleAddObject}
              data-testid="button-add-object"
            >
              <Plus className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
              {!isTablet && "Add Object"}
            </Button>
          )}
          
          {selectedObjectId && !isMobile && (
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn(
                "gap-2 text-destructive hover:text-destructive touch-target",
                isTouchDevice ? "h-11 px-3" : "h-8 text-xs"
              )}
              onClick={() => onDeleteObject(selectedObjectId)}
              data-testid="button-delete-object"
            >
              <Trash2 className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
              {!isTablet && "Delete"}
            </Button>
          )}
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Button 
            variant={isPreviewMode ? "default" : "outline"} 
            size="sm" 
            className={cn(
              "gap-2 touch-target",
              isTouchDevice ? "h-11 px-3" : "h-8 text-xs",
              isPreviewMode && "bg-green-600 hover:bg-green-700"
            )}
            onClick={onTogglePreview}
            data-testid="button-preview-toggle"
          >
            <Play className={cn(isTouchDevice ? "w-5 h-5" : "w-3 h-3", isPreviewMode && "fill-current")} />
            {!isMobile && (isPreviewMode ? "Stop" : "Preview")}
          </Button>
          {!isMobile && <HelpTooltip featureKey="preview-mode" side="bottom" iconSize={12} />}
          
          {!isMobile && (
            <>
              <div className="w-px h-4 bg-border mx-1" />
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(toolbarButtonSize, "touch-target")}
                    onClick={() => setShowExportDialog(true)}
                    data-testid="button-export"
                  >
                    <Download className={toolbarIconSize} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Export ({CMD_KEY}E)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(toolbarButtonSize, "touch-target", showLayerOutlines && "bg-accent text-accent-foreground")}
                    onClick={() => setShowLayerOutlines(!showLayerOutlines)}
                    data-testid="button-toggle-outlines"
                  >
                    {showLayerOutlines ? <Eye className={toolbarIconSize} /> : <EyeOff className={toolbarIconSize} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showLayerOutlines ? "Hide Outlines" : "Show Outlines"}</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(toolbarButtonSize, "touch-target", isOutlineMode && "bg-accent text-accent-foreground")}
                    onClick={() => setIsOutlineMode(!isOutlineMode)}
                    data-testid="button-toggle-outline-mode"
                  >
                    <Layers className={toolbarIconSize} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Outline Mode ({CMD_KEY}Y)</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(toolbarButtonSize, "touch-target", showRulers && "bg-accent text-accent-foreground")}
                    onClick={() => setShowRulers(!showRulers)}
                    data-testid="button-toggle-rulers"
                  >
                    <Ruler className={toolbarIconSize} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{showRulers ? "Hide Rulers" : "Show Rulers"}</TooltipContent>
              </Tooltip>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(toolbarButtonSize, "touch-target", showGuides && guides.length > 0 && "bg-accent text-accent-foreground")}
                    data-testid="button-guides-menu"
                  >
                    <Grid3X3 className={toolbarIconSize} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setShowGuides(!showGuides)}>
                    {showGuides ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {showGuides ? "Hide Guides" : "Show Guides"}
                  </DropdownMenuItem>
                  {guides.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleClearAllGuides} className="text-destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Guides ({guides.length})
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {screen?.figmaFrameId && onSyncLayers && (
                <Button
                  variant="secondary"
                  size="sm"
                  className={cn("gap-2 touch-target", isTouchDevice ? "h-11 px-3" : "h-8 text-xs")}
                  onClick={onSyncLayers}
                  data-testid="button-sync-layers"
                >
                  <RefreshCw className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
                  {!isTablet && "Sync"}
                </Button>
              )}
            </>
          )}

          {isMobile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className={cn(toolbarButtonSize, "touch-target")}>
                  <MoreVertical className={toolbarIconSize} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => setShowExportDialog(true)}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowLayerOutlines(!showLayerOutlines)}>
                  {showLayerOutlines ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showLayerOutlines ? "Hide Outlines" : "Show Outlines"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsOutlineMode(!isOutlineMode)}>
                  <Layers className="w-4 h-4 mr-2" />
                  {isOutlineMode ? "Exit Outline Mode" : "Outline Mode"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowRulers(!showRulers)}>
                  <Ruler className="w-4 h-4 mr-2" />
                  {showRulers ? "Hide Rulers" : "Show Rulers"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowGuides(!showGuides)}>
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  {showGuides ? "Hide Guides" : "Show Guides"}
                </DropdownMenuItem>
                {guides.length > 0 && (
                  <DropdownMenuItem onClick={handleClearAllGuides} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All Guides
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                {selectedObjectId && (
                  <DropdownMenuItem onClick={() => onDeleteObject(selectedObjectId)} className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Object
                  </DropdownMenuItem>
                )}
                {screen?.figmaFrameId && onSyncLayers && (
                  <DropdownMenuItem onClick={onSyncLayers}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sync Layers
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {!isMobile && (
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-muted-foreground">{screen.title}</span>
            {currentScene && (
              <span className="text-xs px-2 py-1 bg-primary/20 text-primary rounded">
                {currentScene.name}
              </span>
            )}
            {isolatedObjectId && (
              <div className="flex items-center gap-2 px-2 py-1 bg-green-500/20 rounded border border-green-500/30">
                <Target className="w-3 h-3 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  Isolated: {objects.find(o => o.id === isolatedObjectId)?.name || "Object"}
                </span>
                <button
                  className="hover:bg-green-500/30 rounded p-0.5 transition-colors"
                  onClick={() => onIsolateObject(null)}
                  data-testid="button-exit-isolation"
                >
                  <X className="w-3 h-3 text-green-600" />
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-1">
          {!isMobile && showCollaboration && (
            <>
              <CollaborationToolbarSection />
              <div className="w-px h-4 bg-border mx-1" />
            </>
          )}
          
          {!isMobile && (
            <CommentModeButton
              isActive={isCommentMode}
              onClick={() => setIsCommentMode(!isCommentMode)}
              className={toolbarButtonSize}
              iconClassName={isTouchDevice ? "w-5 h-5" : "w-3 h-3"}
            />
          )}
          
          {!isMobile && <DevSyncIndicator projectId={projectId} onProjectImported={onProjectImported} />}
          {!isMobile && <div className="w-px h-4 bg-border mx-1" />}
          
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(toolbarButtonSize, "touch-target")}
                  onClick={() => setShowShortcutsHelp(true)}
                  data-testid="button-keyboard-shortcuts"
                >
                  <Keyboard className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard Shortcuts (?)</TooltipContent>
            </Tooltip>
          )}
          
          <Sheet open={showHelpPanel} onOpenChange={setShowHelpPanel}>
            <SheetTrigger asChild>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(toolbarButtonSize, "touch-target")}
                    data-testid="button-help"
                  >
                    <HelpCircle className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Help & Tutorials</TooltipContent>
              </Tooltip>
            </SheetTrigger>
            <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0">
              <HelpPanel onClose={() => setShowHelpPanel(false)} />
            </SheetContent>
          </Sheet>
          
          {!isMobile && (
            <SettingsDropdown 
              buttonClassName={toolbarButtonSize}
              iconClassName={isTouchDevice ? "w-5 h-5" : "w-3 h-3"}
              activePreset={activePreset}
              onApplyPreset={onApplyPreset}
              onResetPanels={onResetPanels}
            />
          )}
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(toolbarButtonSize, "touch-target")}
                onClick={handleZoomOut}
                data-testid="button-zoom-out"
              >
                <ZoomOut className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          
          {!isMobile && (
            <div className="w-20">
              <Slider 
                value={[zoom]} 
                onValueChange={([v]) => setZoom(v)} 
                min={MIN_ZOOM} 
                max={MAX_ZOOM} 
                step={5} 
                className="cursor-pointer"
              />
            </div>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "font-mono text-xs px-2 py-1 rounded hover:bg-accent touch-target min-w-[48px] text-center flex items-center gap-1",
                  isTouchDevice && "text-sm"
                )}
                data-testid="button-zoom-dropdown"
              >
                {Math.round(zoom)}%
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[160px]">
              <DropdownMenuItem onClick={handleFitToScreen} className="flex items-center justify-between">
                <span>Fit to Screen</span>
                <span className="text-xs text-muted-foreground ml-4">{CMD_KEY}0</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleZoomToSelection}
                disabled={selectedObjectIds.length === 0 && !selectedObjectId}
                className="flex items-center justify-between"
              >
                <span>Zoom to Selection</span>
                <span className="text-xs text-muted-foreground ml-4">{CMD_KEY}2</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {ZOOM_PRESETS.map(preset => (
                <DropdownMenuItem 
                  key={preset}
                  onClick={() => handleZoomToPreset(preset)}
                  className={cn(
                    "flex items-center justify-between",
                    Math.round(zoom) === preset && "bg-accent"
                  )}
                >
                  <span>{preset}%</span>
                  {preset === 100 && <span className="text-xs text-muted-foreground ml-4">{CMD_KEY}1</span>}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(toolbarButtonSize, "touch-target")}
                onClick={handleZoomIn}
                data-testid="button-zoom-in"
              >
                <ZoomIn className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className={cn(toolbarButtonSize, "touch-target")}
                onClick={handleFitToScreen}
                data-testid="button-fit-screen"
              >
                <Maximize className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fit to Screen</TooltipContent>
          </Tooltip>
          
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={cn(toolbarButtonSize, "touch-target")}
                  onClick={handleResetZoom}
                  data-testid="button-reset-zoom"
                >
                  <RotateCcw className={isTouchDevice ? "w-5 h-5" : "w-3 h-3"} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset View</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <div 
        ref={canvasAreaRef}
        data-testid="canvas-area"
        className="flex-1 overflow-hidden bg-secondary/30 relative canvas-container"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
        onClick={(e) => {
          handleCanvasClick(e);
          if (selectedGuideId) {
            setSelectedGuideId(null);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setContextMenuPos(null);
        }}
        style={{ 
          cursor: canvasCursor,
          touchAction: 'none',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        )}
        
        <Rulers
          canvasWidth={screen.width}
          canvasHeight={screen.height}
          zoom={zoom}
          panX={panX}
          panY={panY}
          showRulers={showRulers}
          showGuides={showGuides}
          guides={guides}
          selectedGuideId={selectedGuideId}
          onCreateGuide={handleCreateGuide}
          onUpdateGuide={handleUpdateGuide}
          onSelectGuide={handleSelectGuide}
          onDeleteGuide={handleDeleteGuide}
          containerRef={canvasAreaRef}
        />
        
        <div 
          className="absolute pointer-events-none opacity-10" 
          style={{ 
            left: showRulers ? RULER_SIZE : 0,
            top: showRulers ? RULER_SIZE : 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }} 
        />

        <div 
          ref={containerRef}
          className="absolute"
          style={{ 
            left: '50%',
            top: '50%',
            width: screen.width,
            height: screen.height,
            transform: `translate(-50%, -50%) translate(${panX}px, ${panY}px) scale(${zoom / 100})`,
            transformOrigin: 'center center',
            willChange: 'transform',
          }}
        >
          <div 
            ref={canvasRef}
            className="relative bg-white rounded-lg shadow-lg border border-border/50"
            style={{ width: screen.width, height: screen.height }}
          >
            <img 
              src={screen.imageUrl} 
              alt={screen.title} 
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
            
            {sortedObjects.map(obj => {
              const props = getEffectiveProps(obj);
              const resolved = resolveBindings(obj);
              const isSelected = selectedObjectIds.includes(obj.id);
              const isIsolated = isolatedObjectId === obj.id;
              const isFigmaLayer = !!obj.figmaNodeId;
              const hasTouchFeedback = touchFeedbackId === obj.id;
              
              const isMaster = isObjectMasterComponent?.(obj.id) ?? false;
              const isInstance = isObjectInstance?.(obj) ?? false;
              
              const touchPadding = isTouchDevice ? TOUCH_HIT_AREA_PADDING : 0;
              
              const isInIsolationMode = !!isolatedObjectId;
              const isDimmed = isInIsolationMode && !isIsolated;
              
              // Use local drag position for smooth dragging (no API lag)
              // Primary dragged object uses localDragPosition directly
              const isPrimaryDrag = isDragging && dragIntentRef.current?.objectId === obj.id && localDragPosition;
              
              // Secondary objects in multi-select use offset from primary object
              const multiDragOffset = multiDragOffsetsRef.current.get(obj.id);
              const isSecondaryDrag = isDragging && localDragPosition && multiDragOffset;
              
              const isBeingDragged = isPrimaryDrag || isSecondaryDrag;
              
              // Check for committed positions (prevents snap-back during mutation)
              const hasCommittedPosition = committedPositionRef.current?.objectId === obj.id;
              const committedPos = hasCommittedPosition ? committedPositionRef.current : null;
              const multiCommittedPos = multiCommittedPositionsRef.current.get(obj.id);
              
              // Priority: active drag > committed (pending mutation) > database position
              let renderX: number, renderY: number;
              if (isPrimaryDrag) {
                renderX = localDragPosition.x;
                renderY = localDragPosition.y;
              } else if (isSecondaryDrag && multiDragOffset) {
                // Calculate position based on primary object's position + offset
                renderX = localDragPosition.x + multiDragOffset.offsetX;
                renderY = localDragPosition.y + multiDragOffset.offsetY;
              } else if (committedPos) {
                renderX = committedPos.x;
                renderY = committedPos.y;
              } else if (multiCommittedPos) {
                renderX = multiCommittedPos.x;
                renderY = multiCommittedPos.y;
              } else {
                renderX = props.x;
                renderY = props.y;
              }
              
              // Apply transform preview for smooth scale/rotation during drag
              const isBeingTransformed = transformingObjectId === obj.id && transformPreview;
              let renderWidth = obj.width;
              let renderHeight = obj.height;
              let renderRotation = props.rotation;
              
              if (isBeingTransformed && transformPreview) {
                if (transformPreview.x !== undefined) renderX = transformPreview.x;
                if (transformPreview.y !== undefined) renderY = transformPreview.y;
                if (transformPreview.width !== undefined) renderWidth = transformPreview.width;
                if (transformPreview.height !== undefined) renderHeight = transformPreview.height;
                if (transformPreview.rotation !== undefined) renderRotation = transformPreview.rotation;
              }
              
              const shouldShowBorder = isSelected || isIsolated;
              const shouldShowLabel = isOutlineMode || (showLayerOutlines && !isInIsolationMode) || isSelected || isIsolated;
              
              const getOutlineModeColor = () => {
                const objType = obj.type.toLowerCase();
                if (objType === 'group' || objType === 'component' || objType === 'instance') {
                  return '#3b82f6';
                }
                if (objType === 'frame') {
                  return '#22c55e';
                }
                if (objType === 'image') {
                  return '#f97316';
                }
                return '#8b5cf6';
              };
              
              const getBorderStyle = () => {
                if (isPreviewMode) return "none";
                if (isOutlineMode) {
                  const color = getOutlineModeColor();
                  if (isSelected) {
                    return `2px solid ${color}`;
                  }
                  return `1px solid ${color}`;
                }
                if (isIsolated) return "2px solid rgba(34, 197, 94, 0.8)";
                if (isSelected) {
                  return isFigmaLayer ? "2px solid rgba(59, 130, 246, 0.8)" : "2px solid rgba(124, 58, 237, 0.8)";
                }
                if (showLayerOutlines && !isInIsolationMode) {
                  return isFigmaLayer ? "1px dashed rgba(59, 130, 246, 0.3)" : "1px dashed rgba(124, 58, 237, 0.3)";
                }
                return "none";
              };
              
              const getBackgroundColor = () => {
                if (isPreviewMode) return "transparent";
                if (isOutlineMode) return "transparent";
                if (isIsolated) return "rgba(34, 197, 94, 0.05)";
                if (isSelected) {
                  return isFigmaLayer ? "rgba(59, 130, 246, 0.05)" : "rgba(124, 58, 237, 0.05)";
                }
                return "transparent";
              };
              
              const getOutlineModeLabelColor = () => {
                const objType = obj.type.toLowerCase();
                if (objType === 'group' || objType === 'component' || objType === 'instance') {
                  return 'text-blue-600';
                }
                if (objType === 'frame') {
                  return 'text-green-600';
                }
                if (objType === 'image') {
                  return 'text-orange-600';
                }
                return 'text-purple-600';
              };

              const getTypeBadge = () => {
                if (!isFigmaLayer || isPreviewMode) return null;
                const typeMap: Record<string, string> = {
                  text: "TEXT",
                  shape: "RECT",
                  group: "GROUP",
                  frame: "FRAME",
                  image: "IMG",
                  vector: "VEC",
                  component: "COMP",
                  instance: "INST",
                };
                return typeMap[obj.type.toLowerCase()] || obj.type.toUpperCase();
              };
              
              return (
                <div
                  key={obj.id}
                  data-object-id={obj.id}
                  data-testid={`object-${obj.id}`}
                  className={cn(
                    "absolute",
                    // Disable transitions during drag/transform for crisp, instant response
                    !isDragging && !isBeingTransformed && "transition-all duration-150",
                    isSelected && !isPreviewMode && !obj.locked && "ring-2 ring-offset-1",
                    isSelected && !isPreviewMode && !obj.locked && (isFigmaLayer ? "ring-blue-500" : "ring-purple-500"),
                    isIsolated && !isPreviewMode && "ring-2 ring-offset-1 ring-green-500",
                    hasTouchFeedback && "animate-pulse-touch"
                  )}
                  style={{
                    left: -touchPadding,
                    top: -touchPadding,
                    width: renderWidth + touchPadding * 2,
                    height: renderHeight + touchPadding * 2,
                    padding: touchPadding,
                    transform: `translate(${renderX}px, ${renderY}px) rotate(${renderRotation}deg)`,
                    opacity: isDimmed ? 0.25 : props.opacity,
                    display: props.visible ? "block" : "none",
                    zIndex: isIsolated ? 1000 : (obj.zIndex ?? 0),
                    pointerEvents: isDimmed ? "none" : "auto",
                    cursor: isPreviewMode 
                      ? (getObjectInteractions(obj).some(int => int.trigger === "click") ? "pointer" : "default")
                      : (obj.locked ? "not-allowed" : "pointer"),
                    boxShadow: obj.locked && !isPreviewMode ? "0 0 0 2px rgba(251, 191, 36, 0.6)" : undefined,
                    // GPU acceleration during drag/transform for smooth 60fps rendering
                    willChange: (isBeingDragged || isBeingTransformed) ? 'transform, width, height' : 'auto',
                  }}
                  onPointerDown={(e) => handleObjectPointerDown(e, obj)}
                  onPointerMove={handleObjectPointerMove}
                  onPointerUp={handleObjectPointerUp}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPreviewMode) {
                      const interactions = getObjectInteractions(obj);
                      const clickInteraction = interactions.find(int => int.trigger === "click");
                      if (clickInteraction && clickInteraction.action === "goToScene" && clickInteraction.sceneId) {
                        if (onSceneChange) {
                          onSceneChange(clickInteraction.sceneId);
                        }
                      }
                    }
                  }}
                  onContextMenu={(e) => handleContextMenu(e, obj)}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    if (!isPreviewMode && !obj.locked) {
                      onIsolateObject(obj.id);
                    }
                  }}
                >
                  <div 
                    className="w-full h-full rounded transition-colors duration-150 relative overflow-hidden"
                    style={{
                      backgroundColor: getBackgroundColor(),
                      border: getBorderStyle(),
                      borderRadius: "4px",
                    }}
                  >
                    {/* SVG content rendering for imported objects - hidden in outline mode */}
                    {obj.metadata && !isOutlineMode && (
                      <SVGObjectRenderer
                        width={obj.width}
                        height={obj.height}
                        metadata={obj.metadata}
                        objectId={obj.id}
                      />
                    )}
                    
                    {/* Preview mode: Display resolved binding content */}
                    {isPreviewMode && resolved && (
                      <>
                        {resolved.imageUrl && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${resolved.imageUrl})` }}
                          />
                        )}
                        {resolved.text && (
                          <div className="absolute inset-0 flex items-center justify-center p-1 text-sm font-medium text-gray-900 overflow-hidden">
                            <span className="truncate text-center">{resolved.text}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {!isPreviewMode && shouldShowLabel && (
                      <div className={cn(
                        "absolute inset-0 flex items-center justify-center text-xs font-medium transition-opacity",
                        isOutlineMode ? getOutlineModeLabelColor() : (isIsolated ? "text-green-700" : (isFigmaLayer ? "text-blue-700" : "text-purple-900")),
                        (!isSelected && !isIsolated && !isOutlineMode) && "opacity-50"
                      )} style={{ padding: touchPadding }}>
                        {obj.name}
                      </div>
                    )}
                    
                    {!isOutlineMode && isFigmaLayer && !isPreviewMode && shouldShowLabel && (
                      <div className={cn(
                        "absolute bottom-1 right-1 px-1 py-0.5 text-white text-[9px] font-bold rounded transition-colors",
                        isIsolated ? "bg-green-500" : "bg-blue-500"
                      )}>
                        {getTypeBadge()}
                      </div>
                    )}
                    
                    {/* Component/Instance indicator */}
                    {!isPreviewMode && (isMaster || isInstance) && (
                      <div className={cn(
                        "absolute top-1 left-1 px-1.5 py-0.5 text-white text-[8px] font-bold rounded flex items-center gap-1",
                        isMaster ? "bg-purple-500" : "bg-blue-500"
                      )}>
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <path d="M9 9h6v6H9z" />
                        </svg>
                        {isMaster ? "M" : "I"}
                      </div>
                    )}
                    
                    {/* Interaction indicator - shows when object has click interactions */}
                    {!isPreviewMode && (() => {
                      const interactions = getObjectInteractions(obj);
                      const hasClickInteraction = interactions.some(int => int.trigger === "click");
                      if (!hasClickInteraction) return null;
                      const targetScene = scenes.find(s => 
                        interactions.find(int => int.trigger === "click" && int.sceneId === s.id)
                      );
                      return (
                        <div 
                          className={cn(
                            "absolute top-1 right-1 px-1.5 py-0.5 text-white text-[8px] font-bold rounded flex items-center gap-1 bg-orange-500"
                          )}
                          title={targetScene ? `Click → ${targetScene.name}` : "Click interaction"}
                        >
                          <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M6 8l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span className="truncate max-w-[50px]">
                            {targetScene ? targetScene.name : "→"}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                  
                  {/* Binding indicator badges - shows when object has vocabulary/media bindings */}
                  {!isPreviewMode && !isDimmed && (obj.dataKey || obj.mediaUrl || obj.audioUrl) && (
                    <div
                      className="absolute flex items-center gap-0.5 pointer-events-none"
                      style={{
                        top: touchPadding - 4,
                        right: touchPadding - 4,
                        transform: `scale(${100 / zoom})`,
                        transformOrigin: 'top right',
                        zIndex: 10,
                      }}
                    >
                      {obj.dataKey && (
                        <div
                          className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center"
                          title={`Vocabulary binding: ${obj.dataKey}`}
                        >
                          <Book className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      {obj.mediaUrl && (
                        <div
                          className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center"
                          title={`Media binding: ${obj.mediaUrl}`}
                        >
                          <ImageIcon className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                      {obj.audioUrl && (
                        <div
                          className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center"
                          title={`Audio binding: ${obj.audioUrl}`}
                        >
                          <Volume2 className="w-2.5 h-2.5 text-white" strokeWidth={2.5} />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Transform handles for selected objects (not shown for locked objects) */}
                  {(isSelected || isIsolated) && !isPreviewMode && !obj.locked && (
                    <TransformHandles
                      width={renderWidth}
                      height={renderHeight}
                      x={renderX}
                      y={renderY}
                      rotation={renderRotation}
                      scaleX={props.scaleX}
                      scaleY={props.scaleY}
                      zoom={zoom}
                      isIsolated={isIsolated}
                      isFigmaLayer={isFigmaLayer}
                      isDirectSelect={tool === "directSelect"}
                      touchPadding={touchPadding}
                      onTransformStart={() => {
                        setIsTransforming(true);
                        setTransformingObjectId(obj.id);
                      }}
                      onTransformEnd={() => {
                        setIsTransforming(false);
                        setTransformingObjectId(null);
                        setTransformPreview(null);
                      }}
                      onTransformPreview={(preview) => {
                        setTransformPreview(preview);
                      }}
                      onScale={(scaleX, scaleY, newWidth, newHeight, deltaX, deltaY) => 
                        handleScale(obj.id, scaleX, scaleY, newWidth, newHeight, deltaX, deltaY)
                      }
                      onRotate={(rotation) => handleRotate(obj.id, rotation)}
                    />
                  )}
                </div>
              );
            })}
            
            {/* Ghost overlay for Alt-drag duplication */}
            {duplicateGhost && altDragRef.current.originalObject && (
              <div
                className="absolute pointer-events-none border-2 border-dashed border-purple-500 bg-purple-500/20 rounded"
                style={{
                  width: altDragRef.current.originalObject.width,
                  height: altDragRef.current.originalObject.height,
                  transform: `translate(${duplicateGhost.x}px, ${duplicateGhost.y}px)`,
                  zIndex: 9999,
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-purple-700">
                  {altDragRef.current.originalObject.name} copy
                </div>
              </div>
            )}
            
            {/* Marquee selection rectangle */}
            {isMarqueeSelecting && marqueeStart && marqueeEnd && (
              <div
                data-testid="marquee-selection"
                className="absolute pointer-events-none border border-blue-500 bg-blue-500/10"
                style={{
                  left: Math.min(marqueeStart.x, marqueeEnd.x),
                  top: Math.min(marqueeStart.y, marqueeEnd.y),
                  width: Math.abs(marqueeEnd.x - marqueeStart.x),
                  height: Math.abs(marqueeEnd.y - marqueeStart.y),
                  zIndex: 9998,
                }}
              />
            )}
            
            {/* Snap guide lines */}
            {activeGuides.map((guide, index) => (
              <div
                key={`guide-${index}`}
                data-testid={`snap-guide-${guide.type}`}
                className="absolute pointer-events-none"
                style={{
                  ...(guide.type === 'vertical' ? {
                    left: guide.position,
                    top: 0,
                    width: 1,
                    height: '100%',
                    borderLeft: '1px dashed #ec4899',
                  } : {
                    left: 0,
                    top: guide.position,
                    width: '100%',
                    height: 1,
                    borderTop: '1px dashed #ec4899',
                  }),
                  zIndex: 9997,
                }}
              />
            ))}
            
            {/* Constraint lines visualization for selected object */}
            {!isPreviewMode && selectedObjectId && (() => {
              const selectedObj = objects.find(o => o.id === selectedObjectId);
              if (!selectedObj) return null;
              
              const props = getEffectiveProps(selectedObj);
              const metadata = (selectedObj.metadata as Record<string, unknown>) || {};
              const constraints = metadata.constraints as { left?: boolean; right?: boolean; top?: boolean; bottom?: boolean } | undefined;
              
              if (!constraints) return null;
              
              const objX = props.x;
              const objY = props.y;
              const objWidth = selectedObj.width;
              const objHeight = selectedObj.height;
              const objCenterX = objX + objWidth / 2;
              const objCenterY = objY + objHeight / 2;
              const canvasWidth = screen.width;
              const canvasHeight = screen.height;
              
              return (
                <>
                  {/* Left constraint line */}
                  {constraints.left && (
                    <div
                      data-testid="constraint-line-left"
                      className="absolute pointer-events-none"
                      style={{
                        left: 0,
                        top: objCenterY,
                        width: objX,
                        height: 0,
                        borderTop: '2px dotted #f59e0b',
                        zIndex: 9996,
                      }}
                    />
                  )}
                  
                  {/* Right constraint line */}
                  {constraints.right && (
                    <div
                      data-testid="constraint-line-right"
                      className="absolute pointer-events-none"
                      style={{
                        left: objX + objWidth,
                        top: objCenterY,
                        width: canvasWidth - objX - objWidth,
                        height: 0,
                        borderTop: '2px dotted #f59e0b',
                        zIndex: 9996,
                      }}
                    />
                  )}
                  
                  {/* Top constraint line */}
                  {constraints.top && (
                    <div
                      data-testid="constraint-line-top"
                      className="absolute pointer-events-none"
                      style={{
                        left: objCenterX,
                        top: 0,
                        width: 0,
                        height: objY,
                        borderLeft: '2px dotted #f59e0b',
                        zIndex: 9996,
                      }}
                    />
                  )}
                  
                  {/* Bottom constraint line */}
                  {constraints.bottom && (
                    <div
                      data-testid="constraint-line-bottom"
                      className="absolute pointer-events-none"
                      style={{
                        left: objCenterX,
                        top: objY + objHeight,
                        width: 0,
                        height: canvasHeight - objY - objHeight,
                        borderLeft: '2px dotted #f59e0b',
                        zIndex: 9996,
                      }}
                    />
                  )}
                </>
              );
            })()}
            
            {/* Collaboration overlay with cursors and comments */}
            {showCollaboration && !isPreviewMode && (
              <CollaborationOverlay
                isEnabled={showCollaboration}
                isCommentMode={isCommentMode}
                zoom={zoom}
                panX={panX}
                panY={panY}
                onAddComment={(x, y) => {
                  setIsCommentMode(false);
                }}
              />
            )}
          </div>
        </div>
      </div>

      {contextMenuPos && selectedObjectId && (() => {
        const selectedObj = objects.find(o => o.id === selectedObjectId);
        const selectedProps = selectedObj ? getEffectiveProps(selectedObj) : null;
        if (!selectedObj || !selectedProps) return null;
        
        const isMasterComp = isObjectMasterComponent?.(selectedObj.id) ?? false;
        const isInst = isObjectInstance?.(selectedObj) ?? false;
        
        return (
          <ObjectContextMenu
            position={contextMenuPos}
            objectName={selectedObj.name}
            isVisible={selectedProps.visible}
            hasClipboard={!!clipboard}
            isMasterComponent={isMasterComp}
            isInstance={isInst}
            onClose={() => setContextMenuPos(null)}
            onDelete={() => onDeleteObject(selectedObjectId)}
            onDuplicate={handleDuplicate}
            onCopy={handleCopy}
            onPaste={handlePaste}
            onBringForward={handleBringForward}
            onSendBackward={handleSendBackward}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
            onToggleVisibility={handleToggleVisibility}
            onEditProperties={handleEditProperties}
            onResetTransform={handleResetTransform}
            onFlipHorizontal={handleFlipHorizontal}
            onFlipVertical={handleFlipVertical}
            onRename={handleRename}
            onAlignLeft={handleAlignLeft}
            onAlignCenter={handleAlignCenter}
            onAlignRight={handleAlignRight}
            onAlignTop={handleAlignTop}
            onAlignMiddle={handleAlignMiddle}
            onAlignBottom={handleAlignBottom}
            onAddTrigger={handleAddTrigger}
            onBindDataKey={handleBindDataKey}
            onCreateComponent={onCreateComponent}
            onDetachInstance={onDetachInstance}
            onResetOverrides={onResetOverrides}
          />
        );
      })()}

      <KeyboardShortcutsDialog 
        open={showShortcutsHelp} 
        onOpenChange={setShowShortcutsHelp} 
      />

      <ExportDialog
        open={showExportDialog}
        onOpenChange={setShowExportDialog}
        screen={screen}
        objects={objects}
        objectStates={objectStates}
        selectedObjectIds={selectedObjectIds}
        canvasRef={canvasRef.current}
        getEffectiveProps={getEffectiveProps}
      />
    </div>
  );
}
