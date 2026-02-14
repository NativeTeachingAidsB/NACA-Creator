import { useEffect, useCallback, useRef, useState } from "react";

export type ModifierKey = "ctrl" | "shift" | "alt" | "meta";

export interface ShortcutConfig {
  key: string;
  modifiers?: ModifierKey[];
  hold?: boolean;
  action: string;
  description: string;
  enabled?: boolean;
  preventDefault?: boolean;
}

export interface ShortcutHandler {
  action: string;
  handler: () => void;
  onRelease?: () => void;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: ShortcutConfig[];
  handlers: ShortcutHandler[];
  enabled?: boolean;
  ignoreInputs?: boolean;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

function normalizeKey(key: string): string {
  return key.toLowerCase();
}

function matchesModifiers(
  e: KeyboardEvent,
  modifiers: ModifierKey[] = []
): boolean {
  const ctrl = modifiers.includes("ctrl") || (isMac && modifiers.includes("meta"));
  const shift = modifiers.includes("shift");
  const alt = modifiers.includes("alt");
  const meta = !isMac && modifiers.includes("meta");

  const ctrlMatch = ctrl ? (e.ctrlKey || e.metaKey) : !(e.ctrlKey || e.metaKey);
  const shiftMatch = shift ? e.shiftKey : !e.shiftKey;
  const altMatch = alt ? e.altKey : !e.altKey;
  const metaMatch = meta ? e.metaKey : true;

  return ctrlMatch && shiftMatch && altMatch && metaMatch;
}

function isInputElement(element: Element | null): boolean {
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    (element as HTMLElement).isContentEditable
  );
}

export function useKeyboardShortcuts({
  shortcuts,
  handlers,
  enabled = true,
  ignoreInputs = true,
}: UseKeyboardShortcutsOptions) {
  const activeHolds = useRef<Set<string>>(new Set());
  const [isSpaceHeld, setIsSpaceHeld] = useState(false);
  const [isZHeld, setIsZHeld] = useState(false);
  const [isAltHeld, setIsAltHeld] = useState(false);

  const findHandler = useCallback(
    (action: string) => handlers.find((h) => h.action === action),
    [handlers]
  );

  const findShortcut = useCallback(
    (e: KeyboardEvent) => {
      const key = normalizeKey(e.key);
      return shortcuts.find(
        (s) =>
          s.enabled !== false &&
          normalizeKey(s.key) === key &&
          matchesModifiers(e, s.modifiers)
      );
    },
    [shortcuts]
  );

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (ignoreInputs && isInputElement(document.activeElement)) {
        return;
      }

      if (e.key === "Alt") {
        setIsAltHeld(true);
      }

      const shortcut = findShortcut(e);
      if (!shortcut) return;

      const handler = findHandler(shortcut.action);
      if (!handler) return;

      if (shortcut.preventDefault !== false) {
        e.preventDefault();
      }

      if (shortcut.hold) {
        if (!activeHolds.current.has(shortcut.action)) {
          activeHolds.current.add(shortcut.action);
          handler.handler();
          
          if (shortcut.key.toLowerCase() === " " || shortcut.key.toLowerCase() === "space") {
            setIsSpaceHeld(true);
          }
          if (shortcut.key.toLowerCase() === "z") {
            setIsZHeld(true);
          }
        }
      } else {
        handler.handler();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Alt") {
        setIsAltHeld(false);
      }

      const key = normalizeKey(e.key);
      
      shortcuts.forEach((shortcut) => {
        if (
          shortcut.hold &&
          normalizeKey(shortcut.key) === key &&
          activeHolds.current.has(shortcut.action)
        ) {
          activeHolds.current.delete(shortcut.action);
          const handler = findHandler(shortcut.action);
          if (handler?.onRelease) {
            handler.onRelease();
          }
          
          if (key === " " || key === "space") {
            setIsSpaceHeld(false);
          }
          if (key === "z") {
            setIsZHeld(false);
          }
        }
      });
    };

    const handleBlur = () => {
      activeHolds.current.forEach((action) => {
        const handler = findHandler(action);
        if (handler?.onRelease) {
          handler.onRelease();
        }
      });
      activeHolds.current.clear();
      setIsSpaceHeld(false);
      setIsZHeld(false);
      setIsAltHeld(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [enabled, ignoreInputs, shortcuts, handlers, findShortcut, findHandler]);

  return {
    isSpaceHeld,
    isZHeld,
    isAltHeld,
  };
}

export const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { key: " ", hold: true, action: "panMode", description: "Pan canvas (hold Spacebar)" },
  { key: "z", hold: true, action: "zoomMode", description: "Zoom tool (hold Z, drag up/down)" },
  { key: "v", action: "selectTool", description: "Selection tool" },
  { key: "a", action: "directSelectTool", description: "Direct Selection tool" },
  { key: "h", action: "handTool", description: "Hand tool" },
  { key: "Escape", action: "deselect", description: "Deselect / Exit mode" },
  { key: "Delete", action: "delete", description: "Delete selected object" },
  { key: "Backspace", action: "delete", description: "Delete selected object" },
  { key: "z", modifiers: ["ctrl"], action: "undo", description: "Undo" },
  { key: "z", modifiers: ["ctrl", "shift"], action: "redo", description: "Redo" },
  { key: "c", modifiers: ["ctrl"], action: "copy", description: "Copy object" },
  { key: "v", modifiers: ["ctrl"], action: "paste", description: "Paste object" },
  { key: "a", modifiers: ["ctrl"], action: "selectAll", description: "Select all objects" },
  { key: "d", modifiers: ["ctrl"], action: "duplicate", description: "Duplicate object" },
  { key: "]", modifiers: ["ctrl"], action: "bringForward", description: "Bring forward" },
  { key: "[", modifiers: ["ctrl"], action: "sendBackward", description: "Send backward" },
  { key: "]", modifiers: ["ctrl", "shift"], action: "bringToFront", description: "Bring to front" },
  { key: "[", modifiers: ["ctrl", "shift"], action: "sendToBack", description: "Send to back" },
  { key: "g", modifiers: ["ctrl"], action: "group", description: "Group objects" },
  { key: "g", modifiers: ["ctrl", "shift"], action: "ungroup", description: "Ungroup objects" },
  { key: "?", action: "showHelp", description: "Show keyboard shortcuts" },
  { key: "p", action: "togglePreview", description: "Toggle preview mode" },
  { key: "h", modifiers: ["ctrl", "shift"], action: "flipHorizontal", description: "Flip horizontal" },
  { key: "v", modifiers: ["ctrl", "shift"], action: "flipVertical", description: "Flip vertical" },
  { key: "+", modifiers: ["ctrl"], action: "zoomIn", description: "Zoom in (+25%)" },
  { key: "=", modifiers: ["ctrl"], action: "zoomIn", description: "Zoom in (+25%)" },
  { key: "-", modifiers: ["ctrl"], action: "zoomOut", description: "Zoom out (-25%)" },
  { key: "0", modifiers: ["ctrl"], action: "fitToScreen", description: "Fit to Screen" },
  { key: "1", modifiers: ["ctrl"], action: "zoomTo100", description: "Zoom to 100%" },
  { key: "2", modifiers: ["ctrl"], action: "zoomToSelection", description: "Zoom to Selection" },
  { key: "e", modifiers: ["ctrl"], action: "export", description: "Export canvas" },
  { key: "y", modifiers: ["ctrl"], action: "toggleOutlineMode", description: "Toggle outline/wireframe mode" },
  { key: "k", modifiers: ["ctrl", "alt"], action: "createComponent", description: "Create component from selection" },
];

export function getShortcutLabel(shortcut: ShortcutConfig): string {
  const modifierLabels: Record<ModifierKey, string> = {
    ctrl: isMac ? "⌘" : "Ctrl",
    shift: isMac ? "⇧" : "Shift",
    alt: isMac ? "⌥" : "Alt",
    meta: isMac ? "⌘" : "Win",
  };

  const parts: string[] = [];
  
  if (shortcut.modifiers) {
    shortcut.modifiers.forEach((mod) => {
      parts.push(modifierLabels[mod]);
    });
  }

  let keyLabel = shortcut.key;
  if (keyLabel === " ") keyLabel = "Space";
  if (keyLabel.length === 1) keyLabel = keyLabel.toUpperCase();
  parts.push(keyLabel);

  return parts.join(isMac ? "" : "+");
}
