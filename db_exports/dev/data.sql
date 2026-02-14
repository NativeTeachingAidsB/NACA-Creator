-- Database Data Export (Development)
-- Generated: 2026-02-13T09:41:14.618Z

-- Table: projects (2 rows)
INSERT INTO "projects" ("id", "name", "description", "figma_file_key", "created_at", "updated_at", "figma_page_id", "figma_last_synced_at", "figma_branch") VALUES ('01512834-9c76-4200-82a9-23f89ee98d85', 'Test Import', 'Imported from activity test-import (v1.0.0)', NULL, '2025-12-02 07:13:58.567', '2025-12-02 07:13:58.567', NULL, NULL, NULL);
INSERT INTO "projects" ("id", "name", "description", "figma_file_key", "created_at", "updated_at", "figma_page_id", "figma_last_synced_at", "figma_branch") VALUES ('cd2da62d-c8a9-49c7-a9e8-f81dad9bd48c', 'My First Project', 'Language learning game project', 't7pK8hklnuPRznSvLQLPX8', '2025-12-02 03:27:33.043', '2025-12-04 04:52:40.547', NULL, '2025-12-04 04:52:40.547', NULL);

-- Table: users (empty - no data)

-- Table: screens (5 rows)
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('90a3c6a0-e7b4-4c86-9cac-be64e923768b', 'Dashboard', '/@fs/home/runner/workspace/attached_assets/generated_images/mobile_app_dashboard_screen.png', 375, 812, 0, 0, '2025-12-02 01:47:47.908', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('ee4508e6-6720-47f3-9767-9dc2a2124bb7', 'Login Screen', '/@fs/home/runner/workspace/attached_assets/generated_images/mobile_app_login_screen.png', 375, 812, 0, 0, '2025-12-02 01:47:47.985', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('cee86f25-356e-43c4-93d8-928b03474c40', 'Settings', '/@fs/home/runner/workspace/attached_assets/generated_images/mobile_app_settings_screen.png', 375, 812, 0, 0, '2025-12-02 01:47:47.984', NULL, NULL, NULL, NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('763e5605-aab0-4c7c-8f29-3c6609c46764', 'Activity_Center_Artwork 1', '/@fs/home/runner/workspace/attached_assets/figma_screens/1_2813_0161cc8e.png', 1440, 1080, 0, 0, '2025-12-02 04:10:00.854', 'cd2da62d-c8a9-49c7-a9e8-f81dad9bd48c', '1:2813', '19586d49b602', NULL, NULL);
INSERT INTO "screens" ("id", "title", "image_url", "width", "height", "position_x", "position_y", "created_at", "project_id", "figma_frame_id", "figma_node_hash", "naca_activity_id", "naca_community_id") VALUES ('4e9b5bc7-4d60-4e63-8147-9b1ccb196a23', 'Test Screen', '/test.png', 800, 600, 0, 0, '2025-12-02 07:13:58.602', '01512834-9c76-4200-82a9-23f89ee98d85', '1:1234', NULL, NULL, NULL);

-- Table: app_settings (1 rows)
INSERT INTO "app_settings" ("id", "naca_api_key", "naca_environment", "updated_at", "naca_api_key_disabled", "naca_remote_version", "naca_remote_code_hash", "naca_remote_last_fetched", "naca_remote_reviewed_at") VALUES ('default', NULL, 'production', '2025-12-05 04:23:21.098', TRUE, '1.0.0', NULL, '2025-12-05 04:23:21.076', '2025-12-04 23:35:35.504');

-- Table: scenes (3 rows)
INSERT INTO "scenes" ("id", "screen_id", "name", "order", "is_default", "created_at") VALUES ('5a868e90-b2a3-4d22-a0a1-4a13ee865926', 'cee86f25-356e-43c4-93d8-928b03474c40', 'Test Scene', 0, FALSE, '2025-12-02 02:16:25.876');
INSERT INTO "scenes" ("id", "screen_id", "name", "order", "is_default", "created_at") VALUES ('bac8ea8e-0a97-4134-bd7d-b18503e5c38c', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', 'Correct', 0, FALSE, '2025-12-02 02:19:32.644');
INSERT INTO "scenes" ("id", "screen_id", "name", "order", "is_default", "created_at") VALUES ('58a77d18-e6bc-43fe-8d4c-bf810e368b41', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', 'Incorrect', 1, FALSE, '2025-12-02 02:19:52.694');

-- Table: game_objects (73 rows)
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a2acb355-d340-4f85-b1c0-f1d7a5aa4ec5', 'ee4508e6-6720-47f3-9767-9dc2a2124bb7', NULL, 'Object 1', 'shape', 50, 50, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 02:13:06.911', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6c19b27f-ee8d-4e3c-8abf-ca7c5ec77fd7', 'cee86f25-356e-43c4-93d8-928b03474c40', NULL, 'Object 1', 'shape', 50, 50, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 02:16:05.437', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ffc8836d-c874-4be7-a9e4-477d684b6453', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3474', 'Category_Selection_Button', 'frame', 82, 193.68, 247.13, 292.63, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.342', NULL, '{}'::text[], '{}'::text[], 8, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('95da2cf3-c643-4a24-ab0a-4d6d6b508400', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6218', 'Region_5_Button', 'component', 444.84998, 662.51, 250.18, 102.96997, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.521', NULL, '{}'::text[], '{}'::text[], 12, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6861a4c1-7db8-4cbd-b898-44212a3fcb6a', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6214', 'Region_9_Button', 'component', 856.42993, 381.83997, 352.52002, 83, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.702', NULL, '{}'::text[], '{}'::text[], 16, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a31ece39-4bf8-4c10-b97f-542d556ea092', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6213', 'Region_8_Button', 'component', 581.22, 351.44, 250.73006, 92.75, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.747', NULL, '{}'::text[], '{}'::text[], 17, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('71ae7f89-ff5a-4c68-a11b-ee251bbbdb4d', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6211', 'Region_4_Button', 'component', 540.7, 762.30994, 163, 125.619995, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.835', NULL, '{}'::text[], '{}'::text[], 19, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('19c86de2-7dfd-4333-a292-0db2c4d0849f', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6210', 'Region_11_Button', 'component', 948.06006, 578.49, 325.99, 97.34003, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.878', NULL, '{}'::text[], '{}'::text[], 20, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a4885263-1be2-43d5-9129-182403573a25', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6209', 'Region_12_Button', 'component', 840.27, 690.52, 233, 129.83997, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.923', NULL, '{}'::text[], '{}'::text[], 21, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('e6a89103-e495-41f9-8e94-34b98d46d58e', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6207', 'Region_10_Button', 'component', 666.28, 554.57, 235, 123.95001, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.013', NULL, '{}'::text[], '{}'::text[], 23, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('d7c4641d-f64d-4ae9-86f5-a56b638b1491', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6203', 'Guide_Content_Display_Badge', 'component', 934.07983, 407.15002, 241.47, 129.33, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.233', NULL, '{}'::text[], '{}'::text[], 28, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('3ff82279-21ce-46f5-8f8a-eedcf04172cb', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6202', 'Guide_Badge', 'component', 301.07983, 357.68994, 154, 154, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.277', NULL, '{}'::text[], '{}'::text[], 29, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('da435a87-1bb6-4d2c-a693-79c2bb060b4e', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6198', 'OK_Buton', 'component', 1059.27, 490.39, 132.74399, 113.512, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.456', NULL, '{}'::text[], '{}'::text[], 33, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('49d0469a-c1de-48e2-b0b3-1fca2945aeef', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:2815', 'Background_3', 'frame', -636, 1213, 1435.52, 1089.49, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.035', NULL, '{}'::text[], '{}'::text[], 1, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('3d1b7163-7a4b-4b75-9ea1-40e22da1ef46', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6201', 'Talk_Bubble_Small', 'component', 373, 975, 819.292, 326.38, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.322', NULL, '{}'::text[], '{}'::text[], 30, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('c4dc9148-e342-41ee-8c85-71573f130a05', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6217', 'Region_3_Button', 'component', 103.47998, 646.04, 298.37, 95.28003, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.567', NULL, '{}'::text[], '{}'::text[], 13, NULL, NULL, NULL, TRUE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('5d4da644-31a3-4e43-a8aa-8e4adcc447b7', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3353', 'Game_Selection_Button', 'frame', 80.91998, 156.76001, 451.79, 186.41, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.213', NULL, '{}'::text[], '{}'::text[], 5, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6e12a127-b486-49b4-bf7d-ed7dd1109c8d', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6216', 'Region_6_Button', 'component', 271.76, 514.27, 243.17, 91.73999, 0, 1, 1, 1, FALSE, NULL, '2025-12-02 06:30:48.613', NULL, '{}'::text[], '{}'::text[], 14, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('f5b28603-11ac-467b-a93f-d8929e023d37', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6215', 'Region_7_Button', 'component', 402.45, 437.07, 276.44995, 99.19, 0, 1, 1, 1, FALSE, NULL, '2025-12-02 06:30:48.657', NULL, '{}'::text[], '{}'::text[], 15, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('de05e957-d0b8-4e9b-9914-ef93becb3884', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6219', 'Region_1_Button', 'component', 66.82001, 780.7999, 249.47, 83, 0, 1, 1, 1, FALSE, NULL, '2025-12-02 06:30:48.475', NULL, '{}'::text[], '{}'::text[], 11, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('4d46de96-96c9-448e-995f-624002e9c5ae', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3307', 'Background_2', 'frame', -731, 926, 1437.77, 1076.51, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.168', NULL, '{}'::text[], '{}'::text[], 4, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('d6e8b92a-7742-41ef-8668-bb8958900816', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6204', 'Guide_Content_Display', 'component', 108, 859, 757.84503, 229.215, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.189', NULL, '{}'::text[], '{}'::text[], 27, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a74f199c-6379-4853-86fc-2439647cc361', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6208', 'Region_13_Button', 'component', 467, 1088, 240.04993, 83, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.967', NULL, '{}'::text[], '{}'::text[], 22, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('64338541-a6c5-4e86-a2c2-2e6715bc0b5b', '763e5605-aab0-4c7c-8f29-3c6609c46764', '1:3306', 'Game_Selection_Activity', 'group', -490, 1213, 1437.77, 1076.51, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:48.123', NULL, '{}'::text[], '{}'::text[], 3, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a0c520ad-8330-43a4-a60d-9b9239e50558', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6197', 'Cancel_Button', 'component', 1059.2798, 365.02002, 132.74399, 107.124, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.500', NULL, '{}'::text[], '{}'::text[], 34, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('5f4ee5ec-ab37-4b6f-b3ad-ccb752529635', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 1 Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:14.078', 'Star_1_Layer', '{"symbol-star_1_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 8, NULL, NULL, '{"symbolPath":["Star_1_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ba6a344f-0eb2-40aa-90b6-58d8517d3e63', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 2', 'shape', -163, 146, 77, 109, 31, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:13.769', 'Cloud_2_FILL_1', '{"symbol-cloud_2"}'::text[], '{"svg-type-ellipse","adobe-animate","has-parent"}'::text[], 1005, NULL, NULL, '{"fill":"white","symbolPath":["Cloud_2"],"originalMarkup":"<ellipse xmlns=\"http://www.w3.org/2000/svg\" id=\"Cloud_2_FILL_1\" cx=\"320\" cy=\"70\" rx=\"50\" ry=\"25\" fill=\"white\" opacity=\"0.6\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('96b6626f-074f-44c7-9e62-5aa8bae27ed8', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 2 Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:14.780', 'Star_2_Layer', '{"symbol-star_2_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 10, NULL, NULL, '{"symbolPath":["Star_2_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ccd8492b-bc90-4227-b5e6-270ea7e25046', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 2 Layer', 'frame', -245, 130, 190, 100, 22, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:15.193', 'Star_2_Layer_1_MEMBER_1', '{"symbol-star_2_layer","instance-of-star_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1011, NULL, NULL, '{"symbolPath":["Star_2_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"Star_2_Layer_1_MEMBER_1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Star_Symbol\" x=\"330\" y=\"120\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('365cad12-1647-4669-9727-2c2ad7e12e25', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Object 1 copya', 'shape', 469, 52, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 08:54:13.663', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('cad63534-8d14-4af7-ac95-117c0cf0d95b', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainButton Layer', 'frame', 140, 220, 100, 100, 0, 1, 1, 1, FALSE, NULL, '2025-12-03 05:27:13.992', 'MainButton_Layer_1_MEMBER_0', '{"symbol-mainbutton_layer","instance-of-button_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1007, NULL, NULL, '{"symbolPath":["MainButton_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"MainButton_Layer_1_MEMBER_0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Button_Symbol\" x=\"140\" y=\"220\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('d8dafc8d-50c6-4e5d-b56d-0cc558f5a73e', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 2', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:13.439', 'Cloud_2', '{"symbol-cloud_2"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 4, NULL, NULL, '{"symbolPath":["Cloud_2"]}'::jsonb, TRUE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('b9ddb0b5-e542-4252-a39e-78137ca8b8d6', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Object 3', 'shape', 286, 50, 100, 100, 76, 1, 1, 1, TRUE, NULL, '2025-12-02 23:24:30.294', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('fac49e49-81b5-4fe8-b244-be06e0d7f584', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6194', 'Level_Button', 'component', 326, 1088, 188.53, 190.99, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.683', NULL, '{}'::text[], '{}'::text[], 38, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('53587ffe-967a-4c0a-bd7c-37ec8c2c7a09', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 1', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:13.022', 'Cloud_1', '{"symbol-cloud_1"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 2, NULL, NULL, '{"symbolPath":["Cloud_1"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('1e33fcd9-1ea1-4758-b1ae-0ebd5e456e7e', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Background', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:12.811', 'Background', '{"symbol-background"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 0, NULL, NULL, '{"symbolPath":["Background"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('427ed663-0743-48aa-88c3-f51f3868331e', '763e5605-aab0-4c7c-8f29-3c6609c46764', '7:6196', 'Header', 'component', 94, 275, 1476, 153.1, 0, 1, 1, 1, TRUE, NULL, '2025-12-02 06:30:49.593', NULL, '{}'::text[], '{}'::text[], 36, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ba53c293-792f-4254-86ed-156438e8931e', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 1', 'shape', -325, -9, 80, 40, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:13.171', 'Cloud_1_FILL_1', '{"symbol-cloud_1"}'::text[], '{"svg-type-ellipse","adobe-animate","has-parent"}'::text[], 1003, NULL, NULL, '{"fill":"white","symbolPath":["Cloud_1"],"originalMarkup":"<ellipse xmlns=\"http://www.w3.org/2000/svg\" id=\"Cloud_1_FILL_1\" cx=\"80\" cy=\"50\" rx=\"40\" ry=\"20\" fill=\"white\" opacity=\"0.8\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('b5bd9590-b0c2-40a0-8461-ea2d4de3fc27', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainButton Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:13.895', 'MainButton_Layer', '{"symbol-mainbutton_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 6, NULL, NULL, '{"symbolPath":["MainButton_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6d988213-0e7c-475c-9f44-45f729ad7000', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 3 Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:15.667', 'Star_3_Layer', '{"symbol-star_3_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 12, NULL, NULL, '{"symbolPath":["Star_3_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('01aef546-0e8b-4c66-969a-a7c18e70f4ef', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 3 Layer', 'frame', 200, 80, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:16.071', 'Star_3_Layer_1_MEMBER_2', '{"symbol-star_3_layer","instance-of-star_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1013, NULL, NULL, '{"symbolPath":["Star_3_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"Star_3_Layer_1_MEMBER_2\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Star_Symbol\" x=\"200\" y=\"80\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('d0896061-6df8-4e06-b6d3-1a5dcff46282', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 1', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:16.677', 'Decoration_1', '{"symbol-decoration_1"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 16, NULL, NULL, '{"symbolPath":["Decoration_1"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('892dc4b7-91f2-4bc7-b3f4-75661e93e799', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 1', 'shape', 15, 235, 30, 30, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:16.808', 'Decoration_1_FILL_1', '{"symbol-decoration_1"}'::text[], '{"svg-type-circle","adobe-animate","has-parent"}'::text[], 1017, NULL, NULL, '{"fill":"#ec4899","symbolPath":["Decoration_1"],"originalMarkup":"<circle xmlns=\"http://www.w3.org/2000/svg\" id=\"Decoration_1_FILL_1\" cx=\"30\" cy=\"250\" r=\"15\" fill=\"#ec4899\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('69a0cc17-2893-4937-91c2-9b8bf62c9d18', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainCharacter Layer', 'group', -47, -47, 437, 436, 1, 1, 1, 1, FALSE, NULL, '2025-12-03 05:27:16.358', 'MainCharacter_Layer', '{"symbol-maincharacter_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 14, NULL, NULL, '{"symbolPath":["MainCharacter_Layer"]}'::jsonb, TRUE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('366afaf3-3f3b-4ad9-95d5-20e04f215642', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 2', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:16.990', 'Decoration_2', '{"symbol-decoration_2"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 18, NULL, NULL, '{"symbolPath":["Decoration_2"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('6228fc44-5f62-468d-8c00-557230d75386', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 2', 'shape', 358, 248, 24, 24, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:17.117', 'Decoration_2_FILL_1', '{"symbol-decoration_2"}'::text[], '{"svg-type-circle","adobe-animate","has-parent"}'::text[], 1019, NULL, NULL, '{"fill":"#8b5cf6","symbolPath":["Decoration_2"],"originalMarkup":"<circle xmlns=\"http://www.w3.org/2000/svg\" id=\"Decoration_2_FILL_1\" cx=\"370\" cy=\"260\" r=\"12\" fill=\"#8b5cf6\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('c1d19daf-90cc-4115-b99f-924e1d0326eb', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Ground', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:17.230', 'Ground', '{"symbol-ground"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 20, NULL, NULL, '{"symbolPath":["Ground"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('5c80ad8a-4aa9-4fc4-92ff-f1ba4cca7ac5', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Background', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:29.629', 'Background', '{"symbol-background"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 0, NULL, NULL, '{"symbolPath":["Background"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('e696283f-548a-4d1c-abf2-98277d9301be', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 1', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:29.967', 'Cloud_1', '{"symbol-cloud_1"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 2, NULL, NULL, '{"symbolPath":["Cloud_1"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ce6cd0fe-f704-4de7-8620-bbe88131a91c', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 2', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.278', 'Cloud_2', '{"symbol-cloud_2"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 4, NULL, NULL, '{"symbolPath":["Cloud_2"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ee8cf76d-a942-4976-aa28-84020a658810', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainButton Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.542', 'MainButton_Layer', '{"symbol-mainbutton_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 6, NULL, NULL, '{"symbolPath":["MainButton_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('47448fd0-367f-4777-9279-8eb570f1bfb4', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 1 Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.777', 'Star_1_Layer', '{"symbol-star_1_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 8, NULL, NULL, '{"symbolPath":["Star_1_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('e478fe56-ad79-4180-b930-f26db17f0d59', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 2 Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:31.234', 'Star_2_Layer', '{"symbol-star_2_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 10, NULL, NULL, '{"symbolPath":["Star_2_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('682ad357-820f-4eea-9afe-44232862efa6', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Ground', 'shape', 136, 120, 400, 20, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:17.288', 'Ground_FILL_1', '{"symbol-ground"}'::text[], '{"svg-type-rect","adobe-animate","has-parent"}'::text[], 1021, NULL, NULL, '{"fill":"#065f46","symbolPath":["Ground"],"originalMarkup":"<rect xmlns=\"http://www.w3.org/2000/svg\" id=\"Ground_FILL_1\" x=\"0\" y=\"280\" width=\"400\" height=\"20\" fill=\"#065f46\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('69250d26-12bd-4cc2-9187-fc1738c74113', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 2', 'shape', -422, 146, 259, 274, 15, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.458', 'Cloud_2_FILL_1', '{"symbol-cloud_2"}'::text[], '{"svg-type-ellipse","adobe-animate","has-parent"}'::text[], 1005, NULL, NULL, '{"fill":"white","symbolPath":["Cloud_2"],"originalMarkup":"<ellipse xmlns=\"http://www.w3.org/2000/svg\" id=\"Cloud_2_FILL_1\" cx=\"320\" cy=\"70\" rx=\"50\" ry=\"25\" fill=\"white\" opacity=\"0.6\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('024d94c8-7979-4d8c-95cf-6c6c07921853', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainCharacter Layer', 'frame', -625, -19, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:16.489', 'MainCharacter_Layer_1_MEMBER_0', '{"symbol-maincharacter_layer","instance-of-character_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1015, NULL, NULL, '{"symbolPath":["MainCharacter_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"MainCharacter_Layer_1_MEMBER_0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Character_Symbol\" x=\"170\" y=\"120\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('4ff28bbf-77f2-4f15-9ba6-11801228cc62', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 1 Layer', 'frame', -5, 667, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.899', 'Star_1_Layer_1_MEMBER_0', '{"symbol-star_1_layer","instance-of-star_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1009, NULL, NULL, '{"symbolPath":["Star_1_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"Star_1_Layer_1_MEMBER_0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Star_Symbol\" x=\"50\" y=\"100\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('35d17fc4-c620-4d8f-af70-edcc7f2fc321', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Cloud 1', 'shape', -390, 322, 80, 40, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.112', 'Cloud_1_FILL_1', '{"symbol-cloud_1"}'::text[], '{"svg-type-ellipse","adobe-animate","has-parent"}'::text[], 1003, NULL, NULL, '{"fill":"white","symbolPath":["Cloud_1"],"originalMarkup":"<ellipse xmlns=\"http://www.w3.org/2000/svg\" id=\"Cloud_1_FILL_1\" cx=\"80\" cy=\"50\" rx=\"40\" ry=\"20\" fill=\"white\" opacity=\"0.8\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ba0bc323-cf11-40f2-9205-057fd5a95ecb', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 3 Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:31.763', 'Star_3_Layer', '{"symbol-star_3_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 12, NULL, NULL, '{"symbolPath":["Star_3_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('e991459f-62b3-4466-982a-61b6f97cc83c', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 1', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:32.097', 'Decoration_1', '{"symbol-decoration_1"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 16, NULL, NULL, '{"symbolPath":["Decoration_1"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('4f4abaa0-5658-4ffc-b222-0e7e76eb4514', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 1', 'shape', 15, 235, 30, 30, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:32.285', 'Decoration_1_FILL_1', '{"symbol-decoration_1"}'::text[], '{"svg-type-circle","adobe-animate","has-parent"}'::text[], 1017, NULL, NULL, '{"fill":"#ec4899","symbolPath":["Decoration_1"],"originalMarkup":"<circle xmlns=\"http://www.w3.org/2000/svg\" id=\"Decoration_1_FILL_1\" cx=\"30\" cy=\"250\" r=\"15\" fill=\"#ec4899\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('e66406d6-0bae-4c3f-8a06-c05fc8d99497', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 2', 'shape', 358, 248, 24, 24, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:32.575', 'Decoration_2_FILL_1', '{"symbol-decoration_2"}'::text[], '{"svg-type-circle","adobe-animate","has-parent"}'::text[], 1019, NULL, NULL, '{"fill":"#8b5cf6","symbolPath":["Decoration_2"],"originalMarkup":"<circle xmlns=\"http://www.w3.org/2000/svg\" id=\"Decoration_2_FILL_1\" cx=\"370\" cy=\"260\" r=\"12\" fill=\"#8b5cf6\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('06137463-bb9b-46b0-9316-eef225f12e39', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 2 Layer', 'frame', -263, 322, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:31.573', 'Star_2_Layer_1_MEMBER_1', '{"symbol-star_2_layer","instance-of-star_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1011, NULL, NULL, '{"symbolPath":["Star_2_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"Star_2_Layer_1_MEMBER_1\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Star_Symbol\" x=\"330\" y=\"120\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('64756aa3-1e92-4d8b-bf61-7531a71aec7e', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Ground', 'shape', -392, -64, 400, 20, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:32.724', 'Ground_FILL_1', '{"symbol-ground"}'::text[], '{"svg-type-rect","adobe-animate","has-parent"}'::text[], 1021, NULL, NULL, '{"fill":"#065f46","symbolPath":["Ground"],"originalMarkup":"<rect xmlns=\"http://www.w3.org/2000/svg\" id=\"Ground_FILL_1\" x=\"0\" y=\"280\" width=\"400\" height=\"20\" fill=\"#065f46\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('02024a0b-09e4-4420-a048-7b527d4f0ec1', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainCharacter Layer', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:31.920', 'MainCharacter_Layer', '{"symbol-maincharacter_layer"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 14, NULL, NULL, '{"symbolPath":["MainCharacter_Layer"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('e06acbef-8834-48a6-af80-c483a9c1d18b', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Decoration 2', 'group', 0, 0, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:32.486', 'Decoration_2', '{"symbol-decoration_2"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 18, NULL, NULL, '{"symbolPath":["Decoration_2"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('21e28b76-00d1-412e-bb4c-8658df647c3d', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 3 Layer', 'frame', 124, 453, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:31.831', 'Star_3_Layer_1_MEMBER_2', '{"symbol-star_3_layer","instance-of-star_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1013, NULL, NULL, '{"symbolPath":["Star_3_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"Star_3_Layer_1_MEMBER_2\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Star_Symbol\" x=\"200\" y=\"80\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('9effd2c8-e0a6-4a93-a1e2-9fe37a92349d', '763e5605-aab0-4c7c-8f29-3c6609c46764', NULL, 'Object 27', 'shape', 50, 50, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-06 22:54:41.407', NULL, '{}'::text[], '{}'::text[], 0, NULL, NULL, NULL, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('04ca76d3-207b-4c80-a398-a79e10c22093', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Background', 'shape', -445, 547, 400, 300, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:29.786', 'Background_FILL_1', '{"symbol-background"}'::text[], '{"svg-type-rect","adobe-animate","has-gradient","gradient-linear","has-parent"}'::text[], 1001, '/api/naca-media/public%2Flittle-bird-press%2Fimages%2Fknife.webp', NULL, '{"gradientId":"BG_Gradient","symbolPath":["Background"],"gradientDef":{"id":"BG_Gradient","x1":"0%","x2":"0%","y1":"0%","y2":"100%","type":"linear","stops":[{"color":"#000000","offset":"0%"},{"color":"#000000","offset":"100%"}]},"originalMarkup":"<rect xmlns=\"http://www.w3.org/2000/svg\" id=\"Background_FILL_1\" x=\"0\" y=\"0\" width=\"400\" height=\"300\" fill=\"url(#BG_Gradient)\"/>"}'::jsonb, TRUE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('fa6107b9-2c99-48ee-b075-7778516b9936', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Star 1 Layer', 'frame', 192, 100, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:14.280', 'Star_1_Layer_1_MEMBER_0', '{"symbol-star_1_layer","instance-of-star_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1009, NULL, NULL, '{"symbolPath":["Star_1_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"Star_1_Layer_1_MEMBER_0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Star_Symbol\" x=\"50\" y=\"100\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a93f3a90-e835-4e53-af0f-cc0c62835dca', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'MainButton Layer', 'frame', 140, 219, 100, 100, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:30.677', 'MainButton_Layer_1_MEMBER_0', '{"symbol-mainbutton_layer","instance-of-button_symbol"}'::text[], '{"svg-type-use","adobe-animate","has-parent"}'::text[], 1007, NULL, NULL, '{"symbolPath":["MainButton_Layer"],"originalMarkup":"<use xmlns=\"http://www.w3.org/2000/svg\" id=\"MainButton_Layer_1_MEMBER_0\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:href=\"#Button_Symbol\" x=\"140\" y=\"220\"/>"}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('ddeeada1-480d-48d0-adb3-92c38d3743c5', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Ground', 'group', -182, 0, 144, 151, 38, 1, 1, 1, TRUE, NULL, '2025-12-03 05:31:32.631', 'Ground', '{"symbol-ground"}'::text[], '{"svg-type-group","adobe-animate","has-children"}'::text[], 20, NULL, NULL, '{"symbolPath":["Ground"]}'::jsonb, FALSE);
INSERT INTO "game_objects" ("id", "screen_id", "figma_node_id", "name", "type", "x", "y", "width", "height", "rotation", "scale_x", "scale_y", "opacity", "visible", "data_key", "created_at", "custom_id", "classes", "tags", "z_index", "media_url", "audio_url", "metadata", "locked") VALUES ('a0c367f6-c395-42ca-8ade-e72edb171cda', '90a3c6a0-e7b4-4c86-9cac-be64e923768b', NULL, 'Background', 'shape', 425, 201, 400, 300, 0, 1, 1, 1, TRUE, NULL, '2025-12-03 05:27:12.940', 'Background_FILL_1', '{"symbol-background"}'::text[], '{"svg-type-rect","adobe-animate","has-gradient","gradient-linear","has-parent"}'::text[], 1001, NULL, NULL, '{"gradientId":"BG_Gradient","symbolPath":["Background"],"gradientDef":{"id":"BG_Gradient","x1":"0%","x2":"0%","y1":"0%","y2":"100%","type":"linear","stops":[{"color":"#000000","offset":"0%"},{"color":"#000000","offset":"100%"}]},"originalMarkup":"<rect xmlns=\"http://www.w3.org/2000/svg\" id=\"Background_FILL_1\" x=\"0\" y=\"0\" width=\"400\" height=\"300\" fill=\"url(#BG_Gradient)\"/>"}'::jsonb, FALSE);

-- Table: animations (7 rows)
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('7dc2a863-0c62-469d-8b5d-01a9644bcde3', '365cad12-1647-4669-9727-2c2ad7e12e25', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-02 11:41:34.164');
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('eedda7a5-f318-40f8-a437-0a5007dae90c', '365cad12-1647-4669-9727-2c2ad7e12e25', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-02 11:41:34.165');
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('79781ffa-90f8-4d21-bac5-6b3262189b7a', 'cad63534-8d14-4af7-ac95-117c0cf0d95b', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-04 17:24:57.366');
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('6228b0ae-1419-4e61-a3f9-d9c98b0b8016', 'cad63534-8d14-4af7-ac95-117c0cf0d95b', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-04 17:25:01.493');
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('fb129e7b-c522-4329-99fa-508baecfbe80', 'cad63534-8d14-4af7-ac95-117c0cf0d95b', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-04 17:25:03.316');
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('85aebcb8-12c3-4964-9769-6ea06c8c72f4', 'cad63534-8d14-4af7-ac95-117c0cf0d95b', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-04 17:25:03.469');
INSERT INTO "animations" ("id", "object_id", "scene_id", "name", "duration", "loop", "autoplay", "playback_rate", "order", "metadata", "created_at") VALUES ('9dcd4f0d-ff6a-4c54-a397-0321f00319c1', 'cad63534-8d14-4af7-ac95-117c0cf0d95b', NULL, 'Animation', 5, FALSE, FALSE, 1, 0, NULL, '2025-12-04 17:25:05.667');

-- Table: keyframes (7 rows)
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('d0f08ba9-428b-405f-a534-de2ce5500640', 'eedda7a5-f318-40f8-a437-0a5007dae90c', 0.68, 'x', '{"value":0}'::jsonb, 'power1.inOut', FALSE, '2025-12-02 11:41:34.248');
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('3cf72201-c1ab-401b-b8c4-c1cfbf7f454d', '79781ffa-90f8-4d21-bac5-6b3262189b7a', 0.96, 'rotation', '{"value":0}'::jsonb, 'power1.inOut', FALSE, '2025-12-04 17:24:57.499');
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('2e6b1ec4-5beb-4f4b-a90a-dc2b07d4606c', '6228b0ae-1419-4e61-a3f9-d9c98b0b8016', 0, 'rotation', '{"value":0}'::jsonb, 'power1.inOut', FALSE, '2025-12-04 17:25:01.599');
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('1d04bb1e-bddd-4b1b-8feb-ff529abbf807', 'fb129e7b-c522-4329-99fa-508baecfbe80', 0, 'rotation', '{"value":0}'::jsonb, 'power1.inOut', FALSE, '2025-12-04 17:25:03.430');
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('05edfb8b-e09d-4983-88ca-774e464b853b', '85aebcb8-12c3-4964-9769-6ea06c8c72f4', 0, 'rotation', '{"value":0}'::jsonb, 'power1.inOut', FALSE, '2025-12-04 17:25:03.581');
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('e77e7590-b929-4106-8320-4da71828a14f', '9dcd4f0d-ff6a-4c54-a397-0321f00319c1', 0.64, 'rotation', '{"value":0}'::jsonb, 'power1.inOut', FALSE, '2025-12-04 17:25:05.773');
INSERT INTO "keyframes" ("id", "animation_id", "time", "property", "value", "ease", "locked", "created_at") VALUES ('b2a12060-6299-4192-a98e-d089dc8cfa62', '79781ffa-90f8-4d21-bac5-6b3262189b7a', 0, 'x', '{"value":140}'::jsonb, 'power1.inOut', FALSE, '2025-12-04 17:45:24.133');

-- Table: object_states (empty - no data)

-- Table: triggers (empty - no data)

-- Table: timeline_actions (empty - no data)

-- Table: figma_nodes (1 rows)
INSERT INTO "figma_nodes" ("id", "project_id", "node_id", "parent_node_id", "screen_id", "name", "type", "hash", "x", "y", "width", "height", "order", "last_synced_at") VALUES ('e53ad43c-37c5-479c-abcd-9627c0903bbf', 'cd2da62d-c8a9-49c7-a9e8-f81dad9bd48c', '1:2813', NULL, NULL, 'Activity_Center_Artwork 1', 'FRAME', '19586d49b602', -969, -1130, 1440, 1080, 0, '2025-12-04 04:52:40.522');

-- Table: api_docs (1 rows)
INSERT INTO "api_docs" ("id", "slug", "version", "title", "description", "json_payload", "markdown_payload", "assets_manifest", "publish_status", "published_at", "published_to_dev", "published_to_prod", "last_dev_publish_at", "last_prod_publish_at", "last_updated", "schema_hash", "commit_sha", "created_at", "updated_at") VALUES ('358b8351-6910-4eb5-b70b-7223957d179d', 'activity-editor', '1.0.0', 'Activity Editor API', 'API documentation for the Activity Editor, enabling NACA integration for language learning activities', '{"schemas":{"User":{"name":"User","fields":[{"name":"id","type":"string","required":false},{"name":"username","type":"string","required":false},{"name":"password","type":"string","required":false}]},"Scene":{"name":"Scene","fields":[{"name":"id","type":"string","required":false},{"name":"screenId","type":"string","required":false}]},"ApiDoc":{"name":"ApiDoc","fields":[{"name":"id","type":"string","required":false},{"name":"slug","type":"string","required":false},{"name":"version","type":"string","required":false},{"name":"title","type":"string","required":false},{"name":"description","type":"string","required":false},{"name":"jsonPayload","type":"object","required":false},{"name":"apiVersion","type":"unknown","required":false},{"name":"generatedAt","type":"unknown","required":false},{"name":"schemaHash","type":"unknown","required":false},{"name":"endpoints","type":"unknown","required":false},{"name":"id","type":"unknown","required":false},{"name":"path","type":"unknown","required":false},{"name":"method","type":"unknown","required":false},{"name":"description","type":"unknown","required":false},{"name":"category","type":"unknown","required":false}]},"Screen":{"name":"Screen","fields":[{"name":"id","type":"string","required":false},{"name":"projectId","type":"string","required":false}]},"Project":{"name":"Project","fields":[{"name":"id","type":"string","required":false},{"name":"name","type":"string","required":false},{"name":"description","type":"string","required":false},{"name":"figmaFileKey","type":"string","required":false},{"name":"figmaPageId","type":"string","required":false},{"name":"figmaLastSyncedAt","type":"datetime","required":false},{"name":"figmaBranch","type":"string","required":false},{"name":"createdAt","type":"datetime","required":false},{"name":"updatedAt","type":"datetime","required":false}]},"Trigger":{"name":"Trigger","fields":[{"name":"id","type":"string","required":false},{"name":"sceneId","type":"string","required":false}]},"Keyframe":{"name":"Keyframe","fields":[{"name":"id","type":"string","required":false},{"name":"animationId","type":"string","required":false}]},"Animation":{"name":"Animation","fields":[{"name":"id","type":"string","required":false},{"name":"objectId","type":"string","required":false}]},"FigmaNode":{"name":"FigmaNode","fields":[{"name":"id","type":"string","required":false},{"name":"projectId","type":"string","required":false}]},"Subdomain":{"name":"Subdomain","fields":[{"name":"id","type":"string","required":false},{"name":"subdomain","type":"string","required":false},{"name":"parentDomain","type":"string","required":false},{"name":"fullDomain","type":"string","required":false},{"name":"purpose","type":"string","required":false},{"name":"description","type":"string","required":false},{"name":"targetIp","type":"string","required":false},{"name":"dnsStatus","type":"string","required":false},{"name":"replitVerified","type":"boolean","required":false},{"name":"sslCertStatus","type":"string","required":false},{"name":"lastDnsCheck","type":"datetime","required":false},{"name":"dnsCheckResult","type":"object","required":false},{"name":"checkedAt","type":"unknown","required":false}]},"AppSetting":{"name":"AppSetting","fields":[{"name":"id","type":"string","required":false},{"name":"nacaApiKey","type":"string","required":false},{"name":"nacaApiKeyDisabled","type":"boolean","required":false},{"name":"nacaEnvironment","type":"string","required":false},{"name":"nacaRemoteVersion","type":"string","required":false},{"name":"nacaRemoteCodeHash","type":"string","required":false},{"name":"nacaRemoteLastFetched","type":"datetime","required":false},{"name":"nacaRemoteReviewedAt","type":"datetime","required":false},{"name":"updatedAt","type":"datetime","required":false}]},"GameObject":{"name":"GameObject","fields":[{"name":"id","type":"string","required":false},{"name":"screenId","type":"string","required":false}]},"Vocabulary":{"name":"Vocabulary","fields":[{"name":"id","type":"string","required":false},{"name":"projectId","type":"string","required":false}]},"FeatureHelp":{"name":"FeatureHelp","fields":[{"name":"id","type":"string","required":false},{"name":"featureKey","type":"string","required":false},{"name":"title","type":"string","required":false},{"name":"description","type":"string","required":false},{"name":"videoUrl","type":"string","required":false},{"name":"thumbnailUrl","type":"string","required":false},{"name":"category","type":"string","required":false},{"name":"shortcutKey","type":"string","required":false},{"name":"relatedFeatures","type":"string","required":false},{"name":"order","type":"number","required":false},{"name":"isNew","type":"boolean","required":false},{"name":"documentedAt","type":"datetime","required":false},{"name":"testedAt","type":"datetime","required":false},{"name":"viewCount","type":"number","required":false},{"name":"analytics","type":"unknown","required":false},{"name":"lastViewedAt","type":"datetime","required":false},{"name":"analytics","type":"unknown","required":false},{"name":"createdAt","type":"datetime","required":false},{"name":"updatedAt","type":"datetime","required":false}]},"ObjectState":{"name":"ObjectState","fields":[{"name":"id","type":"string","required":false},{"name":"sceneId","type":"string","required":false}]},"TimelineAction":{"name":"TimelineAction","fields":[{"name":"id","type":"string","required":false},{"name":"animationId","type":"string","required":false}]},"SettingsProfile":{"name":"SettingsProfile","fields":[{"name":"id","type":"string","required":false},{"name":"name","type":"string","required":false},{"name":"userId","type":"string","required":false}]},"HelpVideoCandidate":{"name":"HelpVideoCandidate","fields":[{"name":"id","type":"string","required":false},{"name":"featureKey","type":"string","required":false},{"name":"videoUrl","type":"string","required":false},{"name":"thumbnailUrl","type":"string","required":false},{"name":"testDescription","type":"string","required":false},{"name":"testPlanSummary","type":"string","required":false},{"name":"duration","type":"number","required":false},{"name":"status","type":"string","required":false},{"name":"approvedAt","type":"datetime","required":false},{"name":"approvedBy","type":"string","required":false},{"name":"rejectionReason","type":"string","required":false},{"name":"capturedAt","type":"datetime","required":false},{"name":"createdAt","type":"datetime","required":false}]}},"endpoints":[{"id":"get_screens","path":"/api/screens","method":"GET","category":"Screens","description":"Get all screens"},{"id":"get_screens_by_id","path":"/api/screens/:id","method":"GET","category":"Screens","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a single screen"},{"id":"post_screens","path":"/api/screens","method":"POST","category":"Screens","description":"Create a new screen"},{"id":"patch_screens_by_id","path":"/api/screens/:id","method":"PATCH","category":"Screens","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a screen"},{"id":"delete_screens_by_id","path":"/api/screens/:id","method":"DELETE","category":"Screens","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a screen"},{"id":"get_screens_by_id_objects","path":"/api/screens/:screenId/objects","method":"GET","category":"Game Objects","parameters":[{"in":"path","name":"screenId","type":"string","required":true}],"description":"Game Objects"},{"id":"post_objects","path":"/api/objects","method":"POST","category":"Game Objects","description":"Create a new game object"},{"id":"patch_objects_by_id","path":"/api/objects/:id","method":"PATCH","category":"Game Objects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a game object"},{"id":"delete_objects_by_id","path":"/api/objects/:id","method":"DELETE","category":"Game Objects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a game object"},{"id":"patch_objects_batch_zindex","path":"/api/objects/batch-zindex","method":"PATCH","category":"Game Objects","description":"Batch update game objects"},{"id":"get_screens_by_id_scenes","path":"/api/screens/:screenId/scenes","method":"GET","category":"Scenes","parameters":[{"in":"path","name":"screenId","type":"string","required":true}],"description":"Scenes"},{"id":"post_scenes","path":"/api/scenes","method":"POST","category":"Scenes","description":"Create a new scene"},{"id":"patch_scenes_by_id","path":"/api/scenes/:id","method":"PATCH","category":"Scenes","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a scene"},{"id":"delete_scenes_by_id","path":"/api/scenes/:id","method":"DELETE","category":"Scenes","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a scene"},{"id":"get_scenes_by_id_states","path":"/api/scenes/:sceneId/states","method":"GET","category":"Object States","parameters":[{"in":"path","name":"sceneId","type":"string","required":true}],"description":"Object States"},{"id":"post_states","path":"/api/states","method":"POST","category":"Object States","description":"Create a new object state"},{"id":"patch_states_by_id","path":"/api/states/:id","method":"PATCH","category":"Object States","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a object state"},{"id":"delete_states_by_id","path":"/api/states/:id","method":"DELETE","category":"Object States","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a object state"},{"id":"get_scenes_by_id_triggers","path":"/api/scenes/:sceneId/triggers","method":"GET","category":"Triggers","parameters":[{"in":"path","name":"sceneId","type":"string","required":true}],"description":"Triggers"},{"id":"post_triggers","path":"/api/triggers","method":"POST","category":"Triggers","description":"Create a new trigger"},{"id":"patch_triggers_by_id","path":"/api/triggers/:id","method":"PATCH","category":"Triggers","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a trigger"},{"id":"delete_triggers_by_id","path":"/api/triggers/:id","method":"DELETE","category":"Triggers","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a trigger"},{"id":"get_vocabulary","path":"/api/vocabulary","method":"GET","category":"Vocabulary","description":"Vocabulary"},{"id":"post_vocabulary","path":"/api/vocabulary","method":"POST","category":"Vocabulary","description":"Create a new vocabular"},{"id":"delete_vocabulary_by_id","path":"/api/vocabulary/:id","method":"DELETE","category":"Vocabulary","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a vocabular"},{"id":"get_objects_by_id_animations","path":"/api/objects/:objectId/animations","method":"GET","category":"Animations","parameters":[{"in":"path","name":"objectId","type":"string","required":true}],"description":"Animations"},{"id":"get_scenes_by_id_animations","path":"/api/scenes/:sceneId/animations","method":"GET","category":"Scenes","parameters":[{"in":"path","name":"sceneId","type":"string","required":true}],"description":"Get a specific scene by ID"},{"id":"get_animations_by_id","path":"/api/animations/:id","method":"GET","category":"Animations","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a specific animation by ID"},{"id":"post_animations","path":"/api/animations","method":"POST","category":"Animations","description":"Create a new animation"},{"id":"patch_animations_by_id","path":"/api/animations/:id","method":"PATCH","category":"Animations","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a animation"},{"id":"delete_animations_by_id","path":"/api/animations/:id","method":"DELETE","category":"Animations","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a animation"},{"id":"get_animations_by_id_keyframes","path":"/api/animations/:animationId/keyframes","method":"GET","category":"Keyframes","parameters":[{"in":"path","name":"animationId","type":"string","required":true}],"description":"Keyframes"},{"id":"get_keyframes_by_id","path":"/api/keyframes/:id","method":"GET","category":"Keyframes","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a specific keyframe by ID"},{"id":"post_keyframes","path":"/api/keyframes","method":"POST","category":"Keyframes","description":"Create a new keyframe"},{"id":"patch_keyframes_by_id","path":"/api/keyframes/:id","method":"PATCH","category":"Keyframes","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a keyframe"},{"id":"delete_keyframes_by_id","path":"/api/keyframes/:id","method":"DELETE","category":"Keyframes","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a keyframe"},{"id":"get_animations_by_id_actions","path":"/api/animations/:animationId/actions","method":"GET","category":"Animations","parameters":[{"in":"path","name":"animationId","type":"string","required":true}],"description":"Timeline Actions"},{"id":"get_timeline_actions_by_id","path":"/api/timeline-actions/:id","method":"GET","category":"Timeline","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a specific timelin by ID"},{"id":"post_timeline_actions","path":"/api/timeline-actions","method":"POST","category":"Timeline","description":"Create a new timelin"},{"id":"patch_timeline_actions_by_id","path":"/api/timeline-actions/:id","method":"PATCH","category":"Timeline","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a timelin"},{"id":"delete_timeline_actions_by_id","path":"/api/timeline-actions/:id","method":"DELETE","category":"Timeline","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a timelin"},{"id":"get_projects","path":"/api/projects","method":"GET","category":"Projects","description":"Projects"},{"id":"get_projects_by_id","path":"/api/projects/:id","method":"GET","category":"Projects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a specific project by ID"},{"id":"post_projects","path":"/api/projects","method":"POST","samples":{"request":{"name":"Vocabulary Matching Game","description":"Match words to images"},"response":{"id":"proj_abc123","name":"Vocabulary Matching Game","createdAt":"2024-01-15T10:00:00Z","description":"Match words to images"}},"category":"Projects","description":"Create a new project (activity container). Projects organize screens, objects, and assets.","requestSchema":{"type":"object","required":["name"],"properties":{"name":{"type":"string","maxLength":255,"minLength":1},"description":{"type":"string","optional":true}}}},{"id":"patch_projects_by_id","path":"/api/projects/:id","method":"PATCH","category":"Projects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a project"},{"id":"delete_projects_by_id","path":"/api/projects/:id","method":"DELETE","category":"Projects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a project"},{"id":"get_projects_by_id_export","path":"/api/projects/:id/export","method":"GET","category":"Projects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Export project as ActivityDefinition"},{"id":"post_projects_import","path":"/api/projects/import","method":"POST","category":"Projects","description":"Import activity as a new project"},{"id":"post_figma_parse_url","path":"/api/figma/parse-url","method":"POST","category":"Figma","description":"Parse Figma URL to extract file key and node ID"},{"id":"post_projects_by_id_figma_connect","path":"/api/projects/:id/figma/connect","method":"POST","category":"Projects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Connect a project to a Figma file"},{"id":"post_projects_by_id_figma_import_frame","path":"/api/projects/:projectId/figma/import-frame","method":"POST","category":"Screens","parameters":[{"in":"path","name":"projectId","type":"string","required":true}],"description":"Store Figma frame data as a screen (called from frontend after MCP fetch)"},{"id":"get_projects_by_id_screens","path":"/api/projects/:projectId/screens","method":"GET","category":"Projects","parameters":[{"in":"path","name":"projectId","type":"string","required":true}],"description":"Get screens for a project"},{"id":"post_projects_by_id_figma_nodes","path":"/api/projects/:projectId/figma/nodes","method":"POST","category":"Figma","parameters":[{"in":"path","name":"projectId","type":"string","required":true}],"description":"Store Figma node for tracking (called from frontend after MCP fetch)"},{"id":"get_projects_by_id_figma_nodes","path":"/api/projects/:projectId/figma/nodes","method":"GET","category":"Projects","parameters":[{"in":"path","name":"projectId","type":"string","required":true}],"description":"Get all Figma nodes for a project (for diffing)"},{"id":"get_figma_status","path":"/api/figma/status","method":"GET","category":"Figma","description":"Check if Figma API token is configured"},{"id":"post_projects_by_id_figma_sync","path":"/api/projects/:projectId/figma/sync","method":"POST","category":"Projects","parameters":[{"in":"path","name":"projectId","type":"string","required":true}],"description":"Sync a project from Figma"},{"id":"post_screens_by_id_sync_layers","path":"/api/screens/:id/sync-layers","method":"POST","category":"Game Objects","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Sync child layers from a Figma frame as game objects"},{"id":"get_feature_help","path":"/api/feature-help","method":"GET","category":"Help System","description":"Get all feature help items"},{"id":"get_feature_help_category_by_id","path":"/api/feature-help/category/:category","method":"GET","category":"Help System","parameters":[{"in":"path","name":"category","type":"string","required":true}],"description":"Get feature help by category"},{"id":"get_feature_help_key_by_id","path":"/api/feature-help/key/:featureKey","method":"GET","category":"Help System","parameters":[{"in":"path","name":"featureKey","type":"string","required":true}],"description":"Get feature help by key"},{"id":"get_feature_help_analytics","path":"/api/feature-help/analytics","method":"GET","category":"Help System","description":"NOTE: This route must come BEFORE /api/feature-help/:id to avoid matching \"analytics\" as an ID"},{"id":"get_feature_help_export","path":"/api/feature-help/export","method":"GET","category":"Activity","description":"NOTE: This route must come BEFORE /api/feature-help/:id to avoid matching \"export\" as an ID"},{"id":"get_feature_help_by_id","path":"/api/feature-help/:id","method":"GET","category":"Help System","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a single feature help item"},{"id":"post_feature_help","path":"/api/feature-help","method":"POST","category":"Help System","description":"Create feature help"},{"id":"patch_feature_help_by_id","path":"/api/feature-help/:id","method":"PATCH","category":"Help System","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update feature help"},{"id":"delete_feature_help_by_id","path":"/api/feature-help/:id","method":"DELETE","category":"Help System","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete feature help"},{"id":"post_feature_help_import","path":"/api/feature-help/import","method":"POST","category":"Activity","description":"Import feature help content (from external sources)"},{"id":"post_feature_help_sync_from_registry","path":"/api/feature-help/sync-from-registry","method":"POST","category":"Help System","description":"Sync feature help content from the built-in registry"},{"id":"post_feature_help_by_id_view","path":"/api/feature-help/:featureKey/view","method":"POST","category":"Help System","parameters":[{"in":"path","name":"featureKey","type":"string","required":true}],"description":"Record a view for a feature help topic (for analytics)"},{"id":"get_video_candidates","path":"/api/video-candidates","method":"GET","category":"Video","description":"Get all video candidates"},{"id":"get_video_candidates_status_by_id","path":"/api/video-candidates/status/:status","method":"GET","category":"Video","parameters":[{"in":"path","name":"status","type":"string","required":true}],"description":"Get video candidates by status (pending, approved, rejected)"},{"id":"get_video_candidates_feature_by_id","path":"/api/video-candidates/feature/:featureKey","method":"GET","category":"Help System","parameters":[{"in":"path","name":"featureKey","type":"string","required":true}],"description":"Get video candidates by feature key"},{"id":"get_video_candidates_by_id","path":"/api/video-candidates/:id","method":"GET","category":"Video","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a single video candidate"},{"id":"post_help_video_candidates_upload","path":"/api/help-video-candidates/upload","method":"POST","category":"Help System","description":"Upload help video candidate with file"},{"id":"post_video_candidates","path":"/api/video-candidates","method":"POST","category":"Video","description":"Try to extract thumbnail and duration"},{"id":"post_video_candidates_by_id_approve","path":"/api/video-candidates/:id/approve","method":"POST","category":"Help System","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Approve video candidate and link to help item"},{"id":"post_video_candidates_by_id_reject","path":"/api/video-candidates/:id/reject","method":"POST","category":"Video","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Reject video candidate"},{"id":"delete_video_candidates_by_id","path":"/api/video-candidates/:id","method":"DELETE","category":"Video","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete video candidate"},{"id":"post_naca_proxy_config","path":"/api/naca-proxy/config","method":"POST","samples":{"request":{"note":"Request body is passed through to NACA unchanged"},"response":{"note":"Response from NACA is returned unchanged with CORS headers added"}},"category":"NACA Integration","description":"Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.","requestSchema":{"type":"object","description":"Pass-through to NACA API. See NACA API documentation for specific endpoint schemas."}},{"id":"get_naca_proxy_config","path":"/api/naca-proxy/config","method":"GET","samples":{"request":{"note":"Request body is passed through to NACA unchanged"},"response":{"note":"Response from NACA is returned unchanged with CORS headers added"}},"category":"NACA Integration","description":"Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.","requestSchema":{"type":"object","description":"Pass-through to NACA API. See NACA API documentation for specific endpoint schemas."}},{"id":"post_naca_proxy_set_api_key","path":"/api/naca-proxy/set-api-key","method":"POST","samples":{"request":{"note":"Request body is passed through to NACA unchanged"},"response":{"note":"Response from NACA is returned unchanged with CORS headers added"}},"category":"NACA Integration","description":"Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.","requestSchema":{"type":"object","description":"Pass-through to NACA API. See NACA API documentation for specific endpoint schemas."}},{"id":"delete_naca_proxy_set_api_key","path":"/api/naca-proxy/set-api-key","method":"DELETE","samples":{"request":{"note":"Request body is passed through to NACA unchanged"},"response":{"note":"Response from NACA is returned unchanged with CORS headers added"}},"category":"NACA Integration","description":"Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.","requestSchema":{"type":"object","description":"Pass-through to NACA API. See NACA API documentation for specific endpoint schemas."}},{"id":"get_naca_api_docs","path":"/api/naca-api/docs","method":"GET","category":"NACA Integration","description":"Fetch remote NACA API documentation"},{"id":"get_naca_api_compare","path":"/api/naca-api/compare","method":"GET","category":"API Documentation","description":"Compare remote API docs with stored version"},{"id":"post_naca_api_mark_reviewed","path":"/api/naca-api/mark-reviewed","method":"POST","category":"NACA Integration","description":"Mark remote API changes as reviewed"},{"id":"get_activity_editor_capabilities","path":"/api/activity-editor/capabilities","method":"GET","samples":{"response":{"features":["figmaSync","vocabularyBinding","animationTimeline","realTimeSync","mediaLibrary"],"endpoints":{"export":"/api/export","devSync":"/ws/dev-sync","screens":"/api/screens","projects":"/api/projects"},"websocket":{"url":"wss://create.naca.community/ws/dev-sync","protocols":["naca-devsync-v1"]},"apiVersion":"1.0.0","authMethods":["session","jwt","apiKey"]}},"category":"DevSync","description":"Get Activity Editor capabilities for NACA host negotiation. Returns supported features, auth methods, and API version.","responseSchema":{"type":"object","properties":{"features":{"type":"array","items":{"type":"string"}},"endpoints":{"type":"object"},"websocket":{"type":"object"},"apiVersion":{"type":"string"},"authMethods":{"type":"array","items":{"type":"string"}}}}},{"id":"post_activity_editor_negotiate","path":"/api/activity-editor/negotiate","method":"POST","samples":{"request":{"subdomain":"tlingit","authMethod":"apiKey","communityId":"comm_abc123","hostVersion":"2.1.0","requestedFeatures":["realTimeSync","mediaLibrary"]},"response":{"authMethod":"apiKey","negotiated":true,"syncInterval":15000,"websocketUrl":"wss://create.naca.community/ws/dev-sync","activeFeatures":["realTimeSync","mediaLibrary"]}},"category":"Activity Editor","description":"Negotiate connection parameters with NACA host. Establishes optimal configuration for communication.","requestSchema":{"type":"object","required":["hostVersion"],"properties":{"subdomain":{"type":"string"},"authMethod":{"enum":["session","jwt","apiKey"],"type":"string"},"communityId":{"type":"string"},"hostVersion":{"type":"string","description":"NACA host API version"},"requestedFeatures":{"type":"array","items":{"type":"string"}}}}},{"id":"post_activity_editor_configure_subdomain","path":"/api/activity-editor/configure-subdomain","method":"POST","category":"DevSync","description":"Configure subdomain via REST (alternative to WebSocket)"},{"id":"get_activity_editor_session","path":"/api/activity-editor/session","method":"GET","category":"Object States","description":"Get current session state for debugging/frontend sync"},{"id":"post_activity_editor_session_clear","path":"/api/activity-editor/session/clear","method":"POST","category":"Activity Editor","description":"Clear session (logout/reset)"},{"id":"get_naca_media_wildcard","path":"/api/naca-media/*","method":"GET","category":"Activity","description":"-> https://naca.community/api/activity-editor/media/little-bird-press/images/tea.webp"},{"id":"get_docs_activity_editor","path":"/api/docs/activity-editor","method":"GET","category":"API Documentation","description":"Machine-readable API documentation (JSON) for build agents"},{"id":"get_docs_activity_editor_markdown","path":"/api/docs/activity-editor/markdown","method":"GET","category":"API Documentation","description":"Human-readable API documentation (Markdown)"},{"id":"post_docs_activity_editor_rebuild","path":"/api/docs/activity-editor/rebuild","method":"POST","category":"API Documentation","description":"Force rebuild documentation"},{"id":"get_docs_activity_editor_status","path":"/api/docs/activity-editor/status","method":"GET","category":"API Documentation","description":"Get documentation status/badge info"},{"id":"post_docs_activity_editor_publish","path":"/api/docs/activity-editor/publish","method":"POST","category":"API Documentation","description":"Update publish status"},{"id":"get_docs_activity_editor_bundle","path":"/api/docs/activity-editor/bundle","method":"GET","category":"NACA Integration","description":"Download NACA integration bundle as ZIP"},{"id":"get_docs_activity_editor_bundle_info","path":"/api/docs/activity-editor/bundle/info","method":"GET","category":"API Documentation","description":"Get bundle info"},{"id":"get_subdomains","path":"/api/subdomains","method":"GET","category":"Other","description":"Get all subdomains"},{"id":"get_subdomains_by_id","path":"/api/subdomains/:id","method":"GET","category":"Other","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get a specific subdomain"},{"id":"post_subdomains","path":"/api/subdomains","method":"POST","category":"Other","description":"Create a new subdomain"},{"id":"patch_subdomains_by_id","path":"/api/subdomains/:id","method":"PATCH","category":"Other","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update a subdomain"},{"id":"delete_subdomains_by_id","path":"/api/subdomains/:id","method":"DELETE","category":"Other","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete a subdomain"},{"id":"post_subdomains_by_id_validate_dns","path":"/api/subdomains/:id/validate-dns","method":"POST","category":"Other","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Validate DNS for a subdomain"},{"id":"post_subdomains_validate_all","path":"/api/subdomains/validate-all","method":"POST","category":"Other","description":"Batch validate all subdomains"},{"id":"all_naca_proxy_wildcard","path":"/api/naca-proxy/*","method":"ALL","samples":{"request":{"note":"Request body is passed through to NACA unchanged"},"response":{"note":"Response from NACA is returned unchanged with CORS headers added"}},"category":"NACA Integration","description":"Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.","requestSchema":{"type":"object","description":"Pass-through to NACA API. See NACA API documentation for specific endpoint schemas."}},{"id":"get_naca_components","path":"/api/naca/components","method":"GET","category":"NACA Integration","description":"GET /api/naca/components - List all components with instance counts"},{"id":"get_naca_components_by_id","path":"/api/naca/components/:id","method":"GET","category":"NACA Integration","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"GET /api/naca/components/:id - Get a single component by ID"},{"id":"post_naca_activities_by_id_push","path":"/api/naca/activities/:activityId/push","method":"POST","category":"Activity","parameters":[{"in":"path","name":"activityId","type":"string","required":true}],"description":"POST /api/naca/activities/:activityId/push"},{"id":"post_naca_vocabulary_sync","path":"/api/naca/vocabulary/sync","method":"POST","category":"Vocabulary","description":"POST /api/naca/vocabulary/sync"},{"id":"get_admin_special_subdomains_status","path":"/api/admin/special-subdomains/status","method":"GET","category":"Other","description":"Get configuration status and list of special subdomains"},{"id":"get_admin_special_subdomains_known_issues","path":"/api/admin/special-subdomains/known-issues","method":"GET","category":"Other","description":"Get known issues catalog"},{"id":"post_admin_special_subdomains_by_id_health_check","path":"/api/admin/special-subdomains/:subdomain/health-check","method":"POST","category":"Other","parameters":[{"in":"path","name":"subdomain","type":"string","required":true}],"description":"Perform health check for a single subdomain"},{"id":"post_admin_special_subdomains_health_check_all","path":"/api/admin/special-subdomains/health-check-all","method":"POST","category":"Other","description":"Batch health check for all special subdomains"},{"id":"post_admin_special_subdomains_by_id_provision","path":"/api/admin/special-subdomains/:subdomain/provision","method":"POST","category":"Other","parameters":[{"in":"path","name":"subdomain","type":"string","required":true}],"description":"Provision DNS for a subdomain"},{"id":"delete_admin_special_subdomains_by_id_provision","path":"/api/admin/special-subdomains/:subdomain/provision","method":"DELETE","category":"Other","parameters":[{"in":"path","name":"subdomain","type":"string","required":true}],"description":"Deprovision DNS for a subdomain"},{"id":"post_admin_special_subdomains_test_porkbun","path":"/api/admin/special-subdomains/test-porkbun","method":"POST","category":"Other","description":"Test Porkbun API credentials"},{"id":"post_admin_subdomain_health_by_id","path":"/api/admin/subdomain-health/:subdomain","method":"POST","category":"Other","parameters":[{"in":"path","name":"subdomain","type":"string","required":true}],"description":"Health check for arbitrary subdomain (not just special ones)"},{"id":"get_settings_profiles","path":"/api/settings-profiles","method":"GET","category":"Settings","description":"Get all settings profiles"},{"id":"get_settings_profiles_current","path":"/api/settings-profiles/current","method":"GET","category":"Settings","description":"Get current/active settings profile (global or default)"},{"id":"get_settings_profiles_by_id","path":"/api/settings-profiles/:id","method":"GET","category":"Settings","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Get settings profile by ID"},{"id":"get_settings_profiles_community_by_id","path":"/api/settings-profiles/community/:communityId","method":"GET","category":"Settings","parameters":[{"in":"path","name":"communityId","type":"string","required":true}],"description":"Get settings profile by community ID"},{"id":"post_settings_profiles","path":"/api/settings-profiles","method":"POST","category":"Settings","description":"Create new settings profile"},{"id":"patch_settings_profiles_by_id","path":"/api/settings-profiles/:id","method":"PATCH","category":"Settings","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update settings profile"},{"id":"patch_settings_profiles_by_id_data","path":"/api/settings-profiles/:id/data","method":"PATCH","category":"Settings","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Update settings profile data (merge with existing)"},{"id":"post_settings_profiles_by_id_set_default","path":"/api/settings-profiles/:id/set-default","method":"POST","category":"Settings","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Set profile as default"},{"id":"delete_settings_profiles_by_id","path":"/api/settings-profiles/:id","method":"DELETE","category":"Settings","parameters":[{"in":"path","name":"id","type":"string","required":true}],"description":"Delete settings profile"},{"id":"post_settings_profiles_initialize_global","path":"/api/settings-profiles/initialize-global","method":"POST","category":"Settings","description":"Create or get global settings profile with defaults"}],"apiVersion":"1.0.0","schemaHash":"1e0c7196","generatedAt":"2025-12-09T23:24:14.355Z","nacaProtocol":[{"title":"Authentication","details":["**Session-based Auth**: Traditional cookie-based sessions via `/api/login` (Replit OAuth). Used when Activity Editor is accessed directly.","**Token-based Auth (JWT)**: Bearer token authentication via `Authorization: Bearer <token>` header. Used when embedded as iframe or accessed cross-origin.","**API Key Auth**: NACA API key authentication for server-to-server communication. Pass via `Authorization: Bearer <api-key>` or `X-API-Key: <api-key>` header.","API keys can be configured via the Settings panel or set as the `NACA_API_KEY` environment variable."],"examples":[{"code":"fetch(''https://create.naca.community/api/projects'', {\n  headers: {\n    ''Authorization'': ''Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'',\n    ''Content-Type'': ''application/json''\n  }\n})","title":"JWT Authentication","language":"javascript"},{"code":"fetch(''https://create.naca.community/api/activity-editor/capabilities'', {\n  headers: {\n    ''X-API-Key'': ''naca_key_xxxxx'',\n    ''Content-Type'': ''application/json''\n  }\n})","title":"API Key Authentication","language":"javascript"}],"description":"The Activity Editor supports dual-mode authentication for flexible integration with NACA hosts."},{"title":"Rate Limiting","details":["**Limit**: 60 requests per minute per IP/API key","**Burst**: Up to 10 requests can be made simultaneously","**Queue**: Requests exceeding limits are automatically queued (max 100 pending)","**Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` included in responses","**429 Response**: Returned when limits exceeded with `Retry-After` header"],"examples":[{"code":"{\n  \"error\": \"Rate limit exceeded\",\n  \"retryAfter\": 5,\n  \"limit\": 60,\n  \"remaining\": 0,\n  \"reset\": \"2024-01-15T10:00:05Z\"\n}","title":"Rate Limit Response","language":"json"}],"description":"Token bucket algorithm implementation to prevent API abuse while allowing burst traffic."},{"title":"Error Handling","details":["**400 Bad Request**: Invalid request body or parameters. Check the `errors` array for field-specific issues.","**401 Unauthorized**: Missing or invalid authentication. Refresh token or re-authenticate.","**403 Forbidden**: Valid auth but insufficient permissions for this resource.","**404 Not Found**: Resource doesn''t exist. Check the ID and endpoint path.","**409 Conflict**: Resource conflict (e.g., duplicate name). Modify request and retry.","**429 Too Many Requests**: Rate limited. Wait for `Retry-After` seconds.","**500 Internal Server Error**: Server-side issue. Retry with exponential backoff."],"examples":[{"code":"{\n  \"error\": \"Validation failed\",\n  \"errors\": [\n    { \"field\": \"name\", \"message\": \"Name is required\" },\n    { \"field\": \"screenId\", \"message\": \"Invalid screen ID format\" }\n  ]\n}","title":"Validation Error Response","language":"json"}],"description":"Consistent error response format across all endpoints for reliable integration."},{"title":"CORS Configuration","details":["**Allowed Origins**: `https://create.naca.community`, `https://api.create.naca.community`, `https://naca.community`, `https://*.naca.community`","**Allowed Methods**: GET, POST, PATCH, PUT, DELETE, OPTIONS","**Allowed Headers**: Authorization, Content-Type, X-API-Key, X-Community-Id, X-Subdomain","**Credentials**: Supported for session-based auth (cookies)","**Preflight Cache**: OPTIONS requests cached for 86400 seconds (24 hours)"],"description":"Cross-origin requests are allowed from authorized NACA domains."},{"title":"Server Environment","details":["**Production** (default): `https://naca.community` - Live community data","**Development**: `https://native-tongue-lexicon.replit.app` - Testing environment","Environment can be switched via Settings dropdown in the UI","Server URL can be locked via `NACA_API_URL` environment variable","The `APP_BASE_URL` environment variable determines the base URL for absolute URLs in API responses"],"description":"The Activity Editor can connect to different NACA server environments."}],"websocketTopics":[{"name":"activity_update","direction":"outbound","description":"Push activity changes to NACA in real-time. Sent automatically when objects, scenes, or triggers are modified.","payloadSchema":{"type":"object","required":["componentId","payload"],"properties":{"payload":{"type":"object","description":"ActivityDefinition object with screens, objects, scenes, triggers"},"version":{"type":"string","description":"Activity version (semantic versioning)"},"timestamp":{"type":"string","format":"ISO8601","description":"When the update occurred"},"componentId":{"type":"string","description":"Unique activity component ID"}}}},{"name":"request_activity","direction":"outbound","description":"Request the full activity definition from NACA. Used for initial sync or recovery.","payloadSchema":{"type":"object","required":["componentId"],"properties":{"componentId":{"type":"string","description":"Activity component ID to request"},"includeMedia":{"type":"boolean","default":true,"description":"Whether to include media URLs"}}}},{"name":"vocabulary_push","direction":"outbound","description":"Push vocabulary entries created in the editor to NACA dictionary.","payloadSchema":{"type":"object","required":["dictionaryId","entries"],"properties":{"entries":{"type":"array","items":{"type":"object","properties":{"audioUrl":{"type":"string","optional":true},"imageUrl":{"type":"string","optional":true},"indigenousWord":{"type":"string"},"englishTranslation":{"type":"string"}}}},"dictionaryId":{"type":"string","description":"Target dictionary ID"}}}},{"name":"preview_request","direction":"outbound","description":"Request NACA to open a preview of the current activity state.","payloadSchema":{"type":"object","required":["componentId"],"properties":{"mode":{"enum":["standalone","embedded"],"type":"string","default":"standalone"},"componentId":{"type":"string"}}}},{"name":"activityDiff","direction":"inbound","description":"Receive incremental activity changes from NACA. Apply these diffs to maintain sync.","payloadSchema":{"type":"object","required":["activityId","changes"],"properties":{"changes":{"type":"object","properties":{"op":{"enum":["add","remove","replace","move","copy"],"type":"string"},"path":{"type":"string","description":"JSON Pointer to target location"},"value":{"type":"any","description":"New value (for add/replace)"}},"description":"JSON Patch format (RFC 6902) array of operations"},"version":{"type":"string","description":"New version after applying diff"},"timestamp":{"type":"string","format":"ISO8601"},"activityId":{"type":"string","description":"Activity being updated"}}}},{"name":"mediaUpload","direction":"inbound","description":"Notification when new media is uploaded to NACA. Activity Editor can then reference this media.","payloadSchema":{"type":"object","required":["mediaId","url","type"],"properties":{"url":{"type":"string","description":"CDN URL for the media file"},"size":{"type":"number","description":"File size in bytes"},"type":{"enum":["image","audio","video"],"type":"string","description":"Media type"},"mediaId":{"type":"string","description":"Unique media identifier"},"filename":{"type":"string","description":"Original filename"},"communityId":{"type":"string","description":"Owning community"}}}},{"name":"mediaLink","direction":"inbound","description":"Media has been linked to a dictionary entry in NACA. Update vocabulary bindings.","payloadSchema":{"type":"object","required":["mediaId","entryId"],"properties":{"entryId":{"type":"string","description":"Dictionary entry ID"},"mediaId":{"type":"string"},"mediaType":{"enum":["image","audio"],"type":"string"},"dictionaryId":{"type":"string"}}}},{"name":"mediaDelete","direction":"inbound","description":"Media has been deleted from NACA. Remove references from activity.","payloadSchema":{"type":"object","required":["mediaId"],"properties":{"reason":{"type":"string","optional":true},"mediaId":{"type":"string"}}}},{"name":"vocabularySync","direction":"inbound","description":"Full vocabulary sync from NACA dictionary. Replace local cache with this data.","payloadSchema":{"type":"object","required":["communityId","dictionaryId","entries"],"properties":{"entries":{"type":"array","items":{"type":"object","properties":{"id":{"type":"string"},"audioUrl":{"type":"string","optional":true},"imageUrl":{"type":"string","optional":true},"categories":{"type":"array","items":{"type":"string"}},"indigenousWord":{"type":"string"},"englishTranslation":{"type":"string"}}}},"totalCount":{"type":"number"},"communityId":{"type":"string"},"dictionaryId":{"type":"string"}}}},{"name":"capabilitiesUpdate","direction":"inbound","description":"NACA host capabilities have changed. Re-negotiate features and update UI accordingly.","payloadSchema":{"type":"object","required":["version","features"],"properties":{"version":{"type":"string","description":"Capabilities version"},"features":{"type":"array","items":{"type":"string"},"description":"List of enabled features: mediaSearch, dropboxIntegration, realTimeSync, activityFolders"},"authMethods":{"type":"array","items":{"enum":["session","jwt","apiKey"],"type":"string"}},"subdomainHandling":{"enum":["path","subdomain","header"],"type":"string"}}}},{"name":"ping","direction":"bidirectional","description":"Heartbeat to maintain connection. Both sides should respond with pong.","payloadSchema":{"type":"object","properties":{"timestamp":{"type":"number","description":"Unix timestamp in milliseconds"}}}},{"name":"sync_status","direction":"bidirectional","description":"Exchange synchronization status. Used to detect and resolve conflicts.","payloadSchema":{"type":"object","properties":{"status":{"enum":["synced","pending","conflict","offline"],"type":"string"},"activityId":{"type":"string"},"lastSyncAt":{"type":"string","format":"ISO8601"},"localVersion":{"type":"string"},"pendingChanges":{"type":"number"}}}}],"integrationGuide":{"baseUrls":{"apiDocs":{"rest":"https://api.create.naca.community"},"production":{"ws":"wss://create.naca.community/ws/dev-sync","rest":"https://create.naca.community"},"development":{"ws":"ws://localhost:5000/ws/dev-sync","rest":"http://localhost:5000"}},"quickStart":["Discover Capabilities: GET /api/activity-editor/capabilities","Negotiate Connection: POST /api/activity-editor/negotiate","Authenticate: Use API key or JWT authentication","Connect WebSocket: /ws/dev-sync for real-time sync","Start Building: Create projects, screens, and objects via REST API"],"syncPattern":["Initial: Send request_activity to get current state","Real-time: Listen for activityDiff messages","Push: Send activity_update when user modifies activity","Conflict: Compare versions and merge changes","Heartbeat: Exchange ping/pong every 30 seconds"],"featureFlags":[{"default":"Enabled","feature":"figmaSync","description":"Sync designs from Figma"},{"default":"Enabled","feature":"vocabularyBinding","description":"Bind vocabulary to objects"},{"default":"Enabled","feature":"animationTimeline","description":"Adobe Animate-style timeline"},{"default":"Enabled","feature":"realTimeSync","description":"WebSocket real-time sync"},{"default":"Enabled","feature":"mediaLibrary","description":"Access NACA media library"},{"default":"Depends on host","feature":"dropboxIntegration","description":"Dropbox file integration"},{"default":"Depends on host","feature":"activityFolders","description":"Organize activities in folders"}],"errorRecovery":{"Sync conflict":"Request full activity state and merge changes","401 Unauthorized":"Refresh authentication token and retry","429 Rate Limited":"Wait for Retry-After header value, then retry","500 Server Error":"Retry with exponential backoff, max 3 attempts","WebSocket disconnect":"Reconnect with exponential backoff (1s, 2s, 4s, max 60s)"},"authenticationFlow":"GET capabilities -> POST negotiate -> Connect WebSocket"}}'::jsonb, '# Activity Editor API Documentation

**API Version:** 1.0.0
**Generated:** 12/9/2025, 11:24:14 PM
**Schema Hash:** `1e0c7196`

---

## Overview

The Activity Editor API provides endpoints for managing interactive language learning activities. It supports:
- Project and screen management
- Game object creation and manipulation
- Scene and state management
- Animation and timeline control
- Vocabulary management
- Figma integration
- Real-time synchronization via WebSocket

## Endpoints

### Activity

#### `GET` /api/feature-help/export

NOTE: This route must come BEFORE /api/feature-help/:id to avoid matching "export" as an ID

#### `POST` /api/feature-help/import

Import feature help content (from external sources)

#### `GET` /api/naca-media/*

-> https://naca.community/api/activity-editor/media/little-bird-press/images/tea.webp

#### `POST` /api/naca/activities/:activityId/push

POST /api/naca/activities/:activityId/push

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| activityId | path | string | Yes | - |

### Activity Editor

#### `POST` /api/activity-editor/negotiate

Negotiate connection parameters with NACA host. Establishes optimal configuration for communication.

**Request Example:**
```json
{
  "hostVersion": "2.1.0",
  "requestedFeatures": [
    "realTimeSync",
    "mediaLibrary"
  ],
  "authMethod": "apiKey",
  "communityId": "comm_abc123",
  "subdomain": "tlingit"
}
```

**Response Example:**
```json
{
  "negotiated": true,
  "activeFeatures": [
    "realTimeSync",
    "mediaLibrary"
  ],
  "authMethod": "apiKey",
  "syncInterval": 15000,
  "websocketUrl": "wss://create.naca.community/ws/dev-sync"
}
```

#### `POST` /api/activity-editor/session/clear

Clear session (logout/reset)

### Animations

#### `GET` /api/objects/:objectId/animations

Animations

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| objectId | path | string | Yes | - |

#### `GET` /api/animations/:id

Get a specific animation by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/animations

Create a new animation

#### `PATCH` /api/animations/:id

Update a animation

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/animations/:id

Delete a animation

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `GET` /api/animations/:animationId/actions

Timeline Actions

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| animationId | path | string | Yes | - |

### API Documentation

#### `GET` /api/naca-api/compare

Compare remote API docs with stored version

#### `GET` /api/docs/activity-editor

Machine-readable API documentation (JSON) for build agents

#### `GET` /api/docs/activity-editor/markdown

Human-readable API documentation (Markdown)

#### `POST` /api/docs/activity-editor/rebuild

Force rebuild documentation

#### `GET` /api/docs/activity-editor/status

Get documentation status/badge info

#### `POST` /api/docs/activity-editor/publish

Update publish status

#### `GET` /api/docs/activity-editor/bundle/info

Get bundle info

### DevSync

#### `GET` /api/activity-editor/capabilities

Get Activity Editor capabilities for NACA host negotiation. Returns supported features, auth methods, and API version.

**Response Example:**
```json
{
  "apiVersion": "1.0.0",
  "features": [
    "figmaSync",
    "vocabularyBinding",
    "animationTimeline",
    "realTimeSync",
    "mediaLibrary"
  ],
  "authMethods": [
    "session",
    "jwt",
    "apiKey"
  ],
  "endpoints": {
    "projects": "/api/projects",
    "screens": "/api/screens",
    "export": "/api/export",
    "devSync": "/ws/dev-sync"
  },
  "websocket": {
    "url": "wss://create.naca.community/ws/dev-sync",
    "protocols": [
      "naca-devsync-v1"
    ]
  }
}
```

#### `POST` /api/activity-editor/configure-subdomain

Configure subdomain via REST (alternative to WebSocket)

### Figma

#### `POST` /api/figma/parse-url

Parse Figma URL to extract file key and node ID

#### `POST` /api/projects/:projectId/figma/nodes

Store Figma node for tracking (called from frontend after MCP fetch)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| projectId | path | string | Yes | - |

#### `GET` /api/figma/status

Check if Figma API token is configured

### Game Objects

#### `GET` /api/screens/:screenId/objects

Game Objects

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| screenId | path | string | Yes | - |

#### `POST` /api/objects

Create a new game object

#### `PATCH` /api/objects/:id

Update a game object

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/objects/:id

Delete a game object

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `PATCH` /api/objects/batch-zindex

Batch update game objects

#### `POST` /api/screens/:id/sync-layers

Sync child layers from a Figma frame as game objects

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### Help System

#### `GET` /api/feature-help

Get all feature help items

#### `GET` /api/feature-help/category/:category

Get feature help by category

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| category | path | string | Yes | - |

#### `GET` /api/feature-help/key/:featureKey

Get feature help by key

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| featureKey | path | string | Yes | - |

#### `GET` /api/feature-help/analytics

NOTE: This route must come BEFORE /api/feature-help/:id to avoid matching "analytics" as an ID

#### `GET` /api/feature-help/:id

Get a single feature help item

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/feature-help

Create feature help

#### `PATCH` /api/feature-help/:id

Update feature help

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/feature-help/:id

Delete feature help

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/feature-help/sync-from-registry

Sync feature help content from the built-in registry

#### `POST` /api/feature-help/:featureKey/view

Record a view for a feature help topic (for analytics)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| featureKey | path | string | Yes | - |

#### `GET` /api/video-candidates/feature/:featureKey

Get video candidates by feature key

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| featureKey | path | string | Yes | - |

#### `POST` /api/help-video-candidates/upload

Upload help video candidate with file

#### `POST` /api/video-candidates/:id/approve

Approve video candidate and link to help item

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### Keyframes

#### `GET` /api/animations/:animationId/keyframes

Keyframes

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| animationId | path | string | Yes | - |

#### `GET` /api/keyframes/:id

Get a specific keyframe by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/keyframes

Create a new keyframe

#### `PATCH` /api/keyframes/:id

Update a keyframe

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/keyframes/:id

Delete a keyframe

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### NACA Integration

#### `POST` /api/naca-proxy/config

Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.

**Request Example:**
```json
{
  "note": "Request body is passed through to NACA unchanged"
}
```

**Response Example:**
```json
{
  "note": "Response from NACA is returned unchanged with CORS headers added"
}
```

#### `GET` /api/naca-proxy/config

Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.

**Request Example:**
```json
{
  "note": "Request body is passed through to NACA unchanged"
}
```

**Response Example:**
```json
{
  "note": "Response from NACA is returned unchanged with CORS headers added"
}
```

#### `POST` /api/naca-proxy/set-api-key

Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.

**Request Example:**
```json
{
  "note": "Request body is passed through to NACA unchanged"
}
```

**Response Example:**
```json
{
  "note": "Response from NACA is returned unchanged with CORS headers added"
}
```

#### `DELETE` /api/naca-proxy/set-api-key

Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.

**Request Example:**
```json
{
  "note": "Request body is passed through to NACA unchanged"
}
```

**Response Example:**
```json
{
  "note": "Response from NACA is returned unchanged with CORS headers added"
}
```

#### `GET` /api/naca-api/docs

Fetch remote NACA API documentation

#### `POST` /api/naca-api/mark-reviewed

Mark remote API changes as reviewed

#### `GET` /api/docs/activity-editor/bundle

Download NACA integration bundle as ZIP

#### `ALL` /api/naca-proxy/*

Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.

**Request Example:**
```json
{
  "note": "Request body is passed through to NACA unchanged"
}
```

**Response Example:**
```json
{
  "note": "Response from NACA is returned unchanged with CORS headers added"
}
```

#### `GET` /api/naca/components

GET /api/naca/components - List all components with instance counts

#### `GET` /api/naca/components/:id

GET /api/naca/components/:id - Get a single component by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### Object States

#### `GET` /api/scenes/:sceneId/states

Object States

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| sceneId | path | string | Yes | - |

#### `POST` /api/states

Create a new object state

#### `PATCH` /api/states/:id

Update a object state

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/states/:id

Delete a object state

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `GET` /api/activity-editor/session

Get current session state for debugging/frontend sync

### Other

#### `GET` /api/subdomains

Get all subdomains

#### `GET` /api/subdomains/:id

Get a specific subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/subdomains

Create a new subdomain

#### `PATCH` /api/subdomains/:id

Update a subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/subdomains/:id

Delete a subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/subdomains/:id/validate-dns

Validate DNS for a subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/subdomains/validate-all

Batch validate all subdomains

#### `GET` /api/admin/special-subdomains/status

Get configuration status and list of special subdomains

#### `GET` /api/admin/special-subdomains/known-issues

Get known issues catalog

#### `POST` /api/admin/special-subdomains/:subdomain/health-check

Perform health check for a single subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| subdomain | path | string | Yes | - |

#### `POST` /api/admin/special-subdomains/health-check-all

Batch health check for all special subdomains

#### `POST` /api/admin/special-subdomains/:subdomain/provision

Provision DNS for a subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| subdomain | path | string | Yes | - |

#### `DELETE` /api/admin/special-subdomains/:subdomain/provision

Deprovision DNS for a subdomain

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| subdomain | path | string | Yes | - |

#### `POST` /api/admin/special-subdomains/test-porkbun

Test Porkbun API credentials

#### `POST` /api/admin/subdomain-health/:subdomain

Health check for arbitrary subdomain (not just special ones)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| subdomain | path | string | Yes | - |

### Projects

#### `GET` /api/projects

Projects

#### `GET` /api/projects/:id

Get a specific project by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/projects

Create a new project (activity container). Projects organize screens, objects, and assets.

**Request Example:**
```json
{
  "name": "Vocabulary Matching Game",
  "description": "Match words to images"
}
```

**Response Example:**
```json
{
  "id": "proj_abc123",
  "name": "Vocabulary Matching Game",
  "description": "Match words to images",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

#### `PATCH` /api/projects/:id

Update a project

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/projects/:id

Delete a project

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `GET` /api/projects/:id/export

Export project as ActivityDefinition

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/projects/import

Import activity as a new project

#### `POST` /api/projects/:id/figma/connect

Connect a project to a Figma file

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `GET` /api/projects/:projectId/screens

Get screens for a project

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| projectId | path | string | Yes | - |

#### `GET` /api/projects/:projectId/figma/nodes

Get all Figma nodes for a project (for diffing)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| projectId | path | string | Yes | - |

#### `POST` /api/projects/:projectId/figma/sync

Sync a project from Figma

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| projectId | path | string | Yes | - |

### Scenes

#### `GET` /api/screens/:screenId/scenes

Scenes

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| screenId | path | string | Yes | - |

#### `POST` /api/scenes

Create a new scene

#### `PATCH` /api/scenes/:id

Update a scene

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/scenes/:id

Delete a scene

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `GET` /api/scenes/:sceneId/animations

Get a specific scene by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| sceneId | path | string | Yes | - |

### Screens

#### `GET` /api/screens

Get all screens

#### `GET` /api/screens/:id

Get a single screen

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/screens

Create a new screen

#### `PATCH` /api/screens/:id

Update a screen

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/screens/:id

Delete a screen

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/projects/:projectId/figma/import-frame

Store Figma frame data as a screen (called from frontend after MCP fetch)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| projectId | path | string | Yes | - |

### Settings

#### `GET` /api/settings-profiles

Get all settings profiles

#### `GET` /api/settings-profiles/current

Get current/active settings profile (global or default)

#### `GET` /api/settings-profiles/:id

Get settings profile by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `GET` /api/settings-profiles/community/:communityId

Get settings profile by community ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| communityId | path | string | Yes | - |

#### `POST` /api/settings-profiles

Create new settings profile

#### `PATCH` /api/settings-profiles/:id

Update settings profile

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `PATCH` /api/settings-profiles/:id/data

Update settings profile data (merge with existing)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/settings-profiles/:id/set-default

Set profile as default

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/settings-profiles/:id

Delete settings profile

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/settings-profiles/initialize-global

Create or get global settings profile with defaults

### Timeline

#### `GET` /api/timeline-actions/:id

Get a specific timelin by ID

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/timeline-actions

Create a new timelin

#### `PATCH` /api/timeline-actions/:id

Update a timelin

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/timeline-actions/:id

Delete a timelin

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### Triggers

#### `GET` /api/scenes/:sceneId/triggers

Triggers

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| sceneId | path | string | Yes | - |

#### `POST` /api/triggers

Create a new trigger

#### `PATCH` /api/triggers/:id

Update a trigger

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/triggers/:id

Delete a trigger

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### Video

#### `GET` /api/video-candidates

Get all video candidates

#### `GET` /api/video-candidates/status/:status

Get video candidates by status (pending, approved, rejected)

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| status | path | string | Yes | - |

#### `GET` /api/video-candidates/:id

Get a single video candidate

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/video-candidates

Try to extract thumbnail and duration

#### `POST` /api/video-candidates/:id/reject

Reject video candidate

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `DELETE` /api/video-candidates/:id

Delete video candidate

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

### Vocabulary

#### `GET` /api/vocabulary

Vocabulary

#### `POST` /api/vocabulary

Create a new vocabular

#### `DELETE` /api/vocabulary/:id

Delete a vocabular

**Parameters:**

| Name | In | Type | Required | Description |
|------|-----|------|----------|-------------|
| id | path | string | Yes | - |

#### `POST` /api/naca/vocabulary/sync

POST /api/naca/vocabulary/sync

## Schemas

### User

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| username | string | No | - |
| password | string | No | - |

### Screen

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| projectId | string | No | - |

### FigmaNode

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| projectId | string | No | - |

### Project

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| name | string | No | - |
| description | string | No | - |
| figmaFileKey | string | No | - |
| figmaPageId | string | No | - |
| figmaLastSyncedAt | datetime | No | - |
| figmaBranch | string | No | - |
| createdAt | datetime | No | - |
| updatedAt | datetime | No | - |

### GameObject

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| screenId | string | No | - |

### Scene

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| screenId | string | No | - |

### ObjectState

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| sceneId | string | No | - |

### Trigger

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| sceneId | string | No | - |

### Vocabulary

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| projectId | string | No | - |

### Animation

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| objectId | string | No | - |

### Keyframe

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| animationId | string | No | - |

### TimelineAction

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| animationId | string | No | - |

### FeatureHelp

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| featureKey | string | No | - |
| title | string | No | - |
| description | string | No | - |
| videoUrl | string | No | - |
| thumbnailUrl | string | No | - |
| category | string | No | - |
| shortcutKey | string | No | - |
| relatedFeatures | string | No | - |
| order | number | No | - |
| isNew | boolean | No | - |
| documentedAt | datetime | No | - |
| testedAt | datetime | No | - |
| viewCount | number | No | - |
| analytics | unknown | No | - |
| lastViewedAt | datetime | No | - |
| analytics | unknown | No | - |
| createdAt | datetime | No | - |
| updatedAt | datetime | No | - |

### HelpVideoCandidate

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| featureKey | string | No | - |
| videoUrl | string | No | - |
| thumbnailUrl | string | No | - |
| testDescription | string | No | - |
| testPlanSummary | string | No | - |
| duration | number | No | - |
| status | string | No | - |
| approvedAt | datetime | No | - |
| approvedBy | string | No | - |
| rejectionReason | string | No | - |
| capturedAt | datetime | No | - |
| createdAt | datetime | No | - |

### AppSetting

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| nacaApiKey | string | No | - |
| nacaApiKeyDisabled | boolean | No | - |
| nacaEnvironment | string | No | - |
| nacaRemoteVersion | string | No | - |
| nacaRemoteCodeHash | string | No | - |
| nacaRemoteLastFetched | datetime | No | - |
| nacaRemoteReviewedAt | datetime | No | - |
| updatedAt | datetime | No | - |

### ApiDoc

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| slug | string | No | - |
| version | string | No | - |
| title | string | No | - |
| description | string | No | - |
| jsonPayload | object | No | - |
| apiVersion | unknown | No | - |
| generatedAt | unknown | No | - |
| schemaHash | unknown | No | - |
| endpoints | unknown | No | - |
| id | unknown | No | - |
| path | unknown | No | - |
| method | unknown | No | - |
| description | unknown | No | - |
| category | unknown | No | - |

### Subdomain

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| subdomain | string | No | - |
| parentDomain | string | No | - |
| fullDomain | string | No | - |
| purpose | string | No | - |
| description | string | No | - |
| targetIp | string | No | - |
| dnsStatus | string | No | - |
| replitVerified | boolean | No | - |
| sslCertStatus | string | No | - |
| lastDnsCheck | datetime | No | - |
| dnsCheckResult | object | No | - |
| checkedAt | unknown | No | - |

### SettingsProfile

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | No | - |
| name | string | No | - |
| userId | string | No | - |

## WebSocket Topics

Connect to `/ws/dev-sync` for real-time synchronization with NACA.

**Connection URL:** `wss://create.naca.community/ws/dev-sync`

**Protocol:** `naca-devsync-v1`

**Message Format:**
```json
{
  "topic": "topic_name",
  "payload": {
    "...": "topic-specific data"
  },
  "timestamp": "ISO8601"
}
```

### Inbound Topics (NACA → Activity Editor)

These topics are sent by NACA to update the Activity Editor state.

#### `activityDiff`

Receive incremental activity changes from NACA. Apply these diffs to maintain sync.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "activityId": {
      "type": "string",
      "description": "Activity being updated"
    },
    "version": {
      "type": "string",
      "description": "New version after applying diff"
    },
    "changes": {
      "type": "object",
      "description": "JSON Patch format (RFC 6902) array of operations",
      "properties": {
        "op": {
          "type": "string",
          "enum": [
            "add",
            "remove",
            "replace",
            "move",
            "copy"
          ]
        },
        "path": {
          "type": "string",
          "description": "JSON Pointer to target location"
        },
        "value": {
          "type": "any",
          "description": "New value (for add/replace)"
        }
      }
    },
    "timestamp": {
      "type": "string",
      "format": "ISO8601"
    }
  },
  "required": [
    "activityId",
    "changes"
  ]
}
```

#### `mediaUpload`

Notification when new media is uploaded to NACA. Activity Editor can then reference this media.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "mediaId": {
      "type": "string",
      "description": "Unique media identifier"
    },
    "url": {
      "type": "string",
      "description": "CDN URL for the media file"
    },
    "type": {
      "type": "string",
      "enum": [
        "image",
        "audio",
        "video"
      ],
      "description": "Media type"
    },
    "filename": {
      "type": "string",
      "description": "Original filename"
    },
    "size": {
      "type": "number",
      "description": "File size in bytes"
    },
    "communityId": {
      "type": "string",
      "description": "Owning community"
    }
  },
  "required": [
    "mediaId",
    "url",
    "type"
  ]
}
```

#### `mediaLink`

Media has been linked to a dictionary entry in NACA. Update vocabulary bindings.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "mediaId": {
      "type": "string"
    },
    "entryId": {
      "type": "string",
      "description": "Dictionary entry ID"
    },
    "mediaType": {
      "type": "string",
      "enum": [
        "image",
        "audio"
      ]
    },
    "dictionaryId": {
      "type": "string"
    }
  },
  "required": [
    "mediaId",
    "entryId"
  ]
}
```

#### `mediaDelete`

Media has been deleted from NACA. Remove references from activity.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "mediaId": {
      "type": "string"
    },
    "reason": {
      "type": "string",
      "optional": true
    }
  },
  "required": [
    "mediaId"
  ]
}
```

#### `vocabularySync`

Full vocabulary sync from NACA dictionary. Replace local cache with this data.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "communityId": {
      "type": "string"
    },
    "dictionaryId": {
      "type": "string"
    },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": {
            "type": "string"
          },
          "indigenousWord": {
            "type": "string"
          },
          "englishTranslation": {
            "type": "string"
          },
          "audioUrl": {
            "type": "string",
            "optional": true
          },
          "imageUrl": {
            "type": "string",
            "optional": true
          },
          "categories": {
            "type": "array",
            "items": {
              "type": "string"
            }
          }
        }
      }
    },
    "totalCount": {
      "type": "number"
    }
  },
  "required": [
    "communityId",
    "dictionaryId",
    "entries"
  ]
}
```

#### `capabilitiesUpdate`

NACA host capabilities have changed. Re-negotiate features and update UI accordingly.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "string",
      "description": "Capabilities version"
    },
    "features": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "List of enabled features: mediaSearch, dropboxIntegration, realTimeSync, activityFolders"
    },
    "authMethods": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "session",
          "jwt",
          "apiKey"
        ]
      }
    },
    "subdomainHandling": {
      "type": "string",
      "enum": [
        "path",
        "subdomain",
        "header"
      ]
    }
  },
  "required": [
    "version",
    "features"
  ]
}
```

#### `ping`

Heartbeat to maintain connection. Both sides should respond with pong.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "timestamp": {
      "type": "number",
      "description": "Unix timestamp in milliseconds"
    }
  }
}
```

#### `sync_status`

Exchange synchronization status. Used to detect and resolve conflicts.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "activityId": {
      "type": "string"
    },
    "localVersion": {
      "type": "string"
    },
    "lastSyncAt": {
      "type": "string",
      "format": "ISO8601"
    },
    "pendingChanges": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "synced",
        "pending",
        "conflict",
        "offline"
      ]
    }
  }
}
```

### Outbound Topics (Activity Editor → NACA)

These topics are sent by the Activity Editor to push changes to NACA.

#### `activity_update`

Push activity changes to NACA in real-time. Sent automatically when objects, scenes, or triggers are modified.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "componentId": {
      "type": "string",
      "description": "Unique activity component ID"
    },
    "version": {
      "type": "string",
      "description": "Activity version (semantic versioning)"
    },
    "timestamp": {
      "type": "string",
      "format": "ISO8601",
      "description": "When the update occurred"
    },
    "payload": {
      "type": "object",
      "description": "ActivityDefinition object with screens, objects, scenes, triggers"
    }
  },
  "required": [
    "componentId",
    "payload"
  ]
}
```

#### `request_activity`

Request the full activity definition from NACA. Used for initial sync or recovery.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "componentId": {
      "type": "string",
      "description": "Activity component ID to request"
    },
    "includeMedia": {
      "type": "boolean",
      "description": "Whether to include media URLs",
      "default": true
    }
  },
  "required": [
    "componentId"
  ]
}
```

#### `vocabulary_push`

Push vocabulary entries created in the editor to NACA dictionary.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "dictionaryId": {
      "type": "string",
      "description": "Target dictionary ID"
    },
    "entries": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "indigenousWord": {
            "type": "string"
          },
          "englishTranslation": {
            "type": "string"
          },
          "audioUrl": {
            "type": "string",
            "optional": true
          },
          "imageUrl": {
            "type": "string",
            "optional": true
          }
        }
      }
    }
  },
  "required": [
    "dictionaryId",
    "entries"
  ]
}
```

#### `preview_request`

Request NACA to open a preview of the current activity state.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "componentId": {
      "type": "string"
    },
    "mode": {
      "type": "string",
      "enum": [
        "standalone",
        "embedded"
      ],
      "default": "standalone"
    }
  },
  "required": [
    "componentId"
  ]
}
```

#### `ping`

Heartbeat to maintain connection. Both sides should respond with pong.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "timestamp": {
      "type": "number",
      "description": "Unix timestamp in milliseconds"
    }
  }
}
```

#### `sync_status`

Exchange synchronization status. Used to detect and resolve conflicts.

**Payload Schema:**
```json
{
  "type": "object",
  "properties": {
    "activityId": {
      "type": "string"
    },
    "localVersion": {
      "type": "string"
    },
    "lastSyncAt": {
      "type": "string",
      "format": "ISO8601"
    },
    "pendingChanges": {
      "type": "number"
    },
    "status": {
      "type": "string",
      "enum": [
        "synced",
        "pending",
        "conflict",
        "offline"
      ]
    }
  }
}
```

## NACA Communication Protocol

This section describes the bi-directional communication protocol between the Activity Editor and NACA hosts.

### Authentication

The Activity Editor supports dual-mode authentication for flexible integration with NACA hosts.

- **Session-based Auth**: Traditional cookie-based sessions via `/api/login` (Replit OAuth). Used when Activity Editor is accessed directly.
- **Token-based Auth (JWT)**: Bearer token authentication via `Authorization: Bearer <token>` header. Used when embedded as iframe or accessed cross-origin.
- **API Key Auth**: NACA API key authentication for server-to-server communication. Pass via `Authorization: Bearer <api-key>` or `X-API-Key: <api-key>` header.
- API keys can be configured via the Settings panel or set as the `NACA_API_KEY` environment variable.

**JWT Authentication:**
```javascript
fetch(''https://create.naca.community/api/projects'', {
  headers: {
    ''Authorization'': ''Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'',
    ''Content-Type'': ''application/json''
  }
})
```

**API Key Authentication:**
```javascript
fetch(''https://create.naca.community/api/activity-editor/capabilities'', {
  headers: {
    ''X-API-Key'': ''naca_key_xxxxx'',
    ''Content-Type'': ''application/json''
  }
})
```

### Rate Limiting

Token bucket algorithm implementation to prevent API abuse while allowing burst traffic.

- **Limit**: 60 requests per minute per IP/API key
- **Burst**: Up to 10 requests can be made simultaneously
- **Queue**: Requests exceeding limits are automatically queued (max 100 pending)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` included in responses
- **429 Response**: Returned when limits exceeded with `Retry-After` header

**Rate Limit Response:**
```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 5,
  "limit": 60,
  "remaining": 0,
  "reset": "2024-01-15T10:00:05Z"
}
```

### Error Handling

Consistent error response format across all endpoints for reliable integration.

- **400 Bad Request**: Invalid request body or parameters. Check the `errors` array for field-specific issues.
- **401 Unauthorized**: Missing or invalid authentication. Refresh token or re-authenticate.
- **403 Forbidden**: Valid auth but insufficient permissions for this resource.
- **404 Not Found**: Resource doesn''t exist. Check the ID and endpoint path.
- **409 Conflict**: Resource conflict (e.g., duplicate name). Modify request and retry.
- **429 Too Many Requests**: Rate limited. Wait for `Retry-After` seconds.
- **500 Internal Server Error**: Server-side issue. Retry with exponential backoff.

**Validation Error Response:**
```json
{
  "error": "Validation failed",
  "errors": [
    { "field": "name", "message": "Name is required" },
    { "field": "screenId", "message": "Invalid screen ID format" }
  ]
}
```

### CORS Configuration

Cross-origin requests are allowed from authorized NACA domains.

- **Allowed Origins**: `https://create.naca.community`, `https://api.create.naca.community`, `https://naca.community`, `https://*.naca.community`
- **Allowed Methods**: GET, POST, PATCH, PUT, DELETE, OPTIONS
- **Allowed Headers**: Authorization, Content-Type, X-API-Key, X-Community-Id, X-Subdomain
- **Credentials**: Supported for session-based auth (cookies)
- **Preflight Cache**: OPTIONS requests cached for 86400 seconds (24 hours)

### Server Environment

The Activity Editor can connect to different NACA server environments.

- **Production** (default): `https://naca.community` - Live community data
- **Development**: `https://native-tongue-lexicon.replit.app` - Testing environment
- Environment can be switched via Settings dropdown in the UI
- Server URL can be locked via `NACA_API_URL` environment variable
- The `APP_BASE_URL` environment variable determines the base URL for absolute URLs in API responses

## NACA Integration Guide

This guide helps NACA developers integrate with the Activity Editor API.

### Quick Start

1. **Discover Capabilities**: Call `GET /api/activity-editor/capabilities` to discover supported features
2. **Negotiate Connection**: Call `POST /api/activity-editor/negotiate` with your host version and required features
3. **Authenticate**: Use API key or JWT authentication based on your integration type
4. **Connect WebSocket**: Establish a WebSocket connection to `/ws/dev-sync` for real-time sync
5. **Start Building**: Create projects, screens, and objects using the REST API

### Authentication Flow

```mermaid
sequenceDiagram
    participant NACA
    participant Editor as Activity Editor
    NACA->>Editor: GET /api/activity-editor/capabilities
    Editor-->>NACA: {apiVersion, features, authMethods}
    NACA->>Editor: POST /api/activity-editor/negotiate
    Editor-->>NACA: {negotiated: true, activeFeatures}
    NACA->>Editor: WebSocket /ws/dev-sync
    Editor-->>NACA: Connection established
```

### Recommended Sync Pattern

1. **Initial Sync**: On connection, send `request_activity` to get current state
2. **Real-time Updates**: Listen for `activityDiff` messages and apply JSON Patch operations
3. **Push Changes**: Send `activity_update` when user modifies the activity in NACA
4. **Conflict Resolution**: Compare versions and merge changes when conflicts detected
5. **Heartbeat**: Exchange `ping`/`pong` messages every 30 seconds to maintain connection

### Error Recovery

| Scenario | Action |
|----------|--------|
| WebSocket disconnect | Reconnect with exponential backoff (1s, 2s, 4s, max 60s) |
| 429 Rate Limited | Wait for `Retry-After` header value, then retry |
| 401 Unauthorized | Refresh authentication token and retry |
| 500 Server Error | Retry with exponential backoff, max 3 attempts |
| Sync conflict | Request full activity state and merge changes |

### Base URLs

| Environment | Base URL | WebSocket URL |
|-------------|----------|---------------|
| Production | `https://create.naca.community` | `wss://create.naca.community/ws/dev-sync` |
| API Docs | `https://api.create.naca.community` | N/A |
| Development | `http://localhost:5000` | `ws://localhost:5000/ws/dev-sync` |

### Feature Flags

The Activity Editor supports the following feature flags that can be negotiated:

| Feature | Description | Default |
|---------|-------------|---------|
| `figmaSync` | Sync designs from Figma | Enabled |
| `vocabularyBinding` | Bind vocabulary to objects | Enabled |
| `animationTimeline` | Adobe Animate-style timeline | Enabled |
| `realTimeSync` | WebSocket real-time sync | Enabled |
| `mediaLibrary` | Access NACA media library | Enabled |
| `dropboxIntegration` | Dropbox file integration | Depends on host |
| `activityFolders` | Organize activities in folders | Depends on host |

---

## NACA Build Agent Instructions

This section contains implementation requests and updates for the NACA development team.

### Requested API Endpoints

The Activity Editor would benefit from the following NACA API endpoints:

#### 1. Embeddable Components API

**Endpoint**: `GET /api/communities/:id/components`

Returns reusable UI components that can be imported into activities.

```json
{
  "components": [
    {
      "id": "flashcard-basic",
      "name": "Basic Flashcard",
      "type": "interactive",
      "thumbnail": "https://...",
      "config": { "flippable": true, "audioSupport": true }
    }
  ]
}
```

#### 2. Activity Push/Update API

**Endpoint**: `PUT /api/activities/:id`

Allow Activity Editor to push activity updates back to NACA.

```json
{
  "name": "Updated Activity Name",
  "screens": [...],
  "vocabulary": [...],
  "metadata": { "editorVersion": "1.0.0" }
}
```

#### 3. Vocabulary Sync API

**Endpoint**: `POST /api/dictionaries/:id/entries/sync`

Bidirectional vocabulary synchronization with conflict resolution.

```json
{
  "action": "sync",
  "entries": [
    { "id": "...", "word": "...", "translation": "...", "version": 2 }
  ],
  "lastSyncTimestamp": "2024-01-15T10:30:00Z"
}
```

### Current Integration Status

| Feature | Status | Notes |
|---------|--------|-------|
| Community browsing | ✅ Complete | Full read access to communities, activities, dictionaries, media |
| Dictionary-to-Object binding | ✅ Complete | Field-level binding (word/translation/image/audio) |
| Activity-to-Screen mapping | ✅ Complete | Attach activities to screens with persistence |
| Insert Activity Items as Objects | ✅ Complete | Auto-create canvas objects from activity items |
| Preview mode data resolution | ✅ Complete | Bound vocabulary displays in preview mode |
| Media URL proxying | ✅ Complete | All media accessed via secure backend proxy |
| API version monitoring | ✅ Complete | 60-second polling for API changes |
| Push updates to NACA | ⏳ Pending | Awaiting NACA API endpoint |
| Components import | ⏳ Pending | Awaiting NACA components API |
| Real-time WebSocket sync | ⏳ Partial | Inbound messages handled, outbound needs NACA support |

### WebSocket Topics Needed from NACA

The Activity Editor is prepared to handle these WebSocket topics:

| Topic | Direction | Description |
|-------|-----------|-------------|
| `vocabulary_update` | NACA → Editor | Push vocabulary changes to editor |
| `activity_published` | NACA → Editor | Notify when activity is published |
| `media_uploaded` | NACA → Editor | New media available for binding |
| `component_available` | NACA → Editor | New reusable component added |

### Schema Additions for NACA

Activity Editor screens now include NACA integration fields:

```sql
ALTER TABLE screens ADD COLUMN naca_activity_id TEXT;
ALTER TABLE screens ADD COLUMN naca_community_id TEXT;
```

These fields link screens to NACA activities for bidirectional sync.

### Contact

For integration questions or feature requests, update this documentation
or contact the Activity Editor development team.

*Last updated: 2025-12-09*
', '[]', 'published', '2025-12-09 23:24:14.361', TRUE, TRUE, '2025-12-05 00:58:55.106', '2025-12-05 00:58:55.106', '2025-12-09 23:24:14.440', '1e0c7196', NULL, '2025-12-04 20:26:00.717', '2025-12-09 23:24:14.440');

-- Table: feature_help (76 rows)
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('f8f47e3f-c14f-49cc-a844-15243ae08a33', 'objects-attributes', 'Object Attributes', 'Edit selected object properties in the right panel. Set position, size, rotation, opacity, and visibility. Assign custom IDs and classes for trigger targeting.', NULL, NULL, 'objects', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:47.336', 2, '2025-12-03 00:53:28.970');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('7e058b25-4291-43ab-ae92-e1c802f68dbc', 'test-feature', 'Test Feature', 'A test feature for validation', NULL, NULL, 'canvas', NULL, '{}'::text[], 0, TRUE, NULL, NULL, '2025-12-02 12:49:34.718', '2025-12-02 12:49:34.718', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('d9a82fb9-b32a-4d1d-8bac-b43c07e79e8c', 'test-import-feature-xW52fj', 'Test Import Feature', 'This is a test feature created by the testing suite', NULL, NULL, 'canvas', NULL, '{}'::text[], 0, TRUE, NULL, NULL, '2025-12-02 12:57:10.116', '2025-12-02 12:57:10.116', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('2d753cc5-bc1a-4e93-8ad9-b8a51f582c95', 'canvas-zoom', 'Zoom Mode', 'Hold Z key and drag up/down to zoom in/out. Click a point while holding Z to zoom to that location. Use the zoom slider or +/- buttons for precise control.', NULL, NULL, 'canvas', 'Z (hold)', '{}'::text[], 6, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.229', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('d5092c46-9d9b-44e1-b82f-536cab0f39e5', 'canvas-select', 'Object Selection', 'Click on objects to select them. Double-click to isolate an object for focused editing. Press Escape to deselect.', NULL, NULL, 'canvas', 'Click, Double-click, Esc', '{}'::text[], 9, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.369', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('c677d695-d59e-4989-96ae-e55c7aeb7375', 'canvas-duplicate', 'Quick Duplicate', 'Hold Alt while dragging an object to create a duplicate. A ghost preview shows where the copy will be placed.', NULL, NULL, 'canvas', 'Alt+Drag', '{}'::text[], 12, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.507', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('1cbd9ed9-73a6-4af0-9ac9-c2c59ef1edaf', 'canvas-navigation', 'Canvas Navigation', 'Use the Select tool (V) to select and move objects, or the Hand tool (H) to pan the canvas. Hold Spacebar to temporarily switch to pan mode. Use Cmd/Ctrl+scroll or pinch to zoom.', '/attached_assets/help_videos/sample_canvas_navigation.mp4', '/attached_assets/help_videos/thumbnails/sample_canvas_navigation.jpg', 'canvas', 'V, H, Space', '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-02 12:12:11.415', '2025-12-03 09:37:46.001', 3, '2025-12-05 06:20:47.164');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('57e8d43c-1f0f-48c8-99dd-d350d4c817e8', 'canvas-layers', 'Layer Order', 'Use Cmd/Ctrl+[ and Cmd/Ctrl+] to move objects backward and forward in the layer stack. Add Shift for instant move to back/front.', NULL, NULL, 'canvas', 'Cmd+[, Cmd+]', '{}'::text[], 13, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.554', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('0b414472-b564-4af9-b609-94c6a080f703', 'triggers-basics', 'Creating Triggers', 'Triggers define interactive behaviors. Set an event type (tap, swipe, etc.), choose target objects using selectors, and define actions like showing/hiding objects or changing scenes.', NULL, NULL, 'triggers', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:48.060', 1, '2025-12-02 13:44:07.571');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('0752db3e-dc1f-4d14-bcc2-9c84255fd473', 'figma-sync', 'Figma Integration', 'Connect your Figma file to import designs. Click "Update" to sync new frames. Objects from Figma preserve their layer structure and can be targeted independently.', NULL, NULL, 'figma', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:48.712', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('f3986cff-abb4-4022-bee3-ac12be493f44', 'canvas-undo', 'Undo & Redo', 'Undo recent changes with Cmd/Ctrl+Z. Redo with Cmd/Ctrl+Shift+Z. The history tracks object movements, property changes, and reordering.', NULL, NULL, 'canvas', 'Cmd+Z, Cmd+Shift+Z', '{}'::text[], 15, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.647', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('563deb75-b306-4eb7-be1c-14a05184d50e', 'scenes-basics', 'Working with Scenes', 'Scenes contain different states for your game objects. Create scenes for different screens or game states. The default scene loads first when the game starts.', NULL, NULL, 'scenes', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:47.794', 3, '2025-12-04 18:37:59.744');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('7119e5e7-049d-4b6b-81e9-e9245bb4c38c', 'preview-mode', 'Preview Mode', 'Toggle Preview mode to test your interactive design. In preview mode, triggers become active and you can test the user experience as it will appear in the final game.', NULL, NULL, 'canvas', 'P', '{}'::text[], 19, TRUE, NULL, NULL, '2025-12-02 12:12:11.415', '2025-12-03 09:37:46.830', 1, '2025-12-05 06:15:59.847');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('b5b9174d-99ea-4e9b-98f7-cd67c4bb06d6', 'timeline-keyframes', 'Adding Keyframes', 'Click on the timeline to add keyframes. Keyframes define property values at specific times. The animation will smoothly interpolate between keyframes.', NULL, NULL, 'timeline', 'K', '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.970', 1, '2025-12-03 00:53:01.973');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('e23cb97a-b68a-44ea-a08f-878dfde3d822', 'timeline-selection', 'Multi-Keyframe Selection', 'Select multiple keyframes using Shift+click for range selection or Cmd/Ctrl+click to toggle individual keyframes. Use Copy (Cmd/Ctrl+C) and Paste (Cmd/Ctrl+V) to duplicate keyframes.', NULL, NULL, 'timeline', 'Shift+Click, Cmd+Click', '{}'::text[], 6, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:47.108', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('1a2e80c3-d076-4055-bdc3-26c3b408f61c', 'canvas-zoom-controls', 'Zoom Controls', 'Use the zoom slider or +/- buttons in the toolbar. Ctrl/Cmd+scroll wheel also zooms. Press Ctrl/Cmd+0 to reset to 100%.', NULL, NULL, 'canvas', 'Cmd+0, Cmd++, Cmd+-', '{}'::text[], 7, TRUE, NULL, NULL, '2025-12-03 09:37:36.570', '2025-12-03 09:37:46.275', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('680d8b1b-e426-4cf3-b177-ac03905107fd', 'timeline-playhead', 'Timeline Playhead', 'Drag the playhead to scrub through your animation. Click anywhere on the timeline ruler to jump to that position.', NULL, NULL, 'timeline', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:37.262', '2025-12-03 09:37:46.922', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('4602853c-19c6-43b1-9630-f4846fac5c9d', 'overview-canvas', 'Canvas Panel Overview', 'Complete tour of the Canvas panel - the main editing area where you view and manipulate game objects. Learn about selection tools, navigation, zoom controls, and the toolbar.', NULL, NULL, 'canvas', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-03 09:37:35.817', '2025-12-03 09:37:45.586', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('d7c5d867-edac-4dac-830a-feb32dc21853', 'overview-timeline', 'Timeline Panel Overview', 'Master the Timeline panel for creating animations. Learn about layers, keyframes, playback controls, and how to animate object properties over time.', NULL, NULL, 'timeline', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:35.883', '2025-12-03 09:37:45.632', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('b83edeb2-1c61-4ffb-9196-d4c6f4853dd4', 'overview-scenes', 'Scenes & States Overview', 'Understand how scenes work to create different game states. Learn to create scenes, set default scenes, and configure object states per scene.', NULL, NULL, 'scenes', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:35.933', '2025-12-03 09:37:45.678', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('2dd63941-f023-4c89-8a24-fea199924efe', 'overview-triggers', 'Triggers & Interactions Overview', 'Build interactive experiences with triggers. Learn about event types, target selectors, actions, and how to create engaging user interactions.', NULL, NULL, 'triggers', NULL, '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:35.980', '2025-12-03 09:37:45.724', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('2eac8e67-5958-4571-80fc-86e71c659aca', 'overview-attributes', 'Object Attributes Overview', 'Deep dive into the Attributes panel. Learn about transform properties, custom identifiers, data binding, and media attachments for game objects.', NULL, NULL, 'objects', NULL, '{}'::text[], 5, TRUE, NULL, NULL, '2025-12-03 09:37:36.028', '2025-12-03 09:37:45.770', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('269b5ded-62ad-4a9d-8f57-61cdf953ce71', 'overview-vocabulary', 'Vocabulary Management Overview', 'Manage language learning content with the Vocabulary panel. Add words, translations, images, and audio for interactive language games.', NULL, NULL, 'vocabulary', NULL, '{}'::text[], 6, TRUE, NULL, NULL, '2025-12-03 09:37:36.075', '2025-12-03 09:37:45.818', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('dcc1e0f9-0fdd-4bfe-84ec-c078b045d7ff', 'overview-community', 'Community Explorer Overview', 'Browse shared content from NACA communities. Explore activities, dictionaries, and media files that can be imported into your projects.', NULL, NULL, 'community', NULL, '{}'::text[], 7, TRUE, NULL, NULL, '2025-12-03 09:37:36.121', '2025-12-03 09:37:45.865', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('88728162-da8c-4509-bd11-4c2c3bc73d94', 'overview-figma', 'Figma Integration Overview', 'Connect Figma to import your designs directly. Learn to sync frames, update layers, and maintain the connection with your design files.', NULL, NULL, 'figma', NULL, '{}'::text[], 8, TRUE, NULL, NULL, '2025-12-03 09:37:36.167', '2025-12-03 09:37:45.910', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('ff9e9374-ce8c-4450-b784-59e1972747e3', 'overview-keyboard', 'Keyboard Shortcuts Overview', 'Boost your productivity with keyboard shortcuts. Learn all the essential shortcuts for tools, editing, navigation, and workflow optimization.', NULL, NULL, 'shortcuts', NULL, '{}'::text[], 9, TRUE, NULL, NULL, '2025-12-03 09:37:36.214', '2025-12-03 09:37:45.955', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('4f320540-06b7-4c3b-ad3f-cb8153982c4a', 'canvas-select-tool', 'Selection Tool', 'The Selection tool (V) selects the topmost object at the click point based on z-index. Click objects to select, Shift+click to add to selection.', NULL, NULL, 'canvas', 'V', '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:36.323', '2025-12-03 09:37:46.046', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('22618890-a453-4a0f-abdb-3831cee2f277', 'canvas-direct-select', 'Direct Selection Tool', 'The Direct Selection tool (A) drills into overlapping objects, selecting the smallest (most nested) element at the click point.', NULL, NULL, 'canvas', 'A', '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:36.370', '2025-12-03 09:37:46.091', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('ad7e0bc4-31d3-4606-a9c5-43f1ea1b86c3', 'canvas-hand-tool', 'Hand Tool', 'The Hand tool (H) lets you pan the canvas by clicking and dragging. Switch to it permanently or hold Spacebar for temporary access.', NULL, NULL, 'canvas', 'H', '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:36.421', '2025-12-03 09:37:46.136', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('58f0a20d-d3cf-4f41-9089-b7e388564e2e', 'canvas-pan', 'Pan Mode', 'Hold the Spacebar to temporarily enter pan mode. Drag to move the canvas view. Release Spacebar to return to your previous tool.', NULL, NULL, 'canvas', 'Spacebar (hold)', '{}'::text[], 5, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.182', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('6badb30a-af8a-4321-98ec-40441bef81da', 'canvas-fit-screen', 'Fit to Screen', 'Click the Fit button to automatically zoom and center the canvas to show all content. Great for getting an overview of your work.', NULL, NULL, 'canvas', NULL, '{}'::text[], 8, TRUE, NULL, NULL, '2025-12-03 09:37:36.618', '2025-12-03 09:37:46.321', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('d13467c7-baa7-4327-9881-76ccd6ee4819', 'canvas-multi-select', 'Multi-Object Selection', 'Hold Shift and click to add or remove objects from selection. Use Cmd/Ctrl+A to select all objects on the current screen.', NULL, NULL, 'canvas', 'Shift+Click, Cmd+A', '{}'::text[], 10, TRUE, NULL, NULL, '2025-12-03 09:37:36.712', '2025-12-03 09:37:46.415', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('e53f5b6f-dcca-4623-be19-d44f062b9837', 'canvas-marquee', 'Marquee Selection', 'Click and drag on empty canvas space to draw a selection rectangle. All objects intersecting the rectangle will be selected.', NULL, NULL, 'canvas', NULL, '{}'::text[], 11, TRUE, NULL, NULL, '2025-12-03 09:37:36.758', '2025-12-03 09:37:46.461', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('938641aa-9ca9-40a4-aed0-af2718acd278', 'canvas-layer-outlines', 'Layer Outlines', 'Toggle layer outlines to see bounding boxes around all objects. Helpful for selecting objects that are hard to see or overlapping.', NULL, NULL, 'canvas', NULL, '{}'::text[], 14, TRUE, NULL, NULL, '2025-12-03 09:37:36.901', '2025-12-03 09:37:46.600', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('988dc958-e2f9-442a-8cf4-427f16ebedc2', 'canvas-copy-paste', 'Copy & Paste', 'Copy selected objects with Cmd/Ctrl+C and paste with Cmd/Ctrl+V. Pasted objects appear slightly offset from originals.', NULL, NULL, 'canvas', 'Cmd+C, Cmd+V', '{}'::text[], 16, TRUE, NULL, NULL, '2025-12-03 09:37:37.014', '2025-12-03 09:37:46.693', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('8e42d995-42aa-4e1e-9a97-16218eaf68ed', 'canvas-delete', 'Delete Objects', 'Press Delete or Backspace to remove selected objects. This action can be undone with Cmd/Ctrl+Z.', NULL, NULL, 'canvas', 'Delete, Backspace', '{}'::text[], 17, TRUE, NULL, NULL, '2025-12-03 09:37:37.077', '2025-12-03 09:37:46.739', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('52816be3-10ef-48ae-9844-d28470243df7', 'canvas-transform', 'Transform Handles', 'Selected objects show transform handles. Drag corners to resize, edges to stretch, and the rotation handle to rotate.', NULL, NULL, 'canvas', NULL, '{}'::text[], 18, TRUE, NULL, NULL, '2025-12-03 09:37:37.124', '2025-12-03 09:37:46.784', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('7ae01d9b-4796-4869-93a0-c0d1037a73ab', 'timeline-playback', 'Timeline Playback Controls', 'Use the play, pause, and stop buttons to control animation playback. The playhead shows the current time position in your animation.', NULL, NULL, 'timeline', 'Space', '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-02 12:07:08.235', '2025-12-03 09:37:46.876', 4, '2025-12-03 02:11:09.398');
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('23d3dae8-9136-4aeb-88f9-3bded3295dde', 'timeline-keyframe-edit', 'Editing Keyframes', 'Click a keyframe to select it and edit its properties in the inline editor. Change the value, time position, or easing curve.', NULL, NULL, 'timeline', NULL, '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:37.351', '2025-12-03 09:37:47.016', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('58f6984e-94de-4f5a-8d99-545c83d4245e', 'timeline-delete-keyframe', 'Delete Keyframes', 'Select keyframes and press Delete or Backspace to remove them. You can delete multiple keyframes at once.', NULL, NULL, 'timeline', 'Delete, Backspace', '{}'::text[], 7, TRUE, NULL, NULL, '2025-12-03 09:37:37.493', '2025-12-03 09:37:47.153', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('121ae933-3b39-4f8f-9221-bc4692fd1eea', 'timeline-layers', 'Timeline Layers', 'Each object appears as a layer in the timeline. Expand layers to see individual property tracks. Toggle visibility and lock status from here.', NULL, NULL, 'timeline', NULL, '{}'::text[], 8, TRUE, NULL, NULL, '2025-12-03 09:37:37.542', '2025-12-03 09:37:47.199', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('7b0f0339-6c4c-449c-9f53-3852bb6a6fcf', 'timeline-zoom', 'Timeline Zoom', 'Use the zoom slider to adjust the timeline scale. Zoom in to work on precise timing, zoom out to see the full animation.', NULL, NULL, 'timeline', NULL, '{}'::text[], 9, TRUE, NULL, NULL, '2025-12-03 09:37:37.590', '2025-12-03 09:37:47.245', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('14f94eaf-d854-4ed0-8e9d-551ed286b294', 'timeline-duration', 'Animation Duration', 'Adjust the total animation duration using the duration input. This sets how long the animation runs before looping or stopping.', NULL, NULL, 'timeline', NULL, '{}'::text[], 10, TRUE, NULL, NULL, '2025-12-03 09:37:37.641', '2025-12-03 09:37:47.290', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('57ef753e-9808-4f32-b01f-ea4ec7d261be', 'objects-position', 'Position Properties', 'Set exact X and Y coordinates for precise object placement. Values are relative to the screen''s top-left corner.', NULL, NULL, 'objects', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:37.753', '2025-12-03 09:37:47.382', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('95c69898-4db5-4b51-97fe-a39b68153ca0', 'objects-size', 'Size Properties', 'Set Width and Height values to resize objects. Lock aspect ratio to maintain proportions while resizing.', NULL, NULL, 'objects', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:37.798', '2025-12-03 09:37:47.429', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('0f9f10cf-f53c-480a-b33d-bd4b0ae8f434', 'objects-transform', 'Transform Properties', 'Control Scale X, Scale Y, and Rotation. Scale values are multipliers (1 = 100%). Rotation is in degrees.', NULL, NULL, 'objects', NULL, '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:37.844', '2025-12-03 09:37:47.477', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('e0fd74e6-0207-48f7-a550-8e8e9bb748ad', 'objects-opacity', 'Opacity & Visibility', 'Adjust opacity from 0 (invisible) to 1 (fully visible). Toggle visibility to completely hide objects from the game.', NULL, NULL, 'objects', NULL, '{}'::text[], 5, TRUE, NULL, NULL, '2025-12-03 09:37:37.888', '2025-12-03 09:37:47.524', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('eb081303-7f50-4df6-9498-87fc997c3686', 'objects-custom-id', 'Custom ID', 'Assign a unique custom ID for targeting in triggers. Use IDs like "start-button" or "answer-1" for easy reference.', NULL, NULL, 'objects', NULL, '{}'::text[], 6, TRUE, NULL, NULL, '2025-12-03 09:37:37.934', '2025-12-03 09:37:47.571', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('593d5f0a-4eec-41c9-bef4-2f2548aa14d0', 'objects-classes', 'Classes & Tags', 'Add classes to group related objects (like CSS classes). Use classes in trigger selectors to target multiple objects at once.', NULL, NULL, 'objects', NULL, '{}'::text[], 7, TRUE, NULL, NULL, '2025-12-03 09:37:37.980', '2025-12-03 09:37:47.617', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('45c6daa7-9174-4d34-a7b6-892ac5e604ed', 'objects-data-binding', 'Data Binding', 'Bind objects to vocabulary using a data key. The object will display the word, translation, or media from your vocabulary.', NULL, NULL, 'objects', NULL, '{}'::text[], 8, TRUE, NULL, NULL, '2025-12-03 09:37:38.025', '2025-12-03 09:37:47.685', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('03fb8d63-2dc9-4a4f-adf0-bc78e8d73346', 'objects-media', 'Media Bindings', 'Attach image URLs and audio URLs to objects. Images display on visual objects, audio plays on interaction.', NULL, NULL, 'objects', NULL, '{}'::text[], 9, TRUE, NULL, NULL, '2025-12-03 09:37:38.071', '2025-12-03 09:37:47.744', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('e717f6cc-f955-4d51-b7ca-1fc62ae984c5', 'scenes-create', 'Create Scene', 'Click the + button in the Scenes panel to add a new scene. Give it a descriptive name like "Intro" or "Level 1".', NULL, NULL, 'scenes', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:38.165', '2025-12-03 09:37:47.851', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('5dee36c2-2598-43bc-b15c-3ba36f972571', 'scenes-switch', 'Switch Scenes', 'Click a scene in the list to switch to it. The canvas updates to show objects in their state for that scene.', NULL, NULL, 'scenes', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:38.213', '2025-12-03 09:37:47.899', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('8b80d62d-800b-4f4e-84c0-d413a0022ee3', 'scenes-default', 'Set Default Scene', 'Right-click a scene and select "Set as Default" to make it the starting scene when the game loads.', NULL, NULL, 'scenes', NULL, '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:38.266', '2025-12-03 09:37:47.965', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('3cc92944-1ad6-4fa4-81b9-ff958b9af6f2', 'scenes-object-states', 'Object States per Scene', 'Objects can have different properties in each scene. Select an object and change its position, visibility, or other properties for the current scene only.', NULL, NULL, 'scenes', NULL, '{}'::text[], 5, TRUE, NULL, NULL, '2025-12-03 09:37:38.317', '2025-12-03 09:37:48.012', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('6ed0db43-f694-4ffe-a808-39ab6a07bf6b', 'triggers-events', 'Trigger Events', 'Choose what starts the trigger: Click/Tap, Scene Start (runs when scene loads), Timer (after delay), Correct Answer, or Incorrect Answer.', NULL, NULL, 'triggers', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:38.409', '2025-12-03 09:37:48.105', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('98f6403d-5903-46d4-ac30-6cdc58d7de88', 'triggers-selectors', 'Target Selectors', 'Target objects using selectors: #id for specific objects, .class for groups, or * for all objects. Combine selectors like ".button.active".', NULL, NULL, 'triggers', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:38.455', '2025-12-03 09:37:48.151', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('8ddbb8ba-2f2d-465f-84fc-b4162594b4de', 'triggers-actions', 'Trigger Actions', 'Actions determine what happens: Go to Scene, Set Visibility, Set Opacity, Add/Remove Class, Play Audio. Chain multiple actions in sequence.', NULL, NULL, 'triggers', NULL, '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:38.510', '2025-12-03 09:37:48.196', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('cd2b99b6-1860-4b76-a2a1-d96b7e43b40a', 'triggers-goto-scene', 'Go to Scene Action', 'Navigate to a different scene when triggered. Select the target scene from the dropdown. Great for navigation and game flow.', NULL, NULL, 'triggers', NULL, '{}'::text[], 5, TRUE, NULL, NULL, '2025-12-03 09:37:38.557', '2025-12-03 09:37:48.241', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('e12ad5af-f39f-4039-bb6a-d5e5b55f09dd', 'triggers-visibility', 'Set Visibility Action', 'Show or hide objects when triggered. Use selectors to target specific objects or groups of objects.', NULL, NULL, 'triggers', NULL, '{}'::text[], 6, TRUE, NULL, NULL, '2025-12-03 09:37:38.602', '2025-12-03 09:37:48.287', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('b6f1d756-feea-4386-b5ae-ae5f7e030ba9', 'triggers-audio', 'Play Audio Action', 'Play an audio file when triggered. Useful for pronunciation, feedback sounds, or background music.', NULL, NULL, 'triggers', NULL, '{}'::text[], 7, TRUE, NULL, NULL, '2025-12-03 09:37:38.648', '2025-12-03 09:37:48.333', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('48e4afaa-6980-41e6-b56a-fa059c0d3edc', 'vocabulary-add', 'Add Vocabulary', 'Click + to add a new vocabulary item. Enter the word and translation, optionally add image and audio URLs.', NULL, NULL, 'vocabulary', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-03 09:37:38.694', '2025-12-03 09:37:48.379', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('991b3457-0b72-4027-8eaf-bb2bf4062413', 'vocabulary-edit', 'Edit Vocabulary', 'Click a vocabulary item to expand and edit it. Update the word, translation, or media URLs as needed.', NULL, NULL, 'vocabulary', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:38.741', '2025-12-03 09:37:48.424', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('0c6fe2cd-3db4-4936-8696-67dda18c2e3b', 'vocabulary-import', 'Import from NACA', 'Import vocabulary from NACA dictionaries. Browse available dictionaries and click to add entries to your project.', NULL, NULL, 'vocabulary', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:38.787', '2025-12-03 09:37:48.468', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('bf3821a5-e55c-4194-8f8c-67925f34bdaa', 'community-browse', 'Browse Communities', 'View available NACA communities. Each community contains shared activities, dictionaries, and media resources.', NULL, NULL, 'community', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-03 09:37:38.836', '2025-12-03 09:37:48.515', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('9d540f00-e6a3-431c-99c7-5d848ad50d5e', 'community-activities', 'Browse Activities', 'Navigate the Activities tab to see shared language learning activities. Folders organize activities by topic or level.', NULL, NULL, 'community', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:38.882', '2025-12-03 09:37:48.563', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('738363d0-40fd-445a-8a97-4ab5301a77a0', 'timeline-easing', 'Keyframe Easing', 'Choose easing curves to control animation timing. Options include Linear, Ease In, Ease Out, Elastic, Bounce, and more.', NULL, NULL, 'timeline', NULL, '{}'::text[], 5, TRUE, NULL, NULL, '2025-12-03 09:37:37.399', '2025-12-03 09:37:47.062', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('75589729-ac49-4a7d-b9e1-17b5a17e2d7c', 'community-dictionaries', 'Browse Dictionaries', 'View shared dictionaries with vocabulary entries. Listen to audio pronunciations and import entries to your project.', NULL, NULL, 'community', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:38.934', '2025-12-03 09:37:48.618', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('1a73104f-3a58-4fda-9f37-57bc5e6015bc', 'community-media', 'Browse Media', 'Explore shared media files including images, audio, and video. Filter by type and search by name.', NULL, NULL, 'community', NULL, '{}'::text[], 4, TRUE, NULL, NULL, '2025-12-03 09:37:38.982', '2025-12-03 09:37:48.665', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('920e726c-3b03-44e4-9a80-d19900e54254', 'figma-connect', 'Connect Figma File', 'Enter your Figma file key to connect. Find the key in your Figma URL after /file/. The connection allows syncing designs.', NULL, NULL, 'figma', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:39.074', '2025-12-03 09:37:48.757', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('7e60f29e-6ff9-41cd-a4db-929d743de76e', 'figma-update', 'Update from Figma', 'Click Update to sync the latest changes from your Figma file. New frames are added, existing ones are updated.', NULL, NULL, 'figma', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:39.122', '2025-12-03 09:37:48.803', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('5252d3e2-7f99-4df9-b29c-8f3616846b02', 'devsync-connect', 'DevSync Connection', 'Connect to the NACA Activity Editor for real-time synchronization. Push updates and receive changes from the main editor.', NULL, NULL, 'devsync', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-03 09:37:39.167', '2025-12-03 09:37:48.850', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('80f5fe48-ee98-445c-b0aa-5912c6ab8a95', 'devsync-push', 'Push to NACA', 'Send your activity data to the NACA server. This updates the main editor with your screens, objects, and triggers.', NULL, NULL, 'devsync', NULL, '{}'::text[], 2, TRUE, NULL, NULL, '2025-12-03 09:37:39.213', '2025-12-03 09:37:48.894', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('608358f4-6644-40da-8268-6ef4d5e58aab', 'devsync-preview', 'Preview in NACA', 'Request a preview in the NACA Activity Editor. See how your activity looks and behaves in the production environment.', NULL, NULL, 'devsync', NULL, '{}'::text[], 3, TRUE, NULL, NULL, '2025-12-03 09:37:39.258', '2025-12-03 09:37:48.941', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('b6dd3bc6-a106-477a-8f34-d2e7135f938d', 'shortcuts-dialog', 'Keyboard Shortcuts', 'Press ? to open the keyboard shortcuts dialog. View all available shortcuts organized by category.', NULL, NULL, 'shortcuts', '?', '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-03 09:37:39.304', '2025-12-03 09:37:48.986', 0, NULL);
INSERT INTO "feature_help" ("id", "feature_key", "title", "description", "video_url", "thumbnail_url", "category", "shortcut_key", "related_features", "order", "is_new", "documented_at", "tested_at", "created_at", "updated_at", "view_count", "last_viewed_at") VALUES ('e362e413-d14c-41cf-bff5-8d2d13bc3869', 'help-panel', 'Help Panel', 'Access the Help panel for searchable documentation. Browse topics by category or search for specific features.', NULL, NULL, 'general', NULL, '{}'::text[], 1, TRUE, NULL, NULL, '2025-12-03 09:37:39.350', '2025-12-03 09:37:49.033', 0, NULL);

-- Table: help_video_candidates (1 rows)
INSERT INTO "help_video_candidates" ("id", "feature_key", "video_url", "thumbnail_url", "test_description", "test_plan_summary", "duration", "status", "approved_at", "approved_by", "rejection_reason", "captured_at", "created_at") VALUES ('dfd603dc-42cf-41ef-85e5-cfeefa71f441', 'canvas-navigation', '/attached_assets/help_videos/sample_canvas_navigation.mp4', '/attached_assets/help_videos/thumbnails/sample_canvas_navigation.jpg', 'Demonstration of canvas navigation showing how to select, pan, and zoom in the editor', '1. Navigate to editor
2. Click on objects to select them
3. Use spacebar + drag to pan
4. Use scroll wheel to zoom', 5, 'approved', '2025-12-03 09:24:25.407', 'admin', NULL, '2025-12-03 09:18:40.823', '2025-12-03 09:18:40.823');

-- Table: subdomains (2 rows)
INSERT INTO "subdomains" ("id", "subdomain", "parent_domain", "full_domain", "purpose", "description", "target_ip", "dns_status", "replit_verified", "ssl_cert_status", "last_dns_check", "dns_check_result", "porkbun_records", "replit_verification_code", "is_active", "created_at", "updated_at") VALUES ('c3751e80-9e71-4d84-ad20-621c258a922f', 'api.create', 'naca.community', 'api.create.naca.community', 'api-docs', 'Activity Editor API Documentation', '34.111.179.208', 'pending', FALSE, 'pending', '2025-12-04 21:06:30.009', '{"checkedAt":"2025-12-04T21:06:30.009Z"}'::jsonb, '{"aRecord":{"host":"api.create","added":false,"answer":"34.111.179.208"},"txtRecord":{"host":"_replit-verify.api.create","added":false,"answer":""}}'::jsonb, NULL, TRUE, '2025-12-04 21:05:18.025', '2025-12-04 21:06:30.009');
INSERT INTO "subdomains" ("id", "subdomain", "parent_domain", "full_domain", "purpose", "description", "target_ip", "dns_status", "replit_verified", "ssl_cert_status", "last_dns_check", "dns_check_result", "porkbun_records", "replit_verification_code", "is_active", "created_at", "updated_at") VALUES ('d13bf1ab-6e9a-4804-9f8c-e20af06ed427', 'create', 'naca.community', 'create.naca.community', 'main-app', 'Indigamate Studio - Activity Editor', '34.111.179.208', 'propagating', FALSE, 'pending', '2025-12-04 21:06:30.066', '{"checkedAt":"2025-12-04T21:06:30.066Z","httpStatus":404,"resolvedIp":"34.111.179.208"}'::jsonb, '{"aRecord":{"host":"create","added":false,"answer":"34.111.179.208"},"txtRecord":{"host":"_replit-verify.create","added":false,"answer":""}}'::jsonb, NULL, TRUE, '2025-12-04 21:04:42.620', '2025-12-04 21:06:30.066');

-- Table: vocabulary (1 rows)
INSERT INTO "vocabulary" ("id", "project_id", "word", "translation", "image_url", "audio_url", "category", "difficulty", "metadata", "created_at") VALUES ('547b46ed-1d6e-4e30-af96-df67dc1ee49f', 'cd2da62d-c8a9-49c7-a9e8-f81dad9bd48c', 'word_k7Z7w0', 'translation_test', NULL, NULL, NULL, 1, NULL, '2025-12-02 07:03:27.269');

-- Table: session (data export skipped - ephemeral data)

-- Table: settings_profiles (empty - no data)

