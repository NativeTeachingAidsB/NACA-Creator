import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb, boolean, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const screens = pgTable("screens", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  imageUrl: text("image_url").notNull(),
  width: integer("width").notNull().default(1194),
  height: integer("height").notNull().default(834),
  positionX: integer("position_x").default(0),
  positionY: integer("position_y").default(0),
  figmaFrameId: text("figma_frame_id"),
  figmaNodeHash: text("figma_node_hash"),
  nacaActivityId: text("naca_activity_id"),
  nacaCommunityId: text("naca_community_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScreenSchema = createInsertSchema(screens).omit({
  id: true,
  createdAt: true,
});

export type InsertScreen = z.infer<typeof insertScreenSchema>;
export type Screen = typeof screens.$inferSelect;

// Figma Nodes - tracks the Figma tree structure for diffing/sync
export const figmaNodes = pgTable("figma_nodes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  nodeId: text("node_id").notNull(),
  parentNodeId: text("parent_node_id"),
  screenId: varchar("screen_id").references(() => screens.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  type: text("type").notNull(),
  hash: text("hash"),
  x: real("x"),
  y: real("y"),
  width: real("width"),
  height: real("height"),
  order: integer("order").default(0),
  lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
});

export const insertFigmaNodeSchema = createInsertSchema(figmaNodes).omit({
  id: true,
  lastSyncedAt: true,
});

export type InsertFigmaNode = z.infer<typeof insertFigmaNodeSchema>;
export type FigmaNode = typeof figmaNodes.$inferSelect;

// Game Projects - top-level container for language learning games
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  figmaFileKey: text("figma_file_key"),
  figmaPageId: text("figma_page_id"),
  figmaLastSyncedAt: timestamp("figma_last_synced_at"),
  figmaBranch: text("figma_branch"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;

// Game Objects - individual selectable elements within a screen
export const gameObjects = pgTable("game_objects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  screenId: varchar("screen_id").notNull().references(() => screens.id, { onDelete: "cascade" }),
  figmaNodeId: text("figma_node_id"),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'text', 'image', 'shape', 'group', 'frame'
  // Base transform properties
  x: real("x").notNull().default(0),
  y: real("y").notNull().default(0),
  width: real("width").notNull().default(100),
  height: real("height").notNull().default(100),
  rotation: real("rotation").default(0),
  scaleX: real("scale_x").default(1),
  scaleY: real("scale_y").default(1),
  opacity: real("opacity").default(1),
  visible: boolean("visible").default(true),
  locked: boolean("locked").default(false),
  // Data binding for language content
  dataKey: text("data_key"), // e.g., 'word', 'translation', 'image'
  // Media bindings for NACA integration
  mediaUrl: text("media_url"), // URL to image/visual media asset
  audioUrl: text("audio_url"), // URL to audio asset
  // Extended properties for programmatic targeting
  customId: text("custom_id"), // user-defined ID for programmatic targeting
  classes: text("classes").array().default([]), // array of class names like CSS classes
  tags: text("tags").array().default([]), // flexible tagging for grouping
  zIndex: integer("z_index").default(0), // layer stacking order from Figma
  // SVG/visual metadata (gradients, fill, stroke, pathData, etc.)
  metadata: jsonb("metadata").$type<{
    gradientId?: string;
    gradientDef?: {
      type: 'linear' | 'radial';
      stops: Array<{ offset: string; color: string }>;
      x1?: string;
      y1?: string;
      x2?: string;
      y2?: string;
      cx?: string;
      cy?: string;
      r?: string;
    };
    fill?: string;
    stroke?: string;
    pathData?: string;
    originalMarkup?: string;
    symbolPath?: string[];
  }>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameObjectSchema = createInsertSchema(gameObjects).omit({
  id: true,
  createdAt: true,
});

export type InsertGameObject = z.infer<typeof insertGameObjectSchema>;
export type GameObject = typeof gameObjects.$inferSelect;

export type GameObjectMetadata = NonNullable<GameObject['metadata']>;

// Game Scenes - different states of the game (e.g., 'intro', 'question', 'correct', 'incorrect')
export const scenes = pgTable("scenes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  screenId: varchar("screen_id").notNull().references(() => screens.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  order: integer("order").notNull().default(0),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSceneSchema = createInsertSchema(scenes).omit({
  id: true,
  createdAt: true,
});

export type InsertScene = z.infer<typeof insertSceneSchema>;
export type Scene = typeof scenes.$inferSelect;

// Object States - attribute overrides for objects within a specific scene
export const objectStates = pgTable("object_states", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sceneId: varchar("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  objectId: varchar("object_id").notNull().references(() => gameObjects.id, { onDelete: "cascade" }),
  // Override properties (null means use base value)
  x: real("x"),
  y: real("y"),
  rotation: real("rotation"),
  scaleX: real("scale_x"),
  scaleY: real("scale_y"),
  opacity: real("opacity"),
  visible: boolean("visible"),
  // Animation properties
  animationDuration: real("animation_duration").default(0.3),
  animationEase: text("animation_ease").default("power2.out"),
});

export const insertObjectStateSchema = createInsertSchema(objectStates).omit({
  id: true,
});

export type InsertObjectState = z.infer<typeof insertObjectStateSchema>;
export type ObjectState = typeof objectStates.$inferSelect;

// Triggers - events that cause state changes
export const triggers = pgTable("triggers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sceneId: varchar("scene_id").notNull().references(() => scenes.id, { onDelete: "cascade" }),
  objectId: varchar("object_id").references(() => gameObjects.id, { onDelete: "cascade" }), // null for scene-level triggers
  type: text("type").notNull(), // 'click', 'hover', 'timer', 'correct', 'incorrect', 'start'
  targetSceneId: varchar("target_scene_id").references(() => scenes.id, { onDelete: "set null" }),
  delay: real("delay").default(0), // for timer triggers
  condition: text("condition"), // optional condition expression
  // Phase 2: Enhanced triggers
  targetSelector: text("target_selector"), // CSS-like selector: '#myId' or '.myClass' or '#id1, .class2'
  action: text("action").default("goToScene"), // 'goToScene', 'setVisible', 'setOpacity', 'addClass', 'removeClass', 'playAudio', 'setProperty'
  actionPayload: jsonb("action_payload"), // { visible: true } or { opacity: 0.5 } or { class: 'highlighted' } or { audioUrl: '...' }
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTriggerSchema = createInsertSchema(triggers).omit({
  id: true,
  createdAt: true,
});

export type InsertTrigger = z.infer<typeof insertTriggerSchema>;
export type Trigger = typeof triggers.$inferSelect;

// Vocabulary - language learning content
export const vocabulary = pgTable("vocabulary", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").references(() => projects.id, { onDelete: "cascade" }),
  word: text("word").notNull(),
  translation: text("translation").notNull(),
  imageUrl: text("image_url"),
  audioUrl: text("audio_url"),
  category: text("category"),
  difficulty: integer("difficulty").default(1),
  metadata: jsonb("metadata"), // flexible storage for additional data
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVocabularySchema = createInsertSchema(vocabulary).omit({
  id: true,
  createdAt: true,
});

export type InsertVocabulary = z.infer<typeof insertVocabularySchema>;
export type Vocabulary = typeof vocabulary.$inferSelect;

// Animations - Timeline container for each object
export const animations = pgTable("animations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  objectId: varchar("object_id").notNull().references(() => gameObjects.id, { onDelete: "cascade" }),
  sceneId: varchar("scene_id").references(() => scenes.id, { onDelete: "cascade" }),
  name: text("name").notNull().default("Animation"),
  duration: real("duration").notNull().default(1), // in seconds
  loop: boolean("loop").default(false),
  autoplay: boolean("autoplay").default(false),
  playbackRate: real("playback_rate").default(1),
  order: integer("order").default(0),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAnimationSchema = createInsertSchema(animations).omit({
  id: true,
  createdAt: true,
});

export type InsertAnimation = z.infer<typeof insertAnimationSchema>;
export type Animation = typeof animations.$inferSelect;

// Keyframes - Individual animation keyframes
export const keyframes = pgTable("keyframes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animationId: varchar("animation_id").notNull().references(() => animations.id, { onDelete: "cascade" }),
  time: real("time").notNull().default(0), // in seconds from animation start
  property: text("property").notNull(), // x, y, rotation, scaleX, scaleY, opacity, etc.
  value: jsonb("value").notNull(), // numeric or string value
  ease: text("ease").default("power2.out"), // GSAP easing function
  locked: boolean("locked").default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertKeyframeSchema = createInsertSchema(keyframes).omit({
  id: true,
  createdAt: true,
});

export type InsertKeyframe = z.infer<typeof insertKeyframeSchema>;
export type Keyframe = typeof keyframes.$inferSelect;

// Timeline Actions - Play/stop triggers on timeline
export const timelineActions = pgTable("timeline_actions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  animationId: varchar("animation_id").notNull().references(() => animations.id, { onDelete: "cascade" }),
  targetAnimationId: varchar("target_animation_id").notNull().references(() => animations.id, { onDelete: "cascade" }),
  action: text("action").notNull(), // 'play', 'stop', 'pause', 'restart', 'gotoAndPlay', 'gotoAndStop'
  triggerTime: real("trigger_time").notNull(), // when in parent timeline
  targetFrame: real("target_frame"), // for goto actions
  parameters: jsonb("parameters"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTimelineActionSchema = createInsertSchema(timelineActions).omit({
  id: true,
  createdAt: true,
});

export type InsertTimelineAction = z.infer<typeof insertTimelineActionSchema>;
export type TimelineAction = typeof timelineActions.$inferSelect;

// Property types for keyframe animation
export const AnimatableProperty = z.enum([
  "x", "y", "rotation", "scaleX", "scaleY", "opacity", "width", "height"
]);
export type AnimatablePropertyType = z.infer<typeof AnimatableProperty>;

// Action types for timeline actions
export const TimelineActionType = z.enum([
  "play", "stop", "pause", "restart", "gotoAndPlay", "gotoAndStop"
]);
export type TimelineActionTypeEnum = z.infer<typeof TimelineActionType>;

// Feature Help - Documentation and video tutorials for interface assistance
export const featureHelp = pgTable("feature_help", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  featureKey: text("feature_key").notNull().unique(), // e.g., "timeline-add-keyframe", "canvas-pan-zoom"
  title: text("title").notNull(),
  description: text("description").notNull(),
  videoUrl: text("video_url"), // path to narrated video demonstration
  thumbnailUrl: text("thumbnail_url"), // video thumbnail image
  category: text("category").notNull(), // e.g., "Timeline", "Canvas", "Layers", "Triggers"
  shortcutKey: text("shortcut_key"), // optional keyboard shortcut for the feature
  relatedFeatures: text("related_features").array().default([]), // links to related feature keys
  order: integer("order").default(0), // display order within category
  isNew: boolean("is_new").default(true), // highlight newly added features
  documentedAt: timestamp("documented_at"), // when documentation was completed
  testedAt: timestamp("tested_at"), // when feature was tested
  viewCount: integer("view_count").default(0), // analytics: number of times viewed
  lastViewedAt: timestamp("last_viewed_at"), // analytics: last time this was viewed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertFeatureHelpSchema = createInsertSchema(featureHelp).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertFeatureHelp = z.infer<typeof insertFeatureHelpSchema>;
export type FeatureHelp = typeof featureHelp.$inferSelect;

// Feature Help Categories
export const FeatureHelpCategory = z.enum([
  "Timeline", "Canvas", "Layers", "Triggers", "Vocabulary", 
  "Figma", "DevSync", "Scenes", "Objects", "General"
]);
export type FeatureHelpCategoryType = z.infer<typeof FeatureHelpCategory>;

// Help Video Candidates - Test recordings that can be approved as help videos
export const helpVideoCandidates = pgTable("help_video_candidates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  featureKey: text("feature_key").notNull(), // which help topic this relates to
  videoUrl: text("video_url").notNull(), // path to the recorded video
  thumbnailUrl: text("thumbnail_url"), // auto-generated or extracted thumbnail
  testDescription: text("test_description").notNull(), // what was being tested
  testPlanSummary: text("test_plan_summary"), // full test plan for context
  duration: integer("duration"), // video duration in seconds
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  approvedAt: timestamp("approved_at"),
  approvedBy: text("approved_by"),
  rejectionReason: text("rejection_reason"),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertHelpVideoCandidateSchema = createInsertSchema(helpVideoCandidates).omit({
  id: true,
  approvedAt: true,
  createdAt: true,
});

export type InsertHelpVideoCandidate = z.infer<typeof insertHelpVideoCandidateSchema>;
export type HelpVideoCandidate = typeof helpVideoCandidates.$inferSelect;

// Video candidate status enum
export const VideoCandidateStatus = z.enum(["pending", "approved", "rejected"]);
export type VideoCandidateStatusType = z.infer<typeof VideoCandidateStatus>;

// App Settings - single-row table for global app configuration
export const appSettings = pgTable("app_settings", {
  id: varchar("id").primaryKey().default("default"),
  nacaApiKey: text("naca_api_key"),
  nacaApiKeyDisabled: boolean("naca_api_key_disabled").default(false),
  nacaEnvironment: text("naca_environment").default("production"),
  nacaRemoteVersion: text("naca_remote_version"),
  nacaRemoteCodeHash: text("naca_remote_code_hash"),
  nacaRemoteLastFetched: timestamp("naca_remote_last_fetched"),
  nacaRemoteReviewedAt: timestamp("naca_remote_reviewed_at"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAppSettingsSchema = createInsertSchema(appSettings).omit({
  updatedAt: true,
});

export type InsertAppSettings = z.infer<typeof insertAppSettingsSchema>;
export type AppSettings = typeof appSettings.$inferSelect;

// API Documentation - stores generated API docs for bi-directional communication with NACA
export const apiDocs = pgTable("api_docs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  slug: text("slug").notNull().unique(), // e.g., "activity-editor" for the main doc
  version: text("version").notNull().default("1.0.0"), // semantic version
  title: text("title").notNull(),
  description: text("description"),
  // Machine-readable payload for build agents
  jsonPayload: jsonb("json_payload").$type<{
    apiVersion: string;
    generatedAt: string;
    schemaHash: string;
    endpoints: Array<{
      id: string;
      path: string;
      method: string;
      description: string;
      category: string;
      requestSchema?: Record<string, unknown>;
      responseSchema?: Record<string, unknown>;
      samples?: {
        request?: Record<string, unknown>;
        response?: Record<string, unknown>;
      };
      parameters?: Array<{
        name: string;
        in: 'path' | 'query' | 'body';
        type: string;
        required: boolean;
        description?: string;
      }>;
    }>;
    schemas: Record<string, {
      name: string;
      fields: Array<{
        name: string;
        type: string;
        required: boolean;
        description?: string;
      }>;
    }>;
    sharedComponents?: Record<string, {
      name: string;
      description: string;
      props?: Record<string, unknown>;
      usage?: string;
    }>;
    websocketTopics?: Array<{
      name: string;
      direction: 'inbound' | 'outbound' | 'bidirectional';
      description: string;
      payloadSchema?: Record<string, unknown>;
    }>;
  }>(),
  // Human-readable markdown content
  markdownPayload: text("markdown_payload"),
  // Assets manifest for screenshots/images
  assetsManifest: jsonb("assets_manifest").$type<Array<{
    id: string;
    type: 'screenshot' | 'diagram' | 'component-preview';
    path: string;
    caption?: string;
    componentRef?: string;
  }>>().default([]),
  // Publishing status
  publishStatus: text("publish_status").notNull().default("draft"), // draft, published, pending
  publishedAt: timestamp("published_at"),
  publishedToDev: boolean("published_to_dev").default(false),
  publishedToProd: boolean("published_to_prod").default(false),
  lastDevPublishAt: timestamp("last_dev_publish_at"),
  lastProdPublishAt: timestamp("last_prod_publish_at"),
  // Tracking
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
  schemaHash: text("schema_hash"), // hash of routes+schemas for drift detection
  commitSha: text("commit_sha"), // git commit when last published
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertApiDocsSchema = createInsertSchema(apiDocs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertApiDocs = z.infer<typeof insertApiDocsSchema>;
export type ApiDocs = typeof apiDocs.$inferSelect;

// Publish status enum
export const ApiDocsPublishStatus = z.enum(["draft", "published", "pending"]);
export type ApiDocsPublishStatusType = z.infer<typeof ApiDocsPublishStatus>;

// Subdomain Configuration - tracks custom domain setup and DNS validation
export const subdomains = pgTable("subdomains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  subdomain: text("subdomain").notNull().unique(), // e.g., "create", "api.create"
  parentDomain: text("parent_domain").notNull().default("naca.community"),
  fullDomain: text("full_domain").notNull(), // e.g., "create.naca.community"
  purpose: text("purpose").notNull(), // e.g., "main-app", "api-docs", "staging"
  description: text("description"),
  targetIp: text("target_ip").notNull().default("34.111.179.208"), // Replit deployment IP
  dnsStatus: text("dns_status").notNull().default("pending"), // pending, propagating, verified, error
  replitVerified: boolean("replit_verified").default(false),
  sslCertStatus: text("ssl_cert_status").default("pending"), // pending, active, error
  lastDnsCheck: timestamp("last_dns_check"),
  dnsCheckResult: jsonb("dns_check_result").$type<{
    resolvedIp?: string;
    httpStatus?: number;
    error?: string;
    checkedAt: string;
  }>(),
  porkbunRecords: jsonb("porkbun_records").$type<{
    aRecord?: { host: string; answer: string; added: boolean };
    txtRecord?: { host: string; answer: string; added: boolean };
  }>(),
  replitVerificationCode: text("replit_verification_code"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSubdomainSchema = createInsertSchema(subdomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertSubdomain = z.infer<typeof insertSubdomainSchema>;
export type Subdomain = typeof subdomains.$inferSelect;

export const SubdomainDnsStatus = z.enum(["pending", "propagating", "verified", "error"]);
export type SubdomainDnsStatusType = z.infer<typeof SubdomainDnsStatus>;
