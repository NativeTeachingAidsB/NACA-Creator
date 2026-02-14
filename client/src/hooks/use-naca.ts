import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nacaApi, NACACapabilities, NACACommunity, NACACommunityProfile, NACAMediaFile, NACAMediaSearchQuery, NACAFolderNode, NACADropboxBrowseRequest, NACAActivityFolder, NACAEndpointSchema, NACADictionaryEntry, NACAActivity, NACAActivityDetails, NACAActivityItem, NACAActivityItemsResult, NACAEmbedComponent, NACAEmbedManifest, NACAEmbedTokenRequest } from '@/lib/naca-api';

// Query Keys
export const nacaKeys = {
  all: ['naca'] as const,
  capabilities: () => [...nacaKeys.all, 'capabilities'] as const,
  schema: (endpointId: string) => [...nacaKeys.all, 'schema', endpointId] as const,
  communities: () => [...nacaKeys.all, 'communities'] as const,
  community: (id: string) => [...nacaKeys.all, 'community', id] as const,
  dictionaries: (communityId: string) => [...nacaKeys.all, 'dictionaries', communityId] as const,
  dictionaryEntries: (dictionaryId: string, options?: object) => [...nacaKeys.all, 'dictionaryEntries', dictionaryId, options] as const,
  activities: (communityId: string, options?: object) => [...nacaKeys.all, 'activities', communityId, options] as const,
  activityDetails: (communityId: string, activityId: string) => [...nacaKeys.all, 'activityDetails', communityId, activityId] as const,
  activityItems: (communityId: string, activityId: string) => [...nacaKeys.all, 'activityItems', communityId, activityId] as const,
  media: () => [...nacaKeys.all, 'media'] as const,
  mediaSearch: (query: NACAMediaSearchQuery) => [...nacaKeys.media(), 'search', query] as const,
  dropbox: (communityId: string, path: string) => [...nacaKeys.all, 'dropbox', communityId, path] as const,
  activityFolder: (communityId: string, activityName: string) => [...nacaKeys.all, 'activityFolder', communityId, activityName] as const,
  embeds: () => [...nacaKeys.all, 'embeds'] as const,
  embedManifest: (componentType: string) => [...nacaKeys.embeds(), 'manifest', componentType] as const,
  drafts: () => [...nacaKeys.all, 'drafts'] as const,
  notifications: (unreadOnly?: boolean) => [...nacaKeys.all, 'notifications', { unreadOnly }] as const,
  changelog: (sinceVersion?: string) => [...nacaKeys.all, 'changelog', { sinceVersion }] as const,
};

// Simple config check hook - no API calls, just checks if NACA is configured
export function useNacaApiConfig() {
  return {
    isConfigured: nacaApi.isConfigured(),
    baseUrl: nacaApi.getBaseUrl?.() ?? null,
  };
}

// Capabilities Hook
export function useNacaCapabilities(options?: { enabled?: boolean; refetchInterval?: number }) {
  return useQuery({
    queryKey: nacaKeys.capabilities(),
    queryFn: () => nacaApi.getCapabilities(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    enabled: nacaApi.isConfigured() && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    retry: false,
    throwOnError: false,
  });
}

// Check for capability updates (lightweight HEAD request)
export function useNacaCapabilitiesCheck() {
  return useMutation({
    mutationFn: () => nacaApi.checkCapabilitiesVersion(),
  });
}

// Feature check hook
export function useNacaHasFeature(feature: string): boolean {
  const { data } = useNacaCapabilities();
  return data?.features.includes(feature) ?? false;
}

// Schema Hook
export function useNacaSchema(endpointId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.schema(endpointId),
    queryFn: () => nacaApi.getEndpointSchema(endpointId),
    staleTime: 60 * 60 * 1000, // 1 hour - schemas change infrequently
    enabled: nacaApi.isConfigured() && !!endpointId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Communities Hooks
export function useNacaCommunities(options?: { enabled?: boolean; useMockFallback?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.communities(),
    queryFn: () => nacaApi.getCommunities(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: (nacaApi.isConfigured() || options?.useMockFallback) && (options?.enabled ?? true),
    retry: false, // Don't retry on auth failures
    throwOnError: false, // Never throw - let component handle error state
  });
}

export function useNacaCommunity(communityId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.community(communityId),
    queryFn: () => nacaApi.getCommunity(communityId),
    staleTime: 5 * 60 * 1000,
    enabled: nacaApi.isConfigured() && !!communityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Dictionaries Hook
export function useNacaDictionaries(communityId: string, options?: { enabled?: boolean; useMockFallback?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.dictionaries(communityId),
    queryFn: () => nacaApi.getCommunityDictionaries(communityId),
    staleTime: 5 * 60 * 1000,
    enabled: (nacaApi.isConfigured() || options?.useMockFallback) && !!communityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Dictionary Entries Hook with pagination
export function useNacaDictionaryEntries(
  dictionaryId: string, 
  options?: { 
    enabled?: boolean; 
    limit?: number;
    offset?: number;
    search?: string;
    category?: string;
    useMockFallback?: boolean;
  }
) {
  const queryOptions = {
    limit: options?.limit,
    offset: options?.offset,
    search: options?.search,
    category: options?.category,
  };
  
  return useQuery({
    queryKey: nacaKeys.dictionaryEntries(dictionaryId, queryOptions),
    queryFn: () => nacaApi.getDictionaryEntries(dictionaryId, queryOptions),
    staleTime: 5 * 60 * 1000,
    enabled: (nacaApi.isConfigured() || options?.useMockFallback) && !!dictionaryId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Activities Hook
export function useNacaActivities(
  communityId: string,
  options?: {
    enabled?: boolean;
    type?: string;
    search?: string;
  }
) {
  const queryOptions = {
    type: options?.type,
    search: options?.search,
  };

  return useQuery({
    queryKey: nacaKeys.activities(communityId, queryOptions),
    queryFn: () => nacaApi.getActivities(communityId, queryOptions),
    staleTime: 5 * 60 * 1000,
    enabled: nacaApi.isConfigured() && !!communityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Activity Details Hook
export function useNacaActivityDetails(
  communityId: string,
  activityId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: nacaKeys.activityDetails(communityId, activityId),
    queryFn: () => nacaApi.getActivityDetails(communityId, activityId),
    staleTime: 5 * 60 * 1000,
    enabled: nacaApi.isConfigured() && !!communityId && !!activityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Activity Items Hook
export function useNacaActivityItems(
  communityId: string,
  activityId: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: nacaKeys.activityItems(communityId, activityId),
    queryFn: () => nacaApi.getActivityItems(communityId, activityId),
    staleTime: 5 * 60 * 1000,
    enabled: nacaApi.isConfigured() && !!communityId && !!activityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Media Search Hook
export function useNacaMediaSearch(query: NACAMediaSearchQuery, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.mediaSearch(query),
    queryFn: () => nacaApi.searchMedia(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: nacaApi.isConfigured() && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Alias for searchMedia with different API
export function useNacaSearchMedia(query: NACAMediaSearchQuery, options?: { enabled?: boolean; useMockFallback?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.mediaSearch(query),
    queryFn: () => nacaApi.searchMedia(query),
    staleTime: 2 * 60 * 1000,
    enabled: (nacaApi.isConfigured() || options?.useMockFallback) && !!query.communityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Dropbox Browser Hook
export function useNacaDropboxBrowser(
  communityId: string,
  request: NACADropboxBrowseRequest,
  options?: { enabled?: boolean; useMockFallback?: boolean }
) {
  return useQuery({
    queryKey: nacaKeys.dropbox(communityId, request.path),
    queryFn: () => nacaApi.browseDropbox(communityId, request),
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: (nacaApi.isConfigured() || options?.useMockFallback) && !!communityId && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Activity Folder Hook
export function useNacaActivityFolder(
  communityId: string,
  activityName: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: nacaKeys.activityFolder(communityId, activityName),
    queryFn: () => nacaApi.getActivityFolder(communityId, activityName),
    staleTime: 2 * 60 * 1000,
    enabled: nacaApi.isConfigured() && !!communityId && !!activityName && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

// Cache invalidation helpers
export function useNacaInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidateCapabilities: () => queryClient.invalidateQueries({ queryKey: nacaKeys.capabilities() }),
    invalidateCommunities: () => queryClient.invalidateQueries({ queryKey: nacaKeys.communities() }),
    invalidateCommunity: (id: string) => queryClient.invalidateQueries({ queryKey: nacaKeys.community(id) }),
    invalidateDictionaries: (communityId: string) => queryClient.invalidateQueries({ queryKey: nacaKeys.dictionaries(communityId) }),
    invalidateDictionaryEntries: (dictionaryId: string) => queryClient.invalidateQueries({ queryKey: [...nacaKeys.all, 'dictionaryEntries', dictionaryId] }),
    invalidateMedia: () => queryClient.invalidateQueries({ queryKey: nacaKeys.media() }),
    invalidateActivities: (communityId: string) => queryClient.invalidateQueries({ queryKey: [...nacaKeys.all, 'activities', communityId] }),
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: nacaKeys.all }),
    
    // Selective invalidation for DevSync events
    onMediaUpload: (communityId?: string) => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
      if (communityId) {
        queryClient.invalidateQueries({ queryKey: nacaKeys.community(communityId) });
      }
    },
    onMediaDelete: (communityId?: string) => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.media() });
      if (communityId) {
        queryClient.invalidateQueries({ queryKey: nacaKeys.community(communityId) });
      }
    },
    onCapabilitiesUpdate: () => {
      nacaApi.clearCache();
      queryClient.invalidateQueries({ queryKey: nacaKeys.capabilities() });
    },
  };
}

// DevSync integration hook for real-time updates
export function useNacaDevSyncSubscription() {
  const invalidation = useNacaInvalidation();
  
  // This will be called by the DevSync connection when events arrive
  const handleDevSyncMessage = (type: string, payload: any) => {
    switch (type) {
      case 'capabilities_update':
        invalidation.onCapabilitiesUpdate();
        break;
      case 'media_upload':
        invalidation.onMediaUpload(payload?.communityId);
        break;
      case 'media_delete':
        invalidation.onMediaDelete(payload?.communityId);
        break;
      case 'media_link':
      case 'media_update':
        invalidation.invalidateMedia();
        break;
    }
  };

  return { handleDevSyncMessage };
}

// Configuration status hook
export function useNacaStatus() {
  const isConfigured = nacaApi.isConfigured();
  const cacheStatus = nacaApi.getCacheStatus();
  const { data: capabilities, isLoading, error } = useNacaCapabilities({ enabled: isConfigured });

  return {
    isConfigured,
    isLoading,
    error,
    version: capabilities?.version,
    apiVersion: capabilities?.apiVersion,
    features: capabilities?.features ?? [],
    cacheStatus,
  };
}

// ==================== Embeddable Components Hooks ====================

export function useNacaEmbeds(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.embeds(),
    queryFn: () => nacaApi.getEmbeddableComponents(),
    staleTime: 10 * 60 * 1000, // 10 minutes - component catalog changes infrequently
    enabled: nacaApi.isConfigured() && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

export function useNacaEmbedManifest(componentType: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.embedManifest(componentType),
    queryFn: () => nacaApi.getEmbedManifest(componentType),
    staleTime: 30 * 60 * 1000, // 30 minutes - manifests are stable
    enabled: nacaApi.isConfigured() && !!componentType && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

export function useNacaGenerateEmbedToken() {
  return useMutation({
    mutationFn: ({ componentType, request }: { componentType: string; request: NACAEmbedTokenRequest }) =>
      nacaApi.generateEmbedToken(componentType, request),
  });
}

export function useNacaValidateEmbedToken() {
  return useMutation({
    mutationFn: (token: string) => nacaApi.validateEmbedToken(token),
  });
}

// ==================== Draft Management Hooks ====================

export function useNacaDrafts(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.drafts(),
    queryFn: () => nacaApi.getMyDrafts(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: nacaApi.isConfigured() && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

export function useNacaCreateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      communityId: string;
      type: 'flashcards' | 'storybook' | 'timeline' | 'map';
      name: string;
      description?: string;
      title?: string;
      subtitle?: string;
    }) => nacaApi.createDraft(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.drafts() });
    },
  });
}

export function useNacaUpdateDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ name: string; description: string; title: string; subtitle: string }> }) =>
      nacaApi.updateDraft(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.drafts() });
    },
  });
}

export function useNacaSubmitDraft() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draftId: string) => nacaApi.submitDraftForApproval(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.drafts() });
    },
  });
}

// ==================== Notification Hooks ====================

export function useNacaNotifications(options?: { enabled?: boolean; unreadOnly?: boolean }) {
  return useQuery({
    queryKey: nacaKeys.notifications(options?.unreadOnly),
    queryFn: () => nacaApi.getNotifications(options?.unreadOnly),
    staleTime: 30 * 1000, // 30 seconds - notifications should be fresh
    enabled: nacaApi.isConfigured() && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}

export function useNacaMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => nacaApi.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.notifications() });
    },
  });
}

export function useNacaMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => nacaApi.markAllNotificationsAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: nacaKeys.notifications() });
    },
  });
}

// ==================== Changelog Hooks ====================

export function useNacaChangelog(options?: { enabled?: boolean; sinceVersion?: string }) {
  return useQuery({
    queryKey: nacaKeys.changelog(options?.sinceVersion),
    queryFn: () => nacaApi.getChangelog(options?.sinceVersion),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: nacaApi.isConfigured() && (options?.enabled ?? true),
    retry: false,
    throwOnError: false,
  });
}
