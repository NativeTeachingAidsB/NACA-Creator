
# Architecture Overview

This document describes the high-level architecture of the Activity Editor application.

## System Architecture

```
┌─────────────────────┐         WebSocket          ┌─────────────────────┐
│   Activity Editor   │ ◄──────────────────────► │   NACA Platform     │
│  (This Project)     │       /ws/dev-sync        │  (Runtime Player)   │
│                     │                            │                     │
│  - Figma Import     │    Activity Definition    │  - Activity Player  │
│  - Object Editing   │ ──────────────────────►   │  - Vocabulary DB    │
│  - Triggers/Scenes  │                            │  - User Progress    │
│  - Preview Mode     │    Content/Vocabulary      │  - Analytics        │
│  - Timeline Engine  │ ◄──────────────────────    │  - Media Library    │
└─────────────────────┘                            └─────────────────────┘
```

## Technology Stack

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query for server state
- **UI Components**: shadcn/ui (Radix primitives + Tailwind CSS)
- **Animation**: GSAP (GreenSock Animation Platform)
- **Forms**: React Hook Form + Zod validation

### Backend

- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL (Neon serverless)
- **ORM**: Drizzle ORM with schema-first approach
- **Real-time**: WebSocket (ws library)
- **Build**: esbuild for server bundling

### Development

- **Monorepo**: Single repository for client and server
- **Hot Reload**: Vite HMR for client, tsx watch for server
- **Type Safety**: Shared types between client/server
- **Code Style**: TypeScript strict mode

## Architecture Patterns

### Frontend Architecture

#### Component Structure

```
components/
├── editor/           # Feature-specific editor components
├── figma/           # Figma integration components
└── ui/              # Reusable UI primitives
```

**Separation of Concerns**:
- Editor components: Business logic and state management
- UI components: Presentational, reusable primitives
- Hooks: Shared logic and API integration

#### State Management

```typescript
// Server state via TanStack Query
const { data, isLoading } = useScreens();

// Local state via React hooks
const [selectedObject, setSelectedObject] = useState<GameObject | null>(null);

// Context for cross-cutting concerns
const { isPlaying, currentTime } = useTimeline();
const { isConnected, send } = useDevSync();
```

**Caching Strategy**:
- Aggressive caching with staleTime
- Optimistic updates for mutations
- Background refetching for real-time data

#### Real-time Updates

```typescript
// DevSync WebSocket integration
DevSyncProvider
  └── useDevSync() hook
      ├── Connection management
      ├── Message routing
      └── Query invalidation
```

### Backend Architecture

#### Layered Architecture

```
routes.ts           # HTTP endpoints
    ↓
storage.ts          # Data access abstraction
    ↓
db.ts              # Drizzle ORM client
    ↓
PostgreSQL         # Database
```

**Benefits**:
- Database independence via IStorage interface
- Testability with mock implementations
- Clear separation of concerns

#### API Design

**RESTful Endpoints**:
```
GET    /api/screens                    # List screens
POST   /api/screens                    # Create screen
GET    /api/screens/:id                # Get screen
PUT    /api/screens/:id                # Update screen
DELETE /api/screens/:id                # Delete screen
GET    /api/screens/:id/objects        # List objects
POST   /api/screens/:id/objects        # Create object
```

**WebSocket Events**:
```
activity_update      # Full activity export
vocabulary_push      # Vocabulary sync from NACA
preview_request      # Preview scene request
request_activity     # Request full export
media_library_update # Media library changes
dictionary_sync      # Dictionary updates
```

#### Error Handling

```typescript
// Centralized error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.message
  });
});
```

## Data Flow

### Figma Import Flow

```
Figma API
    ↓
figma-service.ts (fetch & transform)
    ↓
routes.ts (POST /api/figma/sync)
    ↓
storage.ts (persist screens & objects)
    ↓
PostgreSQL
    ↓
TanStack Query (invalidate & refetch)
    ↓
React Components (re-render)
```

### Animation Playback Flow

```
Timeline Context (GSAP timeline instance)
    ↓
Keyframes from API
    ↓
Convert to GSAP tweens
    ↓
Register with timeline
    ↓
Playback controls (play/pause/seek)
    ↓
onUpdate callback
    ↓
Update React state (currentTime)
    ↓
Canvas re-renders with interpolated values
```

### DevSync Flow

```
Activity Editor (client)
    ↓
WebSocket connection (/ws/dev-sync)
    ↓
dev-sync.ts (message router)
    ↓
Broadcast to NACA platform
    ↓
NACA processes update
    ↓
Send confirmation/updates back
    ↓
Query invalidation in Editor
    ↓
UI reflects changes
```

## Database Schema

### Core Tables

```
projects
  - id, name, description
  - figmaFileKey, figmaLastSyncedAt
  - createdAt, updatedAt

screens
  - id, projectId, title
  - imageUrl, width, height
  - figmaFrameId, figmaNodeHash
  - createdAt

gameObjects
  - id, screenId, name, type
  - x, y, width, height
  - rotation, scaleX, scaleY, opacity
  - visible, dataKey
  - customId, classes, tags, zIndex
  - mediaUrl, audioUrl
  - figmaNodeId
  - createdAt

scenes
  - id, screenId, name
  - order, isDefault
  - createdAt

objectStates
  - id, sceneId, objectId
  - x, y, width, height
  - rotation, scaleX, scaleY
  - opacity, visible
  - createdAt

triggers
  - id, sceneId
  - event, targetSelector
  - action, actionPayload
  - condition
  - createdAt

animations
  - id, objectId, sceneId
  - name, duration
  - loop, autoplay, playbackRate
  - order
  - createdAt

keyframes
  - id, animationId
  - time, property
  - value (JSONB)
  - ease, locked
  - createdAt

vocabulary
  - id, projectId
  - word, translation
  - imageUrl, audioUrl
  - category, difficulty
  - metadata (JSONB)
  - createdAt
```

### Relationships

```
projects 1──* screens
screens 1──* gameObjects
screens 1──* scenes
scenes 1──* objectStates
scenes 1──* triggers
gameObjects 1──* animations
gameObjects 1──* objectStates
animations 1──* keyframes
projects 1──* vocabulary
```

## Security Considerations

### Authentication

Currently using session-based authentication with PostgreSQL store:

```typescript
// express-session with pg-simple
app.use(session({
  store: new PgStore({
    pool: db,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### Data Validation

- **Input validation**: Zod schemas for all API inputs
- **Type safety**: TypeScript strict mode
- **SQL injection**: Parameterized queries via Drizzle ORM

### WebSocket Security

- Same-origin policy enforcement
- Message validation
- Client identification and tracking

## Performance Optimization

### Frontend

- **Code splitting**: Route-based lazy loading
- **Memoization**: React.memo for expensive renders
- **Virtualization**: For large lists (planned)
- **Debouncing**: Input handlers and API calls

### Backend

- **Connection pooling**: Neon serverless with pooling
- **Query optimization**: Indexed columns, JOIN minimization
- **Caching**: TanStack Query aggressive caching

### Asset Optimization

- **Image optimization**: Local storage with efficient serving
- **Lazy loading**: Assets loaded on demand
- **CDN**: For production (Replit deployment)

## Deployment Architecture

```
Replit Container
    ├── Node.js Server (Express)
    │   ├── API endpoints (:5000)
    │   ├── WebSocket server (/ws/dev-sync)
    │   └── Static file serving
    ├── Vite Dev Server (development only)
    └── PostgreSQL (Neon serverless)
```

**Production Build**:
```bash
npm run build
  ├── Build client (Vite)
  └── Bundle server (esbuild)

npm run preview
  └── Serve production build
```

## Monitoring and Debugging

### Logging

```typescript
// Structured logging
console.log(`[${context}] ${message}`, data);

// Error logging
console.error(`[${context}] Error:`, error);
```

### DevSync Indicator

Real-time connection status in UI:
- Connected (green)
- Disconnected (red)
- Polling fallback (yellow)

### Browser DevTools

- React DevTools for component inspection
- TanStack Query DevTools for cache inspection
- Network tab for API monitoring

## Next Steps

- [Feature Documentation](./features/README.md)
- [API Reference](./api-reference.md)
- [NACA Integration](./naca-integration.md)
- [Development Guide](./development-guide.md)
