import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Screen, InsertScreen } from "@shared/schema";

async function fetchScreens(): Promise<Screen[]> {
  const response = await fetch("/api/screens");
  if (!response.ok) {
    throw new Error("Failed to fetch screens");
  }
  return response.json();
}

async function createScreen(data: InsertScreen): Promise<Screen> {
  const response = await fetch("/api/screens", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to create screen");
  }
  return response.json();
}

async function updateScreen(id: string, data: Partial<InsertScreen>): Promise<Screen> {
  const response = await fetch(`/api/screens/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error("Failed to update screen");
  }
  return response.json();
}

async function deleteScreen(id: string): Promise<void> {
  const response = await fetch(`/api/screens/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete screen");
  }
}

export function useScreens() {
  return useQuery({
    queryKey: ["screens"],
    queryFn: fetchScreens,
  });
}

export function useCreateScreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screens"] });
    },
  });
}

export function useUpdateScreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertScreen> }) =>
      updateScreen(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screens"] });
    },
  });
}

export function useDeleteScreen() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteScreen,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["screens"] });
    },
  });
}
