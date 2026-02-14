import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HelpVideoCandidate, InsertHelpVideoCandidate } from "@shared/schema";

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

async function deleteRequest(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete ${url}`);
}

export function useVideoCandidates() {
  return useQuery<HelpVideoCandidate[]>({
    queryKey: ["videoCandidates"],
    queryFn: () => fetchJson(`${API_BASE}/video-candidates`),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVideoCandidatesByStatus(status: string | undefined) {
  return useQuery<HelpVideoCandidate[]>({
    queryKey: ["videoCandidates", "status", status],
    queryFn: () => fetchJson(`${API_BASE}/video-candidates/status/${status}`),
    enabled: !!status,
    staleTime: 1000 * 60 * 5,
  });
}

export function useVideoCandidatesByFeatureKey(featureKey: string | undefined) {
  return useQuery<HelpVideoCandidate[]>({
    queryKey: ["videoCandidates", "feature", featureKey],
    queryFn: () => fetchJson(`${API_BASE}/video-candidates/feature/${featureKey}`),
    enabled: !!featureKey,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateVideoCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertHelpVideoCandidate) => 
      postJson<HelpVideoCandidate>(`${API_BASE}/video-candidates`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoCandidates"] });
    },
  });
}

export function useApproveVideoCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, approvedBy }: { id: string; approvedBy?: string }) => 
      postJson<HelpVideoCandidate>(`${API_BASE}/video-candidates/${id}/approve`, { approvedBy }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoCandidates"] });
      queryClient.invalidateQueries({ queryKey: ["featureHelp"] });
    },
  });
}

export function useRejectVideoCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => 
      postJson<HelpVideoCandidate>(`${API_BASE}/video-candidates/${id}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoCandidates"] });
    },
  });
}

export function useDeleteVideoCandidate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRequest(`${API_BASE}/video-candidates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videoCandidates"] });
    },
  });
}
