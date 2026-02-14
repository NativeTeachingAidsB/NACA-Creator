import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { FeatureHelp, InsertFeatureHelp } from "@shared/schema";

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

export function useFeatureHelp() {
  return useQuery<FeatureHelp[]>({
    queryKey: ["featureHelp"],
    queryFn: () => fetchJson(`${API_BASE}/feature-help`),
    staleTime: 1000 * 60 * 60,
  });
}

export function useFeatureHelpByCategory(category: string | undefined) {
  return useQuery<FeatureHelp[]>({
    queryKey: ["featureHelp", "category", category],
    queryFn: () => fetchJson(`${API_BASE}/feature-help/category/${category}`),
    enabled: !!category,
    staleTime: 1000 * 60 * 60,
  });
}

export function useFeatureHelpByKey(featureKey: string | undefined) {
  return useQuery<FeatureHelp>({
    queryKey: ["featureHelp", "key", featureKey],
    queryFn: () => fetchJson(`${API_BASE}/feature-help/key/${featureKey}`),
    enabled: !!featureKey,
    staleTime: 1000 * 60 * 60,
  });
}

export function useCreateFeatureHelp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertFeatureHelp) => postJson<FeatureHelp>(`${API_BASE}/feature-help`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureHelp"] });
    },
  });
}

export function useUpdateFeatureHelp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<InsertFeatureHelp> & { id: string }) =>
      patchJson<FeatureHelp>(`${API_BASE}/feature-help/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureHelp"] });
    },
  });
}

export function useDeleteFeatureHelp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/feature-help/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["featureHelp"] });
    },
  });
}

export function useRecordHelpView() {
  return useMutation({
    mutationFn: (featureKey: string) => 
      postJson<{ success: boolean; viewCount: number }>(`${API_BASE}/feature-help/${featureKey}/view`, {}),
  });
}

interface HelpAnalytics {
  topViewed: FeatureHelp[];
  recentlyViewed: FeatureHelp[];
  totalViews: number;
}

export function useFeatureHelpAnalytics() {
  return useQuery<HelpAnalytics>({
    queryKey: ["featureHelp", "analytics"],
    queryFn: () => fetchJson(`${API_BASE}/feature-help/analytics`),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
