
# NACA Platform Integration

This document describes how the Activity Editor integrates with the NACA (NativeTongueLexicon Activity Center) platform.

## Overview

The Activity Editor is designed to work standalone or as part of the larger NACA ecosystem. Integration is optional but provides enhanced functionality for language learning applications.

## API Version & Rate Limiting

**Current API Version**: 1.0.0

**Rate Limits**:
- 60 requests per minute
- Burst limit: 10 concurrent requests
- The client implements a token bucket algorithm for automatic rate limiting

## Authentication

The integration supports two authentication methods:

### 1. Session-based (Replit OAuth) - Recommended
```typescript
import { nacaAuth } from '@/lib/naca-auth';

// Check for existing session
const result = await nacaAuth.checkSession(nacaBaseUrl);
if (result.authenticated) {
  console.log('Session active:', result.user?.email);
}

// Redirect to login if needed
nacaAuth.redirectToLogin(nacaBaseUrl);
```

### 2. Token-based (JWT)
```typescript
// Token is passed via URL param when embedded as iframe
// ?token=<jwt>&community=<subdomain>

// Or set programmatically
await nacaAuth.setToken(jwtToken);
```

## Integration Points

### 1. WebSocket DevSync

**Purpose**: Real-time bidirectional synchronization between Editor and NACA platform.

**Endpoint**: `wss://<naca-host>/ws/dev-sync`

**Connection**:
```typescript
import { DevSyncProvider, useDevSyncContext } from '@/contexts/DevSyncContext';

function App() {
  return (
    <DevSyncProvider autoConnect>
      <YourApp />
    </DevSyncProvider>
  );
}

function Component() {
  const { isConnected, send, subscribeToNACA } = useDevSyncContext();
  
  // Subscribe to NACA topics (supports both camelCase and underscore formats)
  useEffect(() => {
    return subscribeToNACA(['activityDiff', 'mediaUpload'], (type, payload) => {
      console.log('Received:', type, payload);
    });
  }, [subscribeToNACA]);
  
  // Send message to NACA
  send({ type: 'activity_update', payload: activityData });
}
```

### 2. Message Types (WebSocket Topics)

The integration supports both NACA host format (camelCase) and legacy format (underscore).

#### NACA Host Topics

| NACA Host Topic | Legacy Topic | Description |
|-----------------|--------------|-------------|
| `activityDiff` | `activity_diff` | Activity changes from host |
| `mediaUpload` | `media_upload` | New media uploaded |
| `mediaLink` | `media_link` | Media linked to entry |
| `mediaDelete` | `media_delete` | Media deleted |
| `capabilitiesUpdate` | `capabilities_update` | API capabilities changed |

#### From Editor to NACA

**`activity_update`**
```typescript
{
  type: 'activity_update',
  componentId: 'activity-123',
  payload: ActivityDefinition
}
```

Sent when activity is modified or exported.

**`request_activity`**
```typescript
{
  type: 'request_activity',
  componentId: 'activity-123'
}
```

Request full activity export from Editor.

#### From NACA to Editor

**`activityDiff`** (NEW)
```typescript
{
  type: 'activityDiff',
  payload: {
    activityId: 'activity-123',
    changes: DiffChange[]
  }
}
```

Incremental activity changes from NACA host.

**`vocabulary_push`**
```typescript
{
  type: 'vocabulary_push',
  componentId: 'activity-123',
  payload: {
    vocabularySetId: 'set-456',
    items: VocabularyItem[]
  }
}
```

Push vocabulary from NACA dictionary to Editor.

**`preview_request` / `previewReady`**
```typescript
{
  type: 'preview_request',
  componentId: 'activity-123',
  sceneId: 'scene-789'
}
```

Request preview of specific scene.

**`mediaUpload`**
```typescript
{
  type: 'mediaUpload',
  payload: {
    communityId: 'community-123',
    file: { id: string, filename: string, url: string, type: string }
  }
}
```

Notify Editor of new media upload.

**`dictionary_sync`**
```typescript
{
  type: 'dictionary_sync',
  communityId: 'community-123',
  dictionaryId: 'dict-456',
  entries: DictionaryEntry[]
}
```

Sync dictionary entries to Editor.

### 3. REST API Integration

#### Capabilities Discovery

**Endpoint**: `GET /api/activity-editor/capabilities`

**Purpose**: Discover NACA platform features and API version.

```typescript
import { nacaApi } from '@/lib/naca-api';

// Get capabilities with caching
const capabilities = await nacaApi.getCapabilities();

// Check for specific features (supports both NACA host and legacy names)
if (nacaApi.hasFeature('dropboxIntegration')) {
  // Enable Dropbox features
}
if (nacaApi.hasFeature('mediaSearch')) {
  // Enable media search
}

// Check rate limit status
const status = nacaApi.getRateLimitStatus();
console.log(`Tokens: ${status.tokens}/${status.maxTokens}, Queue: ${status.queueLength}`);
```

**NACA Host Features** (mapped to internal names):

| NACA Host Feature | Internal Aliases |
|-------------------|------------------|
| `dropboxIntegration` | `dropbox`, `browse_dropbox` |
| `mediaSearch` | `media_library`, `media_search` |
| `realTimeSync` | `real_time_updates`, `activity_sync`, `websocket` |
| `activityFolders` | `activity_folders`, `folder_browser` |

**Response**:
```json
{
  "version": "1.0.0",
  "apiVersion": "1.0.0",
  "features": [
    "dropboxIntegration",
    "mediaSearch",
    "realTimeSync",
    "activityFolders"
  ],
  "endpoints": [
    {
      "id": "get_communities",
      "path": "/communities",
      "method": "GET",
      "schemaHash": "abc123"
    }
  ],
  "schemaHashes": {
    "Community": "def456",
    "DictionaryEntry": "ghi789"
  }
}
```

#### Communities

**Endpoint**: `GET /api/activity-editor/communities`

```typescript
import { nacaApi } from '@/lib/naca-api';

// Get all communities
const communities = await nacaApi.getCommunities();

// Get specific community with dictionaries
const community = await nacaApi.getCommunity(communityId);
```

**Response**:
```json
{
  "communities": [
    {
      "id": "community-123",
      "name": "Haida Language Community",
      "slug": "haida",
      "description": "X̱aad Kíl language preservation",
      "logoUrl": "https://..."
    }
  ],
  "total": 1
}
```

#### Dictionaries

**Endpoint**: `GET /api/activity-editor/communities/:id/dictionaries`

```typescript
import { nacaApi } from '@/lib/naca-api';

// Get community dictionaries
const dictionaries = await nacaApi.getCommunityDictionaries(communityId);

// Get dictionary entries with pagination
const result = await nacaApi.getDictionaryEntries(dictionaryId, {
  limit: 50,
  offset: 0,
  search: 'hello',
  category: 'greetings'
});
```

**Response**:
```json
{
  "dictionaries": [
    {
      "id": "dict-456",
      "communityId": "community-123",
      "name": "Core Vocabulary",
      "entryCount": 250
    }
  ],
  "total": 1
}
```

#### Media Library

**Endpoint**: `GET /api/activity-editor/communities/:communityId/media`

**Query Parameters**:
- `filename`: Search by filename
- `type`: Filter by type (image, audio, video)
- `approvalStatus`: Filter by approval status
- `limit`, `offset`: Pagination

```typescript
import { nacaApi } from '@/lib/naca-api';

// Search media
const result = await nacaApi.searchMedia({
  communityId: 'community-123',
  type: 'audio',
  limit: 50
});
```

**Response**:
```json
{
  "media": [
    {
      "id": "media-789",
      "url": "https://naca.com/media/audio.mp3",
      "filename": "pronunciation_hello.mp3",
      "type": "audio",
      "mimeType": "audio/mpeg",
      "size": 45123,
      "communityId": "community-123",
      "metadata": {
        "duration": 2.5,
        "bitrate": 128
      }
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### Dropbox/Folder Browsing (NEW)

**Endpoint**: `POST /api/activity-editor/communities/:communityId/browse-dropbox`

```typescript
import { nacaApi } from '@/lib/naca-api';

// Browse Dropbox folder
const result = await nacaApi.browseDropbox(communityId, {
  path: '/activities/flashcards',
  cursor: undefined
});

console.log(result.entries); // Folder contents
console.log(result.hasMore); // More items available
```

**Request Body**:
```json
{
  "path": "/activities/flashcards",
  "cursor": null
}
```

**Response**:
```json
{
  "entries": [
    {
      "id": "folder-1",
      "name": "images",
      "type": "folder",
      "path": "/activities/flashcards/images"
    },
    {
      "id": "file-1",
      "name": "audio.mp3",
      "type": "file",
      "path": "/activities/flashcards/audio.mp3"
    }
  ],
  "cursor": "abc123",
  "hasMore": false
}
```

#### Activity Folder (NEW)

**Endpoint**: `GET /api/activity-editor/communities/:communityId/activities/:activityName/folder`

```typescript
import { nacaApi } from '@/lib/naca-api';

// Get activity folder structure
const folder = await nacaApi.getActivityFolder(communityId, 'my-flashcards');
```

**Response**:
```json
{
  "id": "folder-123",
  "name": "my-flashcards",
  "communityId": "community-123",
  "path": "/activities/my-flashcards",
  "files": [
    { "id": "file-1", "filename": "card1.png", "type": "image", "url": "..." }
  ],
  "subfolders": [
    { "id": "folder-2", "name": "audio", "type": "folder", "path": "/activities/my-flashcards/audio" }
  ]
}
```

#### Endpoint Schema (NEW)

**Endpoint**: `GET /api/activity-editor/schema/:endpointId`

```typescript
import { nacaApi } from '@/lib/naca-api';

// Get JSON schema for an endpoint
const schema = await nacaApi.getEndpointSchema('create_activity');
```

**Response**:
```json
{
  "endpointId": "create_activity",
  "requestSchema": { ... },
  "responseSchema": { ... },
  "version": "1.0.0"
}
```

## Configuration

### Setting NACA URL

**Via UI**:
1. Open Vocabulary Panel
2. Click settings icon
3. Enter NACA server URL
4. Click Save

**Via Code**:
```typescript
import { nacaApi } from '@/lib/naca-api';

// Set base URL
nacaApi.setBaseUrl('https://your-naca-platform.com');

// Verify configuration
if (nacaApi.isConfigured()) {
  console.log('NACA integration ready');
}
```

**Via Environment**:
```env
NACA_BASE_URL=https://your-naca-platform.com
```

### Rate Limiting

The NACA API enforces rate limits to ensure fair usage:

- **Rate**: 60 requests per minute
- **Burst**: 10 concurrent requests

The client automatically handles rate limiting with a token bucket algorithm:

```typescript
import { nacaApi } from '@/lib/naca-api';

// Check current rate limit status
const status = nacaApi.getRateLimitStatus();
console.log(`Available: ${status.tokens}/${status.maxTokens}`);
console.log(`Queued: ${status.queueLength}`);
```

When rate limited:
- Requests are queued automatically
- The client waits for token refill
- No manual intervention needed

### Fallback Behavior

When NACA is not configured:
- DevSync shows "Not Connected" status
- Dictionary browser is hidden
- Media library uses local assets only
- Export works without NACA-specific features

When NACA connection fails:
- Automatic retry (3 attempts with exponential backoff)
- Fallback to polling (15-minute intervals)
- UI indicates degraded mode
- Offline queue stores operations for later sync

## Activity Export Format

### Structure

```typescript
interface ActivityDefinition {
  id: string;
  componentId: string;  // Unique ID for NACA scoping
  version: string;
  screens: ActivityScreen[];
  vocabulary?: VocabularyItem[];
}

interface ActivityScreen {
  id: string;
  title: string;
  figmaFrameId: string | null;
  imageUrl: string;
  width: number;
  height: number;
  objects: ActivityObject[];
  scenes: ActivityScene[];
}

interface ActivityObject {
  id: string;
  customId: string | null;
  classes: string[];
  tags: string[];
  figmaNodeId: string | null;
  type: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  zIndex: number;
  dataKey: string | null;
  mediaUrl: string | null;
  audioUrl: string | null;
}

interface ActivityScene {
  id: string;
  name: string;
  isDefault: boolean;
  objectStates: ObjectStateOverride[];
  triggers: ActivityTrigger[];
}
```

### Export Endpoint

**GET** `/api/projects/:id/export`

```typescript
import { useProjectExport } from '@/hooks/use-projects';

function ExportButton({ projectId }) {
  const { mutate: exportProject } = useProjectExport();
  
  return (
    <button onClick={() => exportProject(projectId)}>
      Export to NACA
    </button>
  );
}
```

**Response**: Complete `ActivityDefinition` object

### Media URL Resolution

**Local Assets** (development):
```
/@fs/home/runner/workspace/attached_assets/media/image.png
```

**NACA Assets** (production):
```
https://naca.com/media/community-123/image.png
```

Media binding:
```typescript
const object = {
  id: 'obj-1',
  mediaUrl: 'https://naca.com/media/image.png',
  audioUrl: 'https://naca.com/media/audio.mp3'
};
```

## Vocabulary Binding

### Binding to Objects

```typescript
const object = {
  id: 'obj-1',
  dataKey: 'vocab_item_123',  // Links to vocabulary
  // ... other properties
};
```

### Vocabulary Data Structure

```typescript
interface VocabularyItem {
  id: string;
  word: string;
  translation: string;
  imageUrl?: string;
  audioUrl?: string;
  category?: string;
}
```

### Import from NACA Dictionary

```typescript
import { useImportVocabulary } from '@/hooks/use-naca';

function DictionaryImporter() {
  const { mutate: importVocab } = useImportVocabulary();
  
  const handleImport = (entries: DictionaryEntry[]) => {
    importVocab({
      projectId,
      entries: entries.map(e => ({
        word: e.word,
        translation: e.translation,
        imageUrl: e.imageUrl,
        audioUrl: e.audioUrl,
        category: 'imported'
      }))
    });
  };
  
  return <ImportUI onImport={handleImport} />;
}
```

## Implementation Examples

### Setting Up Integration

```typescript
// 1. Configure NACA URL
import { nacaApi } from '@/lib/naca-api';

nacaApi.setBaseUrl('https://naca-platform.com');

// 2. Check capabilities
import { useNacaCapabilities } from '@/hooks/use-naca';

const { data: caps } = useNacaCapabilities();

// 3. Enable DevSync
import { DevSyncProvider } from '@/contexts/DevSyncContext';

<DevSyncProvider>
  <App />
</DevSyncProvider>
```

### Syncing Vocabulary

```typescript
// Listen for vocabulary push
const { handleDevSyncMessage } = useNacaDevSyncSubscription();

// In DevSync context
useEffect(() => {
  if (message.type === 'vocabulary_push') {
    // Import vocabulary
    importVocabulary(message.payload.items);
  }
}, [message]);
```

### Exporting Activities

```typescript
// Export on save
const handleSave = async () => {
  const exported = await fetch(`/api/projects/${projectId}/export`);
  const activity = await exported.json();
  
  // Send via DevSync
  send('activity_update', {
    componentId: projectId,
    payload: activity
  });
};
```

## Troubleshooting

### Connection Issues

**Problem**: DevSync shows "Not Connected"

**Solutions**:
1. Check NACA_BASE_URL is set
2. Verify WebSocket endpoint is accessible
3. Check browser console for errors
4. Enable polling fallback

### Capabilities Not Loading

**Problem**: useNacaCapabilities() returns empty

**Solutions**:
1. Verify NACA platform is running
2. Check CORS settings
3. Inspect network tab for 404/500 errors
4. Verify API version compatibility

### Media Not Loading

**Problem**: Images/audio from NACA don't display

**Solutions**:
1. Check media URLs are absolute
2. Verify CORS allows media requests
3. Check authentication if required
4. Test URLs directly in browser

## Next Steps

- [API Reference](./api-reference.md)
- [Development Guide](./development-guide.md)
- [Feature Documentation](./features/README.md)
