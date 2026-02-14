import React, { useEffect, useRef, useState } from "react";
import { 
  Trash2, Copy, ArrowUp, ArrowDown, ArrowUpToLine, ArrowDownToLine,
  Eye, EyeOff, Lock, Unlock, Edit3, RotateCcw, Clipboard, ClipboardPaste,
  FlipHorizontal, FlipVertical, Type, AlignLeft, AlignCenter, AlignRight,
  AlignStartVertical, AlignCenterVertical, AlignEndVertical,
  Zap, Database, ChevronRight, Pencil, Component, Unlink, RotateCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ObjectContextMenuProps {
  position: { x: number; y: number };
  objectName: string;
  isVisible: boolean;
  isLocked?: boolean;
  hasClipboard?: boolean;
  isMasterComponent?: boolean;
  isInstance?: boolean;
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onCopy?: () => void;
  onPaste?: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onBringToFront: () => void;
  onSendToBack: () => void;
  onToggleVisibility: () => void;
  onToggleLock?: () => void;
  onEditProperties: () => void;
  onResetTransform: () => void;
  onFlipHorizontal?: () => void;
  onFlipVertical?: () => void;
  onRename?: (newName: string) => void;
  onAlignLeft?: () => void;
  onAlignCenter?: () => void;
  onAlignRight?: () => void;
  onAlignTop?: () => void;
  onAlignMiddle?: () => void;
  onAlignBottom?: () => void;
  onAddTrigger?: () => void;
  onBindDataKey?: () => void;
  onCreateComponent?: () => void;
  onDetachInstance?: () => void;
  onResetOverrides?: () => void;
}

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick: () => void;
  destructive?: boolean;
  disabled?: boolean;
  hasSubmenu?: boolean;
}

function MenuItem({ icon, label, shortcut, onClick, destructive, disabled, hasSubmenu }: MenuItemProps) {
  return (
    <button
      className={cn(
        "w-full px-3 py-2 text-left text-sm hover:bg-accent rounded flex items-center gap-3 transition-colors",
        destructive && "text-destructive hover:text-destructive hover:bg-destructive/10",
        disabled && "opacity-50 pointer-events-none"
      )}
      onClick={onClick}
      disabled={disabled}
      data-testid={`context-menu-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
      <span className="flex-1">{label}</span>
      {shortcut && !hasSubmenu && (
        <span className="text-xs text-muted-foreground">{shortcut}</span>
      )}
      {hasSubmenu && (
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-border my-1" />;
}

interface SubmenuProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function Submenu({ label, icon, children }: SubmenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const submenuRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <div className="w-full px-3 py-2 text-left text-sm hover:bg-accent rounded flex items-center gap-3 transition-colors cursor-default">
        <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="w-3 h-3 text-muted-foreground" />
      </div>
      
      {isOpen && (
        <div 
          ref={submenuRef}
          className="absolute left-full top-0 ml-1 bg-popover border border-border rounded-lg shadow-xl p-1 min-w-[160px] z-50"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function ObjectContextMenu({
  position,
  objectName,
  isVisible,
  isLocked = false,
  hasClipboard = false,
  isMasterComponent = false,
  isInstance = false,
  onClose,
  onDelete,
  onDuplicate,
  onCopy,
  onPaste,
  onBringForward,
  onSendBackward,
  onBringToFront,
  onSendToBack,
  onToggleVisibility,
  onToggleLock,
  onEditProperties,
  onResetTransform,
  onFlipHorizontal,
  onFlipVertical,
  onRename,
  onAlignLeft,
  onAlignCenter,
  onAlignRight,
  onAlignTop,
  onAlignMiddle,
  onAlignBottom,
  onAddTrigger,
  onBindDataKey,
  onCreateComponent,
  onDetachInstance,
  onResetOverrides,
}: ObjectContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(objectName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isRenaming) {
          setIsRenaming(false);
          setRenameValue(objectName);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, isRenaming, objectName]);

  useEffect(() => {
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (rect.right > viewportWidth) {
        menuRef.current.style.left = `${position.x - rect.width}px`;
      }
      if (rect.bottom > viewportHeight) {
        menuRef.current.style.top = `${position.y - rect.height}px`;
      }
    }
  }, [position]);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const handleRenameSubmit = () => {
    if (renameValue.trim() && renameValue !== objectName && onRename) {
      onRename(renameValue.trim());
    }
    setIsRenaming(false);
    onClose();
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleRenameSubmit();
    }
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-popover border border-border rounded-lg shadow-xl p-1 min-w-[220px] animate-in fade-in-0 zoom-in-95 duration-100"
      style={{ left: position.x, top: position.y }}
      data-testid="object-context-menu"
    >
      {/* Header with object name or rename input */}
      <div className="px-3 py-2 border-b border-border mb-1">
        {isRenaming ? (
          <Input
            ref={inputRef}
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={handleRenameKeyDown}
            onBlur={handleRenameSubmit}
            className="h-6 text-xs"
            data-testid="context-menu-rename-input"
          />
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground truncate flex-1">
              {objectName}
            </span>
            {onRename && (
              <button
                onClick={() => setIsRenaming(true)}
                className="p-1 hover:bg-accent rounded ml-2"
                data-testid="context-menu-rename-button"
              >
                <Pencil className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <MenuItem
        icon={<Edit3 className="w-4 h-4" />}
        label="Edit Properties"
        onClick={() => { onEditProperties(); onClose(); }}
      />
      
      {onRename && (
        <MenuItem
          icon={<Type className="w-4 h-4" />}
          label="Rename"
          shortcut="F2"
          onClick={() => setIsRenaming(true)}
        />
      )}
      
      <MenuDivider />
      
      {/* Copy/Paste Section */}
      {onCopy && (
        <MenuItem
          icon={<Copy className="w-4 h-4" />}
          label="Copy"
          shortcut="⌘C"
          onClick={() => { onCopy(); onClose(); }}
        />
      )}
      
      {onPaste && (
        <MenuItem
          icon={<ClipboardPaste className="w-4 h-4" />}
          label="Paste"
          shortcut="⌘V"
          onClick={() => { onPaste(); onClose(); }}
          disabled={!hasClipboard}
        />
      )}
      
      <MenuItem
        icon={<Clipboard className="w-4 h-4" />}
        label="Duplicate"
        shortcut="⌘D"
        onClick={() => { onDuplicate(); onClose(); }}
      />
      
      <MenuDivider />
      
      {/* Transform Section */}
      {(onFlipHorizontal || onFlipVertical) && (
        <>
          <Submenu label="Transform" icon={<FlipHorizontal className="w-4 h-4" />}>
            {onFlipHorizontal && (
              <MenuItem
                icon={<FlipHorizontal className="w-4 h-4" />}
                label="Flip Horizontal"
                shortcut="⌘⇧H"
                onClick={() => { onFlipHorizontal(); onClose(); }}
              />
            )}
            {onFlipVertical && (
              <MenuItem
                icon={<FlipVertical className="w-4 h-4" />}
                label="Flip Vertical"
                shortcut="⌘⇧V"
                onClick={() => { onFlipVertical(); onClose(); }}
              />
            )}
            <MenuDivider />
            <MenuItem
              icon={<RotateCcw className="w-4 h-4" />}
              label="Reset Transform"
              onClick={() => { onResetTransform(); onClose(); }}
            />
          </Submenu>
          <MenuDivider />
        </>
      )}
      
      {/* Align Section */}
      {(onAlignLeft || onAlignCenter || onAlignRight) && (
        <>
          <Submenu label="Align to Canvas" icon={<AlignCenter className="w-4 h-4" />}>
            {onAlignLeft && (
              <MenuItem
                icon={<AlignLeft className="w-4 h-4" />}
                label="Align Left"
                onClick={() => { onAlignLeft(); onClose(); }}
              />
            )}
            {onAlignCenter && (
              <MenuItem
                icon={<AlignCenter className="w-4 h-4" />}
                label="Align Center"
                onClick={() => { onAlignCenter(); onClose(); }}
              />
            )}
            {onAlignRight && (
              <MenuItem
                icon={<AlignRight className="w-4 h-4" />}
                label="Align Right"
                onClick={() => { onAlignRight(); onClose(); }}
              />
            )}
            <MenuDivider />
            {onAlignTop && (
              <MenuItem
                icon={<AlignStartVertical className="w-4 h-4" />}
                label="Align Top"
                onClick={() => { onAlignTop(); onClose(); }}
              />
            )}
            {onAlignMiddle && (
              <MenuItem
                icon={<AlignCenterVertical className="w-4 h-4" />}
                label="Align Middle"
                onClick={() => { onAlignMiddle(); onClose(); }}
              />
            )}
            {onAlignBottom && (
              <MenuItem
                icon={<AlignEndVertical className="w-4 h-4" />}
                label="Align Bottom"
                onClick={() => { onAlignBottom(); onClose(); }}
              />
            )}
          </Submenu>
          <MenuDivider />
        </>
      )}
      
      {/* Layer Order Section */}
      <Submenu label="Arrange" icon={<ArrowUp className="w-4 h-4" />}>
        <MenuItem
          icon={<ArrowUpToLine className="w-4 h-4" />}
          label="Bring to Front"
          shortcut="⌘⇧]"
          onClick={() => { onBringToFront(); onClose(); }}
        />
        <MenuItem
          icon={<ArrowUp className="w-4 h-4" />}
          label="Bring Forward"
          shortcut="⌘]"
          onClick={() => { onBringForward(); onClose(); }}
        />
        <MenuItem
          icon={<ArrowDown className="w-4 h-4" />}
          label="Send Backward"
          shortcut="⌘["
          onClick={() => { onSendBackward(); onClose(); }}
        />
        <MenuItem
          icon={<ArrowDownToLine className="w-4 h-4" />}
          label="Send to Back"
          shortcut="⌘⇧["
          onClick={() => { onSendToBack(); onClose(); }}
        />
      </Submenu>
      
      <MenuDivider />
      
      {/* Visibility/Lock Section */}
      <MenuItem
        icon={isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        label={isVisible ? "Hide" : "Show"}
        onClick={() => { onToggleVisibility(); onClose(); }}
      />
      
      {onToggleLock && (
        <MenuItem
          icon={isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          label={isLocked ? "Unlock" : "Lock"}
          onClick={() => { onToggleLock(); onClose(); }}
        />
      )}
      
      {!(onFlipHorizontal || onFlipVertical) && (
        <MenuItem
          icon={<RotateCcw className="w-4 h-4" />}
          label="Reset Transform"
          onClick={() => { onResetTransform(); onClose(); }}
        />
      )}
      
      {/* Quick Actions Section */}
      {(onAddTrigger || onBindDataKey) && (
        <>
          <MenuDivider />
          <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Quick Actions
          </div>
          {onAddTrigger && (
            <MenuItem
              icon={<Zap className="w-4 h-4" />}
              label="Add Trigger"
              onClick={() => { onAddTrigger(); onClose(); }}
            />
          )}
          {onBindDataKey && (
            <MenuItem
              icon={<Database className="w-4 h-4" />}
              label="Bind Data Key"
              onClick={() => { onBindDataKey(); onClose(); }}
            />
          )}
        </>
      )}
      
      {/* Component Section */}
      {(onCreateComponent || onDetachInstance || onResetOverrides) && (
        <>
          <MenuDivider />
          <div className="px-3 py-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Components
          </div>
          {onCreateComponent && !isMasterComponent && !isInstance && (
            <MenuItem
              icon={<Component className="w-4 h-4" />}
              label="Create Component"
              shortcut="⌘⌥K"
              onClick={() => { onCreateComponent(); onClose(); }}
            />
          )}
          {isMasterComponent && (
            <div className="px-3 py-2 text-xs text-purple-500 flex items-center gap-2">
              <Component className="w-4 h-4" />
              <span>Master Component</span>
            </div>
          )}
          {isInstance && (
            <>
              <div className="px-3 py-2 text-xs text-blue-500 flex items-center gap-2">
                <Component className="w-4 h-4" />
                <span>Instance</span>
              </div>
              {onResetOverrides && (
                <MenuItem
                  icon={<RotateCw className="w-4 h-4" />}
                  label="Reset All Overrides"
                  onClick={() => { onResetOverrides(); onClose(); }}
                />
              )}
              {onDetachInstance && (
                <MenuItem
                  icon={<Unlink className="w-4 h-4" />}
                  label="Detach Instance"
                  onClick={() => { onDetachInstance(); onClose(); }}
                />
              )}
            </>
          )}
        </>
      )}
      
      <MenuDivider />
      
      <MenuItem
        icon={<Trash2 className="w-4 h-4" />}
        label="Delete"
        shortcut="⌫"
        onClick={() => { onDelete(); onClose(); }}
        destructive
      />
    </div>
  );
}
