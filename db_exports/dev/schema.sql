-- Database Schema Export (Development)
-- Generated: 2026-02-13T09:41:14.616Z

CREATE TABLE IF NOT EXISTS "projects" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "figma_file_key" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "figma_page_id" TEXT,
  "figma_last_synced_at" TIMESTAMP,
  "figma_branch" TEXT,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "users" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "username" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  PRIMARY KEY ("id"),
  UNIQUE ("username")
);

CREATE TABLE IF NOT EXISTS "screens" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "title" TEXT NOT NULL,
  "image_url" TEXT NOT NULL,
  "width" INTEGER NOT NULL DEFAULT 1194,
  "height" INTEGER NOT NULL DEFAULT 834,
  "position_x" INTEGER DEFAULT 0,
  "position_y" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "project_id" VARCHAR,
  "figma_frame_id" TEXT,
  "figma_node_hash" TEXT,
  "naca_activity_id" TEXT,
  "naca_community_id" TEXT,
  PRIMARY KEY ("id")
);

ALTER TABLE "screens" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "app_settings" (
  "id" VARCHAR NOT NULL DEFAULT 'default'::character varying,
  "naca_api_key" TEXT,
  "naca_environment" TEXT DEFAULT 'production'::text,
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "naca_api_key_disabled" BOOLEAN DEFAULT false,
  "naca_remote_version" TEXT,
  "naca_remote_code_hash" TEXT,
  "naca_remote_last_fetched" TIMESTAMP,
  "naca_remote_reviewed_at" TIMESTAMP,
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "scenes" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "screen_id" VARCHAR NOT NULL,
  "name" TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "is_default" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "scenes" ADD FOREIGN KEY ("screen_id") REFERENCES "screens" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "game_objects" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "screen_id" VARCHAR NOT NULL,
  "figma_node_id" TEXT,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "x" REAL NOT NULL DEFAULT 0,
  "y" REAL NOT NULL DEFAULT 0,
  "width" REAL NOT NULL DEFAULT 100,
  "height" REAL NOT NULL DEFAULT 100,
  "rotation" REAL DEFAULT 0,
  "scale_x" REAL DEFAULT 1,
  "scale_y" REAL DEFAULT 1,
  "opacity" REAL DEFAULT 1,
  "visible" BOOLEAN DEFAULT true,
  "data_key" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "custom_id" TEXT,
  "classes" TEXT[] DEFAULT '{}'::text[],
  "tags" TEXT[] DEFAULT '{}'::text[],
  "z_index" INTEGER DEFAULT 0,
  "media_url" TEXT,
  "audio_url" TEXT,
  "metadata" JSONB,
  "locked" BOOLEAN DEFAULT false,
  PRIMARY KEY ("id")
);

ALTER TABLE "game_objects" ADD FOREIGN KEY ("screen_id") REFERENCES "screens" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "animations" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "object_id" VARCHAR NOT NULL,
  "scene_id" VARCHAR,
  "name" TEXT NOT NULL DEFAULT 'Animation'::text,
  "duration" REAL NOT NULL DEFAULT 1,
  "loop" BOOLEAN DEFAULT false,
  "autoplay" BOOLEAN DEFAULT false,
  "playback_rate" REAL DEFAULT 1,
  "order" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "animations" ADD FOREIGN KEY ("object_id") REFERENCES "game_objects" ("id") ON DELETE CASCADE;
ALTER TABLE "animations" ADD FOREIGN KEY ("scene_id") REFERENCES "scenes" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "keyframes" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "animation_id" VARCHAR NOT NULL,
  "time" REAL NOT NULL DEFAULT 0,
  "property" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "ease" TEXT DEFAULT 'power2.out'::text,
  "locked" BOOLEAN DEFAULT false,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "keyframes" ADD FOREIGN KEY ("animation_id") REFERENCES "animations" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "object_states" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "scene_id" VARCHAR NOT NULL,
  "object_id" VARCHAR NOT NULL,
  "x" REAL,
  "y" REAL,
  "rotation" REAL,
  "scale_x" REAL,
  "scale_y" REAL,
  "opacity" REAL,
  "visible" BOOLEAN,
  "animation_duration" REAL DEFAULT 0.3,
  "animation_ease" TEXT DEFAULT 'power2.out'::text,
  PRIMARY KEY ("id")
);

ALTER TABLE "object_states" ADD FOREIGN KEY ("object_id") REFERENCES "game_objects" ("id") ON DELETE CASCADE;
ALTER TABLE "object_states" ADD FOREIGN KEY ("scene_id") REFERENCES "scenes" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "triggers" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "scene_id" VARCHAR NOT NULL,
  "object_id" VARCHAR,
  "type" TEXT NOT NULL,
  "target_scene_id" VARCHAR,
  "delay" REAL DEFAULT 0,
  "condition" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "target_selector" TEXT,
  "action" TEXT DEFAULT 'goToScene'::text,
  "action_payload" JSONB,
  PRIMARY KEY ("id")
);

ALTER TABLE "triggers" ADD FOREIGN KEY ("object_id") REFERENCES "game_objects" ("id") ON DELETE CASCADE;
ALTER TABLE "triggers" ADD FOREIGN KEY ("scene_id") REFERENCES "scenes" ("id") ON DELETE CASCADE;
ALTER TABLE "triggers" ADD FOREIGN KEY ("target_scene_id") REFERENCES "scenes" ("id") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "timeline_actions" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "animation_id" VARCHAR NOT NULL,
  "target_animation_id" VARCHAR NOT NULL,
  "action" TEXT NOT NULL,
  "trigger_time" REAL NOT NULL,
  "target_frame" REAL,
  "parameters" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "timeline_actions" ADD FOREIGN KEY ("animation_id") REFERENCES "animations" ("id") ON DELETE CASCADE;
ALTER TABLE "timeline_actions" ADD FOREIGN KEY ("target_animation_id") REFERENCES "animations" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "figma_nodes" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "project_id" VARCHAR NOT NULL,
  "node_id" TEXT NOT NULL,
  "parent_node_id" TEXT,
  "screen_id" VARCHAR,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "hash" TEXT,
  "x" REAL,
  "y" REAL,
  "width" REAL,
  "height" REAL,
  "order" INTEGER DEFAULT 0,
  "last_synced_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "figma_nodes" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;
ALTER TABLE "figma_nodes" ADD FOREIGN KEY ("screen_id") REFERENCES "screens" ("id") ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS "api_docs" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "slug" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT '1.0.0'::text,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "json_payload" JSONB,
  "markdown_payload" TEXT,
  "assets_manifest" JSONB DEFAULT '[]'::jsonb,
  "publish_status" TEXT NOT NULL DEFAULT 'draft'::text,
  "published_at" TIMESTAMP,
  "published_to_dev" BOOLEAN DEFAULT false,
  "published_to_prod" BOOLEAN DEFAULT false,
  "last_dev_publish_at" TIMESTAMP,
  "last_prod_publish_at" TIMESTAMP,
  "last_updated" TIMESTAMP NOT NULL DEFAULT now(),
  "schema_hash" TEXT,
  "commit_sha" TEXT,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "feature_help" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "feature_key" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "video_url" TEXT,
  "thumbnail_url" TEXT,
  "category" TEXT NOT NULL,
  "shortcut_key" TEXT,
  "related_features" TEXT[] DEFAULT '{}'::text[],
  "order" INTEGER DEFAULT 0,
  "is_new" BOOLEAN DEFAULT true,
  "documented_at" TIMESTAMP,
  "tested_at" TIMESTAMP,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  "view_count" INTEGER DEFAULT 0,
  "last_viewed_at" TIMESTAMP,
  PRIMARY KEY ("id"),
  UNIQUE ("feature_key")
);

CREATE TABLE IF NOT EXISTS "help_video_candidates" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "feature_key" TEXT NOT NULL,
  "video_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "test_description" TEXT NOT NULL,
  "test_plan_summary" TEXT,
  "duration" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'pending'::text,
  "approved_at" TIMESTAMP,
  "approved_by" TEXT,
  "rejection_reason" TEXT,
  "captured_at" TIMESTAMP NOT NULL DEFAULT now(),
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "subdomains" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "subdomain" TEXT NOT NULL,
  "parent_domain" TEXT NOT NULL DEFAULT 'naca.community'::text,
  "full_domain" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "description" TEXT,
  "target_ip" TEXT NOT NULL DEFAULT '34.111.179.208'::text,
  "dns_status" TEXT NOT NULL DEFAULT 'pending'::text,
  "replit_verified" BOOLEAN DEFAULT false,
  "ssl_cert_status" TEXT DEFAULT 'pending'::text,
  "last_dns_check" TIMESTAMP,
  "dns_check_result" JSONB,
  "porkbun_records" JSONB,
  "replit_verification_code" TEXT,
  "is_active" BOOLEAN DEFAULT true,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id"),
  UNIQUE ("subdomain")
);

CREATE TABLE IF NOT EXISTS "vocabulary" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "project_id" VARCHAR,
  "word" TEXT NOT NULL,
  "translation" TEXT NOT NULL,
  "image_url" TEXT,
  "audio_url" TEXT,
  "category" TEXT,
  "difficulty" INTEGER DEFAULT 1,
  "metadata" JSONB,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "vocabulary" ADD FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "session" (
  "sid" VARCHAR NOT NULL,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP NOT NULL,
  PRIMARY KEY ("sid")
);

CREATE TABLE IF NOT EXISTS "settings_profiles" (
  "id" VARCHAR NOT NULL DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL DEFAULT 'Default'::text,
  "user_id" VARCHAR,
  "community_id" TEXT,
  "is_default" BOOLEAN DEFAULT false,
  "is_global" BOOLEAN DEFAULT false,
  "data" JSONB NOT NULL,
  "created_at" TIMESTAMP NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
  PRIMARY KEY ("id")
);

ALTER TABLE "settings_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX api_docs_slug_unique ON public.api_docs USING btree (slug);
CREATE UNIQUE INDEX feature_help_feature_key_unique ON public.feature_help USING btree (feature_key);
CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);
CREATE UNIQUE INDEX subdomains_subdomain_unique ON public.subdomains USING btree (subdomain);
CREATE UNIQUE INDEX users_username_unique ON public.users USING btree (username);

