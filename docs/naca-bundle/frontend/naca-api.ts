// NACA API Types - Updated to match Activity Editor API spec

export interface NACACommunity {
  id: string;
  name: string;
  slug: string;
  subdomain?: string | null;
  description?: string;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface NACADictionaryEntry {
  id: string;
  indigenousWord: string;
  englishTranslation: string;
  category?: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  // Legacy mapping properties
  word?: string;
  translation?: string;
  difficulty?: number;
  metadata?: Record<string, unknown>;
}

export interface NACADictionary {
  id: string;
  name: string;
  communityId: string;
  entryCount?: number;
  description?: string;
  entries?: NACADictionaryEntry[];
}

export interface NACACommunityProfile extends NACACommunity {
  dictionaries?: NACADictionary[];
  folders?: NACAFolderNode[];
}

// Capability types
export interface NACAEndpointInfo {
  id: string;
  path: string;
  method: string;
  description: string;
  schemaHash?: string;
}

export interface NACACapabilities {
  version: string;
  apiVersion: string;
  features: string[];
  endpoints: NACAEndpointInfo[];
  schemaHashes: Record<string, string>;
  lastUpdated: string;
}

export interface NACACapabilitiesCache {
  data: NACACapabilities;
  etag: string | null;
  fetchedAt: number;
}

// Schema types
export interface NACAEndpointSchema {
  endpointId: string;
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  version: string;
}

// Media types - Updated to match Activity Editor API spec
export interface NACAMediaFile {
  id: string;
  url: string;
  filename: string;
  type: 'image' | 'audio' | 'video';
  mimeType?: string;
  size?: number;
  communityId?: string;
  approvalStatus?: string;
  metadata?: Record<string, unknown>;
}

export interface NACAMediaSearchQuery {
  communityId?: string;
  filename?: string;
  type?: 'image' | 'audio' | 'video';
  limit?: number;
  offset?: number;
  approvalStatus?: string;
}

// Folder/Activity types
export interface NACAFolderNode {
  id: string;
  name: string;
  type: 'folder' | 'file' | 'activity';
  path: string;
  parentId?: string;
  children?: NACAFolderNode[];
  metadata?: Record<string, unknown>;
}

export interface NACAActivityFolder {
  id: string;
  name: string;
  communityId: string;
  path: string;
  files: NACAMediaFile[];
  subfolders: NACAFolderNode[];
}

// Activity types - Updated to match Activity Editor API spec
export interface NACAActivity {
  id: string;
  name: string;
  type: string;
  description?: string;
  entryCount?: number;
  isPublished?: boolean;
  metadata?: Record<string, unknown>;
}

export interface NACAActivityDetails extends NACAActivity {
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  settings?: Record<string, any>;
  dictionaryId?: string;
}

export interface NACAActivityItem {
  id: string;
  english?: string;
  language?: string;
  image?: string;
  audio?: string;
  video?: string;
  category?: string;
  order?: number;
  data?: Record<string, any>;
}

export interface NACAActivityItemsResult {
  items: NACAActivityItem[];
  total?: number;
}

export interface NACADropboxBrowseRequest {
  path: string;
  cursor?: string;
}

export interface NACADropboxBrowseResponse {
  entries: NACAFolderNode[];
  cursor?: string;
  hasMore: boolean;
}

// Draft types per NACA API spec
export interface NACADraft {
  id: string;
  communityId: string;
  type: 'flashcards' | 'storybook' | 'timeline' | 'map';
  name: string;
  description?: string;
  title?: string;
  subtitle?: string;
  isPublished: boolean;
  uploadedBy: string;
  createdAt: string;
  updatedAt?: string;
}

// Notification types per NACA API spec
export interface NACANotification {
  id: string;
  type: 'approval_status' | 'capability_update';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  createdAt: string;
  read: boolean;
}

// Changelog types per NACA API spec
export interface NACAChangelogEntry {
  version: string;
  date: string;
  type: 'feature' | 'endpoint' | 'breaking' | 'deprecation';
  title: string;
  description: string;
  affectedEndpoints?: string[];
}

// ============================================================================
// Editor-Host Negotiation Protocol Types
// ============================================================================

export interface HostAuthCapabilities {
  methods: ('api_key' | 'session' | 'jwt' | 'oauth' | 'none')[];
  headerNames: string[];
  requiresAuth: boolean;
}

export interface HostSubdomainCapabilities {
  extraction: 'header' | 'hostname' | 'both';
  headerNames: string[];
  allowOverride: boolean;
  defaultCommunity?: string;
}

export interface HostCORSCapabilities {
  allowExternalOrigins: boolean;
  allowedOrigins: string[];
}

export interface HostCapabilities {
  version: string;
  apiVersion: string;
  auth: HostAuthCapabilities;
  subdomain: HostSubdomainCapabilities;
  cors: HostCORSCapabilities;
  features: string[];
  schemaVersions: Record<string, string>;
  endpoints?: Record<string, string>;
}

export interface NegotiationRequest {
  editorVersion: string;
  editorOrigin: string;
  requestedSubdomain?: string;
  preferredAuthMethod?: string;
  requiredFeatures?: string[];
}

export interface NegotiatedConfiguration {
  subdomain: string;
  authMethod: string;
  authHeaders: Record<string, string>;
  baseUrl: string;
  websocketUrl?: string;
}

export interface NegotiationResponse {
  success: boolean;
  configuration?: NegotiatedConfiguration;
  capabilities: HostCapabilities;
  error?: string;
  message?: string;
}

export interface CapabilitiesResponse {
  success: boolean;
  capabilities: HostCapabilities;
  serverTime: string;
  message?: string;
}

// Import auth service
import { nacaAuth } from './naca-auth';
// Mock data imports removed - using live NACA data only

// ============================================================================
// Rate Limiter - Token Bucket Algorithm
// ============================================================================

class RateLimiter {
  private tokens: number;
  private maxTokens: number;
  private refillRate: number; // tokens per second
  private lastRefill: number;
  private queue: Array<{resolve: () => void; reject: (err: Error) => void}> = [];
  private processing = false;
  
  constructor(requestsPerMinute: number = 60, burstLimit: number = 10) {
    this.maxTokens = burstLimit;
    this.tokens = burstLimit;
    this.refillRate = requestsPerMinute / 60; // per second
    this.lastRefill = Date.now();
  }
  
  private refillTokens() {
    const now = Date.now();
    const elapsed = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.maxTokens, this.tokens + elapsed * this.refillRate);
    this.lastRefill = now;
  }
  
  async acquire(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
      this.processQueue();
    });
  }
  
  private async processQueue() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;
    
    while (this.queue.length > 0) {
      this.refillTokens();
      
      if (this.tokens >= 1) {
        this.tokens -= 1;
        const request = this.queue.shift();
        request?.resolve();
      } else {
        // Wait until we have at least 1 token
        const waitTime = Math.ceil((1 - this.tokens) / this.refillRate * 1000);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }
    
    this.processing = false;
  }
  
  getStatus(): { tokens: number; maxTokens: number; queueLength: number } {
    this.refillTokens();
    return {
      tokens: Math.floor(this.tokens),
      maxTokens: this.maxTokens,
      queueLength: this.queue.length,
    };
  }
}

// ============================================================================
// Editor-Host Negotiation Client
// ============================================================================

class NegotiationClient {
  private hostCapabilities: HostCapabilities | null = null;
  private negotiatedConfig: NegotiatedConfiguration | null = null;
  private readonly EDITOR_VERSION = '1.0.0';
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem('naca_negotiated_config');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          this.negotiatedConfig = parsed.config;
          this.hostCapabilities = parsed.capabilities;
        } catch {
          // Ignore parse errors
        }
      }
    }
  }
  
  private saveToStorage() {
    if (typeof window !== 'undefined' && this.negotiatedConfig) {
      localStorage.setItem('naca_negotiated_config', JSON.stringify({
        config: this.negotiatedConfig,
        capabilities: this.hostCapabilities,
        timestamp: Date.now(),
      }));
    }
  }
  
  async discoverCapabilities(): Promise<HostCapabilities | null> {
    try {
      const response = await fetch('/api/activity-editor/capabilities', {
        headers: {
          'X-Editor-Version': this.EDITOR_VERSION,
        },
      });
      
      if (!response.ok) {
        console.warn('[Negotiation] Failed to discover capabilities:', response.status);
        return null;
      }
      
      const data: CapabilitiesResponse = await response.json();
      if (data.success) {
        this.hostCapabilities = data.capabilities;
        console.log('[Negotiation] Discovered host capabilities:', data.capabilities.version);
        return data.capabilities;
      }
      return null;
    } catch (error) {
      console.warn('[Negotiation] Error discovering capabilities:', error);
      return null;
    }
  }
  
  async negotiate(options: {
    subdomain?: string;
    preferredAuthMethod?: string;
  } = {}): Promise<NegotiationResponse | null> {
    try {
      const request: NegotiationRequest = {
        editorVersion: this.EDITOR_VERSION,
        editorOrigin: window.location.origin,
        requestedSubdomain: options.subdomain,
        preferredAuthMethod: options.preferredAuthMethod,
      };
      
      const response = await fetch('/api/activity-editor/negotiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Editor-Version': this.EDITOR_VERSION,
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        console.warn('[Negotiation] Failed to negotiate:', response.status);
        return null;
      }
      
      const data: NegotiationResponse = await response.json();
      if (data.success && data.configuration) {
        this.negotiatedConfig = data.configuration;
        this.hostCapabilities = data.capabilities;
        this.saveToStorage();
        console.log('[Negotiation] Connection negotiated:', data.configuration.subdomain);
      }
      return data;
    } catch (error) {
      console.warn('[Negotiation] Error negotiating:', error);
      return null;
    }
  }
  
  async configureSubdomain(subdomain: string, communityId?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/activity-editor/configure-subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain, communityId }),
      });
      
      if (!response.ok) {
        console.warn('[Negotiation] Failed to configure subdomain:', response.status);
        return false;
      }
      
      const data = await response.json();
      if (data.success && this.negotiatedConfig) {
        this.negotiatedConfig.subdomain = subdomain;
        this.saveToStorage();
      }
      return data.success;
    } catch (error) {
      console.warn('[Negotiation] Error configuring subdomain:', error);
      return false;
    }
  }
  
  getHostCapabilities(): HostCapabilities | null {
    return this.hostCapabilities;
  }
  
  getNegotiatedConfig(): NegotiatedConfiguration | null {
    return this.negotiatedConfig;
  }
  
  supportsFeature(feature: string): boolean {
    return this.hostCapabilities?.features.includes(feature) ?? false;
  }
  
  getPreferredSubdomainHeader(): string {
    if (this.hostCapabilities?.subdomain.headerNames.length) {
      return this.hostCapabilities.subdomain.headerNames[0];
    }
    return 'X-Community-Subdomain';
  }
  
  canOverrideSubdomain(): boolean {
    return this.hostCapabilities?.subdomain.allowOverride ?? true;
  }
  
  clear() {
    this.hostCapabilities = null;
    this.negotiatedConfig = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('naca_negotiated_config');
    }
  }
}

// Export singleton instance
export const negotiationClient = new NegotiationClient();

// API Client - Updated for Activity Editor API endpoints
class NACAPIClient {
  private baseUrl: string;
  private subdomain: string;
  private apiKey: string;
  private capabilitiesCache: NACACapabilitiesCache | null = null;
  private schemaCache: Map<string, NACAEndpointSchema> = new Map();
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
  private rateLimiter = new RateLimiter(60, 10);
  
  // Feature name mapping from NACA host to our internal names
  private static FEATURE_MAP: Record<string, string[]> = {
    'dropboxIntegration': ['dropbox', 'dropbox_integration', 'browse_dropbox'],
    'mediaSearch': ['media_library', 'media_search'],
    'realTimeSync': ['real_time_updates', 'activity_sync', 'websocket'],
    'activityFolders': ['activity_folders', 'folder_browser'],
  };

  constructor(baseUrl?: string, subdomain?: string) {
    this.baseUrl = baseUrl || this.getDefaultBaseUrl();
    this.subdomain = subdomain || this.getDefaultSubdomain();
    this.apiKey = this.getApiKey();
    this.loadCacheFromStorage();
  }

  private getApiKey(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('naca_api_key') || '';
    }
    return '';
  }

  // Get authorization headers
  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {};
    
    // First try API key auth (recommended for Activity Editor)
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else {
      // Fall back to token auth from auth service
      const authHeaders = nacaAuth.getAuthHeaders();
      Object.assign(headers, authHeaders);
    }
    
    return headers;
  }

  // Check if user is authenticated with NACA
  isAuthenticated(): boolean {
    return !!this.apiKey || nacaAuth.isAuthenticated();
  }

  // Set API key for authentication
  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    if (typeof window !== 'undefined') {
      if (apiKey) {
        localStorage.setItem('naca_api_key', apiKey);
      } else {
        localStorage.removeItem('naca_api_key');
      }
    }
  }

  // Request authentication token from NACA
  async authenticate(): Promise<boolean> {
    if (!this.baseUrl) {
      throw new Error('NACA API not configured. Set base URL first.');
    }
    const token = await nacaAuth.requestToken(this.baseUrl);
    return !!token;
  }

  // Redirect to NACA login
  redirectToLogin(): void {
    if (!this.baseUrl) {
      throw new Error('NACA API not configured. Set base URL first.');
    }
    nacaAuth.redirectToLogin(this.baseUrl);
  }

  // Clear authentication
  clearAuth(): void {
    this.apiKey = '';
    if (typeof window !== 'undefined') {
      localStorage.removeItem('naca_api_key');
    }
    nacaAuth.clearAuth();
  }

  private getDefaultBaseUrl(): string {
    if (typeof window !== 'undefined') {
      const nacaUrl = localStorage.getItem('naca_base_url');
      if (nacaUrl) return nacaUrl;
    }
    return '';
  }

  private getDefaultSubdomain(): string {
    if (typeof window !== 'undefined') {
      const subdomain = localStorage.getItem('naca_subdomain');
      if (subdomain) return subdomain;
    }
    return ''; // Subdomain is derived from server URL on the backend
  }

  private loadCacheFromStorage() {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = localStorage.getItem('naca_capabilities_cache');
      if (cached) {
        this.capabilitiesCache = JSON.parse(cached);
      }
    } catch (e) {
      console.warn('Failed to load NACA capabilities cache:', e);
    }
  }

  private saveCacheToStorage() {
    if (typeof window === 'undefined' || !this.capabilitiesCache) return;
    
    try {
      localStorage.setItem('naca_capabilities_cache', JSON.stringify(this.capabilitiesCache));
    } catch (e) {
      console.warn('Failed to save NACA capabilities cache:', e);
    }
  }

  async setBaseUrl(url: string, subdomain?: string) {
    this.baseUrl = url;
    
    // When switching servers, clear the old subdomain unless explicitly provided
    // This prevents carrying over stale subdomains (e.g., "www" from production to dev)
    if (subdomain !== undefined) {
      this.subdomain = subdomain;
    } else {
      // Clear subdomain when switching servers without explicit subdomain
      this.subdomain = '';
    }
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('naca_base_url', url);
      // Also update localStorage subdomain to match
      localStorage.setItem('naca_subdomain', this.subdomain);
    }
    // Clear cache when base URL changes
    this.capabilitiesCache = null;
    this.schemaCache.clear();
    
    // Also configure the backend proxy
    // Only send subdomain if explicitly provided; otherwise let backend auto-extract
    try {
      const payload: Record<string, string> = { baseUrl: url };
      if (subdomain !== undefined) {
        payload.subdomain = subdomain;
      }
      // If no subdomain provided, backend will auto-extract from URL
      await fetch('/api/naca-proxy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[NACA API] Backend proxy configured with:', url, subdomain !== undefined ? `subdomain: ${subdomain}` : '(auto-extract subdomain)');
    } catch (e) {
      console.warn('[NACA API] Failed to configure backend proxy:', e);
    }
  }

  async setSubdomain(subdomain: string) {
    this.subdomain = subdomain;
    if (typeof window !== 'undefined') {
      localStorage.setItem('naca_subdomain', subdomain);
    }
    // Clear cache when subdomain changes
    this.capabilitiesCache = null;
    this.schemaCache.clear();
    
    // Also update the backend proxy with the new subdomain
    try {
      await fetch('/api/naca-proxy/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseUrl: this.baseUrl, subdomain }),
      });
      console.log('[NACA API] Backend subdomain updated to:', subdomain);
    } catch (e) {
      console.warn('[NACA API] Failed to update backend subdomain:', e);
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getSubdomain(): string {
    return this.subdomain;
  }

  isConfigured(): boolean {
    return !!this.baseUrl;
  }
  
  // Initialize proxy on load if we have a stored URL
  async initializeProxy() {
    if (this.baseUrl) {
      try {
        const payload: Record<string, string> = { baseUrl: this.baseUrl };
        // Only include subdomain if we have a non-empty value
        if (this.subdomain) {
          payload.subdomain = this.subdomain;
        }
        await fetch('/api/naca-proxy/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        console.log('[NACA API] Backend proxy initialized with:', this.baseUrl, this.subdomain ? `subdomain: ${this.subdomain}` : '(auto-extract subdomain)');
      } catch (e) {
        console.warn('[NACA API] Failed to initialize backend proxy:', e);
      }
    }
  }
  
  // Auto-configure the client using the Editor-Host Negotiation Protocol
  // This discovers host capabilities and negotiates the optimal configuration
  async autoConfigureWithNegotiation(options: {
    subdomain?: string;
    preferredAuthMethod?: string;
    forceNegotiation?: boolean;
  } = {}): Promise<boolean> {
    try {
      // Check if we already have a negotiated config and don't need to force
      const existingConfig = negotiationClient.getNegotiatedConfig();
      if (existingConfig && !options.forceNegotiation) {
        // Apply the existing configuration
        if (existingConfig.subdomain && existingConfig.subdomain !== this.subdomain) {
          this.subdomain = existingConfig.subdomain;
          console.log('[NACA API] Using cached negotiated subdomain:', this.subdomain);
        }
        return true;
      }
      
      // First, discover host capabilities
      const capabilities = await negotiationClient.discoverCapabilities();
      if (!capabilities) {
        console.warn('[NACA API] Failed to discover host capabilities, using defaults');
        return false;
      }
      
      console.log('[NACA API] Host capabilities discovered:', {
        version: capabilities.version,
        subdomainExtraction: capabilities.subdomain.extraction,
        allowOverride: capabilities.subdomain.allowOverride,
        features: capabilities.features.length,
      });
      
      // Negotiate a connection with the host
      const negotiationResult = await negotiationClient.negotiate({
        subdomain: options.subdomain || this.subdomain,
        preferredAuthMethod: options.preferredAuthMethod,
      });
      
      if (negotiationResult?.success && negotiationResult.configuration) {
        const config = negotiationResult.configuration;
        
        // Apply the negotiated subdomain
        if (config.subdomain) {
          this.subdomain = config.subdomain;
          if (typeof window !== 'undefined') {
            localStorage.setItem('naca_subdomain', this.subdomain);
          }
          console.log('[NACA API] Negotiated subdomain:', this.subdomain);
        }
        
        // The host now knows our preferred subdomain, so it will use header-based routing
        console.log('[NACA API] Auto-configuration complete. Host will use:', 
          capabilities.subdomain.extraction === 'header' ? 'header-based' : 'URL-based',
          'subdomain extraction');
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.warn('[NACA API] Auto-configuration failed:', error);
      return false;
    }
  }
  
  // Configure subdomain with negotiation protocol awareness
  async setSubdomainWithNegotiation(subdomain: string, communityId?: string): Promise<boolean> {
    // First update local state
    this.subdomain = subdomain;
    if (typeof window !== 'undefined') {
      localStorage.setItem('naca_subdomain', subdomain);
    }
    this.capabilitiesCache = null;
    this.schemaCache.clear();
    
    // Use the negotiation protocol to configure the subdomain
    const success = await negotiationClient.configureSubdomain(subdomain, communityId);
    
    if (success) {
      console.log('[NACA API] Subdomain configured via negotiation:', subdomain);
    } else {
      // Fall back to the old method
      console.log('[NACA API] Falling back to direct proxy config for subdomain:', subdomain);
      try {
        await fetch('/api/naca-proxy/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ baseUrl: this.baseUrl, subdomain }),
        });
      } catch (e) {
        console.warn('[NACA API] Failed to update backend subdomain:', e);
      }
    }
    
    return success;
  }
  
  // Get negotiation client for direct access to capabilities
  getNegotiationClient(): typeof negotiationClient {
    return negotiationClient;
  }

  private async fetch<T>(path: string, options?: RequestInit, maxRetries: number = 3): Promise<T> {
    await this.rateLimiter.acquire();
    
    if (!this.baseUrl) {
      throw new Error('NACA API not configured. Set base URL first.');
    }

    const proxyPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `/api/naca-proxy/${proxyPath}`;
    
    const authHeaders = this.getAuthHeaders();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(authHeaders as Record<string, string>),
    };
    
    if (this.subdomain) {
      headers['X-Community-Subdomain'] = this.subdomain;
    }
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...headers,
            ...(options?.headers as Record<string, string>),
          },
        });

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          console.warn(`[NACA API] Rate limited, waiting ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
          continue;
        }
        
        if (!response.ok && response.status >= 500) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[NACA API] Server error ${response.status}, retrying in ${delay}ms`);
          await this.sleep(delay);
          continue;
        }

        if (!response.ok) {
          const error = await response.text();
          
          if (response.status === 401) {
            console.warn('[NACA API] Authentication required');
            nacaAuth.clearAuth();
          }
          
          throw new Error(`NACA API error (${response.status}): ${error}`);
        }

        return response.json();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('Request failed after retries');
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async fetchWithEtag<T>(
    path: string,
    currentEtag: string | null,
    maxRetries: number = 3
  ): Promise<{ data: T; etag: string | null; notModified: boolean }> {
    if (!this.baseUrl) {
      throw new Error('NACA API not configured. Set base URL first.');
    }

    const proxyPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `/api/naca-proxy/${proxyPath}`;
    
    const authHeaders = this.getAuthHeaders();
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      ...(authHeaders as Record<string, string>),
    };

    if (this.subdomain) {
      headers['X-Community-Subdomain'] = this.subdomain;
    }

    if (currentEtag) {
      headers['If-None-Match'] = currentEtag;
    }

    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, { headers });

        if (response.status === 304) {
          return { data: null as unknown as T, etag: currentEtag, notModified: true };
        }
        
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
          console.warn(`[NACA API] Rate limited on conditional request, waiting ${retryAfter}s`);
          await this.sleep(retryAfter * 1000);
          continue;
        }
        
        if (!response.ok && response.status >= 500) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`[NACA API] Server error ${response.status} on conditional request, retrying in ${delay}ms`);
          await this.sleep(delay);
          continue;
        }

        if (!response.ok) {
          const error = await response.text();
          
          if (response.status === 401) {
            console.warn('[NACA API] Authentication required');
            nacaAuth.clearAuth();
          }
          
          throw new Error(`NACA API error (${response.status}): ${error}`);
        }

        const etag = response.headers.get('ETag');
        const data = await response.json();
        return { data, etag, notModified: false };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }
    
    throw lastError || new Error('Conditional request failed after retries');
  }

  // Capability Discovery - uses /api/activity-editor/capabilities per NACA API spec
  async getCapabilities(forceRefresh = false): Promise<NACACapabilities> {
    const now = Date.now();

    // Return cached if valid and not forcing refresh
    if (
      !forceRefresh &&
      this.capabilitiesCache &&
      now - this.capabilitiesCache.fetchedAt < this.CACHE_DURATION
    ) {
      return this.capabilitiesCache.data;
    }

    const currentEtag = this.capabilitiesCache?.etag ?? null;
    const result = await this.fetchWithEtag<NACACapabilities>(
      '/api/activity-editor/capabilities',
      currentEtag
    );

    if (result.notModified && this.capabilitiesCache) {
      // Update fetch time but keep existing data
      this.capabilitiesCache.fetchedAt = now;
      this.saveCacheToStorage();
      return this.capabilitiesCache.data;
    }

    this.capabilitiesCache = {
      data: result.data,
      etag: result.etag,
      fetchedAt: now,
    };
    this.saveCacheToStorage();

    return result.data;
  }

  async checkCapabilitiesVersion(): Promise<{ changed: boolean; version: string }> {
    if (!this.baseUrl) {
      throw new Error('NACA API not configured. Set base URL first.');
    }

    const url = `${this.baseUrl}/api/activity-editor/capabilities`;
    const response = await fetch(url, {
      method: 'HEAD',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`NACA API error (${response.status})`);
    }

    const etag = response.headers.get('ETag');
    const version = response.headers.get('X-API-Version') || 'unknown';
    const changed = this.capabilitiesCache?.etag !== etag;

    return { changed, version };
  }

  // Check if feature is available (supports both NACA host names and internal names)
  hasFeature(feature: string): boolean {
    if (!this.capabilitiesCache) return false;
    const features = this.capabilitiesCache.data.features;
    
    // Direct match
    if (features.includes(feature)) return true;
    
    // Check mapped names
    for (const [nacaName, aliases] of Object.entries(NACAPIClient.FEATURE_MAP)) {
      if (feature === nacaName || aliases.includes(feature)) {
        // Check if either the NACA name or any alias is in features
        if (features.includes(nacaName)) return true;
        for (const alias of aliases) {
          if (features.includes(alias)) return true;
        }
      }
    }
    
    return false;
  }
  
  getRateLimitStatus(): { tokens: number; maxTokens: number; queueLength: number } {
    return this.rateLimiter.getStatus();
  }

  // Schema Management
  async getEndpointSchema(endpointId: string, forceRefresh = false): Promise<NACAEndpointSchema> {
    if (!forceRefresh && this.schemaCache.has(endpointId)) {
      return this.schemaCache.get(endpointId)!;
    }

    const schema = await this.fetch<NACAEndpointSchema>(`/api/activity-editor/schema/${endpointId}`);
    this.schemaCache.set(endpointId, schema);
    return schema;
  }

  // ==================== Community Management ====================
  // Uses /api/activity-editor/communities per NACA Activity Editor API spec
  
  async getCommunities(): Promise<NACACommunity[]> {
    const response = await this.fetch<{ communities: NACACommunity[]; total: number; apiVersion?: string }>(
      '/api/activity-editor/communities'
    );
    console.log('[NACA API] Received communities:', response);
    return response.communities || [];
  }

  async getCommunity(communityId: string): Promise<NACACommunityProfile> {
    const response = await this.fetch<{ community: NACACommunityProfile }>(
      `/api/activity-editor/communities/${communityId}`
    );
    return response.community;
  }

  // ==================== Dictionary Management ====================
  // Uses /api/activity-editor/communities/:communityId/dictionaries
  
  async getCommunityDictionaries(communityId: string): Promise<NACADictionary[]> {
    const response = await this.fetch<{ dictionaries: NACADictionary[]; total: number }>(
      `/api/activity-editor/communities/${communityId}/dictionaries`
    );
    console.log('[NACA API] Received dictionaries:', response);
    return response.dictionaries || [];
  }

  // Get dictionary entries with pagination
  // Uses /api/activity-editor/dictionaries/:dictionaryId/entries
  async getDictionaryEntries(
    dictionaryId: string,
    options?: {
      limit?: number;
      offset?: number;
      search?: string;
      category?: string;
    }
  ): Promise<{ entries: NACADictionaryEntry[]; total: number; limit: number; offset: number }> {
    try {
      const params = new URLSearchParams();
      if (options?.limit) params.set('limit', String(options.limit));
      if (options?.offset) params.set('offset', String(options.offset));
      if (options?.search) params.set('search', options.search);
      if (options?.category) params.set('category', options.category);
      
      const queryString = params.toString();
      const path = `/api/activity-editor/dictionaries/${dictionaryId}/entries${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.fetch<{
        entries: NACADictionaryEntry[];
        total: number;
        limit: number;
        offset: number;
      }>(path);
      
      // Normalize entries to have consistent property names
      const normalizedEntries = response.entries.map(entry => ({
        ...entry,
        // Map API properties to legacy properties for backwards compatibility
        word: entry.indigenousWord || entry.word,
        translation: entry.englishTranslation || entry.translation,
      }));
      
      return {
        ...response,
        entries: normalizedEntries,
      };
    } catch (error) {
      console.error('[NACA API] Dictionary entries endpoint error:', error);
      throw error;
    }
  }

  // Legacy method for compatibility
  async getDictionaryEntriesLegacy(communityId: string, dictionaryId: string): Promise<NACADictionaryEntry[]> {
    const response = await this.getDictionaryEntries(dictionaryId, { limit: 100 });
    return response.entries;
  }

  // ==================== Media Search ====================
  // Uses /api/activity-editor/communities/:communityId/media per NACA Activity Editor API spec
  
  async searchMedia(query: NACAMediaSearchQuery): Promise<{ media: NACAMediaFile[]; total: number; limit: number; offset: number }> {
    if (!query.communityId) {
      throw new Error('communityId is required for media search');
    }
    
    try {
      const params = new URLSearchParams();
      if (query.filename) params.set('filename', query.filename);
      if (query.type) params.set('type', query.type);
      if (query.limit) params.set('limit', String(query.limit));
      if (query.offset) params.set('offset', String(query.offset));
      if (query.approvalStatus) params.set('approvalStatus', query.approvalStatus);
      
      const queryString = params.toString();
      const path = `/api/activity-editor/communities/${query.communityId}/media${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.fetch<{
        media: NACAMediaFile[];
        total: number;
        limit: number;
        offset: number;
      }>(path);
      
      console.log('[NACA API] Received media:', response);
      return response;
    } catch (error) {
      console.error('[NACA API] Media search endpoint error:', error);
      throw error;
    }
  }
  
  // Legacy method for compatibility - returns just the array
  async searchMediaLegacy(query: NACAMediaSearchQuery): Promise<NACAMediaFile[]> {
    const result = await this.searchMedia(query);
    return result.media;
  }

  // ==================== Activities/Game Datasets ====================
  // Uses /api/activity-editor/communities/:communityId/activities
  
  async getActivities(
    communityId: string,
    options?: {
      type?: string;
      search?: string;
    }
  ): Promise<{ activities: NACAActivity[]; total: number }> {
    try {
      const params = new URLSearchParams();
      if (options?.type) params.set('type', options.type);
      if (options?.search) params.set('search', options.search);
      
      const queryString = params.toString();
      const path = `/api/activity-editor/communities/${communityId}/activities${queryString ? `?${queryString}` : ''}`;
      
      return await this.fetch<{ activities: NACAActivity[]; total: number }>(path);
    } catch (error) {
      console.warn('[NACA API] Activities endpoint unavailable:', error);
      return { activities: [], total: 0 };
    }
  }

  async getActivityDetails(
    communityId: string,
    activityId: string
  ): Promise<NACAActivityDetails> {
    try {
      const path = `/api/activity-editor/communities/${communityId}/activities/${activityId}`;
      const response = await this.fetch<{ activity: NACAActivityDetails }>(path);
      return response.activity;
    } catch (error) {
      console.error('[NACA API] Activity details endpoint error:', error);
      throw error;
    }
  }

  async getActivityItems(
    communityId: string,
    activityId: string
  ): Promise<NACAActivityItemsResult> {
    try {
      const path = `/api/activity-editor/communities/${communityId}/activities/${activityId}/items`;
      const response = await this.fetch<NACAActivityItemsResult>(path);
      return response;
    } catch (error) {
      console.error('[NACA API] Activity items endpoint error:', error);
      throw error;
    }
  }

  // Dropbox/Folder Browsing
  async browseDropbox(
    communityId: string,
    request: NACADropboxBrowseRequest
  ): Promise<NACADropboxBrowseResponse> {
    try {
      return await this.fetch<NACADropboxBrowseResponse>(
        `/api/activity-editor/communities/${communityId}/browse-dropbox`,
        {
          method: 'POST',
          body: JSON.stringify(request),
        }
      );
    } catch (error) {
      console.error('[NACA API] Dropbox browse endpoint error:', error);
      throw error;
    }
  }

  // Activity Folder Structure
  async getActivityFolder(
    communityId: string,
    activityName: string
  ): Promise<NACAActivityFolder> {
    return this.fetch<NACAActivityFolder>(
      `/api/activity-editor/communities/${communityId}/activities/${encodeURIComponent(activityName)}/folder`
    );
  }

  // URL Helpers - uses /api/media/{storagePath} per NACA API spec
  getMediaUrl(communityId: string, path: string): string {
    if (!this.baseUrl) {
      console.warn("[NACA] Not configured, returning path as-is");
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // Use the /api/media/{storagePath} format per NACA API spec
    return `${this.baseUrl}/api/media/${cleanPath}`;
  }

  getDropboxFileUrl(communityId: string, dropboxPath: string): string {
    if (!this.baseUrl) {
      console.warn("[NACA] Not configured, returning path as-is");
      return dropboxPath;
    }
    const cleanPath = dropboxPath.startsWith('/') ? dropboxPath : `/${dropboxPath}`;
    return `${this.baseUrl}/api/activity-editor/communities/${encodeURIComponent(communityId)}/dropbox/download?path=${encodeURIComponent(cleanPath)}`;
  }

  // ==================== Draft Management ====================
  // Per NACA API spec: /api/activity-editor/drafts
  
  async createDraft(params: {
    communityId: string;
    type: 'flashcards' | 'storybook' | 'timeline' | 'map';
    name: string;
    description?: string;
    title?: string;
    subtitle?: string;
  }): Promise<NACADraft> {
    return this.fetch<NACADraft>('/api/activity-editor/drafts', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
  
  async updateDraft(id: string, updates: Partial<{
    name: string;
    description: string;
    title: string;
    subtitle: string;
  }>): Promise<NACADraft> {
    return this.fetch<NACADraft>(`/api/activity-editor/drafts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }
  
  async submitDraftForApproval(draftId: string): Promise<{
    success: boolean;
    submission: { id: string; status: 'pending' };
  }> {
    return this.fetch(`/api/activity-editor/drafts/${draftId}/submit`, {
      method: 'POST',
    });
  }
  
  async getMyDrafts(): Promise<NACADraft[]> {
    return this.fetch<NACADraft[]>('/api/activity-editor/drafts');
  }
  
  // ==================== Notification System ====================
  // Per NACA API spec: /api/activity-editor/notifications
  
  async getNotifications(unreadOnly = false): Promise<{
    notifications: NACANotification[];
    unreadCount: number;
  }> {
    const query = unreadOnly ? '?unreadOnly=true' : '';
    return this.fetch(`/api/activity-editor/notifications${query}`);
  }
  
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await this.fetch(`/api/activity-editor/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }
  
  async markAllNotificationsAsRead(): Promise<void> {
    await this.fetch('/api/activity-editor/notifications/read-all', {
      method: 'POST',
    });
  }
  
  // ==================== Changelog ====================
  // Per NACA API spec: /api/activity-editor/changelog
  
  async getChangelog(sinceVersion?: string): Promise<{
    changes: NACAChangelogEntry[];
    currentVersion: string;
    totalChanges: number;
  }> {
    const query = sinceVersion ? `?since=${sinceVersion}` : '';
    return this.fetch(`/api/activity-editor/changelog${query}`);
  }

  // ==================== Media URL Helpers ====================
  
  // Get a proxied URL for NACA media files (handles cross-origin)
  getProxiedMediaUrl(mediaUrl: string): string {
    if (!mediaUrl) return '';
    
    // If already a relative path through our proxy, return as-is
    if (mediaUrl.startsWith('/api/naca-media/')) {
      return mediaUrl;
    }
    
    // Encode the URL and route through our media proxy
    const encodedUrl = encodeURIComponent(mediaUrl);
    return `/api/naca-media/${encodedUrl}`;
  }
  
  // Get a proxied URL for a media path relative to NACA base URL
  getMediaPath(path: string): string {
    if (!path) return '';
    
    // Strip leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `/api/naca-media/${cleanPath}`;
  }

  // Cache Management
  clearCache() {
    this.capabilitiesCache = null;
    this.schemaCache.clear();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('naca_capabilities_cache');
    }
  }

  getCacheStatus(): {
    capabilities: { cached: boolean; age: number | null };
    schemas: number;
  } {
    return {
      capabilities: {
        cached: !!this.capabilitiesCache,
        age: this.capabilitiesCache
          ? Date.now() - this.capabilitiesCache.fetchedAt
          : null,
      },
      schemas: this.schemaCache.size,
    };
  }
}

export const nacaApi = new NACAPIClient();

// NACA server configurations
const NACA_SERVER_URLS = {
  development: 'https://native-tongue-lexicon-brandon612.replit.app',
  production: 'https://naca.community',
} as const;

// Initialize from server config first, then apply user preferences if not env-locked
async function initFromServerAndUserSettings() {
  try {
    // First, fetch server configuration to check if env-locked
    const response = await fetch('/api/naca-proxy/config');
    if (!response.ok) {
      console.warn('[NACA API] Failed to fetch server config');
      return;
    }
    
    const serverConfig = await response.json();
    
    // If server has env-locked URL, use that and ignore user preferences for URL
    if (serverConfig.envLocked) {
      console.log('[NACA API] Server has env-locked URL:', serverConfig.baseUrl, 'subdomain:', serverConfig.subdomain);
      await nacaApi.setBaseUrl(serverConfig.baseUrl, serverConfig.subdomain);
      return;
    }
    
    // Server is not env-locked, check user settings for preferred environment
    // Default to production since the dev server has a hostname parsing bug
    const STORAGE_KEY = 'indigamate-user-settings';
    const MIGRATION_KEY = 'indigamate-settings-version';
    const userSettingsStr = localStorage.getItem(STORAGE_KEY);
    let nacaEnvironment: 'development' | 'production' = 'production';
    
    if (userSettingsStr) {
      try {
        const settings = JSON.parse(userSettingsStr);
        
        // Run migration: v1 -> v2 (switch from development to production default)
        const storedVersion = parseInt(localStorage.getItem(MIGRATION_KEY) || '1', 10);
        if (storedVersion < 2 && settings.nacaEnvironment === 'development') {
          console.log('[NACA API] Migrating settings: switching to production server');
          settings.nacaEnvironment = 'production';
          localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
          localStorage.setItem(MIGRATION_KEY, '2');
        }
        
        if (settings.nacaEnvironment === 'development' || settings.nacaEnvironment === 'production') {
          nacaEnvironment = settings.nacaEnvironment;
        }
      } catch (e) {
        console.warn('[NACA API] Failed to parse user settings:', e);
      }
    }
    
    const baseUrl = NACA_SERVER_URLS[nacaEnvironment];
    // Subdomain will be auto-extracted on the server side when URL changes
    const subdomain = serverConfig.subdomain || '';
    
    // Clear stale cache if URL changed
    const cachedUrl = localStorage.getItem('naca_base_url');
    if (cachedUrl && cachedUrl !== baseUrl) {
      console.log('[NACA API] Clearing stale cache - was:', cachedUrl);
      localStorage.removeItem('naca_base_url');
      localStorage.removeItem('naca_subdomain');
      localStorage.removeItem('naca_capabilities_cache');
    }
    
    // Configure the API client with user-preferred environment
    await nacaApi.setBaseUrl(baseUrl, subdomain);
    console.log('[NACA API] Initialized with', nacaEnvironment, 'server:', baseUrl, 'subdomain:', subdomain);
  } catch (e) {
    console.warn('[NACA API] Failed to initialize:', e);
  }
}

// Auto-init when module loads in browser
if (typeof window !== 'undefined') {
  initFromServerAndUserSettings();
}

export function useNACAConfigured(): boolean {
  return nacaApi.isConfigured();
}
