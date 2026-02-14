import { 
  type User, type InsertUser, 
  type Screen, type InsertScreen,
  type GameObject, type InsertGameObject,
  type Scene, type InsertScene,
  type ObjectState, type InsertObjectState,
  type Trigger, type InsertTrigger,
  type Vocabulary, type InsertVocabulary,
  type Project, type InsertProject,
  type FigmaNode, type InsertFigmaNode,
  type Animation, type InsertAnimation,
  type Keyframe, type InsertKeyframe,
  type TimelineAction, type InsertTimelineAction,
  type FeatureHelp, type InsertFeatureHelp,
  type HelpVideoCandidate, type InsertHelpVideoCandidate,
  type AppSettings, type InsertAppSettings,
  type ApiDocs, type InsertApiDocs,
  type Subdomain, type InsertSubdomain,
  users, screens, gameObjects, scenes, objectStates, triggers, vocabulary, projects, figmaNodes,
  animations, keyframes, timelineActions, featureHelp, helpVideoCandidates, appSettings, apiDocs, subdomains
} from "@shared/schema";
import { db } from "./db";
import { eq, and, asc, desc, sql } from "drizzle-orm";

export interface ActivityImportData {
  id: string;
  componentId: string;
  version: string;
  screens: {
    id: string;
    title: string;
    figmaFrameId: string | null;
    imageUrl: string;
    width: number;
    height: number;
    objects: {
      id: string;
      customId: string | null;
      classes: string[];
      tags: string[];
      figmaNodeId: string | null;
      type: string;
      name: string;
      bounds: { x: number; y: number; width: number; height: number };
      zIndex: number;
      dataKey: string | null;
    }[];
    scenes: {
      id: string;
      name: string;
      isDefault: boolean;
      order: number;
      objectStates: {
        id: string;
        objectId: string;
        x: number | null;
        y: number | null;
        rotation: number | null;
        scaleX: number | null;
        scaleY: number | null;
        opacity: number | null;
        visible: boolean | null;
        animationDuration: number | null;
        animationEase: string | null;
      }[];
      triggers: {
        id: string;
        objectId: string | null;
        type: string;
        targetSceneId: string | null;
        delay: number | null;
        condition: string | null;
      }[];
    }[];
  }[];
}

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Import Activity
  importActivity(data: ActivityImportData, projectName?: string): Promise<Project>;
  
  // Projects
  getAllProjects(): Promise<Project[]>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectByFigmaKey(fileKey: string): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;
  
  // Screens
  getAllScreens(): Promise<Screen[]>;
  getScreensByProject(projectId: string): Promise<Screen[]>;
  getScreen(id: string): Promise<Screen | undefined>;
  getScreenByFigmaFrame(figmaFrameId: string): Promise<Screen | undefined>;
  createScreen(screen: InsertScreen): Promise<Screen>;
  updateScreen(id: string, screen: Partial<InsertScreen>): Promise<Screen | undefined>;
  deleteScreen(id: string): Promise<boolean>;
  
  // Figma Nodes
  getFigmaNodesByProject(projectId: string): Promise<FigmaNode[]>;
  getFigmaNode(projectId: string, nodeId: string): Promise<FigmaNode | undefined>;
  upsertFigmaNode(node: InsertFigmaNode): Promise<FigmaNode>;
  deleteFigmaNodesByProject(projectId: string): Promise<boolean>;
  
  // Game Objects
  getObjectsByScreen(screenId: string): Promise<GameObject[]>;
  getObject(id: string): Promise<GameObject | undefined>;
  getObjectByFigmaNode(figmaNodeId: string): Promise<GameObject | undefined>;
  createObject(obj: InsertGameObject): Promise<GameObject>;
  updateObject(id: string, obj: Partial<InsertGameObject>): Promise<GameObject | undefined>;
  updateObjectsZIndex(updates: Array<{ id: string; zIndex: number }>): Promise<GameObject[]>;
  deleteObject(id: string): Promise<boolean>;
  
  // Scenes
  getScenesByScreen(screenId: string): Promise<Scene[]>;
  getScene(id: string): Promise<Scene | undefined>;
  createScene(scene: InsertScene): Promise<Scene>;
  updateScene(id: string, scene: Partial<InsertScene>): Promise<Scene | undefined>;
  deleteScene(id: string): Promise<boolean>;
  
  // Object States
  getStatesByScene(sceneId: string): Promise<ObjectState[]>;
  getObjectState(sceneId: string, objectId: string): Promise<ObjectState | undefined>;
  createObjectState(state: InsertObjectState): Promise<ObjectState>;
  updateObjectState(id: string, state: Partial<InsertObjectState>): Promise<ObjectState | undefined>;
  deleteObjectState(id: string): Promise<boolean>;
  
  // Triggers
  getTriggersByScene(sceneId: string): Promise<Trigger[]>;
  createTrigger(trigger: InsertTrigger): Promise<Trigger>;
  updateTrigger(id: string, trigger: Partial<InsertTrigger>): Promise<Trigger | undefined>;
  deleteTrigger(id: string): Promise<boolean>;
  
  // Vocabulary
  getAllVocabulary(): Promise<Vocabulary[]>;
  createVocabulary(vocab: InsertVocabulary): Promise<Vocabulary>;
  deleteVocabulary(id: string): Promise<boolean>;
  
  // Animations
  getAnimationsByObject(objectId: string): Promise<Animation[]>;
  getAnimationsByScene(sceneId: string): Promise<Animation[]>;
  getAnimation(id: string): Promise<Animation | undefined>;
  createAnimation(animation: InsertAnimation): Promise<Animation>;
  updateAnimation(id: string, animation: Partial<InsertAnimation>): Promise<Animation | undefined>;
  deleteAnimation(id: string): Promise<boolean>;
  
  // Keyframes
  getKeyframesByAnimation(animationId: string): Promise<Keyframe[]>;
  getKeyframe(id: string): Promise<Keyframe | undefined>;
  createKeyframe(keyframe: InsertKeyframe): Promise<Keyframe>;
  updateKeyframe(id: string, keyframe: Partial<InsertKeyframe>): Promise<Keyframe | undefined>;
  deleteKeyframe(id: string): Promise<boolean>;
  deleteKeyframesByAnimation(animationId: string): Promise<boolean>;
  
  // Timeline Actions
  getTimelineActionsByAnimation(animationId: string): Promise<TimelineAction[]>;
  getTimelineAction(id: string): Promise<TimelineAction | undefined>;
  createTimelineAction(action: InsertTimelineAction): Promise<TimelineAction>;
  updateTimelineAction(id: string, action: Partial<InsertTimelineAction>): Promise<TimelineAction | undefined>;
  deleteTimelineAction(id: string): Promise<boolean>;
  
  // Feature Help
  getAllFeatureHelp(): Promise<FeatureHelp[]>;
  getFeatureHelpByCategory(category: string): Promise<FeatureHelp[]>;
  getFeatureHelp(id: string): Promise<FeatureHelp | undefined>;
  getFeatureHelpByKey(featureKey: string): Promise<FeatureHelp | undefined>;
  createFeatureHelp(help: InsertFeatureHelp): Promise<FeatureHelp>;
  updateFeatureHelp(id: string, help: Partial<InsertFeatureHelp>): Promise<FeatureHelp | undefined>;
  deleteFeatureHelp(id: string): Promise<boolean>;
  incrementFeatureHelpView(featureKey: string): Promise<FeatureHelp | undefined>;
  getFeatureHelpAnalytics(): Promise<{ topViewed: FeatureHelp[]; recentlyViewed: FeatureHelp[]; totalViews: number }>;
  
  // Help Video Candidates
  getAllVideoCandidates(): Promise<HelpVideoCandidate[]>;
  getVideoCandidatesByStatus(status: string): Promise<HelpVideoCandidate[]>;
  getVideoCandidatesByFeatureKey(featureKey: string): Promise<HelpVideoCandidate[]>;
  getVideoCandidate(id: string): Promise<HelpVideoCandidate | undefined>;
  createVideoCandidate(candidate: InsertHelpVideoCandidate): Promise<HelpVideoCandidate>;
  updateVideoCandidate(id: string, candidate: Partial<InsertHelpVideoCandidate>): Promise<HelpVideoCandidate | undefined>;
  approveVideoCandidate(id: string, approvedBy: string): Promise<HelpVideoCandidate | undefined>;
  rejectVideoCandidate(id: string, reason: string): Promise<HelpVideoCandidate | undefined>;
  deleteVideoCandidate(id: string): Promise<boolean>;
  
  // App Settings
  getAppSettings(): Promise<AppSettings | undefined>;
  saveAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings>;
  
  // API Documentation
  getAllApiDocs(): Promise<ApiDocs[]>;
  getApiDocsBySlug(slug: string): Promise<ApiDocs | undefined>;
  getApiDocs(id: string): Promise<ApiDocs | undefined>;
  createApiDocs(doc: InsertApiDocs): Promise<ApiDocs>;
  updateApiDocs(id: string, doc: Partial<InsertApiDocs>): Promise<ApiDocs | undefined>;
  upsertApiDocsBySlug(slug: string, doc: Partial<InsertApiDocs>): Promise<ApiDocs>;
  deleteApiDocs(id: string): Promise<boolean>;
  updateApiDocsPublishStatus(id: string, status: { publishStatus: string; publishedAt?: Date; publishedToDev?: boolean; publishedToProd?: boolean; lastDevPublishAt?: Date; lastProdPublishAt?: Date; commitSha?: string }): Promise<ApiDocs | undefined>;
  
  // Subdomains
  getAllSubdomains(): Promise<Subdomain[]>;
  getActiveSubdomains(): Promise<Subdomain[]>;
  getSubdomain(id: string): Promise<Subdomain | undefined>;
  getSubdomainByName(subdomain: string): Promise<Subdomain | undefined>;
  getSubdomainByFullDomain(fullDomain: string): Promise<Subdomain | undefined>;
  createSubdomain(subdomain: InsertSubdomain): Promise<Subdomain>;
  updateSubdomain(id: string, subdomain: Partial<InsertSubdomain>): Promise<Subdomain | undefined>;
  updateSubdomainDnsStatus(id: string, dnsStatus: string, checkResult?: { resolvedIp?: string; httpStatus?: number; error?: string; checkedAt: string }): Promise<Subdomain | undefined>;
  deleteSubdomain(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Projects
  async getAllProjects(): Promise<Project[]> {
    return await db.select().from(projects);
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async getProjectByFigmaKey(fileKey: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.figmaFileKey, fileKey));
    return project || undefined;
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    return project;
  }

  async updateProject(id: string, partialProject: Partial<InsertProject>): Promise<Project | undefined> {
    const [project] = await db.update(projects).set({ ...partialProject, updatedAt: new Date() }).where(eq(projects.id, id)).returning();
    return project || undefined;
  }

  async deleteProject(id: string): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id)).returning();
    return result.length > 0;
  }

  async getAllScreens(): Promise<Screen[]> {
    return await db.select().from(screens);
  }

  async getScreensByProject(projectId: string): Promise<Screen[]> {
    return await db.select().from(screens).where(eq(screens.projectId, projectId));
  }

  async getScreen(id: string): Promise<Screen | undefined> {
    const [screen] = await db.select().from(screens).where(eq(screens.id, id));
    return screen || undefined;
  }

  async getScreenByFigmaFrame(figmaFrameId: string): Promise<Screen | undefined> {
    const [screen] = await db.select().from(screens).where(eq(screens.figmaFrameId, figmaFrameId));
    return screen || undefined;
  }

  async createScreen(insertScreen: InsertScreen): Promise<Screen> {
    const [screen] = await db
      .insert(screens)
      .values(insertScreen)
      .returning();
    return screen;
  }

  async updateScreen(id: string, partialScreen: Partial<InsertScreen>): Promise<Screen | undefined> {
    const [screen] = await db
      .update(screens)
      .set(partialScreen)
      .where(eq(screens.id, id))
      .returning();
    return screen || undefined;
  }

  async deleteScreen(id: string): Promise<boolean> {
    const result = await db
      .delete(screens)
      .where(eq(screens.id, id))
      .returning();
    return result.length > 0;
  }

  // Figma Nodes
  async getFigmaNodesByProject(projectId: string): Promise<FigmaNode[]> {
    return await db.select().from(figmaNodes).where(eq(figmaNodes.projectId, projectId));
  }

  async getFigmaNode(projectId: string, nodeId: string): Promise<FigmaNode | undefined> {
    const [node] = await db.select().from(figmaNodes)
      .where(and(eq(figmaNodes.projectId, projectId), eq(figmaNodes.nodeId, nodeId)));
    return node || undefined;
  }

  async upsertFigmaNode(insertNode: InsertFigmaNode): Promise<FigmaNode> {
    const existing = await this.getFigmaNode(insertNode.projectId, insertNode.nodeId);
    if (existing) {
      const [updated] = await db.update(figmaNodes)
        .set({ ...insertNode, lastSyncedAt: new Date() })
        .where(eq(figmaNodes.id, existing.id))
        .returning();
      return updated;
    }
    const [node] = await db.insert(figmaNodes).values(insertNode).returning();
    return node;
  }

  async deleteFigmaNodesByProject(projectId: string): Promise<boolean> {
    const result = await db.delete(figmaNodes).where(eq(figmaNodes.projectId, projectId)).returning();
    return result.length > 0;
  }

  // Game Objects
  async getObjectsByScreen(screenId: string): Promise<GameObject[]> {
    return await db.select().from(gameObjects).where(eq(gameObjects.screenId, screenId));
  }

  async getObject(id: string): Promise<GameObject | undefined> {
    const [obj] = await db.select().from(gameObjects).where(eq(gameObjects.id, id));
    return obj || undefined;
  }

  async getObjectByFigmaNode(figmaNodeId: string): Promise<GameObject | undefined> {
    const [obj] = await db.select().from(gameObjects).where(eq(gameObjects.figmaNodeId, figmaNodeId));
    return obj || undefined;
  }

  async createObject(insertObj: InsertGameObject): Promise<GameObject> {
    const [obj] = await db.insert(gameObjects).values(insertObj).returning();
    return obj;
  }

  async updateObject(id: string, partialObj: Partial<InsertGameObject>): Promise<GameObject | undefined> {
    const [obj] = await db.update(gameObjects).set(partialObj).where(eq(gameObjects.id, id)).returning();
    return obj || undefined;
  }

  async updateObjectsZIndex(updates: Array<{ id: string; zIndex: number }>): Promise<GameObject[]> {
    if (updates.length === 0) return [];
    
    const results: GameObject[] = [];
    await db.transaction(async (tx) => {
      for (const update of updates) {
        const [obj] = await tx.update(gameObjects)
          .set({ zIndex: update.zIndex })
          .where(eq(gameObjects.id, update.id))
          .returning();
        if (obj) results.push(obj);
      }
    });
    return results;
  }

  async deleteObject(id: string): Promise<boolean> {
    const result = await db.delete(gameObjects).where(eq(gameObjects.id, id)).returning();
    return result.length > 0;
  }

  // Scenes
  async getScenesByScreen(screenId: string): Promise<Scene[]> {
    return await db.select().from(scenes).where(eq(scenes.screenId, screenId));
  }

  async getScene(id: string): Promise<Scene | undefined> {
    const [scene] = await db.select().from(scenes).where(eq(scenes.id, id));
    return scene || undefined;
  }

  async createScene(insertScene: InsertScene): Promise<Scene> {
    const [scene] = await db.insert(scenes).values(insertScene).returning();
    return scene;
  }

  async updateScene(id: string, partialScene: Partial<InsertScene>): Promise<Scene | undefined> {
    const [scene] = await db.update(scenes).set(partialScene).where(eq(scenes.id, id)).returning();
    return scene || undefined;
  }

  async deleteScene(id: string): Promise<boolean> {
    const result = await db.delete(scenes).where(eq(scenes.id, id)).returning();
    return result.length > 0;
  }

  // Object States
  async getStatesByScene(sceneId: string): Promise<ObjectState[]> {
    return await db.select().from(objectStates).where(eq(objectStates.sceneId, sceneId));
  }

  async getObjectState(sceneId: string, objectId: string): Promise<ObjectState | undefined> {
    const [state] = await db.select().from(objectStates)
      .where(and(eq(objectStates.sceneId, sceneId), eq(objectStates.objectId, objectId)));
    return state || undefined;
  }

  async createObjectState(insertState: InsertObjectState): Promise<ObjectState> {
    const [state] = await db.insert(objectStates).values(insertState).returning();
    return state;
  }

  async updateObjectState(id: string, partialState: Partial<InsertObjectState>): Promise<ObjectState | undefined> {
    const [state] = await db.update(objectStates).set(partialState).where(eq(objectStates.id, id)).returning();
    return state || undefined;
  }

  async deleteObjectState(id: string): Promise<boolean> {
    const result = await db.delete(objectStates).where(eq(objectStates.id, id)).returning();
    return result.length > 0;
  }

  // Triggers
  async getTriggersByScene(sceneId: string): Promise<Trigger[]> {
    return await db.select().from(triggers).where(eq(triggers.sceneId, sceneId));
  }

  async createTrigger(insertTrigger: InsertTrigger): Promise<Trigger> {
    const [trigger] = await db.insert(triggers).values(insertTrigger).returning();
    return trigger;
  }

  async updateTrigger(id: string, partialTrigger: Partial<InsertTrigger>): Promise<Trigger | undefined> {
    const [trigger] = await db.update(triggers).set(partialTrigger).where(eq(triggers.id, id)).returning();
    return trigger || undefined;
  }

  async deleteTrigger(id: string): Promise<boolean> {
    const result = await db.delete(triggers).where(eq(triggers.id, id)).returning();
    return result.length > 0;
  }

  // Vocabulary
  async getAllVocabulary(): Promise<Vocabulary[]> {
    return await db.select().from(vocabulary);
  }

  async createVocabulary(insertVocab: InsertVocabulary): Promise<Vocabulary> {
    const [vocab] = await db.insert(vocabulary).values(insertVocab).returning();
    return vocab;
  }

  async deleteVocabulary(id: string): Promise<boolean> {
    const result = await db.delete(vocabulary).where(eq(vocabulary.id, id)).returning();
    return result.length > 0;
  }

  // Animations
  async getAnimationsByObject(objectId: string): Promise<Animation[]> {
    return await db.select().from(animations)
      .where(eq(animations.objectId, objectId))
      .orderBy(asc(animations.order));
  }

  async getAnimationsByScene(sceneId: string): Promise<Animation[]> {
    return await db.select().from(animations)
      .where(eq(animations.sceneId, sceneId))
      .orderBy(asc(animations.order));
  }

  async getAnimation(id: string): Promise<Animation | undefined> {
    const [animation] = await db.select().from(animations).where(eq(animations.id, id));
    return animation || undefined;
  }

  async createAnimation(insertAnimation: InsertAnimation): Promise<Animation> {
    const [animation] = await db.insert(animations).values(insertAnimation).returning();
    return animation;
  }

  async updateAnimation(id: string, partialAnimation: Partial<InsertAnimation>): Promise<Animation | undefined> {
    const [animation] = await db.update(animations)
      .set(partialAnimation)
      .where(eq(animations.id, id))
      .returning();
    return animation || undefined;
  }

  async deleteAnimation(id: string): Promise<boolean> {
    const result = await db.delete(animations).where(eq(animations.id, id)).returning();
    return result.length > 0;
  }

  // Keyframes
  async getKeyframesByAnimation(animationId: string): Promise<Keyframe[]> {
    return await db.select().from(keyframes)
      .where(eq(keyframes.animationId, animationId))
      .orderBy(asc(keyframes.time));
  }

  async getKeyframe(id: string): Promise<Keyframe | undefined> {
    const [keyframe] = await db.select().from(keyframes).where(eq(keyframes.id, id));
    return keyframe || undefined;
  }

  async createKeyframe(insertKeyframe: InsertKeyframe): Promise<Keyframe> {
    const [keyframe] = await db.insert(keyframes).values(insertKeyframe).returning();
    return keyframe;
  }

  async updateKeyframe(id: string, partialKeyframe: Partial<InsertKeyframe>): Promise<Keyframe | undefined> {
    const [keyframe] = await db.update(keyframes)
      .set(partialKeyframe)
      .where(eq(keyframes.id, id))
      .returning();
    return keyframe || undefined;
  }

  async deleteKeyframe(id: string): Promise<boolean> {
    const result = await db.delete(keyframes).where(eq(keyframes.id, id)).returning();
    return result.length > 0;
  }

  async deleteKeyframesByAnimation(animationId: string): Promise<boolean> {
    const result = await db.delete(keyframes).where(eq(keyframes.animationId, animationId)).returning();
    return result.length >= 0;
  }

  // Timeline Actions
  async getTimelineActionsByAnimation(animationId: string): Promise<TimelineAction[]> {
    return await db.select().from(timelineActions)
      .where(eq(timelineActions.animationId, animationId))
      .orderBy(asc(timelineActions.triggerTime));
  }

  async getTimelineAction(id: string): Promise<TimelineAction | undefined> {
    const [action] = await db.select().from(timelineActions).where(eq(timelineActions.id, id));
    return action || undefined;
  }

  async createTimelineAction(insertAction: InsertTimelineAction): Promise<TimelineAction> {
    const [action] = await db.insert(timelineActions).values(insertAction).returning();
    return action;
  }

  async updateTimelineAction(id: string, partialAction: Partial<InsertTimelineAction>): Promise<TimelineAction | undefined> {
    const [action] = await db.update(timelineActions)
      .set(partialAction)
      .where(eq(timelineActions.id, id))
      .returning();
    return action || undefined;
  }

  async deleteTimelineAction(id: string): Promise<boolean> {
    const result = await db.delete(timelineActions).where(eq(timelineActions.id, id)).returning();
    return result.length > 0;
  }

  async importActivity(data: ActivityImportData, projectName?: string): Promise<Project> {
    const project = await this.createProject({
      name: projectName || `Imported Activity`,
      description: `Imported from activity ${data.id} (v${data.version})`,
    });

    const screenIdMap = new Map<string, string>();
    const objectIdMap = new Map<string, string>();
    const sceneIdMap = new Map<string, string>();

    for (const screenData of data.screens) {
      const screen = await this.createScreen({
        projectId: project.id,
        title: screenData.title,
        imageUrl: screenData.imageUrl,
        width: screenData.width,
        height: screenData.height,
        figmaFrameId: screenData.figmaFrameId,
      });
      screenIdMap.set(screenData.id, screen.id);

      for (const objData of screenData.objects) {
        const obj = await this.createObject({
          screenId: screen.id,
          name: objData.name,
          type: objData.type,
          x: objData.bounds.x,
          y: objData.bounds.y,
          width: objData.bounds.width,
          height: objData.bounds.height,
          figmaNodeId: objData.figmaNodeId,
          customId: objData.customId,
          classes: objData.classes,
          tags: objData.tags,
          zIndex: objData.zIndex,
          dataKey: objData.dataKey,
        });
        objectIdMap.set(objData.id, obj.id);
      }

      for (const sceneData of screenData.scenes) {
        const scene = await this.createScene({
          screenId: screen.id,
          name: sceneData.name,
          order: sceneData.order,
          isDefault: sceneData.isDefault,
        });
        sceneIdMap.set(sceneData.id, scene.id);

        for (const stateData of sceneData.objectStates) {
          const newObjectId = objectIdMap.get(stateData.objectId);
          if (newObjectId) {
            await this.createObjectState({
              sceneId: scene.id,
              objectId: newObjectId,
              x: stateData.x,
              y: stateData.y,
              rotation: stateData.rotation,
              scaleX: stateData.scaleX,
              scaleY: stateData.scaleY,
              opacity: stateData.opacity,
              visible: stateData.visible,
              animationDuration: stateData.animationDuration,
              animationEase: stateData.animationEase,
            });
          }
        }
      }
    }

    for (const screenData of data.screens) {
      for (const sceneData of screenData.scenes) {
        const newSceneId = sceneIdMap.get(sceneData.id);
        if (!newSceneId) continue;

        for (const triggerData of sceneData.triggers) {
          const newObjectId = triggerData.objectId ? objectIdMap.get(triggerData.objectId) : null;
          const newTargetSceneId = triggerData.targetSceneId ? sceneIdMap.get(triggerData.targetSceneId) : null;

          await this.createTrigger({
            sceneId: newSceneId,
            objectId: newObjectId,
            type: triggerData.type,
            targetSceneId: newTargetSceneId,
            delay: triggerData.delay,
            condition: triggerData.condition,
          });
        }
      }
    }

    return project;
  }

  // Feature Help
  async getAllFeatureHelp(): Promise<FeatureHelp[]> {
    return await db.select().from(featureHelp).orderBy(asc(featureHelp.category), asc(featureHelp.order));
  }

  async getFeatureHelpByCategory(category: string): Promise<FeatureHelp[]> {
    return await db.select().from(featureHelp).where(eq(featureHelp.category, category)).orderBy(asc(featureHelp.order));
  }

  async getFeatureHelp(id: string): Promise<FeatureHelp | undefined> {
    const [help] = await db.select().from(featureHelp).where(eq(featureHelp.id, id));
    return help || undefined;
  }

  async getFeatureHelpByKey(featureKey: string): Promise<FeatureHelp | undefined> {
    const [help] = await db.select().from(featureHelp).where(eq(featureHelp.featureKey, featureKey));
    return help || undefined;
  }

  async createFeatureHelp(insertHelp: InsertFeatureHelp): Promise<FeatureHelp> {
    const [help] = await db.insert(featureHelp).values(insertHelp).returning();
    return help;
  }

  async updateFeatureHelp(id: string, partialHelp: Partial<InsertFeatureHelp>): Promise<FeatureHelp | undefined> {
    const [help] = await db.update(featureHelp).set({ ...partialHelp, updatedAt: new Date() }).where(eq(featureHelp.id, id)).returning();
    return help || undefined;
  }

  async deleteFeatureHelp(id: string): Promise<boolean> {
    const result = await db.delete(featureHelp).where(eq(featureHelp.id, id)).returning();
    return result.length > 0;
  }

  async incrementFeatureHelpView(featureKey: string): Promise<FeatureHelp | undefined> {
    const [help] = await db.update(featureHelp)
      .set({ 
        viewCount: sql`COALESCE(${featureHelp.viewCount}, 0) + 1`,
        lastViewedAt: new Date()
      })
      .where(eq(featureHelp.featureKey, featureKey))
      .returning();
    return help || undefined;
  }

  async getFeatureHelpAnalytics(): Promise<{ topViewed: FeatureHelp[]; recentlyViewed: FeatureHelp[]; totalViews: number }> {
    const topViewed = await db.select().from(featureHelp)
      .orderBy(desc(featureHelp.viewCount))
      .limit(10);
    
    const recentlyViewed = await db.select().from(featureHelp)
      .where(sql`${featureHelp.lastViewedAt} IS NOT NULL`)
      .orderBy(desc(featureHelp.lastViewedAt))
      .limit(10);
    
    const [result] = await db.select({ total: sql<number>`COALESCE(SUM(${featureHelp.viewCount}), 0)::int` }).from(featureHelp);
    
    return {
      topViewed,
      recentlyViewed,
      totalViews: result?.total || 0
    };
  }

  // Help Video Candidates
  async getAllVideoCandidates(): Promise<HelpVideoCandidate[]> {
    return await db.select().from(helpVideoCandidates).orderBy(asc(helpVideoCandidates.capturedAt));
  }

  async getVideoCandidatesByStatus(status: string): Promise<HelpVideoCandidate[]> {
    return await db.select().from(helpVideoCandidates)
      .where(eq(helpVideoCandidates.status, status))
      .orderBy(asc(helpVideoCandidates.capturedAt));
  }

  async getVideoCandidatesByFeatureKey(featureKey: string): Promise<HelpVideoCandidate[]> {
    return await db.select().from(helpVideoCandidates)
      .where(eq(helpVideoCandidates.featureKey, featureKey))
      .orderBy(asc(helpVideoCandidates.capturedAt));
  }

  async getVideoCandidate(id: string): Promise<HelpVideoCandidate | undefined> {
    const [candidate] = await db.select().from(helpVideoCandidates).where(eq(helpVideoCandidates.id, id));
    return candidate || undefined;
  }

  async createVideoCandidate(insertCandidate: InsertHelpVideoCandidate): Promise<HelpVideoCandidate> {
    const [candidate] = await db.insert(helpVideoCandidates).values(insertCandidate).returning();
    return candidate;
  }

  async updateVideoCandidate(id: string, partialCandidate: Partial<InsertHelpVideoCandidate>): Promise<HelpVideoCandidate | undefined> {
    const [candidate] = await db.update(helpVideoCandidates).set(partialCandidate).where(eq(helpVideoCandidates.id, id)).returning();
    return candidate || undefined;
  }

  async approveVideoCandidate(id: string, approvedBy: string): Promise<HelpVideoCandidate | undefined> {
    const [candidate] = await db.update(helpVideoCandidates)
      .set({ status: "approved", approvedBy, approvedAt: new Date() })
      .where(eq(helpVideoCandidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async rejectVideoCandidate(id: string, reason: string): Promise<HelpVideoCandidate | undefined> {
    const [candidate] = await db.update(helpVideoCandidates)
      .set({ status: "rejected", rejectionReason: reason })
      .where(eq(helpVideoCandidates.id, id))
      .returning();
    return candidate || undefined;
  }

  async deleteVideoCandidate(id: string): Promise<boolean> {
    const result = await db.delete(helpVideoCandidates).where(eq(helpVideoCandidates.id, id)).returning();
    return result.length > 0;
  }

  // App Settings
  async getAppSettings(): Promise<AppSettings | undefined> {
    const [settings] = await db.select().from(appSettings).where(eq(appSettings.id, "default"));
    return settings || undefined;
  }

  async saveAppSettings(settings: Partial<InsertAppSettings>): Promise<AppSettings> {
    const existing = await this.getAppSettings();
    if (existing) {
      const [updated] = await db.update(appSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(appSettings.id, "default"))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(appSettings)
        .values({ id: "default", ...settings })
        .returning();
      return created;
    }
  }

  // API Documentation
  async getAllApiDocs(): Promise<ApiDocs[]> {
    return await db.select().from(apiDocs).orderBy(desc(apiDocs.updatedAt));
  }

  async getApiDocsBySlug(slug: string): Promise<ApiDocs | undefined> {
    const [doc] = await db.select().from(apiDocs).where(eq(apiDocs.slug, slug));
    return doc || undefined;
  }

  async getApiDocs(id: string): Promise<ApiDocs | undefined> {
    const [doc] = await db.select().from(apiDocs).where(eq(apiDocs.id, id));
    return doc || undefined;
  }

  async createApiDocs(insertDoc: InsertApiDocs): Promise<ApiDocs> {
    const [doc] = await db.insert(apiDocs).values(insertDoc as typeof apiDocs.$inferInsert).returning();
    return doc;
  }

  async updateApiDocs(id: string, partialDoc: Partial<InsertApiDocs>): Promise<ApiDocs | undefined> {
    const updateData = { 
      ...partialDoc, 
      updatedAt: new Date(), 
      lastUpdated: new Date() 
    } as Partial<typeof apiDocs.$inferInsert>;
    const [doc] = await db.update(apiDocs)
      .set(updateData)
      .where(eq(apiDocs.id, id))
      .returning();
    return doc || undefined;
  }

  async upsertApiDocsBySlug(slug: string, partialDoc: Partial<InsertApiDocs>): Promise<ApiDocs> {
    const existing = await this.getApiDocsBySlug(slug);
    if (existing) {
      const updateData = { 
        ...partialDoc, 
        updatedAt: new Date(), 
        lastUpdated: new Date() 
      } as Partial<typeof apiDocs.$inferInsert>;
      const [updated] = await db.update(apiDocs)
        .set(updateData)
        .where(eq(apiDocs.slug, slug))
        .returning();
      return updated;
    } else {
      const insertData = { 
        slug, 
        title: partialDoc.title || 'Untitled',
        ...partialDoc 
      } as typeof apiDocs.$inferInsert;
      const [created] = await db.insert(apiDocs)
        .values(insertData)
        .returning();
      return created;
    }
  }

  async deleteApiDocs(id: string): Promise<boolean> {
    const result = await db.delete(apiDocs).where(eq(apiDocs.id, id)).returning();
    return result.length > 0;
  }

  async updateApiDocsPublishStatus(
    id: string, 
    status: { 
      publishStatus: string; 
      publishedAt?: Date; 
      publishedToDev?: boolean; 
      publishedToProd?: boolean; 
      lastDevPublishAt?: Date; 
      lastProdPublishAt?: Date; 
      commitSha?: string 
    }
  ): Promise<ApiDocs | undefined> {
    const [doc] = await db.update(apiDocs)
      .set({ ...status, updatedAt: new Date() })
      .where(eq(apiDocs.id, id))
      .returning();
    return doc || undefined;
  }

  // Subdomains
  async getAllSubdomains(): Promise<Subdomain[]> {
    return await db.select().from(subdomains).orderBy(asc(subdomains.subdomain));
  }

  async getActiveSubdomains(): Promise<Subdomain[]> {
    return await db.select().from(subdomains).where(eq(subdomains.isActive, true)).orderBy(asc(subdomains.subdomain));
  }

  async getSubdomain(id: string): Promise<Subdomain | undefined> {
    const [subdomain] = await db.select().from(subdomains).where(eq(subdomains.id, id));
    return subdomain || undefined;
  }

  async getSubdomainByName(subdomainName: string): Promise<Subdomain | undefined> {
    const [subdomain] = await db.select().from(subdomains).where(eq(subdomains.subdomain, subdomainName));
    return subdomain || undefined;
  }

  async getSubdomainByFullDomain(fullDomain: string): Promise<Subdomain | undefined> {
    const [subdomain] = await db.select().from(subdomains).where(eq(subdomains.fullDomain, fullDomain));
    return subdomain || undefined;
  }

  async createSubdomain(insertSubdomain: InsertSubdomain): Promise<Subdomain> {
    const [subdomain] = await db.insert(subdomains).values(insertSubdomain as typeof subdomains.$inferInsert).returning();
    return subdomain;
  }

  async updateSubdomain(id: string, partialSubdomain: Partial<InsertSubdomain>): Promise<Subdomain | undefined> {
    const [subdomain] = await db.update(subdomains)
      .set({ ...partialSubdomain, updatedAt: new Date() } as Partial<typeof subdomains.$inferInsert>)
      .where(eq(subdomains.id, id))
      .returning();
    return subdomain || undefined;
  }

  async updateSubdomainDnsStatus(
    id: string, 
    dnsStatus: string, 
    checkResult?: { resolvedIp?: string; httpStatus?: number; error?: string; checkedAt: string }
  ): Promise<Subdomain | undefined> {
    const updateData: Partial<typeof subdomains.$inferInsert> = {
      dnsStatus,
      lastDnsCheck: new Date(),
      updatedAt: new Date(),
    };
    if (checkResult) {
      updateData.dnsCheckResult = checkResult;
    }
    const [subdomain] = await db.update(subdomains)
      .set(updateData)
      .where(eq(subdomains.id, id))
      .returning();
    return subdomain || undefined;
  }

  async deleteSubdomain(id: string): Promise<boolean> {
    const result = await db.delete(subdomains).where(eq(subdomains.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
