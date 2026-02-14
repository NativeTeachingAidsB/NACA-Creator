import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { FigmaNode, getNodeIcon } from "@/lib/mockData";
import { ChevronRight, ChevronDown, Search, Link, Plus, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

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
          {node.children!.map(child => (
            <TreeNode 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
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
    <div className="space-y-1 px-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2 py-1.5 px-2">
          <Skeleton className="w-3 h-3 shrink-0" />
          <Skeleton className="w-4 h-4 shrink-0" />
          <Skeleton className="h-3 flex-1" style={{ width: `${60 + Math.random() * 30}%` }} />
        </div>
      ))}
      <div className="pl-4 space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={`nested-${i}`} className="flex items-center gap-2 py-1.5 px-2">
            <Skeleton className="w-3 h-3 shrink-0" />
            <Skeleton className="w-4 h-4 shrink-0" />
            <Skeleton className="h-3" style={{ width: `${50 + Math.random() * 35}%` }} />
          </div>
        ))}
      </div>
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
          data.map(node => (
            <TreeNode 
              key={node.id} 
              node={node} 
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
