import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

interface CollapsiblePaletteProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isCollapsed?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function CollapsiblePalette({
  id,
  title,
  icon,
  isCollapsed = false,
  onToggle,
  defaultOpen = true,
  badge,
  actions,
  children,
  className,
}: CollapsiblePaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  
  const isOpen = onToggle ? !isCollapsed : internalOpen;
  const handleToggle = onToggle ?? (() => setInternalOpen(!internalOpen));

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className={cn("border-b border-border last:border-b-0", className)}
      data-testid={`palette-${id}`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 justify-start gap-2 h-7 px-1 font-medium text-sm hover:bg-transparent"
            data-testid={`palette-toggle-${id}`}
          >
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            )}
            {icon && <span className="text-muted-foreground">{icon}</span>}
            <span className="truncate">{title}</span>
            {badge && <span className="ml-auto">{badge}</span>}
          </Button>
        </CollapsibleTrigger>
        {actions && (
          <div className="flex items-center gap-1 ml-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
        <div className="px-3 py-2">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface PaletteGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function PaletteGroup({ children, className }: PaletteGroupProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {children}
    </div>
  );
}
