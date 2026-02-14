import { useState, useEffect, useCallback, useMemo } from "react";

export interface DesignToken {
  id: string;
  name: string;
  type: 'color';
  value: string;
}

const STORAGE_KEY = 'designTokens';

const DEFAULT_TOKENS: DesignToken[] = [
  { id: 'primary', name: 'Primary', type: 'color', value: '#3b82f6' },
  { id: 'secondary', name: 'Secondary', type: 'color', value: '#6b7280' },
  { id: 'accent', name: 'Accent', type: 'color', value: '#10b981' },
];

function generateId(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function loadTokensFromStorage(): DesignToken[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load design tokens from localStorage:', e);
  }
  return DEFAULT_TOKENS;
}

function saveTokensToStorage(tokens: DesignToken[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch (e) {
    console.error('Failed to save design tokens to localStorage:', e);
  }
}

export function useDesignTokens() {
  const [tokens, setTokens] = useState<DesignToken[]>(() => loadTokensFromStorage());

  useEffect(() => {
    saveTokensToStorage(tokens);
  }, [tokens]);

  const addToken = useCallback((name: string, value: string) => {
    const newToken: DesignToken = {
      id: generateId(),
      name,
      type: 'color',
      value,
    };
    setTokens(prev => [...prev, newToken]);
    return newToken;
  }, []);

  const updateToken = useCallback((id: string, updates: Partial<Omit<DesignToken, 'id' | 'type'>>) => {
    setTokens(prev => prev.map(token => 
      token.id === id ? { ...token, ...updates } : token
    ));
  }, []);

  const deleteToken = useCallback((id: string) => {
    setTokens(prev => prev.filter(token => token.id !== id));
  }, []);

  const getToken = useCallback((id: string): DesignToken | undefined => {
    return tokens.find(token => token.id === id);
  }, [tokens]);

  const getTokenValue = useCallback((id: string): string | undefined => {
    const token = tokens.find(t => t.id === id);
    return token?.value;
  }, [tokens]);

  const colorTokens = useMemo(() => 
    tokens.filter(t => t.type === 'color'),
    [tokens]
  );

  return {
    tokens,
    colorTokens,
    addToken,
    updateToken,
    deleteToken,
    getToken,
    getTokenValue,
  };
}

export type UseDesignTokensReturn = ReturnType<typeof useDesignTokens>;
