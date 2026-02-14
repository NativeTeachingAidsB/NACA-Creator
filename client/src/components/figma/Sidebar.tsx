import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FigmaNode, getNodeIcon } from "@/lib/mockData";
import { 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Link, 
  Plus, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  Globe,
  Gamepad2,
  FileText,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarThrobber } from "@/components/ui/avatar-throbber";
import { useNacaCommunities, useNacaActivities } from "@/hooks/use-naca";
import type { NACACommunity, NACAActivity } from "@/lib/naca-api";

const LAYER_COLOR_PALETTE = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#a855f7", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#10b981", // emerald
  "#6366f1", // indigo
  "#84cc16", // lime
  "#0ea5e9", // sky
  "#d946ef", // fuchsia
];

function hashToColorIndex(str: string, total: number): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % total);
}

function getNodeColor(nodeId: string, nodeName: string, globalIndex: number): string {
  const combinedKey = `${nodeId}-${nodeName}-${globalIndex}`;
  const colorIndex = hashToColorIndex(combinedKey, LAYER_COLOR_PALETTE.length);
  return LAYER_COLOR_PALETTE[colorIndex];
}

interface SidebarProps {
  data: FigmaNode[];
  selectedId?: string;
  isLoading?: boolean;
  onSelect: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
  onToggleLock?: (id: string, locked: boolean) => void;
}

interface TreeNodeProps {
  node: FigmaNode;
  depth?: number;
  nodeIndex: number;
  selectedId?: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
  onToggleVisibility?: (id: string, visible: boolean) => void;
  onToggleLock?: (id: string, locked: boolean) => void;
}

function TreeNode({ 
  node, 
  depth = 0, 
  nodeIndex,
  selectedId, 
  expandedIds,
  onToggle,
  onSelect,
  onToggleVisibility,
  onToggleLock
}: TreeNodeProps) {
  const Icon = getNodeIcon(node.type);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);
  const isVisible = node.visible !== false;
  const isLocked = node.locked === true;
  const isScreen = node.type === "PAGE" || node.type === "FRAME";
  const nodeColor = getNodeColor(node.id, node.name, nodeIndex);

  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center py-1 px-2 text-sm cursor-pointer transition-colors group border-l-2",
          isSelected 
            ? "bg-accent text-accent-foreground border-primary" 
            : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
          !isVisible && "opacity-50",
          isLocked && "cursor-not-allowed"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          if (isLocked) return;
          onSelect(node.id);
          if (hasChildren && !isExpanded) onToggle(node.id);
        }}
      >
        <span 
          className={cn(
            "mr-1 w-4 h-4 flex items-center justify-center transition-transform hover:text-foreground",
            hasChildren ? "opacity-100" : "opacity-0"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        
        <div 
          className="w-2 h-2 rounded-full mr-1.5 shrink-0"
          style={{ backgroundColor: nodeColor }}
          data-testid={`layer-color-${node.id}`}
        />
        <Icon className={cn("w-4 h-4 mr-2 shrink-0", isSelected ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground")} />
        <span className={cn("truncate font-medium text-[13px] flex-1", !isVisible && "line-through")}>{node.name}</span>
        
        {!isScreen && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className={cn(
                "w-5 h-5 flex items-center justify-center rounded hover:bg-accent/50 transition-colors",
                !isVisible && "opacity-100 text-muted-foreground"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleVisibility?.(node.id, !isVisible);
              }}
              title={isVisible ? "Hide layer" : "Show layer"}
              data-testid={`visibility-toggle-${node.id}`}
            >
              {isVisible ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
            </button>
            <button
              className={cn(
                "w-5 h-5 flex items-center justify-center rounded hover:bg-accent/50 transition-colors",
                isLocked && "opacity-100 text-amber-500"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleLock?.(node.id, !isLocked);
              }}
              title={isLocked ? "Unlock layer" : "Lock layer"}
              data-testid={`lock-toggle-${node.id}`}
            >
              {isLocked ? (
                <Lock className="w-3 h-3" />
              ) : (
                <Unlock className="w-3 h-3" />
              )}
            </button>
          </div>
        )}
      </div>
      
      {isExpanded && hasChildren && (
        <div>
          {node.children!.map((child, idx) => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1}
              nodeIndex={nodeIndex * 100 + idx + 1}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={onToggle}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getInitialExpandedIds(data: FigmaNode[]): Set<string> {
  const initial = new Set<string>();
  const collectExpanded = (nodes: FigmaNode[]) => {
    nodes.forEach(node => {
      if (node.expanded) initial.add(node.id);
      if (node.children) collectExpanded(node.children);
    });
  };
  collectExpanded(data);
  return initial;
}

function LayersSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-2">
      <AvatarThrobber 
        fallback="Layers" 
        size="lg"
        isLoading={true}
      />
      <span className="text-xs text-muted-foreground mt-3">Loading layers...</span>
    </div>
  );
}

export function Sidebar({ data, selectedId, isLoading, onSelect, onToggleVisibility, onToggleLock }: SidebarProps) {
  const dataKey = useMemo(() => {
    const collectIds = (nodes: FigmaNode[]): string[] => {
      const ids: string[] = [];
      nodes.forEach(node => {
        ids.push(node.id);
        if (node.children) ids.push(...collectIds(node.children));
      });
      return ids;
    };
    return collectIds(data).join(',');
  }, [data]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => getInitialExpandedIds(data));

  useEffect(() => {
    setExpandedIds(getInitialExpandedIds(data));
  }, [dataKey]);

  const handleToggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-3 border-b border-sidebar-border bg-sidebar shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm">
              F
            </div>
            <span className="font-semibold text-sm truncate max-w-[120px]">Mobile App V1</span>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search layers" 
            className="h-8 pl-8 bg-sidebar-accent/50 border-transparent focus-visible:ring-1 focus-visible:ring-sidebar-ring text-xs" 
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 py-1 mb-1 flex items-center justify-between group">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Layers
          </span>
          <Plus className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-pointer hover:text-foreground" />
        </div>
        {isLoading ? (
          <LayersSkeleton />
        ) : (
          data.map((node, index) => (
            <TreeNode 
              key={node.id} 
              node={node}
              nodeIndex={index}
              selectedId={selectedId}
              expandedIds={expandedIds}
              onToggle={handleToggle}
              onSelect={onSelect}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
            />
          ))
        )}
      </div>

      <div className="p-2 border-t border-sidebar-border bg-sidebar-accent/10 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-2 py-1 rounded hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>Connected to Figma</span>
          </div>
          <Link className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
}

interface CommunitySidebarProps {
  selectedCommunityId?: string;
  selectedActivityId?: string;
  onSelectCommunity?: (communityId: string) => void;
  onSelectActivity?: (activityId: string, communityId: string) => void;
}

interface CommunityNodeProps {
  community: NACACommunity;
  isSelected: boolean;
  isExpanded: boolean;
  selectedActivityId?: string;
  searchTerm?: string;
  onToggle: () => void;
  onSelect: () => void;
  onSelectActivity: (activityId: string) => void;
  onMatchingActivitiesFound?: (communityId: string, count: number) => void;
}

interface ActivityNodeProps {
  activity: NACAActivity;
  isSelected: boolean;
  onSelect: () => void;
}

function getActivityIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'game':
    case 'interactive':
      return Gamepad2;
    default:
      return FileText;
  }
}

function ActivityNode({ activity, isSelected, onSelect }: ActivityNodeProps) {
  const Icon = getActivityIcon(activity.type);
  
  return (
    <div
      className={cn(
        "flex items-center py-1.5 px-2 text-sm cursor-pointer transition-colors group border-l-2 ml-6",
        isSelected 
          ? "bg-accent text-accent-foreground border-primary" 
          : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      data-testid={`activity-node-${activity.id}`}
    >
      <Icon className={cn(
        "w-4 h-4 mr-2 shrink-0",
        isSelected ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground"
      )} />
      <span className="truncate font-medium text-[13px] flex-1">{activity.name}</span>
      {activity.isPublished && (
        <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4 bg-green-500/10 text-green-600 border-green-500/20">
          Published
        </Badge>
      )}
    </div>
  );
}

function ActivitiesList({ 
  communityId, 
  selectedActivityId, 
  searchTerm,
  onSelectActivity,
  onMatchingCount
}: { 
  communityId: string;
  selectedActivityId?: string;
  searchTerm?: string;
  onSelectActivity: (activityId: string) => void;
  onMatchingCount?: (count: number) => void;
}) {
  const { data, isLoading, error, refetch } = useNacaActivities(communityId, {
    search: searchTerm || undefined
  });
  
  const activities = data?.activities || [];
  
  const filteredActivities = useMemo(() => {
    if (!searchTerm?.trim()) return activities;
    const term = searchTerm.toLowerCase();
    return activities.filter(a => 
      a.name.toLowerCase().includes(term) ||
      a.type?.toLowerCase().includes(term) ||
      a.description?.toLowerCase().includes(term)
    );
  }, [activities, searchTerm]);
  
  useEffect(() => {
    if (onMatchingCount && !isLoading) {
      onMatchingCount(filteredActivities.length);
    }
  }, [filteredActivities.length, isLoading, onMatchingCount]);
  
  if (isLoading) {
    return (
      <div className="ml-6 flex items-center gap-2 py-2 px-2">
        <AvatarThrobber 
          fallback="A" 
          size="sm"
          isLoading={true}
        />
        <span className="text-xs text-muted-foreground">Loading activities...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="ml-6 py-2 px-2">
        <div className="flex items-center gap-2 text-xs text-destructive">
          <AlertCircle className="w-3 h-3" />
          <span>Failed to load activities</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-5 px-1"
            onClick={() => refetch()}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    );
  }
  
  if (filteredActivities.length === 0) {
    return (
      <div className="ml-6 py-2 px-4">
        <span className="text-xs text-muted-foreground italic">
          {searchTerm ? 'No matching activities' : 'No activities'}
        </span>
      </div>
    );
  }
  
  return (
    <div className="space-y-0.5 py-1">
      {filteredActivities.map((activity) => (
        <ActivityNode
          key={activity.id}
          activity={activity}
          isSelected={selectedActivityId === activity.id}
          onSelect={() => onSelectActivity(activity.id)}
        />
      ))}
    </div>
  );
}

function CommunityNode({ 
  community, 
  isSelected, 
  isExpanded,
  selectedActivityId,
  searchTerm,
  onToggle, 
  onSelect,
  onSelectActivity,
  onMatchingActivitiesFound
}: CommunityNodeProps) {
  return (
    <div className="select-none">
      <div 
        className={cn(
          "flex items-center py-1.5 px-2 text-sm cursor-pointer transition-colors group border-l-2",
          isSelected && !selectedActivityId
            ? "bg-accent text-accent-foreground border-primary" 
            : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
          if (!isExpanded) onToggle();
        }}
        data-testid={`community-node-${community.id}`}
      >
        <span 
          className="mr-1 w-4 h-4 flex items-center justify-center transition-transform hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </span>
        
        {community.logoUrl ? (
          <img 
            src={community.logoUrl} 
            alt="" 
            className="w-4 h-4 mr-2 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <Globe className={cn(
            "w-4 h-4 mr-2 shrink-0",
            isSelected && !selectedActivityId ? "text-accent-foreground" : "text-muted-foreground group-hover:text-foreground"
          )} />
        )}
        
        <span className="truncate font-medium text-[13px] flex-1">{community.name}</span>
        
        {community.subdomain && (
          <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 opacity-60">
            {community.subdomain}
          </Badge>
        )}
      </div>
      
      {isExpanded && (
        <ActivitiesList
          communityId={community.id}
          selectedActivityId={selectedActivityId}
          searchTerm={searchTerm}
          onSelectActivity={onSelectActivity}
          onMatchingCount={(count) => onMatchingActivitiesFound?.(community.id, count)}
        />
      )}
    </div>
  );
}

function CommunitiesSkeleton() {
  return (
    <div className="space-y-1 px-2">
      <div className="flex items-center justify-center py-4">
        <AvatarThrobber 
          fallback="NACA" 
          size="lg"
          isLoading={true}
        />
      </div>
      <div className="text-center">
        <span className="text-xs text-muted-foreground">Loading communities...</span>
      </div>
    </div>
  );
}

export function CommunitySidebar({ 
  selectedCommunityId, 
  selectedActivityId, 
  onSelectCommunity, 
  onSelectActivity 
}: CommunitySidebarProps) {
  const { data: communities, isLoading, error, refetch } = useNacaCommunities();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [matchingActivityCounts, setMatchingActivityCounts] = useState<Record<string, number>>({});
  const [previousExpandedIds, setPreviousExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (selectedCommunityId && !expandedIds.has(selectedCommunityId)) {
      setExpandedIds(prev => new Set(prev).add(selectedCommunityId));
    }
  }, [selectedCommunityId]);

  useEffect(() => {
    if (searchTerm.trim() && communities) {
      setPreviousExpandedIds(expandedIds);
      setExpandedIds(new Set(communities.map(c => c.id)));
    } else if (!searchTerm.trim() && previousExpandedIds.size > 0) {
      setExpandedIds(previousExpandedIds);
      setPreviousExpandedIds(new Set());
      setMatchingActivityCounts({});
    }
  }, [searchTerm, communities]);

  const handleToggle = (id: string) => {
    if (searchTerm.trim()) return;
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleMatchingActivitiesFound = (communityId: string, count: number) => {
    setMatchingActivityCounts(prev => {
      if (prev[communityId] === count) return prev;
      return { ...prev, [communityId]: count };
    });
  };

  const filteredCommunities = useMemo(() => {
    if (!communities) return [];
    if (!searchTerm.trim()) return communities;
    
    const term = searchTerm.toLowerCase();
    return communities.filter(c => {
      const communityMatches = 
        c.name.toLowerCase().includes(term) ||
        c.slug?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term);
      
      const hasMatchingActivities = (matchingActivityCounts[c.id] ?? 0) > 0;
      
      return communityMatches || hasMatchingActivities;
    });
  }, [communities, searchTerm, matchingActivityCounts]);

  return (
    <div className="h-full flex flex-col bg-sidebar border-r border-sidebar-border">
      <div className="p-3 border-b border-sidebar-border bg-sidebar shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sidebar-foreground">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm">
              N
            </div>
            <span className="font-semibold text-sm truncate max-w-[120px]">Communities</span>
          </div>
          {!isLoading && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => refetch()}
              title="Refresh communities"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
          )}
        </div>
        
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input 
            placeholder="Search communities & activities..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-8 pl-8 bg-sidebar-accent/50 border-transparent focus-visible:ring-1 focus-visible:ring-sidebar-ring text-xs" 
            data-testid="community-search-input"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <div className="px-4 py-1 mb-1 flex items-center justify-between group">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Communities
          </span>
          <span className="text-[10px] text-muted-foreground">
            {filteredCommunities.length}
          </span>
        </div>
        
        {isLoading ? (
          <CommunitiesSkeleton />
        ) : error ? (
          <div className="px-4 py-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">Failed to load communities</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetch()}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Globe className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? "No communities or activities match your search" : "No communities available"}
            </p>
          </div>
        ) : (
          filteredCommunities.map(community => (
            <CommunityNode
              key={community.id}
              community={community}
              isSelected={selectedCommunityId === community.id}
              isExpanded={expandedIds.has(community.id)}
              selectedActivityId={selectedCommunityId === community.id ? selectedActivityId : undefined}
              searchTerm={searchTerm.trim() || undefined}
              onToggle={() => handleToggle(community.id)}
              onSelect={() => onSelectCommunity?.(community.id)}
              onSelectActivity={(activityId) => onSelectActivity?.(activityId, community.id)}
              onMatchingActivitiesFound={handleMatchingActivitiesFound}
            />
          ))
        )}
      </div>

      <div className="p-2 border-t border-sidebar-border bg-sidebar-accent/10 shrink-0">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground px-2 py-1">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              communities && communities.length > 0 ? "bg-green-500" : "bg-amber-500"
            )} />
            <span>
              {communities && communities.length > 0 
                ? `${communities.length} communities` 
                : "Connecting..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { SidebarProps, CommunitySidebarProps };
