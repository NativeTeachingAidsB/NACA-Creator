import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "indigamate-user-settings";

export type NacaEnvironment = 'development' | 'production';

export const NACA_SERVERS: Record<NacaEnvironment, { url: string; label: string; description: string }> = {
  development: {
    url: 'https://native-tongue-lexicon-brandon612.replit.app',
    label: 'Development',
    description: 'Native Tongue Lexicon dev server',
  },
  production: {
    url: 'https://naca.community',
    label: 'Production',
    description: 'NACA Community production server',
  },
};

export interface UserSettings {
  videoHelpEnabled: boolean;
  showHelpTooltips: boolean;
  autoPlayVideos: boolean;
  showShortcutHints: boolean;
  theme: 'light' | 'dark' | 'system';
  nacaEnvironment: NacaEnvironment;
  nacaSubdomain: string;
}

const defaultSettings: UserSettings = {
  videoHelpEnabled: true,
  showHelpTooltips: true,
  autoPlayVideos: true,
  showShortcutHints: true,
  theme: 'system',
  nacaEnvironment: 'production',
  nacaSubdomain: '',
};

const MIGRATION_KEY = "indigamate-settings-version";
const CURRENT_VERSION = 2; // Bump when migrations needed

function loadSettings(): UserSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const settings = { ...defaultSettings, ...parsed };
      
      // Migration: v1 -> v2 (switch default from development to production)
      const storedVersion = parseInt(localStorage.getItem(MIGRATION_KEY) || '1', 10);
      if (storedVersion < 2 && settings.nacaEnvironment === 'development') {
        console.log('[Settings] Migrating: switching NACA server from development to production');
        settings.nacaEnvironment = 'production';
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        localStorage.setItem(MIGRATION_KEY, String(CURRENT_VERSION));
      }
      
      return settings;
    }
  } catch (e) {
    console.warn("Failed to load user settings from localStorage", e);
  }
  localStorage.setItem(MIGRATION_KEY, String(CURRENT_VERSION));
  return defaultSettings;
}

function saveSettings(settings: UserSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn("Failed to save user settings to localStorage", e);
  }
}

export function useUserSettings() {
  const [settings, setSettingsState] = useState<UserSettings>(loadSettings);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          setSettingsState(JSON.parse(e.newValue));
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    setSettingsState(prev => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(defaultSettings);
    saveSettings(defaultSettings);
  }, []);

  return {
    settings,
    updateSettings,
    resetSettings,
    isVideoHelpEnabled: settings.videoHelpEnabled,
    isHelpTooltipsEnabled: settings.showHelpTooltips,
  };
}

export function useVideoHelpSetting() {
  const { settings, updateSettings } = useUserSettings();
  
  const toggleVideoHelp = useCallback(() => {
    updateSettings({ videoHelpEnabled: !settings.videoHelpEnabled });
  }, [settings.videoHelpEnabled, updateSettings]);

  return {
    videoHelpEnabled: settings.videoHelpEnabled,
    toggleVideoHelp,
    setVideoHelpEnabled: (enabled: boolean) => updateSettings({ videoHelpEnabled: enabled }),
  };
}
