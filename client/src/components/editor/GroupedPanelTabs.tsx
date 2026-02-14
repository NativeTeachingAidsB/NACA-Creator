import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { 
  Layers, 
  Zap, 
  BookOpen, 
  Settings2,
  Globe,
  HelpCircle,
  Palette,
  Users
} from "lucide-react";

export interface PanelGroup {
  id: string;
  label: string;
  icon: React.ElementType;
  tabs: PanelTab[];
}

export interface PanelTab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface GroupedPanelTabsProps {
  groups: PanelGroup[];
  activeGroup: string;
  activeTab: string;
  onGroupChange: (group: string) => void;
  onTabChange: (tab: string) => void;
  className?: string;
}

export function GroupedPanelTabs({
  groups,
  activeGroup,
  activeTab,
  onGroupChange,
  onTabChange,
  className,
}: GroupedPanelTabsProps) {
  const currentGroup = groups.find(g => g.id === activeGroup) || groups[0];
  const currentTab = currentGroup?.tabs.find(t => t.id === activeTab) || currentGroup?.tabs[0];

  React.useEffect(() => {
    if (currentGroup && !currentGroup.tabs.find(t => t.id === activeTab)) {
      onTabChange(currentGroup.tabs[0]?.id || "");
    }
  }, [activeGroup, activeTab, currentGroup, onTabChange]);

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="border-b border-border bg-muted/30">
        <div className="flex items-center px-1 py-1 gap-0.5">
          {groups.map((group) => {
            const Icon = group.icon;
            const isActive = group.id === activeGroup;
            return (
              <button
                key={group.id}
                onClick={() => onGroupChange(group.id)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
                data-testid={`panel-group-${group.id}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{group.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {currentGroup && (
        <Tabs
          value={currentTab?.id || ""}
          onValueChange={onTabChange}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="border-b border-border px-2 pt-1">
            <TabsList className="w-full justify-start h-8 bg-transparent p-0">
              {currentGroup.tabs.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="text-xs px-3 h-7 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                  data-testid={`tab-${tab.id}`}
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {currentGroup.tabs.map((tab) => (
            <TabsContent
              key={tab.id}
              value={tab.id}
              className="flex-1 m-0 min-h-0 overflow-hidden"
            >
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}

export const PANEL_GROUP_ICONS = {
  create: Layers,
  animate: Zap,
  content: BookOpen,
  integrations: Settings2,
  community: Globe,
  help: HelpCircle,
  design: Palette,
  collaborate: Users,
};
