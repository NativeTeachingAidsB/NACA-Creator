import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback, useMemo } from "react";
import { apiRequest } from "@/lib/queryClient";
import type {
  SettingsProfile,
  SettingsProfileData,
  SiteSettings,
  ThemeConfig,
  ComponentOptions,
  WorkspaceConfig,
  KeyboardBinding,
} from "@shared/schema";
import { defaultSettingsProfileData } from "@shared/schema";

const STORAGE_KEY = "indigamate-settings-profile";
const STORAGE_TIMESTAMP_KEY = "indigamate-settings-timestamp";

type SettingsSection = "site" | "theme" | "components" | "workspace" | "keyboardBindings";

export const settingsKeys = {
  all: ["settings-profiles"] as const,
  lists: () => [...settingsKeys.all, "list"] as const,
  current: () => [...settingsKeys.all, "current"] as const,
  profile: (id: string) => [...settingsKeys.all, "profile", id] as const,
  community: (communityId: string) => [...settingsKeys.all, "community", communityId] as const,
};

function loadFromLocalStorage(): SettingsProfileData | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn("[SettingsProfiles] Failed to load from localStorage", e);
  }
  return null;
}

function saveToLocalStorage(data: SettingsProfileData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_TIMESTAMP_KEY, Date.now().toString());
  } catch (e) {
    console.warn("[SettingsProfiles] Failed to save to localStorage", e);
  }
}

function getLocalTimestamp(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_TIMESTAMP_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

function mergeProfileData(
  base: SettingsProfileData,
  updates: Partial<SettingsProfileData>
): SettingsProfileData {
  return {
    site: { ...base.site, ...updates.site },
    theme: { 
      ...base.theme, 
      ...updates.theme,
      communityColors: { 
        ...base.theme.communityColors, 
        ...updates.theme?.communityColors 
      }
    },
    components: {
      timeline: { ...base.components.timeline, ...updates.components?.timeline },
      canvas: { ...base.components.canvas, ...updates.components?.canvas },
      objects: { ...base.components.objects, ...updates.components?.objects },
      selection: { ...base.components.selection, ...updates.components?.selection },
    },
    workspace: { ...base.workspace, ...updates.workspace },
    keyboardBindings: updates.keyboardBindings ?? base.keyboardBindings,
  };
}

export function useSettingsProfile() {
  const queryClient = useQueryClient();
  const [localData] = useState<SettingsProfileData | null>(() => loadFromLocalStorage());

  const { data: remoteProfile, isLoading, error, refetch } = useQuery({
    queryKey: settingsKeys.current(),
    queryFn: async (): Promise<SettingsProfile | null> => {
      try {
        const res = await fetch("/api/settings-profiles/current", { credentials: "include" });
        if (!res.ok) {
          if (res.status === 404) return null;
          throw new Error(`Failed to fetch settings: ${res.status}`);
        }
        return res.json();
      } catch (e) {
        console.warn("[SettingsProfiles] API fetch failed, using local fallback", e);
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const settings = useMemo<SettingsProfileData>(() => {
    if (remoteProfile?.data) {
      const merged = mergeProfileData(defaultSettingsProfileData, remoteProfile.data);
      saveToLocalStorage(merged);
      return merged;
    }
    if (localData) {
      return mergeProfileData(defaultSettingsProfileData, localData);
    }
    return defaultSettingsProfileData;
  }, [remoteProfile, localData]);

  const profileId = remoteProfile?.id;

  const initializeGlobalMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/settings-profiles/initialize-global");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() });
    },
  });

  useEffect(() => {
    if (!isLoading && !remoteProfile && !error) {
      initializeGlobalMutation.mutate();
    }
  }, [isLoading, remoteProfile, error]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        refetch();
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [refetch]);

  return {
    settings,
    profileId,
    isLoading,
    error,
    refetch,
  };
}

export function useUpdateSettings<S extends SettingsSection>(section: S) {
  const queryClient = useQueryClient();
  const { profileId, settings } = useSettingsProfile();

  type SectionData = S extends "site"
    ? SiteSettings
    : S extends "theme"
    ? ThemeConfig
    : S extends "components"
    ? ComponentOptions
    : S extends "workspace"
    ? WorkspaceConfig
    : S extends "keyboardBindings"
    ? KeyboardBinding[]
    : never;

  const mutation = useMutation({
    mutationFn: async (updates: Partial<SectionData>) => {
      const currentData = settings;
      let newSectionData: SectionData;

      if (section === "keyboardBindings") {
        newSectionData = updates as SectionData;
      } else {
        newSectionData = {
          ...(currentData[section] as SectionData),
          ...updates,
        } as SectionData;
      }

      const updatedProfileData: Partial<SettingsProfileData> = {
        [section]: newSectionData,
      };

      const mergedData = mergeProfileData(currentData, updatedProfileData);
      saveToLocalStorage(mergedData);

      if (profileId) {
        const res = await apiRequest(
          "PATCH",
          `/api/settings-profiles/${profileId}/data`,
          updatedProfileData
        );
        return res.json();
      }

      return mergedData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() });
    },
    onError: (error) => {
      console.error(`[SettingsProfiles] Failed to update ${section}:`, error);
    },
  });

  const update = useCallback(
    (updates: Partial<SectionData>) => {
      mutation.mutate(updates);
    },
    [mutation]
  );

  return {
    update,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export function useResetSettings() {
  const queryClient = useQueryClient();
  const { profileId } = useSettingsProfile();

  const mutation = useMutation({
    mutationFn: async () => {
      saveToLocalStorage(defaultSettingsProfileData);

      if (profileId) {
        const res = await apiRequest(
          "PATCH",
          `/api/settings-profiles/${profileId}/data`,
          defaultSettingsProfileData
        );
        return res.json();
      }

      return defaultSettingsProfileData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.current() });
    },
  });

  return {
    reset: mutation.mutate,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

export function useCommunityTheme(communityId: string | undefined) {
  const { settings } = useSettingsProfile();
  const { update: updateTheme } = useUpdateSettings("theme");

  const { data: communityProfile } = useQuery({
    queryKey: settingsKeys.community(communityId || ""),
    queryFn: async (): Promise<SettingsProfile | null> => {
      if (!communityId) return null;
      try {
        const res = await fetch(`/api/settings-profiles/community/${communityId}`, {
          credentials: "include",
        });
        if (!res.ok) return null;
        return res.json();
      } catch {
        return null;
      }
    },
    enabled: !!communityId,
    staleTime: 10 * 60 * 1000,
  });

  const applyCommunityTheme = useCallback(() => {
    if (!communityProfile?.data?.theme) return;

    const communityTheme = communityProfile.data.theme;
    updateTheme({
      communityFontFamily: communityTheme.communityFontFamily,
      communityFontUrl: communityTheme.communityFontUrl,
      communityColors: communityTheme.communityColors,
    });
  }, [communityProfile, updateTheme]);

  const clearCommunityTheme = useCallback(() => {
    updateTheme({
      communityFontFamily: null,
      communityFontUrl: null,
      communityColors: { primary: null, secondary: null, accent: null },
    });
  }, [updateTheme]);

  const hasCommunityFont = useMemo(() => {
    return !!settings.theme.communityFontFamily;
  }, [settings.theme.communityFontFamily]);

  const communityFont = useMemo(() => {
    return settings.theme.communityFontFamily || undefined;
  }, [settings.theme.communityFontFamily]);

  const communityColors = useMemo(() => {
    return settings.theme.communityColors;
  }, [settings.theme.communityColors]);

  return {
    communityProfile,
    hasCommunityFont,
    communityFont,
    communityColors,
    applyCommunityTheme,
    clearCommunityTheme,
  };
}

export function useKeyboardBindingsSettings() {
  const { settings } = useSettingsProfile();
  const { update } = useUpdateSettings("keyboardBindings");

  const bindings = useMemo(() => {
    return settings.keyboardBindings || [];
  }, [settings.keyboardBindings]);

  const updateBinding = useCallback(
    (index: number, updates: Partial<KeyboardBinding>) => {
      const newBindings = [...bindings];
      newBindings[index] = { ...newBindings[index], ...updates };
      update(newBindings as any);
    },
    [bindings, update]
  );

  const addBinding = useCallback(
    (binding: KeyboardBinding) => {
      update([...bindings, binding] as any);
    },
    [bindings, update]
  );

  const removeBinding = useCallback(
    (index: number) => {
      const newBindings = bindings.filter((_, i) => i !== index);
      update(newBindings as any);
    },
    [bindings, update]
  );

  const resetBindings = useCallback(() => {
    update([] as any);
  }, [update]);

  const findConflict = useCallback(
    (key: string, modifiers: string[], excludeIndex?: number): KeyboardBinding | null => {
      return (
        bindings.find((binding, index) => {
          if (excludeIndex !== undefined && index === excludeIndex) return false;
          if (!binding.enabled) return false;
          return (
            binding.key === key &&
            binding.modifiers.length === modifiers.length &&
            binding.modifiers.every((m) => modifiers.includes(m))
          );
        }) || null
      );
    },
    [bindings]
  );

  return {
    bindings,
    updateBinding,
    addBinding,
    removeBinding,
    resetBindings,
    findConflict,
  };
}

const injectedFonts = new Map<string, string>();

const ALLOWED_FONT_DOMAINS = [
  'fonts.gstatic.com',
  'fonts.googleapis.com',
  'naca.community',
  'cdn.naca.community',
  'static.naca.community',
];

function isValidFontUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_FONT_DOMAINS.some(domain => 
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    return false;
  }
}

function sanitizeFontFamily(name: string): string {
  return name.replace(/['"\\<>]/g, '').trim().slice(0, 100);
}

function injectFontFace(fontFamily: string, fontUrl: string): string | null {
  const sanitizedFamily = sanitizeFontFamily(fontFamily);
  if (!sanitizedFamily) return null;
  
  if (!isValidFontUrl(fontUrl)) {
    console.warn('[Theme] Blocked font URL from untrusted domain:', fontUrl);
    return null;
  }
  
  const existingStyleId = injectedFonts.get(sanitizedFamily);
  if (existingStyleId && document.getElementById(existingStyleId)) {
    return existingStyleId;
  }
  
  const styleId = `font-${sanitizedFamily.replace(/[^a-z0-9]/gi, '-')}-${Date.now()}`;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    @font-face {
      font-family: '${sanitizedFamily}';
      src: url('${fontUrl}') format('woff2'),
           url('${fontUrl.replace('.woff2', '.woff')}') format('woff');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }
  `;
  document.head.appendChild(style);
  injectedFonts.set(sanitizedFamily, styleId);
  return styleId;
}

function removeFontFace(fontFamily: string): void {
  const sanitizedFamily = sanitizeFontFamily(fontFamily);
  const styleId = injectedFonts.get(sanitizedFamily);
  if (styleId) {
    const styleEl = document.getElementById(styleId);
    if (styleEl) {
      styleEl.remove();
    }
    injectedFonts.delete(sanitizedFamily);
  }
}

export function useApplyTheme() {
  const { settings } = useSettingsProfile();
  const { theme } = settings;

  useEffect(() => {
    const root = document.documentElement;
    let currentFontStyleId: string | null = null;
    
    if (theme.communityFontFamily && theme.communityFontUrl) {
      currentFontStyleId = injectFontFace(theme.communityFontFamily, theme.communityFontUrl);
    }
    
    const fontFamily = theme.communityFontFamily ? 
      sanitizeFontFamily(theme.communityFontFamily) : 
      (theme.fontFamily || 'system-ui');
    root.style.setProperty('--font-family', fontFamily);
    
    root.style.setProperty('--accent-color', theme.accentColor);
    
    if (theme.communityColors?.primary) {
      root.style.setProperty('--community-primary', theme.communityColors.primary);
    } else {
      root.style.removeProperty('--community-primary');
    }
    if (theme.communityColors?.secondary) {
      root.style.setProperty('--community-secondary', theme.communityColors.secondary);
    } else {
      root.style.removeProperty('--community-secondary');
    }
    if (theme.communityColors?.accent) {
      root.style.setProperty('--community-accent', theme.communityColors.accent);
    } else {
      root.style.removeProperty('--community-accent');
    }
    
    const fontSizeMap = { small: '14px', medium: '16px', large: '18px' };
    root.style.setProperty('--base-font-size', fontSizeMap[theme.fontSize] || '16px');
    
    const densityMap = { compact: '0.75rem', cozy: '1rem', comfortable: '1.25rem' };
    root.style.setProperty('--spacing-density', densityMap[theme.density] || '1rem');
    
    const radiusMap = { none: '0', small: '0.25rem', medium: '0.5rem', large: '0.75rem' };
    root.style.setProperty('--border-radius-base', radiusMap[theme.borderRadius] || '0.5rem');
    
    if (theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (theme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    return () => {
      if (theme.communityFontFamily) {
        removeFontFace(theme.communityFontFamily);
      }
    };
  }, [theme]);

  return { theme };
}

export function useThemeSettings() {
  const { settings } = useSettingsProfile();
  const { update, isPending } = useUpdateSettings("theme");

  const theme = settings.theme;

  const setMode = useCallback(
    (mode: ThemeConfig["mode"]) => {
      update({ mode });
    },
    [update]
  );

  const setFontFamily = useCallback(
    (fontFamily: string) => {
      update({ fontFamily });
    },
    [update]
  );

  const setFontSize = useCallback(
    (fontSize: ThemeConfig["fontSize"]) => {
      update({ fontSize });
    },
    [update]
  );

  const setDensity = useCallback(
    (density: ThemeConfig["density"]) => {
      update({ density });
    },
    [update]
  );

  const setAccentColor = useCallback(
    (accentColor: string) => {
      update({ accentColor });
    },
    [update]
  );

  const setBorderRadius = useCallback(
    (borderRadius: ThemeConfig["borderRadius"]) => {
      update({ borderRadius });
    },
    [update]
  );

  return {
    theme,
    isPending,
    setMode,
    setFontFamily,
    setFontSize,
    setDensity,
    setAccentColor,
    setBorderRadius,
  };
}

export function useSiteSettings() {
  const { settings } = useSettingsProfile();
  const { update, isPending } = useUpdateSettings("site");

  const site = settings.site;

  return {
    site,
    isPending,
    update,
    setVideoHelpEnabled: (enabled: boolean) => update({ videoHelpEnabled: enabled }),
    setShowHelpTooltips: (enabled: boolean) => update({ showHelpTooltips: enabled }),
    setAutoPlayVideos: (enabled: boolean) => update({ autoPlayVideos: enabled }),
    setShowShortcutHints: (enabled: boolean) => update({ showShortcutHints: enabled }),
    setAutosaveEnabled: (enabled: boolean) => update({ autosaveEnabled: enabled }),
    setAutosaveInterval: (interval: number) => update({ autosaveInterval: interval }),
    setNotificationsEnabled: (enabled: boolean) => update({ notificationsEnabled: enabled }),
    setConfirmDestructiveActions: (enabled: boolean) => update({ confirmDestructiveActions: enabled }),
    setNacaEnvironment: (env: "development" | "production") => update({ nacaEnvironment: env }),
    setNacaSubdomain: (subdomain: string) => update({ nacaSubdomain: subdomain }),
    setExpertise: (expertise: SiteSettings["expertise"]) => update({ expertise }),
    setResponseStyle: (responseStyle: SiteSettings["responseStyle"]) => update({ responseStyle }),
    setCompletion: (completion: SiteSettings["completion"]) => update({ completion }),
  };
}

export function useComponentOptions() {
  const { settings } = useSettingsProfile();
  const { update, isPending } = useUpdateSettings("components");

  const components = settings.components;

  const updateTimeline = useCallback(
    (updates: Partial<ComponentOptions["timeline"]>) => {
      update({ timeline: { ...components.timeline, ...updates } });
    },
    [components.timeline, update]
  );

  const updateCanvas = useCallback(
    (updates: Partial<ComponentOptions["canvas"]>) => {
      update({ canvas: { ...components.canvas, ...updates } });
    },
    [components.canvas, update]
  );

  const updateObjects = useCallback(
    (updates: Partial<ComponentOptions["objects"]>) => {
      update({ objects: { ...components.objects, ...updates } });
    },
    [components.objects, update]
  );

  const updateSelection = useCallback(
    (updates: Partial<ComponentOptions["selection"]>) => {
      update({ selection: { ...components.selection, ...updates } });
    },
    [components.selection, update]
  );

  return {
    components,
    isPending,
    updateTimeline,
    updateCanvas,
    updateObjects,
    updateSelection,
  };
}

export function useWorkspaceConfig() {
  const { settings } = useSettingsProfile();
  const { update, isPending } = useUpdateSettings("workspace");

  const workspace = settings.workspace;

  return {
    workspace,
    isPending,
    update,
    setPanelLayout: (layout: WorkspaceConfig["panelLayout"]) => update({ panelLayout: layout }),
    setLeftPanelWidth: (width: number) => update({ leftPanelWidth: width }),
    setRightPanelWidth: (width: number) => update({ rightPanelWidth: width }),
    setBottomPanelHeight: (height: number) => update({ bottomPanelHeight: height }),
    setCollapsedPanels: (panels: string[]) => update({ collapsedPanels: panels }),
    setPanelOrder: (order: string[]) => update({ panelOrder: order }),
  };
}
