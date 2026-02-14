import React from "react";
import { Component, Plus, Trash2, Edit2, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Component as ComponentType } from "@/hooks/use-components";

interface ComponentsPanelProps {
  components: ComponentType[];
  onInsertInstance: (componentId: string) => void;
  onDeleteComponent: (componentId: string) => void;
  onRenameComponent?: (componentId: string, name: string) => void;
}

export function ComponentsPanel({
  components,
  onInsertInstance,
  onDeleteComponent,
  onRenameComponent,
}: ComponentsPanelProps) {
  if (components.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Component className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-muted-foreground mb-1">
          No Components
        </p>
        <p className="text-xs text-muted-foreground/70">
          Right-click an object and select "Create Component" or press{" "}
          <kbd className="px-1 py-0.5 bg-muted rounded text-xs">⌘⌥K</kbd>
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Components ({components.length})
        </h3>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {components.map((component) => (
            <ComponentItem
              key={component.id}
              component={component}
              onInsert={() => onInsertInstance(component.id)}
              onDelete={() => onDeleteComponent(component.id)}
              onRename={onRenameComponent ? (name) => onRenameComponent(component.id, name) : undefined}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface ComponentItemProps {
  component: ComponentType;
  onInsert: () => void;
  onDelete: () => void;
  onRename?: (name: string) => void;
}

function ComponentItem({ component, onInsert, onDelete, onRename }: ComponentItemProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(component.name);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSubmitRename = () => {
    if (editName.trim() && editName !== component.name && onRename) {
      onRename(editName.trim());
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmitRename();
    } else if (e.key === "Escape") {
      setEditName(component.name);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={cn(
        "group flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors",
        "border border-transparent hover:border-purple-500/30"
      )}
      data-testid={`component-item-${component.id}`}
    >
      <div className="w-8 h-8 rounded bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/30">
        <Component className="w-4 h-4 text-purple-500" />
      </div>
      
      <div className="flex-1 min-w-0">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSubmitRename}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm font-medium border-b border-primary outline-none"
            data-testid={`component-rename-input-${component.id}`}
          />
        ) : (
          <p className="text-sm font-medium truncate">{component.name}</p>
        )}
        <p className="text-[10px] text-muted-foreground truncate">
          {component.template.type} • {Math.round(component.template.width)}×{Math.round(component.template.height)}
        </p>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={onInsert}
              data-testid={`component-insert-${component.id}`}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Insert Instance</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              data-testid={`component-menu-${component.id}`}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onInsert}>
              <Plus className="w-4 h-4 mr-2" />
              Insert Instance
            </DropdownMenuItem>
            {onRename && (
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Component
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
