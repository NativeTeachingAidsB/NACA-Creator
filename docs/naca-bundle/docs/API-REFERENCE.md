# Activity Editor API Reference

Complete API documentation for the Activity Editor.

## Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://create.naca.community` |
| Development | `http://localhost:5000` |

## Authentication

### API Key
```http
X-API-Key: your-api-key
```

### NACA Subdomain
```http
X-Community-Subdomain: community-slug
```

---

## Screens API

### List All Screens
```http
GET /api/screens
```

**Response:**
```json
[
  {
    "id": "uuid",
    "projectId": "uuid",
    "title": "Screen Title",
    "imageUrl": "/path/to/image.png",
    "width": 1194,
    "height": 834,
    "positionX": 0,
    "positionY": 0,
    "figmaFrameId": "1:123",
    "nacaActivityId": "activity-uuid",
    "nacaCommunityId": "community-uuid",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Get Single Screen
```http
GET /api/screens/:id
```

### Create Screen
```http
POST /api/screens
Content-Type: application/json

{
  "projectId": "uuid",
  "title": "New Screen",
  "imageUrl": "/placeholder.png",
  "width": 1194,
  "height": 834
}
```

### Update Screen
```http
PATCH /api/screens/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "nacaActivityId": "activity-uuid"
}
```

### Delete Screen
```http
DELETE /api/screens/:id
```
**Response:** `204 No Content`

---

## Game Objects API

### List Objects by Screen
```http
GET /api/screens/:screenId/objects
```

**Response:**
```json
[
  {
    "id": "uuid",
    "screenId": "uuid",
    "name": "Object Name",
    "type": "shape",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 150,
    "rotation": 0,
    "scaleX": 1,
    "scaleY": 1,
    "opacity": 1,
    "visible": true,
    "locked": false,
    "dataKey": "vocab:entry-id",
    "mediaUrl": "/api/naca-media/path/to/image.webp",
    "audioUrl": "/api/naca-media/path/to/audio.mp3",
    "customId": "my-custom-id",
    "classes": ["interactive", "draggable"],
    "tags": ["vocabulary", "noun"],
    "zIndex": 10,
    "metadata": {
      "fill": "#ff0000",
      "gradientId": "gradient-1"
    }
  }
]
```

### Create Object
```http
POST /api/objects
Content-Type: application/json

{
  "screenId": "uuid",
  "name": "New Object",
  "type": "shape",
  "x": 0,
  "y": 0,
  "width": 100,
  "height": 100
}
```

### Update Object
```http
PATCH /api/objects/:id
Content-Type: application/json

{
  "x": 150,
  "y": 200,
  "dataKey": "vocab:entry-uuid"
}
```

### Delete Object
```http
DELETE /api/objects/:id
```

### Batch Update Z-Index
```http
PATCH /api/objects/batch-zindex
Content-Type: application/json

{
  "updates": [
    { "id": "obj-1", "zIndex": 1 },
    { "id": "obj-2", "zIndex": 2 }
  ]
}
```

---

## Scenes API

### List Scenes by Screen
```http
GET /api/screens/:screenId/scenes
```

**Response:**
```json
[
  {
    "id": "uuid",
    "screenId": "uuid",
    "name": "Correct",
    "order": 0,
    "isDefault": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Scene
```http
POST /api/scenes
Content-Type: application/json

{
  "screenId": "uuid",
  "name": "Incorrect",
  "order": 1,
  "isDefault": false
}
```

### Update Scene
```http
PATCH /api/scenes/:id
```

### Delete Scene
```http
DELETE /api/scenes/:id
```

---

## Object States API

### List States by Scene
```http
GET /api/scenes/:sceneId/states
```

### Create Object State
```http
POST /api/states
Content-Type: application/json

{
  "sceneId": "uuid",
  "objectId": "uuid",
  "opacity": 0.5,
  "visible": true,
  "x": 100,
  "animationDuration": 0.3,
  "animationEase": "power2.out"
}
```

---

## Triggers API

### List Triggers by Scene
```http
GET /api/scenes/:sceneId/triggers
```

**Response:**
```json
[
  {
    "id": "uuid",
    "sceneId": "uuid",
    "objectId": "uuid",
    "type": "click",
    "targetSceneId": "uuid",
    "delay": 0,
    "targetSelector": ".interactive",
    "action": "goToScene",
    "actionPayload": null
  }
]
```

### Trigger Types
- `click` - User clicks object
- `hover` - Mouse enters object
- `timer` - After delay
- `start` - Scene starts
- `correct` - Correct answer
- `incorrect` - Incorrect answer

### Action Types
- `goToScene` - Navigate to scene
- `setVisible` - Set visibility
- `setOpacity` - Change opacity
- `addClass` - Add CSS class
- `removeClass` - Remove CSS class
- `playAudio` - Play audio file
- `setProperty` - Set any property

---

## Vocabulary API

### List All Vocabulary
```http
GET /api/vocabulary
```

### List by Project
```http
GET /api/projects/:projectId/vocabulary
```

### Create Vocabulary Entry
```http
POST /api/vocabulary
Content-Type: application/json

{
  "projectId": "uuid",
  "word": "dog",
  "translation": "chien",
  "imageUrl": "/images/dog.png",
  "audioUrl": "/audio/dog.mp3",
  "category": "animals",
  "difficulty": 1
}
```

---

## Animations API

### List Animations by Object
```http
GET /api/objects/:objectId/animations
```

### Create Animation
```http
POST /api/animations
Content-Type: application/json

{
  "objectId": "uuid",
  "name": "Bounce",
  "duration": 1.0,
  "loop": true,
  "autoplay": false
}
```

---

## Keyframes API

### List Keyframes by Animation
```http
GET /api/animations/:animationId/keyframes
```

### Create Keyframe
```http
POST /api/keyframes
Content-Type: application/json

{
  "animationId": "uuid",
  "time": 0.5,
  "property": "y",
  "value": 100,
  "ease": "power2.out"
}
```

### Animatable Properties
- `x`, `y` - Position
- `width`, `height` - Dimensions
- `rotation` - Rotation in degrees
- `scaleX`, `scaleY` - Scale factors
- `opacity` - Transparency (0-1)

---

## NACA Proxy API

### Get Proxy Configuration
```http
GET /api/naca-proxy/config
```

**Response:**
```json
{
  "serverUrl": "https://naca.community",
  "subdomain": "little-bird-press",
  "apiKeyDisabled": false,
  "apiKeySource": "environment"
}
```

### List Communities
```http
GET /api/naca-proxy/communities
```

### Get Community Profile
```http
GET /api/naca-proxy/communities/:id
```

### List Dictionaries
```http
GET /api/naca-proxy/communities/:communityId/dictionaries
```

### Get Dictionary Entries
```http
GET /api/naca-proxy/dictionaries/:id/entries
```

### List Activities
```http
GET /api/naca-proxy/communities/:communityId/activities
```

### Get Activity Details
```http
GET /api/naca-proxy/activities/:id
```

### Get Activity Items
```http
GET /api/naca-proxy/activities/:id/items
```

### List Media
```http
GET /api/naca-proxy/communities/:communityId/media?type=image
```

### Proxy Media Files
```http
GET /api/naca-media/*
```
Securely proxies media files from NACA servers.

---

## Projects API

### List Projects
```http
GET /api/projects
```

### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "My Language Game",
  "description": "A vocabulary learning activity"
}
```

### Export Project
```http
GET /api/projects/:id/export
```

Returns complete project data including screens, objects, scenes, and vocabulary.

---

## WebSocket API

### Connection
```
ws://localhost:5000/ws/dev-sync
wss://create.naca.community/ws/dev-sync
```

### Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `activityDiff` | NACA → Editor | Real-time activity changes |
| `vocabulary_update` | NACA → Editor | Vocabulary modifications |
| `media_uploaded` | NACA → Editor | New media available |
| `activity_published` | NACA → Editor | Activity published |
| `ping` | Client → Server | Heartbeat request |
| `pong` | Server → Client | Heartbeat response |

### Message Format
```json
{
  "type": "activityDiff",
  "payload": {
    "activityId": "uuid",
    "changes": []
  }
}
```

---

## Rate Limiting

- **Limit:** 60 requests per minute
- **Burst:** 10 requests
- **Header:** `Retry-After` on 429 responses

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid data"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded"
}
```
Headers: `Retry-After: 60`

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```
