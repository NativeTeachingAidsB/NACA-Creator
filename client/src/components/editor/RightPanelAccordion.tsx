import * as React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CollapsiblePalette, PaletteGroup } from "@/components/ui/collapsible-palette";
import { cn } from "@/lib/utils";
import {
  Sliders,
  Zap,
  Clock,
  Component,
  BookOpen,
  Image,
  Globe,
  Code2,
  HelpCircle,
  BookMarked
} from "lucide-react";

export interface AccordionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export interface AccordionGroup {
  id: string;
  label: string;
  sections: AccordionSection[];
}

interface RightPanelAccordionProps {
  groups: AccordionGroup[];
  collapsedSections: Record<string, boolean>;
  onToggleSection: (sectionId: string) => void;
  className?: string;
}

export function RightPanelAccordion({
  groups,
  collapsedSections,
  onToggleSection,
  className,
}: RightPanelAccordionProps) {
  return (
    <div className={cn("flex flex-col h-full", className)}>
      <ScrollArea className="flex-1">
        <PaletteGroup>
          {groups.map((group) => (
            <div key={group.id} className="border-b border-border last:border-b-0">
              <div className="px-3 py-1.5 bg-muted/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              {group.sections.map((section) => (
                <CollapsiblePalette
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  icon={section.icon}
                  isCollapsed={collapsedSections[section.id] ?? !section.defaultOpen}
                  onToggle={() => onToggleSection(section.id)}
                  defaultOpen={section.defaultOpen}
                  badge={section.badge}
                  actions={section.actions}
                >
                  {section.content}
                </CollapsiblePalette>
              ))}
            </div>
          ))}
        </PaletteGroup>
      </ScrollArea>
    </div>
  );
}

export const ACCORDION_ICONS = {
  properties: <Sliders className="w-4 h-4" />,
  triggers: <Zap className="w-4 h-4" />,
  history: <Clock className="w-4 h-4" />,
  components: <Component className="w-4 h-4" />,
  vocabulary: <BookOpen className="w-4 h-4" />,
  media: <Image className="w-4 h-4" />,
  browse: <Globe className="w-4 h-4" />,
  embeds: <Code2 className="w-4 h-4" />,
  tutorials: <BookMarked className="w-4 h-4" />,
  help: <HelpCircle className="w-4 h-4" />,
};
