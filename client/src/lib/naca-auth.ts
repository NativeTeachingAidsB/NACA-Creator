// NACA Authentication Service
// Handles token-based authentication for cross-origin API access

export interface NACAAuthToken {
  token: string;
  expiresIn: string;
  expiresAt: number; // Unix timestamp
  user: NACAUser;
}

export interface NACAUser {
  id: string;
  email: string;
  role: 'platform_administrator' | 'community_admin' | 'user';
  displayName?: string;
}

export interface NACAAuthState {
  isAuthenticated: boolean;
  user: NACAUser | null;
  token: string | null;
  expiresAt: number | null;
}

const STORAGE_KEY = 'naca_auth_token';
const TOKEN_REFRESH_MARGIN = 5 * 60 * 1000; // Refresh 5 minutes before expiry

class NACAAuthService {
  private token: string | null = null;
  private user: NACAUser | null = null;
  private expiresAt: number | null = null;
  private refreshTimeout: NodeJS.Timeout | null = null;
  private onAuthChangeCallbacks: ((state: NACAAuthState) => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.extractFromIframeParams();
  }

  // Load token from localStorage
  private loadFromStorage() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as NACAAuthToken;
        
        // Check if token is still valid
        if (data.expiresAt > Date.now()) {
          this.token = data.token;
          this.user = data.user;
          this.expiresAt = data.expiresAt;
          this.scheduleRefresh();
          console.log('[NACA Auth] Loaded token from storage');
        } else {
          // Token expired, clear it
          localStorage.removeItem(STORAGE_KEY);
          console.log('[NACA Auth] Stored token expired, cleared');
        }
      }
    } catch (e) {
      console.warn('[NACA Auth] Failed to load token from storage:', e);
    }
  }

  // Extract token from iframe URL parameters
  private extractFromIframeParams() {
    if (typeof window === 'undefined') return;

    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');
      const community = params.get('community');

      if (token) {
        console.log('[NACA Auth] Found token in URL params');
        
        // Decode and validate the token
        this.setTokenFromJWT(token);
        
        // Store community if provided
        if (community) {
          localStorage.setItem('naca_subdomain', community);
        }

        // Clean up URL (remove token from visible URL for security)
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('token');
        window.history.replaceState({}, '', cleanUrl.toString());
      }
    } catch (e) {
      console.warn('[NACA Auth] Failed to extract token from URL:', e);
    }
  }

  // Decode base64url to string (handles URL-safe characters and padding)
  private base64UrlDecode(str: string): string {
    // Replace URL-safe characters with standard base64 characters
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const pad = base64.length % 4;
    if (pad) {
      base64 += '='.repeat(4 - pad);
    }
    
    return atob(base64);
  }

  // Parse JWT and extract user info
  private setTokenFromJWT(token: string) {
    try {
      // Decode JWT payload (base64url)
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT format');
      }

      const payload = JSON.parse(this.base64UrlDecode(parts[1]));
      
      // Extract expiry (exp claim is in seconds)
      const expiresAt = payload.exp ? payload.exp * 1000 : Date.now() + 24 * 60 * 60 * 1000;
      
      // Extract user info
      const user: NACAUser = {
        id: payload.userId || payload.sub || 'unknown',
        email: payload.email || '',
        role: payload.role || 'user',
        displayName: payload.displayName || payload.name,
      };

      this.token = token;
      this.user = user;
      this.expiresAt = expiresAt;

      // Persist to storage
      this.saveToStorage();
      this.scheduleRefresh();
      this.notifyAuthChange();

      console.log('[NACA Auth] Token set successfully, expires:', new Date(expiresAt));
    } catch (e) {
      console.error('[NACA Auth] Failed to parse JWT:', e);
    }
  }

  // Save token to localStorage
  private saveToStorage() {
    if (typeof window === 'undefined' || !this.token || !this.user || !this.expiresAt) return;

    try {
      const data: NACAAuthToken = {
        token: this.token,
        expiresIn: '24h',
        expiresAt: this.expiresAt,
        user: this.user,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('[NACA Auth] Failed to save token to storage:', e);
    }
  }

  // Schedule token refresh before expiry
  private scheduleRefresh() {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }

    if (!this.expiresAt) return;

    const refreshIn = this.expiresAt - Date.now() - TOKEN_REFRESH_MARGIN;
    if (refreshIn > 0) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshToken();
      }, refreshIn);
      console.log('[NACA Auth] Token refresh scheduled in', Math.round(refreshIn / 60000), 'minutes');
    }
  }

  // Refresh the authentication token
  async refreshToken(): Promise<boolean> {
    const baseUrl = localStorage.getItem('naca_base_url');
    if (!baseUrl || !this.token) {
      console.warn('[NACA Auth] Cannot refresh token: missing baseUrl or token');
      return false;
    }

    try {
      const response = await fetch(`${baseUrl}/api/activity-editor/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokenFromJWT(data.token);
        console.log('[NACA Auth] Token refreshed successfully');
        return true;
      } else {
        console.warn('[NACA Auth] Token refresh failed:', response.status);
        this.clearAuth();
        return false;
      }
    } catch (e) {
      console.error('[NACA Auth] Token refresh error:', e);
      return false;
    }
  }

  // Get authorization headers for API requests
  getAuthHeaders(): HeadersInit & { 'X-Auth-Method'?: string } {
    const headers: HeadersInit & { 'X-Auth-Method'?: string } = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['X-Auth-Method'] = 'token';
    } else {
      headers['X-Auth-Method'] = 'session';
    }

    return headers;
  }

  // Get the current token
  getToken(): string | null {
    return this.token;
  }

  // Get current user
  getUser(): NACAUser | null {
    return this.user;
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.token && !!this.expiresAt && this.expiresAt > Date.now();
  }

  // Get current auth state
  getAuthState(): NACAAuthState {
    return {
      isAuthenticated: this.isAuthenticated(),
      user: this.user,
      token: this.token,
      expiresAt: this.expiresAt,
    };
  }

  // Set token manually (e.g., after login redirect)
  async setToken(token: string): Promise<void> {
    this.setTokenFromJWT(token);
  }

  // Request a new token from NACA (requires existing session)
  async requestToken(nacaBaseUrl: string): Promise<NACAAuthToken | null> {
    try {
      const response = await fetch(`${nacaBaseUrl}/api/activity-editor/auth/token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokenFromJWT(data.token);
        return {
          token: data.token,
          expiresIn: data.expiresIn || '24h',
          expiresAt: this.expiresAt!,
          user: this.user!,
        };
      } else if (response.status === 401) {
        console.log('[NACA Auth] Not authenticated with NACA, need to login');
        return null;
      } else {
        console.error('[NACA Auth] Token request failed:', response.status);
        return null;
      }
    } catch (e) {
      console.error('[NACA Auth] Token request error:', e);
      return null;
    }
  }

  // Redirect to NACA login page
  redirectToLogin(nacaBaseUrl: string, returnUrl?: string): void {
    const currentUrl = returnUrl || window.location.href;
    const loginUrl = `${nacaBaseUrl}/api/login?redirect=${encodeURIComponent(currentUrl)}`;
    window.location.href = loginUrl;
  }

  // Get the Replit OAuth login URL
  getLoginUrl(nacaBaseUrl: string, returnUrl?: string): string {
    const currentUrl = returnUrl || (typeof window !== 'undefined' ? window.location.href : '');
    return `${nacaBaseUrl}/api/login?redirect=${encodeURIComponent(currentUrl)}`;
  }

  // Check if we have an active session with NACA (session-based auth via Replit OAuth)
  async checkSession(nacaBaseUrl: string): Promise<{ authenticated: boolean; user?: NACAUser }> {
    try {
      const response = await fetch(`${nacaBaseUrl}/api/activity-editor/auth/session`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.authenticated && data.user) {
          this.user = data.user;
          console.log('[NACA Auth] Session authenticated:', data.user.email);
          return { authenticated: true, user: data.user };
        }
      }
      return { authenticated: false };
    } catch (e) {
      console.warn('[NACA Auth] Session check failed:', e);
      return { authenticated: false };
    }
  }

  // Try to authenticate - first check session, then fall back to token
  async authenticate(nacaBaseUrl: string): Promise<boolean> {
    const sessionResult = await this.checkSession(nacaBaseUrl);
    if (sessionResult.authenticated) {
      console.log('[NACA Auth] Using session-based authentication');
      return true;
    }
    
    if (this.isAuthenticated()) {
      console.log('[NACA Auth] Using token-based authentication');
      return true;
    }
    
    const tokenResult = await this.requestToken(nacaBaseUrl);
    if (tokenResult) {
      console.log('[NACA Auth] Token obtained from session');
      return true;
    }
    
    console.log('[NACA Auth] No valid authentication found');
    return false;
  }

  // Get the preferred auth method based on what's available
  getPreferredAuthMethod(): 'session' | 'token' | 'none' {
    if (this.token && this.expiresAt && this.expiresAt > Date.now()) {
      return 'token';
    }
    return 'session';
  }

  // Clear authentication
  clearAuth(): void {
    this.token = null;
    this.user = null;
    this.expiresAt = null;

    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
      this.refreshTimeout = null;
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }

    this.notifyAuthChange();
    console.log('[NACA Auth] Auth cleared');
  }

  // Subscribe to auth state changes
  onAuthChange(callback: (state: NACAAuthState) => void): () => void {
    this.onAuthChangeCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.onAuthChangeCallbacks.indexOf(callback);
      if (index > -1) {
        this.onAuthChangeCallbacks.splice(index, 1);
      }
    };
  }

  // Notify subscribers of auth changes
  private notifyAuthChange() {
    const state = this.getAuthState();
    this.onAuthChangeCallbacks.forEach(callback => {
      try {
        callback(state);
      } catch (e) {
        console.error('[NACA Auth] Auth change callback error:', e);
      }
    });
  }
}

// Singleton instance
export const nacaAuth = new NACAAuthService();

// React hook for auth state with session support
export function useNACAAuth() {
  return {
    ...nacaAuth.getAuthState(),
    checkSession: nacaAuth.checkSession.bind(nacaAuth),
    authenticate: nacaAuth.authenticate.bind(nacaAuth),
    getLoginUrl: nacaAuth.getLoginUrl.bind(nacaAuth),
    getPreferredAuthMethod: nacaAuth.getPreferredAuthMethod.bind(nacaAuth),
    clearAuth: nacaAuth.clearAuth.bind(nacaAuth),
    redirectToLogin: nacaAuth.redirectToLogin.bind(nacaAuth),
  };
}
