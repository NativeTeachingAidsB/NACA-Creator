
# Help System Integration Package

## Overview
This document provides complete instructions for integrating the Activity Editor's help system and automated video tutorial generation into the NACA platform.

## System Components

### 1. Help System Architecture

#### Core Components
- **Feature Help Registry** (`shared/feature-help-registry.ts`) - Central registry of all features with help content
- **Help Panel** (`client/src/components/editor/HelpPanel.tsx`) - UI for browsing help content
- **Help Tooltip** (`client/src/components/ui/help-tooltip.tsx`) - Context-sensitive help tooltips
- **Help Admin Panel** (`client/src/components/admin/HelpAdminPanel.tsx`) - Admin interface for managing help content

#### Database Schema
```sql
-- Feature help content storage
CREATE TABLE feature_help (
  id TEXT PRIMARY KEY,
  feature_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  video_url TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL,
  shortcut_key TEXT,
  related_features TEXT, -- JSON array of feature keys
  "order" INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  documented_at TIMESTAMP,
  tested_at TIMESTAMP,
  view_count INTEGER DEFAULT 0,
  last_viewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Video generation tracking
CREATE TABLE video_candidates (
  id TEXT PRIMARY KEY,
  feature_key TEXT NOT NULL,
  test_plan_path TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  last_generated_at TIMESTAMP,
  generation_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (feature_key) REFERENCES feature_help(feature_key)
);
```

### 2. Automated Video Tutorial Generation

#### Video Test Plans
Location: `docs/video-test-plans/`

Categories:
- `canvas-tools.md` - Canvas manipulation and tools
- `object-attributes.md` - Object properties and attributes
- `scenes-states.md` - Scene management and state control
- `timeline-features.md` - Timeline and animation features
- `triggers-interactions.md` - Triggers and interactive behaviors
- `vocabulary-community.md` - Vocabulary and community features
- `figma-devsync.md` - Figma integration and DevSync

#### Video Generation Process
1. **Test Plan Format**: Markdown files with step-by-step user interactions
2. **Recording**: Automated via Playwright browser automation
3. **Storage**: Videos saved to `attached_assets/generated_videos/`
4. **Thumbnails**: Auto-generated from first frame
5. **Registration**: Automatically linked to feature help entries

#### API Endpoints for Video Generation
```typescript
// Get all video candidates (features needing videos)
GET /api/video-candidates

// Generate video for specific feature
POST /api/video-candidates/:featureKey/generate

// Get video generation status
GET /api/video-candidates/:featureKey/status
```

### 3. Feature Help API

#### Endpoints
```typescript
// Get all feature help entries
GET /api/feature-help

// Get help for specific feature
GET /api/feature-help/key/:featureKey

// Get help by category
GET /api/feature-help/category/:category

// Update feature help (admin)
PATCH /api/feature-help/:id

// Track help usage
POST /api/feature-help/:id/view
```

## NACA Integration Guide

### Phase 1: Data Sync Setup

#### 1.1 Create NACA Help System Tables
Copy the database schema from above into your NACA database.

#### 1.2 Set Up Sync Endpoint
The Activity Editor will push help content updates to NACA:

```typescript
// NACA endpoint to receive help content updates
POST /api/activity-editor/help-sync
Content-Type: application/json

{
  "type": "full_sync" | "incremental",
  "timestamp": "2025-12-03T12:00:00Z",
  "features": [
    {
      "featureKey": "canvas-navigation",
      "title": "Canvas Navigation",
      "description": "Learn how to pan and zoom the canvas",
      "videoUrl": "https://activity-editor.repl.co/videos/canvas_navigation.mp4",
      "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation.jpg",
      "category": "canvas",
      "shortcutKey": "Space",
      "relatedFeatures": ["zoom-controls", "pan-mode"],
      "order": 1,
      "isNew": true,
      "updatedAt": "2025-12-03T11:30:00Z"
    }
  ],
  "videos": [
    {
      "featureKey": "canvas-navigation",
      "url": "https://activity-editor.repl.co/videos/canvas_navigation.mp4",
      "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation.jpg",
      "duration": 45,
      "fileSize": 2048576,
      "generatedAt": "2025-12-03T10:00:00Z"
    }
  ]
}
```

### Phase 2: Communication Protocol

#### 2.1 WebSocket Events for Real-Time Updates
```typescript
// Activity Editor sends new video notification
{
  "type": "help:video:generated",
  "payload": {
    "featureKey": "canvas-navigation",
    "videoUrl": "https://activity-editor.repl.co/videos/canvas_navigation.mp4",
    "thumbnailUrl": "https://activity-editor.repl.co/videos/thumbnails/canvas_navigation.jpg",
    "timestamp": "2025-12-03T12:00:00Z"
  }
}

// Activity Editor sends help content update
{
  "type": "help:content:updated",
  "payload": {
    "featureKey": "canvas-navigation",
    "changes": {
      "description": "Updated description text",
      "relatedFeatures": ["zoom-controls", "pan-mode", "fit-to-screen"]
    },
    "timestamp": "2025-12-03T12:00:00Z"
  }
}
```

#### 2.2 NACA Pull Request
NACA can also pull help content on demand:

```typescript
// Request help content from Activity Editor
GET https://activity-editor.repl.co/api/help-export
Authorization: Bearer <naca-access-token>

Response:
{
  "version": "1.0.0",
  "exportedAt": "2025-12-03T12:00:00Z",
  "features": [...],
  "videos": [...],
  "categories": {
    "canvas": "Canvas Tools",
    "objects": "Object Management",
    "timeline": "Timeline & Animation",
    "triggers": "Triggers & Interactions",
    "scenes": "Scenes & States",
    "vocabulary": "Vocabulary Management"
  }
}
```

### Phase 3: Video Content Delivery

#### 3.1 Video Hosting Options

**Option A: Direct Reference**
- NACA displays videos directly from Activity Editor URLs
- Requires Activity Editor to be always accessible
- Simplest implementation

**Option B: Video Mirroring**
- NACA downloads and hosts copies of videos
- More resilient, works offline
- Requires storage on NACA side

**Option C: CDN Integration**
- Videos uploaded to shared CDN
- Best performance
- Requires CDN setup

#### 3.2 Recommended: Direct Reference with Caching
```typescript
// NACA side: Cache video URLs with fallback
class NacaHelpVideoPlayer {
  async getVideoUrl(featureKey: string): Promise<string> {
    // Check local cache first
    const cached = await this.cache.get(featureKey);
    if (cached && !this.isExpired(cached)) {
      return cached.url;
    }
    
    // Fetch from Activity Editor
    const response = await fetch(
      `https://activity-editor.repl.co/api/help-video/${featureKey}`
    );
    const { url, expiresAt } = await response.json();
    
    // Cache for future use
    await this.cache.set(featureKey, { url, expiresAt });
    return url;
  }
}
```

### Phase 4: Help Content Display in NACA

#### 4.1 Embed Activity Editor Help Panel
```html
<!-- In NACA help section -->
<iframe 
  src="https://activity-editor.repl.co/help-embed?category=canvas&feature=canvas-navigation"
  width="100%"
  height="600px"
  frameborder="0"
  allow="autoplay"
></iframe>
```

#### 4.2 Build Native Help UI
Use the synced data to build NACA's own help interface:

```typescript
// Example NACA help component
function NacaActivityHelp({ category }: { category: string }) {
  const features = useActivityEditorHelp(category);
  
  return (
    <div className="help-grid">
      {features.map(feature => (
        <HelpCard
          key={feature.featureKey}
          title={feature.title}
          description={feature.description}
          videoUrl={feature.videoUrl}
          thumbnailUrl={feature.thumbnailUrl}
          shortcut={feature.shortcutKey}
          onView={() => trackHelpView(feature.featureKey)}
        />
      ))}
    </div>
  );
}
```

## Code Package Structure

### Files to Reference

```
activity-editor/
├── shared/
│   └── feature-help-registry.ts          # Feature definitions
├── client/src/
│   ├── components/
│   │   ├── editor/
│   │   │   ├── HelpPanel.tsx             # Help UI component
│   │   │   └── KeyboardShortcutsDialog.tsx
│   │   ├── admin/
│   │   │   └── HelpAdminPanel.tsx        # Admin interface
│   │   └── ui/
│   │       └── help-tooltip.tsx          # Context help
│   └── hooks/
│       ├── use-feature-help.ts           # Help data hook
│       └── use-video-candidates.ts       # Video generation hook
├── server/
│   ├── routes.ts                         # API endpoints
│   └── video-utils.ts                    # Video generation utilities
├── docs/
│   ├── video-test-plans/                 # Test plans for video generation
│   │   ├── canvas-tools.md
│   │   ├── object-attributes.md
│   │   ├── timeline-features.md
│   │   └── triggers-interactions.md
│   └── video-testing-workflow.md         # Video generation guide
└── attached_assets/
    └── generated_videos/                 # Generated video files
```

## Implementation Checklist for NACA Team

- [ ] Create help system database tables in NACA
- [ ] Implement `/api/activity-editor/help-sync` endpoint
- [ ] Set up WebSocket listener for help content updates
- [ ] Decide on video hosting strategy (direct/mirror/CDN)
- [ ] Create help content display UI in NACA
- [ ] Implement help content caching strategy
- [ ] Add analytics for help content usage
- [ ] Set up automated sync schedule (if using pull model)
- [ ] Configure authentication for sync endpoints
- [ ] Test help content display in NACA interface

## Configuration

### Environment Variables (Activity Editor)
```bash
# NACA sync endpoint
NACA_HELP_SYNC_URL=https://naca.repl.co/api/activity-editor/help-sync
NACA_HELP_SYNC_TOKEN=<secure-token>

# Video hosting
VIDEO_BASE_URL=https://activity-editor.repl.co/videos
VIDEO_STORAGE_PATH=./attached_assets/generated_videos
```

### Environment Variables (NACA)
```bash
# Activity Editor connection
ACTIVITY_EDITOR_URL=https://activity-editor.repl.co
ACTIVITY_EDITOR_API_KEY=<secure-api-key>

# Help content sync
HELP_SYNC_ENABLED=true
HELP_SYNC_INTERVAL=3600000  # 1 hour in ms
```

## Support & Maintenance

### Monitoring
- Track help content sync status
- Monitor video generation success rate
- Analytics on help content usage
- Error logging for failed syncs

### Updates
- Activity Editor automatically notifies NACA of new content
- NACA can trigger manual sync via API
- Version tracking ensures compatibility

## Contact
For technical support integrating this system, refer to the Activity Editor development team.
