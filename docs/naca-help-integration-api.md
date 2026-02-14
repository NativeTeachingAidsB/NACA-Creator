
# NACA Help System Integration API

## Activity Editor → NACA Sync Endpoints

### 1. Full Help Content Export

```http
GET /api/help-export
Authorization: Bearer {naca-access-token}
```

**Response:**
```json
{
  "version": "1.0.0",
  "exportedAt": "2025-12-03T12:00:00Z",
  "totalFeatures": 45,
  "totalVideos": 38,
  "categories": {
    "canvas": {
      "name": "Canvas Tools",
      "description": "Tools for navigating and manipulating the canvas",
      "order": 1
    },
    "objects": {
      "name": "Object Management",
      "description": "Working with objects and their properties",
      "order": 2
    },
    "timeline": {
      "name": "Timeline & Animation",
      "description": "Creating and editing animations",
      "order": 3
    },
    "triggers": {
      "name": "Triggers & Interactions",
      "description": "Adding interactive behaviors",
      "order": 4
    },
    "scenes": {
      "name": "Scenes & States",
      "description": "Managing scenes and object states",
      "order": 5
    },
    "vocabulary": {
      "name": "Vocabulary & Community",
      "description": "Managing vocabulary and community resources",
      "order": 6
    }
  },
  "features": [
    {
      "id": "uuid",
      "featureKey": "canvas-navigation",
      "title": "Canvas Navigation",
      "description": "Learn how to pan and zoom around the canvas workspace",
      "category": "canvas",
      "shortcutKey": "Space",
      "order": 1,
      "isNew": false,
      "videoUrl": "https://activity-editor.repl.co/videos/canvas_navigation_demo.mp4",
      "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation_demo.jpg",
      "relatedFeatures": ["zoom-controls", "pan-mode", "fit-to-screen"],
      "viewCount": 142,
      "lastViewedAt": "2025-12-03T11:30:00Z",
      "documentedAt": "2025-12-01T10:00:00Z",
      "testedAt": "2025-12-02T15:00:00Z",
      "createdAt": "2025-11-15T08:00:00Z",
      "updatedAt": "2025-12-03T09:00:00Z"
    }
  ],
  "videos": [
    {
      "featureKey": "canvas-navigation",
      "url": "https://activity-editor.repl.co/videos/canvas_navigation_demo.mp4",
      "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation_demo.jpg",
      "duration": 45,
      "fileSize": 2048576,
      "format": "mp4",
      "resolution": "1920x1080",
      "generatedAt": "2025-12-02T15:30:00Z",
      "testPlanPath": "docs/video-test-plans/canvas-tools.md"
    }
  ]
}
```

### 2. Incremental Updates Feed

```http
GET /api/help-updates?since={timestamp}
Authorization: Bearer {naca-access-token}
```

**Parameters:**
- `since` - ISO timestamp of last sync

**Response:**
```json
{
  "updatedFeatures": [
    {
      "featureKey": "canvas-navigation",
      "changes": {
        "description": "Updated with new tips",
        "relatedFeatures": ["zoom-controls", "pan-mode", "fit-to-screen", "reset-view"]
      },
      "updatedAt": "2025-12-03T11:00:00Z"
    }
  ],
  "newVideos": [
    {
      "featureKey": "layer-ordering",
      "url": "https://activity-editor.repl.co/videos/layer_order_demo.mp4",
      "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/layer_order_demo.jpg",
      "generatedAt": "2025-12-03T10:00:00Z"
    }
  ],
  "deletedFeatures": [],
  "timestamp": "2025-12-03T12:00:00Z"
}
```

### 3. Video Direct Access

```http
GET /api/help-video/{featureKey}
Authorization: Bearer {naca-access-token}
```

**Response:**
```json
{
  "featureKey": "canvas-navigation",
  "url": "https://activity-editor.repl.co/videos/canvas_navigation_demo.mp4",
  "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation_demo.jpg",
  "duration": 45,
  "format": "mp4",
  "expiresAt": "2025-12-10T12:00:00Z"
}
```

## NACA → Activity Editor Endpoints

### 1. Sync Acknowledgement

```http
POST /api/naca-sync/acknowledge
Authorization: Bearer {activity-editor-token}
Content-Type: application/json
```

**Request:**
```json
{
  "syncType": "full" | "incremental",
  "timestamp": "2025-12-03T12:00:00Z",
  "featuresReceived": 45,
  "videosReceived": 38,
  "status": "success" | "partial" | "failed",
  "errors": []
}
```

### 2. Request Video Regeneration

```http
POST /api/video-regenerate/{featureKey}
Authorization: Bearer {naca-token}
```

**Request:**
```json
{
  "reason": "quality_issue" | "outdated" | "missing",
  "notes": "Video shows old UI, needs update"
}
```

**Response:**
```json
{
  "status": "queued",
  "estimatedCompletionAt": "2025-12-03T13:00:00Z",
  "queuePosition": 3
}
```

## WebSocket Events

### Activity Editor → NACA

**Connect:**
```javascript
const ws = new WebSocket('wss://activity-editor.repl.co/ws?type=naca-help');
ws.send(JSON.stringify({
  type: 'auth',
  token: 'naca-access-token'
}));
```

**Events:**

1. **New Video Generated**
```json
{
  "type": "help:video:generated",
  "timestamp": "2025-12-03T12:00:00Z",
  "payload": {
    "featureKey": "canvas-navigation",
    "videoUrl": "https://activity-editor.repl.co/videos/canvas_navigation_demo.mp4",
    "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation_demo.jpg",
    "duration": 45,
    "changes": "Regenerated with updated UI"
  }
}
```

2. **Help Content Updated**
```json
{
  "type": "help:content:updated",
  "timestamp": "2025-12-03T12:00:00Z",
  "payload": {
    "featureKey": "canvas-navigation",
    "changes": {
      "description": "New description",
      "relatedFeatures": ["new-feature"]
    }
  }
}
```

3. **New Feature Added**
```json
{
  "type": "help:feature:added",
  "timestamp": "2025-12-03T12:00:00Z",
  "payload": {
    "featureKey": "new-feature",
    "title": "New Feature",
    "category": "canvas",
    "hasVideo": false
  }
}
```

## Implementation Example (NACA Side)

```typescript
// NACA Help Sync Service
class ActivityEditorHelpSync {
  private baseUrl = 'https://activity-editor.repl.co';
  private token = process.env.ACTIVITY_EDITOR_API_KEY;
  
  async syncFull() {
    const response = await fetch(`${this.baseUrl}/api/help-export`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    
    const data = await response.json();
    
    // Store in NACA database
    await this.storeFeaturesInDatabase(data.features);
    await this.storeVideosMetadata(data.videos);
    
    return data;
  }
  
  async syncIncremental(since: Date) {
    const timestamp = since.toISOString();
    const response = await fetch(
      `${this.baseUrl}/api/help-updates?since=${timestamp}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    
    const updates = await response.json();
    
    // Apply incremental updates
    await this.applyUpdates(updates);
    
    return updates;
  }
  
  connectWebSocket() {
    const ws = new WebSocket(`wss://activity-editor.repl.co/ws?type=naca-help`);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        type: 'auth',
        token: this.token
      }));
    });
    
    ws.on('message', (data) => {
      const event = JSON.parse(data.toString());
      this.handleRealtimeUpdate(event);
    });
  }
  
  private async handleRealtimeUpdate(event: any) {
    switch (event.type) {
      case 'help:video:generated':
        await this.updateVideoMetadata(event.payload);
        break;
      case 'help:content:updated':
        await this.updateFeatureContent(event.payload);
        break;
      case 'help:feature:added':
        await this.addNewFeature(event.payload);
        break;
    }
  }
}
```

## Authentication

All API endpoints require Bearer token authentication:

```http
Authorization: Bearer {token}
```

Tokens should be:
- Generated securely
- Rotated regularly
- Stored in environment variables
- Scoped to specific operations

## Rate Limiting

- Full export: 1 request per hour
- Incremental updates: 1 request per minute
- Video access: 100 requests per minute
- WebSocket: 1 connection per NACA instance
