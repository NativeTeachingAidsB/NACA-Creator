import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Project, InsertProject } from "@shared/schema";

interface SyncResult {
  success: boolean;
  framesFound: number;
  framesImported: number;
  framesUpdated: number;
  errors: string[];
}

interface FigmaStatus {
  configured: boolean;
}

async function fetchProjects(): Promise<Project[]> {
  const response = await fetch("/api/projects");
  if (!response.ok) throw new Error("Failed to fetch projects");
  return response.json();
}

async function fetchProject(id: string): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`);
  if (!response.ok) throw new Error("Failed to fetch project");
  return response.json();
}

async function createProject(project: InsertProject): Promise<Project> {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error("Failed to create project");
  return response.json();
}

async function updateProject(id: string, project: Partial<InsertProject>): Promise<Project> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(project),
  });
  if (!response.ok) throw new Error("Failed to update project");
  return response.json();
}

async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete project");
}

export function useProjects() {
  return useQuery({
    queryKey: ["/api/projects"],
    queryFn: fetchProjects,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["/api/projects", id],
    queryFn: () => fetchProject(id!),
    enabled: !!id,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<InsertProject>) => updateProject(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });
}

export function useFigmaStatus() {
  return useQuery<FigmaStatus>({
    queryKey: ["/api/figma/status"],
    queryFn: async () => {
      const response = await fetch("/api/figma/status");
      if (!response.ok) throw new Error("Failed to check Figma status");
      return response.json();
    },
  });
}

export function useSyncFigma() {
  const queryClient = useQueryClient();
  return useMutation<SyncResult, Error, string>({
    mutationFn: async (projectId: string) => {
      const response = await fetch(`/api/projects/${projectId}/figma/sync`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Sync failed");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/screens"] });
    },
  });
}
