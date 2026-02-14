import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { 
  GameObject, InsertGameObject,
  Scene, InsertScene,
  ObjectState, InsertObjectState,
  Trigger, InsertTrigger,
  Vocabulary, InsertVocabulary,
  Animation, InsertAnimation,
  Keyframe, InsertKeyframe,
  TimelineAction, InsertTimelineAction
} from "@shared/schema";

const API_BASE = "/api";

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
}

async function postJson<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to post to ${url}`);
  return res.json();
}

async function patchJson<T>(url: string, data: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to patch ${url}`);
  return res.json();
}

async function deleteRequest(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete ${url}`);
}

// Game Objects hooks
export function useGameObjects(screenId: string | undefined) {
  return useQuery<GameObject[]>({
    queryKey: ["gameObjects", screenId],
    queryFn: () => fetchJson(`${API_BASE}/screens/${screenId}/objects`),
    enabled: !!screenId,
  });
}

export function useCreateGameObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertGameObject) => postJson<GameObject>(`${API_BASE}/objects`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["gameObjects", variables.screenId] });
    },
  });
}

export function useUpdateGameObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertGameObject> & { id: string }) => 
      patchJson<GameObject>(`${API_BASE}/objects/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["gameObjects", result.screenId] });
    },
  });
}

export function useDeleteGameObject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/objects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gameObjects"] });
    },
  });
}

export function useBatchUpdateZIndex() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (updates: Array<{ id: string; zIndex: number }>) =>
      patchJson<GameObject[]>(`${API_BASE}/objects/batch-zindex`, { updates }),
    onSuccess: (results) => {
      if (results.length > 0) {
        queryClient.invalidateQueries({ queryKey: ["gameObjects", results[0].screenId] });
      }
    },
  });
}

// Scenes hooks
export function useScenes(screenId: string | undefined) {
  return useQuery<Scene[]>({
    queryKey: ["scenes", screenId],
    queryFn: () => fetchJson(`${API_BASE}/screens/${screenId}/scenes`),
    enabled: !!screenId,
  });
}

export function useCreateScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertScene) => postJson<Scene>(`${API_BASE}/scenes`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["scenes", variables.screenId] });
    },
  });
}

export function useUpdateScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertScene> & { id: string }) =>
      patchJson<Scene>(`${API_BASE}/scenes/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["scenes", result.screenId] });
    },
  });
}

export function useDeleteScene() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/scenes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scenes"] });
    },
  });
}

// Object States hooks
export function useObjectStates(sceneId: string | undefined) {
  return useQuery<ObjectState[]>({
    queryKey: ["objectStates", sceneId],
    queryFn: () => fetchJson(`${API_BASE}/scenes/${sceneId}/states`),
    enabled: !!sceneId,
  });
}

export function useCreateObjectState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertObjectState) => postJson<ObjectState>(`${API_BASE}/states`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["objectStates", variables.sceneId] });
    },
  });
}

export function useUpdateObjectState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertObjectState> & { id: string }) =>
      patchJson<ObjectState>(`${API_BASE}/states/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["objectStates", result.sceneId] });
    },
  });
}

export function useDeleteObjectState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/states/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["objectStates"] });
    },
  });
}

// Triggers hooks
export function useTriggers(sceneId: string | undefined) {
  return useQuery<Trigger[]>({
    queryKey: ["triggers", sceneId],
    queryFn: () => fetchJson(`${API_BASE}/scenes/${sceneId}/triggers`),
    enabled: !!sceneId,
  });
}

export function useCreateTrigger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertTrigger) => postJson<Trigger>(`${API_BASE}/triggers`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["triggers", variables.sceneId] });
    },
  });
}

export function useUpdateTrigger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertTrigger> & { id: string }) =>
      patchJson<Trigger>(`${API_BASE}/triggers/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["triggers", result.sceneId] });
    },
  });
}

export function useDeleteTrigger() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/triggers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["triggers"] });
    },
  });
}

// Sync Layers hook
interface SyncLayersResult {
  success: boolean;
  layersFound: number;
  layersImported: number;
  layersUpdated: number;
  layersSkipped: number;
  errors: string[];
}

export function useSyncLayers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (screenId: string) => postJson<SyncLayersResult>(`${API_BASE}/screens/${screenId}/sync-layers`, {}),
    onSuccess: (_, screenId) => {
      queryClient.invalidateQueries({ queryKey: ["gameObjects", screenId] });
    },
  });
}

// Vocabulary hooks
export function useVocabulary() {
  return useQuery<Vocabulary[]>({
    queryKey: ["vocabulary"],
    queryFn: () => fetchJson(`${API_BASE}/vocabulary`),
  });
}

export function useCreateVocabulary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertVocabulary) => postJson<Vocabulary>(`${API_BASE}/vocabulary`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });
}

export function useDeleteVocabulary() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/vocabulary/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vocabulary"] });
    },
  });
}

interface ActivityDefinition {
  id: string;
  componentId: string;
  version: string;
  screens: any[];
}

export function useExportActivity(projectId: string | undefined) {
  return useQuery<ActivityDefinition>({
    queryKey: ["exportActivity", projectId],
    queryFn: () => fetchJson(`${API_BASE}/projects/${projectId}/export`),
    enabled: !!projectId,
  });
}

interface ImportResult {
  success: boolean;
  projectId: string;
  message: string;
}

export function useImportActivity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ data, projectName }: { data: ActivityDefinition; projectName?: string }) => {
      const url = projectName 
        ? `${API_BASE}/projects/import?name=${encodeURIComponent(projectName)}`
        : `${API_BASE}/projects/import`;
      return postJson<ImportResult>(url, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["screens"] });
    },
  });
}

// ==================== Animation Hooks ====================

export function useAnimations(objectId: string | undefined) {
  return useQuery<Animation[]>({
    queryKey: ["animations", objectId],
    queryFn: () => fetchJson(`${API_BASE}/objects/${objectId}/animations`),
    enabled: !!objectId,
  });
}

export function useAnimationsByScene(sceneId: string | undefined) {
  return useQuery<Animation[]>({
    queryKey: ["sceneAnimations", sceneId],
    queryFn: () => fetchJson(`${API_BASE}/scenes/${sceneId}/animations`),
    enabled: !!sceneId,
  });
}

export function useAnimation(animationId: string | undefined) {
  return useQuery<Animation>({
    queryKey: ["animation", animationId],
    queryFn: () => fetchJson(`${API_BASE}/animations/${animationId}`),
    enabled: !!animationId,
  });
}

export function useCreateAnimation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertAnimation) => postJson<Animation>(`${API_BASE}/animations`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["animations", variables.objectId] });
      if (variables.sceneId) {
        queryClient.invalidateQueries({ queryKey: ["sceneAnimations", variables.sceneId] });
      }
    },
  });
}

export function useUpdateAnimation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertAnimation> & { id: string }) =>
      patchJson<Animation>(`${API_BASE}/animations/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["animations", result.objectId] });
      queryClient.invalidateQueries({ queryKey: ["animation", result.id] });
      if (result.sceneId) {
        queryClient.invalidateQueries({ queryKey: ["sceneAnimations", result.sceneId] });
      }
    },
  });
}

export function useDeleteAnimation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/animations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["animations"] });
      queryClient.invalidateQueries({ queryKey: ["sceneAnimations"] });
    },
  });
}

// ==================== Keyframe Hooks ====================

export function useKeyframes(animationId: string | undefined) {
  return useQuery<Keyframe[]>({
    queryKey: ["keyframes", animationId],
    queryFn: () => fetchJson(`${API_BASE}/animations/${animationId}/keyframes`),
    enabled: !!animationId,
  });
}

export function useKeyframe(keyframeId: string | undefined) {
  return useQuery<Keyframe>({
    queryKey: ["keyframe", keyframeId],
    queryFn: () => fetchJson(`${API_BASE}/keyframes/${keyframeId}`),
    enabled: !!keyframeId,
  });
}

export function useCreateKeyframe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertKeyframe) => postJson<Keyframe>(`${API_BASE}/keyframes`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["keyframes", variables.animationId] });
    },
  });
}

export function useUpdateKeyframe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertKeyframe> & { id: string }) =>
      patchJson<Keyframe>(`${API_BASE}/keyframes/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["keyframes", result.animationId] });
      queryClient.invalidateQueries({ queryKey: ["keyframe", result.id] });
    },
  });
}

export function useDeleteKeyframe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/keyframes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["keyframes"] });
    },
  });
}

// ==================== Timeline Action Hooks ====================

export function useTimelineActions(animationId: string | undefined) {
  return useQuery<TimelineAction[]>({
    queryKey: ["timelineActions", animationId],
    queryFn: () => fetchJson(`${API_BASE}/animations/${animationId}/actions`),
    enabled: !!animationId,
  });
}

export function useTimelineAction(actionId: string | undefined) {
  return useQuery<TimelineAction>({
    queryKey: ["timelineAction", actionId],
    queryFn: () => fetchJson(`${API_BASE}/timeline-actions/${actionId}`),
    enabled: !!actionId,
  });
}

export function useCreateTimelineAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertTimelineAction) => postJson<TimelineAction>(`${API_BASE}/timeline-actions`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["timelineActions", variables.animationId] });
    },
  });
}

export function useUpdateTimelineAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertTimelineAction> & { id: string }) =>
      patchJson<TimelineAction>(`${API_BASE}/timeline-actions/${id}`, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["timelineActions", result.animationId] });
      queryClient.invalidateQueries({ queryKey: ["timelineAction", result.id] });
    },
  });
}

export function useDeleteTimelineAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/timeline-actions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timelineActions"] });
    },
  });
}
