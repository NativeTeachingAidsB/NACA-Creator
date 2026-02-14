# Activity Editor Roadmap

A content authoring tool for creating interactive, data-driven language learning games with Figma integration. Part of the NACA (NativeTongueLexicon Activity Center) platform.

## System Context

```
┌─────────────────────┐         WebSocket          ┌─────────────────────┐
│   Activity Editor   │ ◄──────────────────────► │   NACA Platform     │
│  (This Project)     │       /ws/dev-sync        │  (Runtime Player)   │
│                     │                            │                     │
│  - Figma Import     │    Activity Definition    │  - Activity Player  │
│  - Object Editing   │ ──────────────────────►   │  - Vocabulary DB    │
│  - Triggers/Scenes  │                            │  - User Progress    │
│  - Preview Mode     │    Content/Vocabulary      │  - Analytics        │
│                     │ ◄──────────────────────    │                     │
└─────────────────────┘                            └─────────────────────┘
```

---

## Phase 1: Core Authoring ✅

**Status:** Complete (December 2, 2025)

### 1.1 Figma Sync Workflow ✅
- [x] Connect Figma files by URL
- [x] Parse file key and branch from URL
- [x] Sync frames as screens with local image storage
- [x] Content-aware hash for change detection
- [x] Batched API requests for large files

### 1.2 Figma Layer Import ✅
- [x] Fetch child nodes within frames (depth=4)
- [x] Import layers as game objects with bounding boxes
- [x] Preserve Figma node ID for re-sync matching
- [x] Compute z-index from layer order in Figma tree
- [x] Support FRAME, GROUP, RECTANGLE, TEXT, VECTOR, ELLIPSE, LINE, INSTANCE, COMPONENT types

### 1.3 Object Identifiers ✅
- [x] `customId` - user-defined ID for programmatic targeting
- [x] `classes` - array of class names (like CSS classes)
- [x] `tags` - flexible tagging for grouping/querying
- [x] `zIndex` - explicit layer order (derived from Figma, user-adjustable)

### 1.4 Layer Visualization ✅
- [x] Render layer boundaries as selectable overlays
- [x] Show/hide layer outlines toggle
- [x] Correct z-order stacking on canvas
- [x] Visual distinction: dashed blue for Figma layers, solid purple for manual
- [x] Type badge display for Figma layers
- [ ] Multi-select layers for bulk operations (deferred to Phase 2)

### 1.5 Smart Re-sync ✅
- [x] Match existing objects by `figmaNodeId`
- [x] Preserve user-added IDs, classes, triggers
- [x] Update position/dimensions from Figma
- [ ] Detect deleted layers, offer removal (deferred to Phase 2)

---

## Phase 2: Editor UX Infrastructure

**Status:** Planned
**Priority:** HIGH - Foundation for all subsequent features

### 2.1 Panel System Architecture
- [ ] Resizable left/right drawer panels with drag handles
- [ ] Panel width persistence (localStorage)
- [ ] Expand/contract animations with smooth transitions
- [ ] Minimum/maximum width constraints
- [ ] Double-click to auto-fit panel width

### 2.2 Collapsible Palettes
- [ ] Collapsible sections within each panel
- [ ] Accordion-style or independent collapse modes
- [ ] Collapse state persistence per user
- [ ] Keyboard shortcuts for panel toggling (e.g., Tab, \)

### 2.3 Tool Organization
- [ ] **Left Panel (Structure):**
  - Project/Screen navigator
  - Layer hierarchy tree
  - Scene manager
  - Object grouping controls
- [ ] **Right Panel (Properties):**
  - Attribute editor
  - Trigger editor
  - Vocabulary binding
  - Data inspector

### 2.4 Workspace Presets
- [ ] Save/load workspace layouts
- [ ] Default presets: Minimal, Balanced, Full
- [ ] Quick-toggle between presets

---

## Phase 3: Object Manipulation

**Status:** Planned
**Priority:** HIGH - Core editing capabilities

### 3.1 Deep Selection & Isolation
- [ ] Double-click to drill into nested objects/groups
- [ ] Isolation mode (dim non-selected hierarchy)
- [ ] Breadcrumb trail for selection depth
- [ ] Escape key to exit isolation / go up one level
- [ ] Click outside to deselect

### 3.2 Object Rotation & Registration Points
- [ ] Rotation handles on selected objects
- [ ] Visual rotation indicator (degrees)
- [ ] Registration/pivot point display
- [ ] Drag to move registration point
- [ ] Preset registration positions (center, corners, edges)
- [ ] Numeric rotation input in attribute panel
- [ ] Snap rotation to 15° increments (hold Shift)

### 3.3 Object Grouping
- [ ] Select multiple objects (Shift+click, drag select)
- [ ] Group selection (Cmd/Ctrl+G)
- [ ] Ungroup (Cmd/Ctrl+Shift+G)
- [ ] Nested groups support
- [ ] Group bounding box display
- [ ] Group-level transforms (move, rotate, scale all children)

### 3.4 Right-Click Context Menus
- [ ] Object context menu:
  - Cut / Copy / Paste / Duplicate
  - Delete
  - Group / Ungroup
  - Bring to Front / Send to Back
  - Lock / Unlock
  - Hide / Show
- [ ] Canvas context menu:
  - Paste
  - Create new object
  - Zoom controls
  - Toggle grid/guides
- [ ] Layer tree context menu:
  - Rename
  - Duplicate
  - Delete
  - Move to screen

### 3.5 Multi-Select Operations
- [ ] Bulk attribute editing
- [ ] Align objects (left, center, right, top, middle, bottom)
- [ ] Distribute objects (horizontal, vertical spacing)
- [ ] Match size (width, height, both)

---

## Phase 4: Language Input Features

**Status:** Planned
**Priority:** MEDIUM - Enhanced text editing for language content

### 4.1 Auto-Complete & Type-Ahead
- [ ] Vocabulary word suggestions as you type
- [ ] Recent entries history
- [ ] Fuzzy matching for misspellings
- [ ] Category-filtered suggestions
- [ ] Keyboard navigation (arrow keys, Enter to select)

### 4.2 Character Picker
- [ ] Special character palette for language-specific input
- [ ] Accent marks and diacritics (é, ñ, ü, etc.)
- [ ] IPA (International Phonetic Alphabet) characters
- [ ] Recently used characters section
- [ ] Searchable character browser
- [ ] Keyboard shortcut to open (Ctrl+Shift+C)

### 4.3 Mini Dictionary Panel
- [ ] Inline dictionary lookup
- [ ] Word definition display
- [ ] Part of speech indicators
- [ ] Example sentences
- [ ] Audio pronunciation playback
- [ ] Add to vocabulary quick action

### 4.4 Community Switching Filter
- [ ] Language community selector
- [ ] Filter vocabulary by community/language pair
- [ ] Community-specific character sets
- [ ] Shared vs. personal vocabulary toggle

---

## Phase 5: NACA Media Integration

**Status:** Planned
**Priority:** MEDIUM - Host platform asset integration

### 5.1 Media Library Panel
- [ ] Browse NACA platform media assets
- [ ] Grid/list view toggle
- [ ] Thumbnail previews for images
- [ ] Audio waveform previews
- [ ] Video thumbnail with duration

### 5.2 Search & Filtering
- [ ] Full-text search across media library
- [ ] Filter by type (image, audio, video)
- [ ] Filter by tags/categories
- [ ] Filter by upload date
- [ ] Sort options (name, date, size, type)

### 5.3 Asset Integration
- [ ] Drag-and-drop from library to canvas
- [ ] Quick-assign to vocabulary items
- [ ] Asset URL resolution for export
- [ ] Local caching for offline preview

### 5.4 Upload Integration
- [ ] Upload new assets to NACA from editor
- [ ] Bulk upload support
- [ ] Upload progress indicator
- [ ] Auto-categorization suggestions

---

## Phase 6: Programmatic Control

**Status:** Planned

### 6.1 Enhanced Triggers
- [ ] Target objects by `customId` or `class`
- [ ] Multi-target triggers (affect multiple objects)
- [ ] Conditional triggers with expressions
- [ ] Audio triggers (play sound)

### 6.2 Data Binding
- [ ] Bind vocabulary to objects via `dataKey`
- [ ] Dynamic text replacement from vocabulary
- [ ] Image swap based on vocabulary `imageUrl`
- [ ] Audio playback from vocabulary `audioUrl`

### 6.3 Animation System
- [ ] GSAP timeline editor
- [ ] Keyframe-based animations
- [ ] Animation curves/easing presets
- [ ] Animation preview in edit mode

### 6.4 Scene Flow
- [ ] Visual scene graph editor
- [ ] Branching logic (if correct → scene A, else → scene B)
- [ ] Scene groups for activity segments
- [ ] Timer-based auto-progression

---

## Phase 7: NACA Platform Integration

**Status:** Partially Complete (December 2, 2025)

### 7.1 WebSocket DevSync ✅
- [x] WebSocket server at `/ws/dev-sync`
- [x] Bidirectional state sync with NACA
- [x] Real-time activity preview in NACA player
- [x] Vocabulary push from NACA to Editor
- [x] Client identification and count broadcasting

### 7.2 Activity Export Format ✅
```typescript
interface ActivityDefinition {
  id: string;
  componentId: string;  // Unique ID for NACA scoping
  version: string;
  screens: ActivityScreen[];
  vocabulary?: VocabularyBinding[];
}

interface ActivityScreen {
  id: string;
  figmaFrameId: string;
  imageUrl: string;
  width: number;
  height: number;
  objects: ActivityObject[];
  scenes: ActivityScene[];
}

interface ActivityObject {
  id: string;
  customId?: string;
  classes: string[];
  tags: string[];
  figmaNodeId: string;
  type: string;
  bounds: { x: number; y: number; width: number; height: number };
  zIndex: number;
  dataKey?: string;
}

interface ActivityScene {
  id: string;
  name: string;
  isDefault: boolean;
  objectStates: ObjectStateOverride[];
  triggers: ActivityTrigger[];
}
```

### 7.3 Content Binding
- [ ] Receive vocabulary sets from NACA
- [ ] Bind objects to vocabulary keys
- [ ] Preview with sample vocabulary data
- [ ] Validate data bindings

### 7.4 Import/Export
- [ ] Export activity as JSON file
- [ ] Import activity from JSON
- [ ] Activity versioning
- [ ] Activity duplication

---

## Phase 8: Production Features

**Status:** Future

### 8.1 Runtime Player
- [ ] Standalone activity player component
- [ ] Embed API for external platforms
- [ ] Touch/gesture support for iPad
- [ ] Accessibility features (screen reader, keyboard nav)

### 8.2 Activity Templates
- [ ] Flashcard template
- [ ] Multiple choice template
- [ ] Drag-and-drop template
- [ ] Matching game template

### 8.3 Analytics Integration
- [ ] Track user interactions
- [ ] Time-on-task metrics
- [ ] Correctness tracking
- [ ] Export analytics data

### 8.4 Collaboration
- [ ] Multi-user editing
- [ ] Comments on objects/scenes
- [ ] Activity review workflow
- [ ] Version history

---

## Technical Architecture

### Data Flow
```
Figma Design → Figma API → Activity Editor → Activity Definition → NACA Player
                              ↓
                         PostgreSQL DB
                              ↓
                    projects, screens, gameObjects,
                    scenes, objectStates, triggers,
                    vocabulary, figmaNodes
```

### Key Technologies
- **Frontend:** React + TypeScript, Wouter routing, TanStack Query
- **Backend:** Express.js, Drizzle ORM, PostgreSQL (Neon)
- **Animation:** GSAP for runtime animations
- **UI:** shadcn/ui + Radix primitives + Tailwind CSS
- **Real-time:** WebSocket for DevSync

### Database Schema (Core Tables)
- `projects` - Top-level activity containers with Figma connection
- `screens` - Imported Figma frames as activity screens
- `gameObjects` - Interactive layers with transforms and identifiers
- `scenes` - Named states/configurations per screen
- `objectStates` - Per-scene property overrides
- `triggers` - Event → action mappings
- `vocabulary` - Language learning content
- `figmaNodes` - Figma tree structure for sync diffing

---

## Integration Contract

### For NACA Platform

The Activity Editor exposes:

1. **WebSocket endpoint:** `wss://<editor-host>/ws/dev-sync`
2. **Message format:**
   ```json
   {
     "type": "activity_update",
     "componentId": "activity-123",
     "payload": { /* ActivityDefinition */ }
   }
   ```
3. **REST API:**
   - `GET /api/activities/:id/export` - Full activity JSON
   - `POST /api/activities/:id/import` - Import activity JSON

### From NACA Platform

The Editor accepts:

1. **Vocabulary sync:**
   ```json
   {
     "type": "vocabulary_push",
     "componentId": "activity-123",
     "payload": {
       "vocabularySetId": "set-456",
       "items": [{ "word": "...", "translation": "..." }]
     }
   }
   ```
2. **Preview requests:**
   ```json
   {
     "type": "preview_request",
     "componentId": "activity-123",
     "sceneId": "scene-789"
   }
   ```

---

## Dependency Graph

```
Phase 1: Core Authoring ✅
    │
    ▼
Phase 2: Editor UX Infrastructure ◄─────────────────────┐
    │                                                    │
    ├───────────────────┬───────────────────┐           │
    ▼                   ▼                   ▼           │
Phase 3:           Phase 4:            Phase 5:         │
Object             Language            NACA Media       │
Manipulation       Input               Integration      │
    │                   │                   │           │
    └───────────────────┼───────────────────┘           │
                        ▼                               │
                Phase 6: Programmatic Control           │
                        │                               │
                        ▼                               │
                Phase 7: NACA Platform Integration ─────┘
                        │
                        ▼
                Phase 8: Production Features
```

**Build Priority:**
1. **Phase 2 (Editor UX)** - Must be built first as foundation
2. **Phases 3, 4, 5** - Can be built in parallel after Phase 2
3. **Phase 6** - Depends on object manipulation and input features
4. **Phase 7** - Integrates all features with NACA platform
5. **Phase 8** - Final production polish

---

## Milestones

| Milestone | Phase | Target | Status |
|-----------|-------|--------|--------|
| Figma frame import | 1 | Complete | ✅ |
| Figma layer import | 1 | Complete | ✅ |
| Object identifiers | 1 | Complete | ✅ |
| Layer visualization | 1 | Complete | ✅ |
| Smart re-sync | 1 | Complete | ✅ |
| Mobile/tablet optimization | 1 | Complete | ✅ |
| Panel system architecture | 2 | Week 1 | 📋 |
| Collapsible palettes | 2 | Week 1 | 📋 |
| Deep selection & isolation | 3 | Week 2 | 📋 |
| Object rotation & registration | 3 | Week 2 | 📋 |
| Object grouping | 3 | Week 2 | 📋 |
| Right-click context menus | 3 | Week 2 | 📋 |
| Auto-complete & type-ahead | 4 | Week 3 | 📋 |
| Character picker | 4 | Week 3 | 📋 |
| Mini dictionary panel | 4 | Week 3 | 📋 |
| Media library panel | 5 | Week 3 | 📋 |
| WebSocket DevSync | 7 | Complete | ✅ |
| Activity export | 7 | Week 4 | 📋 |
| NACA integration test | 7 | Week 4 | 📋 |

---

*Last updated: December 2, 2025*
