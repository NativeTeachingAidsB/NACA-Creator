import React, { createContext, useContext, useCallback, useMemo, ReactNode } from "react";
import { useEditorHistory, type EditorHistoryAPI, type HistoryActionType } from "@/hooks/use-history";
import type { GameObject } from "@shared/schema";

interface HistoryContextValue extends EditorHistoryAPI {
  recordMove: (objects: GameObject[], previousPositions: { id: string; x: number; y: number }[]) => void;
  recordPropertyChange: (
    objects: GameObject[],
    previousObjects: GameObject[],
    propertyName: string
  ) => void;
  recordCreate: (object: GameObject) => void;
  recordDelete: (object: GameObject) => void;
  recordZOrderChange: (objects: GameObject[], previousObjects: GameObject[]) => void;
  recordAlignment: (objects: GameObject[], previousObjects: GameObject[], alignmentType: string) => void;
}

const HistoryContext = createContext<HistoryContextValue | null>(null);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const history = useEditorHistory();

  const recordMove = useCallback((
    objects: GameObject[],
    previousPositions: { id: string; x: number; y: number }[]
  ) => {
    const previousObjects = objects.map(obj => {
      const prevPos = previousPositions.find(p => p.id === obj.id);
      return {
        ...obj,
        x: prevPos?.x ?? obj.x,
        y: prevPos?.y ?? obj.y,
      };
    });
    
    const objectNames = objects.map(o => o.name).join(", ");
    const details = objects.length > 1 ? `${objects.length} objects` : undefined;
    
    history.pushEntry("move", objects, previousObjects, details);
  }, [history]);

  const recordPropertyChange = useCallback((
    objects: GameObject[],
    previousObjects: GameObject[],
    propertyName: string
  ) => {
    let actionType: HistoryActionType = "property";
    
    switch (propertyName.toLowerCase()) {
      case "rotation":
        actionType = "rotate";
        break;
      case "scalex":
      case "scaley":
      case "scale":
        actionType = "scale";
        break;
      case "opacity":
        actionType = "opacity";
        break;
      case "visible":
        actionType = "visibility";
        break;
      case "width":
      case "height":
        actionType = "resize";
        break;
      case "x":
      case "y":
        actionType = "move";
        break;
    }
    
    history.pushEntry(actionType, objects, previousObjects, propertyName);
  }, [history]);

  const recordCreate = useCallback((object: GameObject) => {
    const emptySnapshot = {
      ...object,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      opacity: 0,
    };
    history.pushEntry("create", [object], [emptySnapshot], object.name);
  }, [history]);

  const recordDelete = useCallback((object: GameObject) => {
    const emptySnapshot = {
      ...object,
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      opacity: 0,
    };
    history.pushEntry("delete", [emptySnapshot], [object], object.name);
  }, [history]);

  const recordZOrderChange = useCallback((
    objects: GameObject[],
    previousObjects: GameObject[]
  ) => {
    const details = objects.length > 1 ? `${objects.length} objects` : undefined;
    history.pushEntry("z-order", objects, previousObjects, details);
  }, [history]);

  const recordAlignment = useCallback((
    objects: GameObject[],
    previousObjects: GameObject[],
    alignmentType: string
  ) => {
    history.pushEntry("align", objects, previousObjects, alignmentType);
  }, [history]);

  const value = useMemo<HistoryContextValue>(() => ({
    ...history,
    recordMove,
    recordPropertyChange,
    recordCreate,
    recordDelete,
    recordZOrderChange,
    recordAlignment,
  }), [
    history,
    recordMove,
    recordPropertyChange,
    recordCreate,
    recordDelete,
    recordZOrderChange,
    recordAlignment,
  ]);

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistoryContext(): HistoryContextValue {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error("useHistoryContext must be used within a HistoryProvider");
  }
  return context;
}

export function useOptionalHistoryContext(): HistoryContextValue | null {
  return useContext(HistoryContext);
}
