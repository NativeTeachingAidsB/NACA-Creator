import React, { useState, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Keyboard,
  Layout,
  Palette,
  Sliders,
  AlertTriangle,
  RotateCcw,
  Save,
  X,
  Check,
  Edit2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useNacaCommunities } from "@/hooks/use-naca";
import {
  useSettingsProfile,
  useSiteSettings,
  useThemeSettings,
  useComponentOptions,
  useWorkspaceConfig,
  useKeyboardBindingsSettings,
  useResetSettings,
  useCommunityTheme,
} from "@/hooks/use-settings-profiles";
import type { KeyboardBinding } from "@shared/schema";

interface AdminToolsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCommunityId?: string;
}

const FONT_FAMILIES = [
  { value: "system-ui", label: "System Default" },
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "'SF Pro Display', sans-serif", label: "SF Pro Display" },
  { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
  { value: "Helvetica, sans-serif", label: "Helvetica" },
  { value: "'Fira Code', monospace", label: "Fira Code (Mono)" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
];

const ACCENT_COLORS = [
  { value: "#3b82f6", label: "Blue", class: "bg-blue-500" },
  { value: "#8b5cf6", label: "Purple", class: "bg-purple-500" },
  { value: "#10b981", label: "Green", class: "bg-emerald-500" },
  { value: "#f59e0b", label: "Amber", class: "bg-amber-500" },
  { value: "#ef4444", label: "Red", class: "bg-red-500" },
  { value: "#ec4899", label: "Pink", class: "bg-pink-500" },
  { value: "#06b6d4", label: "Cyan", class: "bg-cyan-500" },
  { value: "#f97316", label: "Orange", class: "bg-orange-500" },
];

const PANEL_LAYOUT_PRESETS = [
  { value: "default", label: "Default", description: "Standard three-panel layout" },
  { value: "compact", label: "Compact", description: "Narrower panels, more canvas space" },
  { value: "expanded", label: "Expanded", description: "Wider panels, less canvas space" },
  { value: "custom", label: "Custom", description: "Manually configured widths" },
];

const EXPERTISE_OPTIONS = [
  { value: "ui-ux", label: "UI/UX", description: "Visual components, styling, user interactions" },
  { value: "data", label: "Data", description: "Data models, database schema, relationships" },
  { value: "testing", label: "Testing", description: "Debugging, verification, quality assurance" },
  { value: "creative-analysis", label: "Creative Analysis", description: "Design analysis and creative problem solving" },
  { value: "routing", label: "Routing", description: "Navigation, routes, page structure" },
  { value: "domains", label: "Domains", description: "Business logic and domain-specific features" },
  { value: "interactive-data-driven-animation", label: "Interactive Data-Driven Animation", description: "GSAP animations, interactive elements, data binding" },
];

const RESPONSE_STYLE_OPTIONS = [
  { value: "bullet-points", label: "Bullet Points", description: "Concise bullet-point format for quick scanning" },
  { value: "brief", label: "Brief", description: "Short, focused responses with essential information" },
  { value: "verbose", label: "Verbose", description: "Detailed explanations with full context" },
];

const COMPLETION_LEVEL_OPTIONS = [
  { value: "wireframing", label: "Wireframing", description: "Basic structure and layout placeholders" },
  { value: "ui-ux", label: "UI/UX", description: "Visual design with styling but limited functionality" },
  { value: "fully-functional-tested", label: "Fully Functional & Tested", description: "Complete implementation with testing verification" },
  { value: "expert-analyzed-refactor", label: "Expert Analyzed Refactor", description: "Production-ready code with optimization and best practices" },
];

function SiteSettingsTab() {
  const {
    site,
    setVideoHelpEnabled,
    setShowHelpTooltips,
    setAutoPlayVideos,
    setShowShortcutHints,
    setAutosaveEnabled,
    setAutosaveInterval,
    setNotificationsEnabled,
    setConfirmDestructiveActions,
    setNacaEnvironment,
    setExpertise,
    setResponseStyle,
    setCompletion,
  } = useSiteSettings();

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 pr-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Help & Tutorials</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="video-help">Video Help</Label>
                <p className="text-xs text-muted-foreground">Show video tutorials for features</p>
              </div>
              <Switch
                id="video-help"
                checked={site.videoHelpEnabled}
                onCheckedChange={setVideoHelpEnabled}
                data-testid="switch-video-help"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tooltips">Help Tooltips</Label>
                <p className="text-xs text-muted-foreground">Show helpful tooltips on hover</p>
              </div>
              <Switch
                id="tooltips"
                checked={site.showHelpTooltips}
                onCheckedChange={setShowHelpTooltips}
                data-testid="switch-tooltips"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoplay">Auto-play Videos</Label>
                <p className="text-xs text-muted-foreground">Automatically play help videos</p>
              </div>
              <Switch
                id="autoplay"
                checked={site.autoPlayVideos}
                onCheckedChange={setAutoPlayVideos}
                data-testid="switch-autoplay"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shortcut-hints">Shortcut Hints</Label>
                <p className="text-xs text-muted-foreground">Show keyboard shortcuts in menus</p>
              </div>
              <Switch
                id="shortcut-hints"
                checked={site.showShortcutHints}
                onCheckedChange={setShowShortcutHints}
                data-testid="switch-shortcut-hints"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Auto-save</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autosave">Enable Auto-save</Label>
                <p className="text-xs text-muted-foreground">Automatically save changes</p>
              </div>
              <Switch
                id="autosave"
                checked={site.autosaveEnabled}
                onCheckedChange={setAutosaveEnabled}
                data-testid="switch-autosave"
              />
            </div>
            {site.autosaveEnabled && (
              <div className="space-y-2">
                <Label htmlFor="autosave-interval">Auto-save Interval</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="autosave-interval"
                    min={5000}
                    max={120000}
                    step={5000}
                    value={[site.autosaveInterval]}
                    onValueChange={([val]) => setAutosaveInterval(val)}
                    className="flex-1"
                    data-testid="slider-autosave-interval"
                  />
                  <span className="text-sm text-muted-foreground w-16 text-right">
                    {Math.round(site.autosaveInterval / 1000)}s
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Confirmations</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="confirm-destructive">Confirm Destructive Actions</Label>
              <p className="text-xs text-muted-foreground">Ask before deleting objects or scenes</p>
            </div>
            <Switch
              id="confirm-destructive"
              checked={site.confirmDestructiveActions}
              onCheckedChange={setConfirmDestructiveActions}
              data-testid="switch-confirm-destructive"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notifications</Label>
              <p className="text-xs text-muted-foreground">Show toast notifications</p>
            </div>
            <Switch
              id="notifications"
              checked={site.notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              data-testid="switch-notifications"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">NACA Environment</h3>
          <Select
            value={site.nacaEnvironment}
            onValueChange={(val) => setNacaEnvironment(val as "development" | "production")}
          >
            <SelectTrigger data-testid="select-naca-env">
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="production">Production</SelectItem>
              <SelectItem value="development">Development</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {site.nacaEnvironment === "production"
              ? "Connected to NACA Community production server"
              : "Connected to Native Tongue Lexicon dev server"}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Agent Expertise</h3>
          <Select
            value={site.expertise || "ui-ux"}
            onValueChange={(val) => setExpertise(val as typeof site.expertise)}
          >
            <SelectTrigger data-testid="select-expertise">
              <SelectValue placeholder="Select expertise mode" />
            </SelectTrigger>
            <SelectContent>
              {EXPERTISE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {EXPERTISE_OPTIONS.find((o) => o.value === (site.expertise || "ui-ux"))?.description ||
              "Select an expertise mode for optimized agent behavior"}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Response Style</h3>
          <Select
            value={site.responseStyle || "brief"}
            onValueChange={(val) => setResponseStyle(val as typeof site.responseStyle)}
          >
            <SelectTrigger data-testid="select-response-style">
              <SelectValue placeholder="Select response style" />
            </SelectTrigger>
            <SelectContent>
              {RESPONSE_STYLE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {RESPONSE_STYLE_OPTIONS.find((o) => o.value === (site.responseStyle || "brief"))?.description ||
              "Choose how the agent formats its responses"}
          </p>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Completion Level</h3>
          <Select
            value={site.completion || "fully-functional-tested"}
            onValueChange={(val) => setCompletion(val as typeof site.completion)}
          >
            <SelectTrigger data-testid="select-completion">
              <SelectValue placeholder="Select completion level" />
            </SelectTrigger>
            <SelectContent>
              {COMPLETION_LEVEL_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {COMPLETION_LEVEL_OPTIONS.find((o) => o.value === (site.completion || "fully-functional-tested"))?.description ||
              "Set the target completion level for agent work"}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

function KeyboardBindingsTab() {
  const { bindings, updateBinding, resetBindings, findConflict } = useKeyboardBindingsSettings();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editKey, setEditKey] = useState("");
  const [editModifiers, setEditModifiers] = useState<string[]>([]);

  const handleKeyCapture = useCallback((e: React.KeyboardEvent) => {
    e.preventDefault();
    const modifiers: string[] = [];
    if (e.ctrlKey) modifiers.push("ctrl");
    if (e.altKey) modifiers.push("alt");
    if (e.shiftKey) modifiers.push("shift");
    if (e.metaKey) modifiers.push("meta");
    
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (!["Control", "Alt", "Shift", "Meta"].includes(e.key)) {
      setEditKey(key);
      setEditModifiers(modifiers);
    }
  }, []);

  const handleSaveBinding = useCallback((index: number) => {
    const conflict = findConflict(editKey, editModifiers, index);
    if (conflict) {
      toast({
        title: "Keyboard Conflict",
        description: `This shortcut is already assigned to "${conflict.action}"`,
        variant: "destructive",
      });
      return;
    }
    
    updateBinding(index, { 
      key: editKey, 
      modifiers: editModifiers as KeyboardBinding["modifiers"] 
    });
    setEditingIndex(null);
    setEditKey("");
    setEditModifiers([]);
  }, [editKey, editModifiers, findConflict, updateBinding]);

  const formatShortcut = (binding: KeyboardBinding) => {
    const mods = binding.modifiers
      .map((m) => (m === "meta" ? "⌘" : m === "ctrl" ? "Ctrl" : m.charAt(0).toUpperCase() + m.slice(1)))
      .join("+");
    return mods ? `${mods}+${binding.key.toUpperCase()}` : binding.key.toUpperCase();
  };

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-4 pr-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Custom Keyboard Shortcuts</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={resetBindings}
            data-testid="button-reset-bindings"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset All
          </Button>
        </div>

        {bindings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Keyboard className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No custom shortcuts defined</p>
            <p className="text-xs mt-1">Custom shortcuts will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bindings.map((binding, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between p-3 rounded-md border",
                  !binding.enabled && "opacity-50"
                )}
                data-testid={`binding-row-${index}`}
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={binding.enabled}
                    onCheckedChange={(enabled) => updateBinding(index, { enabled })}
                    data-testid={`switch-binding-${index}`}
                  />
                  <div>
                    <p className="text-sm font-medium">{binding.action}</p>
                    {editingIndex === index ? (
                      <Input
                        className="h-7 w-32 mt-1"
                        value={editModifiers.length ? `${editModifiers.join("+")}+${editKey}` : editKey}
                        onKeyDown={handleKeyCapture}
                        placeholder="Press keys..."
                        autoFocus
                        data-testid={`input-binding-${index}`}
                      />
                    ) : (
                      <Badge variant="secondary" className="font-mono text-xs">
                        {formatShortcut(binding)}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {editingIndex === index ? (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveBinding(index)}
                        data-testid={`button-save-binding-${index}`}
                      >
                        <Check className="h-4 w-4 text-green-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingIndex(null)}
                        data-testid={`button-cancel-binding-${index}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingIndex(index);
                        setEditKey(binding.key);
                        setEditModifiers([...binding.modifiers]);
                      }}
                      data-testid={`button-edit-binding-${index}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3 inline mr-1" />
            Default shortcuts are defined in the keyboard shortcuts dialog and cannot be modified here.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

function ComponentOptionsTab() {
  const { components, updateTimeline, updateCanvas, updateObjects } = useComponentOptions();

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 pr-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Canvas</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-grid">Show Grid</Label>
                <p className="text-xs text-muted-foreground">Display grid overlay on canvas</p>
              </div>
              <Switch
                id="show-grid"
                checked={components.canvas.showGrid}
                onCheckedChange={(showGrid) => updateCanvas({ showGrid })}
                data-testid="switch-show-grid"
              />
            </div>
            {components.canvas.showGrid && (
              <div className="space-y-2">
                <Label>Grid Size</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    min={5}
                    max={50}
                    step={5}
                    value={[components.canvas.gridSize]}
                    onValueChange={([gridSize]) => updateCanvas({ gridSize })}
                    className="flex-1"
                    data-testid="slider-grid-size"
                  />
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {components.canvas.gridSize}px
                  </span>
                </div>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="snap-grid">Snap to Grid</Label>
                <p className="text-xs text-muted-foreground">Align objects to grid lines</p>
              </div>
              <Switch
                id="snap-grid"
                checked={components.canvas.snapToGrid}
                onCheckedChange={(snapToGrid) => updateCanvas({ snapToGrid })}
                data-testid="switch-snap-grid"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-rulers">Show Rulers</Label>
                <p className="text-xs text-muted-foreground">Display rulers on canvas edges</p>
              </div>
              <Switch
                id="show-rulers"
                checked={components.canvas.showRulers}
                onCheckedChange={(showRulers) => updateCanvas({ showRulers })}
                data-testid="switch-show-rulers"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-guides">Show Guides</Label>
                <p className="text-xs text-muted-foreground">Display alignment guides</p>
              </div>
              <Switch
                id="show-guides"
                checked={components.canvas.showGuides}
                onCheckedChange={(showGuides) => updateCanvas({ showGuides })}
                data-testid="switch-show-guides"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="snap-keyframes">Snap to Keyframes</Label>
                <p className="text-xs text-muted-foreground">Align playhead to keyframes</p>
              </div>
              <Switch
                id="snap-keyframes"
                checked={components.timeline.snapToKeyframes}
                onCheckedChange={(snapToKeyframes) => updateTimeline({ snapToKeyframes })}
                data-testid="switch-snap-keyframes"
              />
            </div>
            <div className="space-y-2">
              <Label>Snap Increment</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  value={[components.timeline.snapIncrement]}
                  onValueChange={([snapIncrement]) => updateTimeline({ snapIncrement })}
                  className="flex-1"
                  data-testid="slider-snap-increment"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {components.timeline.snapIncrement}f
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-waveforms">Show Waveforms</Label>
                <p className="text-xs text-muted-foreground">Display audio waveforms in timeline</p>
              </div>
              <Switch
                id="show-waveforms"
                checked={components.timeline.showWaveforms}
                onCheckedChange={(showWaveforms) => updateTimeline({ showWaveforms })}
                data-testid="switch-show-waveforms"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Objects</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-labels">Show Labels</Label>
                <p className="text-xs text-muted-foreground">Display object names on canvas</p>
              </div>
              <Switch
                id="show-labels"
                checked={components.objects.showLabels}
                onCheckedChange={(showLabels) => updateObjects({ showLabels })}
                data-testid="switch-show-labels"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-bounds">Show Bounds</Label>
                <p className="text-xs text-muted-foreground">Display bounding boxes on selection</p>
              </div>
              <Switch
                id="show-bounds"
                checked={components.objects.showBounds}
                onCheckedChange={(showBounds) => updateObjects({ showBounds })}
                data-testid="switch-show-bounds"
              />
            </div>
            <div className="space-y-2">
              <Label>Transform Handle Size</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={4}
                  max={16}
                  step={2}
                  value={[components.objects.transformHandleSize]}
                  onValueChange={([transformHandleSize]) => updateObjects({ transformHandleSize })}
                  className="flex-1"
                  data-testid="slider-handle-size"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {components.objects.transformHandleSize}px
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

function WorkspaceTab() {
  const {
    workspace,
    setPanelLayout,
    setLeftPanelWidth,
    setRightPanelWidth,
    setBottomPanelHeight,
  } = useWorkspaceConfig();

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 pr-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Panel Layout</h3>
          <div className="grid grid-cols-2 gap-2">
            {PANEL_LAYOUT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setPanelLayout(preset.value as any)}
                className={cn(
                  "p-3 rounded-md border text-left transition-colors",
                  workspace.panelLayout === preset.value
                    ? "border-primary bg-primary/10"
                    : "hover:bg-muted"
                )}
                data-testid={`button-layout-${preset.value}`}
              >
                <p className="text-sm font-medium">{preset.label}</p>
                <p className="text-xs text-muted-foreground">{preset.description}</p>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Panel Widths</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Left Panel Width</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={200}
                  max={400}
                  step={10}
                  value={[workspace.leftPanelWidth]}
                  onValueChange={([width]) => setLeftPanelWidth(width)}
                  className="flex-1"
                  data-testid="slider-left-width"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {workspace.leftPanelWidth}px
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Right Panel Width</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={250}
                  max={450}
                  step={10}
                  value={[workspace.rightPanelWidth]}
                  onValueChange={([width]) => setRightPanelWidth(width)}
                  className="flex-1"
                  data-testid="slider-right-width"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {workspace.rightPanelWidth}px
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timeline Height</Label>
              <div className="flex items-center gap-4">
                <Slider
                  min={100}
                  max={400}
                  step={10}
                  value={[workspace.bottomPanelHeight]}
                  onValueChange={([height]) => setBottomPanelHeight(height)}
                  className="flex-1"
                  data-testid="slider-bottom-height"
                />
                <span className="text-sm text-muted-foreground w-12 text-right">
                  {workspace.bottomPanelHeight}px
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Collapsed Panels</h3>
          <p className="text-xs text-muted-foreground">
            {workspace.collapsedPanels.length === 0
              ? "No panels are currently collapsed"
              : `Collapsed: ${workspace.collapsedPanels.join(", ")}`}
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}

function ThemingTab({ selectedCommunityId }: { selectedCommunityId?: string }) {
  const {
    theme,
    setMode,
    setFontFamily,
    setFontSize,
    setDensity,
    setAccentColor,
    setBorderRadius,
  } = useThemeSettings();

  const { data: communities } = useNacaCommunities();
  const { hasCommunityFont, communityFont, applyCommunityTheme, clearCommunityTheme } =
    useCommunityTheme(selectedCommunityId);

  const selectedCommunity = communities?.find((c) => c.id === selectedCommunityId);

  return (
    <ScrollArea className="h-[calc(100vh-220px)]">
      <div className="space-y-6 pr-4">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Appearance</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Color Mode</Label>
              <Select value={theme.mode} onValueChange={setMode}>
                <SelectTrigger data-testid="select-theme-mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Typography</h3>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select value={theme.fontFamily} onValueChange={setFontFamily}>
                <SelectTrigger data-testid="select-font-family">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_FAMILIES.map((font) => (
                    <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedCommunity && (
              <div className="p-3 rounded-md border bg-muted/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="space-y-0.5">
                    <Label>Community Font</Label>
                    <p className="text-xs text-muted-foreground">
                      Use font from {selectedCommunity.name}
                    </p>
                  </div>
                  <Switch
                    checked={hasCommunityFont}
                    onCheckedChange={(checked) =>
                      checked ? applyCommunityTheme() : clearCommunityTheme()
                    }
                    data-testid="switch-community-font"
                  />
                </div>
                {communityFont && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Current: <span style={{ fontFamily: communityFont }}>{communityFont}</span>
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select value={theme.fontSize} onValueChange={setFontSize}>
                <SelectTrigger data-testid="select-font-size">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>UI Density</Label>
              <Select value={theme.density} onValueChange={setDensity}>
                <SelectTrigger data-testid="select-density">
                  <SelectValue placeholder="Select density" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="cozy">Cozy</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Accent Color</h3>
          <div className="flex flex-wrap gap-2">
            {ACCENT_COLORS.map((color) => (
              <button
                key={color.value}
                onClick={() => setAccentColor(color.value)}
                className={cn(
                  "w-8 h-8 rounded-full transition-all",
                  color.class,
                  theme.accentColor === color.value
                    ? "ring-2 ring-offset-2 ring-offset-background ring-primary"
                    : "hover:scale-110"
                )}
                title={color.label}
                data-testid={`button-accent-${color.label.toLowerCase()}`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="custom-accent" className="text-xs">Custom:</Label>
            <Input
              id="custom-accent"
              type="color"
              value={theme.accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-8 p-0 border-0"
              data-testid="input-custom-accent"
            />
            <span className="text-xs text-muted-foreground font-mono">{theme.accentColor}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Border Radius</h3>
          <Select value={theme.borderRadius} onValueChange={setBorderRadius}>
            <SelectTrigger data-testid="select-border-radius">
              <SelectValue placeholder="Select radius" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (Sharp)</SelectItem>
              <SelectItem value="small">Small</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="large">Large (Pill)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            {["none", "small", "medium", "large"].map((radius) => (
              <div
                key={radius}
                className={cn(
                  "w-12 h-8 border-2 transition-colors",
                  theme.borderRadius === radius ? "border-primary bg-primary/20" : "border-muted",
                  radius === "none" && "rounded-none",
                  radius === "small" && "rounded",
                  radius === "medium" && "rounded-lg",
                  radius === "large" && "rounded-full"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export function AdminToolsPanel({ open, onOpenChange, selectedCommunityId }: AdminToolsPanelProps) {
  const [activeTab, setActiveTab] = useState("site");
  const { reset: resetSettings, isPending: isResetting } = useResetSettings();

  const handleReset = useCallback(() => {
    resetSettings();
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to defaults",
    });
  }, [resetSettings]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[540px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Admin Tools
          </SheetTitle>
          <SheetDescription>
            Configure editor settings, shortcuts, and appearance
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 min-h-0 px-6 py-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid grid-cols-5 w-full mb-4" data-testid="tabs-admin-tools">
              <TabsTrigger value="site" className="text-xs" data-testid="tab-site">
                <Settings className="h-3.5 w-3.5 mr-1" />
                Site
              </TabsTrigger>
              <TabsTrigger value="keyboard" className="text-xs" data-testid="tab-keyboard">
                <Keyboard className="h-3.5 w-3.5 mr-1" />
                Keys
              </TabsTrigger>
              <TabsTrigger value="components" className="text-xs" data-testid="tab-components">
                <Sliders className="h-3.5 w-3.5 mr-1" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="workspace" className="text-xs" data-testid="tab-workspace">
                <Layout className="h-3.5 w-3.5 mr-1" />
                Layout
              </TabsTrigger>
              <TabsTrigger value="theme" className="text-xs" data-testid="tab-theme">
                <Palette className="h-3.5 w-3.5 mr-1" />
                Theme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="site" className="flex-1 mt-0">
              <SiteSettingsTab />
            </TabsContent>
            <TabsContent value="keyboard" className="flex-1 mt-0">
              <KeyboardBindingsTab />
            </TabsContent>
            <TabsContent value="components" className="flex-1 mt-0">
              <ComponentOptionsTab />
            </TabsContent>
            <TabsContent value="workspace" className="flex-1 mt-0">
              <WorkspaceTab />
            </TabsContent>
            <TabsContent value="theme" className="flex-1 mt-0">
              <ThemingTab selectedCommunityId={selectedCommunityId} />
            </TabsContent>
          </Tabs>
        </div>

        <SheetFooter className="px-6 py-4 border-t">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isResetting}
            data-testid="button-reset-all"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset All
          </Button>
          <Button onClick={() => onOpenChange(false)} data-testid="button-save-close">
            <Save className="h-4 w-4 mr-2" />
            Save & Close
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
