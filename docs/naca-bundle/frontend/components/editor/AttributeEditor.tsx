import React, { useMemo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, Move, RotateCcw, Scale, Palette, Database, Zap, Book, Image as ImageIcon, Volume2, Link, ExternalLink, Lock, Unlock, FlipHorizontal, FlipVertical, RotateCw, RefreshCcw, AlignStartHorizontal, AlignCenterHorizontal, AlignEndHorizontal, AlignStartVertical, AlignCenterVertical, AlignEndVertical, ArrowLeftRight, ArrowUpDown, Paintbrush, Anchor, MousePointer, Plus, Trash2, ArrowRight } from "lucide-react";
import { HelpTooltip } from "@/components/ui/help-tooltip";
import { StylesPanel } from "./StylesPanel";
import { useDesignTokens, type DesignToken } from "@/hooks/use-design-tokens";
import type { GameObject, Scene, ObjectState, Vocabulary } from "@shared/schema";

export interface ObjectInteraction {
  id: string;
  trigger: "click" | "hover" | "mouseEnter" | "mouseLeave";
  action: "goToScene" | "setVisible" | "playAudio";
  sceneId?: string;
  targetObjectId?: string;
  visible?: boolean;
  audioUrl?: string;
}

interface AttributeEditorProps {
  selectedObject: GameObject | null;
  selectedObjects?: GameObject[];
  currentScene: Scene | null;
  scenes?: Scene[];
  objectState: ObjectState | null;
  vocabulary?: Vocabulary[];
  onUpdateObject: (updates: Partial<GameObject>) => void;
  onUpdateObjectById?: (id: string, updates: Partial<GameObject>) => void;
  onUpdateState: (updates: Partial<ObjectState>) => void;
  onCreateState: () => void;
  onEditingInteraction?: (interaction: ObjectInteraction | null) => void;
}

function alignLeft(objects: GameObject[]): Map<string, { x: number }> {
  const updates = new Map<string, { x: number }>();
  const leftEdges = objects.map(obj => obj.x);
  const minX = Math.min(...leftEdges);
  
  for (const obj of objects) {
    updates.set(obj.id, { x: minX });
  }
  return updates;
}

function alignRight(objects: GameObject[]): Map<string, { x: number }> {
  const updates = new Map<string, { x: number }>();
  const rightEdges = objects.map(obj => obj.x + obj.width);
  const maxRight = Math.max(...rightEdges);
  
  for (const obj of objects) {
    updates.set(obj.id, { x: maxRight - obj.width });
  }
  return updates;
}

function alignCenterHorizontal(objects: GameObject[]): Map<string, { x: number }> {
  const updates = new Map<string, { x: number }>();
  const centers = objects.map(obj => obj.x + obj.width / 2);
  const avgCenter = centers.reduce((sum, c) => sum + c, 0) / centers.length;
  
  for (const obj of objects) {
    updates.set(obj.id, { x: avgCenter - obj.width / 2 });
  }
  return updates;
}

function alignTop(objects: GameObject[]): Map<string, { y: number }> {
  const updates = new Map<string, { y: number }>();
  const topEdges = objects.map(obj => obj.y);
  const minY = Math.min(...topEdges);
  
  for (const obj of objects) {
    updates.set(obj.id, { y: minY });
  }
  return updates;
}

function alignBottom(objects: GameObject[]): Map<string, { y: number }> {
  const updates = new Map<string, { y: number }>();
  const bottomEdges = objects.map(obj => obj.y + obj.height);
  const maxBottom = Math.max(...bottomEdges);
  
  for (const obj of objects) {
    updates.set(obj.id, { y: maxBottom - obj.height });
  }
  return updates;
}

function alignCenterVertical(objects: GameObject[]): Map<string, { y: number }> {
  const updates = new Map<string, { y: number }>();
  const centers = objects.map(obj => obj.y + obj.height / 2);
  const avgCenter = centers.reduce((sum, c) => sum + c, 0) / centers.length;
  
  for (const obj of objects) {
    updates.set(obj.id, { y: avgCenter - obj.height / 2 });
  }
  return updates;
}

function distributeHorizontally(objects: GameObject[]): Map<string, { x: number }> {
  const updates = new Map<string, { x: number }>();
  if (objects.length < 3) return updates;
  
  const sorted = [...objects].sort((a, b) => a.x - b.x);
  const leftmost = sorted[0];
  const rightmost = sorted[sorted.length - 1];
  
  const totalWidth = objects.reduce((sum, obj) => sum + obj.width, 0);
  const availableSpace = (rightmost.x + rightmost.width) - leftmost.x - totalWidth;
  const gap = availableSpace / (objects.length - 1);
  
  let currentX = leftmost.x;
  for (const obj of sorted) {
    updates.set(obj.id, { x: currentX });
    currentX += obj.width + gap;
  }
  return updates;
}

function distributeVertically(objects: GameObject[]): Map<string, { y: number }> {
  const updates = new Map<string, { y: number }>();
  if (objects.length < 3) return updates;
  
  const sorted = [...objects].sort((a, b) => a.y - b.y);
  const topmost = sorted[0];
  const bottommost = sorted[sorted.length - 1];
  
  const totalHeight = objects.reduce((sum, obj) => sum + obj.height, 0);
  const availableSpace = (bottommost.y + bottommost.height) - topmost.y - totalHeight;
  const gap = availableSpace / (objects.length - 1);
  
  let currentY = topmost.y;
  for (const obj of sorted) {
    updates.set(obj.id, { y: currentY });
    currentY += obj.height + gap;
  }
  return updates;
}

export function AttributeEditor({
  selectedObject,
  selectedObjects = [],
  currentScene,
  scenes = [],
  objectState,
  vocabulary = [],
  onUpdateObject,
  onUpdateObjectById,
  onUpdateState,
  onCreateState,
  onEditingInteraction,
}: AttributeEditorProps) {
  const [lockProportions, setLockProportions] = useState(true);
  const [activeTab, setActiveTab] = useState<"properties" | "styles">("properties");
  const [editingInteractionId, setEditingInteractionId] = useState<string | null>(null);
  
  const { tokens, colorTokens, addToken, updateToken, deleteToken, getToken } = useDesignTokens();
  
  const selectionCount = selectedObjects.length;
  const canAlign = selectionCount >= 2;
  const canDistribute = selectionCount >= 3;

  const applyAlignmentUpdates = useCallback((updates: Map<string, Partial<GameObject>>) => {
    if (!onUpdateObjectById) return;
    updates.forEach((update, id) => {
      onUpdateObjectById(id, update);
    });
  }, [onUpdateObjectById]);

  const handleAlignLeft = useCallback(() => {
    if (!canAlign) return;
    applyAlignmentUpdates(alignLeft(selectedObjects));
  }, [canAlign, selectedObjects, applyAlignmentUpdates]);

  const handleAlignRight = useCallback(() => {
    if (!canAlign) return;
    applyAlignmentUpdates(alignRight(selectedObjects));
  }, [canAlign, selectedObjects, applyAlignmentUpdates]);

  const handleAlignCenterHorizontal = useCallback(() => {
    if (!canAlign) return;
    applyAlignmentUpdates(alignCenterHorizontal(selectedObjects));
  }, [canAlign, selectedObjects, applyAlignmentUpdates]);

  const handleAlignTop = useCallback(() => {
    if (!canAlign) return;
    applyAlignmentUpdates(alignTop(selectedObjects));
  }, [canAlign, selectedObjects, applyAlignmentUpdates]);

  const handleAlignBottom = useCallback(() => {
    if (!canAlign) return;
    applyAlignmentUpdates(alignBottom(selectedObjects));
  }, [canAlign, selectedObjects, applyAlignmentUpdates]);

  const handleAlignCenterVertical = useCallback(() => {
    if (!canAlign) return;
    applyAlignmentUpdates(alignCenterVertical(selectedObjects));
  }, [canAlign, selectedObjects, applyAlignmentUpdates]);

  const handleDistributeHorizontally = useCallback(() => {
    if (!canDistribute) return;
    applyAlignmentUpdates(distributeHorizontally(selectedObjects));
  }, [canDistribute, selectedObjects, applyAlignmentUpdates]);

  const handleDistributeVertically = useCallback(() => {
    if (!canDistribute) return;
    applyAlignmentUpdates(distributeVertically(selectedObjects));
  }, [canDistribute, selectedObjects, applyAlignmentUpdates]);
  
  if (!selectedObject) {
    return (
      <div className="h-full flex flex-col">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "properties" | "styles")} className="h-full flex flex-col">
          <div className="px-4 pt-4 border-b border-border">
            <TabsList className="w-full grid grid-cols-2 h-8">
              <TabsTrigger value="properties" className="text-xs" data-testid="tab-properties">
                Properties
              </TabsTrigger>
              <TabsTrigger value="styles" className="text-xs" data-testid="tab-styles">
                Styles
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="properties" className="flex-1 m-0">
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4 text-center h-full">
              Select an object to edit its attributes
            </div>
          </TabsContent>
          <TabsContent value="styles" className="flex-1 m-0">
            <StylesPanel
              tokens={tokens}
              onAddToken={addToken}
              onUpdateToken={updateToken}
              onDeleteToken={deleteToken}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const effectiveX = objectState?.x ?? selectedObject.x;
  const effectiveY = objectState?.y ?? selectedObject.y;
  const effectiveScaleX = objectState?.scaleX ?? selectedObject.scaleX ?? 1;
  const effectiveScaleY = objectState?.scaleY ?? selectedObject.scaleY ?? 1;
  const effectiveRotation = objectState?.rotation ?? selectedObject.rotation ?? 0;
  const effectiveOpacity = objectState?.opacity ?? selectedObject.opacity ?? 1;
  const effectiveVisible = objectState?.visible ?? selectedObject.visible ?? true;

  const handleBaseUpdate = (key: keyof GameObject, value: unknown) => {
    onUpdateObject({ [key]: value });
  };

  const handleStateUpdate = (key: keyof ObjectState, value: unknown) => {
    if (!currentScene) return;
    if (!objectState) {
      onCreateState();
    }
    onUpdateState({ [key]: value });
  };

  const isSceneMode = !!currentScene;

  const currentFillStyleTokenId = (selectedObject.metadata as Record<string, unknown> | null)?.fillStyleTokenId as string | undefined;
  const appliedStyleToken = currentFillStyleTokenId ? getToken(currentFillStyleTokenId) : undefined;
  const computedFillColor = appliedStyleToken?.value ?? (selectedObject.metadata as Record<string, unknown> | null)?.fill as string | undefined;

  const handleApplyStyle = (tokenId: string | null) => {
    const currentMetadata = (selectedObject.metadata as Record<string, unknown>) || {};
    if (tokenId) {
      const token = getToken(tokenId);
      onUpdateObject({
        metadata: {
          ...currentMetadata,
          fillStyleTokenId: tokenId,
          fill: token?.value,
        },
      });
    } else {
      const { fillStyleTokenId, ...rest } = currentMetadata;
      onUpdateObject({
        metadata: rest,
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "properties" | "styles")} className="h-full flex flex-col">
        <div className="px-4 pt-4 border-b border-border">
          <TabsList className="w-full grid grid-cols-2 h-8">
            <TabsTrigger value="properties" className="text-xs" data-testid="tab-properties">
              Properties
            </TabsTrigger>
            <TabsTrigger value="styles" className="text-xs" data-testid="tab-styles">
              Styles
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold uppercase text-muted-foreground">Attributes</h3>
              <HelpTooltip featureKey="objects-attributes" side="left" iconSize={12} />
            </div>
            <p className="text-sm font-medium mt-2" data-testid="text-object-name">{selectedObject.name}</p>
            <p className="text-xs text-muted-foreground">{selectedObject.type}</p>
          </div>
          
          <ScrollArea className="flex-1 h-[calc(100%-80px)]">
            <div className="p-4 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <Database className="w-3 h-3" />
                  Base Properties
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={selectedObject.name}
                    onChange={(e) => handleBaseUpdate("name", e.target.value)}
                    className="h-8 text-xs"
                    data-testid="input-object-name"
                  />
            </div>

            <div className="flex items-end gap-2">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Width</Label>
                  <Input
                    type="number"
                    value={selectedObject.width}
                    onChange={(e) => {
                      const newWidth = parseFloat(e.target.value);
                      if (isNaN(newWidth)) return;
                      const effectiveWidth = selectedObject.width || 1;
                      const effectiveHeight = selectedObject.height || 1;
                      if (lockProportions && effectiveWidth > 0) {
                        const ratio = effectiveHeight / effectiveWidth;
                        handleBaseUpdate("width", newWidth);
                        handleBaseUpdate("height", Math.round(newWidth * ratio * 100) / 100);
                      } else {
                        handleBaseUpdate("width", newWidth);
                      }
                    }}
                    className="h-8 text-xs font-mono"
                    data-testid="input-width"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Height</Label>
                  <Input
                    type="number"
                    value={selectedObject.height}
                    onChange={(e) => {
                      const newHeight = parseFloat(e.target.value);
                      if (isNaN(newHeight)) return;
                      const effectiveWidth = selectedObject.width || 1;
                      const effectiveHeight = selectedObject.height || 1;
                      if (lockProportions && effectiveHeight > 0) {
                        const ratio = effectiveWidth / effectiveHeight;
                        handleBaseUpdate("height", newHeight);
                        handleBaseUpdate("width", Math.round(newHeight * ratio * 100) / 100);
                      } else {
                        handleBaseUpdate("height", newHeight);
                      }
                    }}
                    className="h-8 text-xs font-mono"
                    data-testid="input-height"
                  />
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={lockProportions ? "secondary" : "ghost"}
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={() => setLockProportions(!lockProportions)}
                    aria-pressed={lockProportions}
                    data-testid="button-lock-proportions"
                  >
                    {lockProportions ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-xs">{lockProportions ? "Unlock proportions" : "Lock proportions"}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs">Data Binding</Label>
              <Select 
                value={selectedObject.dataKey || "none"}
                onValueChange={(v) => handleBaseUpdate("dataKey", v === "none" ? null : v)}
              >
                <SelectTrigger className="h-8 text-xs" data-testid="select-data-binding">
                  <SelectValue placeholder="Select vocabulary item" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vocabulary.length > 0 ? (
                    vocabulary.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <span className="flex items-center gap-2">
                          <Book className="w-3 h-3" />
                          {item.word}
                          <span className="text-muted-foreground">→ {item.translation}</span>
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="word" disabled>
                        <span className="text-muted-foreground italic">No vocabulary items - add some first</span>
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              
              <BoundVocabularyPreview 
                dataKey={selectedObject.dataKey} 
                vocabulary={vocabulary} 
              />
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Paintbrush className="w-3 h-3" />
                Fill Style
              </div>
              
              <div className="space-y-2">
                <Label className="text-xs">Apply Color Token</Label>
                <div className="flex gap-2">
                  {appliedStyleToken && (
                    <div 
                      className="w-8 h-8 rounded border border-border flex-shrink-0"
                      style={{ backgroundColor: appliedStyleToken.value }}
                      data-testid="applied-style-swatch"
                    />
                  )}
                  <Select 
                    value={currentFillStyleTokenId || "none"}
                    onValueChange={(v) => handleApplyStyle(v === "none" ? null : v)}
                  >
                    <SelectTrigger className="h-8 text-xs flex-1" data-testid="select-fill-style">
                      <SelectValue placeholder="Select color token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (no style)</SelectItem>
                      {colorTokens.length > 0 ? (
                        colorTokens.map((token) => (
                          <SelectItem key={token.id} value={token.id}>
                            <span className="flex items-center gap-2">
                              <span 
                                className="w-3 h-3 rounded border border-border inline-block"
                                style={{ backgroundColor: token.value }}
                              />
                              {token.name}
                              <span className="text-muted-foreground font-mono text-[10px]">{token.value}</span>
                            </span>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="empty" disabled>
                          <span className="text-muted-foreground italic">No tokens - add some in Styles tab</span>
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {appliedStyleToken && (
                  <p className="text-[10px] text-muted-foreground">
                    Using token "{appliedStyleToken.name}" ({appliedStyleToken.value})
                  </p>
                )}
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <ConstraintsSection
              selectedObject={selectedObject}
              onUpdateObject={onUpdateObject}
            />
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Link className="w-3 h-3" />
                Media Binding
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-3 h-3 text-muted-foreground" />
                  <Label className="text-xs flex-1">Image URL</Label>
                </div>
                <div className="flex gap-1">
                  <Input
                    value={selectedObject.mediaUrl || ""}
                    onChange={(e) => handleBaseUpdate("mediaUrl", e.target.value || null)}
                    placeholder="https://... or /assets/..."
                    className="h-8 text-xs font-mono flex-1"
                    data-testid="input-media-url"
                  />
                  {selectedObject.mediaUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(selectedObject.mediaUrl!, '_blank')}
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {selectedObject.mediaUrl && (
                  <div className="mt-2 rounded border border-border overflow-hidden bg-muted/30">
                    <img 
                      src={selectedObject.mediaUrl} 
                      alt="Preview" 
                      className="w-full h-24 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3 h-3 text-muted-foreground" />
                  <Label className="text-xs flex-1">Audio URL</Label>
                </div>
                <div className="flex gap-1">
                  <Input
                    value={selectedObject.audioUrl || ""}
                    onChange={(e) => handleBaseUpdate("audioUrl", e.target.value || null)}
                    placeholder="https://... or /assets/..."
                    className="h-8 text-xs font-mono flex-1"
                    data-testid="input-audio-url"
                  />
                  {selectedObject.audioUrl && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(selectedObject.audioUrl!, '_blank')}
                      title="Open in new tab"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                {selectedObject.audioUrl && (
                  <audio 
                    controls 
                    src={selectedObject.audioUrl} 
                    className="w-full h-8 mt-2"
                    data-testid="audio-preview"
                  />
                )}
              </div>
              
              <p className="text-[10px] text-muted-foreground italic">
                Media browser coming soon. For now, enter URLs manually or use vocabulary binding above.
              </p>
            </div>
          </div>

          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Zap className="w-3 h-3" />
                {isSceneMode ? "Scene Overrides" : "Transform"}
              </div>
              {isSceneMode && (
                <span className="text-[10px] px-2 py-0.5 bg-primary/20 text-primary rounded">
                  {currentScene.name}
                </span>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Move className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground w-16">Position</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">X</Label>
                  <Input
                    type="number"
                    value={effectiveX}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      isSceneMode ? handleStateUpdate("x", v) : handleBaseUpdate("x", v);
                    }}
                    className="h-8 text-xs font-mono"
                    data-testid="input-x"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Y</Label>
                  <Input
                    type="number"
                    value={effectiveY}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      isSceneMode ? handleStateUpdate("y", v) : handleBaseUpdate("y", v);
                    }}
                    className="h-8 text-xs font-mono"
                    data-testid="input-y"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Scale className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground w-16">Scale</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">X</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={effectiveScaleX}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      isSceneMode ? handleStateUpdate("scaleX", v) : handleBaseUpdate("scaleX", v);
                    }}
                    className="h-8 text-xs font-mono"
                    data-testid="input-scale-x"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">Y</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={effectiveScaleY}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      isSceneMode ? handleStateUpdate("scaleY", v) : handleBaseUpdate("scaleY", v);
                    }}
                    className="h-8 text-xs font-mono"
                    data-testid="input-scale-y"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[effectiveRotation]}
                  onValueChange={([v]) => {
                    isSceneMode ? handleStateUpdate("rotation", v) : handleBaseUpdate("rotation", v);
                  }}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={effectiveRotation}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const clamped = Math.max(-180, Math.min(180, v));
                    isSceneMode ? handleStateUpdate("rotation", clamped) : handleBaseUpdate("rotation", clamped);
                  }}
                  className="h-7 w-16 text-xs font-mono text-right"
                  data-testid="input-rotation"
                />
                <span className="text-xs text-muted-foreground">°</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Palette className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Opacity</span>
              </div>
              <div className="flex items-center gap-2">
                <Slider
                  value={[effectiveOpacity * 100]}
                  onValueChange={([v]) => {
                    const opacity = v / 100;
                    isSceneMode ? handleStateUpdate("opacity", opacity) : handleBaseUpdate("opacity", opacity);
                  }}
                  min={0}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Input
                  type="number"
                  value={Math.round(effectiveOpacity * 100)}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    const clamped = Math.max(0, Math.min(100, v)) / 100;
                    isSceneMode ? handleStateUpdate("opacity", clamped) : handleBaseUpdate("opacity", clamped);
                  }}
                  className="h-7 w-16 text-xs font-mono text-right"
                  data-testid="input-opacity"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>

            <div className="flex items-center gap-1 pt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      const newScaleX = -(effectiveScaleX);
                      isSceneMode ? handleStateUpdate("scaleX", newScaleX) : handleBaseUpdate("scaleX", newScaleX);
                    }}
                    data-testid="button-flip-horizontal"
                  >
                    <FlipHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Flip Horizontal</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      const newScaleY = -(effectiveScaleY);
                      isSceneMode ? handleStateUpdate("scaleY", newScaleY) : handleBaseUpdate("scaleY", newScaleY);
                    }}
                    data-testid="button-flip-vertical"
                  >
                    <FlipVertical className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Flip Vertical</p></TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={() => {
                      const newRotation = (effectiveRotation + 90) % 360;
                      isSceneMode ? handleStateUpdate("rotation", newRotation > 180 ? newRotation - 360 : newRotation) : handleBaseUpdate("rotation", newRotation > 180 ? newRotation - 360 : newRotation);
                    }}
                    data-testid="button-rotate-90"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Rotate 90°</p></TooltipContent>
              </Tooltip>
              <div className="flex-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      if (isSceneMode) {
                        handleStateUpdate("scaleX", 1);
                        handleStateUpdate("scaleY", 1);
                        handleStateUpdate("rotation", 0);
                        handleStateUpdate("opacity", 1);
                      } else {
                        handleBaseUpdate("scaleX", 1);
                        handleBaseUpdate("scaleY", 1);
                        handleBaseUpdate("rotation", 0);
                        handleBaseUpdate("opacity", 1);
                      }
                    }}
                    data-testid="button-reset-transform"
                  >
                    <RefreshCcw className="w-3.5 h-3.5 mr-1" />
                    <span className="text-xs">Reset</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">Reset transform to defaults</p></TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center justify-between p-2 bg-muted/30 rounded border border-border">
              <div className="flex items-center gap-2">
                {effectiveVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="text-sm">Visible</span>
              </div>
              <Switch
                checked={effectiveVisible}
                onCheckedChange={(v) => {
                  isSceneMode ? handleStateUpdate("visible", v) : handleBaseUpdate("visible", v);
                }}
                data-testid="switch-visibility"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <AlignCenterHorizontal className="w-3 h-3" />
              Alignment
              {selectionCount >= 2 && (
                <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 text-primary rounded">
                  {selectionCount} selected
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground">Align (2+ objects)</Label>
              <div className="grid grid-cols-6 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAlignLeft}
                      disabled={!canAlign}
                      data-testid="button-align-left"
                    >
                      <AlignStartHorizontal className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Align Left</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAlignCenterHorizontal}
                      disabled={!canAlign}
                      data-testid="button-align-center-horizontal"
                    >
                      <AlignCenterHorizontal className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Align Center Horizontal</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAlignRight}
                      disabled={!canAlign}
                      data-testid="button-align-right"
                    >
                      <AlignEndHorizontal className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Align Right</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAlignTop}
                      disabled={!canAlign}
                      data-testid="button-align-top"
                    >
                      <AlignStartVertical className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Align Top</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAlignCenterVertical}
                      disabled={!canAlign}
                      data-testid="button-align-center-vertical"
                    >
                      <AlignCenterVertical className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Align Center Vertical</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={handleAlignBottom}
                      disabled={!canAlign}
                      data-testid="button-align-bottom"
                    >
                      <AlignEndVertical className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Align Bottom</p></TooltipContent>
                </Tooltip>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] text-muted-foreground">Distribute (3+ objects)</Label>
              <div className="grid grid-cols-2 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 flex items-center gap-1.5"
                      onClick={handleDistributeHorizontally}
                      disabled={!canDistribute}
                      data-testid="button-distribute-horizontal"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      <span className="text-xs">Horizontal</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Distribute Horizontally</p></TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 flex items-center gap-1.5"
                      onClick={handleDistributeVertically}
                      disabled={!canDistribute}
                      data-testid="button-distribute-vertical"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                      <span className="text-xs">Vertical</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p className="text-xs">Distribute Vertically</p></TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

              <Separator />
              
              <InteractionsSection
                selectedObject={selectedObject}
                scenes={scenes}
                onUpdateObject={onUpdateObject}
                editingInteractionId={editingInteractionId}
                onEditingInteractionChange={(id) => {
                  setEditingInteractionId(id);
                  if (onEditingInteraction) {
                    const interactions = getObjectInteractions(selectedObject);
                    const interaction = interactions.find(i => i.id === id) || null;
                    onEditingInteraction(interaction);
                  }
                }}
              />

              {isSceneMode && objectState && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                      Animation
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Duration</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={objectState.animationDuration ?? 0.3}
                          onChange={(e) => handleStateUpdate("animationDuration", parseFloat(e.target.value))}
                          className="h-8 text-xs font-mono"
                          data-testid="input-animation-duration"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Ease</Label>
                        <Select
                          value={objectState.animationEase ?? "power2.out"}
                          onValueChange={(v) => handleStateUpdate("animationEase", v)}
                        >
                          <SelectTrigger className="h-8 text-xs" data-testid="select-animation-ease">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            <SelectItem value="power1.out">Power1 Out</SelectItem>
                            <SelectItem value="power2.out">Power2 Out</SelectItem>
                            <SelectItem value="power3.out">Power3 Out</SelectItem>
                            <SelectItem value="back.out(1.7)">Back Out</SelectItem>
                            <SelectItem value="elastic.out(1,0.3)">Elastic</SelectItem>
                            <SelectItem value="bounce.out">Bounce</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="styles" className="flex-1 m-0 overflow-hidden">
          <StylesPanel
            tokens={tokens}
            onAddToken={addToken}
            onUpdateToken={updateToken}
            onDeleteToken={deleteToken}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface BoundVocabularyPreviewProps {
  dataKey: string | null;
  vocabulary: Vocabulary[];
}

function BoundVocabularyPreview({ dataKey, vocabulary }: BoundVocabularyPreviewProps) {
  const boundItem = useMemo(() => {
    if (!dataKey) return null;
    return vocabulary.find(v => v.id === dataKey);
  }, [dataKey, vocabulary]);

  if (!boundItem) return null;

  return (
    <div className="mt-2 p-2 bg-muted/30 rounded border border-border" data-testid="bound-vocabulary-preview">
      <div className="flex items-start gap-2">
        {boundItem.imageUrl ? (
          <div className="w-12 h-12 rounded bg-muted flex-shrink-0 overflow-hidden">
            <img 
              src={boundItem.imageUrl} 
              alt={boundItem.word}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-muted flex-shrink-0 flex items-center justify-center">
            <ImageIcon className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <Book className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">Bound</span>
          </div>
          <p className="text-sm font-medium truncate">{boundItem.word}</p>
          <p className="text-xs text-muted-foreground truncate">{boundItem.translation}</p>
          {boundItem.category && (
            <span className="text-[10px] px-1 py-0.5 bg-primary/10 text-primary rounded mt-1 inline-block">
              {boundItem.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export interface ObjectConstraints {
  left: boolean;
  right: boolean;
  top: boolean;
  bottom: boolean;
  fixWidth: boolean;
  fixHeight: boolean;
}

const DEFAULT_CONSTRAINTS: ObjectConstraints = {
  left: true,
  right: false,
  top: true,
  bottom: false,
  fixWidth: true,
  fixHeight: true,
};

interface ConstraintsSectionProps {
  selectedObject: GameObject;
  onUpdateObject: (updates: Partial<GameObject>) => void;
}

function ConstraintsSection({ selectedObject, onUpdateObject }: ConstraintsSectionProps) {
  const metadata = (selectedObject.metadata as Record<string, unknown>) || {};
  const constraints: ObjectConstraints = (metadata.constraints as ObjectConstraints) || DEFAULT_CONSTRAINTS;

  const handleConstraintChange = (key: keyof ObjectConstraints, value: boolean) => {
    const newConstraints = { ...constraints, [key]: value };
    onUpdateObject({
      metadata: {
        ...metadata,
        constraints: newConstraints,
      },
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Anchor className="w-3 h-3" />
        Constraints
      </div>
      
      <div className="space-y-3">
        <Label className="text-xs">Pin to Edges</Label>
        <ConstraintPicker
          constraints={constraints}
          onChange={handleConstraintChange}
        />
        
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fix-width"
              checked={constraints.fixWidth}
              onCheckedChange={(checked) => handleConstraintChange("fixWidth", !!checked)}
              data-testid="checkbox-fix-width"
            />
            <Label htmlFor="fix-width" className="text-xs cursor-pointer">
              Fix Width
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="fix-height"
              checked={constraints.fixHeight}
              onCheckedChange={(checked) => handleConstraintChange("fixHeight", !!checked)}
              data-testid="checkbox-fix-height"
            />
            <Label htmlFor="fix-height" className="text-xs cursor-pointer">
              Fix Height
            </Label>
          </div>
        </div>
        
        <p className="text-[10px] text-muted-foreground mt-2">
          {getConstraintDescription(constraints)}
        </p>
      </div>
    </div>
  );
}

interface ConstraintPickerProps {
  constraints: ObjectConstraints;
  onChange: (key: keyof ObjectConstraints, value: boolean) => void;
}

function ConstraintPicker({ constraints, onChange }: ConstraintPickerProps) {
  return (
    <div 
      className="relative w-full aspect-[4/3] max-w-[120px] mx-auto bg-muted/30 rounded border border-border"
      data-testid="constraint-picker"
    >
      {/* Center rectangle representing the object */}
      <div className="absolute inset-[25%] border-2 border-primary/50 rounded bg-primary/10" />
      
      {/* Left edge toggle */}
      <button
        type="button"
        onClick={() => onChange("left", !constraints.left)}
        className={cn(
          "absolute left-0 top-1/2 -translate-y-1/2 w-[25%] h-[2px] transition-colors",
          constraints.left ? "bg-primary" : "bg-muted-foreground/30"
        )}
        data-testid="constraint-left"
      >
        <span className="sr-only">Toggle left constraint</span>
        {constraints.left && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </button>
      
      {/* Right edge toggle */}
      <button
        type="button"
        onClick={() => onChange("right", !constraints.right)}
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 w-[25%] h-[2px] transition-colors",
          constraints.right ? "bg-primary" : "bg-muted-foreground/30"
        )}
        data-testid="constraint-right"
      >
        <span className="sr-only">Toggle right constraint</span>
        {constraints.right && (
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </button>
      
      {/* Top edge toggle */}
      <button
        type="button"
        onClick={() => onChange("top", !constraints.top)}
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 h-[25%] w-[2px] transition-colors",
          constraints.top ? "bg-primary" : "bg-muted-foreground/30"
        )}
        data-testid="constraint-top"
      >
        <span className="sr-only">Toggle top constraint</span>
        {constraints.top && (
          <span className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </button>
      
      {/* Bottom edge toggle */}
      <button
        type="button"
        onClick={() => onChange("bottom", !constraints.bottom)}
        className={cn(
          "absolute bottom-0 left-1/2 -translate-x-1/2 h-[25%] w-[2px] transition-colors",
          constraints.bottom ? "bg-primary" : "bg-muted-foreground/30"
        )}
        data-testid="constraint-bottom"
      >
        <span className="sr-only">Toggle bottom constraint</span>
        {constraints.bottom && (
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
        )}
      </button>
    </div>
  );
}

function getConstraintDescription(constraints: ObjectConstraints): string {
  const edges: string[] = [];
  if (constraints.left) edges.push("left");
  if (constraints.right) edges.push("right");
  if (constraints.top) edges.push("top");
  if (constraints.bottom) edges.push("bottom");
  
  const size: string[] = [];
  if (constraints.fixWidth) size.push("width");
  if (constraints.fixHeight) size.push("height");
  
  let description = "";
  if (edges.length > 0) {
    description = `Pinned to ${edges.join(", ")}`;
  } else {
    description = "No edge constraints";
  }
  
  if (size.length > 0) {
    description += `. Fixed ${size.join(" and ")}.`;
  }
  
  return description;
}

export function getObjectInteractions(obj: GameObject | null): ObjectInteraction[] {
  if (!obj) return [];
  const metadata = obj.metadata as Record<string, unknown> | null;
  if (!metadata?.interactions) return [];
  return metadata.interactions as ObjectInteraction[];
}

const TRIGGER_TYPES = [
  { value: "click", label: "On Click", icon: MousePointer },
  { value: "hover", label: "On Hover", icon: MousePointer },
  { value: "mouseEnter", label: "Mouse Enter", icon: MousePointer },
  { value: "mouseLeave", label: "Mouse Leave", icon: MousePointer },
] as const;

const ACTION_TYPES = [
  { value: "goToScene", label: "Go to Scene", icon: ArrowRight },
  { value: "setVisible", label: "Set Visibility", icon: Eye },
  { value: "playAudio", label: "Play Audio", icon: Volume2 },
] as const;

interface InteractionsSectionProps {
  selectedObject: GameObject;
  scenes: Scene[];
  onUpdateObject: (updates: Partial<GameObject>) => void;
  editingInteractionId: string | null;
  onEditingInteractionChange: (id: string | null) => void;
}

function InteractionsSection({
  selectedObject,
  scenes,
  onUpdateObject,
  editingInteractionId,
  onEditingInteractionChange,
}: InteractionsSectionProps) {
  const interactions = getObjectInteractions(selectedObject);

  const updateInteractions = (newInteractions: ObjectInteraction[]) => {
    const metadata = (selectedObject.metadata as Record<string, unknown>) || {};
    onUpdateObject({
      metadata: {
        ...metadata,
        interactions: newInteractions,
      },
    });
  };

  const handleAddInteraction = () => {
    const newInteraction: ObjectInteraction = {
      id: `int-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      trigger: "click",
      action: "goToScene",
    };
    updateInteractions([...interactions, newInteraction]);
    onEditingInteractionChange(newInteraction.id);
  };

  const handleUpdateInteraction = (id: string, updates: Partial<ObjectInteraction>) => {
    const updated = interactions.map(int =>
      int.id === id ? { ...int, ...updates } : int
    );
    updateInteractions(updated);
  };

  const handleDeleteInteraction = (id: string) => {
    updateInteractions(interactions.filter(int => int.id !== id));
    if (editingInteractionId === id) {
      onEditingInteractionChange(null);
    }
  };

  const getTriggerLabel = (trigger: string) => {
    return TRIGGER_TYPES.find(t => t.value === trigger)?.label || trigger;
  };

  const getActionLabel = (action: string) => {
    return ACTION_TYPES.find(a => a.value === action)?.label || action;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MousePointer className="w-3 h-3" />
          Interactions
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleAddInteraction}
          data-testid="button-add-interaction"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      {interactions.length === 0 ? (
        <p className="text-[10px] text-muted-foreground italic">
          No interactions defined. Add one to enable click-through navigation in preview mode.
        </p>
      ) : (
        <div className="space-y-2">
          {interactions.map((interaction) => {
            const targetScene = scenes.find(s => s.id === interaction.sceneId);
            const isEditing = editingInteractionId === interaction.id;

            return (
              <div
                key={interaction.id}
                className={cn(
                  "p-2 rounded border text-xs space-y-2",
                  isEditing 
                    ? "border-primary bg-primary/5" 
                    : "border-border bg-muted/30"
                )}
                data-testid={`interaction-${interaction.id}`}
              >
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-left flex-1"
                    onClick={() => onEditingInteractionChange(isEditing ? null : interaction.id)}
                  >
                    <MousePointer className="w-3 h-3 text-primary" />
                    <span className="font-medium">{getTriggerLabel(interaction.trigger)}</span>
                    <ArrowRight className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">{getActionLabel(interaction.action)}</span>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive"
                    onClick={() => handleDeleteInteraction(interaction.id)}
                    data-testid={`button-delete-interaction-${interaction.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>

                {isEditing && (
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Trigger</Label>
                        <Select
                          value={interaction.trigger}
                          onValueChange={(v) => handleUpdateInteraction(interaction.id, { 
                            trigger: v as ObjectInteraction['trigger'] 
                          })}
                        >
                          <SelectTrigger className="h-7 text-xs" data-testid="select-interaction-trigger">
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
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Action</Label>
                        <Select
                          value={interaction.action}
                          onValueChange={(v) => handleUpdateInteraction(interaction.id, { 
                            action: v as ObjectInteraction['action'],
                            sceneId: undefined,
                            visible: undefined,
                            audioUrl: undefined,
                          })}
                        >
                          <SelectTrigger className="h-7 text-xs" data-testid="select-interaction-action">
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
                    </div>

                    {interaction.action === "goToScene" && (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Target Scene</Label>
                        <Select
                          value={interaction.sceneId || "none"}
                          onValueChange={(v) => handleUpdateInteraction(interaction.id, { 
                            sceneId: v === "none" ? undefined : v 
                          })}
                        >
                          <SelectTrigger className="h-7 text-xs" data-testid="select-interaction-scene">
                            <SelectValue placeholder="Select scene" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No Scene</SelectItem>
                            {scenes.map(scene => (
                              <SelectItem key={scene.id} value={scene.id}>
                                {scene.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {interaction.action === "setVisible" && (
                      <div className="flex items-center gap-2">
                        <Label className="text-[10px] text-muted-foreground">Set Visible</Label>
                        <Switch
                          checked={interaction.visible !== false}
                          onCheckedChange={(checked) => handleUpdateInteraction(interaction.id, { 
                            visible: checked 
                          })}
                        />
                      </div>
                    )}

                    {interaction.action === "playAudio" && (
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Audio URL</Label>
                        <Input
                          type="text"
                          placeholder="/audio/sound.mp3"
                          value={interaction.audioUrl || ""}
                          onChange={(e) => handleUpdateInteraction(interaction.id, { 
                            audioUrl: e.target.value 
                          })}
                          className="h-7 text-xs"
                          data-testid="input-interaction-audio"
                        />
                      </div>
                    )}
                  </div>
                )}

                {!isEditing && interaction.action === "goToScene" && targetScene && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                      {targetScene.name}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
