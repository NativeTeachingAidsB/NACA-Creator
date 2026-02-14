import * as React from "react";
import { ChevronDown, ChevronRight, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  isDraggable?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
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
  isDraggable = false,
  dragHandleProps,
}: CollapsiblePaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  
  const isOpen = onToggle ? !isCollapsed : internalOpen;
  const handleToggle = onToggle ?? (() => setInternalOpen(!internalOpen));

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className={cn("border-b border-border last:border-b-0 bg-background", className)}
      data-testid={`palette-${id}`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
        {isDraggable && (
          <div 
            className="drag-handle cursor-grab active:cursor-grabbing mr-1 text-muted-foreground/50 hover:text-muted-foreground"
            data-testid={`palette-drag-handle-${id}`}
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
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

interface SortablePaletteItemProps {
  id: string;
  children: React.ReactNode;
}

function SortablePaletteItem({ id, children }: SortablePaletteItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative",
        isDragging && "shadow-lg ring-2 ring-primary/20 rounded-md"
      )}
      {...attributes}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          const dragHandleProps = {
            ...listeners,
            style: { touchAction: 'none' },
          };
          return React.cloneElement(child as React.ReactElement<any>, {
            isDraggable: true,
            dragHandleProps,
          });
        }
        return child;
      })}
    </div>
  );
}

export interface PaletteItem {
  id: string;
  content: React.ReactNode;
}

interface SortablePaletteGroupProps {
  items: PaletteItem[];
  onReorder: (items: PaletteItem[]) => void;
  className?: string;
}

export function SortablePaletteGroup({ 
  items, 
  onReorder, 
  className 
}: SortablePaletteGroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);
      
      const newItems = arrayMove(items, oldIndex, newIndex);
      onReorder(newItems);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={cn("flex flex-col", className)}>
          {items.map((item) => (
            <SortablePaletteItem key={item.id} id={item.id}>
              {item.content}
            </SortablePaletteItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

interface DraggableCollapsiblePaletteProps extends CollapsiblePaletteProps {
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement>;
}

export function DraggableCollapsiblePalette({
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
  isDraggable = true,
  dragHandleProps,
}: DraggableCollapsiblePaletteProps) {
  const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
  
  const isOpen = onToggle ? !isCollapsed : internalOpen;
  const handleToggle = onToggle ?? (() => setInternalOpen(!internalOpen));

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={handleToggle}
      className={cn("border-b border-border last:border-b-0 bg-background", className)}
      data-testid={`palette-${id}`}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-muted/30 hover:bg-muted/50 transition-colors">
        {isDraggable && (
          <div 
            className="drag-handle cursor-grab active:cursor-grabbing mr-1 text-muted-foreground/50 hover:text-muted-foreground"
            data-testid={`palette-drag-handle-${id}`}
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
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
  backgroundImage?: string;
}

export function PaletteGroup({ children, className, backgroundImage }: PaletteGroupProps) {
  return (
    <div 
      className={cn("flex flex-col relative", className)}
      style={backgroundImage ? {
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      } : undefined}
    >
      {backgroundImage && (
        <div className="absolute inset-0 bg-sidebar/90 backdrop-blur-sm" />
      )}
      <div className={cn("relative z-10 flex flex-col", backgroundImage ? "h-full" : "")}>
        {children}
      </div>
    </div>
  );
}
