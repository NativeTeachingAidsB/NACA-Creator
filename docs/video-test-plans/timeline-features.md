# Timeline Features Video Test Plans

These test plans are designed to capture demonstration videos for timeline-related features.

## Overview Video: Timeline Panel

```
Feature Key: overview-timeline
Video Type: overview
Video Duration Target: 150 seconds

Test Scenario: Complete tour of the Timeline panel with playback and keyframe features

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Locate the Timeline panel at bottom of screen
   - Ensure it's expanded and visible

4. [Browser] Explain timeline structure:
   - Show playhead indicator
   - Show layer tracks for each object
   - Show time ruler

5. [Browser] Demonstrate playback controls:
   - Click Play button
   - Show animation playing
   - Click Pause button
   - Click Stop button (returns to start)

6. [Browser] Demonstrate adding keyframes:
   - Select an object on canvas
   - Move playhead to desired time
   - Press K or click Add Keyframe
   - Show keyframe diamond appears on track

7. [Browser] Demonstrate editing keyframes:
   - Click on a keyframe to select it
   - Show keyframe properties panel
   - Modify easing curve
   - Change property value

8. [Browser] Demonstrate multi-keyframe selection:
   - Shift+click to select multiple keyframes
   - Show batch operations available

9. [Browser] Demonstrate timeline zoom:
   - Use zoom controls to zoom in/out
   - Show more/fewer frames visible

10. [Verify]
    - Playback controls work
    - Keyframes can be added and edited
    - Animation plays correctly

11. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Playback Controls

```
Feature Key: timeline-playback
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate play, pause, stop controls

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Click Play button in timeline
   - Playhead moves, animation plays

4. [Browser] Click Pause button
   - Playhead stops at current position

5. [Browser] Click Stop button
   - Playhead returns to start (time 0)

6. [Verify] All playback controls work correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Adding Keyframes

```
Feature Key: timeline-keyframes
Video Type: micro
Video Duration Target: 18 seconds

Test Scenario: Demonstrate adding keyframes to timeline

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Select an object on canvas

4. [Browser] Move playhead to time 0
   - Press K to add keyframe

5. [Browser] Move playhead to 1 second
   - Change object position on canvas
   - Press K to add second keyframe

6. [Browser] Play animation
   - Show object animating between keyframes

7. [Verify] Keyframes create smooth animation

8. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Editing Keyframes

```
Feature Key: timeline-keyframe-edit
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate editing keyframe properties

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with existing keyframes

3. [Browser] Click on a keyframe in timeline
   - Keyframe becomes selected (highlighted)

4. [Browser] Open keyframe edit panel
   - Show time, value, easing options

5. [Browser] Change easing to "ease-in-out"
   - Show easing curve preview

6. [Verify] Keyframe properties update correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Keyframe Easing

```
Feature Key: timeline-easing
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate different easing options

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with keyframes

3. [Browser] Select a keyframe

4. [Browser] Open easing dropdown
   - Show options: linear, ease-in, ease-out, ease-in-out

5. [Browser] Select "ease-in-out"
   - Show curve visualization

6. [Browser] Play to see easing effect

7. [Verify] Easing changes animation feel

8. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Multi-Keyframe Selection

```
Feature Key: timeline-selection
Video Type: micro
Video Duration Target: 18 seconds

Test Scenario: Demonstrate selecting multiple keyframes

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with multiple keyframes

3. [Browser] Click first keyframe to select it

4. [Browser] Shift+click second keyframe
   - Both keyframes now selected

5. [Browser] Cmd/Ctrl+click to toggle third keyframe

6. [Browser] Show batch operations available
   - Delete, copy, move together

7. [Verify] Multiple keyframes can be selected and operated on

8. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Delete Keyframes

```
Feature Key: timeline-delete-keyframe
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate deleting keyframes

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with keyframes

3. [Browser] Click on a keyframe to select it

4. [Browser] Press Delete or Backspace
   - Keyframe is removed

5. [Verify] Keyframe deleted from timeline

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Timeline Playhead

```
Feature Key: timeline-playhead
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate moving the playhead

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Click on time ruler at different position
   - Playhead jumps to clicked time

4. [Browser] Drag playhead to scrub through time
   - Canvas updates to show state at each time

5. [Verify] Playhead controls current time display

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Timeline Zoom

```
Feature Key: timeline-zoom
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate zooming the timeline

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Use timeline zoom controls
   - Zoom in to see more detail
   - Zoom out to see longer duration

4. [Verify] Timeline zoom adjusts time scale

5. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Animation Duration

```
Feature Key: timeline-duration
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate setting animation duration

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Locate duration setting in timeline

4. [Browser] Change animation duration value
   - Show timeline scale updates

5. [Verify] Duration setting controls total animation length

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Timeline Layers

```
Feature Key: timeline-layers
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate timeline layer tracks

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Show timeline layer list on left
   - Each object has its own layer track

4. [Browser] Select different objects
   - Show corresponding layer highlighted

5. [Browser] Expand a layer to see animated properties

6. [Verify] Timeline layers correspond to canvas objects

7. [Video Submit] POST to /api/video-candidates
```
