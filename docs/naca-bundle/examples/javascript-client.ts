/**
 * Activity Editor API - TypeScript Client Examples
 * 
 * This file demonstrates how to integrate with the Activity Editor API
 * from a JavaScript/TypeScript application.
 */

// ============================================
// API CLIENT SETUP
// ============================================

interface ApiConfig {
  baseUrl: string;
  apiKey?: string;
  subdomain?: string;
}

class ActivityEditorClient {
  private baseUrl: string;
  private apiKey?: string;
  private subdomain?: string;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.subdomain = config.subdomain;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-API-Key': this.apiKey }),
      ...(this.subdomain && { 'X-Community-Subdomain': this.subdomain }),
      ...options.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // ============================================
  // SCREENS
  // ============================================

  async getScreens() {
    return this.request<Screen[]>('/api/screens');
  }

  async getScreen(id: string) {
    return this.request<Screen>(`/api/screens/${id}`);
  }

  async createScreen(data: CreateScreenInput) {
    return this.request<Screen>('/api/screens', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScreen(id: string, data: Partial<CreateScreenInput>) {
    return this.request<Screen>(`/api/screens/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteScreen(id: string) {
    return this.request<void>(`/api/screens/${id}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // GAME OBJECTS
  // ============================================

  async getObjectsByScreen(screenId: string) {
    return this.request<GameObject[]>(`/api/screens/${screenId}/objects`);
  }

  async createObject(data: CreateObjectInput) {
    return this.request<GameObject>('/api/objects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateObject(id: string, data: Partial<CreateObjectInput>) {
    return this.request<GameObject>(`/api/objects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteObject(id: string) {
    return this.request<void>(`/api/objects/${id}`, {
      method: 'DELETE',
    });
  }

  async batchUpdateZIndex(updates: Array<{ id: string; zIndex: number }>) {
    return this.request<GameObject[]>('/api/objects/batch-zindex', {
      method: 'PATCH',
      body: JSON.stringify({ updates }),
    });
  }

  // ============================================
  // SCENES
  // ============================================

  async getScenesByScreen(screenId: string) {
    return this.request<Scene[]>(`/api/screens/${screenId}/scenes`);
  }

  async createScene(data: CreateSceneInput) {
    return this.request<Scene>('/api/scenes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============================================
  // NACA PROXY
  // ============================================

  async getNacaConfig() {
    return this.request<NacaConfig>('/api/naca-proxy/config');
  }

  async getCommunities() {
    return this.request<CommunitiesResponse>('/api/naca-proxy/communities');
  }

  async getDictionaries(communityId: string) {
    return this.request<DictionariesResponse>(
      `/api/naca-proxy/communities/${communityId}/dictionaries`
    );
  }

  async getDictionaryEntries(dictionaryId: string) {
    return this.request<EntriesResponse>(
      `/api/naca-proxy/dictionaries/${dictionaryId}/entries`
    );
  }

  async getActivities(communityId: string) {
    return this.request<ActivitiesResponse>(
      `/api/naca-proxy/communities/${communityId}/activities`
    );
  }

  async getActivityItems(activityId: string) {
    return this.request<ActivityItemsResponse>(
      `/api/naca-proxy/activities/${activityId}/items`
    );
  }

  // ============================================
  // PROJECTS
  // ============================================

  async getProjects() {
    return this.request<Project[]>('/api/projects');
  }

  async exportProject(projectId: string) {
    return this.request<ProjectExport>(`/api/projects/${projectId}/export`);
  }
}

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Screen {
  id: string;
  projectId?: string;
  title: string;
  imageUrl: string;
  width: number;
  height: number;
  positionX?: number;
  positionY?: number;
  figmaFrameId?: string;
  nacaActivityId?: string;
  nacaCommunityId?: string;
  createdAt: string;
}

interface CreateScreenInput {
  projectId?: string;
  title: string;
  imageUrl: string;
  width?: number;
  height?: number;
}

interface GameObject {
  id: string;
  screenId: string;
  name: string;
  type: 'text' | 'image' | 'shape' | 'group' | 'frame';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  opacity?: number;
  visible?: boolean;
  locked?: boolean;
  dataKey?: string;
  mediaUrl?: string;
  audioUrl?: string;
  customId?: string;
  classes?: string[];
  tags?: string[];
  zIndex?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

interface CreateObjectInput {
  screenId: string;
  name: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  dataKey?: string;
  mediaUrl?: string;
  audioUrl?: string;
  classes?: string[];
}

interface Scene {
  id: string;
  screenId: string;
  name: string;
  order: number;
  isDefault?: boolean;
  createdAt: string;
}

interface CreateSceneInput {
  screenId: string;
  name: string;
  order?: number;
  isDefault?: boolean;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProjectExport {
  id: string;
  componentId: string;
  version: string;
  screens: Screen[];
  vocabulary: Vocabulary[];
}

interface Vocabulary {
  id: string;
  projectId?: string;
  word: string;
  translation: string;
  imageUrl?: string;
  audioUrl?: string;
  category?: string;
  difficulty?: number;
}

interface NacaConfig {
  serverUrl: string;
  subdomain: string;
  apiKeyDisabled: boolean;
  apiKeySource: string;
}

interface Community {
  id: string;
  name: string;
  slug: string;
  subdomain?: string;
  description?: string;
}

interface CommunitiesResponse {
  communities: Community[];
  total: number;
}

interface Dictionary {
  id: string;
  name: string;
  communityId: string;
  entryCount?: number;
}

interface DictionariesResponse {
  dictionaries: Dictionary[];
}

interface DictionaryEntry {
  id: string;
  indigenousWord: string;
  englishTranslation: string;
  audioUrl?: string;
  imageUrl?: string;
}

interface EntriesResponse {
  entries: DictionaryEntry[];
}

interface Activity {
  id: string;
  name: string;
  type: string;
  entryCount?: number;
}

interface ActivitiesResponse {
  activities: Activity[];
}

interface ActivityItem {
  id: string;
  english?: string;
  language?: string;
  image?: string;
  audio?: string;
}

interface ActivityItemsResponse {
  items: ActivityItem[];
  total?: number;
}

// ============================================
// USAGE EXAMPLES
// ============================================

async function example() {
  // Initialize client
  const client = new ActivityEditorClient({
    baseUrl: 'http://localhost:5000',
    apiKey: 'your-api-key',
    subdomain: 'little-bird-press',
  });

  // Create a new project screen
  const screen = await client.createScreen({
    title: 'Vocabulary Quiz',
    imageUrl: '/placeholder.png',
    width: 1194,
    height: 834,
  });
  console.log('Created screen:', screen.id);

  // Create interactive objects
  const card = await client.createObject({
    screenId: screen.id,
    name: 'Word Card',
    type: 'shape',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    classes: ['interactive', 'vocabulary-card'],
  });
  console.log('Created object:', card.id);

  // Bind vocabulary data to object
  await client.updateObject(card.id, {
    dataKey: 'vocab:entry-uuid',
    mediaUrl: '/api/naca-media/public/images/word.webp',
  });

  // Create game scenes
  await client.createScene({
    screenId: screen.id,
    name: 'Correct',
    order: 0,
  });

  await client.createScene({
    screenId: screen.id,
    name: 'Incorrect',
    order: 1,
  });

  // Fetch NACA communities
  const { communities } = await client.getCommunities();
  console.log('Communities:', communities.map(c => c.name));

  // Get dictionary entries
  const { dictionaries } = await client.getDictionaries(communities[0].id);
  if (dictionaries.length > 0) {
    const { entries } = await client.getDictionaryEntries(dictionaries[0].id);
    console.log('Dictionary entries:', entries.length);
  }
}

// ============================================
// WEBSOCKET CONNECTION
// ============================================

function connectWebSocket(baseUrl: string) {
  const wsUrl = baseUrl.replace('http', 'ws') + '/ws/dev-sync';
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('WebSocket connected');
    // Send heartbeat every 30 seconds
    setInterval(() => {
      ws.send(JSON.stringify({ type: 'ping' }));
    }, 30000);
  };

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    
    switch (message.type) {
      case 'pong':
        console.log('Heartbeat acknowledged');
        break;
      case 'activityDiff':
        console.log('Activity changed:', message.payload);
        break;
      case 'vocabulary_update':
        console.log('Vocabulary updated:', message.payload);
        break;
      case 'media_uploaded':
        console.log('New media:', message.payload);
        break;
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket closed, reconnecting...');
    setTimeout(() => connectWebSocket(baseUrl), 5000);
  };

  return ws;
}

// Export for use
export { ActivityEditorClient, connectWebSocket };
export type {
  Screen,
  GameObject,
  Scene,
  Project,
  Vocabulary,
  Community,
  Dictionary,
  DictionaryEntry,
  Activity,
  ActivityItem,
};
