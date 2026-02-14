# Vocabulary & Community Video Test Plans

These test plans are designed to capture demonstration videos for vocabulary management and community explorer features.

## Overview Video: Vocabulary Management

```
Feature Key: overview-vocabulary
Video Type: overview
Video Duration Target: 120 seconds

Test Scenario: Complete tour of Vocabulary panel and management

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Locate Vocabulary panel in right sidebar
   - Click "Vocabulary" tab

4. [Browser] Explain vocabulary purpose:
   - Store word/translation pairs
   - Bind to objects for display
   - Include audio and images

5. [Browser] Demonstrate adding vocabulary:
   - Click "Add Word" button
   - Enter word (e.g., "Háw'aa")
   - Enter translation (e.g., "Thank you")
   - Add optional image/audio

6. [Browser] Demonstrate vocabulary list:
   - Show list of entries
   - Search/filter functionality
   - Categories if available

7. [Browser] Demonstrate editing vocabulary:
   - Click on existing entry
   - Modify fields
   - Save changes

8. [Browser] Demonstrate importing from NACA:
   - Click Import button
   - Browse NACA dictionaries
   - Select words to import

9. [Browser] Demonstrate binding to objects:
   - Select object on canvas
   - Set dataKey to vocabulary entry

10. [Verify]
    - Vocabulary CRUD works
    - Import from NACA works
    - Binding to objects works

11. [Video Submit] POST to /api/video-candidates
```

## Overview Video: Community Explorer

```
Feature Key: overview-community
Video Type: overview
Video Duration Target: 150 seconds

Test Scenario: Complete tour of Community Explorer features

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and wait for editor load

3. [Browser] Click "Community" tab in right sidebar

4. [Browser] Explain Community Explorer:
   - Browse shared community content
   - Access activities, dictionaries, media

5. [Browser] Demonstrate Communities grid:
   - Show available communities
   - Use search to filter
   - Click on a community

6. [Browser] Navigate to Activities tab:
   - Show activity tree structure
   - Expand folders
   - Preview activity details

7. [Browser] Navigate to Dictionaries tab:
   - Show dictionary list
   - Click to browse entries
   - Play audio for words

8. [Browser] Navigate to Media tab:
   - Show media grid
   - Filter by type (images, audio, video)
   - Preview media items

9. [Browser] Demonstrate importing content:
   - Select dictionary entry
   - Click import to vocabulary
   - Show entry added

10. [Verify]
    - All tabs navigable
    - Content loads and displays
    - Import functionality works

11. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Add Vocabulary

```
Feature Key: vocabulary-add
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate adding vocabulary entry

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open Vocabulary tab

3. [Browser] Click "Add Word" button

4. [Browser] Enter word and translation

5. [Browser] Click Save

6. [Verify] New entry appears in list

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Edit Vocabulary

```
Feature Key: vocabulary-edit
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate editing vocabulary entry

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / with existing vocabulary

3. [Browser] Click on vocabulary entry

4. [Browser] Edit field (e.g., translation)

5. [Browser] Save changes

6. [Verify] Changes saved to entry

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Import from NACA

```
Feature Key: vocabulary-import
Video Type: micro
Video Duration Target: 18 seconds

Test Scenario: Demonstrate importing vocabulary from NACA

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open Community tab

3. [Browser] Navigate to Dictionaries

4. [Browser] Find word to import

5. [Browser] Click Import button

6. [Verify] Word added to vocabulary list

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Browse Communities

```
Feature Key: community-browse
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate browsing community list

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open Community tab

3. [Browser] Show communities grid

4. [Browser] Use search to filter

5. [Browser] Click on a community

6. [Verify] Community content loads

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Browse Activities

```
Feature Key: community-activities
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate browsing community activities

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open Community tab

3. [Browser] Select a community

4. [Browser] Click Activities tab

5. [Browser] Expand folders in tree view

6. [Verify] Activities displayed in tree structure

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Browse Dictionaries

```
Feature Key: community-dictionaries
Video Type: micro
Video Duration Target: 15 seconds

Test Scenario: Demonstrate browsing community dictionaries

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open Community tab

3. [Browser] Select a community

4. [Browser] Click Dictionaries tab

5. [Browser] Browse dictionary entries
   - Play audio if available

6. [Verify] Dictionary entries display correctly

7. [Video Submit] POST to /api/video-candidates
```

## Micro-Lesson: Browse Media

```
Feature Key: community-media
Video Type: micro
Video Duration Target: 12 seconds

Test Scenario: Demonstrate browsing community media

1. [New Context] Create a new browser context with video recording enabled

2. [Browser] Navigate to / and open Community tab

3. [Browser] Select a community

4. [Browser] Click Media tab

5. [Browser] Filter by type (images, audio, video)

6. [Verify] Media grid shows filtered results

7. [Video Submit] POST to /api/video-candidates
```
