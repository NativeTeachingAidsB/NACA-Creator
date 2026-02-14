import { useState, useEffect, useCallback, useRef } from "react";

interface PanelState {
  width: number;
  isCollapsed: boolean;
  collapsedSections: string[];
  activeGroup: string;
  activeTab: string;
}

interface PanelConfig {
  defaultWidth: number;
  minWidth: number;
  maxWidth: number;
  collapsedWidth: number;
}

const DEFAULT_LEFT_PANEL: PanelConfig = {
  defaultWidth: 280,
  minWidth: 200,
  maxWidth: 400,
  collapsedWidth: 48,
};

const DEFAULT_RIGHT_PANEL: PanelConfig = {
  defaultWidth: 320,
  minWidth: 250,
  maxWidth: 450,
  collapsedWidth: 48,
};

const STORAGE_KEY = "activity-editor-panel-state";

type WorkspacePreset = 'minimal' | 'balanced' | 'full';

const WORKSPACE_PRESETS: Record<WorkspacePreset, { 
  label: string;
  description: string;
  left: Pick<PanelState, 'width' | 'isCollapsed'>;
  right: Pick<PanelState, 'width' | 'isCollapsed'>;
}> = {
  minimal: {
    label: 'Minimal',
    description: 'Maximize canvas space with collapsed panels',
    left: { width: DEFAULT_LEFT_PANEL.defaultWidth, isCollapsed: true },
    right: { width: DEFAULT_RIGHT_PANEL.defaultWidth, isCollapsed: true },
  },
  balanced: {
    label: 'Balanced',
    description: 'Default layout with panels at comfortable widths',
    left: { width: DEFAULT_LEFT_PANEL.defaultWidth, isCollapsed: false },
    right: { width: DEFAULT_RIGHT_PANEL.defaultWidth, isCollapsed: false },
  },
  full: {
    label: 'Full',
    description: 'Maximum panel widths for detailed work',
    left: { width: DEFAULT_LEFT_PANEL.maxWidth, isCollapsed: false },
    right: { width: DEFAULT_RIGHT_PANEL.maxWidth, isCollapsed: false },
  },
};

interface StoredPanelState {
  left: PanelState;
  right: PanelState;
  activePreset?: WorkspacePreset | null;
}

function loadPanelState(): StoredPanelState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("Failed to load panel state from localStorage", e);
  }
  
  return {
    left: {
      width: DEFAULT_LEFT_PANEL.defaultWidth,
      isCollapsed: false,
      collapsedSections: [],
      activeGroup: "create",
      activeTab: "layers",
    },
    right: {
      width: DEFAULT_RIGHT_PANEL.defaultWidth,
      isCollapsed: false,
      collapsedSections: [],
      activeGroup: "create",
      activeTab: "attributes",
    },
    activePreset: 'balanced' as WorkspacePreset,
  };
}

function savePanelState(state: StoredPanelState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Failed to save panel state to localStorage", e);
  }
}

export function usePanelState() {
  const [state, setState] = useState<StoredPanelState>(() => loadPanelState());
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedSave = useCallback((newState: StoredPanelState) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      savePanelState(newState);
    }, 300);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const setLeftWidth = useCallback((width: number) => {
    setState(prev => {
      const newState = {
        ...prev,
        left: { ...prev.left, width },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const setRightWidth = useCallback((width: number) => {
    setState(prev => {
      const newState = {
        ...prev,
        right: { ...prev.right, width },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const toggleLeftCollapsed = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        left: { ...prev.left, isCollapsed: !prev.left.isCollapsed },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const toggleRightCollapsed = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        right: { ...prev.right, isCollapsed: !prev.right.isCollapsed },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const toggleSectionCollapsed = useCallback((panel: "left" | "right", sectionId: string) => {
    setState(prev => {
      const panelState = prev[panel];
      const isCollapsed = panelState.collapsedSections.includes(sectionId);
      const newCollapsedSections = isCollapsed
        ? panelState.collapsedSections.filter(id => id !== sectionId)
        : [...panelState.collapsedSections, sectionId];
      
      const newState = {
        ...prev,
        [panel]: { ...panelState, collapsedSections: newCollapsedSections },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const isSectionCollapsed = useCallback((panel: "left" | "right", sectionId: string) => {
    return state[panel].collapsedSections.includes(sectionId);
  }, [state]);

  const setRightActiveGroup = useCallback((group: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        right: { ...prev.right, activeGroup: group },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const setRightActiveTab = useCallback((tab: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        right: { ...prev.right, activeTab: tab },
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const applyPreset = useCallback((preset: WorkspacePreset) => {
    const presetConfig = WORKSPACE_PRESETS[preset];
    setState(prev => {
      const newState: StoredPanelState = {
        ...prev,
        left: { ...prev.left, ...presetConfig.left },
        right: { ...prev.right, ...presetConfig.right },
        activePreset: preset,
      };
      savePanelState(newState);
      return newState;
    });
  }, []);

  const clearPreset = useCallback(() => {
    setState(prev => {
      const newState: StoredPanelState = {
        ...prev,
        activePreset: null,
      };
      debouncedSave(newState);
      return newState;
    });
  }, [debouncedSave]);

  const resetToDefaults = useCallback(() => {
    const defaultState: StoredPanelState = {
      left: {
        width: DEFAULT_LEFT_PANEL.defaultWidth,
        isCollapsed: false,
        collapsedSections: [],
        activeGroup: "create",
        activeTab: "layers",
      },
      right: {
        width: DEFAULT_RIGHT_PANEL.defaultWidth,
        isCollapsed: false,
        collapsedSections: [],
        activeGroup: "create",
        activeTab: "attributes",
      },
      activePreset: 'balanced',
    };
    setState(defaultState);
    savePanelState(defaultState);
  }, []);

  const setLeftWidthWithClearPreset = useCallback((width: number) => {
    setLeftWidth(width);
    clearPreset();
  }, [setLeftWidth, clearPreset]);

  const setRightWidthWithClearPreset = useCallback((width: number) => {
    setRightWidth(width);
    clearPreset();
  }, [setRightWidth, clearPreset]);

  const toggleLeftCollapsedWithClearPreset = useCallback(() => {
    toggleLeftCollapsed();
    clearPreset();
  }, [toggleLeftCollapsed, clearPreset]);

  const toggleRightCollapsedWithClearPreset = useCallback(() => {
    toggleRightCollapsed();
    clearPreset();
  }, [toggleRightCollapsed, clearPreset]);

  return {
    leftPanel: {
      ...state.left,
      config: DEFAULT_LEFT_PANEL,
      setWidth: setLeftWidthWithClearPreset,
      toggleCollapsed: toggleLeftCollapsedWithClearPreset,
    },
    rightPanel: {
      ...state.right,
      config: DEFAULT_RIGHT_PANEL,
      setWidth: setRightWidthWithClearPreset,
      toggleCollapsed: toggleRightCollapsedWithClearPreset,
      setActiveGroup: setRightActiveGroup,
      setActiveTab: setRightActiveTab,
    },
    toggleSectionCollapsed,
    isSectionCollapsed,
    resetToDefaults,
    workspacePresets: WORKSPACE_PRESETS,
    activePreset: state.activePreset,
    applyPreset,
  };
}

export type { PanelState, PanelConfig, WorkspacePreset };
export { WORKSPACE_PRESETS };
