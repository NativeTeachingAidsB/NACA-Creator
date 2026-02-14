# Video Help Testing Workflow

Complete guide for producing, reviewing, and deploying help videos for Indigamate Studio.

## Overview

The video help system provides contextual video demonstrations for all major features. This document describes the end-to-end workflow from video capture to deployment.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VIDEO HELP PIPELINE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Test Plans  │───▶│  Playwright  │───▶│   Video      │          │
│  │  (docs/)     │    │  Recording   │    │   Capture    │          │
│  └──────────────┘    └──────────────┘    └──────┬───────┘          │
│                                                  │                  │
│                                                  ▼                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Help Topic  │◀───│   Admin      │◀───│   Video      │          │
│  │  (database)  │    │  Approval    │    │  Candidates  │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│         │                                                           │
│         ▼                                                           │
│  ┌──────────────┐    ┌──────────────┐                              │
│  │  HelpTooltip │───▶│   User       │                              │
│  │  Component   │    │   Views      │                              │
│  └──────────────┘    └──────────────┘                              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Feature Registry
**Location**: `shared/feature-help-registry.ts`

Defines all 74 available features with:
- Feature key (unique identifier)
- Title and description
- Category
- Video type (overview/micro)
- Duration targets
- Test scenario suggestions

### 2. Test Plans
**Location**: `docs/video-test-plans/`

Structured test scenarios for each feature:
- Canvas tools (12 plans)
- Timeline features (10 plans)
- Scenes & states (6 plans)
- Triggers & interactions (8 plans)
- Object attributes (10 plans)
- Vocabulary & community (10 plans)
- Figma & DevSync (10 plans)

### 3. Video Candidates API
**Endpoints**:
- `POST /api/video-candidates` - Submit new video
- `GET /api/video-candidates` - List all candidates
- `GET /api/video-candidates/status/:status` - Filter by status
- `POST /api/video-candidates/:id/approve` - Approve video
- `POST /api/video-candidates/:id/reject` - Reject video

### 4. Admin Interface
**Location**: `/admin/help`

Features:
- Video Candidates tab with preview
- Batch selection and approval
- Replacement warnings for existing videos
- Analytics dashboard

### 5. Help Tooltip Component
**Location**: `client/src/components/ui/help-tooltip.tsx`

Displays help content including:
- Title and description
- Video player (if available and enabled)
- Keyboard shortcuts
- User settings integration

## Workflow Steps

### Step 1: Prepare Test Environment

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Ensure test data exists**:
   - At least one project/screen
   - Some objects on canvas
   - Multiple scenes configured

3. **Verify feature registry is synced**:
   ```bash
   curl -X POST http://localhost:5000/api/feature-help/sync-from-registry
   ```

### Step 2: Execute Test Plans

1. **Select test plan** from `docs/video-test-plans/`

2. **Configure video recording**:
   ```javascript
   const context = await browser.newContext({
     recordVideo: {
       dir: './attached_assets/help_videos/',
       size: { width: 1280, height: 720 }
     }
   });
   ```

3. **Follow test steps**:
   - Navigate to correct page
   - Perform actions with deliberate pacing
   - Include 0.5-1s pauses after key actions
   - End with clean UI state

4. **Submit captured video**:
   ```javascript
   await fetch('/api/video-candidates', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       featureKey: 'canvas-select-tool',
       videoUrl: videoPath,
       testDescription: 'Selection tool demonstration',
       duration: 15
     })
   });
   ```

### Step 3: Admin Review

1. Navigate to `/admin/help`
2. Click "Video Candidates" tab
3. Review pending videos:
   - Preview video playback
   - Check duration matches target
   - Verify content quality
4. Approve or reject:
   - **Approve**: Links video to help topic
   - **Reject**: Removes with reason

### Step 4: Verify Deployment

1. Clear browser cache
2. Navigate to feature with help tooltip
3. Hover to trigger tooltip
4. Verify video plays correctly
5. Check user settings respect (video on/off)

## Video Recording Guidelines

### For Overview Videos (60-180 seconds)
- Start with zoomed-out panel view
- Demonstrate each major feature systematically
- Use deliberate, slow mouse movements
- Pause briefly after each action
- Cover all test scenarios in registry
- End with panel in clean state

### For Micro-Lessons (5-30 seconds)
- Start with relevant tool/feature ready
- Perform action once with clear visibility
- Show result/feedback
- Keep movements smooth and purposeful
- No narration needed

### Technical Requirements
- Resolution: 1280x720 (720p) or 1920x1080 (1080p)
- Format: MP4 (H.264)
- Frame rate: 30fps minimum
- Audio: None (silent videos)
- File size: Under 10MB per video

## Quality Checklist

Before submitting a video:

- [ ] Correct feature demonstrated
- [ ] Duration within target range
- [ ] Clear, visible actions
- [ ] No UI glitches or errors
- [ ] Proper pacing (not too fast)
- [ ] Clean start and end state
- [ ] Correct resolution
- [ ] File uploads successfully

## Troubleshooting

### Video not appearing in tooltips
1. Check `videoHelpEnabled` user setting
2. Verify video was approved (not just submitted)
3. Check video URL is accessible
4. Clear browser cache

### Video candidate rejected
1. Review rejection reason
2. Re-record with improvements
3. Submit new video candidate

### Sync issues
1. Run registry sync endpoint
2. Check database for feature_help entries
3. Verify feature keys match exactly

## User Settings

Users can control video help through Settings dropdown:

| Setting | Default | Effect |
|---------|---------|--------|
| Show Help Tooltips | On | Enables/disables all help tooltips |
| Show Video Help | On | Enables/disables videos in tooltips |
| Auto-play Videos | On | Auto-plays video when tooltip opens |
| Show Shortcut Hints | On | Shows keyboard shortcut badges |

Settings stored in localStorage: `indigamate-user-settings`

## Analytics

Track video effectiveness:

| Metric | Location |
|--------|----------|
| View counts | `feature_help.viewCount` |
| Last viewed | `feature_help.lastViewedAt` |
| Top viewed | `/admin/help` Analytics tab |
| Total views | `/api/feature-help/analytics` |

## Maintenance

### Adding New Features
1. Add to `shared/feature-help-registry.ts`
2. Create test plan in `docs/video-test-plans/`
3. Run sync endpoint
4. Record and submit video

### Updating Existing Videos
1. Record new video following test plan
2. Submit as new candidate
3. Admin approval replaces old video
4. Old video archived

### Quarterly Review
1. Check analytics for low-engagement videos
2. Identify outdated content (UI changes)
3. Re-record as needed
4. Update test plans if features changed

## File Structure

```
docs/
├── video-help-testing-guide.md     # Quick reference guide
├── video-testing-workflow.md       # This comprehensive guide
└── video-test-plans/
    ├── README.md                   # Test plans index
    ├── canvas-tools.md
    ├── timeline-features.md
    ├── scenes-states.md
    ├── triggers-interactions.md
    ├── object-attributes.md
    ├── vocabulary-community.md
    └── figma-devsync.md

shared/
└── feature-help-registry.ts        # Feature definitions

client/src/
├── components/
│   ├── ui/help-tooltip.tsx         # Tooltip component
│   └── admin/HelpAdminPanel.tsx    # Admin interface
└── hooks/
    ├── use-feature-help.ts         # Help data hooks
    ├── use-video-candidates.ts     # Candidate management
    └── use-user-settings.ts        # User preferences

server/
├── routes.ts                       # API endpoints
├── storage.ts                      # Database operations
└── video-utils.ts                  # Video processing

attached_assets/
└── help_videos/
    └── thumbnails/                 # Auto-extracted thumbnails
```
