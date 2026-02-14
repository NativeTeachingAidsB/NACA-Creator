import { useState, useCallback, useRef, useMemo } from "react";
import type { GameObject } from "@shared/schema";

export interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

export interface UseHistoryOptions<T> {
  initialState: T;
  maxHistory?: number;
}

export function useHistory<T>({ initialState, maxHistory = 50 }: UseHistoryOptions<T>) {
  const [state, setState] = useState<HistoryState<T>>({
    past: [],
    present: initialState,
    future: [],
  });

  const isUndoingRef = useRef(false);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const set = useCallback((newState: T | ((prev: T) => T), recordHistory = true) => {
    setState((prev) => {
      const nextState = typeof newState === "function" 
        ? (newState as (prev: T) => T)(prev.present) 
        : newState;

      if (!recordHistory || isUndoingRef.current) {
        return { ...prev, present: nextState };
      }

      const newPast = [...prev.past, prev.present];
      if (newPast.length > maxHistory) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: nextState,
        future: [],
      };
    });
  }, [maxHistory]);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.past.length === 0) return prev;

      const newPast = prev.past.slice(0, -1);
      const previousState = prev.past[prev.past.length - 1];

      isUndoingRef.current = true;
      setTimeout(() => { isUndoingRef.current = false; }, 0);

      return {
        past: newPast,
        present: previousState,
        future: [prev.present, ...prev.future],
      };
    });
  }, []);

  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.future.length === 0) return prev;

      const [nextState, ...newFuture] = prev.future;

      isUndoingRef.current = true;
      setTimeout(() => { isUndoingRef.current = false; }, 0);

      return {
        past: [...prev.past, prev.present],
        present: nextState,
        future: newFuture,
      };
    });
  }, []);

  const reset = useCallback((newState: T) => {
    setState({
      past: [],
      present: newState,
      future: [],
    });
  }, []);

  const clear = useCallback(() => {
    setState((prev) => ({
      past: [],
      present: prev.present,
      future: [],
    }));
  }, []);

  return {
    state: state.present,
    set,
    undo,
    redo,
    reset,
    clear,
    canUndo,
    canRedo,
    historyLength: state.past.length,
    futureLength: state.future.length,
  };
}

export type HistoryActionType = 
  | "create"
  | "delete"
  | "move"
  | "resize"
  | "rotate"
  | "scale"
  | "opacity"
  | "visibility"
  | "property"
  | "z-order"
  | "align"
  | "distribute"
  | "batch";

export interface HistoryEntry {
  id: string;
  actionType: HistoryActionType;
  actionName: string;
  timestamp: number;
  affectedObjectNames: string[];
  affectedObjectIds: string[];
  snapshot: ObjectSnapshot[];
  previousSnapshot: ObjectSnapshot[];
}

export interface ObjectSnapshot {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  zIndex: number;
  locked: boolean;
}

export interface EditorHistoryState {
  entries: HistoryEntry[];
  currentIndex: number;
}

const MAX_HISTORY_ENTRIES = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createObjectSnapshot(obj: GameObject): ObjectSnapshot {
  return {
    id: obj.id,
    name: obj.name,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation ?? 0,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    opacity: obj.opacity ?? 1,
    visible: obj.visible ?? true,
    zIndex: obj.zIndex ?? 0,
    locked: obj.locked ?? false,
  };
}

function getActionName(actionType: HistoryActionType, details?: string): string {
  const actionNames: Record<HistoryActionType, string> = {
    create: "Create Object",
    delete: "Delete Object",
    move: "Move",
    resize: "Resize",
    rotate: "Rotate",
    scale: "Scale",
    opacity: "Change Opacity",
    visibility: "Toggle Visibility",
    property: "Change Property",
    "z-order": "Change Layer Order",
    align: "Align",
    distribute: "Distribute",
    batch: "Multiple Changes",
  };
  
  let name = actionNames[actionType];
  if (details) {
    name += ` (${details})`;
  }
  return name;
}

export function useEditorHistory() {
  const [state, setState] = useState<EditorHistoryState>({
    entries: [],
    currentIndex: -1,
  });
  
  const isApplyingRef = useRef(false);
  const batchingRef = useRef(false);
  const batchEntriesRef = useRef<{
    actionType: HistoryActionType;
    objects: GameObject[];
    previousObjects: GameObject[];
    details?: string;
  }[]>([]);

  const canUndo = state.currentIndex >= 0;
  const canRedo = state.currentIndex < state.entries.length - 1;

  const currentEntry = useMemo(() => {
    if (state.currentIndex >= 0 && state.currentIndex < state.entries.length) {
      return state.entries[state.currentIndex];
    }
    return null;
  }, [state.entries, state.currentIndex]);

  const pastEntries = useMemo(() => {
    return state.entries.slice(0, state.currentIndex + 1).reverse();
  }, [state.entries, state.currentIndex]);

  const futureEntries = useMemo(() => {
    return state.entries.slice(state.currentIndex + 1);
  }, [state.entries, state.currentIndex]);

  const pushEntry = useCallback((
    actionType: HistoryActionType,
    affectedObjects: GameObject[],
    previousObjects: GameObject[],
    details?: string
  ) => {
    if (isApplyingRef.current) return;
    
    if (batchingRef.current) {
      batchEntriesRef.current.push({
        actionType,
        objects: affectedObjects,
        previousObjects,
        details,
      });
      return;
    }

    const entry: HistoryEntry = {
      id: generateId(),
      actionType,
      actionName: getActionName(actionType, details),
      timestamp: Date.now(),
      affectedObjectNames: affectedObjects.map(o => o.name),
      affectedObjectIds: affectedObjects.map(o => o.id),
      snapshot: affectedObjects.map(createObjectSnapshot),
      previousSnapshot: previousObjects.map(createObjectSnapshot),
    };

    setState(prev => {
      const newEntries = prev.entries.slice(0, prev.currentIndex + 1);
      newEntries.push(entry);
      
      if (newEntries.length > MAX_HISTORY_ENTRIES) {
        newEntries.shift();
        return {
          entries: newEntries,
          currentIndex: newEntries.length - 1,
        };
      }
      
      return {
        entries: newEntries,
        currentIndex: newEntries.length - 1,
      };
    });
  }, []);

  const startBatch = useCallback(() => {
    batchingRef.current = true;
    batchEntriesRef.current = [];
  }, []);

  const endBatch = useCallback((batchName?: string) => {
    batchingRef.current = false;
    const batched = batchEntriesRef.current;
    batchEntriesRef.current = [];

    if (batched.length === 0) return;

    const allObjects = batched.flatMap(e => e.objects);
    const allPreviousObjects = batched.flatMap(e => e.previousObjects);
    const uniqueObjects = Array.from(
      new Map(allObjects.map(o => [o.id, o])).values()
    );
    const uniquePreviousObjects = Array.from(
      new Map(allPreviousObjects.map(o => [o.id, o])).values()
    );

    const entry: HistoryEntry = {
      id: generateId(),
      actionType: "batch",
      actionName: batchName || `${batched.length} changes`,
      timestamp: Date.now(),
      affectedObjectNames: uniqueObjects.map(o => o.name),
      affectedObjectIds: uniqueObjects.map(o => o.id),
      snapshot: uniqueObjects.map(createObjectSnapshot),
      previousSnapshot: uniquePreviousObjects.map(createObjectSnapshot),
    };

    setState(prev => {
      const newEntries = prev.entries.slice(0, prev.currentIndex + 1);
      newEntries.push(entry);
      
      if (newEntries.length > MAX_HISTORY_ENTRIES) {
        newEntries.shift();
        return {
          entries: newEntries,
          currentIndex: newEntries.length - 1,
        };
      }
      
      return {
        entries: newEntries,
        currentIndex: newEntries.length - 1,
      };
    });
  }, []);

  const undo = useCallback((): HistoryEntry | null => {
    if (!canUndo) return null;
    
    const entry = state.entries[state.currentIndex];
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex - 1,
    }));
    
    return entry;
  }, [canUndo, state.entries, state.currentIndex]);

  const redo = useCallback((): HistoryEntry | null => {
    if (!canRedo) return null;
    
    const entry = state.entries[state.currentIndex + 1];
    setState(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
    }));
    
    return entry;
  }, [canRedo, state.entries, state.currentIndex]);

  const jumpTo = useCallback((entryId: string): { 
    entriesToUndo: HistoryEntry[]; 
    entriesToRedo: HistoryEntry[];
  } | null => {
    const targetIndex = state.entries.findIndex(e => e.id === entryId);
    if (targetIndex === -1) return null;

    const currentIdx = state.currentIndex;
    
    if (targetIndex === currentIdx) {
      return { entriesToUndo: [], entriesToRedo: [] };
    }

    let entriesToUndo: HistoryEntry[] = [];
    let entriesToRedo: HistoryEntry[] = [];

    if (targetIndex < currentIdx) {
      entriesToUndo = state.entries.slice(targetIndex + 1, currentIdx + 1).reverse();
    } else {
      entriesToRedo = state.entries.slice(currentIdx + 1, targetIndex + 1);
    }

    setState(prev => ({
      ...prev,
      currentIndex: targetIndex,
    }));

    return { entriesToUndo, entriesToRedo };
  }, [state.entries, state.currentIndex]);

  const setIsApplying = useCallback((applying: boolean) => {
    isApplyingRef.current = applying;
  }, []);

  const clear = useCallback(() => {
    setState({
      entries: [],
      currentIndex: -1,
    });
  }, []);

  const getRelativeTime = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  }, []);

  return {
    entries: state.entries,
    currentIndex: state.currentIndex,
    currentEntry,
    pastEntries,
    futureEntries,
    pushEntry,
    startBatch,
    endBatch,
    undo,
    redo,
    jumpTo,
    clear,
    canUndo,
    canRedo,
    setIsApplying,
    getRelativeTime,
    historyLength: state.entries.length,
  };
}

export type EditorHistoryAPI = ReturnType<typeof useEditorHistory>;

export interface ObjectHistoryEntry {
  type: "create" | "update" | "delete" | "reorder";
  objectId: string;
  data: Record<string, unknown>;
  previousData?: Record<string, unknown>;
  timestamp: number;
}

export function useObjectHistory() {
  const [history, setHistory] = useState<ObjectHistoryEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const canUndo = historyIndex >= 0;
  const canRedo = historyIndex < history.length - 1;

  const record = useCallback((entry: Omit<ObjectHistoryEntry, "timestamp">) => {
    setHistory((prev) => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push({ ...entry, timestamp: Date.now() });
      
      if (newHistory.length > 50) {
        newHistory.shift();
        return newHistory;
      }
      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, 49));
  }, [historyIndex]);

  const undo = useCallback((): ObjectHistoryEntry | null => {
    if (!canUndo) return null;
    const entry = history[historyIndex];
    setHistoryIndex((prev) => prev - 1);
    return entry;
  }, [canUndo, history, historyIndex]);

  const redo = useCallback((): ObjectHistoryEntry | null => {
    if (!canRedo) return null;
    const entry = history[historyIndex + 1];
    setHistoryIndex((prev) => prev + 1);
    return entry;
  }, [canRedo, history, historyIndex]);

  const clear = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    record,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    currentIndex: historyIndex,
    historyLength: history.length,
  };
}
