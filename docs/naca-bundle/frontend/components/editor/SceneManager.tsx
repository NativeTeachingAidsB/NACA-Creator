import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Plus, 
  MoreHorizontal, 
  Layers, 
  Star, 
  Trash2, 
  Edit2,
  ChevronRight,
  Play,
  X,
  Check
} from "lucide-react";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { Scene } from "@shared/schema";

interface SceneManagerProps {
  scenes: Scene[];
  currentSceneId: string | null;
  isLoading?: boolean;
  onSelectScene: (id: string | null) => void;
  onCreateScene: (name: string) => void;
  onUpdateScene: (id: string, updates: Partial<Scene>) => void;
  onDeleteScene: (id: string) => void;
  onSetDefault: (id: string) => void;
}

function ScenesSkeleton() {
  return (
    <div className="p-2 space-y-1">
      <div className="flex items-center gap-2 px-3 py-2">
        <Skeleton className="w-3 h-3 shrink-0" />
        <Skeleton className="h-3 w-20" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-2">
          <Skeleton className="w-3 h-3 shrink-0" />
          <Skeleton className="h-3 flex-1" style={{ width: `${50 + Math.random() * 30}%` }} />
        </div>
      ))}
    </div>
  );
}

export function SceneManager({
  scenes,
  currentSceneId,
  isLoading,
  onSelectScene,
  onCreateScene,
  onUpdateScene,
  onDeleteScene,
  onSetDefault,
}: SceneManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSceneName, setNewSceneName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleCreate = () => {
    if (newSceneName.trim()) {
      onCreateScene(newSceneName.trim());
      setNewSceneName("");
      setIsCreating(false);
    }
  };

  const handleStartEdit = (scene: Scene) => {
    setEditingId(scene.id);
    setEditingName(scene.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editingName.trim()) {
      onUpdateScene(editingId, { name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
    }
  };

  const sortedScenes = [...scenes].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <div className="h-[240px] flex flex-col border-t border-border">
      <div className="p-3 border-b border-border flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase text-muted-foreground">Scenes</span>
          <HelpTooltip featureKey="scenes-basics" side="right" iconSize={12} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCreating(!isCreating)}
          data-testid="button-add-scene"
        >
          {isCreating ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </Button>
      </div>

      {isCreating && (
        <div className="p-2 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <Input
              value={newSceneName}
              onChange={(e) => setNewSceneName(e.target.value)}
              placeholder="Scene name..."
              className="h-7 text-xs flex-1"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreate();
                if (e.key === "Escape") setIsCreating(false);
              }}
              data-testid="input-scene-name"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCreate}
              disabled={!newSceneName.trim()}
              data-testid="button-create-scene"
            >
              <Check className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        {isLoading ? (
          <ScenesSkeleton />
        ) : (
        <div className="p-2 space-y-1">
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-colors",
              currentSceneId === null
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50"
            )}
            onClick={() => onSelectScene(null)}
            data-testid="scene-base"
          >
            <Play className="w-3 h-3" />
            <span className="font-medium">Base State</span>
          </div>

          {sortedScenes.map((scene) => (
            <div
              key={scene.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded text-sm cursor-pointer transition-colors",
                currentSceneId === scene.id
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              )}
              onClick={() => onSelectScene(scene.id)}
              data-testid={`scene-${scene.id}`}
            >
              <ChevronRight className="w-3 h-3" />
              
              {editingId === scene.id ? (
                <Input
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={handleSaveEdit}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveEdit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-6 text-xs flex-1"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="font-medium flex-1 truncate">{scene.name}</span>
              )}
              
              {scene.isDefault && (
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 shrink-0" />
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleStartEdit(scene)}>
                    <Edit2 className="w-3 h-3 mr-2" />
                    Rename
                  </DropdownMenuItem>
                  {!scene.isDefault && (
                    <DropdownMenuItem onClick={() => onSetDefault(scene.id)}>
                      <Star className="w-3 h-3 mr-2" />
                      Set as Default
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={() => onDeleteScene(scene.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
        )}
      </ScrollArea>
    </div>
  );
}
