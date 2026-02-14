# Video Test Plans Index

This directory contains structured test plans for capturing demonstration videos for the Indigamate Studio help system.

## Overview

Each test plan follows a standardized format that can be executed by the testing agent to capture videos. The captured videos go through an admin approval workflow before being linked to help topics.

## Video Types

| Type | Duration | Purpose |
|------|----------|---------|
| **Overview** | 60-180s | Comprehensive panel walkthroughs |
| **Micro-Lesson** | 5-30s | Quick, focused feature tutorials |

## Test Plan Files

### Canvas & Navigation
- [canvas-tools.md](./canvas-tools.md) - 20 test plans
  - Overview: Canvas Panel (120s)
  - Micro: Selection Tool, Direct Selection, Hand Tool, Pan, Zoom Controls, Zoom Mode, Multi-Select, Marquee, Object Selection, Duplicate, Copy/Paste, Delete, Fit Screen, Layer Outlines, Layer Order, Transform, Preview Mode, Undo/Redo, Canvas Navigation

### Timeline & Animation
- [timeline-features.md](./timeline-features.md) - 11 test plans
  - Overview: Timeline Panel (150s)
  - Micro: Playback, Keyframes, Keyframe Edit, Easing, Multi-Selection, Delete, Playhead, Zoom, Duration, Timeline Layers

### Scenes & States
- [scenes-states.md](./scenes-states.md) - 6 test plans
  - Overview: Scenes Panel (120s)
  - Micro: Basics, Create, Switch, Default, Object States

### Triggers & Interactions
- [triggers-interactions.md](./triggers-interactions.md) - 8 test plans
  - Overview: Triggers Panel (180s)
  - Micro: Basics, Events, Selectors, Actions, GoToScene, Visibility, Audio

### Object Attributes
- [object-attributes.md](./object-attributes.md) - 10 test plans
  - Overview: Attributes Panel (120s)
  - Micro: Position, Size, Transform, Opacity, Custom ID, Classes, Data Binding, Media

### Vocabulary & Community
- [vocabulary-community.md](./vocabulary-community.md) - 10 test plans
  - Overview: Vocabulary (120s), Community Explorer (150s)
  - Micro: Add/Edit Vocabulary, Import, Browse Communities/Activities/Dictionaries/Media

### Figma & DevSync
- [figma-devsync.md](./figma-devsync.md) - 10 test plans
  - Overview: Figma Integration (120s), Keyboard Shortcuts (90s)
  - Micro: Figma Sync/Connect/Update, DevSync Connect/Push/Preview, Shortcuts Dialog, Help Panel

## Test Plan Format

Each test plan follows this structure:

```
Feature Key: {featureKey from registry}
Video Type: {overview | micro}
Video Duration Target: {seconds}

Test Scenario: {Brief description}

1. [New Context] Create browser context with video recording
2. [Browser] Navigate and perform actions
3. [Verify] Assert expected behavior
4. [Video Submit] POST to /api/video-candidates
```

## Action Types

| Prefix | Description |
|--------|-------------|
| `[New Context]` | Create new browser context with recording |
| `[Browser]` | Browser navigation and interaction |
| `[Verify]` | Assertions and verifications |
| `[API]` | Direct API calls |
| `[DB]` | Database operations |
| `[Video Submit]` | Submit video to candidates API |

## Execution Guidelines

1. **Recording Setup**: Enable video recording at context creation
2. **Pacing**: Use deliberate, slow mouse movements
3. **Pauses**: Add 0.5-1s pauses after significant actions
4. **Clean State**: Start and end with clean UI state
5. **Error Handling**: Capture any errors for debugging

## Video Submission API

```bash
POST /api/video-candidates
Content-Type: application/json

{
  "featureKey": "canvas-select-tool",
  "videoUrl": "/path/to/captured_video.mp4",
  "testDescription": "Selection tool demonstration",
  "duration": 15
}
```

## Admin Workflow

1. Videos submitted via API appear in `/admin/help` Video Candidates tab
2. Admin reviews with video preview
3. Approve links video to help topic (auto-creates if missing)
4. Reject removes with reason

## Coverage Summary

| Category | Overview Videos | Micro-Lessons | Total |
|----------|-----------------|---------------|-------|
| Canvas | 1 | 19 | 20 |
| Timeline | 1 | 10 | 11 |
| Scenes | 1 | 5 | 6 |
| Triggers | 1 | 7 | 8 |
| Attributes | 1 | 9 | 10 |
| Vocabulary | 1 | 3 | 4 |
| Community | 1 | 4 | 5 |
| Figma | 1 | 3 | 4 |
| DevSync | 0 | 3 | 3 |
| Shortcuts | 1 | 2 | 3 |
| **Total** | **9** | **65** | **74** |

*100% coverage: All 74 feature registry entries have corresponding test plans.*
