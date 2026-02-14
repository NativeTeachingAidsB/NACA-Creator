
# Asset Organization

## Dropbox Community Structure

Assets are organized by community following this structure:

```
Dropbox/
└── [Community_Name]/
    ├── Audio/
    │   ├── vocabulary/
    │   ├── pronunciation/
    │   └── cultural/
    ├── Images/
    │   ├── vocabulary/
    │   ├── cultural/
    │   └── activities/
    ├── Vocabulary/
    │   ├── core_words.json
    │   ├── phrases.json
    │   └── categories/
    └── Activities/
        └── custom_activities/
```

## Local Asset Cache

The `attached_assets/` folder mirrors this structure:

```
attached_assets/
├── communities/
│   └── [Community_Name]/
│       ├── audio/
│       ├── images/
│       └── vocabulary/
├── figma_screens/
└── generated_images/
```

## Integration Notes

- Media Library Panel will browse Dropbox structure
- Assets are cached locally for offline editing
- Community selector filters available assets
- Vocabulary data syncs with NACA platform
