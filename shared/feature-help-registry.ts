/**
 * Feature Help Registry
 * 
 * Comprehensive registry of all features with video documentation requirements.
 * 
 * Video Types:
 * - OVERVIEW: 1-3 minute videos covering major panels/workflows
 * - MICRO: 5-30 second focused tutorials for specific features
 * 
 * When adding new features:
 * 1. Add an entry to this registry
 * 2. Create or update the corresponding help topic in the database
 * 3. Run tests with video capture enabled
 * 4. Videos are automatically submitted as candidates for admin review
 */

export type VideoType = 'overview' | 'micro';
export type FeatureCategory = 
  | 'canvas' 
  | 'timeline' 
  | 'objects' 
  | 'triggers' 
  | 'scenes' 
  | 'vocabulary' 
  | 'figma' 
  | 'shortcuts'
  | 'community'
  | 'media'
  | 'devsync'
  | 'general';

export interface FeatureHelpConfig {
  featureKey: string;
  title: string;
  description: string;
  category: FeatureCategory;
  videoType: VideoType;
  shortcutKey?: string;
  testScenarios: string[];
  videoDurationTarget: number; // Target duration in seconds
  relatedFeatures?: string[];
  order?: number;
}

/**
 * OVERVIEW VIDEOS (1-3 minutes)
 * Comprehensive walkthroughs of major panels and workflows
 */
export const overviewVideos: FeatureHelpConfig[] = [
  // Panel Overviews
  {
    featureKey: 'overview-canvas',
    title: 'Canvas Panel Overview',
    description: 'Complete tour of the Canvas panel - the main editing area where you view and manipulate game objects. Learn about selection tools, navigation, zoom controls, and the toolbar.',
    category: 'canvas',
    videoType: 'overview',
    testScenarios: [
      'Show the canvas area and explain its purpose',
      'Demonstrate the toolbar: Selection (V), Direct Selection (A), Hand (H) tools',
      'Show zoom controls and fit-to-screen',
      'Demonstrate layer outlines toggle',
      'Show preview mode toggle',
      'Demonstrate object selection, multi-selection, and marquee selection',
      'Show context menu on right-click',
    ],
    videoDurationTarget: 120, // 2 minutes
    order: 1,
  },
  {
    featureKey: 'overview-timeline',
    title: 'Timeline Panel Overview',
    description: 'Master the Timeline panel for creating animations. Learn about layers, keyframes, playback controls, and how to animate object properties over time.',
    category: 'timeline',
    videoType: 'overview',
    testScenarios: [
      'Explain the timeline structure: layers on left, keyframes on right',
      'Demonstrate playback controls (play, pause, stop)',
      'Show how to add and edit keyframes',
      'Demonstrate different property types that can be animated',
      'Show easing options for smooth animations',
      'Demonstrate multi-keyframe selection and operations',
      'Show timeline zoom and duration adjustment',
    ],
    videoDurationTarget: 150, // 2.5 minutes
    order: 2,
  },
  {
    featureKey: 'overview-scenes',
    title: 'Scenes & States Overview',
    description: 'Understand how scenes work to create different game states. Learn to create scenes, set default scenes, and configure object states per scene.',
    category: 'scenes',
    videoType: 'overview',
    testScenarios: [
      'Explain what scenes are and why they\'re useful',
      'Create a new scene',
      'Switch between scenes',
      'Set a default scene',
      'Show how objects can have different states in different scenes',
      'Demonstrate scene-specific object properties',
    ],
    videoDurationTarget: 120, // 2 minutes
    order: 3,
  },
  {
    featureKey: 'overview-triggers',
    title: 'Triggers & Interactions Overview',
    description: 'Build interactive experiences with triggers. Learn about event types, target selectors, actions, and how to create engaging user interactions.',
    category: 'triggers',
    videoType: 'overview',
    testScenarios: [
      'Explain what triggers are and their purpose',
      'Show trigger event types: click, scene start, timer, correct/incorrect',
      'Demonstrate target selectors for objects',
      'Show action types: go to scene, set visibility, play audio, etc.',
      'Create a complete interaction from scratch',
      'Test the interaction in preview mode',
    ],
    videoDurationTarget: 180, // 3 minutes
    order: 4,
  },
  {
    featureKey: 'overview-attributes',
    title: 'Object Attributes Overview',
    description: 'Deep dive into the Attributes panel. Learn about transform properties, custom identifiers, data binding, and media attachments for game objects.',
    category: 'objects',
    videoType: 'overview',
    testScenarios: [
      'Show the attributes panel layout',
      'Demonstrate transform properties: position, size, rotation, scale',
      'Show opacity and visibility controls',
      'Explain custom ID, classes, and tags for targeting',
      'Demonstrate data binding with vocabulary',
      'Show media URL and audio URL bindings',
    ],
    videoDurationTarget: 120, // 2 minutes
    order: 5,
  },
  {
    featureKey: 'overview-vocabulary',
    title: 'Vocabulary Management Overview',
    description: 'Manage language learning content with the Vocabulary panel. Add words, translations, images, and audio for interactive language games.',
    category: 'vocabulary',
    videoType: 'overview',
    testScenarios: [
      'Explain the vocabulary system purpose',
      'Add a new vocabulary item with word and translation',
      'Add image and audio URLs to vocabulary',
      'Demonstrate categories for organization',
      'Show how to bind vocabulary to game objects',
      'Demonstrate importing from NACA dictionaries',
    ],
    videoDurationTarget: 120, // 2 minutes
    order: 6,
  },
  {
    featureKey: 'overview-community',
    title: 'Community Explorer Overview',
    description: 'Browse shared content from NACA communities. Explore activities, dictionaries, and media files that can be imported into your projects.',
    category: 'community',
    videoType: 'overview',
    testScenarios: [
      'Explain the community explorer purpose',
      'Browse available communities',
      'Navigate the Activities tab and folder structure',
      'Browse dictionaries and vocabulary entries',
      'Explore the media library with filters',
      'Import content into your project',
    ],
    videoDurationTarget: 150, // 2.5 minutes
    order: 7,
  },
  {
    featureKey: 'overview-figma',
    title: 'Figma Integration Overview',
    description: 'Connect Figma to import your designs directly. Learn to sync frames, update layers, and maintain the connection with your design files.',
    category: 'figma',
    videoType: 'overview',
    testScenarios: [
      'Explain the Figma integration benefits',
      'Connect a Figma file using the file key',
      'Select and import frames as screens',
      'Show how layers are preserved as game objects',
      'Demonstrate updating/re-syncing from Figma',
      'Show branch support for design versions',
    ],
    videoDurationTarget: 120, // 2 minutes
    order: 8,
  },
  {
    featureKey: 'overview-keyboard',
    title: 'Keyboard Shortcuts Overview',
    description: 'Boost your productivity with keyboard shortcuts. Learn all the essential shortcuts for tools, editing, navigation, and workflow optimization.',
    category: 'shortcuts',
    videoType: 'overview',
    testScenarios: [
      'Open the keyboard shortcuts dialog (?)',
      'Demonstrate tool shortcuts: V, A, H, P',
      'Show navigation shortcuts: Space, Z',
      'Demonstrate editing shortcuts: Cmd+Z, Cmd+C, Cmd+V',
      'Show layer ordering shortcuts',
      'Demonstrate Delete/Backspace for objects',
    ],
    videoDurationTarget: 90, // 1.5 minutes
    order: 9,
  },
];

/**
 * MICRO-LESSONS (5-30 seconds)
 * Quick, focused tutorials for specific features and buttons
 */
export const microLessons: FeatureHelpConfig[] = [
  // Canvas Tools
  {
    featureKey: 'canvas-navigation',
    title: 'Canvas Navigation',
    description: 'Use the Select tool (V) to select and move objects, or the Hand tool (H) to pan the canvas. Hold Spacebar to temporarily switch to pan mode. Use Cmd/Ctrl+scroll or pinch to zoom.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'V, H, Space',
    testScenarios: [
      'Switch between Select and Hand tools',
      'Pan the canvas',
      'Zoom in and out',
    ],
    videoDurationTarget: 20,
    order: 1,
  },
  {
    featureKey: 'canvas-select-tool',
    title: 'Selection Tool',
    description: 'The Selection tool (V) selects the topmost object at the click point based on z-index. Click objects to select, Shift+click to add to selection.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'V',
    testScenarios: [
      'Select an object',
      'Shift+click to multi-select',
    ],
    videoDurationTarget: 15,
    order: 2,
  },
  {
    featureKey: 'canvas-direct-select',
    title: 'Direct Selection Tool',
    description: 'The Direct Selection tool (A) drills into overlapping objects, selecting the smallest (most nested) element at the click point.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'A',
    testScenarios: [
      'Select nested objects with Direct Selection',
    ],
    videoDurationTarget: 15,
    order: 3,
  },
  {
    featureKey: 'canvas-hand-tool',
    title: 'Hand Tool',
    description: 'The Hand tool (H) lets you pan the canvas by clicking and dragging. Switch to it permanently or hold Spacebar for temporary access.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'H',
    testScenarios: [
      'Pan using the hand tool',
    ],
    videoDurationTarget: 10,
    order: 4,
  },
  {
    featureKey: 'canvas-pan',
    title: 'Pan Mode',
    description: 'Hold the Spacebar to temporarily enter pan mode. Drag to move the canvas view. Release Spacebar to return to your previous tool.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Spacebar (hold)',
    testScenarios: [
      'Hold spacebar and drag to pan',
      'Release to return to previous tool',
    ],
    videoDurationTarget: 12,
    order: 5,
  },
  {
    featureKey: 'canvas-zoom',
    title: 'Zoom Mode',
    description: 'Hold Z key and drag up/down to zoom in/out. Click a point while holding Z to zoom to that location. Use the zoom slider or +/- buttons for precise control.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Z (hold)',
    testScenarios: [
      'Hold Z and drag to zoom',
      'Click to zoom to point',
    ],
    videoDurationTarget: 15,
    order: 6,
  },
  {
    featureKey: 'canvas-zoom-controls',
    title: 'Zoom Controls',
    description: 'Use the zoom slider or +/- buttons in the toolbar. Ctrl/Cmd+scroll wheel also zooms. Press Ctrl/Cmd+0 to reset to 100%.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Cmd+0, Cmd++, Cmd+-',
    testScenarios: [
      'Use zoom slider',
      'Reset zoom to 100%',
    ],
    videoDurationTarget: 12,
    order: 7,
  },
  {
    featureKey: 'canvas-fit-screen',
    title: 'Fit to Screen',
    description: 'Click the Fit button to automatically zoom and center the canvas to show all content. Great for getting an overview of your work.',
    category: 'canvas',
    videoType: 'micro',
    testScenarios: [
      'Click fit to screen button',
    ],
    videoDurationTarget: 8,
    order: 8,
  },
  {
    featureKey: 'canvas-select',
    title: 'Object Selection',
    description: 'Click on objects to select them. Double-click to isolate an object for focused editing. Press Escape to deselect.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Click, Double-click, Esc',
    testScenarios: [
      'Click to select object',
      'Double-click to isolate',
      'Escape to deselect',
    ],
    videoDurationTarget: 15,
    order: 9,
  },
  {
    featureKey: 'canvas-multi-select',
    title: 'Multi-Object Selection',
    description: 'Hold Shift and click to add or remove objects from selection. Use Cmd/Ctrl+A to select all objects on the current screen.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Shift+Click, Cmd+A',
    testScenarios: [
      'Shift+click to add to selection',
      'Cmd+A to select all',
    ],
    videoDurationTarget: 12,
    order: 10,
  },
  {
    featureKey: 'canvas-marquee',
    title: 'Marquee Selection',
    description: 'Click and drag on empty canvas space to draw a selection rectangle. All objects intersecting the rectangle will be selected.',
    category: 'canvas',
    videoType: 'micro',
    testScenarios: [
      'Draw a rectangle to select multiple objects',
    ],
    videoDurationTarget: 10,
    order: 11,
  },
  {
    featureKey: 'canvas-duplicate',
    title: 'Quick Duplicate',
    description: 'Hold Alt while dragging an object to create a duplicate. A ghost preview shows where the copy will be placed.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Alt+Drag',
    testScenarios: [
      'Alt+drag to duplicate object',
      'Verify ghost preview appears',
    ],
    videoDurationTarget: 12,
    order: 12,
  },
  {
    featureKey: 'canvas-layers',
    title: 'Layer Order',
    description: 'Use Cmd/Ctrl+[ and Cmd/Ctrl+] to move objects backward and forward in the layer stack. Add Shift for instant move to back/front.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Cmd+[, Cmd+]',
    testScenarios: [
      'Reorder layers with keyboard shortcuts',
      'Send to back and bring to front',
    ],
    videoDurationTarget: 15,
    order: 13,
  },
  {
    featureKey: 'canvas-layer-outlines',
    title: 'Layer Outlines',
    description: 'Toggle layer outlines to see bounding boxes around all objects. Helpful for selecting objects that are hard to see or overlapping.',
    category: 'canvas',
    videoType: 'micro',
    testScenarios: [
      'Toggle layer outlines on/off',
    ],
    videoDurationTarget: 8,
    order: 14,
  },
  {
    featureKey: 'canvas-undo',
    title: 'Undo & Redo',
    description: 'Undo recent changes with Cmd/Ctrl+Z. Redo with Cmd/Ctrl+Shift+Z. The history tracks object movements, property changes, and reordering.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Cmd+Z, Cmd+Shift+Z',
    testScenarios: [
      'Make changes and undo',
      'Redo undone changes',
    ],
    videoDurationTarget: 15,
    order: 15,
  },
  {
    featureKey: 'canvas-copy-paste',
    title: 'Copy & Paste',
    description: 'Copy selected objects with Cmd/Ctrl+C and paste with Cmd/Ctrl+V. Pasted objects appear slightly offset from originals.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Cmd+C, Cmd+V',
    testScenarios: [
      'Copy an object',
      'Paste the object',
    ],
    videoDurationTarget: 12,
    order: 16,
  },
  {
    featureKey: 'canvas-delete',
    title: 'Delete Objects',
    description: 'Press Delete or Backspace to remove selected objects. This action can be undone with Cmd/Ctrl+Z.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'Delete, Backspace',
    testScenarios: [
      'Delete selected object',
    ],
    videoDurationTarget: 8,
    order: 17,
  },
  {
    featureKey: 'canvas-transform',
    title: 'Transform Handles',
    description: 'Selected objects show transform handles. Drag corners to resize, edges to stretch, and the rotation handle to rotate.',
    category: 'canvas',
    videoType: 'micro',
    testScenarios: [
      'Resize using corner handles',
      'Rotate using rotation handle',
    ],
    videoDurationTarget: 15,
    order: 18,
  },
  {
    featureKey: 'preview-mode',
    title: 'Preview Mode',
    description: 'Toggle Preview mode to test your interactive design. In preview mode, triggers become active and you can test the user experience as it will appear in the final game.',
    category: 'canvas',
    videoType: 'micro',
    shortcutKey: 'P',
    testScenarios: [
      'Enter preview mode',
      'Test trigger interactions',
      'Exit preview mode',
    ],
    videoDurationTarget: 20,
    order: 19,
  },

  // Timeline Features
  {
    featureKey: 'timeline-playback',
    title: 'Timeline Playback Controls',
    description: 'Use the play, pause, and stop buttons to control animation playback. The playhead shows the current time position in your animation.',
    category: 'timeline',
    videoType: 'micro',
    shortcutKey: 'Space',
    testScenarios: [
      'Click play to start animation',
      'Click pause to stop',
      'Click stop to reset to beginning',
    ],
    videoDurationTarget: 15,
    order: 1,
  },
  {
    featureKey: 'timeline-playhead',
    title: 'Timeline Playhead',
    description: 'Drag the playhead to scrub through your animation. Click anywhere on the timeline ruler to jump to that position.',
    category: 'timeline',
    videoType: 'micro',
    testScenarios: [
      'Drag playhead to seek',
      'Click timeline to jump',
    ],
    videoDurationTarget: 10,
    order: 2,
  },
  {
    featureKey: 'timeline-keyframes',
    title: 'Adding Keyframes',
    description: 'Click on the timeline to add keyframes. Keyframes define property values at specific times. The animation will smoothly interpolate between keyframes.',
    category: 'timeline',
    videoType: 'micro',
    shortcutKey: 'K',
    testScenarios: [
      'Add keyframe at current time',
      'Move to different time and add another',
    ],
    videoDurationTarget: 18,
    order: 3,
  },
  {
    featureKey: 'timeline-keyframe-edit',
    title: 'Editing Keyframes',
    description: 'Click a keyframe to select it and edit its properties in the inline editor. Change the value, time position, or easing curve.',
    category: 'timeline',
    videoType: 'micro',
    testScenarios: [
      'Select a keyframe',
      'Edit keyframe properties',
    ],
    videoDurationTarget: 15,
    order: 4,
  },
  {
    featureKey: 'timeline-easing',
    title: 'Keyframe Easing',
    description: 'Choose easing curves to control animation timing. Options include Linear, Ease In, Ease Out, Elastic, Bounce, and more.',
    category: 'timeline',
    videoType: 'micro',
    testScenarios: [
      'Select an easing preset',
      'Preview the easing effect',
    ],
    videoDurationTarget: 15,
    order: 5,
  },
  {
    featureKey: 'timeline-selection',
    title: 'Multi-Keyframe Selection',
    description: 'Select multiple keyframes using Shift+click for range selection or Cmd/Ctrl+click to toggle individual keyframes. Use Copy (Cmd/Ctrl+C) and Paste (Cmd/Ctrl+V) to duplicate keyframes.',
    category: 'timeline',
    videoType: 'micro',
    shortcutKey: 'Shift+Click, Cmd+Click',
    testScenarios: [
      'Shift+click for range selection',
      'Cmd/Ctrl+click to toggle selection',
    ],
    videoDurationTarget: 18,
    order: 6,
  },
  {
    featureKey: 'timeline-delete-keyframe',
    title: 'Delete Keyframes',
    description: 'Select keyframes and press Delete or Backspace to remove them. You can delete multiple keyframes at once.',
    category: 'timeline',
    videoType: 'micro',
    shortcutKey: 'Delete, Backspace',
    testScenarios: [
      'Delete selected keyframes',
    ],
    videoDurationTarget: 10,
    order: 7,
  },
  {
    featureKey: 'timeline-layers',
    title: 'Timeline Layers',
    description: 'Each object appears as a layer in the timeline. Expand layers to see individual property tracks. Toggle visibility and lock status from here.',
    category: 'timeline',
    videoType: 'micro',
    testScenarios: [
      'Expand a layer to see properties',
      'Toggle layer visibility',
    ],
    videoDurationTarget: 15,
    order: 8,
  },
  {
    featureKey: 'timeline-zoom',
    title: 'Timeline Zoom',
    description: 'Use the zoom slider to adjust the timeline scale. Zoom in to work on precise timing, zoom out to see the full animation.',
    category: 'timeline',
    videoType: 'micro',
    testScenarios: [
      'Zoom in/out on timeline',
    ],
    videoDurationTarget: 10,
    order: 9,
  },
  {
    featureKey: 'timeline-duration',
    title: 'Animation Duration',
    description: 'Adjust the total animation duration using the duration input. This sets how long the animation runs before looping or stopping.',
    category: 'timeline',
    videoType: 'micro',
    testScenarios: [
      'Change animation duration',
    ],
    videoDurationTarget: 10,
    order: 10,
  },

  // Object/Attribute Features
  {
    featureKey: 'objects-attributes',
    title: 'Object Attributes',
    description: 'Edit selected object properties in the right panel. Set position, size, rotation, opacity, and visibility. Assign custom IDs and classes for trigger targeting.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Select object and view properties',
      'Edit position and size',
    ],
    videoDurationTarget: 20,
    order: 1,
  },
  {
    featureKey: 'objects-position',
    title: 'Position Properties',
    description: 'Set exact X and Y coordinates for precise object placement. Values are relative to the screen\'s top-left corner.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Edit X and Y values',
    ],
    videoDurationTarget: 10,
    order: 2,
  },
  {
    featureKey: 'objects-size',
    title: 'Size Properties',
    description: 'Set Width and Height values to resize objects. Lock aspect ratio to maintain proportions while resizing.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Edit width and height',
    ],
    videoDurationTarget: 10,
    order: 3,
  },
  {
    featureKey: 'objects-transform',
    title: 'Transform Properties',
    description: 'Control Scale X, Scale Y, and Rotation. Scale values are multipliers (1 = 100%). Rotation is in degrees.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Adjust scale and rotation',
    ],
    videoDurationTarget: 12,
    order: 4,
  },
  {
    featureKey: 'objects-opacity',
    title: 'Opacity & Visibility',
    description: 'Adjust opacity from 0 (invisible) to 1 (fully visible). Toggle visibility to completely hide objects from the game.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Change opacity slider',
      'Toggle visibility',
    ],
    videoDurationTarget: 12,
    order: 5,
  },
  {
    featureKey: 'objects-custom-id',
    title: 'Custom ID',
    description: 'Assign a unique custom ID for targeting in triggers. Use IDs like "start-button" or "answer-1" for easy reference.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Set a custom ID',
    ],
    videoDurationTarget: 10,
    order: 6,
  },
  {
    featureKey: 'objects-classes',
    title: 'Classes & Tags',
    description: 'Add classes to group related objects (like CSS classes). Use classes in trigger selectors to target multiple objects at once.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Add a class to an object',
    ],
    videoDurationTarget: 12,
    order: 7,
  },
  {
    featureKey: 'objects-data-binding',
    title: 'Data Binding',
    description: 'Bind objects to vocabulary using a data key. The object will display the word, translation, or media from your vocabulary.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Set a data key for vocabulary binding',
    ],
    videoDurationTarget: 15,
    order: 8,
  },
  {
    featureKey: 'objects-media',
    title: 'Media Bindings',
    description: 'Attach image URLs and audio URLs to objects. Images display on visual objects, audio plays on interaction.',
    category: 'objects',
    videoType: 'micro',
    testScenarios: [
      'Set media URL',
      'Set audio URL',
    ],
    videoDurationTarget: 15,
    order: 9,
  },

  // Scene Features
  {
    featureKey: 'scenes-basics',
    title: 'Working with Scenes',
    description: 'Scenes contain different states for your game objects. Create scenes for different screens or game states. The default scene loads first when the game starts.',
    category: 'scenes',
    videoType: 'micro',
    testScenarios: [
      'Create a new scene',
      'Switch between scenes',
    ],
    videoDurationTarget: 18,
    order: 1,
  },
  {
    featureKey: 'scenes-create',
    title: 'Create Scene',
    description: 'Click the + button in the Scenes panel to add a new scene. Give it a descriptive name like "Intro" or "Level 1".',
    category: 'scenes',
    videoType: 'micro',
    testScenarios: [
      'Create a new scene',
      'Name the scene',
    ],
    videoDurationTarget: 12,
    order: 2,
  },
  {
    featureKey: 'scenes-switch',
    title: 'Switch Scenes',
    description: 'Click a scene in the list to switch to it. The canvas updates to show objects in their state for that scene.',
    category: 'scenes',
    videoType: 'micro',
    testScenarios: [
      'Click to switch scenes',
    ],
    videoDurationTarget: 10,
    order: 3,
  },
  {
    featureKey: 'scenes-default',
    title: 'Set Default Scene',
    description: 'Right-click a scene and select "Set as Default" to make it the starting scene when the game loads.',
    category: 'scenes',
    videoType: 'micro',
    testScenarios: [
      'Set a scene as default',
    ],
    videoDurationTarget: 10,
    order: 4,
  },
  {
    featureKey: 'scenes-object-states',
    title: 'Object States per Scene',
    description: 'Objects can have different properties in each scene. Select an object and change its position, visibility, or other properties for the current scene only.',
    category: 'scenes',
    videoType: 'micro',
    testScenarios: [
      'Modify object state in a scene',
    ],
    videoDurationTarget: 15,
    order: 5,
  },

  // Trigger Features
  {
    featureKey: 'triggers-basics',
    title: 'Creating Triggers',
    description: 'Triggers define interactive behaviors. Set an event type (tap, swipe, etc.), choose target objects using selectors, and define actions like showing/hiding objects or changing scenes.',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Create a new trigger',
      'Select event type',
    ],
    videoDurationTarget: 20,
    order: 1,
  },
  {
    featureKey: 'triggers-events',
    title: 'Trigger Events',
    description: 'Choose what starts the trigger: Click/Tap, Scene Start (runs when scene loads), Timer (after delay), Correct Answer, or Incorrect Answer.',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Select different event types',
    ],
    videoDurationTarget: 15,
    order: 2,
  },
  {
    featureKey: 'triggers-selectors',
    title: 'Target Selectors',
    description: 'Target objects using selectors: #id for specific objects, .class for groups, or * for all objects. Combine selectors like ".button.active".',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Use ID selector',
      'Use class selector',
    ],
    videoDurationTarget: 18,
    order: 3,
  },
  {
    featureKey: 'triggers-actions',
    title: 'Trigger Actions',
    description: 'Actions determine what happens: Go to Scene, Set Visibility, Set Opacity, Add/Remove Class, Play Audio. Chain multiple actions in sequence.',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Add an action to a trigger',
    ],
    videoDurationTarget: 15,
    order: 4,
  },
  {
    featureKey: 'triggers-goto-scene',
    title: 'Go to Scene Action',
    description: 'Navigate to a different scene when triggered. Select the target scene from the dropdown. Great for navigation and game flow.',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Add go to scene action',
    ],
    videoDurationTarget: 12,
    order: 5,
  },
  {
    featureKey: 'triggers-visibility',
    title: 'Set Visibility Action',
    description: 'Show or hide objects when triggered. Use selectors to target specific objects or groups of objects.',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Toggle object visibility',
    ],
    videoDurationTarget: 12,
    order: 6,
  },
  {
    featureKey: 'triggers-audio',
    title: 'Play Audio Action',
    description: 'Play an audio file when triggered. Useful for pronunciation, feedback sounds, or background music.',
    category: 'triggers',
    videoType: 'micro',
    testScenarios: [
      'Add play audio action',
    ],
    videoDurationTarget: 12,
    order: 7,
  },

  // Vocabulary Features
  {
    featureKey: 'vocabulary-add',
    title: 'Add Vocabulary',
    description: 'Click + to add a new vocabulary item. Enter the word and translation, optionally add image and audio URLs.',
    category: 'vocabulary',
    videoType: 'micro',
    testScenarios: [
      'Add new vocabulary item',
    ],
    videoDurationTarget: 15,
    order: 1,
  },
  {
    featureKey: 'vocabulary-edit',
    title: 'Edit Vocabulary',
    description: 'Click a vocabulary item to expand and edit it. Update the word, translation, or media URLs as needed.',
    category: 'vocabulary',
    videoType: 'micro',
    testScenarios: [
      'Edit existing vocabulary',
    ],
    videoDurationTarget: 12,
    order: 2,
  },
  {
    featureKey: 'vocabulary-import',
    title: 'Import from NACA',
    description: 'Import vocabulary from NACA dictionaries. Browse available dictionaries and click to add entries to your project.',
    category: 'vocabulary',
    videoType: 'micro',
    testScenarios: [
      'Browse NACA dictionaries',
      'Import vocabulary entry',
    ],
    videoDurationTarget: 18,
    order: 3,
  },

  // Community Features
  {
    featureKey: 'community-browse',
    title: 'Browse Communities',
    description: 'View available NACA communities. Each community contains shared activities, dictionaries, and media resources.',
    category: 'community',
    videoType: 'micro',
    testScenarios: [
      'View community list',
    ],
    videoDurationTarget: 12,
    order: 1,
  },
  {
    featureKey: 'community-activities',
    title: 'Browse Activities',
    description: 'Navigate the Activities tab to see shared language learning activities. Folders organize activities by topic or level.',
    category: 'community',
    videoType: 'micro',
    testScenarios: [
      'Browse activity folders',
    ],
    videoDurationTarget: 12,
    order: 2,
  },
  {
    featureKey: 'community-dictionaries',
    title: 'Browse Dictionaries',
    description: 'View shared dictionaries with vocabulary entries. Listen to audio pronunciations and import entries to your project.',
    category: 'community',
    videoType: 'micro',
    testScenarios: [
      'Browse dictionary entries',
      'Play audio pronunciation',
    ],
    videoDurationTarget: 15,
    order: 3,
  },
  {
    featureKey: 'community-media',
    title: 'Browse Media',
    description: 'Explore shared media files including images, audio, and video. Filter by type and search by name.',
    category: 'community',
    videoType: 'micro',
    testScenarios: [
      'Filter media by type',
      'Search media',
    ],
    videoDurationTarget: 12,
    order: 4,
  },

  // Figma Features
  {
    featureKey: 'figma-sync',
    title: 'Figma Integration',
    description: 'Connect your Figma file to import designs. Click "Update" to sync new frames. Objects from Figma preserve their layer structure and can be targeted independently.',
    category: 'figma',
    videoType: 'micro',
    testScenarios: [
      'Connect Figma file',
      'Sync frames from Figma',
    ],
    videoDurationTarget: 20,
    order: 1,
  },
  {
    featureKey: 'figma-connect',
    title: 'Connect Figma File',
    description: 'Enter your Figma file key to connect. Find the key in your Figma URL after /file/. The connection allows syncing designs.',
    category: 'figma',
    videoType: 'micro',
    testScenarios: [
      'Enter Figma file key',
    ],
    videoDurationTarget: 12,
    order: 2,
  },
  {
    featureKey: 'figma-update',
    title: 'Update from Figma',
    description: 'Click Update to sync the latest changes from your Figma file. New frames are added, existing ones are updated.',
    category: 'figma',
    videoType: 'micro',
    testScenarios: [
      'Click update button',
    ],
    videoDurationTarget: 12,
    order: 3,
  },

  // DevSync Features
  {
    featureKey: 'devsync-connect',
    title: 'DevSync Connection',
    description: 'Connect to the NACA Activity Editor for real-time synchronization. Push updates and receive changes from the main editor.',
    category: 'devsync',
    videoType: 'micro',
    testScenarios: [
      'View connection status',
    ],
    videoDurationTarget: 15,
    order: 1,
  },
  {
    featureKey: 'devsync-push',
    title: 'Push to NACA',
    description: 'Send your activity data to the NACA server. This updates the main editor with your screens, objects, and triggers.',
    category: 'devsync',
    videoType: 'micro',
    testScenarios: [
      'Push activity data',
    ],
    videoDurationTarget: 12,
    order: 2,
  },
  {
    featureKey: 'devsync-preview',
    title: 'Preview in NACA',
    description: 'Request a preview in the NACA Activity Editor. See how your activity looks and behaves in the production environment.',
    category: 'devsync',
    videoType: 'micro',
    testScenarios: [
      'Request preview',
    ],
    videoDurationTarget: 12,
    order: 3,
  },

  // General/Shortcuts
  {
    featureKey: 'shortcuts-dialog',
    title: 'Keyboard Shortcuts',
    description: 'Press ? to open the keyboard shortcuts dialog. View all available shortcuts organized by category.',
    category: 'shortcuts',
    videoType: 'micro',
    shortcutKey: '?',
    testScenarios: [
      'Open shortcuts dialog',
    ],
    videoDurationTarget: 10,
    order: 1,
  },
  {
    featureKey: 'help-panel',
    title: 'Help Panel',
    description: 'Access the Help panel for searchable documentation. Browse topics by category or search for specific features.',
    category: 'general',
    videoType: 'micro',
    testScenarios: [
      'Open help panel',
      'Search for help topic',
    ],
    videoDurationTarget: 15,
    order: 1,
  },
];

/**
 * Combined registry for easy access
 */
export const featureHelpRegistry: FeatureHelpConfig[] = [
  ...overviewVideos,
  ...microLessons,
];

/**
 * Get feature config by key
 */
export function getFeatureConfig(featureKey: string): FeatureHelpConfig | undefined {
  return featureHelpRegistry.find(f => f.featureKey === featureKey);
}

/**
 * Get all features in a category
 */
export function getFeaturesByCategory(category: FeatureCategory): FeatureHelpConfig[] {
  return featureHelpRegistry.filter(f => f.category === category);
}

/**
 * Get all overview videos
 */
export function getOverviewVideos(): FeatureHelpConfig[] {
  return featureHelpRegistry.filter(f => f.videoType === 'overview');
}

/**
 * Get all micro-lessons
 */
export function getMicroLessons(): FeatureHelpConfig[] {
  return featureHelpRegistry.filter(f => f.videoType === 'micro');
}

/**
 * Get all feature keys
 */
export function getAllFeatureKeys(): string[] {
  return featureHelpRegistry.map(f => f.featureKey);
}

/**
 * Get features by video type
 */
export function getFeaturesByVideoType(videoType: VideoType): FeatureHelpConfig[] {
  return featureHelpRegistry.filter(f => f.videoType === videoType);
}

/**
 * Video duration guidelines
 */
export const videoDurationGuidelines = {
  overview: {
    min: 60,  // 1 minute
    max: 180, // 3 minutes
    description: 'Comprehensive panel walkthroughs'
  },
  micro: {
    min: 5,   // 5 seconds
    max: 30,  // 30 seconds
    description: 'Quick focused tutorials'
  }
};
