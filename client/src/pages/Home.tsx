import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ResizableDrawer } from "@/components/ui/resizable-drawer";
import { CollapsiblePalette, PaletteGroup } from "@/components/ui/collapsible-palette";
import { Sidebar, CommunitySidebar } from "@/components/figma/Sidebar";
import { FigmaConnection } from "@/components/figma/FigmaConnection";
import { GameCanvas } from "@/components/editor/GameCanvas";
import { AttributeEditor } from "@/components/editor/AttributeEditor";
import { VocabularyPanel } from "@/components/editor/VocabularyPanel";
import { ActivityFolderBrowser } from "@/components/editor/ActivityFolderBrowser";
import { CommunityExplorer } from "@/components/editor/CommunityExplorer";
import { EmbedsExplorer } from "@/components/editor/EmbedsExplorer";
import { TimelinePanel } from "@/components/editor/TimelinePanel";
import { nacaApi, type NACAFolderNode, type NACAMediaFile, type NACADictionaryEntry, type NACADictionary, type NACAActivityItem } from "@/lib/naca-api";
import type { VocabularyBindingType } from "@/components/editor/CommunityExplorer";
import { SceneManager } from "@/components/editor/SceneManager";
import { TriggerEditor } from "@/components/editor/TriggerEditor";
import { FigmaNode } from "@/lib/mockData";
import { toast } from "@/hooks/use-toast";
import { TimelineProvider } from "@/contexts/TimelineContext";
import { HistoryProvider, useOptionalHistoryContext } from "@/contexts/HistoryContext";
import { useScreens, useCreateScreen, useUpdateScreen } from "@/hooks/use-screens";
import { useProjects, useCreateProject } from "@/hooks/use-projects";
import { useResponsive } from "@/hooks/use-responsive";
import { usePanelState } from "@/hooks/use-panel-state";
import { 
  useGameObjects, useCreateGameObject, useUpdateGameObject, useDeleteGameObject,
  useScenes, useCreateScene, useUpdateScene, useDeleteScene,
  useObjectStates, useCreateObjectState, useUpdateObjectState,
  useTriggers, useCreateTrigger, useUpdateTrigger, useDeleteTrigger,
  useSyncLayers,
  useVocabulary
} from "@/hooks/use-game-data";
import { useNacaActivityItems, useNacaCommunities } from "@/hooks/use-naca";
import type { GameObject, Scene, ObjectState, Trigger } from "@shared/schema";
import { 
  Menu, 
  PanelRight, 
  Layers, 
  FileImage, 
  Settings, 
  BookOpen,
  Plus,
  ChevronLeft,
  FolderTree,
  Clapperboard,
  Sliders,
  Zap,
  Wrench,
  Upload,
  FileCode,
  Globe,
  HelpCircle,
  History,
  ChevronDown,
  Figma,
  Palette,
  Film
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DevSyncProvider } from "@/contexts/DevSyncContext";
import { SVGObjectExplorer, type ImportSourceType } from "@/components/editor/SVGObjectExplorer";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { HelpAdminPanel } from "@/components/admin/HelpAdminPanel";
import { AdminToolsPanel } from "@/components/admin/AdminToolsPanel";
import { HelpPanel } from "@/components/editor/HelpPanel";
import { GroupedPanelTabs, type PanelGroup } from "@/components/editor/GroupedPanelTabs";
import { RightPanelAccordion, type AccordionGroup, ACCORDION_ICONS } from "@/components/editor/RightPanelAccordion";
import { prepareSVGImport, type SVGObject, type SVGGradient } from "@/lib/svg-import";
import { HistoryPanel } from "@/components/editor/HistoryPanel";
import { ComponentsPanel } from "@/components/editor/ComponentsPanel";
import { VersionHistoryPanel, LastSavedIndicator } from "@/components/editor/VersionHistoryPanel";
import { CommunityContextBanner } from "@/components/editor/CommunityContextBanner";
import { useComponents } from "@/hooks/use-components";
import { useVersionHistory } from "@/hooks/use-version-history";

import dashboardScreen from "@assets/generated_images/mobile_app_dashboard_screen.png";

const IMPORT_SOURCE_CONFIG = {
  figma: {
    label: 'Figma Design',
    icon: Figma,
    description: 'Import frames and components from Figma files',
    fileAccept: '.svg,image/svg+xml',
    dialogTitle: 'Figma Import',
    dialogDescription: 'Import Figma designs as interactive objects'
  },
  illustrator: {
    label: 'Illustrator Export',
    icon: Palette,
    description: 'Import Adobe Illustrator SVG exports with artboard structure',
    fileAccept: '.svg,image/svg+xml',
    dialogTitle: 'Illustrator Import',
    dialogDescription: 'Import Illustrator SVG exports with preserved layers'
  },
  animate: {
    label: 'Animate Export',
    icon: Film,
    description: 'Import Adobe Animate SVG with symbols and timeline data',
    fileAccept: '.svg,image/svg+xml',
    dialogTitle: 'Animate Import',
    dialogDescription: 'Import Adobe Animate SVG exports with symbol/instance structure'
  }
} as const;

const SAMPLE_ANIMATE_SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 400 300">
  <defs>
    <linearGradient id="BG_Gradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4a90d9"/>
      <stop offset="100%" style="stop-color:#2c5282"/>
    </linearGradient>
    <symbol id="Button_Symbol">
      <g id="Button_Layer_1">
        <rect width="120" height="40" rx="8" fill="#10b981"/>
        <text x="60" y="26" fill="white" font-size="14" text-anchor="middle" font-family="Arial">Click Me</text>
      </g>
    </symbol>
    <symbol id="Star_Symbol">
      <polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="#fbbf24"/>
    </symbol>
    <symbol id="Character_Symbol">
      <g id="Character_Layer_1">
        <circle cx="30" cy="25" r="20" fill="#fcd34d"/>
        <circle cx="24" cy="20" r="3" fill="#1f2937"/>
        <circle cx="36" cy="20" r="3" fill="#1f2937"/>
        <path d="M24,32 Q30,38 36,32" fill="none" stroke="#1f2937" stroke-width="2"/>
      </g>
    </symbol>
  </defs>
  <g id="Scene_Background" data-name="Background Layer">
    <rect id="Background_FILL_1" x="0" y="0" width="400" height="300" fill="url(#BG_Gradient)"/>
    <ellipse id="Cloud_1_FILL_1" cx="80" cy="50" rx="40" ry="20" fill="white" opacity="0.8"/>
    <ellipse id="Cloud_2_FILL_1" cx="320" cy="70" rx="50" ry="25" fill="white" opacity="0.6"/>
  </g>
  <g id="Interactive_Elements" data-name="Interactive Objects">
    <use id="MainButton_Layer_1_MEMBER_0" xlink:href="#Button_Symbol" x="140" y="220"/>
    <use id="Star_1_Layer_1_MEMBER_0" xlink:href="#Star_Symbol" x="50" y="100"/>
    <use id="Star_2_Layer_1_MEMBER_1" xlink:href="#Star_Symbol" x="330" y="120"/>
    <use id="Star_3_Layer_1_MEMBER_2" xlink:href="#Star_Symbol" x="200" y="80"/>
    <g id="Character_Group" data-name="Character Container">
      <use id="MainCharacter_Layer_1_MEMBER_0" xlink:href="#Character_Symbol" x="170" y="120"/>
      <text id="Character_Label" x="200" y="190" fill="white" font-size="16" text-anchor="middle" font-family="Arial">Hello!</text>
    </g>
  </g>
  <g id="Decorations" data-name="Decoration Layer">
    <circle id="Decoration_1_FILL_1" cx="30" cy="250" r="15" fill="#ec4899"/>
    <circle id="Decoration_2_FILL_1" cx="370" cy="260" r="12" fill="#8b5cf6"/>
    <rect id="Ground_FILL_1" x="0" y="280" width="400" height="20" fill="#065f46"/>
  </g>
</svg>`;

function IconSidebarItem({ 
  icon: Icon, 
  label, 
  isActive, 
  onClick 
}: { 
  icon: React.ElementType; 
  label: string; 
  isActive?: boolean; 
  onClick: () => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "icon-sidebar-item touch-target touch-ripple",
            isActive && "active"
          )}
          onClick={onClick}
          data-testid={`icon-sidebar-${label.toLowerCase()}`}
        >
          <Icon className="w-5 h-5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

export default function Home() {
  const [selectedScreenId, setSelectedScreenId] = useState<string | undefined>();
  const [selectedObjectIds, setSelectedObjectIds] = useState<string[]>([]);
  const [isolatedObjectId, setIsolatedObjectId] = useState<string | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | undefined>();
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>();
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  
  const { data: activityItems } = useNacaActivityItems(
    selectedCommunityId || '',
    selectedActivityId || '',
    { enabled: !!selectedCommunityId && !!selectedActivityId }
  );
  
  const activityBackgroundImage = useMemo(() => {
    if (!selectedActivityId || !activityItems?.items?.length) return undefined;
    const firstItemWithImage = activityItems.items.find(item => item.image);
    return firstItemWithImage?.image;
  }, [activityItems, selectedActivityId, selectedCommunityId]);
  
  const { data: communities } = useNacaCommunities();
  const communityStats = useMemo(() => {
    if (!communities) return null;
    return {
      count: communities.length,
      hasSelected: !!selectedCommunityId
    };
  }, [communities, selectedCommunityId]);
  
  const createdRef = useRef(false);
  const projectCreatedRef = useRef(false);
  const [showHelpAdmin, setShowHelpAdmin] = useState(false);
  const [showAdminTools, setShowAdminTools] = useState(false);
  const [showSVGExplorer, setShowSVGExplorer] = useState(false);
  const [svgToExplore, setSvgToExplore] = useState<string>("");
  const [importSourceType, setImportSourceType] = useState<ImportSourceType>('animate');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const [timelineHeight, setTimelineHeight] = useState(200);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);

  const { isMobile, isTablet, isDesktop, isLandscape, width, height } = useResponsive();
  const { leftPanel, rightPanel, toggleSectionCollapsed, isSectionCollapsed, activePreset, applyPreset, resetToDefaults } = usePanelState();

  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const createProject = useCreateProject();

  const { data: screens = [], isLoading: screensLoading } = useScreens();
  const createScreen = useCreateScreen();
  const updateScreen = useUpdateScreen();

  useEffect(() => {
    if (!projectsLoading && projects.length === 0 && !projectCreatedRef.current && !createProject.isPending) {
      projectCreatedRef.current = true;
      createProject.mutate({ name: "My First Project", description: "Language learning game project" }, {
        onSuccess: (project) => setCurrentProjectId(project.id)
      });
    } else if (projects.length > 0 && !currentProjectId) {
      setCurrentProjectId(projects[0].id);
    }
  }, [projectsLoading, projects.length, createProject.isPending, currentProjectId]);

  const currentProject = useMemo(() => 
    projects.find(p => p.id === currentProjectId) || null, 
    [projects, currentProjectId]
  );

  const { data: objects = [], isLoading: objectsLoading } = useGameObjects(selectedScreenId);
  const createObject = useCreateGameObject();
  const updateObject = useUpdateGameObject();
  const deleteObject = useDeleteGameObject();

  const { data: scenes = [], isLoading: scenesLoading } = useScenes(selectedScreenId);
  const createSceneMutation = useCreateScene();
  const updateSceneMutation = useUpdateScene();
  const deleteSceneMutation = useDeleteScene();

  const { data: objectStates = [] } = useObjectStates(currentSceneId ?? undefined);
  const createObjectState = useCreateObjectState();
  const updateObjectState = useUpdateObjectState();

  const { data: triggers = [] } = useTriggers(currentSceneId ?? undefined);
  const createTrigger = useCreateTrigger();
  const updateTrigger = useUpdateTrigger();
  const deleteTrigger = useDeleteTrigger();
  const syncLayers = useSyncLayers();

  const { data: vocabulary = [] } = useVocabulary();
  
  const {
    components,
    createComponent,
    insertInstance,
    updateComponent,
    deleteComponent,
    removeInstance,
    isObjectMasterComponent,
    isObjectInstance,
    getComponentForObject,
    getInstancesOfComponent,
    applyOverride,
    resetOverride,
  } = useComponents();

  const handleRestoreVersionObjects = useCallback((updates: Array<{ id: string; updates: Partial<GameObject> }>) => {
    for (const { id, updates: objUpdates } of updates) {
      updateObject.mutate({ id, ...objUpdates });
    }
    toast({ 
      title: "Checkpoint restored", 
      description: `Restored ${updates.length} object${updates.length !== 1 ? 's' : ''} to saved state` 
    });
  }, [updateObject]);

  const versionHistory = useVersionHistory({
    screenId: selectedScreenId,
    objects,
    onRestoreObjects: handleRestoreVersionObjects,
  });

  useEffect(() => {
    if (!screensLoading && screens.length === 0 && !createdRef.current && !createScreen.isPending) {
      createdRef.current = true;
      const sampleScreens = [
        { title: "Main Screen", imageUrl: dashboardScreen, width: 1194, height: 834, positionX: 0, positionY: 0 },
      ];

      sampleScreens.forEach(screen => {
        createScreen.mutate(screen);
      });
    }
  }, [screensLoading, screens.length, createScreen.isPending]);

  useEffect(() => {
    if (screens.length > 0 && !selectedScreenId) {
      setSelectedScreenId(screens[0].id);
    }
  }, [screens.length, selectedScreenId]);

  const sidebarData = useMemo((): FigmaNode[] => {
    if (screens.length === 0 || !selectedScreenId) {
      return [{
        id: "page1",
        name: "Screens",
        type: "PAGE" as const,
        expanded: true,
        children: screens.map(screen => ({
          id: screen.id,
          name: screen.title,
          type: "FRAME" as const,
          children: []
        }))
      }];
    }

    return [{
      id: "page1",
      name: "Screens", 
      type: "PAGE" as const,
      expanded: true,
      children: screens.map(screen => {
        const isCurrentScreen = screen.id === selectedScreenId;
        return {
          id: screen.id,
          name: screen.title,
          type: "FRAME" as const,
          expanded: isCurrentScreen,
          children: isCurrentScreen 
            ? objects.map(obj => ({
                id: obj.id,
                name: obj.name,
                type: obj.type.toUpperCase() as "TEXT" | "RECTANGLE" | "ELLIPSE" | "FRAME" | "GROUP" | "COMPONENT" | "INSTANCE" | "VECTOR" | "IMAGE" | "LINE" | "PAGE",
                children: [],
                visible: obj.visible !== false,
                locked: obj.locked === true,
              }))
            : []
        };
      })
    }];
  }, [screens, objects, selectedScreenId]);

  const handleToggleVisibility = useCallback((id: string, visible: boolean) => {
    const obj = objects.find(o => o.id === id);
    if (obj) {
      updateObject.mutate({ id, visible });
    }
  }, [objects, updateObject]);

  const handleToggleLock = useCallback((id: string, locked: boolean) => {
    const obj = objects.find(o => o.id === id);
    if (obj) {
      updateObject.mutate({ id, locked });
    }
  }, [objects, updateObject]);

  const handleSidebarSelect = useCallback((id: string) => {
    const screen = screens.find(s => s.id === id);
    if (screen) {
      setSelectedScreenId(id);
      setSelectedObjectIds([]);
    } else {
      const obj = objects.find(o => o.id === id);
      if (obj) {
        setSelectedScreenId(obj.screenId);
        setSelectedObjectIds([id]);
      }
    }
    if (isMobile) setSidebarOpen(false);
  }, [screens, objects, isMobile]);

  const selectedScreen = useMemo(() => 
    screens.find(s => s.id === selectedScreenId) || null, 
    [screens, selectedScreenId]
  );

  const currentScene = useMemo(() => 
    scenes.find(s => s.id === currentSceneId) || null, 
    [scenes, currentSceneId]
  );

  // Primary selected object (first in array) for single-selection operations
  const selectedObjectId = selectedObjectIds.length > 0 ? selectedObjectIds[0] : null;
  
  const selectedObject = useMemo(() => 
    objects.find(o => o.id === selectedObjectId) || null, 
    [objects, selectedObjectId]
  );

  const selectedObjectState = useMemo(() => 
    objectStates.find(s => s.objectId === selectedObjectId) || null, 
    [objectStates, selectedObjectId]
  );
  
  // All selected objects for multi-selection operations  
  const selectedObjects = useMemo(() => 
    objects.filter(o => selectedObjectIds.includes(o.id)),
    [objects, selectedObjectIds]
  );

  useEffect(() => {
    if (!isDesktop) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === '[') {
        e.preventDefault();
        leftPanel.toggleCollapsed();
      } else if (isMod && e.key === ']') {
        e.preventDefault();
        rightPanel.toggleCollapsed();
      } else if (isMod && e.key === '\\') {
        e.preventDefault();
        leftPanel.toggleCollapsed();
        rightPanel.toggleCollapsed();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDesktop, leftPanel.toggleCollapsed, rightPanel.toggleCollapsed]);

  const handleCreateObject = useCallback((obj: Partial<GameObject>) => {
    if (!obj.screenId || !obj.name || !obj.type) return;
    createObject.mutate({
      screenId: obj.screenId,
      name: obj.name,
      type: obj.type,
      x: obj.x ?? 0,
      y: obj.y ?? 0,
      width: obj.width ?? 100,
      height: obj.height ?? 100,
    }, {
      onSuccess: (newObj) => {
        setSelectedObjectIds([newObj.id]);
        toast({ title: "Object created", description: `Added ${newObj.name}` });
      }
    });
  }, [createObject]);

  const handleUpdateObject = useCallback((id: string, updates: Partial<GameObject>) => {
    updateObject.mutate({ id, ...updates });
  }, [updateObject]);

  const handleDeleteObject = useCallback((id: string) => {
    deleteObject.mutate(id, {
      onSuccess: () => {
        setSelectedObjectIds(prev => prev.filter(objId => objId !== id));
        toast({ title: "Object deleted" });
      }
    });
  }, [deleteObject]);

  const handleCreateScene = useCallback((name: string) => {
    if (!selectedScreenId) return;
    createSceneMutation.mutate({
      screenId: selectedScreenId,
      name,
      order: scenes.length,
    }, {
      onSuccess: (scene) => {
        setCurrentSceneId(scene.id);
        toast({ title: "Scene created", description: `Added ${scene.name}` });
      }
    });
  }, [createSceneMutation, selectedScreenId, scenes.length]);

  const handleUpdateScene = useCallback((id: string, updates: Partial<Scene>) => {
    updateSceneMutation.mutate({ id, ...updates });
  }, [updateSceneMutation]);

  const handleDeleteScene = useCallback((id: string) => {
    deleteSceneMutation.mutate(id, {
      onSuccess: () => {
        if (currentSceneId === id) setCurrentSceneId(null);
        toast({ title: "Scene deleted" });
      }
    });
  }, [deleteSceneMutation, currentSceneId]);

  const currentDefaultSceneId = useMemo(() => {
    return scenes.find(s => s.isDefault)?.id ?? null;
  }, [scenes]);

  const handleSetDefaultScene = useCallback((id: string) => {
    if (currentDefaultSceneId && currentDefaultSceneId !== id) {
      updateSceneMutation.mutate({ id: currentDefaultSceneId, isDefault: false });
    }
    if (currentDefaultSceneId !== id) {
      updateSceneMutation.mutate({ id, isDefault: true }, {
        onSuccess: () => toast({ title: "Default scene updated" })
      });
    }
  }, [updateSceneMutation, currentDefaultSceneId]);

  const handleCreateObjectState = useCallback(() => {
    if (!selectedObjectId || !currentSceneId) return;
    createObjectState.mutate({
      objectId: selectedObjectId,
      sceneId: currentSceneId,
    });
  }, [createObjectState, selectedObjectId, currentSceneId]);

  const handleUpdateObjectState = useCallback((updates: Partial<ObjectState>) => {
    const state = objectStates.find(s => s.objectId === selectedObjectId);
    if (state) {
      updateObjectState.mutate({ id: state.id, ...updates });
    }
  }, [updateObjectState, objectStates, selectedObjectId]);

  const handleCreateTrigger = useCallback((trigger: Partial<Trigger>) => {
    if (!trigger.sceneId || !trigger.type) return;
    createTrigger.mutate({
      sceneId: trigger.sceneId,
      type: trigger.type,
      objectId: trigger.objectId,
      targetSceneId: trigger.targetSceneId,
      delay: trigger.delay,
    }, {
      onSuccess: () => toast({ title: "Trigger created" })
    });
  }, [createTrigger]);

  const handleUpdateTrigger = useCallback((id: string, updates: Partial<Trigger>) => {
    updateTrigger.mutate({ id, ...updates } as Parameters<typeof updateTrigger.mutate>[0]);
  }, [updateTrigger]);

  const handleDeleteTrigger = useCallback((id: string) => {
    deleteTrigger.mutate(id, {
      onSuccess: () => toast({ title: "Trigger deleted" })
    });
  }, [deleteTrigger]);

  const handleTogglePreview = useCallback(() => {
    setIsPreviewMode(prev => !prev);
  }, []);

  const handleSelectScene = useCallback((id: string | null) => {
    setCurrentSceneId(id);
  }, []);

  const handleSyncLayers = useCallback(() => {
    if (!selectedScreen?.id || !selectedScreen?.figmaFrameId) return;
    toast({ title: "Syncing layers", description: "Fetching latest layers from Figma..." });
    syncLayers.mutate(selectedScreen.id, {
      onSuccess: (result) => {
        if (result.success) {
          toast({ 
            title: "Layers synced", 
            description: `Imported: ${result.layersImported}, Updated: ${result.layersUpdated}` 
          });
        } else {
          toast({ 
            title: "Sync failed", 
            description: result.errors.join(", "),
            variant: "destructive"
          });
        }
      },
      onError: (error) => {
        toast({ 
          title: "Sync error", 
          description: error.message,
          variant: "destructive"
        });
      }
    });
  }, [selectedScreen, syncLayers]);

  const handleProjectImported = useCallback((importedProjectId: string) => {
    setCurrentProjectId(importedProjectId);
    setSelectedScreenId(undefined);
    setSelectedObjectIds([]);
    setCurrentSceneId(null);
  }, []);

  // Multi-selection handler: supports shift-click to toggle selection
  const handleObjectSelected = useCallback((id: string | null, addToSelection?: boolean) => {
    if (id === null) {
      setSelectedObjectIds([]);
    } else if (addToSelection) {
      // Shift+click: toggle object in selection
      setSelectedObjectIds(prev => 
        prev.includes(id) 
          ? prev.filter(objId => objId !== id) 
          : [...prev, id]
      );
    } else {
      // Normal click: select only this object
      setSelectedObjectIds([id]);
    }
    if (id && isMobile) {
      setBottomSheetOpen(true);
    }
  }, [isMobile]);

  // Select all objects on current screen
  const handleSelectAll = useCallback(() => {
    setSelectedObjectIds(objects.map(obj => obj.id));
  }, [objects]);

  // Bulk selection handler for marquee selection
  const handleSelectMultiple = useCallback((ids: string[]) => {
    setSelectedObjectIds(ids);
  }, []);

  const handleIsolateObject = useCallback((id: string | null) => {
    setIsolatedObjectId(id);
    if (id) {
      setSelectedObjectIds([id]);
    }
  }, []);

  const handleCreateComponentFromSelection = useCallback(() => {
    if (selectedObjectIds.length !== 1 || !selectedObject) {
      toast({ 
        title: "Select one object", 
        description: "Select a single object to create a component",
        variant: "destructive"
      });
      return;
    }
    
    if (isObjectMasterComponent(selectedObject.id)) {
      toast({ 
        title: "Already a component", 
        description: "This object is already a master component",
        variant: "destructive"
      });
      return;
    }
    
    if (isObjectInstance(selectedObject)) {
      toast({ 
        title: "Cannot convert instance", 
        description: "Detach this instance first before converting to component",
        variant: "destructive"
      });
      return;
    }
    
    createComponent(selectedObject);
    toast({ 
      title: "Component created", 
      description: `${selectedObject.name} is now a master component`
    });
  }, [selectedObjectIds, selectedObject, isObjectMasterComponent, isObjectInstance, createComponent]);
  
  const handleInsertComponentInstance = useCallback((componentId: string) => {
    if (!selectedScreen) {
      toast({ 
        title: "No screen selected", 
        description: "Select a screen to insert an instance",
        variant: "destructive"
      });
      return;
    }
    
    const component = components.find(c => c.id === componentId);
    if (!component) return;
    
    const centerX = Math.round(selectedScreen.width / 2 - (component.template.width || 100) / 2);
    const centerY = Math.round(selectedScreen.height / 2 - (component.template.height || 100) / 2);
    
    createObject.mutate({
      screenId: selectedScreen.id,
      name: `${component.name} Instance`,
      type: component.template.type || 'shape',
      x: centerX,
      y: centerY,
      width: component.template.width || 100,
      height: component.template.height || 100,
    }, {
      onSuccess: (newObj) => {
        insertInstance(componentId, component.template, newObj.id);
        
        setSelectedObjectIds([newObj.id]);
        toast({ 
          title: "Instance inserted", 
          description: `Added instance of ${component.name}`
        });
      }
    });
  }, [selectedScreen, components, insertInstance, createObject]);
  
  const handleDetachInstance = useCallback(() => {
    if (!selectedObject || !isObjectInstance(selectedObject)) {
      toast({ 
        title: "Not an instance", 
        description: "Select an instance to detach",
        variant: "destructive"
      });
      return;
    }
    
    removeInstance(selectedObject.id);
    toast({ 
      title: "Instance detached", 
      description: `${selectedObject.name} is now independent`
    });
  }, [selectedObject, isObjectInstance, removeInstance]);
  
  const handleResetOverrides = useCallback(() => {
    if (!selectedObject) return;
    
    const component = getComponentForObject(selectedObject);
    if (!component) {
      toast({ 
        title: "Not an instance", 
        description: "Select an instance to reset overrides",
        variant: "destructive"
      });
      return;
    }
    
    resetOverride(selectedObject.id, null);
    
    handleUpdateObject(selectedObject.id, {
      width: component.template.width,
      height: component.template.height,
      opacity: component.template.opacity,
      rotation: component.template.rotation,
    });
    
    toast({ 
      title: "Overrides reset", 
      description: "Instance restored to master values"
    });
  }, [selectedObject, getComponentForObject, resetOverride, handleUpdateObject]);

  const handleInsertActivityItems = useCallback(async (items: NACAActivityItem[], activityId: string, communityId: string) => {
    if (!selectedScreenId) {
      toast({
        title: "No Screen Selected",
        description: "Please select a screen to insert items to.",
        variant: "destructive"
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "No Items",
        description: "There are no items to insert.",
        variant: "destructive"
      });
      return;
    }

    const columns = 3;
    const spacing = 20;
    const objectWidth = 200;
    const objectHeight = 100;
    let successCount = 0;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const x = 50 + (i % columns) * (objectWidth + spacing);
      const y = 50 + Math.floor(i / columns) * (objectHeight + spacing);

      const name = item.language || item.english || "Item";
      const dataKey = item.language || item.english || undefined;
      const mediaUrl = item.image ? nacaApi.getProxiedMediaUrl(item.image) : undefined;
      const audioUrl = item.audio ? nacaApi.getProxiedMediaUrl(item.audio) : undefined;

      try {
        await new Promise<void>((resolve, reject) => {
          createObject.mutate({
            screenId: selectedScreenId,
            name,
            type: "text",
            x,
            y,
            width: objectWidth,
            height: objectHeight,
            dataKey,
            mediaUrl,
            audioUrl,
          }, {
            onSuccess: () => {
              successCount++;
              resolve();
            },
            onError: (error) => {
              console.error(`Failed to create object for item ${item.id}:`, error);
              resolve();
            }
          });
        });
      } catch (err) {
        console.error(`Error creating object for item ${item.id}:`, err);
      }
    }

    toast({
      title: "Items Inserted",
      description: `Created ${successCount} object${successCount !== 1 ? 's' : ''} on the canvas.`
    });
  }, [selectedScreenId, createObject]);

  const [mobileSidebarTab, setMobileSidebarTab] = useState<'communities' | 'layers'>('communities');
  
  const SidebarContent = (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b border-sidebar-border shrink-0">
        <Tabs value={mobileSidebarTab} onValueChange={(v) => setMobileSidebarTab(v as 'communities' | 'layers')}>
          <TabsList className="w-full">
            <TabsTrigger value="communities" className="flex-1 gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              Communities
            </TabsTrigger>
            <TabsTrigger value="layers" className="flex-1 gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              Layers
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto">
        {mobileSidebarTab === 'communities' ? (
          <CommunitySidebar
            selectedCommunityId={selectedCommunityId}
            selectedActivityId={selectedActivityId}
            onSelectCommunity={(id) => {
              setSelectedCommunityId(id);
              setSelectedActivityId(undefined);
            }}
            onSelectActivity={(activityId, communityId) => {
              setSelectedCommunityId(communityId);
              setSelectedActivityId(activityId);
              toast({
                title: "Activity Selected",
                description: `Selected activity from community`
              });
            }}
          />
        ) : (
          <Sidebar 
            data={sidebarData} 
            selectedId={selectedObjectId || selectedScreenId} 
            isLoading={objectsLoading}
            onSelect={handleSidebarSelect}
            onToggleVisibility={handleToggleVisibility}
            onToggleLock={handleToggleLock}
          />
        )}
      </div>
      <SceneManager
        scenes={scenes}
        currentSceneId={currentSceneId}
        isLoading={scenesLoading}
        onSelectScene={handleSelectScene}
        onCreateScene={handleCreateScene}
        onUpdateScene={handleUpdateScene}
        onDeleteScene={handleDeleteScene}
        onSetDefault={handleSetDefaultScene}
      />
    </div>
  );

  const handleBindMedia = (file: NACAFolderNode, bindType: 'image' | 'audio', communityId: string) => {
    if (!selectedObjectId) {
      toast({ 
        title: "No object selected", 
        description: "Select an object first to bind media",
        variant: "destructive"
      });
      return;
    }

    const url = (file.metadata?.url as string) || 
                (file.metadata?.downloadUrl as string) || 
                nacaApi.getDropboxFileUrl(communityId, file.path);

    if (!url) {
      toast({ 
        title: "No URL available", 
        description: "This file doesn't have an accessible URL",
        variant: "destructive"
      });
      return;
    }

    if (bindType === 'image') {
      handleUpdateObject(selectedObjectId, { mediaUrl: url });
      toast({ 
        title: "Image bound", 
        description: `${file.name} bound as image to ${selectedObject?.name}`
      });
    } else {
      handleUpdateObject(selectedObjectId, { audioUrl: url });
      toast({ 
        title: "Audio bound", 
        description: `${file.name} bound as audio to ${selectedObject?.name}`
      });
    }
  };

  const panelGroups: PanelGroup[] = useMemo(() => [
    {
      id: "create",
      label: "Create",
      icon: Layers,
      tabs: [
        {
          id: "attributes",
          label: "Attributes",
          content: (
            <PaletteGroup className="flex-1 flex flex-col min-h-0 overflow-auto h-full">
              <CollapsiblePalette
                id="properties"
                title="Properties"
                icon={<Sliders className="w-4 h-4" />}
                isCollapsed={isSectionCollapsed("right", "properties")}
                onToggle={() => toggleSectionCollapsed("right", "properties")}
              >
                <div className="-mx-3 -my-2">
                  <AttributeEditor
                    selectedObject={selectedObject}
                    selectedObjects={selectedObjects}
                    selectedScreen={selectedScreen ? {
                      id: selectedScreen.id,
                      title: selectedScreen.title,
                      nacaActivityId: selectedScreen.nacaActivityId,
                      nacaCommunityId: selectedScreen.nacaCommunityId,
                    } : null}
                    currentScene={currentScene}
                    scenes={scenes}
                    objectState={selectedObjectState}
                    vocabulary={vocabulary}
                    onUpdateObject={(updates) => selectedObjectId && handleUpdateObject(selectedObjectId, updates)}
                    onUpdateObjectById={handleUpdateObject}
                    onUpdateState={handleUpdateObjectState}
                    onCreateState={handleCreateObjectState}
                  />
                </div>
              </CollapsiblePalette>
            </PaletteGroup>
          ),
        },
        {
          id: "triggers",
          label: "Triggers",
          content: (
            <TriggerEditor
              triggers={triggers}
              currentScene={currentScene}
              scenes={scenes}
              objects={objects}
              onCreateTrigger={handleCreateTrigger}
              onUpdateTrigger={handleUpdateTrigger}
              onDeleteTrigger={handleDeleteTrigger}
            />
          ),
        },
        {
          id: "history",
          label: "History",
          content: (
            <PaletteGroup className="flex-1 flex flex-col min-h-0 overflow-auto h-full p-0">
              <HistoryPanel />
              <VersionHistoryPanel
                checkpoints={versionHistory.checkpoints}
                lastSavedTimestamp={versionHistory.lastSavedTimestamp}
                onSaveCheckpoint={versionHistory.saveCheckpoint}
                onRestoreCheckpoint={versionHistory.restoreCheckpoint}
                onDeleteCheckpoint={versionHistory.deleteCheckpoint}
                getRelativeTime={versionHistory.getRelativeTime}
                formatTimestamp={versionHistory.formatTimestamp}
                checkpointCount={versionHistory.checkpointCount}
                maxCheckpoints={versionHistory.maxCheckpoints}
                disabled={!selectedScreenId || objects.length === 0}
              />
            </PaletteGroup>
          ),
        },
        {
          id: "components",
          label: "Components",
          content: (
            <ComponentsPanel
              components={components}
              onInsertInstance={handleInsertComponentInstance}
              onDeleteComponent={deleteComponent}
            />
          ),
        },
      ],
    },
    {
      id: "content",
      label: "Content",
      icon: BookOpen,
      tabs: [
        {
          id: "vocabulary",
          label: "Vocabulary",
          content: <VocabularyPanel projectId={currentProjectId} />,
        },
        {
          id: "media",
          label: "Media",
          content: (
            <ActivityFolderBrowser 
              selectedObjectId={selectedObjectId ?? undefined}
              onBindMedia={handleBindMedia}
            />
          ),
        },
      ],
    },
    {
      id: "community",
      label: "Community",
      icon: Globe,
      tabs: [
        {
          id: "browse",
          label: "Browse",
          content: (
            <CommunityExplorer 
              selectedObjectId={selectedObjectId ?? undefined}
              currentScreenId={selectedScreenId}
              currentScreen={selectedScreen ? {
                id: selectedScreen.id,
                title: selectedScreen.title,
                nacaActivityId: selectedScreen.nacaActivityId ?? undefined,
                nacaCommunityId: selectedScreen.nacaCommunityId ?? undefined
              } : undefined}
              onInsertActivityItems={handleInsertActivityItems}
              onAttachActivityToScreen={(activityId, communityId) => {
                if (!selectedScreenId) {
                  toast({
                    title: "No Screen Selected",
                    description: "Please select a screen to attach the activity to.",
                    variant: "destructive"
                  });
                  return;
                }
                updateScreen.mutate({
                  id: selectedScreenId,
                  data: {
                    nacaActivityId: activityId,
                    nacaCommunityId: communityId
                  }
                }, {
                  onSuccess: () => {
                    toast({
                      title: "Activity Attached",
                      description: `Activity has been attached to "${selectedScreen?.title}".`
                    });
                  },
                  onError: (error) => {
                    toast({
                      title: "Failed to Attach",
                      description: error instanceof Error ? error.message : "An error occurred.",
                      variant: "destructive"
                    });
                  }
                });
              }}
              onDetachActivityFromScreen={() => {
                if (!selectedScreenId) return;
                updateScreen.mutate({
                  id: selectedScreenId,
                  data: {
                    nacaActivityId: null,
                    nacaCommunityId: null
                  }
                }, {
                  onSuccess: () => {
                    toast({
                      title: "Activity Detached",
                      description: `Activity has been detached from "${selectedScreen?.title}".`
                    });
                  },
                  onError: (error) => {
                    toast({
                      title: "Failed to Detach",
                      description: error instanceof Error ? error.message : "An error occurred.",
                      variant: "destructive"
                    });
                  }
                });
              }}
              onSelectMedia={(media, communityId) => {
                if (selectedObject) {
                  handleUpdateObject(selectedObject.id, { 
                    mediaUrl: nacaApi.getProxiedMediaUrl(media.url) 
                  });
                  toast({
                    title: "Media Applied",
                    description: `Applied ${media.filename} to ${selectedObject.name}`
                  });
                }
              }}
              onSelectVocabulary={(entry, dictionary, communityId, bindingType) => {
                if (selectedObject) {
                  let updates: { dataKey?: string; mediaUrl?: string; audioUrl?: string } = {};
                  let description = '';
                  
                  switch (bindingType) {
                    case 'word':
                      updates = { dataKey: entry.indigenousWord || entry.word || '' };
                      description = `Bound word "${updates.dataKey}" to ${selectedObject.name}`;
                      break;
                    case 'translation':
                      updates = { dataKey: entry.englishTranslation || entry.translation || '' };
                      description = `Bound translation "${updates.dataKey}" to ${selectedObject.name}`;
                      break;
                    case 'image':
                      if (entry.imageUrl) {
                        updates = { mediaUrl: nacaApi.getProxiedMediaUrl(entry.imageUrl) };
                        description = `Bound image to ${selectedObject.name}`;
                      }
                      break;
                    case 'audio':
                      if (entry.audioUrl) {
                        updates = { audioUrl: nacaApi.getProxiedMediaUrl(entry.audioUrl) };
                        description = `Bound audio to ${selectedObject.name}`;
                      }
                      break;
                    case 'full':
                    default:
                      updates = { dataKey: `vocab:${entry.id}` };
                      description = `Bound vocabulary reference to ${selectedObject.name}`;
                      break;
                  }
                  
                  if (Object.keys(updates).length > 0) {
                    handleUpdateObject(selectedObject.id, updates);
                    toast({
                      title: "Vocabulary Bound",
                      description
                    });
                  }
                }
              }}
              onSelectActivity={(activity, communityId) => {
                toast({
                  title: "Activity Selected",
                  description: `Selected activity: ${activity.name}`
                });
              }}
            />
          ),
        },
        {
          id: "embeds",
          label: "Embeds",
          content: (
            <EmbedsExplorer 
              communityId={selectedScreen?.nacaCommunityId ?? undefined}
              onSelectEmbed={(embed, manifest) => {
                toast({
                  title: "Component Selected",
                  description: `Selected embeddable component: ${embed.name}`
                });
              }}
            />
          ),
        },
      ],
    },
    {
      id: "help",
      label: "Help",
      icon: HelpCircle,
      tabs: [
        {
          id: "tutorials",
          label: "Tutorials",
          content: <HelpPanel />,
        },
      ],
    },
  ], [
    selectedObject, currentScene, selectedObjectState, vocabulary, selectedObjectId,
    triggers, scenes, objects, currentProjectId, isSectionCollapsed, toggleSectionCollapsed,
    handleUpdateObject, handleUpdateObjectState, handleCreateObjectState,
    handleCreateTrigger, handleUpdateTrigger, handleDeleteTrigger, handleBindMedia,
    components, handleInsertComponentInstance, deleteComponent,
    versionHistory, selectedScreenId, selectedScreen, updateScreen, handleInsertActivityItems
  ]);

  const accordionGroups: AccordionGroup[] = useMemo(() => [
    {
      id: "properties",
      label: "Properties",
      sections: [
        {
          id: "attributes",
          title: "Attributes",
          icon: ACCORDION_ICONS.properties,
          defaultOpen: true,
          content: (
            <div className="-mx-3 -my-2">
              <AttributeEditor
                selectedObject={selectedObject}
                selectedObjects={selectedObjects}
                selectedScreen={selectedScreen ? {
                  id: selectedScreen.id,
                  title: selectedScreen.title,
                  nacaActivityId: selectedScreen.nacaActivityId,
                  nacaCommunityId: selectedScreen.nacaCommunityId,
                } : null}
                currentScene={currentScene}
                scenes={scenes}
                objectState={selectedObjectState}
                vocabulary={vocabulary}
                onUpdateObject={(updates) => selectedObjectId && handleUpdateObject(selectedObjectId, updates)}
                onUpdateObjectById={handleUpdateObject}
                onUpdateState={handleUpdateObjectState}
                onCreateState={handleCreateObjectState}
              />
            </div>
          ),
        },
        {
          id: "triggers",
          title: "Triggers",
          icon: ACCORDION_ICONS.triggers,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2">
              <TriggerEditor
                triggers={triggers}
                currentScene={currentScene}
                scenes={scenes}
                objects={objects}
                onCreateTrigger={handleCreateTrigger}
                onUpdateTrigger={handleUpdateTrigger}
                onDeleteTrigger={handleDeleteTrigger}
              />
            </div>
          ),
        },
        {
          id: "history",
          title: "History",
          icon: ACCORDION_ICONS.history,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2 flex flex-col gap-2">
              <HistoryPanel />
              <VersionHistoryPanel
                checkpoints={versionHistory.checkpoints}
                lastSavedTimestamp={versionHistory.lastSavedTimestamp}
                onSaveCheckpoint={versionHistory.saveCheckpoint}
                onRestoreCheckpoint={versionHistory.restoreCheckpoint}
                onDeleteCheckpoint={versionHistory.deleteCheckpoint}
                getRelativeTime={versionHistory.getRelativeTime}
                formatTimestamp={versionHistory.formatTimestamp}
                checkpointCount={versionHistory.checkpointCount}
                maxCheckpoints={versionHistory.maxCheckpoints}
                disabled={!selectedScreenId || objects.length === 0}
              />
            </div>
          ),
        },
      ],
    },
    {
      id: "create",
      label: "Create Content",
      sections: [
        {
          id: "components",
          title: "Components",
          icon: ACCORDION_ICONS.components,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2">
              <ComponentsPanel
                components={components}
                onInsertInstance={handleInsertComponentInstance}
                onDeleteComponent={deleteComponent}
              />
            </div>
          ),
        },
        {
          id: "vocabulary",
          title: "Vocabulary",
          icon: ACCORDION_ICONS.vocabulary,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2">
              <VocabularyPanel projectId={currentProjectId} />
            </div>
          ),
        },
        {
          id: "media",
          title: "Media Library",
          icon: ACCORDION_ICONS.media,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2">
              <ActivityFolderBrowser 
                selectedObjectId={selectedObjectId ?? undefined}
                onBindMedia={handleBindMedia}
              />
            </div>
          ),
        },
      ],
    },
    {
      id: "community",
      label: "Community",
      sections: [
        {
          id: "browse",
          title: "Browse Activities",
          icon: ACCORDION_ICONS.browse,
          defaultOpen: true,
          content: (
            <div className="-mx-3 -my-2">
              <CommunityExplorer 
                selectedObjectId={selectedObjectId ?? undefined}
                currentScreenId={selectedScreenId}
                currentScreen={selectedScreen ? {
                  id: selectedScreen.id,
                  title: selectedScreen.title,
                  nacaActivityId: selectedScreen.nacaActivityId ?? undefined,
                  nacaCommunityId: selectedScreen.nacaCommunityId ?? undefined
                } : undefined}
                onInsertActivityItems={handleInsertActivityItems}
                onAttachActivityToScreen={(activityId, communityId) => {
                  if (!selectedScreenId) {
                    toast({
                      title: "No Screen Selected",
                      description: "Please select a screen to attach the activity to.",
                      variant: "destructive"
                    });
                    return;
                  }
                  updateScreen.mutate({
                    id: selectedScreenId,
                    data: {
                      nacaActivityId: activityId,
                      nacaCommunityId: communityId
                    }
                  }, {
                    onSuccess: () => {
                      toast({
                        title: "Activity Attached",
                        description: `Activity has been attached to "${selectedScreen?.title}".`
                      });
                    },
                    onError: (error) => {
                      toast({
                        title: "Failed to Attach",
                        description: error instanceof Error ? error.message : "An error occurred.",
                        variant: "destructive"
                      });
                    }
                  });
                }}
                onDetachActivityFromScreen={() => {
                  if (!selectedScreenId) return;
                  updateScreen.mutate({
                    id: selectedScreenId,
                    data: {
                      nacaActivityId: null,
                      nacaCommunityId: null
                    }
                  }, {
                    onSuccess: () => {
                      toast({
                        title: "Activity Detached",
                        description: `Activity has been detached from "${selectedScreen?.title}".`
                      });
                    },
                    onError: (error) => {
                      toast({
                        title: "Failed to Detach",
                        description: error instanceof Error ? error.message : "An error occurred.",
                        variant: "destructive"
                      });
                    }
                  });
                }}
                onSelectMedia={(media, communityId) => {
                  if (selectedObject) {
                    handleUpdateObject(selectedObject.id, { 
                      mediaUrl: nacaApi.getProxiedMediaUrl(media.url) 
                    });
                    toast({
                      title: "Media Applied",
                      description: `Applied ${media.filename} to ${selectedObject.name}`
                    });
                  }
                }}
                onSelectVocabulary={(entry, dictionary, communityId, bindingType) => {
                  if (selectedObject) {
                    let updates: { dataKey?: string; mediaUrl?: string; audioUrl?: string } = {};
                    let description = '';
                    
                    switch (bindingType) {
                      case 'word':
                        updates = { dataKey: entry.indigenousWord || entry.word || '' };
                        description = `Bound word "${updates.dataKey}" to ${selectedObject.name}`;
                        break;
                      case 'translation':
                        updates = { dataKey: entry.englishTranslation || entry.translation || '' };
                        description = `Bound translation "${updates.dataKey}" to ${selectedObject.name}`;
                        break;
                      case 'image':
                        if (entry.imageUrl) {
                          updates = { mediaUrl: nacaApi.getProxiedMediaUrl(entry.imageUrl) };
                          description = `Bound image to ${selectedObject.name}`;
                        }
                        break;
                      case 'audio':
                        if (entry.audioUrl) {
                          updates = { audioUrl: nacaApi.getProxiedMediaUrl(entry.audioUrl) };
                          description = `Bound audio to ${selectedObject.name}`;
                        }
                        break;
                      case 'full':
                      default:
                        updates = { dataKey: `vocab:${entry.id}` };
                        description = `Bound vocabulary reference to ${selectedObject.name}`;
                        break;
                    }
                    
                    if (Object.keys(updates).length > 0) {
                      handleUpdateObject(selectedObject.id, updates);
                      toast({
                        title: "Vocabulary Bound",
                        description
                      });
                    }
                  }
                }}
                onSelectActivity={(activity, communityId) => {
                  toast({
                    title: "Activity Selected",
                    description: `Selected activity: ${activity.name}`
                  });
                }}
              />
            </div>
          ),
        },
        {
          id: "embeds",
          title: "Embeddable Components",
          icon: ACCORDION_ICONS.embeds,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2">
              <EmbedsExplorer 
                communityId={selectedScreen?.nacaCommunityId ?? undefined}
                onSelectEmbed={(embed, manifest) => {
                  toast({
                    title: "Component Selected",
                    description: `Selected embeddable component: ${embed.name}`
                  });
                }}
              />
            </div>
          ),
        },
      ],
    },
    {
      id: "help",
      label: "Help & Tutorials",
      sections: [
        {
          id: "getting-started",
          title: "Getting Started",
          icon: ACCORDION_ICONS.tutorials,
          defaultOpen: false,
          content: (
            <div className="-mx-3 -my-2">
              <HelpPanel />
            </div>
          ),
        },
      ],
    },
  ], [
    selectedObject, selectedObjects, currentScene, selectedObjectState, vocabulary, selectedObjectId,
    triggers, scenes, objects, currentProjectId,
    handleUpdateObject, handleUpdateObjectState, handleCreateObjectState,
    handleCreateTrigger, handleUpdateTrigger, handleDeleteTrigger, handleBindMedia,
    components, handleInsertComponentInstance, deleteComponent,
    versionHistory, selectedScreenId, selectedScreen, updateScreen, handleInsertActivityItems
  ]);

  const accordionCollapsedSections = useMemo(() => {
    const sections: Record<string, boolean> = {};
    accordionGroups.forEach(group => {
      group.sections.forEach(section => {
        sections[section.id] = isSectionCollapsed("right", section.id);
      });
    });
    return sections;
  }, [accordionGroups, isSectionCollapsed]);

  const handleAccordionToggle = useCallback((sectionId: string) => {
    toggleSectionCollapsed("right", sectionId);
  }, [toggleSectionCollapsed]);

  const RightPanelContent = (
    <RightPanelAccordion
      groups={accordionGroups}
      collapsedSections={accordionCollapsedSections}
      onToggleSection={handleAccordionToggle}
      className="h-full"
    />
  );

  const handlePanelWidthChange = (width: number) => {
    localStorage.setItem('rightPanelWidth', width.toString());
  };

  const handleSVGFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setSvgToExplore(content);
        setShowSVGExplorer(true);
      };
      reader.readAsText(file);
    }
  };

  const handleSVGImport = async (objects: SVGObject[], gradients: SVGGradient[]) => {
    if (!selectedScreen) {
      toast({
        title: "No Screen Selected",
        description: "Please select a screen before importing SVG objects.",
        variant: "destructive",
      });
      return;
    }

    try {
      const importResult = prepareSVGImport(objects, gradients);
      
      console.log('SVG Import prepared:', importResult.summary);
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const convertedObj of importResult.objects) {
        try {
          const { svgId, ...gameObjectData } = convertedObj;
          
          await new Promise<void>((resolve, reject) => {
            createObject.mutate({
              screenId: selectedScreen.id,
              ...gameObjectData,
            }, {
              onSuccess: () => {
                successCount++;
                resolve();
              },
              onError: (error) => {
                console.error(`Failed to create object ${convertedObj.name}:`, error);
                errorCount++;
                resolve();
              }
            });
          });
        } catch (err) {
          console.error(`Error creating object ${convertedObj.name}:`, err);
          errorCount++;
        }
      }
      
      setShowSVGExplorer(false);
      
      const typesSummary = Object.entries(importResult.summary.byType)
        .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
        .join(', ');
      
      if (errorCount === 0) {
        toast({
          title: "SVG Import Complete",
          description: `Successfully imported ${successCount} objects (${typesSummary})${importResult.summary.hasGradients ? ` with ${gradients.length} gradients` : ''}.`,
        });
      } else {
        toast({
          title: "SVG Import Partial",
          description: `Imported ${successCount} objects, ${errorCount} failed.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('SVG Import failed:', error);
      toast({
        title: "SVG Import Failed",
        description: "An error occurred while importing the SVG.",
        variant: "destructive",
      });
    }
  };

  if (screensLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground font-sans flex flex-col">
        <div className="h-12 border-b border-border flex items-center justify-between px-3 bg-card shrink-0 safe-area-inset-top">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target" data-testid="button-menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              {SidebarContent}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate max-w-[150px]">
              {selectedScreen?.title || "Indigamate Studio"}
            </span>
            {currentScene && (
              <span className="text-xs px-2 py-0.5 bg-primary/20 text-primary rounded">
                {currentScene.name}
              </span>
            )}
          </div>

          <Drawer open={bottomSheetOpen} onOpenChange={setBottomSheetOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-target" data-testid="button-panel">
                <PanelRight className="w-5 h-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[85vh]">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Properties</DrawerTitle>
              </DrawerHeader>
              <div className="flex-1 overflow-hidden">
                {RightPanelContent}
              </div>
            </DrawerContent>
          </Drawer>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          <GameCanvas
            screen={selectedScreen}
            objects={objects}
            scenes={scenes}
            currentScene={currentScene}
            objectStates={objectStates}
            selectedObjectId={selectedObjectId}
            selectedObjectIds={selectedObjectIds}
            isolatedObjectId={isolatedObjectId}
            isPreviewMode={isPreviewMode}
            isLoading={objectsLoading || scenesLoading}
            projectId={currentProjectId}
            vocabulary={vocabulary}
            onSelectObject={handleObjectSelected}
            onSelectMultiple={handleSelectMultiple}
            onSelectAll={handleSelectAll}
            onIsolateObject={handleIsolateObject}
            onUpdateObject={handleUpdateObject}
            onCreateObject={handleCreateObject}
            onDeleteObject={handleDeleteObject}
            onTogglePreview={handleTogglePreview}
            onSceneChange={setCurrentSceneId}
            onSyncLayers={handleSyncLayers}
            onProjectImported={handleProjectImported}
            viewportWidth={width}
            viewportHeight={height - 48}
            isMobile={isMobile}
            isTablet={isTablet}
            isObjectMasterComponent={isObjectMasterComponent}
            isObjectInstance={isObjectInstance}
            onCreateComponent={handleCreateComponentFromSelection}
            onDetachInstance={handleDetachInstance}
            onResetOverrides={handleResetOverrides}
          />
        </div>

        <Button
          className="floating-button bottom-20 right-4 w-14 h-14 bg-primary hover:bg-primary/90"
          onClick={() => {
            if (!selectedScreen) return;
            handleCreateObject({
              screenId: selectedScreen.id,
              name: `Object ${objects.length + 1}`,
              type: "shape",
              x: 50,
              y: 50,
              width: 100,
              height: 100,
            });
          }}
          data-testid="fab-add-object"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    );
  }

  if (isTablet) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-background text-foreground font-sans flex">
        <div className="w-[60px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 transition-sidebar">
          <div className="p-2 border-b border-sidebar-border flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-md flex items-center justify-center text-white font-bold text-xs shadow-sm">
              F
            </div>
          </div>

          <div className="flex-1 icon-sidebar overflow-y-auto">
            {screens.map((screen, index) => (
              <IconSidebarItem
                key={screen.id}
                icon={FileImage}
                label={screen.title}
                isActive={selectedScreenId === screen.id}
                onClick={() => {
                  setSelectedScreenId(screen.id);
                  setSelectedObjectIds([]);
                }}
              />
            ))}
          </div>

          <div className="p-2 border-t border-sidebar-border flex flex-col gap-1 items-center">
            <IconSidebarItem
              icon={Layers}
              label="Scenes"
              onClick={() => setSidebarOpen(true)}
            />
            <IconSidebarItem
              icon={Settings}
              label="Admin Tools"
              onClick={() => setShowAdminTools(true)}
            />
          </div>
        </div>

        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-[300px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Layers & Scenes</SheetTitle>
            </SheetHeader>
            {SidebarContent}
          </SheetContent>
        </Sheet>

        <div className="flex-1 min-w-0 flex flex-col">
          <GameCanvas
            screen={selectedScreen}
            objects={objects}
            scenes={scenes}
            currentScene={currentScene}
            objectStates={objectStates}
            selectedObjectId={selectedObjectId}
            selectedObjectIds={selectedObjectIds}
            isolatedObjectId={isolatedObjectId}
            isPreviewMode={isPreviewMode}
            isLoading={objectsLoading || scenesLoading}
            projectId={currentProjectId}
            vocabulary={vocabulary}
            onSelectObject={handleObjectSelected}
            onSelectMultiple={handleSelectMultiple}
            onSelectAll={handleSelectAll}
            onIsolateObject={handleIsolateObject}
            onUpdateObject={handleUpdateObject}
            onCreateObject={handleCreateObject}
            onDeleteObject={handleDeleteObject}
            onTogglePreview={handleTogglePreview}
            onSyncLayers={handleSyncLayers}
            onProjectImported={handleProjectImported}
            viewportWidth={width - 60}
            viewportHeight={height}
            isMobile={isMobile}
            isTablet={isTablet}
            isObjectMasterComponent={isObjectMasterComponent}
            isObjectInstance={isObjectInstance}
            onCreateComponent={handleCreateComponentFromSelection}
            onDetachInstance={handleDetachInstance}
            onResetOverrides={handleResetOverrides}
          />
        </div>

        <Sheet open={rightPanelOpen} onOpenChange={setRightPanelOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="secondary" 
              size="icon" 
              className="fixed right-0 top-1/2 -translate-y-1/2 rounded-l-lg rounded-r-none h-12 w-6 z-40"
              data-testid="button-toggle-panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] p-0">
            <SheetHeader className="sr-only">
              <SheetTitle>Properties</SheetTitle>
            </SheetHeader>
            {RightPanelContent}
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  const leftWidth = leftPanel.isCollapsed ? leftPanel.config.collapsedWidth : leftPanel.width;
  const rightWidth = rightPanel.isCollapsed ? rightPanel.config.collapsedWidth : rightPanel.width;
  const canvasWidth = Math.max(0, width - leftWidth - rightWidth);

  return (
    <HistoryProvider>
    <TimelineProvider>
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground font-sans flex">
      <ResizableDrawer
        side="left"
        width={leftPanel.width}
        minWidth={leftPanel.config.minWidth}
        maxWidth={leftPanel.config.maxWidth}
        collapsedWidth={leftPanel.config.collapsedWidth}
        isCollapsed={leftPanel.isCollapsed}
        onWidthChange={leftPanel.setWidth}
        onToggleCollapse={leftPanel.toggleCollapsed}
        title="Structure"
        className="bg-sidebar"
      >
        <PaletteGroup className="h-full flex flex-col" backgroundImage={activityBackgroundImage}>
          <CollapsiblePalette
            id="figma"
            title="Figma Connection"
            icon={<FileImage className="w-4 h-4" />}
            isCollapsed={isSectionCollapsed("left", "figma")}
            onToggle={() => toggleSectionCollapsed("left", "figma")}
          >
            <FigmaConnection 
              project={currentProject}
              onConnect={() => toast({ title: "Figma connected", description: "Use Update to import frames" })}
              onSync={() => toast({ title: "Sync initiated" })}
            />
          </CollapsiblePalette>

          <CollapsiblePalette
            id="communities"
            title="Communities"
            icon={<Globe className="w-4 h-4" />}
            isCollapsed={isSectionCollapsed("left", "communities")}
            onToggle={() => toggleSectionCollapsed("left", "communities")}
            badge={communityStats && (
              <span className="text-xs text-muted-foreground tabular-nums">
                {communityStats.count}
              </span>
            )}
          >
            <div className="max-h-[350px] overflow-y-auto -mx-3 -my-2">
              <CommunitySidebar
                selectedCommunityId={selectedCommunityId}
                selectedActivityId={selectedActivityId}
                onSelectCommunity={(id) => {
                  setSelectedCommunityId(id);
                  setSelectedActivityId(undefined);
                }}
                onSelectActivity={(activityId, communityId) => {
                  setSelectedCommunityId(communityId);
                  setSelectedActivityId(activityId);
                  toast({
                    title: "Activity Selected",
                    description: `Selected activity from community`
                  });
                }}
              />
            </div>
          </CollapsiblePalette>

          <CollapsiblePalette
            id="layers"
            title="Layers"
            icon={<FolderTree className="w-4 h-4" />}
            isCollapsed={isSectionCollapsed("left", "layers")}
            onToggle={() => toggleSectionCollapsed("left", "layers")}
            badge={<span className="text-xs text-muted-foreground">{objects.length}</span>}
          >
            <div className="max-h-[300px] overflow-y-auto -mx-3 -my-2">
              <Sidebar 
                data={sidebarData} 
                selectedId={selectedObjectId || selectedScreenId} 
                isLoading={objectsLoading}
                onSelect={handleSidebarSelect}
                onToggleVisibility={handleToggleVisibility}
                onToggleLock={handleToggleLock}
              />
            </div>
          </CollapsiblePalette>

          <CollapsiblePalette
            id="scenes"
            title="Scenes"
            icon={<Clapperboard className="w-4 h-4" />}
            isCollapsed={isSectionCollapsed("left", "scenes")}
            onToggle={() => toggleSectionCollapsed("left", "scenes")}
            badge={<span className="text-xs text-muted-foreground">{scenes.length}</span>}
          >
            <div className="-mx-3 -my-2">
              <SceneManager
                scenes={scenes}
                currentSceneId={currentSceneId}
                isLoading={scenesLoading}
                onSelectScene={handleSelectScene}
                onCreateScene={handleCreateScene}
                onUpdateScene={handleUpdateScene}
                onDeleteScene={handleDeleteScene}
                onSetDefault={handleSetDefaultScene}
              />
            </div>
          </CollapsiblePalette>

          <CollapsiblePalette
            id="utilities"
            title="Utilities"
            icon={<Wrench className="w-4 h-4" />}
            isCollapsed={isSectionCollapsed("left", "utilities")}
            onToggle={() => toggleSectionCollapsed("left", "utilities")}
            badge={
              <LastSavedIndicator 
                lastSavedTimestamp={versionHistory.lastSavedTimestamp} 
                getRelativeTime={versionHistory.getRelativeTime} 
              />
            }
          >
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">Quick Import</div>
              <div className="flex flex-wrap gap-2">
                {(Object.entries(IMPORT_SOURCE_CONFIG) as [ImportSourceType, typeof IMPORT_SOURCE_CONFIG[ImportSourceType]][]).map(([key, config]) => {
                  const IconComponent = config.icon;
                  return (
                    <Button
                      key={key}
                      variant="outline"
                      size="sm"
                      className="flex-1 min-w-[80px] gap-2 h-9"
                      onClick={() => {
                        setImportSourceType(key);
                        document.getElementById(`svg-file-input-${key}`)?.click();
                      }}
                      data-testid={`button-import-${key}`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="text-xs">{config.label}</span>
                    </Button>
                  );
                })}
              </div>
              {(Object.entries(IMPORT_SOURCE_CONFIG) as [ImportSourceType, typeof IMPORT_SOURCE_CONFIG[ImportSourceType]][]).map(([key, config]) => (
                <input
                  key={key}
                  id={`svg-file-input-${key}`}
                  type="file"
                  accept={config.fileAccept}
                  className="hidden"
                  onChange={(e) => {
                    setImportSourceType(key);
                    handleSVGFileUpload(e);
                  }}
                  data-testid={`input-svg-file-${key}`}
                />
              ))}
              <div className="text-xs text-muted-foreground pt-2">Settings</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-9"
                onClick={() => setShowAdminTools(true)}
                data-testid="button-admin-tools"
              >
                <Settings className="w-4 h-4" />
                <span className="text-xs">Admin Tools</span>
              </Button>
            </div>
          </CollapsiblePalette>
        </PaletteGroup>
      </ResizableDrawer>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 min-h-0 relative">
          {selectedScreen?.nacaCommunityId && (
            <CommunityContextBanner
              communityId={selectedScreen.nacaCommunityId}
              activityId={selectedScreen.nacaActivityId}
              screenTitle={selectedScreen.title}
              className="absolute top-3 left-3 z-20"
            />
          )}
          <GameCanvas
            screen={selectedScreen}
            objects={objects}
            scenes={scenes}
            currentScene={currentScene}
            objectStates={objectStates}
            selectedObjectId={selectedObjectId}
            selectedObjectIds={selectedObjectIds}
            isolatedObjectId={isolatedObjectId}
            isPreviewMode={isPreviewMode}
            isLoading={objectsLoading || scenesLoading}
            projectId={currentProjectId}
            vocabulary={vocabulary}
            activePreset={activePreset}
            onApplyPreset={applyPreset}
            onResetPanels={resetToDefaults}
            onSelectObject={handleObjectSelected}
            onSelectAll={handleSelectAll}
            onIsolateObject={handleIsolateObject}
            onUpdateObject={handleUpdateObject}
            onCreateObject={handleCreateObject}
            onDeleteObject={handleDeleteObject}
            onTogglePreview={handleTogglePreview}
            onSceneChange={setCurrentSceneId}
            onSyncLayers={handleSyncLayers}
            onProjectImported={handleProjectImported}
            viewportWidth={canvasWidth}
            viewportHeight={height - (isTimelineCollapsed ? 32 : timelineHeight)}
            isMobile={isMobile}
            isTablet={isTablet}
            isObjectMasterComponent={isObjectMasterComponent}
            isObjectInstance={isObjectInstance}
            onCreateComponent={handleCreateComponentFromSelection}
            onDetachInstance={handleDetachInstance}
            onResetOverrides={handleResetOverrides}
          />
        </div>

        <TimelinePanel
          objects={objects}
          selectedObjectId={selectedObjectId}
          sceneId={currentSceneId}
          onSelectObject={(id) => handleObjectSelected(id, false)}
          onUpdateObject={handleUpdateObject}
          height={timelineHeight}
          minHeight={100}
          maxHeight={Math.floor(height * 0.5)}
          isCollapsed={isTimelineCollapsed}
          onHeightChange={setTimelineHeight}
          onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
        />
      </div>

      <ResizableDrawer
        side="right"
        width={rightPanel.width}
        minWidth={rightPanel.config.minWidth}
        maxWidth={rightPanel.config.maxWidth}
        collapsedWidth={rightPanel.config.collapsedWidth}
        isCollapsed={rightPanel.isCollapsed}
        onWidthChange={handlePanelWidthChange}
        onToggleCollapse={rightPanel.toggleCollapsed}
        title="Properties"
        className="bg-card"
      >
        {RightPanelContent}
      </ResizableDrawer>

      <Dialog open={showHelpAdmin} onOpenChange={setShowHelpAdmin}>
        <DialogContent className="max-w-5xl h-[80vh]">
          <VisuallyHidden>
            <DialogTitle>Help Administration</DialogTitle>
            <DialogDescription>Manage help topics, videos, and view analytics</DialogDescription>
          </VisuallyHidden>
          <HelpAdminPanel />
        </DialogContent>
      </Dialog>

      <Dialog open={showSVGExplorer} onOpenChange={setShowSVGExplorer}>
        <DialogContent className="w-[min(1400px,95vw)] max-w-[95vw] h-[min(900px,85vh)] max-h-[85vh] p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>{IMPORT_SOURCE_CONFIG[importSourceType].dialogTitle}</DialogTitle>
            <DialogDescription>{IMPORT_SOURCE_CONFIG[importSourceType].dialogDescription}</DialogDescription>
          </VisuallyHidden>
          <SVGObjectExplorer 
            svgContent={svgToExplore}
            sourceType={importSourceType}
            onClose={() => setShowSVGExplorer(false)}
            onImport={handleSVGImport}
          />
        </DialogContent>
      </Dialog>

      <AdminToolsPanel
        open={showAdminTools}
        onOpenChange={setShowAdminTools}
        selectedCommunityId={selectedCommunityId}
      />
    </div>
    </TimelineProvider>
    </HistoryProvider>
  );
}