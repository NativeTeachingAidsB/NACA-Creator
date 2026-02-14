# Object Attributes Video Test Plans

These test plans are designed to capture demonstration videos for object attribute features.

## Overview Video: Attributes Panel

```
Feature Key: overview-attributes
Video Type: overview
Video Duration Target: 120 seconds

Test Scenario: Complete tour of Object Attributes panel

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Select an object on canvas

4. [Browser] Locate Attributes panel in right sidebar
   - Panel should show object properties

5. [Browser] Explain attributes panel sections:
   - Transform (position, size, rotation)
   - Appearance (opacity, visibility)
   - Identity (customId, classes, tags)
   - Data (dataKey, media bindings)

6. [Browser] Demonstrate position properties:
   - Show X, Y inputs
   - Change values and see object move

7. [Browser] Demonstrate size properties:
   - Show Width, Height inputs
   - Change values and see object resize

8. [Browser] Demonstrate transform properties:
   - Show Rotation, Scale X, Scale Y
   - Modify and see changes

9. [Browser] Demonstrate opacity:
   - Adjust opacity slider
   - Show object becoming transparent

10. [Browser] Demonstrate visibility toggle:
    - Toggle visibility checkbox
    - Show object appearing/disappearing

11. [Browser] Demonstrate custom ID:
    - Enter custom ID for targeting in triggers
    - Explain #customId selector usage

12. [Browser] Demonstrate classes and tags:
    - Add class names
    - Add tags
    - Explain selector usage

13. [Verify]
    - All property inputs work
    - Changes reflect on canvas

14. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Object Attributes Overview

```
Feature Key: objects-attributes
Video Type: micro
Video Duration Target: 20 seconds

Test Scenario: Quick overview of attributes panel

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Select an object

4. [Browser] Show attributes panel with all sections

5. [Browser] Quickly modify a few properties
   - Change position
   - Adjust opacity

6. [Verify] Changes apply to object

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Position Properties

```
Feature Key: objects-position
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate X/Y position editing

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Locate X, Y inputs in attributes panel

4. [Browser] Change X value
   - Object moves horizontally

5. [Browser] Change Y value
   - Object moves vertically

6. [Verify] Position inputs control object location

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Size Properties

```
Feature Key: objects-size
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate width/height editing

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Locate Width, Height inputs

4. [Browser] Change Width value
   - Object resizes horizontally

5. [Browser] Change Height value
   - Object resizes vertically

6. [Verify] Size inputs control object dimensions

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Transform Properties

```
Feature Key: objects-transform
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate rotation and scale

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Change Rotation value
   - Object rotates

4. [Browser] Change Scale X or Scale Y
   - Object stretches/compresses

5. [Verify] Transform properties modify object

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Opacity & Visibility

```
Feature Key: objects-opacity
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate opacity and visibility controls

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Adjust opacity slider
   - Object becomes semi-transparent

4. [Browser] Toggle visibility checkbox
   - Object disappears/appears

5. [Verify] Opacity and visibility controls work

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Custom ID

```
Feature Key: objects-custom-id
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate setting custom ID for targeting

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Find Custom ID input field

4. [Browser] Enter custom ID (e.g., "playButton")

5. [Browser] Explain use in triggers: #playButton

6. [Verify] Custom ID is saved

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Classes & Tags

```
Feature Key: objects-classes
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate adding classes and tags

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Find Classes input
   - Add class "interactive"

4. [Browser] Find Tags input
   - Add tag "button"

5. [Browser] Explain selectors: .interactive, [tag=button]

6. [Verify] Classes and tags are saved

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Data Binding

```
Feature Key: objects-data-binding
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate binding object to vocabulary data

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Find Data Key input

4. [Browser] Enter data key from vocabulary

5. [Browser] Show object can display vocabulary content

6. [Verify] Data binding connects object to vocabulary

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Media Bindings

```
Feature Key: objects-media
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate binding media to object

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and select object

3. [Browser] Find Media URL or Audio URL input

4. [Browser] Click browse button
   - Select media from library

5. [Browser] Show media bound to object

6. [Verify] Media binding works

7. [Video Submit] POST to /api/video-candidates
```
