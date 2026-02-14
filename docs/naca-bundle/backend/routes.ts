import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { syncFigmaProject, hasFigmaToken, syncFigmaLayers } from "./figma-service";
import { devSyncService } from "./dev-sync";
import { extractThumbnailFromVideo } from "./video-utils";
import { buildApiDocs, saveApiDocs, checkForDrift } from "./doc-builder";
import * as subdomainHealth from "./subdomainHealthService";
import * as porkbunService from "./porkbunService";
import { 
  insertScreenSchema, 
  insertGameObjectSchema, 
  insertSceneSchema, 
  insertObjectStateSchema, 
  insertTriggerSchema,
  insertVocabularySchema,
  insertProjectSchema,
  insertAnimationSchema,
  insertKeyframeSchema,
  insertTimelineActionSchema,
  insertFeatureHelpSchema,
  insertHelpVideoCandidateSchema
} from "@shared/schema";
import { z } from "zod";

const figmaUrlSchema = z.object({
  url: z.string().url()
});

const figmaSyncSchema = z.object({
  projectId: z.string(),
  frameIds: z.array(z.string()).optional()
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize DevSync WebSocket service
  devSyncService.initialize(httpServer);

  // Get all screens
  app.get("/api/screens", async (_req, res) => {
    try {
      const screens = await storage.getAllScreens();
      res.json(screens);
    } catch (error) {
      console.error("Error fetching screens:", error);
      res.status(500).json({ error: "Failed to fetch screens" });
    }
  });

  // Get a single screen
  app.get("/api/screens/:id", async (req, res) => {
    try {
      const screen = await storage.getScreen(req.params.id);
      if (!screen) {
        return res.status(404).json({ error: "Screen not found" });
      }
      res.json(screen);
    } catch (error) {
      console.error("Error fetching screen:", error);
      res.status(500).json({ error: "Failed to fetch screen" });
    }
  });

  // Create a new screen
  app.post("/api/screens", async (req, res) => {
    try {
      const validatedData = insertScreenSchema.parse(req.body);
      const screen = await storage.createScreen(validatedData);
      res.status(201).json(screen);
    } catch (error) {
      console.error("Error creating screen:", error);
      res.status(400).json({ error: "Invalid screen data" });
    }
  });

  // Update a screen
  app.patch("/api/screens/:id", async (req, res) => {
    try {
      const partialData = insertScreenSchema.partial().parse(req.body);
      const screen = await storage.updateScreen(req.params.id, partialData);
      if (!screen) {
        return res.status(404).json({ error: "Screen not found" });
      }
      res.json(screen);
    } catch (error) {
      console.error("Error updating screen:", error);
      res.status(400).json({ error: "Invalid screen data" });
    }
  });

  // Delete a screen
  app.delete("/api/screens/:id", async (req, res) => {
    try {
      const success = await storage.deleteScreen(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Screen not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting screen:", error);
      res.status(500).json({ error: "Failed to delete screen" });
    }
  });

  // ==================== Game Objects ====================
  
  app.get("/api/screens/:screenId/objects", async (req, res) => {
    try {
      const objects = await storage.getObjectsByScreen(req.params.screenId);
      res.json(objects);
    } catch (error) {
      console.error("Error fetching objects:", error);
      res.status(500).json({ error: "Failed to fetch objects" });
    }
  });

  app.post("/api/objects", async (req, res) => {
    try {
      const validatedData = insertGameObjectSchema.parse(req.body);
      const obj = await storage.createObject(validatedData);
      res.status(201).json(obj);
    } catch (error) {
      console.error("Error creating object:", error);
      res.status(400).json({ error: "Invalid object data" });
    }
  });

  app.patch("/api/objects/:id", async (req, res) => {
    try {
      const partialData = insertGameObjectSchema.partial().parse(req.body);
      const obj = await storage.updateObject(req.params.id, partialData);
      if (!obj) {
        return res.status(404).json({ error: "Object not found" });
      }
      res.json(obj);
    } catch (error) {
      console.error("Error updating object:", error);
      res.status(400).json({ error: "Invalid object data" });
    }
  });

  app.delete("/api/objects/:id", async (req, res) => {
    try {
      const success = await storage.deleteObject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Object not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting object:", error);
      res.status(500).json({ error: "Failed to delete object" });
    }
  });

  app.patch("/api/objects/batch-zindex", async (req, res) => {
    try {
      const { updates } = req.body;
      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({ error: "Updates array is required" });
      }
      for (const update of updates) {
        if (typeof update.id !== "string" || typeof update.zIndex !== "number") {
          return res.status(400).json({ error: "Each update must have a string id and number zIndex" });
        }
      }
      const objects = await storage.updateObjectsZIndex(updates);
      res.json(objects);
    } catch (error) {
      console.error("Error batch updating zIndex:", error);
      res.status(500).json({ error: "Failed to batch update zIndex" });
    }
  });

  // ==================== Scenes ====================
  
  app.get("/api/screens/:screenId/scenes", async (req, res) => {
    try {
      const scenesList = await storage.getScenesByScreen(req.params.screenId);
      res.json(scenesList);
    } catch (error) {
      console.error("Error fetching scenes:", error);
      res.status(500).json({ error: "Failed to fetch scenes" });
    }
  });

  app.post("/api/scenes", async (req, res) => {
    try {
      const validatedData = insertSceneSchema.parse(req.body);
      const scene = await storage.createScene(validatedData);
      res.status(201).json(scene);
    } catch (error) {
      console.error("Error creating scene:", error);
      res.status(400).json({ error: "Invalid scene data" });
    }
  });

  app.patch("/api/scenes/:id", async (req, res) => {
    try {
      const partialData = insertSceneSchema.partial().parse(req.body);
      const scene = await storage.updateScene(req.params.id, partialData);
      if (!scene) {
        return res.status(404).json({ error: "Scene not found" });
      }
      res.json(scene);
    } catch (error) {
      console.error("Error updating scene:", error);
      res.status(400).json({ error: "Invalid scene data" });
    }
  });

  app.delete("/api/scenes/:id", async (req, res) => {
    try {
      const success = await storage.deleteScene(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Scene not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting scene:", error);
      res.status(500).json({ error: "Failed to delete scene" });
    }
  });

  // ==================== Object States ====================
  
  app.get("/api/scenes/:sceneId/states", async (req, res) => {
    try {
      const states = await storage.getStatesByScene(req.params.sceneId);
      res.json(states);
    } catch (error) {
      console.error("Error fetching object states:", error);
      res.status(500).json({ error: "Failed to fetch object states" });
    }
  });

  app.post("/api/states", async (req, res) => {
    try {
      const validatedData = insertObjectStateSchema.parse(req.body);
      const state = await storage.createObjectState(validatedData);
      res.status(201).json(state);
    } catch (error) {
      console.error("Error creating object state:", error);
      res.status(400).json({ error: "Invalid state data" });
    }
  });

  app.patch("/api/states/:id", async (req, res) => {
    try {
      const partialData = insertObjectStateSchema.partial().parse(req.body);
      const state = await storage.updateObjectState(req.params.id, partialData);
      if (!state) {
        return res.status(404).json({ error: "State not found" });
      }
      res.json(state);
    } catch (error) {
      console.error("Error updating state:", error);
      res.status(400).json({ error: "Invalid state data" });
    }
  });

  app.delete("/api/states/:id", async (req, res) => {
    try {
      const success = await storage.deleteObjectState(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "State not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting state:", error);
      res.status(500).json({ error: "Failed to delete state" });
    }
  });

  // ==================== Triggers ====================
  
  app.get("/api/scenes/:sceneId/triggers", async (req, res) => {
    try {
      const triggersList = await storage.getTriggersByScene(req.params.sceneId);
      res.json(triggersList);
    } catch (error) {
      console.error("Error fetching triggers:", error);
      res.status(500).json({ error: "Failed to fetch triggers" });
    }
  });

  app.post("/api/triggers", async (req, res) => {
    try {
      const validatedData = insertTriggerSchema.parse(req.body);
      const trigger = await storage.createTrigger(validatedData);
      res.status(201).json(trigger);
    } catch (error) {
      console.error("Error creating trigger:", error);
      res.status(400).json({ error: "Invalid trigger data" });
    }
  });

  app.patch("/api/triggers/:id", async (req, res) => {
    try {
      const partialData = insertTriggerSchema.partial().parse(req.body);
      const trigger = await storage.updateTrigger(req.params.id, partialData);
      if (!trigger) {
        return res.status(404).json({ error: "Trigger not found" });
      }
      res.json(trigger);
    } catch (error) {
      console.error("Error updating trigger:", error);
      res.status(400).json({ error: "Invalid trigger data" });
    }
  });

  app.delete("/api/triggers/:id", async (req, res) => {
    try {
      const success = await storage.deleteTrigger(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Trigger not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting trigger:", error);
      res.status(500).json({ error: "Failed to delete trigger" });
    }
  });

  // ==================== Vocabulary ====================
  
  app.get("/api/vocabulary", async (_req, res) => {
    try {
      const vocabList = await storage.getAllVocabulary();
      res.json(vocabList);
    } catch (error) {
      console.error("Error fetching vocabulary:", error);
      res.status(500).json({ error: "Failed to fetch vocabulary" });
    }
  });

  app.post("/api/vocabulary", async (req, res) => {
    try {
      const validatedData = insertVocabularySchema.parse(req.body);
      const vocab = await storage.createVocabulary(validatedData);
      res.status(201).json(vocab);
    } catch (error) {
      console.error("Error creating vocabulary:", error);
      res.status(400).json({ error: "Invalid vocabulary data" });
    }
  });

  app.delete("/api/vocabulary/:id", async (req, res) => {
    try {
      const success = await storage.deleteVocabulary(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Vocabulary not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
      res.status(500).json({ error: "Failed to delete vocabulary" });
    }
  });

  // ==================== Animations ====================
  
  app.get("/api/objects/:objectId/animations", async (req, res) => {
    try {
      const animationsList = await storage.getAnimationsByObject(req.params.objectId);
      res.json(animationsList);
    } catch (error) {
      console.error("Error fetching animations:", error);
      res.status(500).json({ error: "Failed to fetch animations" });
    }
  });

  app.get("/api/scenes/:sceneId/animations", async (req, res) => {
    try {
      const animationsList = await storage.getAnimationsByScene(req.params.sceneId);
      res.json(animationsList);
    } catch (error) {
      console.error("Error fetching animations:", error);
      res.status(500).json({ error: "Failed to fetch animations" });
    }
  });

  app.get("/api/animations/:id", async (req, res) => {
    try {
      const animation = await storage.getAnimation(req.params.id);
      if (!animation) {
        return res.status(404).json({ error: "Animation not found" });
      }
      res.json(animation);
    } catch (error) {
      console.error("Error fetching animation:", error);
      res.status(500).json({ error: "Failed to fetch animation" });
    }
  });

  app.post("/api/animations", async (req, res) => {
    try {
      const validatedData = insertAnimationSchema.parse(req.body);
      const animation = await storage.createAnimation(validatedData);
      res.status(201).json(animation);
    } catch (error) {
      console.error("Error creating animation:", error);
      res.status(400).json({ error: "Invalid animation data" });
    }
  });

  app.patch("/api/animations/:id", async (req, res) => {
    try {
      const partialData = insertAnimationSchema.partial().parse(req.body);
      const animation = await storage.updateAnimation(req.params.id, partialData);
      if (!animation) {
        return res.status(404).json({ error: "Animation not found" });
      }
      res.json(animation);
    } catch (error) {
      console.error("Error updating animation:", error);
      res.status(400).json({ error: "Invalid animation data" });
    }
  });

  app.delete("/api/animations/:id", async (req, res) => {
    try {
      const success = await storage.deleteAnimation(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Animation not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting animation:", error);
      res.status(500).json({ error: "Failed to delete animation" });
    }
  });

  // ==================== Keyframes ====================
  
  app.get("/api/animations/:animationId/keyframes", async (req, res) => {
    try {
      const keyframesList = await storage.getKeyframesByAnimation(req.params.animationId);
      res.json(keyframesList);
    } catch (error) {
      console.error("Error fetching keyframes:", error);
      res.status(500).json({ error: "Failed to fetch keyframes" });
    }
  });

  app.get("/api/keyframes/:id", async (req, res) => {
    try {
      const keyframe = await storage.getKeyframe(req.params.id);
      if (!keyframe) {
        return res.status(404).json({ error: "Keyframe not found" });
      }
      res.json(keyframe);
    } catch (error) {
      console.error("Error fetching keyframe:", error);
      res.status(500).json({ error: "Failed to fetch keyframe" });
    }
  });

  app.post("/api/keyframes", async (req, res) => {
    try {
      const validatedData = insertKeyframeSchema.parse(req.body);
      const keyframe = await storage.createKeyframe(validatedData);
      res.status(201).json(keyframe);
    } catch (error) {
      console.error("Error creating keyframe:", error);
      res.status(400).json({ error: "Invalid keyframe data" });
    }
  });

  app.patch("/api/keyframes/:id", async (req, res) => {
    try {
      const partialData = insertKeyframeSchema.partial().parse(req.body);
      const keyframe = await storage.updateKeyframe(req.params.id, partialData);
      if (!keyframe) {
        return res.status(404).json({ error: "Keyframe not found" });
      }
      res.json(keyframe);
    } catch (error) {
      console.error("Error updating keyframe:", error);
      res.status(400).json({ error: "Invalid keyframe data" });
    }
  });

  app.delete("/api/keyframes/:id", async (req, res) => {
    try {
      const success = await storage.deleteKeyframe(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Keyframe not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting keyframe:", error);
      res.status(500).json({ error: "Failed to delete keyframe" });
    }
  });

  // ==================== Timeline Actions ====================
  
  app.get("/api/animations/:animationId/actions", async (req, res) => {
    try {
      const actionsList = await storage.getTimelineActionsByAnimation(req.params.animationId);
      res.json(actionsList);
    } catch (error) {
      console.error("Error fetching timeline actions:", error);
      res.status(500).json({ error: "Failed to fetch timeline actions" });
    }
  });

  app.get("/api/timeline-actions/:id", async (req, res) => {
    try {
      const action = await storage.getTimelineAction(req.params.id);
      if (!action) {
        return res.status(404).json({ error: "Timeline action not found" });
      }
      res.json(action);
    } catch (error) {
      console.error("Error fetching timeline action:", error);
      res.status(500).json({ error: "Failed to fetch timeline action" });
    }
  });

  app.post("/api/timeline-actions", async (req, res) => {
    try {
      const validatedData = insertTimelineActionSchema.parse(req.body);
      const action = await storage.createTimelineAction(validatedData);
      res.status(201).json(action);
    } catch (error) {
      console.error("Error creating timeline action:", error);
      res.status(400).json({ error: "Invalid timeline action data" });
    }
  });

  app.patch("/api/timeline-actions/:id", async (req, res) => {
    try {
      const partialData = insertTimelineActionSchema.partial().parse(req.body);
      const action = await storage.updateTimelineAction(req.params.id, partialData);
      if (!action) {
        return res.status(404).json({ error: "Timeline action not found" });
      }
      res.json(action);
    } catch (error) {
      console.error("Error updating timeline action:", error);
      res.status(400).json({ error: "Invalid timeline action data" });
    }
  });

  app.delete("/api/timeline-actions/:id", async (req, res) => {
    try {
      const success = await storage.deleteTimelineAction(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Timeline action not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting timeline action:", error);
      res.status(500).json({ error: "Failed to delete timeline action" });
    }
  });

  // ==================== Projects ====================
  
  app.get("/api/projects", async (_req, res) => {
    try {
      const projectsList = await storage.getAllProjects();
      res.json(projectsList);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Failed to fetch project" });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const validatedData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(validatedData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.patch("/api/projects/:id", async (req, res) => {
    try {
      const partialData = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(req.params.id, partialData);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error updating project:", error);
      res.status(400).json({ error: "Invalid project data" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const success = await storage.deleteProject(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Export project as ActivityDefinition
  app.get("/api/projects/:id/export", async (req, res) => {
    try {
      const activity = await devSyncService.exportActivity(req.params.id);
      if (!activity) {
        return res.status(404).json({ error: "Project not found" });
      }
      res.json(activity);
    } catch (error) {
      console.error("Error exporting project:", error);
      res.status(500).json({ error: "Failed to export project" });
    }
  });

  // Import activity as a new project
  app.post("/api/projects/import", async (req, res) => {
    try {
      const data = req.body;
      
      if (!data || typeof data !== 'object') {
        return res.status(400).json({ error: "Invalid JSON data" });
      }
      
      if (!data.id || typeof data.id !== 'string') {
        return res.status(400).json({ error: "Missing required field: id" });
      }
      
      if (!Array.isArray(data.screens)) {
        return res.status(400).json({ error: "Missing required field: screens (must be an array)" });
      }

      const projectName = req.query.name as string | undefined;
      const project = await storage.importActivity(data, projectName);
      
      res.status(201).json({ 
        success: true, 
        projectId: project.id,
        message: `Imported ${data.screens.length} screen(s)` 
      });
    } catch (error) {
      console.error("Error importing activity:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to import activity" });
    }
  });

  // ==================== Figma Sync ====================
  
  // Parse Figma URL to extract file key and node ID
  app.post("/api/figma/parse-url", async (req, res) => {
    try {
      const { url } = figmaUrlSchema.parse(req.body);
      const figmaPattern = /figma\.com\/(design|file)\/([a-zA-Z0-9]+)(?:\/[^?]*)?(?:\?.*node-id=([0-9]+-[0-9]+))?/;
      const match = url.match(figmaPattern);
      
      if (!match) {
        return res.status(400).json({ error: "Invalid Figma URL format" });
      }
      
      const fileKey = match[2];
      const nodeId = match[3] ? match[3].replace('-', ':') : null;
      
      res.json({ fileKey, nodeId });
    } catch (error) {
      console.error("Error parsing Figma URL:", error);
      res.status(400).json({ error: "Invalid URL" });
    }
  });

  // Connect a project to a Figma file
  app.post("/api/projects/:id/figma/connect", async (req, res) => {
    try {
      const { fileKey, pageId } = req.body;
      
      if (!fileKey) {
        return res.status(400).json({ error: "File key is required" });
      }
      
      const project = await storage.updateProject(req.params.id, {
        figmaFileKey: fileKey,
        figmaPageId: pageId || null,
        figmaLastSyncedAt: new Date()
      });
      
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }
      
      res.json(project);
    } catch (error) {
      console.error("Error connecting Figma:", error);
      res.status(500).json({ error: "Failed to connect Figma file" });
    }
  });

  // Store Figma frame data as a screen (called from frontend after MCP fetch)
  app.post("/api/projects/:projectId/figma/import-frame", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { frameId, name, width, height, imageUrl, hash } = req.body;
      
      // Check if screen already exists for this frame
      let screen = await storage.getScreenByFigmaFrame(frameId);
      
      if (screen) {
        // Update existing screen
        screen = await storage.updateScreen(screen.id, {
          title: name,
          width,
          height,
          imageUrl,
          figmaNodeHash: hash
        });
      } else {
        // Create new screen
        screen = await storage.createScreen({
          projectId,
          title: name,
          width: width || 375,
          height: height || 812,
          imageUrl,
          figmaFrameId: frameId,
          figmaNodeHash: hash
        });
      }
      
      // Update project last synced time
      await storage.updateProject(projectId, {
        figmaLastSyncedAt: new Date()
      });
      
      res.json(screen);
    } catch (error) {
      console.error("Error importing Figma frame:", error);
      res.status(500).json({ error: "Failed to import frame" });
    }
  });

  // Get screens for a project
  app.get("/api/projects/:projectId/screens", async (req, res) => {
    try {
      const screensList = await storage.getScreensByProject(req.params.projectId);
      res.json(screensList);
    } catch (error) {
      console.error("Error fetching project screens:", error);
      res.status(500).json({ error: "Failed to fetch screens" });
    }
  });

  // Store Figma node for tracking (called from frontend after MCP fetch)
  app.post("/api/projects/:projectId/figma/nodes", async (req, res) => {
    try {
      const { projectId } = req.params;
      const { nodeId, parentNodeId, screenId, name, type, hash, x, y, width, height, order } = req.body;
      
      const node = await storage.upsertFigmaNode({
        projectId,
        nodeId,
        parentNodeId,
        screenId,
        name,
        type,
        hash,
        x,
        y,
        width,
        height,
        order
      });
      
      res.json(node);
    } catch (error) {
      console.error("Error storing Figma node:", error);
      res.status(500).json({ error: "Failed to store node" });
    }
  });

  // Get all Figma nodes for a project (for diffing)
  app.get("/api/projects/:projectId/figma/nodes", async (req, res) => {
    try {
      const nodes = await storage.getFigmaNodesByProject(req.params.projectId);
      res.json(nodes);
    } catch (error) {
      console.error("Error fetching Figma nodes:", error);
      res.status(500).json({ error: "Failed to fetch nodes" });
    }
  });

  // Check if Figma API token is configured
  app.get("/api/figma/status", async (_req, res) => {
    res.json({ configured: hasFigmaToken() });
  });

  // Sync a project from Figma
  app.post("/api/projects/:projectId/figma/sync", async (req, res) => {
    try {
      const { projectId } = req.params;
      
      if (!hasFigmaToken()) {
        return res.status(400).json({ 
          error: "Figma API token not configured. Please add FIGMA_API_TOKEN to your secrets." 
        });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      if (!project.figmaFileKey) {
        return res.status(400).json({ error: "No Figma file connected to this project" });
      }

      const result = await syncFigmaProject(projectId);
      
      if (!result.success && result.errors.length > 0) {
        return res.status(400).json({ 
          error: result.errors[0],
          details: result 
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Error syncing Figma:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Sync failed" });
    }
  });

  // Sync child layers from a Figma frame as game objects
  app.post("/api/screens/:id/sync-layers", async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!hasFigmaToken()) {
        return res.status(400).json({ 
          error: "Figma API token not configured. Please add FIGMA_API_TOKEN to your secrets." 
        });
      }

      const screen = await storage.getScreen(id);
      if (!screen) {
        return res.status(404).json({ error: "Screen not found" });
      }

      if (!screen.figmaFrameId) {
        return res.status(400).json({ error: "Screen has no associated Figma frame" });
      }

      const result = await syncFigmaLayers(id, screen.figmaFrameId);
      
      if (!result.success && result.errors.length > 0) {
        return res.status(400).json({ 
          error: result.errors[0],
          details: result 
        });
      }

      res.json(result);
    } catch (error) {
      console.error("Error syncing Figma layers:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Layer sync failed" });
    }
  });

  // ==================== Feature Help Routes ====================

  // Get all feature help items
  app.get("/api/feature-help", async (_req, res) => {
    try {
      const helpItems = await storage.getAllFeatureHelp();
      res.json(helpItems);
    } catch (error) {
      console.error("Error fetching feature help:", error);
      res.status(500).json({ error: "Failed to fetch feature help" });
    }
  });

  // Get feature help by category
  app.get("/api/feature-help/category/:category", async (req, res) => {
    try {
      const helpItems = await storage.getFeatureHelpByCategory(req.params.category);
      res.json(helpItems);
    } catch (error) {
      console.error("Error fetching feature help by category:", error);
      res.status(500).json({ error: "Failed to fetch feature help" });
    }
  });

  // Get feature help by key
  app.get("/api/feature-help/key/:featureKey", async (req, res) => {
    try {
      const help = await storage.getFeatureHelpByKey(req.params.featureKey);
      if (!help) {
        return res.status(404).json({ error: "Feature help not found" });
      }
      res.json(help);
    } catch (error) {
      console.error("Error fetching feature help:", error);
      res.status(500).json({ error: "Failed to fetch feature help" });
    }
  });

  // Get feature help analytics
  // NOTE: This route must come BEFORE /api/feature-help/:id to avoid matching "analytics" as an ID
  app.get("/api/feature-help/analytics", async (_req, res) => {
    try {
      const analytics = await storage.getFeatureHelpAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Export all feature help content (for synchronization with host application)
  // NOTE: This route must come BEFORE /api/feature-help/:id to avoid matching "export" as an ID
  app.get("/api/feature-help/export", async (_req, res) => {
    try {
      const helpItems = await storage.getAllFeatureHelp();
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        source: "indigamate-studio",
        items: helpItems.map(item => ({
          featureKey: item.featureKey,
          title: item.title,
          description: item.description,
          videoUrl: item.videoUrl,
          thumbnailUrl: item.thumbnailUrl,
          category: item.category,
          shortcutKey: item.shortcutKey,
          relatedFeatures: item.relatedFeatures,
          order: item.order,
          isNew: item.isNew,
        })),
      };
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting feature help:", error);
      res.status(500).json({ error: "Failed to export feature help" });
    }
  });

  // Get a single feature help item
  app.get("/api/feature-help/:id", async (req, res) => {
    try {
      const help = await storage.getFeatureHelp(req.params.id);
      if (!help) {
        return res.status(404).json({ error: "Feature help not found" });
      }
      res.json(help);
    } catch (error) {
      console.error("Error fetching feature help:", error);
      res.status(500).json({ error: "Failed to fetch feature help" });
    }
  });

  // Create feature help
  app.post("/api/feature-help", async (req, res) => {
    try {
      const validatedData = insertFeatureHelpSchema.parse(req.body);
      const help = await storage.createFeatureHelp(validatedData);
      res.status(201).json(help);
    } catch (error) {
      console.error("Error creating feature help:", error);
      res.status(400).json({ error: "Invalid feature help data" });
    }
  });

  // Update feature help
  app.patch("/api/feature-help/:id", async (req, res) => {
    try {
      const partialData = insertFeatureHelpSchema.partial().parse(req.body);
      const help = await storage.updateFeatureHelp(req.params.id, partialData);
      if (!help) {
        return res.status(404).json({ error: "Feature help not found" });
      }
      res.json(help);
    } catch (error) {
      console.error("Error updating feature help:", error);
      res.status(400).json({ error: "Invalid feature help data" });
    }
  });

  // Delete feature help
  app.delete("/api/feature-help/:id", async (req, res) => {
    try {
      const success = await storage.deleteFeatureHelp(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Feature help not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting feature help:", error);
      res.status(500).json({ error: "Failed to delete feature help" });
    }
  });

  // Import feature help content (from external sources)
  app.post("/api/feature-help/import", async (req, res) => {
    try {
      const { source, items } = req.body;
      
      if (!items || !Array.isArray(items)) {
        return res.status(400).json({ error: "items must be an array" });
      }

      let imported = 0;
      let updated = 0;
      let skipped = 0;

      for (const item of items) {
        if (!item.featureKey || !item.title || !item.description || !item.category) {
          skipped++;
          continue;
        }

        // Check if help item exists by featureKey
        const existing = await storage.getFeatureHelpByKey(item.featureKey);
        
        if (existing) {
          // Update existing item
          await storage.updateFeatureHelp(existing.id, {
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl || existing.videoUrl,
            thumbnailUrl: item.thumbnailUrl || existing.thumbnailUrl,
            category: item.category,
            shortcutKey: item.shortcutKey,
            relatedFeatures: item.relatedFeatures,
            order: item.order,
            isNew: item.isNew ?? existing.isNew,
          });
          updated++;
        } else {
          // Create new item
          await storage.createFeatureHelp({
            featureKey: item.featureKey,
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl || null,
            thumbnailUrl: item.thumbnailUrl || null,
            category: item.category,
            shortcutKey: item.shortcutKey || null,
            relatedFeatures: item.relatedFeatures || [],
            order: item.order ?? 0,
            isNew: item.isNew ?? true,
          });
          imported++;
        }
      }

      console.log(`Feature help import from ${source || 'unknown'}: ${imported} imported, ${updated} updated, ${skipped} skipped`);
      
      res.json({
        success: true,
        source: source || "unknown",
        imported,
        updated,
        skipped,
      });
    } catch (error) {
      console.error("Error importing feature help:", error);
      res.status(500).json({ error: "Failed to import feature help" });
    }
  });

  // Sync feature help content from the built-in registry
  app.post("/api/feature-help/sync-from-registry", async (_req, res) => {
    try {
      const { featureHelpRegistry, videoDurationGuidelines } = await import("@shared/feature-help-registry");
      
      let imported = 0;
      let updated = 0;

      for (const feature of featureHelpRegistry) {
        // Check if help item exists by featureKey
        const existing = await storage.getFeatureHelpByKey(feature.featureKey);
        
        // Determine video type based on duration target
        const isOverview = feature.videoType === 'overview';
        
        if (existing) {
          // Update existing item (preserve video URL if set)
          await storage.updateFeatureHelp(existing.id, {
            title: feature.title,
            description: feature.description,
            category: feature.category,
            shortcutKey: feature.shortcutKey || null,
            relatedFeatures: feature.relatedFeatures || [],
            order: feature.order ?? 0,
          });
          updated++;
        } else {
          // Create new item
          await storage.createFeatureHelp({
            featureKey: feature.featureKey,
            title: feature.title,
            description: feature.description,
            videoUrl: null,
            thumbnailUrl: null,
            category: feature.category,
            shortcutKey: feature.shortcutKey || null,
            relatedFeatures: feature.relatedFeatures || [],
            order: feature.order ?? 0,
            isNew: true,
          });
          imported++;
        }
      }

      console.log(`Feature help sync from registry: ${imported} imported, ${updated} updated`);
      
      res.json({
        success: true,
        source: "feature-help-registry",
        totalInRegistry: featureHelpRegistry.length,
        imported,
        updated,
        guidelines: videoDurationGuidelines,
      });
    } catch (error) {
      console.error("Error syncing feature help from registry:", error);
      res.status(500).json({ error: "Failed to sync feature help from registry" });
    }
  });

  // Record a view for a feature help topic (for analytics)
  app.post("/api/feature-help/:featureKey/view", async (req, res) => {
    try {
      const help = await storage.incrementFeatureHelpView(req.params.featureKey);
      if (!help) {
        return res.status(404).json({ error: "Feature help not found" });
      }
      res.json({ success: true, viewCount: help.viewCount });
    } catch (error) {
      console.error("Error recording view:", error);
      res.status(500).json({ error: "Failed to record view" });
    }
  });

  // ==================== Video Candidates ====================
  
  // Get all video candidates
  app.get("/api/video-candidates", async (_req, res) => {
    try {
      const candidates = await storage.getAllVideoCandidates();
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching video candidates:", error);
      res.status(500).json({ error: "Failed to fetch video candidates" });
    }
  });

  // Get video candidates by status (pending, approved, rejected)
  app.get("/api/video-candidates/status/:status", async (req, res) => {
    try {
      const candidates = await storage.getVideoCandidatesByStatus(req.params.status);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching video candidates by status:", error);
      res.status(500).json({ error: "Failed to fetch video candidates" });
    }
  });

  // Get video candidates by feature key
  app.get("/api/video-candidates/feature/:featureKey", async (req, res) => {
    try {
      const candidates = await storage.getVideoCandidatesByFeatureKey(req.params.featureKey);
      res.json(candidates);
    } catch (error) {
      console.error("Error fetching video candidates by feature key:", error);
      res.status(500).json({ error: "Failed to fetch video candidates" });
    }
  });

  // Get a single video candidate
  app.get("/api/video-candidates/:id", async (req, res) => {
    try {
      const candidate = await storage.getVideoCandidate(req.params.id);
      if (!candidate) {
        return res.status(404).json({ error: "Video candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error fetching video candidate:", error);
      res.status(500).json({ error: "Failed to fetch video candidate" });
    }
  });

  // Create video candidate (for test recordings)
  app.post("/api/video-candidates", async (req, res) => {
    try {
      const validatedData = insertHelpVideoCandidateSchema.parse(req.body);
      
      // Create the candidate first
      const candidate = await storage.createVideoCandidate(validatedData);
      
      // Try to extract thumbnail and duration from the video
      if (candidate.videoUrl) {
        const videoPath = candidate.videoUrl.startsWith("/") 
          ? candidate.videoUrl.slice(1) 
          : candidate.videoUrl;
        
        const thumbnailResult = await extractThumbnailFromVideo(videoPath);
        
        if (thumbnailResult) {
          // Update candidate with thumbnail and duration
          const updatedCandidate = await storage.updateVideoCandidate(candidate.id, {
            thumbnailUrl: thumbnailResult.thumbnailUrl,
            duration: thumbnailResult.duration
          });
          
          if (updatedCandidate) {
            return res.status(201).json(updatedCandidate);
          }
        }
      }
      
      res.status(201).json(candidate);
    } catch (error) {
      console.error("Error creating video candidate:", error);
      res.status(400).json({ error: "Invalid video candidate data" });
    }
  });

  // Approve video candidate and link to help item
  app.post("/api/video-candidates/:id/approve", async (req, res) => {
    try {
      const { approvedBy } = req.body;
      const candidate = await storage.approveVideoCandidate(req.params.id, approvedBy || "admin");
      if (!candidate) {
        return res.status(404).json({ error: "Video candidate not found" });
      }
      
      // Update or create the linked feature help item with the video URL
      const helpItem = await storage.getFeatureHelpByKey(candidate.featureKey);
      if (helpItem) {
        // Update existing help topic with new video
        await storage.updateFeatureHelp(helpItem.id, {
          videoUrl: candidate.videoUrl,
          thumbnailUrl: candidate.thumbnailUrl || undefined,
        });
        console.log(`Updated help topic "${candidate.featureKey}" with video: ${candidate.videoUrl}`);
      } else {
        // Auto-create help topic from feature registry if it doesn't exist
        const { getFeatureConfig } = await import("@shared/feature-help-registry");
        const featureConfig = getFeatureConfig(candidate.featureKey);
        
        if (featureConfig) {
          await storage.createFeatureHelp({
            featureKey: featureConfig.featureKey,
            title: featureConfig.title,
            description: featureConfig.description,
            category: featureConfig.category,
            shortcutKey: featureConfig.shortcutKey || null,
            videoUrl: candidate.videoUrl,
            thumbnailUrl: candidate.thumbnailUrl || null,
            order: 0,
            isNew: true,
          });
          console.log(`Auto-created help topic "${candidate.featureKey}" with video: ${candidate.videoUrl}`);
        } else {
          console.log(`No feature config found for "${candidate.featureKey}", video approved without help topic link`);
        }
      }
      
      res.json(candidate);
    } catch (error) {
      console.error("Error approving video candidate:", error);
      res.status(500).json({ error: "Failed to approve video candidate" });
    }
  });

  // Reject video candidate
  app.post("/api/video-candidates/:id/reject", async (req, res) => {
    try {
      const { reason } = req.body;
      const candidate = await storage.rejectVideoCandidate(req.params.id, reason || "Rejected");
      if (!candidate) {
        return res.status(404).json({ error: "Video candidate not found" });
      }
      res.json(candidate);
    } catch (error) {
      console.error("Error rejecting video candidate:", error);
      res.status(500).json({ error: "Failed to reject video candidate" });
    }
  });

  // Delete video candidate
  app.delete("/api/video-candidates/:id", async (req, res) => {
    try {
      const success = await storage.deleteVideoCandidate(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Video candidate not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting video candidate:", error);
      res.status(500).json({ error: "Failed to delete video candidate" });
    }
  });

  // ==================== NACA Proxy Routes ====================
  // These routes proxy requests to an external NACA server to avoid CORS issues
  
  // NACA server environment configurations - ALLOWLIST for security
  // Note: Production uses naca.community (non-www) - www doesn't have valid SSL
  const NACA_SERVERS: Record<string, string> = {
    development: 'https://native-tongue-lexicon-brandon612.replit.app',
    production: 'https://naca.community',
  };
  
  // Create reverse lookup for URL validation
  const ALLOWED_NACA_URLS = new Set(Object.values(NACA_SERVERS));
  
  // Helper function to extract subdomain from NACA server URL
  // For replit.app: https://native-tongue-lexicon-brandon612.replit.app -> native-tongue-lexicon-brandon612
  // For naca.community: https://www.naca.community -> www, https://naca.community -> (empty)
  function extractSubdomainFromUrl(url: string): string {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname;
      
      // For replit.app domains, extract everything before .replit.app
      if (hostname.endsWith('.replit.app')) {
        return hostname.replace('.replit.app', '');
      }
      
      // For naca.community domains, extract subdomain if present
      if (hostname.endsWith('.naca.community')) {
        return hostname.replace('.naca.community', '');
      }
      
      // For bare naca.community (no subdomain)
      if (hostname === 'naca.community') {
        return '';
      }
      
      // Fallback: return empty string
      return '';
    } catch {
      return '';
    }
  }
  
  // Check if env variable is set (takes priority and is immutable)
  const nacaEnvConfigured = !!process.env.NACA_API_URL;
  
  // Initialize from environment or default to production server
  // Production is the stable server with public communities endpoint
  let nacaBaseUrl = process.env.NACA_API_URL || NACA_SERVERS.production;
  // Derive subdomain from the server URL
  let nacaSubdomain = extractSubdomainFromUrl(nacaBaseUrl); 
  let nacaCommunityId = ""; // Will be populated from API response
  
  // Get NACA API key from environment for authentication (fallback only)
  const nacaApiKeyRaw = process.env.ACTIVITY_EDITOR_API_KEY || "";
  const nacaEnvApiKey = nacaApiKeyRaw.replace(/[\u2018\u2019\u201C\u201D]/g, "'");
  
  // Database-stored API key (persists across server restarts)
  let nacaDatabaseApiKey = "";
  
  // Flag to disable database API key (env key is always available as fallback)
  let nacaDatabaseKeyDisabled = false;
  
  // Load API key from database on startup
  (async () => {
    try {
      const settings = await storage.getAppSettings();
      if (settings?.nacaApiKey) {
        nacaDatabaseApiKey = settings.nacaApiKey;
        console.log(`[NACA Proxy] API key loaded from database`);
      }
      // Check if database key was explicitly disabled (doesn't affect env key)
      if (settings?.nacaApiKeyDisabled) {
        nacaDatabaseKeyDisabled = true;
        console.log(`[NACA Proxy] Database API key disabled by user (env key still available)`);
      }
    } catch (error) {
      console.error("[NACA Proxy] Failed to load API key from database:", error);
    }
  })();
  
  // Function to get current active API key
  // Priority: database key (if not disabled) > environment key (always available)
  const getActiveNacaApiKey = () => {
    // Database key takes priority if it exists and isn't disabled
    if (nacaDatabaseApiKey && !nacaDatabaseKeyDisabled) {
      return nacaDatabaseApiKey;
    }
    // Environment key is always available as fallback
    return nacaEnvApiKey;
  };
  
  console.log(`[NACA Proxy] Default server: ${nacaBaseUrl} (env-locked: ${nacaEnvConfigured})`);
  if (nacaEnvApiKey) {
    console.log(`[NACA Proxy] API key configured from env`);
  }
  
  // Set NACA server URL - client can switch between dev/prod (only allowlisted URLs)
  // Subdomain can be auto-extracted from URL or explicitly provided by user
  app.post("/api/naca-proxy/config", async (req, res) => {
    try {
      const { baseUrl, subdomain } = req.body;
      
      // If env variable is set, URL is immutable
      if (nacaEnvConfigured) {
        console.log(`[NACA Proxy] Env-locked URL: ${nacaBaseUrl}, subdomain: ${nacaSubdomain}`);
        res.json({ success: true, baseUrl: nacaBaseUrl, subdomain: nacaSubdomain, envLocked: true });
        return;
      }
      
      // Validate URL against allowlist to prevent SSRF
      if (baseUrl && typeof baseUrl === 'string') {
        const normalizedUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
        if (!ALLOWED_NACA_URLS.has(normalizedUrl)) {
          console.warn(`[NACA Proxy] Rejected non-allowlisted URL: ${normalizedUrl}`);
          return res.status(400).json({ 
            error: "Invalid NACA server URL", 
            message: "Only configured development and production servers are allowed" 
          });
        }
        nacaBaseUrl = normalizedUrl;
      }
      
      // Use custom subdomain if provided, otherwise auto-extract from URL
      if (subdomain !== undefined && typeof subdomain === 'string') {
        nacaSubdomain = subdomain.trim();
        console.log(`[NACA Proxy] Using custom subdomain: ${nacaSubdomain}`);
      } else if (baseUrl) {
        // Auto-extract subdomain from the URL only if URL changed and no subdomain was specified
        nacaSubdomain = extractSubdomainFromUrl(nacaBaseUrl);
        console.log(`[NACA Proxy] Auto-extracted subdomain: ${nacaSubdomain}`);
      }
      
      console.log(`[NACA Proxy] Config updated - URL: ${nacaBaseUrl}, subdomain: ${nacaSubdomain}`);
      res.json({ success: true, baseUrl: nacaBaseUrl, subdomain: nacaSubdomain, envLocked: false });
    } catch (error) {
      console.error("Error setting NACA config:", error);
      res.status(500).json({ error: "Failed to set NACA configuration" });
    }
  });
  
  // Get NACA server URL
  app.get("/api/naca-proxy/config", async (_req, res) => {
    res.json({ 
      baseUrl: nacaBaseUrl, 
      subdomain: nacaSubdomain, 
      configured: !!nacaBaseUrl,
      envLocked: nacaEnvConfigured,
      availableServers: NACA_SERVERS,
      hasApiKey: !!getActiveNacaApiKey(),
      apiKeyDisabled: nacaDatabaseKeyDisabled && !nacaEnvApiKey,
      apiKeySource: nacaDatabaseApiKey && !nacaDatabaseKeyDisabled ? 'database' : (nacaEnvApiKey ? 'environment' : 'none')
    });
  });
  
  // Set API key (persisted to database)
  // This allows users to set API keys that persist across server restarts
  app.post("/api/naca-proxy/set-api-key", async (req, res) => {
    try {
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ error: "API key is required" });
      }
      
      // Validate API key is not too short
      if (apiKey.trim().length < 8) {
        return res.status(400).json({ 
          error: "Invalid API key format", 
          message: "API key is too short" 
        });
      }
      
      // Store the key in database (persists across restarts)
      // Also re-enable database API key if it was disabled
      const trimmedKey = apiKey.trim();
      await storage.saveAppSettings({ nacaApiKey: trimmedKey, nacaApiKeyDisabled: false });
      nacaDatabaseApiKey = trimmedKey;
      nacaDatabaseKeyDisabled = false;
      
      console.log(`[NACA Proxy] API key saved to database (source: UI)`);
      res.json({ success: true, message: "API key saved successfully" });
    } catch (error) {
      console.error("Error setting API key:", error);
      res.status(500).json({ error: "Failed to set API key" });
    }
  });
  
  // Clear database API key (environment key remains available as fallback)
  app.delete("/api/naca-proxy/set-api-key", async (_req, res) => {
    try {
      // Clear database key only (env key is always available as fallback)
      await storage.saveAppSettings({ nacaApiKey: null, nacaApiKeyDisabled: true });
      nacaDatabaseApiKey = "";
      nacaDatabaseKeyDisabled = true;
      console.log(`[NACA Proxy] Database API key cleared (env key still available if configured)`);
      res.json({ success: true, message: "Database API key cleared" });
    } catch (error) {
      console.error("Error clearing API key:", error);
      res.status(500).json({ error: "Failed to clear API key" });
    }
  });

  // ============================================================================
  // NACA Remote API Documentation Monitor
  // ============================================================================
  
  // Fetch remote NACA API documentation
  app.get("/api/naca-api/docs", async (_req, res) => {
    try {
      if (!nacaBaseUrl) {
        return res.status(400).json({ 
          available: false, 
          error: "NACA server not configured" 
        });
      }
      
      const targetUrl = `${nacaBaseUrl}/api/docs/activity-editor`;
      console.log(`[NACA API Docs] Fetching from: ${targetUrl}`);
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'ActivityEditor/1.0',
        },
      });
      
      if (!response.ok) {
        console.error(`[NACA API Docs] Remote server returned ${response.status}`);
        return res.status(response.status).json({
          available: false,
          error: `Remote server returned ${response.status}`,
          status: response.status,
        });
      }
      
      const remoteDocs = await response.json();
      
      // Extract key information from the remote docs
      const docInfo = {
        available: true,
        version: remoteDocs.jsonPayload?.apiVersion || remoteDocs.version || 'unknown',
        codeHash: remoteDocs.jsonPayload?.schemaHash || remoteDocs.schemaHash || null,
        lastUpdated: remoteDocs.lastUpdated || remoteDocs.jsonPayload?.generatedAt || null,
        endpointCount: remoteDocs.jsonPayload?.endpoints?.length || 0,
        categories: [...new Set(remoteDocs.jsonPayload?.endpoints?.map((e: { category: string }) => e.category) || [])],
        websocketTopics: remoteDocs.jsonPayload?.websocketTopics || [],
        rawPayload: remoteDocs.jsonPayload || remoteDocs,
      };
      
      // Update stored remote version info
      await storage.saveAppSettings({
        nacaRemoteVersion: docInfo.version,
        nacaRemoteCodeHash: docInfo.codeHash || undefined,
        nacaRemoteLastFetched: new Date(),
      });
      
      console.log(`[NACA API Docs] Retrieved version ${docInfo.version}, ${docInfo.endpointCount} endpoints`);
      res.json(docInfo);
    } catch (error) {
      console.error("[NACA API Docs] Error fetching remote docs:", error);
      res.status(503).json({
        available: false,
        error: error instanceof Error ? error.message : "Failed to fetch remote API documentation",
        connectionError: true,
      });
    }
  });
  
  // Compare remote API docs with stored version
  app.get("/api/naca-api/compare", async (_req, res) => {
    try {
      // Get stored settings
      const settings = await storage.getAppSettings();
      
      if (!nacaBaseUrl) {
        return res.status(400).json({
          available: false,
          error: "NACA server not configured",
          hasChanges: false,
        });
      }
      
      // Fetch remote docs
      const targetUrl = `${nacaBaseUrl}/api/docs/activity-editor`;
      console.log(`[NACA API Compare] Fetching from: ${targetUrl}`);
      
      let remoteDocs;
      try {
        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'ActivityEditor/1.0',
          },
        });
        
        if (!response.ok) {
          return res.status(response.status).json({
            available: false,
            error: `Remote server returned ${response.status}`,
            hasChanges: false,
          });
        }
        
        remoteDocs = await response.json();
      } catch (fetchError) {
        return res.status(503).json({
          available: false,
          error: fetchError instanceof Error ? fetchError.message : "Connection failed",
          connectionError: true,
          hasChanges: false,
        });
      }
      
      // Extract remote info
      const remoteVersion = remoteDocs.jsonPayload?.apiVersion || remoteDocs.version || 'unknown';
      const remoteCodeHash = remoteDocs.jsonPayload?.schemaHash || remoteDocs.schemaHash || null;
      const remoteEndpoints = remoteDocs.jsonPayload?.endpoints || [];
      const remoteWebsocketTopics = remoteDocs.jsonPayload?.websocketTopics || [];
      
      // Get stored version info
      const storedVersion = settings?.nacaRemoteVersion || null;
      const storedCodeHash = settings?.nacaRemoteCodeHash || null;
      const reviewedAt = settings?.nacaRemoteReviewedAt || null;
      const lastFetched = settings?.nacaRemoteLastFetched || null;
      
      // Determine if there are changes
      const versionChanged = storedVersion !== null && storedVersion !== remoteVersion;
      const hashChanged = storedCodeHash !== null && storedCodeHash !== remoteCodeHash;
      const hasChanges = versionChanged || hashChanged;
      
      // Check if changes were already reviewed
      const needsReview = hasChanges && (!reviewedAt || (lastFetched && new Date(lastFetched) > new Date(reviewedAt)));
      
      // Build changes object if there are differences
      const changes: {
        newEndpoints?: string[];
        removedEndpoints?: string[];
        changedSchemas?: string[];
        newWebsocketTopics?: string[];
      } = {};
      
      if (hasChanges) {
        // Compare endpoints if we have previous data
        // Since we don't store full endpoint list, we just report the current state
        changes.newEndpoints = remoteEndpoints.map((e: { method: string; path: string }) => `${e.method} ${e.path}`);
        changes.newWebsocketTopics = remoteWebsocketTopics.map((t: { name: string }) => t.name);
      }
      
      // Update stored version after comparison
      await storage.saveAppSettings({
        nacaRemoteVersion: remoteVersion,
        nacaRemoteCodeHash: remoteCodeHash || undefined,
        nacaRemoteLastFetched: new Date(),
      });
      
      const result = {
        available: true,
        version: remoteVersion,
        codeHash: remoteCodeHash,
        lastUpdated: remoteDocs.lastUpdated || remoteDocs.jsonPayload?.generatedAt || null,
        endpointCount: remoteEndpoints.length,
        categories: [...new Set(remoteEndpoints.map((e: { category: string }) => e.category))],
        websocketTopicCount: remoteWebsocketTopics.length,
        hasChanges: needsReview,
        changes: needsReview ? changes : undefined,
        storedVersion,
        storedCodeHash,
        reviewedAt: reviewedAt?.toISOString() || null,
        lastFetched: lastFetched?.toISOString() || null,
      };
      
      console.log(`[NACA API Compare] Version: ${remoteVersion}, Changes: ${needsReview}`);
      res.json(result);
    } catch (error) {
      console.error("[NACA API Compare] Error:", error);
      res.status(500).json({
        available: false,
        error: error instanceof Error ? error.message : "Failed to compare API documentation",
        hasChanges: false,
      });
    }
  });
  
  // Mark remote API changes as reviewed
  app.post("/api/naca-api/mark-reviewed", async (_req, res) => {
    try {
      await storage.saveAppSettings({
        nacaRemoteReviewedAt: new Date(),
      });
      
      console.log(`[NACA API Docs] Changes marked as reviewed`);
      res.json({
        success: true,
        reviewedAt: new Date().toISOString(),
        message: "API changes marked as reviewed",
      });
    } catch (error) {
      console.error("[NACA API Docs] Error marking reviewed:", error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Failed to mark as reviewed",
      });
    }
  });
  
  // ============================================================================
  // Editor-Host Negotiation Protocol - REST Endpoints
  // ============================================================================
  
  // Get host capabilities - allows external editors to discover what this host supports
  // This is the REST equivalent of the WebSocket capabilities_request message
  app.get("/api/activity-editor/capabilities", async (req, res) => {
    const editorOrigin = req.headers.origin || req.headers.referer || 'unknown';
    const editorVersion = req.headers['x-editor-version'] || '1.0.0';
    
    console.log(`[Capabilities] Request from origin: ${editorOrigin}, version: ${editorVersion}`);
    
    // Use APP_BASE_URL for absolute URLs in capabilities
    const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
    const wsProtocol = appBaseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = appBaseUrl.replace(/^https?:/, wsProtocol + ':');
    
    // Return host capabilities with absolute URLs
    const capabilities = {
      version: "1.0.0",
      apiVersion: "1.0.0",
      baseUrl: appBaseUrl,
      websocketUrl: `${wsBaseUrl}/ws/dev-sync`,
      auth: {
        methods: ['api_key', 'session', 'none'],
        headerNames: ['Authorization', 'X-API-Key'],
        requiresAuth: false,
      },
      subdomain: {
        extraction: 'header',  // We prefer header-based subdomain extraction
        headerNames: ['X-Community-Subdomain', 'X-Subdomain', 'X-Community-Id'],
        allowOverride: true,  // External editors can override subdomain
        defaultCommunity: null,
      },
      cors: {
        allowExternalOrigins: true,
        allowedOrigins: ['https://create.naca.community', 'https://naca.community'],
      },
      features: [
        'activity_sync',
        'vocabulary_push', 
        'media_library',
        'dictionary_sync',
        'help_content_sync',
        'preview_request',
        'real_time_updates',
        'editor_negotiation',
      ],
      schemaVersions: {
        activity: "1.0.0",
        vocabulary: "1.0.0",
        media: "1.0.0",
      },
      endpoints: {
        websocket: `${wsBaseUrl}/ws/dev-sync`,
        capabilities: `${appBaseUrl}/api/activity-editor/capabilities`,
        negotiate: `${appBaseUrl}/api/activity-editor/negotiate`,
        communities: `${appBaseUrl}/api/activity-editor/communities`,
      },
    };
    
    res.json({
      success: true,
      capabilities,
      serverTime: new Date().toISOString(),
      message: "Host capabilities retrieved successfully",
    });
  });
  
  // Negotiate connection - allows external editor to establish configuration
  app.post("/api/activity-editor/negotiate", async (req, res) => {
    try {
      const { 
        editorVersion, 
        editorOrigin, 
        requestedSubdomain, 
        preferredAuthMethod 
      } = req.body;
      
      console.log(`[Negotiate] Request from editor: ${editorVersion}, origin: ${editorOrigin}, subdomain: ${requestedSubdomain}`);
      
      // Determine the best auth method
      const supportedMethods = ['api_key', 'session', 'none'];
      let authMethod = 'none';
      if (preferredAuthMethod && supportedMethods.includes(preferredAuthMethod)) {
        authMethod = preferredAuthMethod;
      }
      
      // Accept the requested subdomain
      const subdomain = requestedSubdomain || '';
      
      // If subdomain was requested, update our proxy config
      if (subdomain) {
        nacaSubdomain = subdomain;
        console.log(`[Negotiate] Subdomain configured: ${subdomain}`);
      }
      
      // Use absolute URLs from APP_BASE_URL
      const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
      const wsProtocol = appBaseUrl.startsWith('https') ? 'wss' : 'ws';
      const wsBaseUrl = appBaseUrl.replace(/^https?:/, wsProtocol + ':');
      
      res.json({
        success: true,
        configuration: {
          subdomain,
          authMethod,
          authHeaders: authMethod === 'api_key' ? { Authorization: 'Bearer <your-api-key>' } : {},
          baseUrl: appBaseUrl,
          websocketUrl: `${wsBaseUrl}/ws/dev-sync`,
        },
        capabilities: {
          version: "1.0.0",
          apiVersion: "1.0.0",
          baseUrl: appBaseUrl,
          websocketUrl: `${wsBaseUrl}/ws/dev-sync`,
          subdomain: {
            extraction: 'header',
            headerNames: ['X-Community-Subdomain', 'X-Subdomain', 'X-Community-Id'],
            allowOverride: true,
          },
        },
        message: `Connection negotiated successfully. Subdomain: ${subdomain || '(none)'}`,
      });
    } catch (error) {
      console.error("Error during negotiation:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to negotiate connection" 
      });
    }
  });
  
  // Configure subdomain via REST (alternative to WebSocket)
  app.post("/api/activity-editor/configure-subdomain", async (req, res) => {
    try {
      const { subdomain, communityId } = req.body;
      
      if (!subdomain && !communityId) {
        return res.status(400).json({ 
          success: false, 
          error: "Either subdomain or communityId is required" 
        });
      }
      
      // Validate subdomain format if provided: alphanumeric with dashes, max 63 chars
      if (subdomain) {
        if (subdomain.length > 63) {
          return res.status(400).json({
            success: false,
            error: "Subdomain must be 63 characters or less"
          });
        }
        // Must be alphanumeric with dashes allowed, cannot start or end with dash
        const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
        if (!subdomainRegex.test(subdomain)) {
          return res.status(400).json({
            success: false,
            error: "Invalid subdomain format. Must be alphanumeric with dashes allowed, cannot start or end with dash."
          });
        }
      }
      
      // Update the proxy subdomain
      if (subdomain) {
        nacaSubdomain = subdomain;
      }
      if (communityId) {
        nacaCommunityId = communityId;
      }
      
      console.log(`[Configure Subdomain] Updated: subdomain=${nacaSubdomain}, communityId=${nacaCommunityId}`);
      
      res.json({
        success: true,
        subdomain: nacaSubdomain,
        communityId: nacaCommunityId,
        message: `Subdomain configured to: ${nacaSubdomain}`,
      });
    } catch (error) {
      console.error("Error configuring subdomain:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to configure subdomain" 
      });
    }
  });
  
  // ============================================================================
  // End Editor-Host Negotiation Protocol
  // ============================================================================
  
  // Media proxy for NACA media files with authentication
  // Routes through /api/activity-editor/media/ endpoint per NACA API spec
  // Example: /api/naca-media/little-bird-press/images/tea.webp
  //       -> https://naca.community/api/activity-editor/media/little-bird-press/images/tea.webp
  app.get("/api/naca-media/*", async (req, res) => {
    try {
      if (!nacaBaseUrl) {
        return res.status(400).json({ error: "NACA server not configured. Set the base URL first." });
      }
      
      // Extract the media path after /api/naca-media/
      const fullPath = req.path;
      let mediaPath = fullPath.replace('/api/naca-media/', '');
      
      // Decode the URL if it was encoded
      mediaPath = decodeURIComponent(mediaPath);
      
      // Normalize the path - strip 'public/' prefix if present (NACA API doesn't need it)
      // Storage paths like "public/little-bird-press/images/tea.webp" 
      // should become "little-bird-press/images/tea.webp"
      if (mediaPath.startsWith('public/')) {
        mediaPath = mediaPath.substring(7); // Remove 'public/'
      }
      
      // Build the target URL using NACA's Activity Editor media endpoint
      // Format: {baseUrl}/api/activity-editor/media/{community}/{type}/{filename}
      let targetUrl: string;
      if (mediaPath.startsWith('http://') || mediaPath.startsWith('https://')) {
        // If it's already a full URL, use it directly
        targetUrl = mediaPath;
      } else {
        // Route through the Activity Editor media endpoint
        targetUrl = `${nacaBaseUrl}/api/activity-editor/media/${mediaPath}`;
      }
      
      console.log(`[NACA Media Proxy] GET ${targetUrl}`);
      
      // Per NACA API docs, the /api/activity-editor/media/ endpoint is publicly accessible
      // with full CORS support - no authentication required. Only send minimal headers.
      const proxyHeaders: Record<string, string> = {
        'Accept': '*/*',
      };
      
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: proxyHeaders,
      });
      
      if (!response.ok) {
        console.error(`[NACA Media Proxy] Failed: ${response.status}`);
        return res.status(response.status).json({ 
          error: "Failed to fetch media",
          status: response.status 
        });
      }
      
      // Forward content type and other relevant headers
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const cacheControl = response.headers.get('cache-control');
      
      if (contentType) {
        res.set('Content-Type', contentType);
      }
      if (contentLength) {
        res.set('Content-Length', contentLength);
      }
      if (cacheControl) {
        res.set('Cache-Control', cacheControl);
      } else {
        // Default cache control for media
        res.set('Cache-Control', 'public, max-age=3600');
      }
      
      // CORS is handled by global middleware in index.ts
      // Media requests don't need special CORS handling since
      // they go through the same allowlist as other requests
      
      // Stream the response body
      const arrayBuffer = await response.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
      
    } catch (error) {
      console.error("[NACA Media Proxy] Error:", error);
      res.status(500).json({ 
        error: "Failed to proxy media request",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ==================== API Documentation ====================
  
  // Machine-readable API documentation (JSON) for build agents
  app.get("/api/docs/activity-editor", async (_req, res) => {
    try {
      // Check for drift and rebuild if needed
      const needsRebuild = await checkForDrift();
      if (needsRebuild) {
        await saveApiDocs();
      }
      
      const doc = await storage.getApiDocsBySlug("activity-editor");
      if (!doc) {
        // Generate on first request
        await saveApiDocs();
        const newDoc = await storage.getApiDocsBySlug("activity-editor");
        if (!newDoc) {
          return res.status(500).json({ error: "Failed to generate documentation" });
        }
        return res.json({
          ...newDoc.jsonPayload,
          _meta: {
            slug: newDoc.slug,
            version: newDoc.version,
            lastUpdated: newDoc.lastUpdated,
            publishStatus: newDoc.publishStatus,
            publishedAt: newDoc.publishedAt,
            schemaHash: newDoc.schemaHash
          }
        });
      }
      
      // Return JSON payload with metadata
      res.json({
        ...doc.jsonPayload,
        _meta: {
          slug: doc.slug,
          version: doc.version,
          lastUpdated: doc.lastUpdated,
          publishStatus: doc.publishStatus,
          publishedAt: doc.publishedAt,
          schemaHash: doc.schemaHash,
          publishedToDev: doc.publishedToDev,
          publishedToProd: doc.publishedToProd
        }
      });
    } catch (error) {
      console.error("Error fetching API docs:", error);
      res.status(500).json({ error: "Failed to fetch API documentation" });
    }
  });

  // Human-readable API documentation (Markdown)
  app.get("/api/docs/activity-editor/markdown", async (_req, res) => {
    try {
      const doc = await storage.getApiDocsBySlug("activity-editor");
      if (!doc) {
        await saveApiDocs();
        const newDoc = await storage.getApiDocsBySlug("activity-editor");
        if (!newDoc || !newDoc.markdownPayload) {
          return res.status(500).json({ error: "Failed to generate documentation" });
        }
        res.type('text/markdown').send(newDoc.markdownPayload);
        return;
      }
      
      res.type('text/markdown').send(doc.markdownPayload || '# No documentation available');
    } catch (error) {
      console.error("Error fetching markdown docs:", error);
      res.status(500).json({ error: "Failed to fetch documentation" });
    }
  });

  // Force rebuild documentation
  app.post("/api/docs/activity-editor/rebuild", async (_req, res) => {
    try {
      await saveApiDocs();
      const doc = await storage.getApiDocsBySlug("activity-editor");
      res.json({ 
        success: true, 
        message: "Documentation rebuilt successfully",
        schemaHash: doc?.schemaHash,
        lastUpdated: doc?.lastUpdated
      });
    } catch (error) {
      console.error("Error rebuilding docs:", error);
      res.status(500).json({ error: "Failed to rebuild documentation" });
    }
  });

  // Get documentation status/badge info
  app.get("/api/docs/activity-editor/status", async (_req, res) => {
    try {
      const doc = await storage.getApiDocsBySlug("activity-editor");
      if (!doc) {
        return res.json({
          exists: false,
          needsRebuild: true
        });
      }
      
      const needsRebuild = await checkForDrift();
      
      res.json({
        exists: true,
        slug: doc.slug,
        version: doc.version,
        lastUpdated: doc.lastUpdated,
        publishStatus: doc.publishStatus,
        publishedAt: doc.publishedAt,
        publishedToDev: doc.publishedToDev,
        publishedToProd: doc.publishedToProd,
        schemaHash: doc.schemaHash,
        needsRebuild
      });
    } catch (error) {
      console.error("Error fetching doc status:", error);
      res.status(500).json({ error: "Failed to fetch documentation status" });
    }
  });

  // Update publish status
  app.post("/api/docs/activity-editor/publish", async (req, res) => {
    try {
      const { environment } = req.body; // 'dev', 'prod', or 'both'
      
      const doc = await storage.getApiDocsBySlug("activity-editor");
      if (!doc) {
        return res.status(404).json({ error: "Documentation not found" });
      }
      
      const now = new Date();
      const updateData: Record<string, unknown> = {
        publishStatus: "published",
        publishedAt: now
      };
      
      if (environment === 'dev' || environment === 'both') {
        updateData.publishedToDev = true;
        updateData.lastDevPublishAt = now;
      }
      if (environment === 'prod' || environment === 'both') {
        updateData.publishedToProd = true;
        updateData.lastProdPublishAt = now;
      }
      
      await storage.updateApiDocsPublishStatus(doc.id, updateData as { publishStatus: string });
      
      res.json({ 
        success: true, 
        message: `Documentation published to ${environment}`,
        publishedAt: now
      });
    } catch (error) {
      console.error("Error publishing docs:", error);
      res.status(500).json({ error: "Failed to publish documentation" });
    }
  });

  // ===== SUBDOMAIN MANAGEMENT =====
  
  // Get all subdomains
  app.get("/api/subdomains", async (_req, res) => {
    try {
      const subdomainsList = await storage.getAllSubdomains();
      res.json(subdomainsList);
    } catch (error) {
      console.error("Error fetching subdomains:", error);
      res.status(500).json({ error: "Failed to fetch subdomains" });
    }
  });

  // Get a specific subdomain
  app.get("/api/subdomains/:id", async (req, res) => {
    try {
      const subdomain = await storage.getSubdomain(req.params.id);
      if (!subdomain) {
        return res.status(404).json({ error: "Subdomain not found" });
      }
      res.json(subdomain);
    } catch (error) {
      console.error("Error fetching subdomain:", error);
      res.status(500).json({ error: "Failed to fetch subdomain" });
    }
  });

  // Create a new subdomain
  app.post("/api/subdomains", async (req, res) => {
    try {
      const { subdomain, purpose, description, targetIp, replitVerificationCode } = req.body;
      
      if (!subdomain || !purpose) {
        return res.status(400).json({ error: "subdomain and purpose are required" });
      }
      
      const parentDomain = req.body.parentDomain || "naca.community";
      const fullDomain = `${subdomain}.${parentDomain}`;
      
      // Check if subdomain already exists
      const existing = await storage.getSubdomainByName(subdomain);
      if (existing) {
        return res.status(409).json({ error: "Subdomain already exists" });
      }
      
      const newSubdomain = await storage.createSubdomain({
        subdomain,
        parentDomain,
        fullDomain,
        purpose,
        description: description || null,
        targetIp: targetIp || "34.111.179.208",
        dnsStatus: "pending",
        replitVerified: false,
        sslCertStatus: "pending",
        replitVerificationCode: replitVerificationCode || null,
        isActive: true,
        porkbunRecords: {
          aRecord: { host: subdomain, answer: targetIp || "34.111.179.208", added: false },
          txtRecord: { host: `_replit-verify.${subdomain}`, answer: replitVerificationCode || "", added: false }
        }
      });
      
      res.status(201).json(newSubdomain);
    } catch (error) {
      console.error("Error creating subdomain:", error);
      res.status(500).json({ error: "Failed to create subdomain" });
    }
  });

  // Update a subdomain
  app.patch("/api/subdomains/:id", async (req, res) => {
    try {
      const subdomain = await storage.updateSubdomain(req.params.id, req.body);
      if (!subdomain) {
        return res.status(404).json({ error: "Subdomain not found" });
      }
      res.json(subdomain);
    } catch (error) {
      console.error("Error updating subdomain:", error);
      res.status(500).json({ error: "Failed to update subdomain" });
    }
  });

  // Delete a subdomain
  app.delete("/api/subdomains/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSubdomain(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Subdomain not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting subdomain:", error);
      res.status(500).json({ error: "Failed to delete subdomain" });
    }
  });

  // Validate DNS for a subdomain
  app.post("/api/subdomains/:id/validate-dns", async (req, res) => {
    try {
      const subdomain = await storage.getSubdomain(req.params.id);
      if (!subdomain) {
        return res.status(404).json({ error: "Subdomain not found" });
      }
      
      const { execSync } = await import('child_process');
      
      // Check DNS resolution
      let resolvedIp: string | undefined;
      let dnsError: string | undefined;
      
      try {
        const result = execSync(`getent hosts ${subdomain.fullDomain}`, { encoding: 'utf-8', timeout: 10000 });
        const parts = result.trim().split(/\s+/);
        if (parts.length > 0) {
          resolvedIp = parts[0];
        }
      } catch (err) {
        dnsError = "DNS lookup failed - domain may not be configured";
      }
      
      // Check HTTP response
      let httpStatus: number | undefined;
      let httpError: string | undefined;
      
      try {
        const response = await fetch(`https://${subdomain.fullDomain}`, {
          method: 'HEAD',
          redirect: 'manual',
          signal: AbortSignal.timeout(10000)
        });
        httpStatus = response.status;
      } catch (err) {
        httpError = err instanceof Error ? err.message : "HTTP check failed";
      }
      
      // Determine overall status
      let dnsStatus: string;
      const isCorrectIp = resolvedIp === subdomain.targetIp;
      const isHttpOk = httpStatus && httpStatus >= 200 && httpStatus < 400;
      
      if (!resolvedIp) {
        dnsStatus = "pending";
      } else if (!isCorrectIp) {
        dnsStatus = "error";
      } else if (httpStatus === 404) {
        dnsStatus = "propagating"; // DNS correct but Replit hasn't verified
      } else if (isHttpOk) {
        dnsStatus = "verified";
      } else {
        dnsStatus = "error";
      }
      
      // Update subdomain status
      const checkResult = {
        resolvedIp,
        httpStatus,
        error: dnsError || httpError,
        checkedAt: new Date().toISOString()
      };
      
      const updated = await storage.updateSubdomainDnsStatus(
        subdomain.id,
        dnsStatus,
        checkResult
      );
      
      // Also update replitVerified if we got a successful response
      if (isHttpOk && updated) {
        await storage.updateSubdomain(subdomain.id, {
          replitVerified: true,
          sslCertStatus: "active"
        });
      }
      
      res.json({
        subdomain: subdomain.fullDomain,
        targetIp: subdomain.targetIp,
        resolvedIp,
        httpStatus,
        dnsStatus,
        isCorrectIp,
        isHttpOk,
        error: dnsError || httpError,
        checkedAt: checkResult.checkedAt,
        porkbunInstructions: !isCorrectIp ? {
          aRecord: {
            type: "A",
            host: subdomain.subdomain,
            answer: subdomain.targetIp
          },
          txtRecord: subdomain.replitVerificationCode ? {
            type: "TXT",
            host: `_replit-verify.${subdomain.subdomain}`,
            answer: subdomain.replitVerificationCode
          } : null
        } : null
      });
    } catch (error) {
      console.error("Error validating DNS:", error);
      res.status(500).json({ error: "Failed to validate DNS" });
    }
  });

  // Batch validate all subdomains
  app.post("/api/subdomains/validate-all", async (_req, res) => {
    try {
      const allSubdomains = await storage.getAllSubdomains();
      const results = [];
      
      for (const subdomain of allSubdomains) {
        try {
          const { execSync } = await import('child_process');
          
          let resolvedIp: string | undefined;
          try {
            const result = execSync(`getent hosts ${subdomain.fullDomain}`, { encoding: 'utf-8', timeout: 5000 });
            const parts = result.trim().split(/\s+/);
            if (parts.length > 0) {
              resolvedIp = parts[0];
            }
          } catch (err) {
            // DNS lookup failed
          }
          
          let httpStatus: number | undefined;
          try {
            const response = await fetch(`https://${subdomain.fullDomain}`, {
              method: 'HEAD',
              redirect: 'manual',
              signal: AbortSignal.timeout(5000)
            });
            httpStatus = response.status;
          } catch (err) {
            // HTTP check failed
          }
          
          const isCorrectIp = resolvedIp === subdomain.targetIp;
          const isHttpOk = httpStatus && httpStatus >= 200 && httpStatus < 400;
          
          let dnsStatus: string;
          if (!resolvedIp) {
            dnsStatus = "pending";
          } else if (!isCorrectIp) {
            dnsStatus = "error";
          } else if (httpStatus === 404) {
            dnsStatus = "propagating";
          } else if (isHttpOk) {
            dnsStatus = "verified";
          } else {
            dnsStatus = "error";
          }
          
          await storage.updateSubdomainDnsStatus(subdomain.id, dnsStatus, {
            resolvedIp,
            httpStatus,
            checkedAt: new Date().toISOString()
          });
          
          results.push({
            subdomain: subdomain.fullDomain,
            dnsStatus,
            resolvedIp,
            httpStatus,
            isCorrectIp,
            isHttpOk
          });
        } catch (err) {
          results.push({
            subdomain: subdomain.fullDomain,
            dnsStatus: "error",
            error: err instanceof Error ? err.message : "Unknown error"
          });
        }
      }
      
      res.json({ results, checkedAt: new Date().toISOString() });
    } catch (error) {
      console.error("Error batch validating DNS:", error);
      res.status(500).json({ error: "Failed to batch validate DNS" });
    }
  });

  // Generic NACA proxy - forwards requests to the NACA server
  app.all("/api/naca-proxy/*", async (req, res) => {
    try {
      if (!nacaBaseUrl) {
        return res.status(400).json({ error: "NACA server not configured. Set the base URL first." });
      }
      
      // Extract the path after /api/naca-proxy/
      const fullPath = req.path;
      const targetPath = fullPath.replace('/api/naca-proxy/', '');
      const targetUrl = `${nacaBaseUrl}/${targetPath}`;
      
      // Check if this is a communities list endpoint (bootstrap - doesn't require community context)
      const isCommunitiesEndpoint = targetPath === 'api/activity-editor/communities' || 
                                     targetPath.endsWith('/communities');
      
      console.log(`[NACA Proxy] ${req.method} ${targetUrl} (subdomain: ${nacaSubdomain}, bootstrap: ${isCommunitiesEndpoint})`);
      
      // Parse the base URL to get the host for potential Host header override
      const baseUrlParts = new URL(nacaBaseUrl);
      
      // Build headers for the proxied request
      const proxyHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      // Always send API key when available (dev server requires it even for communities list)
      // Priority: session key (from UI) > env key
      const activeApiKey = getActiveNacaApiKey();
      if (activeApiKey) {
        proxyHeaders['Authorization'] = `Bearer ${activeApiKey}`;
        console.log(`[NACA Proxy] Using API key from ${nacaDatabaseApiKey ? 'database' : 'environment'}`);
      }
      
      // For the communities list (bootstrap), don't send community headers
      // This allows the server to return all available communities
      if (!isCommunitiesEndpoint) {
        // Only send community headers for non-bootstrap endpoints
        proxyHeaders['X-Original-Host'] = baseUrlParts.host;
        if (nacaCommunityId) {
          proxyHeaders['X-Community-Id'] = nacaCommunityId;
        }
        if (nacaSubdomain) {
          proxyHeaders['X-Subdomain'] = nacaSubdomain;
          proxyHeaders['X-Community-Subdomain'] = nacaSubdomain;
        }
      }
      
      // Allow client to override with their own token if present
      const authHeader = req.headers['authorization'];
      if (authHeader && typeof authHeader === 'string') {
        proxyHeaders['Authorization'] = authHeader;
        console.log(`[NACA Proxy] Client Authorization header overrides API key`);
      }
      
      // Forward If-None-Match for conditional requests
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch && typeof ifNoneMatch === 'string') {
        proxyHeaders['If-None-Match'] = ifNoneMatch;
      }
      
      const fetchOptions: RequestInit = {
        method: req.method,
        headers: proxyHeaders,
      };
      
      // Include body for POST/PUT/PATCH requests
      if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }
      
      const response = await fetch(targetUrl, fetchOptions);
      
      // Forward the status code
      res.status(response.status);
      
      // Forward important response headers
      const etagHeader = response.headers.get('ETag');
      if (etagHeader) {
        res.set('ETag', etagHeader);
      }
      
      // Handle 304 Not Modified
      if (response.status === 304) {
        return res.end();
      }
      
      // Try to parse as JSON, fall back to text
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        res.json(data);
      } else {
        const text = await response.text();
        res.send(text);
      }
    } catch (error) {
      console.error("[NACA Proxy] Error:", error);
      res.status(500).json({ 
        error: "Failed to proxy request to NACA server",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // ========================================
  // SUBDOMAIN HEALTH CHECK ROUTES
  // Enhanced health check system for platform subdomains
  // ========================================

  // Get configuration status and list of special subdomains
  app.get("/api/admin/special-subdomains/status", async (_req, res) => {
    try {
      const config = subdomainHealth.getConfiguration();
      const specialSubdomains = subdomainHealth.getSpecialSubdomains();
      
      // Get current DNS records from Porkbun if configured
      let dnsRecords: porkbunService.DNSRecord[] = [];
      if (config.porkbunConfigured) {
        try {
          dnsRecords = await porkbunService.getDNSRecords(config.primaryDomain);
        } catch (e) {
          console.error("[SpecialSubdomains] Failed to fetch Porkbun records:", e);
        }
      }
      
      const subdomains = specialSubdomains.map(subdomain => {
        const dnsRecord = dnsRecords.find(r => 
          (r.name === subdomain || r.name === `${subdomain}.${config.primaryDomain}`) && r.type === 'A'
        );
        return {
          subdomain,
          fullDomain: `${subdomain}.${config.primaryDomain}`,
          status: dnsRecord ? 'active' : 'unknown',
          hasDns: !!dnsRecord,
          dnsIp: dnsRecord?.content || null,
          dnsRecordId: dnsRecord?.id || null,
        };
      });
      
      res.json({
        subdomains,
        configuration: config,
      });
    } catch (error) {
      console.error("[SpecialSubdomains] Error fetching status:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch status" });
    }
  });

  // Get known issues catalog
  app.get("/api/admin/special-subdomains/known-issues", async (_req, res) => {
    res.json(subdomainHealth.getKnownIssues());
  });

  // Perform health check for a single subdomain
  app.post("/api/admin/special-subdomains/:subdomain/health-check", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const specialSubdomains = subdomainHealth.getSpecialSubdomains();
      
      if (!specialSubdomains.includes(subdomain)) {
        return res.status(400).json({ 
          error: `Invalid subdomain: ${subdomain}. Valid options: ${specialSubdomains.join(', ')}`
        });
      }
      
      const result = await subdomainHealth.checkSubdomainHealth(subdomain);
      res.json(result);
    } catch (error) {
      console.error("[SpecialSubdomains] Health check error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Health check failed" });
    }
  });

  // Batch health check for all special subdomains
  app.post("/api/admin/special-subdomains/health-check-all", async (_req, res) => {
    try {
      const specialSubdomains = subdomainHealth.getSpecialSubdomains();
      const result = await subdomainHealth.checkMultipleSubdomains(specialSubdomains);
      res.json(result);
    } catch (error) {
      console.error("[SpecialSubdomains] Batch health check error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Batch health check failed" });
    }
  });

  // Provision DNS for a subdomain
  app.post("/api/admin/special-subdomains/:subdomain/provision", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const specialSubdomains = subdomainHealth.getSpecialSubdomains();
      
      if (!specialSubdomains.includes(subdomain)) {
        return res.status(400).json({ 
          error: `Invalid subdomain: ${subdomain}. Valid options: ${specialSubdomains.join(', ')}`
        });
      }
      
      const result = await subdomainHealth.provisionSubdomain(subdomain);
      
      if (result.success) {
        res.json({ success: true, recordId: result.recordId });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error("[SpecialSubdomains] Provision error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Provisioning failed" });
    }
  });

  // Deprovision DNS for a subdomain
  app.delete("/api/admin/special-subdomains/:subdomain/provision", async (req, res) => {
    try {
      const { subdomain } = req.params;
      const { recordId } = req.query;
      const specialSubdomains = subdomainHealth.getSpecialSubdomains();
      
      if (!specialSubdomains.includes(subdomain)) {
        return res.status(400).json({ 
          error: `Invalid subdomain: ${subdomain}. Valid options: ${specialSubdomains.join(', ')}`
        });
      }
      
      const result = await subdomainHealth.deprovisionSubdomain(
        subdomain, 
        typeof recordId === 'string' ? recordId : undefined
      );
      
      if (result.success) {
        res.json({ success: true });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      console.error("[SpecialSubdomains] Deprovision error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Deprovisioning failed" });
    }
  });

  // Test Porkbun API credentials
  app.post("/api/admin/special-subdomains/test-porkbun", async (_req, res) => {
    try {
      const result = await porkbunService.testCredentials();
      res.json(result);
    } catch (error) {
      console.error("[SpecialSubdomains] Porkbun test error:", error);
      res.status(500).json({ 
        success: false, 
        error: error instanceof Error ? error.message : "Test failed" 
      });
    }
  });

  // Health check for arbitrary subdomain (not just special ones)
  app.post("/api/admin/subdomain-health/:subdomain", async (req, res) => {
    try {
      const { subdomain } = req.params;
      
      // Basic validation - alphanumeric and hyphens only
      if (!/^[a-z0-9-]+$/i.test(subdomain)) {
        return res.status(400).json({ error: "Invalid subdomain format" });
      }
      
      const result = await subdomainHealth.checkSubdomainHealth(subdomain);
      res.json(result);
    } catch (error) {
      console.error("[SubdomainHealth] Error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Health check failed" });
    }
  });

  return httpServer;
}
