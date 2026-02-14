import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';

export interface SVGObjectRef {
  id: string;
  type: string;
  displayName: string;
  parentId?: string;
  hasChildren: boolean;
}

export interface SelectionLineage {
  id: string;
  displayName: string;
  type: string;
}

export interface SelectionState {
  selectedIds: Set<string>;
  focusedObjectId: string | null;
  isolatedGroupId: string | null;
  isolationDepth: number;
  selectionLineage: SelectionLineage[];
  lastClickedId: string | null;
  lastClickTime: number;
}

type SelectionAction =
  | { type: 'SELECT_ONE'; id: string; lineage?: SelectionLineage[] }
  | { type: 'TOGGLE_SELECT'; id: string }
  | { type: 'ADD_TO_SELECTION'; ids: string[] }
  | { type: 'ADD_RANGE'; fromId: string; toId: string; allIds: string[] }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_FOCUSED'; id: string | null }
  | { type: 'ENTER_ISOLATION'; groupId: string; groupName: string; fullLineage?: SelectionLineage[]; depth?: number }
  | { type: 'EXIT_ISOLATION' }
  | { type: 'EXIT_TO_ROOT' }
  | { type: 'SET_LINEAGE'; lineage: SelectionLineage[] }
  | { type: 'RECORD_CLICK'; id: string; time: number }
  | { type: 'REPLACE_SELECTION'; ids: string[] };

const initialState: SelectionState = {
  selectedIds: new Set(),
  focusedObjectId: null,
  isolatedGroupId: null,
  isolationDepth: 0,
  selectionLineage: [],
  lastClickedId: null,
  lastClickTime: 0,
};

function selectionReducer(state: SelectionState, action: SelectionAction): SelectionState {
  switch (action.type) {
    case 'SELECT_ONE': {
      const newSelected = new Set([action.id]);
      return {
        ...state,
        selectedIds: newSelected,
        focusedObjectId: action.id,
        selectionLineage: action.lineage || state.selectionLineage,
      };
    }

    case 'TOGGLE_SELECT': {
      const newSelected = new Set(state.selectedIds);
      if (newSelected.has(action.id)) {
        newSelected.delete(action.id);
      } else {
        newSelected.add(action.id);
      }
      return {
        ...state,
        selectedIds: newSelected,
        focusedObjectId: action.id,
      };
    }

    case 'ADD_TO_SELECTION': {
      const newSelected = new Set(state.selectedIds);
      action.ids.forEach(id => newSelected.add(id));
      return {
        ...state,
        selectedIds: newSelected,
        focusedObjectId: action.ids[action.ids.length - 1] || state.focusedObjectId,
      };
    }

    case 'ADD_RANGE': {
      const fromIndex = action.allIds.indexOf(action.fromId);
      const toIndex = action.allIds.indexOf(action.toId);
      if (fromIndex === -1 || toIndex === -1) return state;

      const start = Math.min(fromIndex, toIndex);
      const end = Math.max(fromIndex, toIndex);
      const rangeIds = action.allIds.slice(start, end + 1);

      const newSelected = new Set(state.selectedIds);
      rangeIds.forEach(id => newSelected.add(id));

      return {
        ...state,
        selectedIds: newSelected,
        focusedObjectId: action.toId,
      };
    }

    case 'REPLACE_SELECTION': {
      return {
        ...state,
        selectedIds: new Set(action.ids),
        focusedObjectId: action.ids[0] || null,
      };
    }

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedIds: new Set(),
        focusedObjectId: null,
        selectionLineage: state.isolatedGroupId ? state.selectionLineage : [],
      };

    case 'SET_FOCUSED':
      return {
        ...state,
        focusedObjectId: action.id,
      };

    case 'ENTER_ISOLATION': {
      const newLineage = action.fullLineage 
        ? action.fullLineage 
        : [...state.selectionLineage, {
            id: action.groupId,
            displayName: action.groupName,
            type: 'group',
          }];
      return {
        ...state,
        isolatedGroupId: action.groupId,
        isolationDepth: action.fullLineage ? action.fullLineage.length : (action.depth ?? state.isolationDepth + 1),
        selectionLineage: newLineage,
        selectedIds: new Set(),
        focusedObjectId: null,
      };
    }

    case 'EXIT_ISOLATION': {
      if (state.isolationDepth <= 1) {
        return {
          ...state,
          isolatedGroupId: null,
          isolationDepth: 0,
          selectionLineage: [],
          selectedIds: new Set(),
          focusedObjectId: null,
        };
      }
      const newLineage = state.selectionLineage.slice(0, -1);
      const newIsolatedId = newLineage.length > 0 ? newLineage[newLineage.length - 1].id : null;
      return {
        ...state,
        isolatedGroupId: newIsolatedId,
        isolationDepth: state.isolationDepth - 1,
        selectionLineage: newLineage,
        selectedIds: new Set(),
        focusedObjectId: null,
      };
    }

    case 'EXIT_TO_ROOT':
      return {
        ...state,
        isolatedGroupId: null,
        isolationDepth: 0,
        selectionLineage: [],
        selectedIds: new Set(),
        focusedObjectId: null,
      };

    case 'SET_LINEAGE':
      return {
        ...state,
        selectionLineage: action.lineage,
      };

    case 'RECORD_CLICK':
      return {
        ...state,
        lastClickedId: action.id,
        lastClickTime: action.time,
      };

    default:
      return state;
  }
}

interface SelectionContextValue {
  state: SelectionState;
  selectOne: (id: string, lineage?: SelectionLineage[]) => void;
  toggleSelect: (id: string) => void;
  addToSelection: (ids: string[]) => void;
  addRange: (fromId: string, toId: string, allIds: string[]) => void;
  replaceSelection: (ids: string[]) => void;
  clearSelection: () => void;
  setFocused: (id: string | null) => void;
  enterIsolation: (groupId: string, groupName: string, fullLineage?: SelectionLineage[]) => void;
  exitIsolation: () => void;
  exitToRoot: () => void;
  setLineage: (lineage: SelectionLineage[]) => void;
  recordClick: (id: string) => void;
  isDoubleClick: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  isFocused: (id: string) => boolean;
  isIsolated: (id: string) => boolean;
  isInsideIsolation: (objectId: string, objectParentId: string | undefined, objectMap: Map<string, any>) => boolean;
}

const SelectionContext = createContext<SelectionContextValue | null>(null);

const DOUBLE_CLICK_THRESHOLD = 300;

export function SelectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(selectionReducer, initialState);

  const selectOne = useCallback((id: string, lineage?: SelectionLineage[]) => {
    dispatch({ type: 'SELECT_ONE', id, lineage });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    dispatch({ type: 'TOGGLE_SELECT', id });
  }, []);

  const addToSelection = useCallback((ids: string[]) => {
    dispatch({ type: 'ADD_TO_SELECTION', ids });
  }, []);

  const addRange = useCallback((fromId: string, toId: string, allIds: string[]) => {
    dispatch({ type: 'ADD_RANGE', fromId, toId, allIds });
  }, []);

  const replaceSelection = useCallback((ids: string[]) => {
    dispatch({ type: 'REPLACE_SELECTION', ids });
  }, []);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTION' });
  }, []);

  const setFocused = useCallback((id: string | null) => {
    dispatch({ type: 'SET_FOCUSED', id });
  }, []);

  const enterIsolation = useCallback((groupId: string, groupName: string, fullLineage?: SelectionLineage[]) => {
    dispatch({ type: 'ENTER_ISOLATION', groupId, groupName, fullLineage });
  }, []);

  const exitIsolation = useCallback(() => {
    dispatch({ type: 'EXIT_ISOLATION' });
  }, []);

  const exitToRoot = useCallback(() => {
    dispatch({ type: 'EXIT_TO_ROOT' });
  }, []);

  const setLineage = useCallback((lineage: SelectionLineage[]) => {
    dispatch({ type: 'SET_LINEAGE', lineage });
  }, []);

  const recordClick = useCallback((id: string) => {
    dispatch({ type: 'RECORD_CLICK', id, time: Date.now() });
  }, []);

  const isDoubleClick = useCallback((id: string): boolean => {
    const now = Date.now();
    const isDouble = state.lastClickedId === id && 
                     (now - state.lastClickTime) < DOUBLE_CLICK_THRESHOLD;
    return isDouble;
  }, [state.lastClickedId, state.lastClickTime]);

  const isSelected = useCallback((id: string): boolean => {
    return state.selectedIds.has(id);
  }, [state.selectedIds]);

  const isFocused = useCallback((id: string): boolean => {
    return state.focusedObjectId === id;
  }, [state.focusedObjectId]);

  const isIsolated = useCallback((id: string): boolean => {
    return state.isolatedGroupId === id;
  }, [state.isolatedGroupId]);

  const isInsideIsolation = useCallback((
    objectId: string, 
    objectParentId: string | undefined, 
    objectMap: Map<string, any>
  ): boolean => {
    if (!state.isolatedGroupId) return true;
    
    if (objectId === state.isolatedGroupId) return true;
    
    let currentId = objectParentId;
    while (currentId) {
      if (currentId === state.isolatedGroupId) return true;
      const parent = objectMap.get(currentId);
      currentId = parent?.parentId;
    }
    
    return false;
  }, [state.isolatedGroupId]);

  const value = useMemo(() => ({
    state,
    selectOne,
    toggleSelect,
    addToSelection,
    addRange,
    replaceSelection,
    clearSelection,
    setFocused,
    enterIsolation,
    exitIsolation,
    exitToRoot,
    setLineage,
    recordClick,
    isDoubleClick,
    isSelected,
    isFocused,
    isIsolated,
    isInsideIsolation,
  }), [
    state,
    selectOne,
    toggleSelect,
    addToSelection,
    addRange,
    replaceSelection,
    clearSelection,
    setFocused,
    enterIsolation,
    exitIsolation,
    exitToRoot,
    setLineage,
    recordClick,
    isDoubleClick,
    isSelected,
    isFocused,
    isIsolated,
    isInsideIsolation,
  ]);

  return (
    <SelectionContext.Provider value={value}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const context = useContext(SelectionContext);
  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }
  return context;
}

export function useSelectionState() {
  const { state } = useSelection();
  return state;
}
