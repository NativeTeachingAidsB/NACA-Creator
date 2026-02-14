# Canvas Tools Video Test Plans

These test plans are designed to capture demonstration videos for canvas-related features.

## Overview Video: Canvas Panel

```
Feature Key: overview-canvas
Video Type: overview
Video Duration Target: 120 seconds

Test Scenario: Complete tour of the Canvas panel demonstrating all tools and navigation

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to the editor at /
   - Wait for canvas to fully load
   - Ensure at least one screen with objects is visible

3. [Browser] Show the canvas toolbar (pause 2s for visibility)

4. [Browser] Demonstrate Selection Tool:
   - Click Selection Tool button (or press V)
   - Click on an object to select it
   - Show selection handles around the object
   - Drag object to reposition

5. [Browser] Demonstrate Direct Selection Tool:
   - Click Direct Selection Tool button (or press A)
   - Click on overlapping objects area
   - Show how it selects the smallest/innermost object

6. [Browser] Demonstrate Hand Tool:
   - Click Hand Tool button (or press H)
   - Drag canvas to pan around
   - Show smooth canvas movement

7. [Browser] Demonstrate Zoom:
   - Use zoom slider to zoom in
   - Use zoom slider to zoom out
   - Click Fit to Screen button
   - Show Cmd+0 / Ctrl+0 shortcut

8. [Browser] Demonstrate Multi-Selection:
   - With Selection Tool active
   - Shift+click multiple objects
   - Show all objects highlighted
   - Draw marquee selection around objects

9. [Browser] Demonstrate Preview Mode:
   - Click Preview button (or press P)
   - Show interactions working
   - Exit preview mode

10. [Verify]
    - All toolbar buttons functional
    - Canvas navigation smooth
    - Object selection working

11. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Selection Tool

```
Feature Key: canvas-select-tool
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Quick demonstration of the Selection Tool

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click Selection Tool in toolbar (highlight keyboard shortcut V)

4. [Browser] Click on an object to select it
   - Show blue selection handles appear

5. [Browser] Drag selected object to new position

6. [Verify] Object moves smoothly with selection handles

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Direct Selection Tool

```
Feature Key: canvas-direct-select
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate Direct Selection for nested objects

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click Direct Selection Tool (or press A)

4. [Browser] Click in area with overlapping objects
   - Show it selects the innermost/smallest object

5. [Browser] Click again to cycle through overlapping objects

6. [Verify] Direct selection targets nested elements correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Hand Tool / Pan

```
Feature Key: canvas-hand-tool
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate canvas panning with Hand Tool

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click Hand Tool button (or press H)
   - Cursor should change to hand icon

4. [Browser] Click and drag on canvas
   - Show canvas panning smoothly

5. [Verify] Canvas pans without selecting objects

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Spacebar Pan

```
Feature Key: canvas-pan
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate spacebar shortcut for temporary pan mode

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] With Selection Tool active, hold Spacebar
   - Cursor changes to hand icon temporarily

4. [Browser] While holding Spacebar, drag to pan

5. [Browser] Release Spacebar
   - Returns to Selection Tool

6. [Verify] Pan works while spacebar held, returns to previous tool on release

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Zoom Controls

```
Feature Key: canvas-zoom-controls
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate zoom controls in toolbar

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click zoom in button (+) or drag slider right
   - Canvas zooms in

4. [Browser] Click zoom out button (-) or drag slider left
   - Canvas zooms out

5. [Browser] Click Fit to Screen button
   - Canvas fits all content in view

6. [Verify] Zoom controls work smoothly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Multi-Selection

```
Feature Key: canvas-multi-select
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate selecting multiple objects

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click first object to select it

4. [Browser] Hold Shift and click second object
   - Both objects now selected

5. [Browser] Hold Shift and click third object
   - All three objects selected

6. [Verify] Multiple objects have selection handles

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Marquee Selection

```
Feature Key: canvas-marquee
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate drag-to-select marquee

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click and drag on empty canvas area
   - Blue selection rectangle appears

4. [Browser] Drag rectangle over multiple objects
   - Release to select all objects within bounds

5. [Verify] All objects within marquee are selected

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Quick Duplicate

```
Feature Key: canvas-duplicate
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate Alt+drag to duplicate

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Select an object

4. [Browser] Hold Alt/Option and drag object
   - Ghost preview shows duplicate position

5. [Browser] Release to create duplicate

6. [Verify] Duplicate object created at new position

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Preview Mode

```
Feature Key: preview-mode
Video Type: micro
Video Duration Target: 20 seconds

Test Scenario: Demonstrate preview mode for testing interactions

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click Preview button in toolbar (or press P)
   - UI changes to indicate preview mode

4. [Browser] Click on interactive objects
   - Show triggers activating
   - Show scene changes if configured

5. [Browser] Click Exit Preview or press Escape

6. [Verify] Preview mode shows interactions working

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Undo & Redo

```
Feature Key: canvas-undo
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate undo/redo functionality

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Select and move an object

4. [Browser] Press Cmd+Z (or Ctrl+Z)
   - Object returns to original position

5. [Browser] Press Cmd+Shift+Z (or Ctrl+Y)
   - Object moves back to new position

6. [Verify] Undo/redo correctly reverses and reapplies changes

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Object Selection

```
Feature Key: canvas-select
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate basic object selection

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click on an object
   - Selection handles appear around object

4. [Browser] Click on empty area
   - Selection is cleared

5. [Browser] Click on another object
   - New object becomes selected

6. [Verify] Objects can be selected and deselected

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Copy & Paste

```
Feature Key: canvas-copy-paste
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate copy and paste

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Select an object

4. [Browser] Press Cmd+C (or Ctrl+C) to copy

5. [Browser] Press Cmd+V (or Ctrl+V) to paste
   - Duplicate object appears offset from original

6. [Verify] Object copied and pasted successfully

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Delete Objects

```
Feature Key: canvas-delete
Video Type: micro
Video Duration Target: 8 seconds

Test Scenario: Demonstrate deleting objects

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Select an object

4. [Browser] Press Delete or Backspace
   - Object is removed from canvas

5. [Verify] Object deleted successfully

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Fit to Screen

```
Feature Key: canvas-fit-screen
Video Type: micro
Video Duration Target: 8 seconds

Test Scenario: Demonstrate fit to screen

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Zoom to a small area of canvas

4. [Browser] Click Fit to Screen button
   - Canvas zooms to show all content

5. [Verify] All content visible and centered

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Layer Outlines

```
Feature Key: canvas-layer-outlines
Video Type: micro
Video Duration Target: 8 seconds

Test Scenario: Demonstrate layer outlines toggle

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Click Layer Outlines toggle button
   - Objects show outline borders

4. [Browser] Click toggle again
   - Outlines hidden

5. [Verify] Layer outlines toggle on/off

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Layer Order

```
Feature Key: canvas-layers
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate layer ordering controls

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Select an object that's behind another

4. [Browser] Use Cmd+] to bring forward
   - Object moves up in layer stack

5. [Browser] Use Cmd+[ to send backward
   - Object moves down in layer stack

6. [Verify] Layer order changes correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Transform Handles

```
Feature Key: canvas-transform
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate transform handles for resize/rotate

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Select an object

4. [Browser] Drag corner handle to resize
   - Object scales proportionally

5. [Browser] Drag edge handle to resize width/height

6. [Verify] Transform handles work correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Zoom Mode

```
Feature Key: canvas-zoom
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate zoom mode with Z key

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Hold Z key
   - Cursor changes to zoom cursor

4. [Browser] Drag up to zoom in, drag down to zoom out

5. [Browser] Release Z key
   - Return to previous tool

6. [Verify] Zoom mode works with Z key

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Canvas Navigation

```
Feature Key: canvas-navigation
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate canvas navigation basics

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for canvas load

3. [Browser] Show toolbar with navigation tools
   - Selection Tool (V), Hand Tool (H), Zoom

4. [Browser] Use scroll wheel to zoom in/out

5. [Browser] Hold Spacebar and drag to pan
   - Canvas moves with cursor

6. [Verify] Basic canvas navigation works

7. [Video Submit] POST to /api/video-candidates
```
