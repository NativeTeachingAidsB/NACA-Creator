# Figma & DevSync Video Test Plans

These test plans are designed to capture demonstration videos for Figma integration and DevSync features.

## Overview Video: Figma Integration

```
Feature Key: overview-figma
Video Type: overview
Video Duration Target: 120 seconds

Test Scenario: Complete tour of Figma integration features

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Explain Figma integration:
   - Import designs from Figma
   - Sync layers as game objects
   - Preserve structure and properties

4. [Browser] Locate Figma panel/button

5. [Browser] Demonstrate connecting Figma:
   - Enter Figma file URL
   - Authenticate if needed
   - Show connection status

6. [Browser] Demonstrate syncing:
   - Click Sync/Import button
   - Show progress indicator
   - Display imported objects

7. [Browser] Explain synced objects:
   - Show how layers become objects
   - Demonstrate preserved properties
   - Show metadata

8. [Browser] Demonstrate update workflow:
   - Make changes in Figma (conceptually)
   - Click Update/Re-sync
   - Show changes reflected

9. [Browser] Show smart re-sync:
   - Preserves customizations
   - Only updates changed items

10. [Verify]
    - Figma connection works
    - Objects import correctly
    - Updates sync properly

11. [Video Submit] POST to /api/video-candidates
```

## Overview Video: Keyboard Shortcuts

```
Feature Key: overview-keyboard
Video Type: overview
Video Duration Target: 90 seconds

Test Scenario: Complete overview of keyboard shortcuts

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Open keyboard shortcuts dialog (? or Help menu)

4. [Browser] Demonstrate Canvas shortcuts:
   - V - Selection Tool
   - A - Direct Selection
   - H - Hand Tool
   - Z - Zoom Mode
   - Spacebar - Temporary Pan

5. [Browser] Demonstrate Object shortcuts:
   - Cmd+Z / Ctrl+Z - Undo
   - Cmd+Shift+Z / Ctrl+Y - Redo
   - Cmd+C / Ctrl+C - Copy
   - Cmd+V / Ctrl+V - Paste
   - Delete/Backspace - Delete

6. [Browser] Demonstrate Timeline shortcuts:
   - Space - Play/Pause
   - K - Add Keyframe

7. [Browser] Demonstrate Selection shortcuts:
   - Shift+Click - Multi-select
   - Cmd+A / Ctrl+A - Select All

8. [Browser] Show preview mode: P

9. [Verify] Shortcuts dialog is comprehensive

10. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Figma Sync

```
Feature Key: figma-sync
Video Type: micro
Video Duration Target: 20 seconds

Test Scenario: Quick overview of Figma sync process

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Show Figma panel/integration area

4. [Browser] Demonstrate sync button
   - Show sync in progress
   - Show results

5. [Verify] Figma objects sync to canvas

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Connect Figma File

```
Feature Key: figma-connect
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate connecting a Figma file

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Open Figma connection dialog

4. [Browser] Enter Figma file URL

5. [Browser] Show connection established

6. [Verify] Figma file connected

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Update from Figma

```
Feature Key: figma-update
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate updating from Figma changes

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with connected Figma

3. [Browser] Click Update/Re-sync button

4. [Browser] Show update progress

5. [Browser] Show updated objects

6. [Verify] Changes from Figma reflected

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: DevSync Connection

```
Feature Key: devsync-connect
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate DevSync WebSocket connection

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Show DevSync status indicator

4. [Browser] Show connection established
   - Green indicator or status message

5. [Browser] Explain real-time sync benefits

6. [Verify] DevSync connection active

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Push to NACA

```
Feature Key: devsync-push
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate pushing activity to NACA

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Click Push/Export to NACA button

4. [Browser] Show push in progress

5. [Browser] Show success confirmation

6. [Verify] Activity pushed to NACA

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Preview in NACA

```
Feature Key: devsync-preview
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate previewing in NACA

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Click Preview in NACA button

4. [Browser] Show preview loading in NACA

5. [Verify] Activity previews in NACA environment

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Keyboard Shortcuts Dialog

```
Feature Key: shortcuts-dialog
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate opening keyboard shortcuts

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Press ? or click Help > Keyboard Shortcuts

4. [Browser] Show shortcuts dialog
   - Organized by category

5. [Verify] Shortcuts dialog displays

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Help Panel

```
Feature Key: help-panel
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate accessing help panel

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Click Help button in toolbar

4. [Browser] Show help panel opens
   - Contextual help content
   - Video demonstrations

5. [Browser] Browse help topics

6. [Verify] Help panel provides useful information

7. [Video Submit] POST to /api/video-candidates
```
