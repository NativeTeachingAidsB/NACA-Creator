import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Trash2, 
  Zap,
  MousePointer,
  Clock,
  CheckCircle,
  XCircle,
  Play,
  ArrowRight,
  X,
  Check,
  Eye,
  EyeOff,
  Palette,
  Volume2,
  Hash,
  Target
} from "lucide-react";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import type { Trigger, Scene, GameObject } from "@shared/schema";

interface TriggerEditorProps {
  triggers: Trigger[];
  currentScene: Scene | null;
  scenes: Scene[];
  objects: GameObject[];
  onCreateTrigger: (trigger: Partial<Trigger>) => void;
  onUpdateTrigger: (id: string, updates: Partial<Trigger>) => void;
  onDeleteTrigger: (id: string) => void;
}

const TRIGGER_TYPES = [
  { value: "click", label: "On Click", icon: MousePointer },
  { value: "start", label: "On Scene Start", icon: Play },
  { value: "timer", label: "After Delay", icon: Clock },
  { value: "correct", label: "On Correct Answer", icon: CheckCircle },
  { value: "incorrect", label: "On Incorrect Answer", icon: XCircle },
];

const ACTION_TYPES = [
  { value: "goToScene", label: "Go to Scene", icon: ArrowRight },
  { value: "setVisible", label: "Set Visibility", icon: Eye },
  { value: "setOpacity", label: "Set Opacity", icon: Palette },
  { value: "addClass", label: "Add Class", icon: Plus },
  { value: "removeClass", label: "Remove Class", icon: X },
  { value: "playAudio", label: "Play Audio", icon: Volume2 },
];

export function TriggerEditor({
  triggers,
  currentScene,
  scenes,
  objects,
  onCreateTrigger,
  onUpdateTrigger,
  onDeleteTrigger,
}: TriggerEditorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTriggerType, setNewTriggerType] = useState("click");

  if (!currentScene) {
    return (
      <div className="h-full flex flex-col border-t border-border">
        <div className="p-3 border-b border-border flex items-center gap-2 bg-card">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase text-muted-foreground">Triggers</span>
          <HelpTooltip featureKey="triggers-basics" side="right" iconSize={12} />
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center">
          Select a scene to manage triggers
        </div>
      </div>
    );
  }

  const handleCreate = () => {
    onCreateTrigger({
      sceneId: currentScene.id,
      type: newTriggerType,
      action: "goToScene",
    });
    setNewTriggerType("click");
    setIsCreating(false);
  };

  const getTriggerIcon = (type: string) => {
    const found = TRIGGER_TYPES.find(t => t.value === type);
    return found?.icon || Zap;
  };

  const getTriggerLabel = (type: string) => {
    return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
  };

  const getActionIcon = (action: string) => {
    const found = ACTION_TYPES.find(a => a.value === action);
    return found?.icon || ArrowRight;
  };

  const getActionLabel = (action: string) => {
    return ACTION_TYPES.find(a => a.value === action)?.label || action;
  };

  const getUniqueClasses = (): string[] => {
    const classSet = new Set<string>();
    objects.forEach(obj => {
      obj.classes?.forEach(c => classSet.add(c));
    });
    return Array.from(classSet);
  };

  const getUniqueCustomIds = (): string[] => {
    return objects.filter(obj => obj.customId).map(obj => obj.customId as string);
  };

  const renderActionPayload = (trigger: Trigger) => {
    const action = trigger.action || "goToScene";
    const payload = (trigger.actionPayload as Record<string, unknown>) || {};

    switch (action) {
      case "goToScene":
        return (
          <Select
            value={trigger.targetSceneId || "none"}
            onValueChange={(v) => onUpdateTrigger(trigger.id, { 
              targetSceneId: v === "none" ? null : v 
            })}
          >
            <SelectTrigger className="h-7 text-xs">
              <SelectValue placeholder="Select scene" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Scene</SelectItem>
              {scenes.filter(s => s.id !== currentScene.id).map(scene => (
                <SelectItem key={scene.id} value={scene.id}>
                  {scene.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "setVisible":
        return (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Visible</Label>
            <Switch
              checked={payload.visible !== false}
              onCheckedChange={(checked) => onUpdateTrigger(trigger.id, {
                actionPayload: { ...payload, visible: checked }
              })}
            />
          </div>
        );

      case "setOpacity":
        return (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Opacity</Label>
            <Input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={(payload.opacity as number) ?? 1}
              onChange={(e) => onUpdateTrigger(trigger.id, {
                actionPayload: { ...payload, opacity: parseFloat(e.target.value) }
              })}
              className="h-7 text-xs w-20"
            />
          </div>
        );

      case "addClass":
      case "removeClass":
        const existingClasses = getUniqueClasses();
        return (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Class</Label>
            <Input
              type="text"
              placeholder="class-name"
              value={(payload.className as string) || ""}
              onChange={(e) => onUpdateTrigger(trigger.id, {
                actionPayload: { ...payload, className: e.target.value }
              })}
              className="h-7 text-xs flex-1"
              list={`classes-${trigger.id}`}
            />
            {existingClasses.length > 0 && (
              <datalist id={`classes-${trigger.id}`}>
                {existingClasses.map(c => <option key={c} value={c} />)}
              </datalist>
            )}
          </div>
        );

      case "playAudio":
        return (
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Audio URL</Label>
            <Input
              type="text"
              placeholder="/audio/sound.mp3"
              value={(payload.audioUrl as string) || ""}
              onChange={(e) => onUpdateTrigger(trigger.id, {
                actionPayload: { ...payload, audioUrl: e.target.value }
              })}
              className="h-7 text-xs flex-1"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col border-t border-border">
      <div className="p-3 border-b border-border flex items-center justify-between bg-card shrink-0">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-bold uppercase text-muted-foreground">Triggers</span>
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
            {currentScene.name}
          </span>
          <HelpTooltip featureKey="triggers-basics" side="right" iconSize={12} />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setIsCreating(!isCreating)}
          data-testid="button-add-trigger"
        >
          {isCreating ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
        </Button>
      </div>

      {isCreating && (
        <div className="p-2 border-b border-border bg-muted/30 shrink-0">
          <div className="flex items-center gap-2">
            <Select value={newTriggerType} onValueChange={setNewTriggerType}>
              <SelectTrigger className="h-7 text-xs flex-1" data-testid="select-trigger-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRIGGER_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleCreate}
              data-testid="button-create-trigger"
            >
              <Check className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {triggers.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-4">
              No triggers defined
            </div>
          ) : (
            triggers.map((trigger) => {
              const Icon = getTriggerIcon(trigger.type);
              const ActionIcon = getActionIcon(trigger.action || "goToScene");
              const targetScene = scenes.find(s => s.id === trigger.targetSceneId);
              const targetObject = objects.find(o => o.id === trigger.objectId);
              const hasSelector = !!trigger.targetSelector;
              const customIds = getUniqueCustomIds();
              const classes = getUniqueClasses();
              
              return (
                <div
                  key={trigger.id}
                  className="p-3 rounded border border-border bg-muted/30 space-y-3"
                  data-testid={`trigger-${trigger.id}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{getTriggerLabel(trigger.type)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => onDeleteTrigger(trigger.id)}
                      data-testid={`button-delete-trigger-${trigger.id}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      <MousePointer className="w-3 h-3" />
                      Event Source
                    </Label>
                    <Select
                      value={trigger.objectId || "scene"}
                      onValueChange={(v) => onUpdateTrigger(trigger.id, { 
                        objectId: v === "scene" ? null : v 
                      })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scene">Scene Level</SelectItem>
                        {objects.map(obj => (
                          <SelectItem key={obj.id} value={obj.id}>
                            {obj.customId ? `#${obj.customId} - ` : ""}{obj.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {trigger.type === "timer" && (
                    <div className="flex items-center gap-2">
                      <Label className="text-xs text-muted-foreground">Delay (s)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        value={trigger.delay ?? 0}
                        onChange={(e) => onUpdateTrigger(trigger.id, { 
                          delay: parseFloat(e.target.value) 
                        })}
                        className="h-7 text-xs w-20"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Target (Selector)
                    </Label>
                    <Input
                      type="text"
                      placeholder="#customId or .className"
                      value={trigger.targetSelector || ""}
                      onChange={(e) => onUpdateTrigger(trigger.id, { 
                        targetSelector: e.target.value || null 
                      })}
                      className="h-7 text-xs"
                      list={`selectors-${trigger.id}`}
                    />
                    <datalist id={`selectors-${trigger.id}`}>
                      {customIds.map(id => <option key={id} value={`#${id}`} />)}
                      {classes.map(c => <option key={c} value={`.${c}`} />)}
                    </datalist>
                    <p className="text-[10px] text-muted-foreground">
                      Use # for ID (e.g., #myButton) or . for class (e.g., .highlighted)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground flex items-center gap-1">
                      <ActionIcon className="w-3 h-3" />
                      Action
                    </Label>
                    <Select
                      value={trigger.action || "goToScene"}
                      onValueChange={(v) => onUpdateTrigger(trigger.id, { 
                        action: v,
                        actionPayload: null
                      })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ACTION_TYPES.map(action => (
                          <SelectItem key={action.value} value={action.value}>
                            {action.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase text-muted-foreground">
                      Action Settings
                    </Label>
                    {renderActionPayload(trigger)}
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1 border-t border-border/50">
                    {targetObject && (
                      <span className="bg-muted px-1.5 py-0.5 rounded">{targetObject.name}</span>
                    )}
                    {hasSelector && (
                      <span className="bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded font-mono">
                        {trigger.targetSelector}
                      </span>
                    )}
                    <ArrowRight className="w-3 h-3" />
                    <span className={cn(
                      "px-1.5 py-0.5 rounded",
                      trigger.action === "goToScene" ? "bg-primary/20 text-primary" : "bg-orange-500/20 text-orange-500"
                    )}>
                      {getActionLabel(trigger.action || "goToScene")}
                      {trigger.action === "goToScene" && targetScene && `: ${targetScene.name}`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
