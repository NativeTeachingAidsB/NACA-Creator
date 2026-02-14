
# Activity Editor Roadmap

This roadmap is synchronized with the main [ROADMAP.md](../ROADMAP.md) file and reflects the current development status and future plans.

## System Context

The Activity Editor integrates with the NACA platform for language learning activities:

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

## Current Status (December 2, 2025)

### ✅ Completed Features

#### Phase 1: Core Authoring
- [x] Figma sync workflow with URL parsing
- [x] Figma layer import (depth=4, multiple node types)
- [x] Object identifiers (customId, classes, tags, zIndex)
- [x] Layer visualization with toggles
- [x] Smart re-sync with preservation
- [x] Content-aware change detection
- [x] Local image storage

#### Animation System
- [x] GSAP timeline integration
- [x] Timeline context with playback controls
- [x] Keyframe-to-GSAP conversion
- [x] Property animation (position, rotation, scale, opacity)
- [x] Easing curve support
- [x] Real-time playhead synchronization

#### NACA Integration
- [x] WebSocket DevSync server
- [x] Bidirectional state sync
- [x] Real-time preview updates
- [x] Vocabulary push from NACA
- [x] Client tracking and broadcasting
- [x] Activity export format
- [x] Polling fallback mechanism

#### Editor Features
- [x] Mobile/tablet optimization
- [x] Touch-friendly interactions
- [x] Keyboard shortcuts (Adobe Animate/Illustrator style)
- [x] History/Undo/Redo system
- [x] Scene management
- [x] Trigger system
- [x] Vocabulary panel
- [x] Media binding support

### 🔄 In Progress

#### Timeline Editor Enhancement
- [ ] Layer-based timeline UI (bottom panel)
- [ ] Visual keyframe editing
- [ ] Onion skinning preview
- [ ] Multi-object timeline view
- [ ] Animation curves editor

#### NACA API Integration
- [ ] Complete capabilities discovery
- [ ] Media library search/filter
- [ ] Dictionary browser
- [ ] Community switching

### 📋 Planned Features

## Phase 2: Editor UX Infrastructure (HIGH PRIORITY)

Foundation for all subsequent features.

### 2.1 Panel System Architecture
- [ ] Resizable left/right drawer panels
- [ ] Panel width persistence
- [ ] Expand/contract animations
- [ ] Min/max width constraints
- [ ] Double-click auto-fit

### 2.2 Collapsible Palettes
- [ ] Collapsible sections within panels
- [ ] Accordion vs independent modes
- [ ] Collapse state persistence
- [ ] Keyboard shortcuts (Tab, \)

### 2.3 Tool Organization

**Left Panel** (Structure):
- Project/Screen navigator
- Layer hierarchy tree
- Scene manager
- Object grouping controls

**Right Panel** (Properties):
- Attribute editor
- Trigger editor
- Vocabulary binding
- Data inspector

### 2.4 Workspace Presets
- [ ] Save/load layouts
- [ ] Default presets (Minimal, Balanced, Full)
- [ ] Quick-toggle between presets

## Phase 3: Object Manipulation (HIGH PRIORITY)

Core editing capabilities.

### 3.1 Deep Selection & Isolation
- [ ] Double-click to drill into groups
- [ ] Isolation mode (dim non-selected)
- [ ] Breadcrumb trail
- [ ] Escape to exit levels
- [ ] Click outside to deselect

### 3.2 Rotation & Registration Points
- [ ] Rotation handles
- [ ] Visual rotation indicator
- [ ] Pivot point display and editing
- [ ] Preset registration positions
- [ ] Numeric rotation input
- [ ] Snap to 15° increments

### 3.3 Object Grouping
- [ ] Multi-select (Shift+click, drag)
- [ ] Group/Ungroup (Cmd/Ctrl+G)
- [ ] Nested groups
- [ ] Group bounding box
- [ ] Group transforms

### 3.4 Right-Click Menus
- [ ] Object context menu
- [ ] Canvas context menu
- [ ] Layer tree context menu

### 3.5 Multi-Select Operations
- [ ] Bulk attribute editing
- [ ] Align tools
- [ ] Distribute spacing
- [ ] Match size

## Phase 4: Language Input Features (MEDIUM PRIORITY)

Enhanced text editing for language content.

### 4.1 Auto-Complete & Type-Ahead
- [ ] Vocabulary suggestions
- [ ] Recent entries history
- [ ] Fuzzy matching
- [ ] Category filtering
- [ ] Keyboard navigation

### 4.2 Character Picker
- [ ] Special character palette
- [ ] Accent marks and diacritics
- [ ] IPA characters
- [ ] Recently used section
- [ ] Searchable browser
- [ ] Keyboard shortcut (Ctrl+Shift+C)

### 4.3 Mini Dictionary Panel
- [ ] Inline dictionary lookup
- [ ] Word definitions
- [ ] Part of speech
- [ ] Example sentences
- [ ] Audio pronunciation
- [ ] Quick add to vocabulary

### 4.4 Community Switching Filter
- [ ] Language community selector
- [ ] Filter by community/language
- [ ] Community-specific characters
- [ ] Shared vs personal vocabulary

## Phase 5: NACA Media Integration (MEDIUM PRIORITY)

Host platform asset integration.

### 5.1 Media Library Panel
- [ ] Browse NACA assets
- [ ] Grid/list view toggle
- [ ] Thumbnail previews
- [ ] Audio waveforms
- [ ] Video thumbnails

### 5.2 Search & Filtering
- [ ] Full-text search
- [ ] Filter by type/tags/date
- [ ] Sort options
- [ ] Pagination

### 5.3 Asset Integration
- [ ] Drag-drop to canvas
- [ ] Quick-assign to vocabulary
- [ ] URL resolution for export
- [ ] Local caching

### 5.4 Upload Integration
- [ ] Upload to NACA from Editor
- [ ] Bulk upload
- [ ] Progress indicator
- [ ] Auto-categorization

## Phase 6: Programmatic Control

### 6.1 Enhanced Triggers
- [ ] Target by customId/class
- [ ] Multi-target triggers
- [ ] Conditional expressions
- [ ] Audio triggers

### 6.2 Data Binding
- [ ] Bind vocabulary to objects
- [ ] Dynamic text replacement
- [ ] Image swap from vocabulary
- [ ] Audio playback from vocabulary

### 6.3 Animation System Enhancement
- [ ] Visual timeline editor
- [ ] Animation preview
- [ ] Parent-child animation triggers
- [ ] Timeline sequencing

### 6.4 Scene Flow
- [ ] Visual scene graph
- [ ] Branching logic
- [ ] Scene groups
- [ ] Timer-based progression

## Phase 7: NACA Platform Integration (PARTIAL)

### 7.1 WebSocket DevSync ✅
- [x] WebSocket server
- [x] Bidirectional sync
- [x] Real-time preview
- [x] Vocabulary push
- [x] Client tracking

### 7.2 Activity Export ✅
- [x] Complete export format
- [x] Media URL resolution
- [x] Vocabulary binding

### 7.3 Content Binding
- [ ] Receive vocabulary sets
- [ ] Preview with sample data
- [ ] Validate bindings

### 7.4 Import/Export
- [ ] Import activity JSON
- [ ] Activity versioning
- [ ] Activity duplication

## Phase 8: Production Features (FUTURE)

### 8.1 Runtime Player
- [ ] Standalone player component
- [ ] Embed API
- [ ] Touch/gesture support
- [ ] Accessibility features

### 8.2 Activity Templates
- [ ] Flashcard template
- [ ] Multiple choice template
- [ ] Drag-and-drop template
- [ ] Matching game template

### 8.3 Analytics Integration
- [ ] Track interactions
- [ ] Time-on-task metrics
- [ ] Correctness tracking
- [ ] Export analytics

### 8.4 Collaboration
- [ ] Multi-user editing
- [ ] Comments
- [ ] Review workflow
- [ ] Version history

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

## Build Priority

1. **Phase 2 (Editor UX)** - Foundation for all features
2. **Phases 3, 4, 5** - Parallel development after Phase 2
3. **Phase 6** - Depends on object manipulation
4. **Phase 7** - Integration of all features
5. **Phase 8** - Production polish

## Milestones

| Milestone | Phase | Status |
|-----------|-------|--------|
| Figma import | 1 | ✅ Complete |
| Timeline engine | 1 | ✅ Complete |
| DevSync | 7 | ✅ Complete |
| Panel system | 2 | 📋 Week 1 |
| Object manipulation | 3 | 📋 Week 2 |
| Language input | 4 | 📋 Week 3 |
| Media library | 5 | 📋 Week 3 |
| Activity export | 7 | 📋 Week 4 |

---

**Last Updated**: December 2, 2025

**Next Review**: Weekly development meetings

For detailed prompt history, see [PROMPT_HISTORY.md](../attached_assets/PROMPT_HISTORY.md).
