import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, Check, X, Palette } from "lucide-react";
import type { DesignToken } from "@/hooks/use-design-tokens";

interface StylesPanelProps {
  tokens: DesignToken[];
  onAddToken: (name: string, value: string) => void;
  onUpdateToken: (id: string, updates: Partial<{ name: string; value: string }>) => void;
  onDeleteToken: (id: string) => void;
}

export function StylesPanel({
  tokens,
  onAddToken,
  onUpdateToken,
  onDeleteToken,
}: StylesPanelProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newTokenName, setNewTokenName] = useState("");
  const [newTokenColor, setNewTokenColor] = useState("#3b82f6");
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const handleAddToken = () => {
    if (newTokenName.trim()) {
      onAddToken(newTokenName.trim(), newTokenColor);
      setNewTokenName("");
      setNewTokenColor("#3b82f6");
      setIsAddingNew(false);
    }
  };

  const handleStartEdit = (token: DesignToken) => {
    setEditingTokenId(token.id);
    setEditName(token.name);
    setEditColor(token.value);
  };

  const handleSaveEdit = () => {
    if (editingTokenId && editName.trim()) {
      onUpdateToken(editingTokenId, { name: editName.trim(), value: editColor });
      setEditingTokenId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingTokenId(null);
    setEditName("");
    setEditColor("");
  };

  const colorTokens = tokens.filter(t => t.type === 'color');

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-xs font-bold uppercase text-muted-foreground">Design Tokens</h3>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setIsAddingNew(true)}
              data-testid="button-add-token"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add new color token</TooltipContent>
        </Tooltip>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {isAddingNew && (
            <div className="p-3 bg-muted/30 rounded-lg border border-border space-y-3" data-testid="new-token-form">
              <div className="space-y-2">
                <Label className="text-xs">Token Name</Label>
                <Input
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="e.g., Primary"
                  className="h-8 text-xs"
                  autoFocus
                  data-testid="input-new-token-name"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Color</Label>
                <div className="flex gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        className="w-8 h-8 rounded border border-border flex-shrink-0 cursor-pointer hover:ring-2 ring-ring"
                        style={{ backgroundColor: newTokenColor }}
                        data-testid="button-new-token-color-swatch"
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3" align="start">
                      <input
                        type="color"
                        value={newTokenColor}
                        onChange={(e) => setNewTokenColor(e.target.value)}
                        className="w-32 h-32 cursor-pointer"
                        data-testid="input-new-token-color-picker"
                      />
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={newTokenColor}
                    onChange={(e) => setNewTokenColor(e.target.value)}
                    className="h-8 text-xs font-mono flex-1"
                    data-testid="input-new-token-color-hex"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="flex-1 h-7"
                  onClick={handleAddToken}
                  disabled={!newTokenName.trim()}
                  data-testid="button-save-new-token"
                >
                  <Check className="w-3 h-3 mr-1" />
                  Add
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7"
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewTokenName("");
                    setNewTokenColor("#3b82f6");
                  }}
                  data-testid="button-cancel-new-token"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {colorTokens.length === 0 && !isAddingNew && (
            <div className="text-center py-8 text-muted-foreground" data-testid="empty-tokens-message">
              <Palette className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No color tokens defined</p>
              <p className="text-xs mt-1">Click + to add your first token</p>
            </div>
          )}

          {colorTokens.map((token) => (
            <div
              key={token.id}
              className="group relative p-3 bg-muted/20 rounded-lg border border-border hover:border-ring transition-colors"
              data-testid={`token-item-${token.id}`}
            >
              {editingTokenId === token.id ? (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Token Name</Label>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8 text-xs"
                      autoFocus
                      data-testid={`input-edit-token-name-${token.id}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Color</Label>
                    <div className="flex gap-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            className="w-8 h-8 rounded border border-border flex-shrink-0 cursor-pointer hover:ring-2 ring-ring"
                            style={{ backgroundColor: editColor }}
                            data-testid={`button-edit-token-color-swatch-${token.id}`}
                          />
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3" align="start">
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-32 h-32 cursor-pointer"
                            data-testid={`input-edit-token-color-picker-${token.id}`}
                          />
                        </PopoverContent>
                      </Popover>
                      <Input
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="h-8 text-xs font-mono flex-1"
                        data-testid={`input-edit-token-color-hex-${token.id}`}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      className="flex-1 h-7"
                      onClick={handleSaveEdit}
                      disabled={!editName.trim()}
                      data-testid={`button-save-edit-token-${token.id}`}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7"
                      onClick={handleCancelEdit}
                      data-testid={`button-cancel-edit-token-${token.id}`}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg border border-border flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: token.value }}
                    data-testid={`token-swatch-${token.id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" data-testid={`token-name-${token.id}`}>
                      {token.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono" data-testid={`token-value-${token.id}`}>
                      {token.value}
                    </p>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleStartEdit(token)}
                          data-testid={`button-edit-token-${token.id}`}
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit token</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={() => onDeleteToken(token.id)}
                          data-testid={`button-delete-token-${token.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete token</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
