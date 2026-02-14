import { useState, useCallback, useEffect, useMemo } from "react";
import type { GameObject } from "@shared/schema";

const STORAGE_KEY = "versionHistory";
const MAX_CHECKPOINTS = 20;

export interface Checkpoint {
  id: string;
  name: string;
  timestamp: number;
  screenId: string;
  snapshot: SerializedGameObject[];
}

export interface SerializedGameObject {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  locked: boolean;
  zIndex: number;
  customId: string | null;
  classes: string[];
  tags: string[];
  dataKey: string | null;
  mediaUrl: string | null;
  audioUrl: string | null;
  metadata: unknown;
}

function generateCheckpointId(): string {
  return `cp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function serializeGameObject(obj: GameObject): SerializedGameObject {
  return {
    id: obj.id,
    name: obj.name,
    type: obj.type,
    x: obj.x,
    y: obj.y,
    width: obj.width,
    height: obj.height,
    rotation: obj.rotation ?? 0,
    scaleX: obj.scaleX ?? 1,
    scaleY: obj.scaleY ?? 1,
    opacity: obj.opacity ?? 1,
    visible: obj.visible ?? true,
    locked: obj.locked ?? false,
    zIndex: obj.zIndex ?? 0,
    customId: obj.customId ?? null,
    classes: obj.classes ?? [],
    tags: obj.tags ?? [],
    dataKey: obj.dataKey ?? null,
    mediaUrl: obj.mediaUrl ?? null,
    audioUrl: obj.audioUrl ?? null,
    metadata: obj.metadata ?? null,
  };
}

function loadCheckpointsFromStorage(): Checkpoint[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load checkpoints from localStorage:", e);
  }
  return [];
}

function saveCheckpointsToStorage(checkpoints: Checkpoint[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checkpoints));
  } catch (e) {
    console.error("Failed to save checkpoints to localStorage:", e);
  }
}

export interface UseVersionHistoryOptions {
  screenId: string | undefined;
  objects: GameObject[];
  onRestoreObjects: (updates: Array<{ id: string; updates: Partial<GameObject> }>) => void;
}

export function useVersionHistory({ screenId, objects, onRestoreObjects }: UseVersionHistoryOptions) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(() => loadCheckpointsFromStorage());
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number | null>(null);

  useEffect(() => {
    const loaded = loadCheckpointsFromStorage();
    setCheckpoints(loaded);
    
    const screenCheckpoints = loaded.filter(cp => cp.screenId === screenId);
    if (screenCheckpoints.length > 0) {
      const latestTimestamp = Math.max(...screenCheckpoints.map(cp => cp.timestamp));
      setLastSavedTimestamp(latestTimestamp);
    }
  }, [screenId]);

  const screenCheckpoints = useMemo(() => {
    if (!screenId) return [];
    return checkpoints
      .filter(cp => cp.screenId === screenId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [checkpoints, screenId]);

  const saveCheckpoint = useCallback((name: string) => {
    if (!screenId || objects.length === 0) {
      console.warn("Cannot save checkpoint: no screen selected or no objects");
      return null;
    }

    const checkpoint: Checkpoint = {
      id: generateCheckpointId(),
      name: name.trim() || `Checkpoint ${new Date().toLocaleString()}`,
      timestamp: Date.now(),
      screenId,
      snapshot: objects.map(serializeGameObject),
    };

    setCheckpoints(prev => {
      const updated = [checkpoint, ...prev];
      if (updated.length > MAX_CHECKPOINTS) {
        updated.pop();
      }
      saveCheckpointsToStorage(updated);
      return updated;
    });

    setLastSavedTimestamp(checkpoint.timestamp);
    return checkpoint;
  }, [screenId, objects]);

  const restoreCheckpoint = useCallback((checkpointId: string) => {
    const checkpoint = checkpoints.find(cp => cp.id === checkpointId);
    if (!checkpoint) {
      console.warn("Checkpoint not found:", checkpointId);
      return false;
    }

    const updates: Array<{ id: string; updates: Partial<GameObject> }> = [];
    
    for (const savedObj of checkpoint.snapshot) {
      const currentObj = objects.find(o => o.id === savedObj.id);
      if (currentObj) {
        updates.push({
          id: savedObj.id,
          updates: {
            x: savedObj.x,
            y: savedObj.y,
            width: savedObj.width,
            height: savedObj.height,
            rotation: savedObj.rotation,
            scaleX: savedObj.scaleX,
            scaleY: savedObj.scaleY,
            opacity: savedObj.opacity,
            visible: savedObj.visible,
            locked: savedObj.locked,
            zIndex: savedObj.zIndex,
          },
        });
      }
    }

    if (updates.length > 0) {
      onRestoreObjects(updates);
    }

    return true;
  }, [checkpoints, objects, onRestoreObjects]);

  const deleteCheckpoint = useCallback((checkpointId: string) => {
    setCheckpoints(prev => {
      const updated = prev.filter(cp => cp.id !== checkpointId);
      saveCheckpointsToStorage(updated);
      return updated;
    });
  }, []);

  const renameCheckpoint = useCallback((checkpointId: string, newName: string) => {
    setCheckpoints(prev => {
      const updated = prev.map(cp => 
        cp.id === checkpointId ? { ...cp, name: newName.trim() } : cp
      );
      saveCheckpointsToStorage(updated);
      return updated;
    });
  }, []);

  const clearAllCheckpoints = useCallback(() => {
    setCheckpoints([]);
    saveCheckpointsToStorage([]);
    setLastSavedTimestamp(null);
  }, []);

  const getRelativeTime = useCallback((timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }, []);

  const formatTimestamp = useCallback((timestamp: number): string => {
    return new Date(timestamp).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, []);

  return {
    checkpoints: screenCheckpoints,
    allCheckpoints: checkpoints,
    lastSavedTimestamp,
    saveCheckpoint,
    restoreCheckpoint,
    deleteCheckpoint,
    renameCheckpoint,
    clearAllCheckpoints,
    getRelativeTime,
    formatTimestamp,
    checkpointCount: screenCheckpoints.length,
    maxCheckpoints: MAX_CHECKPOINTS,
  };
}

export type VersionHistoryAPI = ReturnType<typeof useVersionHistory>;
