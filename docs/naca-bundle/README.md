# NACA Integration Bundle - Activity Editor

This bundle contains the **complete Activity Editor application** - both backend API and frontend UI - for creating interactive language learning activities.

## Overview

The Activity Editor is an interactive design editor for creating language learning activities. It provides:

- **Screen Management** - Create and organize activity screens
- **Object System** - Canvas objects with transform, visibility, and data binding
- **Scene States** - Different states for game logic (correct, incorrect, intro, etc.)
- **Trigger System** - Event-driven interactions with CSS-like selectors
- **Vocabulary Management** - Word/translation pairs with media bindings
- **Animation Timeline** - GSAP-based keyframe animation system
- **NACA Integration** - Bidirectional sync with NACA communities
- **Figma Integration** - Import designs directly from Figma

## Directory Structure

```
naca-bundle/
├── backend/
│   ├── routes.ts          # Express.js API routes (2700+ lines)
│   ├── storage.ts         # Database storage interface with Drizzle ORM
│   ├── schema.ts          # PostgreSQL schema definitions
│   ├── dev-sync.ts        # WebSocket real-time sync service
│   ├── doc-builder.ts     # API documentation generator
│   ├── figma-service.ts   # Figma API integration
│   └── index.ts           # Server entry point
├── frontend/
│   ├── components/
│   │   ├── editor/        # Main editor components
│   │   │   ├── GameCanvas.tsx       # Interactive canvas
│   │   │   ├── CommunityExplorer.tsx # NACA browser
│   │   │   ├── VocabularyPanel.tsx  # Vocabulary management
│   │   │   ├── TimelinePanel.tsx    # Animation timeline
│   │   │   ├── SceneManager.tsx     # Scene/state management
│   │   │   ├── TriggerEditor.tsx    # Trigger configuration
│   │   │   └── ...more
│   │   ├── admin/         # Admin panels
│   │   ├── figma/         # Figma connection UI
│   │   └── ui/            # shadcn/ui components (60+ files)
│   ├── contexts/          # React contexts (4 files)
│   ├── hooks/             # Custom React hooks (20+ files)
│   ├── lib/               # Utilities and API clients
│   │   ├── naca-api.ts    # NACA API client (1500+ lines)
│   │   └── ...more
│   ├── pages/             # Route pages
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles (Tailwind)
├── docs/
│   └── API-REFERENCE.md   # Complete API documentation
├── examples/
│   ├── curl-examples.sh   # cURL command examples
│   └── javascript-client.ts # TypeScript usage examples
├── package.json           # NPM dependencies
├── vite.config.ts         # Vite configuration
└── README.md              # This file
```

## Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/database

# NACA Integration
NACA_API_URL=https://naca.community          # Production NACA server
ACTIVITY_EDITOR_API_KEY=your-api-key         # API key for authentication

# Optional
APP_BASE_URL=https://create.naca.community   # Your app's public URL
NODE_ENV=production                          # production or development
```

## Base URLs

| Environment | REST API | WebSocket |
|-------------|----------|-----------|
| Production | `https://create.naca.community` | `wss://create.naca.community/ws/dev-sync` |
| Development | `http://localhost:5000` | `ws://localhost:5000/ws/dev-sync` |

## Authentication

### API Key Authentication
```http
X-API-Key: your-activity-editor-api-key
```

### NACA Subdomain Header
```http
X-Community-Subdomain: little-bird-press
```

## Quick Start

### 1. Install Dependencies

```bash
npm install express drizzle-orm @neondatabase/serverless zod
```

### 2. Set Up Database

```bash
# Push schema to database
npm run db:push
```

### 3. Register Routes

```typescript
import express from 'express';
import { createServer } from 'http';
import { registerRoutes } from './routes';

const app = express();
app.use(express.json());

const httpServer = createServer(app);
await registerRoutes(httpServer, app);

httpServer.listen(5000, () => {
  console.log('Activity Editor API running on port 5000');
});
```

### 4. Connect to NACA

```typescript
import { NacaApiClient } from './naca-api';

const client = new NacaApiClient({
  baseUrl: 'https://naca.community',
  subdomain: 'little-bird-press'
});

// Fetch communities
const communities = await client.getCommunities();
```

## Core API Endpoints

### Screens
- `GET /api/screens` - List all screens
- `POST /api/screens` - Create screen
- `PATCH /api/screens/:id` - Update screen
- `DELETE /api/screens/:id` - Delete screen

### Objects
- `GET /api/screens/:screenId/objects` - List screen objects
- `POST /api/objects` - Create object
- `PATCH /api/objects/:id` - Update object
- `DELETE /api/objects/:id` - Delete object

### NACA Proxy
- `GET /api/naca-proxy/communities` - List NACA communities
- `GET /api/naca-proxy/communities/:id/dictionaries` - Get dictionaries
- `GET /api/naca-proxy/dictionaries/:id/entries` - Get dictionary entries
- `GET /api/naca-proxy/communities/:id/activities` - Get activities
- `GET /api/naca-media/*` - Proxy media files securely

## WebSocket Topics

| Topic | Direction | Description |
|-------|-----------|-------------|
| `activityDiff` | NACA → Editor | Real-time activity changes |
| `vocabulary_update` | NACA → Editor | Vocabulary modifications |
| `media_uploaded` | NACA → Editor | New media available |
| `ping` / `pong` | Bidirectional | Connection heartbeat |

## Rate Limiting

- **Requests**: 60 per minute
- **Burst**: 10 requests
- **Retry-After**: Header included on 429 responses

## Schema Overview

### Key Tables

| Table | Purpose |
|-------|---------|
| `screens` | Activity screens with dimensions and NACA mapping |
| `game_objects` | Canvas objects with transform and data binding |
| `scenes` | State containers for game logic |
| `triggers` | Event handlers with selectors and actions |
| `vocabulary` | Word/translation pairs with media |
| `animations` | Timeline containers for objects |
| `keyframes` | Individual animation keyframes |

### NACA Integration Fields

```typescript
// Screen -> NACA Activity mapping
nacaActivityId: text("naca_activity_id"),
nacaCommunityId: text("naca_community_id"),

// Object -> NACA data binding
dataKey: text("data_key"),    // vocab:{id} pattern
mediaUrl: text("media_url"),  // Proxied image URL
audioUrl: text("audio_url"),  // Proxied audio URL
```

## Support

For integration questions:
- API Documentation: `/api/docs/activity-editor`
- Markdown Docs: `/api/docs/activity-editor/markdown`

---

*Bundle Version: 1.0.0*
*Generated: December 2024*
