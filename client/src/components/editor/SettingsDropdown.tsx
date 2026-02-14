import * as React from "react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Video, Eye, Keyboard, Volume2, Minimize2, Maximize2, PanelLeftClose, Server, Cloud, Lock, Globe, Check } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserSettings, NacaEnvironment, NACA_SERVERS } from "@/hooks/use-user-settings";
import { WorkspacePreset, WORKSPACE_PRESETS } from "@/hooks/use-panel-state";
import { nacaApi } from "@/lib/naca-api";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { nacaKeys } from "@/hooks/use-naca";

interface SettingsDropdownProps {
  buttonClassName?: string;
  iconClassName?: string;
  activePreset?: WorkspacePreset | null;
  onApplyPreset?: (preset: WorkspacePreset) => void;
  onResetPanels?: () => void;
}

const presetIcons: Record<WorkspacePreset, React.ReactNode> = {
  minimal: <Minimize2 className="w-4 h-4 mr-2" />,
  balanced: <PanelLeftClose className="w-4 h-4 mr-2" />,
  full: <Maximize2 className="w-4 h-4 mr-2" />,
};

export function SettingsDropdown({ 
  buttonClassName, 
  iconClassName,
  activePreset,
  onApplyPreset,
  onResetPanels,
}: SettingsDropdownProps) {
  const { settings, updateSettings, resetSettings } = useUserSettings();
  const queryClient = useQueryClient();
  const [subdomainInput, setSubdomainInput] = useState(settings.nacaSubdomain || '');
  const [isSubdomainSaving, setIsSubdomainSaving] = useState(false);
  
  const { data: nacaConfig } = useQuery({
    queryKey: ['/api/naca-proxy/config'],
    queryFn: async () => {
      const response = await fetch('/api/naca-proxy/config');
      if (!response.ok) throw new Error('Failed to fetch NACA config');
      return response.json() as Promise<{ 
        baseUrl: string; 
        subdomain: string; 
        envLocked: boolean;
        availableServers: Record<string, string>;
      }>;
    },
    staleTime: 60000,
  });
  
  const isNacaEnvLocked = nacaConfig?.envLocked ?? false;
  
  const handleSubdomainSave = async () => {
    setIsSubdomainSaving(true);
    try {
      updateSettings({ nacaSubdomain: subdomainInput });
      await nacaApi.setSubdomain(subdomainInput);
      queryClient.invalidateQueries({ queryKey: nacaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['/api/naca-proxy/config'] });
    } finally {
      setIsSubdomainSaving(false);
    }
  };

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("touch-target", buttonClassName)}
              data-testid="button-settings"
            >
              <Settings className={cn("w-3 h-3", iconClassName)} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent align="end" className="w-56" data-testid="settings-menu">
        <DropdownMenuLabel>Workspace Layout</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {onApplyPreset && (
          <DropdownMenuRadioGroup 
            value={activePreset || ''} 
            onValueChange={(value) => onApplyPreset(value as WorkspacePreset)}
          >
            {(Object.keys(WORKSPACE_PRESETS) as WorkspacePreset[]).map((key) => (
              <DropdownMenuRadioItem
                key={key}
                value={key}
                className="flex items-center"
                data-testid={`preset-${key}`}
              >
                {presetIcons[key]}
                <div className="flex flex-col">
                  <span>{WORKSPACE_PRESETS[key].label}</span>
                  <span className="text-xs text-muted-foreground">
                    {WORKSPACE_PRESETS[key].description}
                  </span>
                </div>
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Help & Tutorials</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={settings.videoHelpEnabled}
          onCheckedChange={(checked) => updateSettings({ videoHelpEnabled: checked })}
          data-testid="setting-video-help"
        >
          <Video className="w-4 h-4 mr-2" />
          Video Tutorials
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.showHelpTooltips}
          onCheckedChange={(checked) => updateSettings({ showHelpTooltips: checked })}
          data-testid="setting-help-tooltips"
        >
          <Eye className="w-4 h-4 mr-2" />
          Help Tooltips
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.autoPlayVideos}
          onCheckedChange={(checked) => updateSettings({ autoPlayVideos: checked })}
          disabled={!settings.videoHelpEnabled}
          data-testid="setting-autoplay"
        >
          <Volume2 className="w-4 h-4 mr-2" />
          Auto-play Videos
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuCheckboxItem
          checked={settings.showShortcutHints}
          onCheckedChange={(checked) => updateSettings({ showShortcutHints: checked })}
          data-testid="setting-shortcut-hints"
        >
          <Keyboard className="w-4 h-4 mr-2" />
          Shortcut Hints
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          NACA Server
          {isNacaEnvLocked && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="w-3 h-3 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>Server is locked by environment configuration</TooltipContent>
            </Tooltip>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuRadioGroup 
          value={settings.nacaEnvironment} 
          onValueChange={async (value) => {
            if (isNacaEnvLocked) return;
            const env = value as NacaEnvironment;
            updateSettings({ nacaEnvironment: env, nacaSubdomain: '' });
            setSubdomainInput('');
            await nacaApi.setBaseUrl(NACA_SERVERS[env].url);
            queryClient.invalidateQueries({ queryKey: nacaKeys.all });
            queryClient.invalidateQueries({ queryKey: ['/api/naca-proxy/config'] });
          }}
        >
          <DropdownMenuRadioItem
            value="development"
            className="flex items-center"
            data-testid="naca-env-development"
            disabled={isNacaEnvLocked}
          >
            <Server className="w-4 h-4 mr-2" />
            <div className="flex flex-col">
              <span>{NACA_SERVERS.development.label}</span>
              <span className="text-xs text-muted-foreground">
                {NACA_SERVERS.development.description}
              </span>
            </div>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="production"
            className="flex items-center"
            data-testid="naca-env-production"
            disabled={isNacaEnvLocked}
          >
            <Cloud className="w-4 h-4 mr-2" />
            <div className="flex flex-col">
              <span>{NACA_SERVERS.production.label}</span>
              <span className="text-xs text-muted-foreground">
                {NACA_SERVERS.production.description}
              </span>
            </div>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="flex items-center gap-2">
          <Globe className="w-3 h-3" />
          Community Subdomain
        </DropdownMenuLabel>
        
        <div className="px-2 py-1.5">
          <div className="flex gap-1">
            <Input
              placeholder="e.g. the-piegan-institute"
              value={subdomainInput}
              onChange={(e) => setSubdomainInput(e.target.value)}
              className="h-7 text-xs"
              data-testid="input-naca-subdomain"
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') {
                  handleSubdomainSave();
                }
              }}
            />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0"
              onClick={handleSubdomainSave}
              disabled={isSubdomainSaving}
              data-testid="button-save-subdomain"
            >
              <Check className="w-3 h-3" />
            </Button>
          </div>
          {nacaConfig?.subdomain && (
            <p className="text-xs text-muted-foreground mt-1">
              Current: {nacaConfig.subdomain || '(auto from URL)'}
            </p>
          )}
        </div>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={() => {
            resetSettings();
            onResetPanels?.();
          }}
          data-testid="button-reset-settings"
        >
          Reset All to Defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
