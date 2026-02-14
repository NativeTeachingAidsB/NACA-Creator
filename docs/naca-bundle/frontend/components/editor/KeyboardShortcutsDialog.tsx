import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DEFAULT_SHORTCUTS, getShortcutLabel } from "@/hooks/use-keyboard-shortcuts";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcutCategories = [
  {
    title: "Canvas Navigation",
    shortcuts: ["panMode", "zoomMode", "zoomIn", "zoomOut", "resetZoom"],
  },
  {
    title: "Tools",
    shortcuts: ["selectTool", "directSelectTool", "handTool"],
  },
  {
    title: "Selection",
    shortcuts: ["deselect", "selectAll", "delete"],
  },
  {
    title: "Edit",
    shortcuts: ["undo", "redo", "duplicate"],
  },
  {
    title: "Layer Order",
    shortcuts: ["bringForward", "sendBackward", "bringToFront", "sendToBack"],
  },
  {
    title: "Grouping",
    shortcuts: ["group", "ungroup"],
  },
  {
    title: "View",
    shortcuts: ["togglePreview", "toggleOutlineMode", "showHelp"],
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="dialog-keyboard-shortcuts">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 pr-4">
            {shortcutCategories.map((category, idx) => (
              <div key={category.title}>
                {idx > 0 && <Separator className="mb-4" />}
                <h4 className="font-medium text-sm mb-2 text-muted-foreground">
                  {category.title}
                </h4>
                <div className="space-y-1">
                  {category.shortcuts.map((action) => {
                    const shortcut = DEFAULT_SHORTCUTS.find((s) => s.action === action);
                    if (!shortcut) return null;
                    return (
                      <div
                        key={action}
                        className="flex justify-between items-center py-1"
                        data-testid={`shortcut-${action}`}
                      >
                        <span className="text-sm">{shortcut.description}</span>
                        <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                          {getShortcutLabel(shortcut)}
                        </kbd>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>Tip:</strong> Hold <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Space</kbd> to temporarily switch to pan mode.
              </p>
              <p>
                Hold <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Alt</kbd> while dragging to duplicate objects.
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
