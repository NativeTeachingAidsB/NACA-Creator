# Scenes & States Video Test Plans

These test plans are designed to capture demonstration videos for scene management features.

## Overview Video: Scenes Panel

```
Feature Key: overview-scenes
Video Type: overview
Video Duration Target: 120 seconds

Test Scenario: Complete tour of Scenes panel showing scene creation and object states

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Locate Scenes panel in right sidebar
   - Ensure panel is expanded

4. [Browser] Explain scene concept:
   - Scenes represent different states of your activity
   - Objects can have different properties per scene

5. [Browser] Demonstrate creating a scene:
   - Click "Add Scene" button
   - Enter scene name (e.g., "Correct Feedback")
   - Show scene appears in list

6. [Browser] Demonstrate switching scenes:
   - Click on different scene in list
   - Show canvas updates to show that scene's state

7. [Browser] Demonstrate setting default scene:
   - Right-click on a scene
   - Select "Set as Default"
   - Show default indicator

8. [Browser] Demonstrate object states:
   - Select an object
   - Switch to different scene
   - Modify object properties (position, visibility, opacity)
   - Show changes only apply to current scene

9. [Browser] Show scene-specific triggers:
   - Explain goToScene action in triggers

10. [Verify]
    - Scenes can be created and switched
    - Objects have per-scene states
    - Default scene is indicated

11. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Working with Scenes

```
Feature Key: scenes-basics
Video Type: micro
Video Duration Target: 18 seconds

Test Scenario: Basic scene operations overview

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Show Scenes panel in sidebar

4. [Browser] Click to switch between scenes
   - Canvas updates to show scene state

5. [Browser] Show scene list with names

6. [Verify] Scene switching works correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Create Scene

```
Feature Key: scenes-create
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate creating a new scene

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Click "Add Scene" button in Scenes panel

4. [Browser] Enter scene name in dialog
   - Type "Hover State" or similar

5. [Browser] Click Create/Save

6. [Verify] New scene appears in scene list

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Switch Scenes

```
Feature Key: scenes-switch
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate switching between scenes

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with multiple scenes

3. [Browser] Click on first scene in list
   - Canvas shows scene state

4. [Browser] Click on second scene
   - Canvas updates to show different state

5. [Verify] Canvas reflects selected scene's state

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Set Default Scene

```
Feature Key: scenes-default
Video Type: micro
Video Duration Target: 10 seconds

Test Scenario: Demonstrate setting the default scene

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with multiple scenes

3. [Browser] Right-click on a scene

4. [Browser] Select "Set as Default"
   - Star or indicator appears on scene

5. [Verify] Default scene is marked in UI

6. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Object States per Scene

```
Feature Key: scenes-object-states
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate how objects have different states in different scenes

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with scenes

3. [Browser] Select an object on canvas

4. [Browser] Note object position in Scene 1

5. [Browser] Switch to Scene 2

6. [Browser] Move the object to new position
   - This position is saved for Scene 2 only

7. [Browser] Switch back to Scene 1
   - Object is at original position

8. [Verify] Objects have independent states per scene

9. [Video Submit] POST to /api/video-candidates
```
