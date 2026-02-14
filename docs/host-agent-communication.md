
# Host Agent Communication Protocol

This document describes the communication methods between the Activity Editor and host agents (parent applications that embed the editor).

## Overview

The Activity Editor supports multiple communication channels to integrate with host applications like the NACA platform, LMS systems, or custom learning environments.

## API Version & Compatibility

**Current Version**: 1.0.0

The integration supports both NACA host format (camelCase topics) and legacy format (underscore topics) for backward compatibility.

## Authentication

The Activity Editor supports two authentication methods:

### Session-based (Replit OAuth)
```typescript
import { nacaAuth } from '@/lib/naca-auth';

// Check for existing session
const result = await nacaAuth.checkSession(nacaBaseUrl);

// Unified authenticate (tries session first, then token)
const authenticated = await nacaAuth.authenticate(nacaBaseUrl);

// Get preferred auth method
const method = nacaAuth.getPreferredAuthMethod(); // 'session' | 'token' | 'none'
```

### Token-based (JWT)
```typescript
// Token passed via URL param when embedded
// ?token=<jwt>&community=<subdomain>

// Or set programmatically
await nacaAuth.setToken(jwtToken);
```

## Rate Limiting

**Limits**: 60 requests/minute, burst limit of 10

The client implements a token bucket algorithm for automatic rate limiting:

```typescript
import { nacaApi } from '@/lib/naca-api';

// Check rate limit status
const status = nacaApi.getRateLimitStatus();
console.log(`Tokens: ${status.tokens}/${status.maxTokens}`);
```

---

## 1. WebSocket DevSync Protocol

**Purpose**: Real-time bidirectional communication for development and live preview synchronization.

### Connection

```typescript
// Host connects to WebSocket endpoint
const ws = new WebSocket('wss://editor-host/ws/dev-sync');

// Editor auto-connects on mount via DevSyncProvider
import { DevSyncProvider } from '@/contexts/DevSyncContext';
```

### Message Format

All messages follow this structure:

```typescript
interface DevSyncMessage {
  type: string;           // Message type identifier
  componentId?: string;   // Optional component/activity scope
  payload?: any;          // Message-specific data
  timestamp?: number;     // Unix timestamp (optional)
}
```

### NACA Host Topic Mapping

The integration supports both formats for maximum compatibility:

| NACA Host (camelCase) | Legacy (underscore) | Description |
|-----------------------|---------------------|-------------|
| `activityDiff` | `activity_diff` | Activity changes from host |
| `mediaUpload` | `media_upload` | New media uploaded |
| `mediaLink` | `media_link` | Media linked to entry |
| `mediaDelete` | `media_delete` | Media deleted |
| `capabilitiesUpdate` | `capabilities_update` | API capabilities changed |
| `configUpdate` | `config_update` | Configuration changed |
| `previewReady` | `preview_ready` | Preview ready |

### Message Types

#### **From Host → Editor**

**1. activityDiff** - Incremental activity changes (NEW)
```json
{
  "type": "activityDiff",
  "payload": {
    "activityId": "activity-123",
    "changes": [...]
  }
}
```

**2. vocabulary_push** - Push vocabulary data to editor
```json
{
  "type": "vocabulary_push",
  "componentId": "activity-123",
  "payload": {
    "vocabularySetId": "set-456",
    "items": [
      {
        "word": "hello",
        "translation": "bonjour",
        "imageUrl": "https://...",
        "audioUrl": "https://...",
        "category": "greetings"
      }
    ]
  }
}
```

**2. preview_request** - Request preview of specific scene
```json
{
  "type": "preview_request",
  "componentId": "activity-123",
  "payload": {
    "sceneId": "scene-789"
  }
}
```

**3. media_library_update** - Notify of media changes
```json
{
  "type": "media_library_update",
  "payload": {
    "communityId": "community-123",
    "changes": [
      {
        "action": "add|update|delete",
        "file": {
          "id": "media-456",
          "url": "https://...",
          "type": "audio|image|video"
        }
      }
    ]
  }
}
```

**4. dictionary_sync** - Sync dictionary entries
```json
{
  "type": "dictionary_sync",
  "payload": {
    "communityId": "community-123",
    "dictionaryId": "dict-456",
    "entries": [
      {
        "id": "entry-1",
        "word": "word",
        "translation": "translation",
        "imageUrl": "https://...",
        "audioUrl": "https://..."
      }
    ]
  }
}
```

**5. config_update** - Update editor configuration
```json
{
  "type": "config_update",
  "payload": {
    "baseUrl": "https://naca-server.com",
    "communityId": "community-123",
    "features": ["dictionary", "media_library"]
  }
}
```

#### **From Editor → Host**

**1. activity_update** - Activity modified or exported
```json
{
  "type": "activity_update",
  "componentId": "activity-123",
  "payload": {
    "id": "activity-123",
    "version": "1.0.0",
    "screens": [...],
    "vocabulary": [...]
  }
}
```

**2. request_activity** - Request full activity data
```json
{
  "type": "request_activity",
  "componentId": "activity-123"
}
```

**3. preview_ready** - Preview is ready to display
```json
{
  "type": "preview_ready",
  "componentId": "activity-123",
  "payload": {
    "sceneId": "scene-789",
    "ready": true
  }
}
```

**4. media_request** - Request media asset
```json
{
  "type": "media_request",
  "payload": {
    "communityId": "community-123",
    "mediaId": "media-456",
    "type": "audio|image|video"
  }
}
```

### Implementation Example

**Host Application:**
```typescript
const ws = new WebSocket('wss://editor.example.com/ws/dev-sync');

ws.onopen = () => {
  // Push vocabulary when connection opens
  ws.send(JSON.stringify({
    type: 'vocabulary_push',
    componentId: 'activity-123',
    payload: {
      items: vocabularyItems
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'activity_update':
      saveActivity(message.payload);
      break;
    case 'media_request':
      sendMedia(message.payload.mediaId);
      break;
  }
};
```

**Editor (already implemented):**
```typescript
import { useDevSync } from '@/contexts/DevSyncContext';

function Component() {
  const { send, isConnected } = useDevSync();
  
  // Send activity update
  send('activity_update', {
    componentId: 'activity-123',
    payload: activityData
  });
}
```

---

## 2. REST API Integration

**Base URL Configuration:**
```typescript
import { nacaApi } from '@/lib/naca-api';

// Set NACA server URL
nacaApi.setBaseUrl('https://your-naca-server.com');
```

### Endpoints

#### **GET /api/naca/capabilities**
Discover platform features and API version.

**Response:**
```json
{
  "version": "1.0.0",
  "apiVersion": "2024-12",
  "features": [
    "dictionary_sync",
    "media_library",
    "vocabulary_import",
    "activity_player"
  ],
  "endpoints": [
    {
      "id": "get_communities",
      "path": "/communities",
      "method": "GET",
      "schemaHash": "abc123"
    }
  ]
}
```

#### **GET /api/naca/communities**
List available communities.

**Response:**
```json
[
  {
    "id": "community-123",
    "name": "Community Name",
    "description": "Description",
    "logoUrl": "https://..."
  }
]
```

#### **GET /api/naca/communities/:id**
Get community with dictionaries.

**Response:**
```json
{
  "id": "community-123",
  "name": "Community Name",
  "dictionaries": [
    {
      "id": "dict-456",
      "name": "Core Vocabulary",
      "entries": [...]
    }
  ]
}
```

#### **GET /api/naca/media/search**
Search media library.

**Query Parameters:**
- `filename`: Filter by filename
- `communityId`: Filter by community
- `type`: Filter by type (image, audio, video)
- `limit`, `offset`: Pagination

**Response:**
```json
[
  {
    "id": "media-789",
    "url": "https://...",
    "filename": "audio.mp3",
    "type": "audio",
    "communityId": "community-123"
  }
]
```

---

## 3. Activity Export/Import Protocol

### Export Activity

**GET /api/projects/:id/export**

Returns complete activity definition:

```typescript
interface ActivityDefinition {
  id: string;
  componentId: string;
  version: string;
  screens: ActivityScreen[];
  vocabulary?: VocabularyItem[];
}
```

**Usage:**
```typescript
const response = await fetch('/api/projects/project-123/export');
const activity = await response.json();

// Send to host via DevSync
send('activity_update', {
  componentId: activity.id,
  payload: activity
});
```

### Import Activity

**POST /api/projects/import**

**Request Body:**
```json
{
  "id": "activity-123",
  "version": "1.0.0",
  "screens": [...],
  "vocabulary": [...]
}
```

**Query Parameters:**
- `name`: Optional project name

**Response:**
```json
{
  "success": true,
  "projectId": "new-project-id",
  "message": "Imported 3 screen(s)"
}
```

---

## 4. NACA Proxy Configuration

The editor includes a backend proxy to avoid CORS issues when connecting to external NACA servers.

### Configure Proxy

**POST /api/naca-proxy/config**

```json
{
  "baseUrl": "https://naca-server.com",
  "subdomain": "community-name"
}
```

### Proxy Requests

All requests to `/api/naca-proxy/*` are forwarded to the configured NACA server:

```typescript
// Frontend request
fetch('/api/naca-proxy/api/naca/communities')

// Proxied to
// https://naca-server.com/api/naca/communities
```

---

## 5. Embedding Configuration

### URL Parameters

Configure the editor via URL parameters:

```
https://editor.example.com/?nacaUrl=https://naca.com&communityId=123
```

**Supported Parameters:**
- `nacaUrl`: NACA server base URL
- `communityId`: Default community ID
- `projectId`: Load specific project
- `mode`: `edit|preview`

### PostMessage API (Coming Soon)

For iframe embedding:

```typescript
// Parent window
const iframe = document.querySelector('iframe');

iframe.contentWindow.postMessage({
  type: 'vocabulary_push',
  payload: { items: [...] }
}, '*');

// Listen for responses
window.addEventListener('message', (event) => {
  if (event.data.type === 'activity_update') {
    saveActivity(event.data.payload);
  }
});
```

---

## 6. Authentication & Security

### Access Tokens

For authenticated NACA requests, include credentials:

```typescript
// Configure with credentials
nacaApi.setBaseUrl('https://naca-server.com', {
  credentials: 'include',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

### CORS Configuration

NACA server must allow:
```
Access-Control-Allow-Origin: https://editor-domain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

---

## 7. Error Handling

### Connection Failures

DevSync automatically retries on connection failure:
- 3 retry attempts with exponential backoff
- Falls back to polling every 15 minutes
- UI shows "Degraded Mode" indicator

### API Errors

All API errors return standard format:
```json
{
  "error": "Error message",
  "details": "Additional context"
}
```

---

## Quick Start Examples

### Minimal Integration

```typescript
// 1. Configure NACA URL
import { nacaApi } from '@/lib/naca-api';
nacaApi.setBaseUrl('https://naca-platform.com');

// 2. Enable DevSync
import { DevSyncProvider } from '@/contexts/DevSyncContext';

function App() {
  return (
    <DevSyncProvider>
      <Editor />
    </DevSyncProvider>
  );
}

// 3. Listen for activity updates
import { useDevSync } from '@/hooks/use-dev-sync';

function Component() {
  useDevSync((message) => {
    if (message.type === 'activity_update') {
      saveToBackend(message.payload);
    }
  });
}
```

### Full Integration

See [naca-integration.md](./naca-integration.md) for comprehensive examples.

---

## Troubleshooting

**DevSync not connecting:**
1. Check WebSocket endpoint is accessible
2. Verify CORS settings
3. Check browser console for errors

**Media not loading:**
1. Verify NACA base URL is set
2. Check CORS allows media requests
3. Test URLs directly in browser

**Import/Export fails:**
1. Validate JSON structure matches `ActivityDefinition`
2. Check required fields are present
3. Verify media URLs are accessible

---

## Related Documentation

- [NACA Integration Guide](./naca-integration.md)
- [API Reference](./api-reference.md)
- [Development Guide](./getting-started.md)
