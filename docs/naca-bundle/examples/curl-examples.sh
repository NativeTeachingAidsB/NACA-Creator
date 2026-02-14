#!/bin/bash
# Activity Editor API - cURL Examples
# Base URL for development: http://localhost:5000
# Base URL for production: https://create.naca.community

BASE_URL="http://localhost:5000"
API_KEY="your-api-key"

# ============================================
# SCREENS
# ============================================

# List all screens
curl -X GET "$BASE_URL/api/screens" \
  -H "X-API-Key: $API_KEY"

# Get single screen
curl -X GET "$BASE_URL/api/screens/SCREEN_ID" \
  -H "X-API-Key: $API_KEY"

# Create a screen
curl -X POST "$BASE_URL/api/screens" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "title": "New Activity Screen",
    "imageUrl": "/placeholder.png",
    "width": 1194,
    "height": 834
  }'

# Update a screen (attach NACA activity)
curl -X PATCH "$BASE_URL/api/screens/SCREEN_ID" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "nacaActivityId": "activity-uuid",
    "nacaCommunityId": "community-uuid"
  }'

# Delete a screen
curl -X DELETE "$BASE_URL/api/screens/SCREEN_ID" \
  -H "X-API-Key: $API_KEY"

# ============================================
# GAME OBJECTS
# ============================================

# List objects for a screen
curl -X GET "$BASE_URL/api/screens/SCREEN_ID/objects" \
  -H "X-API-Key: $API_KEY"

# Create an object
curl -X POST "$BASE_URL/api/objects" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "screenId": "SCREEN_ID",
    "name": "Word Card",
    "type": "shape",
    "x": 100,
    "y": 100,
    "width": 200,
    "height": 150,
    "dataKey": "vocab:entry-id",
    "classes": ["interactive", "vocabulary-card"]
  }'

# Update an object (bind to vocabulary)
curl -X PATCH "$BASE_URL/api/objects/OBJECT_ID" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "dataKey": "vocab:dictionary-entry-uuid",
    "mediaUrl": "/api/naca-media/public/community/images/word.webp"
  }'

# Batch update z-index (layer order)
curl -X PATCH "$BASE_URL/api/objects/batch-zindex" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "updates": [
      { "id": "obj-1", "zIndex": 1 },
      { "id": "obj-2", "zIndex": 2 },
      { "id": "obj-3", "zIndex": 3 }
    ]
  }'

# ============================================
# SCENES (GAME STATES)
# ============================================

# List scenes for a screen
curl -X GET "$BASE_URL/api/screens/SCREEN_ID/scenes" \
  -H "X-API-Key: $API_KEY"

# Create a scene
curl -X POST "$BASE_URL/api/scenes" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "screenId": "SCREEN_ID",
    "name": "Correct Answer",
    "order": 1,
    "isDefault": false
  }'

# ============================================
# TRIGGERS
# ============================================

# List triggers for a scene
curl -X GET "$BASE_URL/api/scenes/SCENE_ID/triggers" \
  -H "X-API-Key: $API_KEY"

# Create a click trigger
curl -X POST "$BASE_URL/api/triggers" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "sceneId": "SCENE_ID",
    "objectId": "OBJECT_ID",
    "type": "click",
    "action": "goToScene",
    "targetSceneId": "TARGET_SCENE_ID"
  }'

# Create a trigger with CSS selector
curl -X POST "$BASE_URL/api/triggers" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "sceneId": "SCENE_ID",
    "type": "click",
    "targetSelector": ".vocabulary-card",
    "action": "setVisible",
    "actionPayload": { "visible": false }
  }'

# ============================================
# VOCABULARY
# ============================================

# List all vocabulary
curl -X GET "$BASE_URL/api/vocabulary" \
  -H "X-API-Key: $API_KEY"

# Create vocabulary entry
curl -X POST "$BASE_URL/api/vocabulary" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "projectId": "PROJECT_ID",
    "word": "hello",
    "translation": "bonjour",
    "imageUrl": "/images/hello.png",
    "audioUrl": "/audio/hello.mp3",
    "category": "greetings",
    "difficulty": 1
  }'

# ============================================
# NACA PROXY ENDPOINTS
# ============================================

# Get NACA proxy configuration
curl -X GET "$BASE_URL/api/naca-proxy/config" \
  -H "X-API-Key: $API_KEY"

# List NACA communities
curl -X GET "$BASE_URL/api/naca-proxy/communities" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Community-Subdomain: little-bird-press"

# Get community dictionaries
curl -X GET "$BASE_URL/api/naca-proxy/communities/COMMUNITY_ID/dictionaries" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Community-Subdomain: little-bird-press"

# Get dictionary entries
curl -X GET "$BASE_URL/api/naca-proxy/dictionaries/DICTIONARY_ID/entries" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Community-Subdomain: little-bird-press"

# List community activities
curl -X GET "$BASE_URL/api/naca-proxy/communities/COMMUNITY_ID/activities" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Community-Subdomain: little-bird-press"

# Get activity items
curl -X GET "$BASE_URL/api/naca-proxy/activities/ACTIVITY_ID/items" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Community-Subdomain: little-bird-press"

# List media (images)
curl -X GET "$BASE_URL/api/naca-proxy/communities/COMMUNITY_ID/media?type=image" \
  -H "X-API-Key: $API_KEY" \
  -H "X-Community-Subdomain: little-bird-press"

# ============================================
# PROJECTS
# ============================================

# List all projects
curl -X GET "$BASE_URL/api/projects" \
  -H "X-API-Key: $API_KEY"

# Create a project
curl -X POST "$BASE_URL/api/projects" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{
    "name": "Vocabulary Game",
    "description": "An interactive language learning activity"
  }'

# Export project (full data dump)
curl -X GET "$BASE_URL/api/projects/PROJECT_ID/export" \
  -H "X-API-Key: $API_KEY"

# ============================================
# API DOCUMENTATION
# ============================================

# Get JSON API documentation
curl -X GET "$BASE_URL/api/docs/activity-editor"

# Get Markdown documentation
curl -X GET "$BASE_URL/api/docs/activity-editor/markdown"

# Rebuild documentation
curl -X POST "$BASE_URL/api/docs/activity-editor/rebuild" \
  -H "X-API-Key: $API_KEY"

# Publish documentation
curl -X POST "$BASE_URL/api/docs/activity-editor/publish" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d '{ "environment": "both" }'
