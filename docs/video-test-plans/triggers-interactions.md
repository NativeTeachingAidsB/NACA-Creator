# Triggers & Interactions Video Test Plans

These test plans are designed to capture demonstration videos for trigger features.

## Overview Video: Triggers Panel

```
Feature Key: overview-triggers
Video Type: overview
Video Duration Target: 180 seconds

Test Scenario: Complete tour of Triggers panel showing interactive behavior setup

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Locate Triggers panel in right sidebar
   - Ensure panel is expanded

4. [Browser] Explain triggers concept:
   - Triggers define interactive behaviors
   - Event + Selector + Action = Trigger

5. [Browser] Demonstrate creating a trigger:
   - Click "Add Trigger" button
   - Select event type (e.g., "click")
   - Enter target selector (e.g., "#myButton")
   - Choose action (e.g., "goToScene")
   - Configure action parameters

6. [Browser] Explain target selectors:
   - #customId for specific objects
   - .className for groups of objects
   - [tag=value] for tagged objects
   - Show examples

7. [Browser] Demonstrate different events:
   - click, mouseenter, mouseleave
   - Show how to select each

8. [Browser] Demonstrate different actions:
   - goToScene - navigate between scenes
   - setVisible - show/hide objects
   - playAudio - play sounds
   - Show configuration for each

9. [Browser] Test trigger in Preview mode:
   - Enter Preview mode
   - Perform trigger action
   - Show result

10. [Browser] Demonstrate trigger conditions:
    - Add conditional logic
    - Show when triggers should fire

11. [Verify]
    - Triggers can be created
    - Events, selectors, actions all configurable
    - Triggers work in preview

12. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Creating Triggers

```
Feature Key: triggers-basics
Video Type: micro
Video Duration Target: 20 seconds

Test Scenario: Basic trigger creation workflow

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Click "Add Trigger" in Triggers panel

4. [Browser] Configure trigger:
   - Event: click
   - Target: #Button1
   - Action: goToScene

5. [Browser] Save trigger

6. [Verify] Trigger appears in trigger list

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Trigger Events

```
Feature Key: triggers-events
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate different trigger events

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and click Add Trigger

3. [Browser] Click Event dropdown
   - Show available events: click, mouseenter, mouseleave, etc.

4. [Browser] Select different event types
   - Explain when each fires

5. [Verify] Event dropdown shows all options

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Target Selectors

```
Feature Key: triggers-selectors
Video Type: micro
Video Duration Target: 18 seconds

Test Scenario: Demonstrate CSS-like selector targeting

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open trigger editor

3. [Browser] Show selector input field

4. [Browser] Demonstrate selector types:
   - Type "#ButtonID" for specific object
   - Type ".button-class" for class
   - Type "[tag=interactive]" for tags

5. [Browser] Show selector validation/preview

6. [Verify] Selectors target correct objects

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Trigger Actions

```
Feature Key: triggers-actions
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate available trigger actions

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open trigger editor

3. [Browser] Click Action dropdown
   - Show available actions

4. [Browser] Briefly show each action type:
   - goToScene
   - setVisible
   - playAudio

5. [Verify] Action dropdown shows all options

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Go to Scene Action

```
Feature Key: triggers-goto-scene
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate goToScene action setup

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with multiple scenes

3. [Browser] Create trigger with goToScene action

4. [Browser] Select target scene from dropdown

5. [Browser] Test in Preview mode
   - Click trigger element
   - Show scene changes

6. [Verify] Scene navigation works

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Set Visibility Action

```
Feature Key: triggers-visibility
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate setVisible action setup

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Create trigger with setVisible action

4. [Browser] Configure:
   - Target selector for object to show/hide
   - Visible: true or false

5. [Browser] Test in Preview mode

6. [Verify] Object visibility toggles

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Play Audio Action

```
Feature Key: triggers-audio
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate playAudio action setup

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to /

3. [Browser] Create trigger with playAudio action

4. [Browser] Select audio file from media library

5. [Browser] Test in Preview mode
   - Click trigger
   - Audio plays

6. [Verify] Audio plays on trigger

7. [Video Submit] POST to /api/video-candidates
```
