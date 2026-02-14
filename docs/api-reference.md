
# API Reference

Complete reference for Activity Editor REST API endpoints.

## Base URL

Development: `http://localhost:5000`
Production: `https://your-deployment.replit.app`

## Authentication

Currently using session-based authentication. Future versions will support token-based auth.

## Endpoints

### Projects

#### List Projects
```http
GET /api/projects
```

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "My Project",
    "description": "Project description",
    "figmaFileKey": "abc123",
    "figmaPageId": null,
    "figmaLastSyncedAt": "2025-12-02T00:00:00.000Z",
    "figmaBranch": null,
    "createdAt": "2025-12-02T00:00:00.000Z",
    "updatedAt": "2025-12-02T00:00:00.000Z"
  }
]
```

#### Get Project
```http
GET /api/projects/:id
```

#### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "New Project",
  "description": "Optional description"
}
```

#### Update Project
```http
PUT /api/projects/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "figmaFileKey": "new-key"
}
```

#### Delete Project
```http
DELETE /api/projects/:id
```

#### Export Project
```http
GET /api/projects/:id/export
```

Returns complete `ActivityDefinition` object.

#### Import Project
```http
POST /api/projects/import
Content-Type: application/json

{
  "activity": ActivityDefinition
}
```

### Screens

#### List Screens
```http
GET /api/screens
```

Query parameters:
- `projectId`: Filter by project

#### Get Screen
```http
GET /api/screens/:id
```

#### Create Screen
```http
POST /api/screens
Content-Type: application/json

{
  "title": "Screen Name",
  "width": 1920,
  "height": 1080,
  "projectId": "uuid"
}
```

#### Update Screen
```http
PUT /api/screens/:id
Content-Type: application/json

{
  "title": "New Title"
}
```

#### Delete Screen
```http
DELETE /api/screens/:id
```

### Game Objects

#### List Objects
```http
GET /api/screens/:screenId/objects
```

#### Get Object
```http
GET /api/objects/:id
```

#### Create Object
```http
POST /api/screens/:screenId/objects
Content-Type: application/json

{
  "name": "Object 1",
  "type": "shape",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 200,
  "customId": "my-object",
  "classes": ["interactive"],
  "tags": ["clickable"]
}
```

#### Update Object
```http
PUT /api/objects/:id
Content-Type: application/json

{
  "x": 150,
  "y": 150,
  "rotation": 45
}
```

#### Delete Object
```http
DELETE /api/objects/:id
```

### Scenes

#### List Scenes
```http
GET /api/screens/:screenId/scenes
```

#### Get Scene
```http
GET /api/scenes/:id
```

#### Create Scene
```http
POST /api/screens/:screenId/scenes
Content-Type: application/json

{
  "name": "Scene Name",
  "isDefault": false
}
```

#### Update Scene
```http
PUT /api/scenes/:id
Content-Type: application/json

{
  "name": "Updated Name",
  "isDefault": true
}
```

#### Delete Scene
```http
DELETE /api/scenes/:id
```

### Object States

#### List Object States
```http
GET /api/scenes/:sceneId/object-states
```

#### Create/Update Object State
```http
POST /api/scenes/:sceneId/object-states
Content-Type: application/json

{
  "objectId": "uuid",
  "x": 200,
  "y": 300,
  "opacity": 0.5
}
```

#### Delete Object State
```http
DELETE /api/object-states/:id
```

### Triggers

#### List Triggers
```http
GET /api/scenes/:sceneId/triggers
```

#### Create Trigger
```http
POST /api/scenes/:sceneId/triggers
Content-Type: application/json

{
  "event": "click",
  "targetSelector": "#my-object",
  "action": "goToScene",
  "actionPayload": {
    "sceneId": "target-scene-uuid"
  }
}
```

#### Update Trigger
```http
PUT /api/triggers/:id
```

#### Delete Trigger
```http
DELETE /api/triggers/:id
```

### Animations

#### List Animations
```http
GET /api/objects/:objectId/animations
```

#### Get Animation
```http
GET /api/animations/:id
```

#### Create Animation
```http
POST /api/objects/:objectId/animations
Content-Type: application/json

{
  "name": "My Animation",
  "duration": 2,
  "loop": false,
  "autoplay": false
}
```

#### Update Animation
```http
PUT /api/animations/:id
Content-Type: application/json

{
  "duration": 3,
  "loop": true
}
```

#### Delete Animation
```http
DELETE /api/animations/:id
```

### Keyframes

#### List Keyframes
```http
GET /api/animations/:animationId/keyframes
```

#### Create Keyframe
```http
POST /api/keyframes
Content-Type: application/json

{
  "animationId": "uuid",
  "time": 1.5,
  "property": "x",
  "value": { "value": 300 },
  "ease": "power2.inOut"
}
```

#### Update Keyframe
```http
PUT /api/keyframes/:id
Content-Type: application/json

{
  "time": 2,
  "value": { "value": 400 }
}
```

#### Delete Keyframe
```http
DELETE /api/keyframes/:id
```

### Vocabulary

#### List Vocabulary
```http
GET /api/vocabulary
```

Query parameters:
- `projectId`: Filter by project
- `category`: Filter by category

#### Create Vocabulary Item
```http
POST /api/vocabulary
Content-Type: application/json

{
  "projectId": "uuid",
  "word": "Hello",
  "translation": "Háw'aa",
  "category": "greetings",
  "imageUrl": "https://...",
  "audioUrl": "https://..."
}
```

#### Update Vocabulary Item
```http
PUT /api/vocabulary/:id
```

#### Delete Vocabulary Item
```http
DELETE /api/vocabulary/:id
```

### Figma Integration

#### Get Figma Status
```http
GET /api/figma/status
```

**Response**:
```json
{
  "configured": true
}
```

#### Sync Figma Frames
```http
POST /api/figma/sync-frames
Content-Type: application/json

{
  "fileUrl": "https://www.figma.com/file/abc123/File-Name",
  "projectId": "uuid"
}
```

#### Sync Figma Layers
```http
POST /api/figma/sync-layers
Content-Type: application/json

{
  "screenId": "uuid"
}
```

## WebSocket API

### DevSync Connection

```javascript
const ws = new WebSocket('ws://localhost:5000/ws/dev-sync');

ws.onopen = () => {
  console.log('Connected to DevSync');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('Received:', message);
};

// Send message
ws.send(JSON.stringify({
  type: 'activity_update',
  componentId: 'activity-123',
  payload: activityData
}));
```

### Message Types

See [NACA Integration](./naca-integration.md) for complete message reference.

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

Currently no rate limiting. Future versions will implement per-session limits.

## Pagination

Endpoints that return lists may support pagination:

Query parameters:
- `limit`: Number of items (default: 100)
- `offset`: Offset for pagination (default: 0)

## Next Steps

- [Getting Started](./getting-started.md)
- [NACA Integration](./naca-integration.md)
- [Development Guide](./development-guide.md)
