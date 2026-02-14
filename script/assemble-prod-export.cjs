const fs = require('fs');

const jsonChunks = [];
jsonChunks.push(fs.readFileSync('/tmp/json_chunk_1.txt', 'utf8'));
jsonChunks.push(fs.readFileSync('/tmp/json_chunk_2.txt', 'utf8'));
jsonChunks.push(fs.readFileSync('/tmp/json_chunk_3.txt', 'utf8'));
jsonChunks.push(fs.readFileSync('/tmp/json_chunk_4.txt', 'utf8'));
jsonChunks.push(fs.readFileSync('/tmp/json_chunk_5.txt', 'utf8'));
jsonChunks.push(fs.readFileSync('/tmp/json_chunk_6.txt', 'utf8'));
const fullJson = jsonChunks.join('');

function escapeSQL(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

const schemaSql = `-- Production Database Schema Export
-- Generated: ${new Date().toISOString()}
-- Environment: production
-- Tables: 17 (excludes session, settings_profiles)

CREATE TABLE IF NOT EXISTS "projects" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "name" text NOT NULL,
  "description" text,
  "figma_file_key" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "figma_page_id" text,
  "figma_last_synced_at" timestamp,
  "figma_branch" text,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "username" text NOT NULL,
  "password" text NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "users_username_unique" UNIQUE ("username")
);

CREATE TABLE IF NOT EXISTS "screens" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "title" text NOT NULL,
  "image_url" text NOT NULL,
  "width" integer NOT NULL DEFAULT 1194,
  "height" integer NOT NULL DEFAULT 834,
  "position_x" integer DEFAULT 0,
  "position_y" integer DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "project_id" varchar,
  "figma_frame_id" text,
  "figma_node_hash" text,
  "naca_activity_id" text,
  "naca_community_id" text,
  CONSTRAINT "screens_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "app_settings" (
  "id" varchar NOT NULL DEFAULT 'default'::character varying,
  "naca_api_key" text,
  "naca_environment" text DEFAULT 'production'::text,
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "naca_api_key_disabled" boolean DEFAULT false,
  "naca_remote_version" text,
  "naca_remote_code_hash" text,
  "naca_remote_last_fetched" timestamp,
  "naca_remote_reviewed_at" timestamp,
  CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "scenes" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "screen_id" varchar NOT NULL,
  "name" text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  "is_default" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "scenes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "game_objects" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "screen_id" varchar NOT NULL,
  "figma_node_id" text,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "x" real NOT NULL DEFAULT 0,
  "y" real NOT NULL DEFAULT 0,
  "width" real NOT NULL DEFAULT 100,
  "height" real NOT NULL DEFAULT 100,
  "rotation" real DEFAULT 0,
  "scale_x" real DEFAULT 1,
  "scale_y" real DEFAULT 1,
  "opacity" real DEFAULT 1,
  "visible" boolean DEFAULT true,
  "data_key" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "custom_id" text,
  "classes" text[] DEFAULT '{}'::text[],
  "tags" text[] DEFAULT '{}'::text[],
  "z_index" integer DEFAULT 0,
  "media_url" text,
  "audio_url" text,
  "metadata" jsonb,
  "locked" boolean DEFAULT false,
  CONSTRAINT "game_objects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "animations" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "object_id" varchar NOT NULL,
  "scene_id" varchar,
  "name" text NOT NULL DEFAULT 'Animation'::text,
  "duration" real NOT NULL DEFAULT 1,
  "loop" boolean DEFAULT false,
  "autoplay" boolean DEFAULT false,
  "playback_rate" real DEFAULT 1,
  "order" integer DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "animations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "keyframes" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "animation_id" varchar NOT NULL,
  "time" real NOT NULL DEFAULT 0,
  "property" text NOT NULL,
  "value" jsonb NOT NULL,
  "ease" text DEFAULT 'power2.out'::text,
  "locked" boolean DEFAULT false,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "keyframes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "triggers" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "scene_id" varchar NOT NULL,
  "object_id" varchar,
  "type" text NOT NULL,
  "target_scene_id" varchar,
  "delay" real DEFAULT 0,
  "condition" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "target_selector" text,
  "action" text DEFAULT 'goToScene'::text,
  "action_payload" jsonb,
  CONSTRAINT "triggers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "object_states" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "scene_id" varchar NOT NULL,
  "object_id" varchar NOT NULL,
  "x" real,
  "y" real,
  "rotation" real,
  "scale_x" real,
  "scale_y" real,
  "opacity" real,
  "visible" boolean,
  "animation_duration" real DEFAULT 0.3,
  "animation_ease" text DEFAULT 'power2.out'::text,
  CONSTRAINT "object_states_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "figma_nodes" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "project_id" varchar NOT NULL,
  "node_id" text NOT NULL,
  "parent_node_id" text,
  "screen_id" varchar,
  "name" text NOT NULL,
  "type" text NOT NULL,
  "hash" text,
  "x" real,
  "y" real,
  "width" real,
  "height" real,
  "order" integer DEFAULT 0,
  "last_synced_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "figma_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "vocabulary" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "project_id" varchar,
  "word" text NOT NULL,
  "translation" text NOT NULL,
  "image_url" text,
  "audio_url" text,
  "category" text,
  "difficulty" integer DEFAULT 1,
  "metadata" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "vocabulary_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "feature_help" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "feature_key" text NOT NULL,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "video_url" text,
  "thumbnail_url" text,
  "category" text NOT NULL,
  "shortcut_key" text,
  "related_features" text[] DEFAULT '{}'::text[],
  "order" integer DEFAULT 0,
  "is_new" boolean DEFAULT true,
  "documented_at" timestamp,
  "tested_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  "view_count" integer DEFAULT 0,
  "last_viewed_at" timestamp,
  CONSTRAINT "feature_help_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "feature_help_feature_key_unique" UNIQUE ("feature_key")
);

CREATE TABLE IF NOT EXISTS "help_video_candidates" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "feature_key" text NOT NULL,
  "video_url" text NOT NULL,
  "thumbnail_url" text,
  "test_description" text NOT NULL,
  "test_plan_summary" text,
  "duration" integer,
  "status" text NOT NULL DEFAULT 'pending'::text,
  "approved_at" timestamp,
  "approved_by" text,
  "rejection_reason" text,
  "captured_at" timestamp NOT NULL DEFAULT now(),
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "help_video_candidates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "api_docs" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "slug" text NOT NULL,
  "version" text NOT NULL DEFAULT '1.0.0'::text,
  "title" text NOT NULL,
  "description" text,
  "json_payload" jsonb,
  "markdown_payload" text,
  "assets_manifest" jsonb DEFAULT '[]'::jsonb,
  "publish_status" text NOT NULL DEFAULT 'draft'::text,
  "published_at" timestamp,
  "published_to_dev" boolean DEFAULT false,
  "published_to_prod" boolean DEFAULT false,
  "last_dev_publish_at" timestamp,
  "last_prod_publish_at" timestamp,
  "last_updated" timestamp NOT NULL DEFAULT now(),
  "schema_hash" text,
  "commit_sha" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "api_docs_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "api_docs_slug_unique" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "subdomains" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "subdomain" text NOT NULL,
  "parent_domain" text NOT NULL DEFAULT 'naca.community'::text,
  "full_domain" text NOT NULL,
  "purpose" text NOT NULL,
  "description" text,
  "target_ip" text NOT NULL DEFAULT '34.111.179.208'::text,
  "dns_status" text NOT NULL DEFAULT 'pending'::text,
  "replit_verified" boolean DEFAULT false,
  "ssl_cert_status" text DEFAULT 'pending'::text,
  "last_dns_check" timestamp,
  "dns_check_result" jsonb,
  "porkbun_records" jsonb,
  "replit_verification_code" text,
  "is_active" boolean DEFAULT true,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "subdomains_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "subdomains_subdomain_unique" UNIQUE ("subdomain")
);

CREATE TABLE IF NOT EXISTS "timeline_actions" (
  "id" varchar NOT NULL DEFAULT gen_random_uuid(),
  "animation_id" varchar NOT NULL,
  "target_animation_id" varchar NOT NULL,
  "action" text NOT NULL,
  "trigger_time" real NOT NULL,
  "target_frame" real,
  "parameters" jsonb,
  "created_at" timestamp NOT NULL DEFAULT now(),
  CONSTRAINT "timeline_actions_pkey" PRIMARY KEY ("id")
);

-- Foreign Key Constraints
ALTER TABLE "screens" ADD CONSTRAINT "screens_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id");
ALTER TABLE "scenes" ADD CONSTRAINT "scenes_screen_id_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "screens"("id");
ALTER TABLE "game_objects" ADD CONSTRAINT "game_objects_screen_id_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "screens"("id");
ALTER TABLE "animations" ADD CONSTRAINT "animations_object_id_game_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "game_objects"("id");
ALTER TABLE "animations" ADD CONSTRAINT "animations_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "scenes"("id");
ALTER TABLE "keyframes" ADD CONSTRAINT "keyframes_animation_id_animations_id_fk" FOREIGN KEY ("animation_id") REFERENCES "animations"("id");
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "scenes"("id");
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_object_id_game_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "game_objects"("id");
ALTER TABLE "triggers" ADD CONSTRAINT "triggers_target_scene_id_scenes_id_fk" FOREIGN KEY ("target_scene_id") REFERENCES "scenes"("id");
ALTER TABLE "object_states" ADD CONSTRAINT "object_states_scene_id_scenes_id_fk" FOREIGN KEY ("scene_id") REFERENCES "scenes"("id");
ALTER TABLE "object_states" ADD CONSTRAINT "object_states_object_id_game_objects_id_fk" FOREIGN KEY ("object_id") REFERENCES "game_objects"("id");
ALTER TABLE "figma_nodes" ADD CONSTRAINT "figma_nodes_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id");
ALTER TABLE "figma_nodes" ADD CONSTRAINT "figma_nodes_screen_id_screens_id_fk" FOREIGN KEY ("screen_id") REFERENCES "screens"("id");
ALTER TABLE "vocabulary" ADD CONSTRAINT "vocabulary_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "projects"("id");
ALTER TABLE "timeline_actions" ADD CONSTRAINT "timeline_actions_animation_id_animations_id_fk" FOREIGN KEY ("animation_id") REFERENCES "animations"("id");
ALTER TABLE "timeline_actions" ADD CONSTRAINT "timeline_actions_target_animation_id_animations_id_fk" FOREIGN KEY ("target_animation_id") REFERENCES "animations"("id");
`;

fs.writeFileSync('db_exports/production/schema.sql', schemaSql);
console.log('Production schema.sql written');

const apiDocsInsert = `INSERT INTO "api_docs" ("id", "slug", "version", "title", "description", "json_payload", "markdown_payload", "assets_manifest", "publish_status", "published_at", "published_to_dev", "published_to_prod", "last_dev_publish_at", "last_prod_publish_at", "last_updated", "schema_hash", "commit_sha", "created_at", "updated_at") VALUES ('358b8351-6910-4eb5-b70b-7223957d179d', 'activity-editor', '1.0.0', 'Activity Editor API', 'API documentation for the Activity Editor, enabling NACA integration for language learning activities', ${escapeSQL(fullJson)}, NULL, '[]', 'published', NULL, TRUE, TRUE, NULL, NULL, '2025-12-05 00:58:55.106', 'a8da6e96', '', '2025-12-04 20:26:00.717433', '2025-12-05 00:58:55.106');`;

const dataSql = `-- Production Database Data Export
-- Generated: ${new Date().toISOString()}
-- Environment: production
-- Tables: 17

-- Table: projects (2 rows)
INSERT INTO "projects" ("id", "name", "description", "figma_file_key", "figma_page_id", "figma_last_synced_at", "figma_branch", "created_at", "updated_at") VALUES ('01512834-9c76-4200-82a9-23f89ee98d85', 'Test Import', 'Imported from activity test-import (v1.0.0)', NULL, NULL, NULL, NULL, '2025-12-02 07:13:58.56743', '2025-12-02 07:13:58.56743');
INSERT INTO "projects" ("id", "name", "description", "figma_file_key", "figma_page_id", "figma_last_synced_at", "figma_branch", "created_at", "updated_at") VALUES ('cd2da62d-c8a9-49c7-a9e8-f81dad9bd48c', 'My First Project', 'Language learning game project', 't7pK8hklnuPRznSvLQLPX8', NULL, '2025-12-04 04:52:40.547', NULL, '2025-12-02 03:27:33.043328', '2025-12-04 04:52:40.547');

-- Table: users (empty - no data)

-- Table: screens (5 rows)
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('90a3c6a0-e7b4-4c86-9cac-be64e923768b', 'Dashboard', '/@fs/home/runner/workspace/attached_assets/generated_images/mobile_app_dashboard_screen.png', 375, 812, 0, 0, '2025-12-02 01:47:47.908913', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('ee4508e6-6720-47f3-9767-9dc2a2124bb7', 'Login Screen', '/@fs/home/runner/workspace/attached_assets/generated_images/mobile_app_login_screen.png', 375, 812, 0, 0, '2025-12-02 01:47:47.985352', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('cee86f25-356e-43c4-93d8-928b03474c40', 'Settings', '/@fs/home/runner/workspace/attached_assets/generated_images/mobile_app_settings_screen.png', 375, 812, 0, 0, '2025-12-02 01:47:47.984655', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('763e5605-aab0-4c7c-8f29-3c6609c46764', 'Activity_Center_Artwork 1', '/@fs/home/runner/workspace/attached_assets/figma_screens/1_2813_0161cc8e.png', 1440, 1080, 0, 0, '2025-12-02 04:10:00.854111', 'cd2da62d-c8a9-49c7-a9e8-f81dad9bd48c', '1:2813', '19586d49b602', NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('4e9b5bc7-4d60-4e63-8147-9b1ccb196a23', 'Test Screen', '/test.png', 800, 600, 0, 0, '2025-12-02 07:13:58.602848', '01512834-9c76-4200-82a9-23f89ee98d85', '1:1234', NULL, NULL, NULL);

-- Table: app_settings (1 row)
INSERT INTO "app_settings" ("id", "naca_api_key", "naca_environment", "updated_at", "naca_api_key_disabled", "naca_remote_version", "naca_remote_code_hash", "naca_remote_last_fetched", "naca_remote_reviewed_at") VALUES ('default', NULL, 'production', '2025-12-04 23:35:35.527', TRUE, '1.0.0', NULL, '2025-12-04 23:35:34.239', '2025-12-04 23:35:35.504');

-- Table: scenes (3 rows)
INSERT INTO "scenes" ("id", "screen_id", "name", "order", "is_default", "created_at") VALUES ('5a868e90-b2a3-4d22-a0a1-4a13ee865926', 'cee86f25-356e-43c4-93d8-928b03474c40', 'Test Scene', 0, FALSE, '2025-12-02 02:16:25.876164');
INSERT INTO "scenes" ("id", "screen_id", "name", "order", "is_default", "created_at") VALUES ('bac8ea8e-0a97-4134-bd7d-b18503e5c38c', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', 'Correct', 0, FALSE, '2025-12-02 02:19:32.644823');
INSERT INTO "scenes" ("id", "screen_id", "name", "order", "is_default", "created_at") VALUES ('58a77d18-e6bc-43fe-8d4c-bf810e368b41', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', 'Incorrect', 1, FALSE, '2025-12-02 02:19:52.694098');

-- Table: game_objects (81 rows)
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a2acb355-d340-4f85-b1c0-f1d7a5aa4ec5', 'ee4508e6-6720-47f3-9767-9dc2a2124bb7', NULL, 'Object 1', 'shape', 50, 50, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 02:13:06.911603', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6c19b27f-ee8d-4e3c-8abf-ca7c5ec77fd7', 'cee86f25-356e-43c4-93d8-928b03474c40', NULL, 'Object 1', 'shape', 50, 50, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 02:16:05.437593', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('bb541b39-429e-4749-ac72-af20f9418c5e', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:2814', 'Vocab_Review_Activity', 'group', 1.5499878, -1.75, 1435.52, 1089.49, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:47.98009', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('49d0469a-c1de-48e2-b0b3-1fca2945aeef', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:2815', 'Background_3', 'frame', 1.5499878, -1.75, 1435.52, 1089.49, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.035258', NULL, '{}'::text[], '{}'::text[], 1, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('843ce308-1588-483f-a9f7-339b9ef505a3', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3203', 'Display_Window', 'frame', 58.27997, 216.20001, 1355.41, 728.77, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.079348', NULL, '{}'::text[], '{}'::text[], 2, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('64338541-a6c5-4e86-a2c2-2e6715bc0b5b', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3306', 'Game_Selection_Activity', 'group', -0.9500122, 1.7399902, 1437.77, 1076.51, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.123922', NULL, '{}'::text[], '{}'::text[], 3, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('4d46de96-96c9-448e-995f-624002e9c5ae', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3307', 'Background_2', 'frame', -0.9500122, 1.7399902, 1437.77, 1076.51, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.168217', NULL, '{}'::text[], '{}'::text[], 4, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('5d4da644-31a3-4e43-a8aa-8e4adcc447b7', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3353', 'Game_Selection_Button', 'frame', 80.91998, 156.76001, 451.79, 186.41, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.213181', NULL, '{}'::text[], '{}'::text[], 5, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('d42c813c-2f51-44c9-b718-f309df1d0f47', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3427', 'Category_Selection_Activity', 'group', -0.9500122, 1.7399902, 1437.77, 1076.51, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.256195', NULL, '{}'::text[], '{}'::text[], 6, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('91540ea9-4848-4468-846d-7ea3d961f9b3', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3428', 'Background_2', 'frame', -0.9500122, 1.7399902, 1437.77, 1076.51, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.298443', NULL, '{}'::text[], '{}'::text[], 7, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ffc8836d-c874-4be7-a9e4-477d684b6453', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3474', 'Category_Selection_Button', 'frame', 82, 193.68, 247.13, 292.63, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.342732', NULL, '{}'::text[], '{}'::text[], 8, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6293aa11-d8b8-4934-b8ee-c5f70939c6b3', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3705', 'Dialect_Selection_Activity', 'group', -275, -645, 2262.55, 2233.05, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.386345', NULL, '{}'::text[], '{}'::text[], 9, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('de05e957-d0b8-4e9b-9914-ef93becb3884', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6219', 'Region_1_Button', 'component', 66.82001, 780.7999, 249.47, 83, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.475831', NULL, '{}'::text[], '{}'::text[], 11, NULL, NULL, NULL, FALSE);
-- Remaining game_objects loaded from query results file
`;

fs.writeFileSync('db_exports/production/data_header.sql', dataSql);
console.log('Production data header written - will assemble via query-based approach');
console.log('JSON payload length:', fullJson.length);
