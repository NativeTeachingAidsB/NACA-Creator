# Video Help Testing Guide

This guide explains how to create help videos for the Indigamate Studio video help system.

## Overview

The video help system provides two types of instructional content:

1. **Overview Videos** (60-180 seconds): Comprehensive panel walkthroughs
2. **Micro-Lessons** (5-30 seconds): Quick, focused tutorials for specific features

Videos are captured through automated testing and submitted for admin review before being linked to help topics.

## Video Types and Duration Guidelines

| Type | Min Duration | Max Duration | Purpose |
|------|--------------|--------------|---------|
| Overview | 60s | 180s | Complete panel/workflow tours |
| Micro-Lesson | 5s | 30s | Single feature demonstrations |

## Test Plan Template for Video Capture

When writing test plans that should generate help videos, follow this structure:

```
Feature Key: {featureKey from registry}
Video Type: {overview | micro}
Video Duration Target: {seconds}

Test Scenario: {Brief description of what the video should demonstrate}

1. [New Context] Create a new browser context with video recording enabled
2. [Browser] Navigate to the relevant page
3. [Browser] Perform the feature demonstration steps
   - Step 1: {action}
   - Step 2: {action}
   - ...
4. [Verify] Confirm the feature works as expected
5. [Video Submit] Submit captured video to /api/video-candidates with:
   - featureKey: "{featureKey}"
   - testDescription: "{Brief description of what was tested}"
   - duration: {estimated seconds}
```

## Overview Video Feature Keys

These require comprehensive demonstrations (60-180 seconds):

| Feature Key | Title | Duration Target |
|------------|-------|-----------------|
| `overview-canvas` | Canvas Panel Overview | 120s |
| `overview-timeline` | Timeline Panel Overview | 150s |
| `overview-scenes` | Scenes & States Overview | 120s |
| `overview-triggers` | Triggers & Interactions Overview | 180s |
| `overview-attributes` | Object Attributes Overview | 120s |
| `overview-vocabulary` | Vocabulary Management Overview | 120s |
| `overview-community` | Community Explorer Overview | 150s |
| `overview-figma` | Figma Integration Overview | 120s |
| `overview-keyboard` | Keyboard Shortcuts Overview | 90s |

## Micro-Lesson Feature Keys

Quick focused tutorials (5-30 seconds):

### Canvas Tools
| Feature Key | Title | Duration | Shortcut |
|------------|-------|----------|----------|
| `canvas-navigation` | Canvas Navigation | 20s | V, H, Space |
| `canvas-select-tool` | Selection Tool | 15s | V |
| `canvas-direct-select` | Direct Selection Tool | 15s | A |
| `canvas-hand-tool` | Hand Tool | 10s | H |
| `canvas-pan` | Pan Mode | 12s | Spacebar |
| `canvas-zoom` | Zoom Mode | 15s | Z |
| `canvas-zoom-controls` | Zoom Controls | 12s | Cmd+0 |
| `canvas-fit-screen` | Fit to Screen | 8s | - |
| `canvas-select` | Object Selection | 15s | Click |
| `canvas-multi-select` | Multi-Object Selection | 12s | Shift+Click |
| `canvas-marquee` | Marquee Selection | 10s | - |
| `canvas-duplicate` | Quick Duplicate | 12s | Alt+Drag |
| `canvas-layers` | Layer Order | 15s | Cmd+[ |
| `canvas-layer-outlines` | Layer Outlines | 8s | - |
| `canvas-undo` | Undo & Redo | 15s | Cmd+Z |
| `canvas-copy-paste` | Copy & Paste | 12s | Cmd+C/V |
| `canvas-delete` | Delete Objects | 8s | Delete |
| `canvas-transform` | Transform Handles | 15s | - |
| `preview-mode` | Preview Mode | 20s | P |

### Timeline Features
| Feature Key | Title | Duration | Shortcut |
|------------|-------|----------|----------|
| `timeline-playback` | Playback Controls | 15s | Space |
| `timeline-playhead` | Timeline Playhead | 10s | - |
| `timeline-keyframes` | Adding Keyframes | 18s | K |
| `timeline-keyframe-edit` | Editing Keyframes | 15s | - |
| `timeline-easing` | Keyframe Easing | 15s | - |
| `timeline-selection` | Multi-Keyframe Selection | 18s | Shift+Click |
| `timeline-delete-keyframe` | Delete Keyframes | 10s | Delete |
| `timeline-layers` | Timeline Layers | 15s | - |
| `timeline-zoom` | Timeline Zoom | 10s | - |
| `timeline-duration` | Animation Duration | 10s | - |

### Object/Attribute Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `objects-attributes` | Object Attributes | 20s |
| `objects-position` | Position Properties | 10s |
| `objects-size` | Size Properties | 10s |
| `objects-transform` | Transform Properties | 12s |
| `objects-opacity` | Opacity & Visibility | 12s |
| `objects-custom-id` | Custom ID | 10s |
| `objects-classes` | Classes & Tags | 12s |
| `objects-data-binding` | Data Binding | 15s |
| `objects-media` | Media Bindings | 15s |

### Scene Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `scenes-basics` | Working with Scenes | 18s |
| `scenes-create` | Create Scene | 12s |
| `scenes-switch` | Switch Scenes | 10s |
| `scenes-default` | Set Default Scene | 10s |
| `scenes-object-states` | Object States per Scene | 15s |

### Trigger Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `triggers-basics` | Creating Triggers | 20s |
| `triggers-events` | Trigger Events | 15s |
| `triggers-selectors` | Target Selectors | 18s |
| `triggers-actions` | Trigger Actions | 15s |
| `triggers-goto-scene` | Go to Scene Action | 12s |
| `triggers-visibility` | Set Visibility Action | 12s |
| `triggers-audio` | Play Audio Action | 12s |

### Vocabulary Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `vocabulary-add` | Add Vocabulary | 15s |
| `vocabulary-edit` | Edit Vocabulary | 12s |
| `vocabulary-import` | Import from NACA | 18s |

### Community Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `community-browse` | Browse Communities | 12s |
| `community-activities` | Browse Activities | 12s |
| `community-dictionaries` | Browse Dictionaries | 15s |
| `community-media` | Browse Media | 12s |

### Figma Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `figma-sync` | Figma Integration | 20s |
| `figma-connect` | Connect Figma File | 12s |
| `figma-update` | Update from Figma | 12s |

### DevSync Features
| Feature Key | Title | Duration |
|------------|-------|----------|
| `devsync-connect` | DevSync Connection | 15s |
| `devsync-push` | Push to NACA | 12s |
| `devsync-preview` | Preview in NACA | 12s |

### General/Shortcuts
| Feature Key | Title | Duration |
|------------|-------|----------|
| `shortcuts-dialog` | Keyboard Shortcuts | 10s |
| `help-panel` | Help Panel | 15s |

## Example Test Plan: Overview Video

```
Feature Key: overview-canvas
Video Type: overview
Video Duration Target: 120 seconds

Test Scenario: Complete tour of the Canvas panel demonstrating all tools and navigation

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to the editor at / and wait for canvas to load

3. [Browser] Show the canvas area and explain its purpose (pause 2s)

4. [Browser] Demonstrate the toolbar:
   - Click Selection Tool (V) and select an object
   - Click Direct Selection Tool (A) and select a nested object
   - Click Hand Tool (H) and pan the canvas

5. [Browser] Show zoom controls:
   - Use zoom slider to zoom in
   - Use zoom slider to zoom out
   - Click Fit to Screen button

6. [Browser] Demonstrate layer outlines toggle

7. [Browser] Show preview mode toggle (P key)

8. [Browser] Demonstrate object selection:
   - Click to select single object
   - Shift+click for multi-selection
   - Draw marquee to select multiple objects

9. [Browser] Show context menu on right-click

10. [Verify]
    - All toolbar buttons are visible and functional
    - Canvas navigation works correctly
    - Objects can be selected and manipulated

11. [Video Submit] POST to /api/video-candidates:
{
  "featureKey": "overview-canvas",
  "videoUrl": "{captured video path}",
  "testDescription": "Complete Canvas panel overview demonstrating tools, navigation, and selection",
  "duration": 120
}
```

## Example Test Plan: Micro-Lesson

```
Feature Key: canvas-duplicate
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate Alt+drag to duplicate an object

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to the editor at / and wait for canvas to load

3. [Browser] Select an object on the canvas

4. [Browser] Hold Alt key and drag the object to a new position
   - Ghost preview should appear showing where copy will be placed

5. [Browser] Release mouse to create duplicate

6. [Verify]
    - Ghost preview appeared during drag
    - Duplicate object was created at release position
    - Original object remains in place

7. [Video Submit] POST to /api/video-candidates:
{
  "featureKey": "canvas-duplicate",
  "videoUrl": "{captured video path}",
  "testDescription": "Quick duplicate demonstration using Alt+drag",
  "duration": 12
}
```

## Video Recording Guidelines

### For Overview Videos (60-180 seconds):
1. Start with a clean, zoomed-out view of the panel
2. Systematically demonstrate each major feature
3. Use deliberate, slow mouse movements
4. Pause briefly after each action (0.5-1 second)
5. Cover all test scenarios listed in the feature registry
6. End with the panel in a clean state

### For Micro-Lessons (5-30 seconds):
1. Start with the relevant tool/feature ready
2. Perform the action once with clear visibility
3. Show the result/feedback
4. Keep movements smooth and purposeful
5. No narration needed - visual demonstration only

## User Settings

Users can control video help behavior through the Settings dropdown:

| Setting | Default | Description |
|---------|---------|-------------|
| `videoHelpEnabled` | `true` | Show videos in help tooltips |
| `showHelpTooltips` | `true` | Enable help tooltips |
| `autoPlayVideos` | `true` | Auto-play videos when tooltip opens |
| `showShortcutHints` | `true` | Show keyboard shortcut hints |

Settings are stored in localStorage under `indigamate-user-settings`.

## API Reference

### Sync from Registry
```
POST /api/feature-help/sync-from-registry
```
Syncs all 74 features from `shared/feature-help-registry.ts` to the database.

### Submit Video Candidate
```
POST /api/video-candidates
Content-Type: application/json

{
  "featureKey": "timeline-playback",
  "videoUrl": "/help_videos/test_recording.mp4",
  "thumbnailUrl": "/help_videos/test_recording_thumb.jpg",
  "testDescription": "Description of what was tested",
  "duration": 30
}
```

### List Pending Candidates
```
GET /api/video-candidates/status/pending
```

### Approve Candidate
```
POST /api/video-candidates/{id}/approve
Content-Type: application/json

{
  "approvedBy": "admin"
}
```

### Reject Candidate
```
POST /api/video-candidates/{id}/reject
Content-Type: application/json

{
  "reason": "Video quality too low"
}
```

## Admin Review Workflow

1. Videos appear in the "Video Candidates" tab at `/admin/help`
2. Admins can preview, approve, or reject videos
3. Approved videos are automatically linked to their help topics
4. If a help topic doesn't exist, it's auto-created from the feature registry

## Integration Workflow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  New Feature     │────▶│  Feature Test    │────▶│  Video Captured  │
│  Implemented     │     │  with Video      │     │  & Submitted     │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                                                           ▼
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Help Topic      │◀────│  Admin Approves  │◀────│  Pending Review  │
│  Updated         │     │  Video           │     │  at /admin/help  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

## File Structure

```
shared/
└── feature-help-registry.ts    # 74 feature definitions with test scenarios

attached_assets/
├── help_videos/                # Approved help videos
│   └── thumbnails/            # Auto-extracted thumbnails
└── generated_videos/          # Video candidates

docs/
└── video-help-testing-guide.md # This document
```

## When to Capture Videos

Capture help videos when:
- A new feature is implemented and tested
- An existing feature's UI/UX changes significantly
- A bug fix changes how a feature appears or behaves
- Documentation suggests the current video is outdated
