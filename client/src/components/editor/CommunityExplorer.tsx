import { useState, useCallback, useMemo, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AvatarThrobber, InlineThrobber } from "@/components/ui/avatar-throbber";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Folder, 
  FolderOpen,
  FileImage, 
  FileAudio, 
  FileVideo,
  FileText,
  ChevronRight, 
  ChevronDown,
  RefreshCw,
  Search,
  Globe,
  AlertCircle,
  Gamepad2,
  Book,
  Image,
  Music,
  Film,
  Play,
  ArrowLeft,
  Volume2,
  VolumeX,
  X,
  Check,
  Settings,
  Server,
  Cloud,
  Lock,
  Key,
  Eye,
  EyeOff,
  Link,
  Type,
  Languages,
  ImageIcon,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nacaApi, type NACAFolderNode, type NACACommunity, type NACADictionary, type NACADictionaryEntry, type NACAMediaFile, type NACAActivity, type NACAActivityDetails, type NACAActivityItem } from "@/lib/naca-api";
import { useNacaCommunities, useNacaActivities, useNacaSearchMedia, useNacaDictionaries, useNacaDictionaryEntries, useNacaActivityDetails, useNacaActivityItems, nacaKeys } from "@/hooks/use-naca";
import { useToast } from "@/hooks/use-toast";
import { useUserSettings, NacaEnvironment, NACA_SERVERS } from "@/hooks/use-user-settings";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";

export type VocabularyBindingType = 'word' | 'translation' | 'image' | 'audio' | 'full';

interface CommunityExplorerProps {
  onSelectMedia?: (media: NACAMediaFile, communityId: string) => void;
  onSelectVocabulary?: (entry: NACADictionaryEntry, dictionary: NACADictionary, communityId: string, bindingType?: VocabularyBindingType) => void;
  onSelectActivity?: (activity: NACAActivity, communityId: string) => void;
  onInsertActivityItems?: (items: NACAActivityItem[], activityId: string, communityId: string) => void;
  selectedObjectId?: string;
  currentScreenId?: string;
  currentScreen?: { id: string; title: string; nacaActivityId?: string; nacaCommunityId?: string };
  onAttachActivityToScreen?: (activityId: string, communityId: string) => void;
  onDetachActivityFromScreen?: () => void;
}

type TabValue = 'communities' | 'activities' | 'dictionaries' | 'media';

export function CommunityExplorer({ 
  onSelectMedia, 
  onSelectVocabulary,
  onSelectActivity,
  onInsertActivityItems,
  selectedObjectId,
  currentScreenId,
  currentScreen,
  onAttachActivityToScreen,
  onDetachActivityFromScreen
}: CommunityExplorerProps) {
  const { toast } = useToast();
  
  const [selectedCommunity, setSelectedCommunity] = useState<NACACommunity | null>(null);
  const [activeTab, setActiveTab] = useState<TabValue>('communities');
  const [searchTerm, setSearchTerm] = useState("");
  
  const isConfigured = nacaApi.isConfigured();
  
  const { 
    data: communities = [], 
    isLoading: communitiesLoading,
    refetch: refetchCommunities,
    error: communitiesError
  } = useNacaCommunities({ useMockFallback: true });

  const handleSelectCommunity = useCallback((community: NACACommunity) => {
    setSelectedCommunity(community);
    setActiveTab('activities');
    setSearchTerm("");
  }, []);

  const handleBackToCommunities = useCallback(() => {
    setSelectedCommunity(null);
    setActiveTab('communities');
    setSearchTerm("");
  }, []);

  const filteredCommunities = useMemo(() => {
    if (!searchTerm) return communities;
    const term = searchTerm.toLowerCase();
    return communities.filter(c => 
      c.name.toLowerCase().includes(term) ||
      (c.description?.toLowerCase().includes(term))
    );
  }, [communities, searchTerm]);

  return (
    <div className="flex flex-col h-full">
      {selectedCommunity ? (
        <CommunityContentExplorer
          community={selectedCommunity}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onBack={handleBackToCommunities}
          onSelectMedia={onSelectMedia}
          onSelectVocabulary={onSelectVocabulary}
          onSelectActivity={onSelectActivity}
          onInsertActivityItems={onInsertActivityItems}
          currentScreenId={currentScreenId}
          currentScreen={currentScreen}
          onAttachActivityToScreen={onAttachActivityToScreen}
          onDetachActivityFromScreen={onDetachActivityFromScreen}
          selectedObjectId={selectedObjectId}
        />
      ) : (
        <CommunitiesGrid
          communities={filteredCommunities}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isLoading={communitiesLoading}
          error={communitiesError}
          onSelect={handleSelectCommunity}
          onRefresh={refetchCommunities}
        />
      )}
    </div>
  );
}

interface CommunitiesGridProps {
  communities: NACACommunity[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  error: Error | null;
  onSelect: (community: NACACommunity) => void;
  onRefresh: () => void;
}

function CommunitiesGrid({
  communities,
  searchTerm,
  setSearchTerm,
  isLoading,
  error,
  onSelect,
  onRefresh
}: CommunitiesGridProps) {
  const { settings, updateSettings } = useUserSettings();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [subdomainInput, setSubdomainInput] = useState(settings.nacaSubdomain || '');
  const [isSubdomainSaving, setIsSubdomainSaving] = useState(false);
  const [isClearingKey, setIsClearingKey] = useState(false);
  
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
        hasApiKey: boolean;
        apiKeyDisabled: boolean;
        apiKeySource: string;
      }>;
    },
    staleTime: 60000,
  });
  
  const isNacaEnvLocked = nacaConfig?.envLocked ?? false;
  
  // Check if we're on the dev server without a subdomain configured
  const isDevServer = nacaConfig?.baseUrl?.includes('native-tongue-lexicon') || 
                      nacaConfig?.baseUrl?.includes('replit.app');
  const needsSubdomainForDevServer = isDevServer && !nacaConfig?.subdomain;
  
  const handleServerChange = async (env: NacaEnvironment) => {
    if (isNacaEnvLocked) return;
    updateSettings({ nacaEnvironment: env, nacaSubdomain: '' });
    setSubdomainInput('');
    await nacaApi.setBaseUrl(NACA_SERVERS[env].url);
    queryClient.invalidateQueries({ queryKey: nacaKeys.all });
    queryClient.invalidateQueries({ queryKey: ['/api/naca-proxy/config'] });
  };
  
  const handleSubdomainSave = async () => {
    setIsSubdomainSaving(true);
    try {
      updateSettings({ nacaSubdomain: subdomainInput });
      await nacaApi.setSubdomain(subdomainInput);
      queryClient.invalidateQueries({ queryKey: nacaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['/api/naca-proxy/config'] });
      toast({
        title: "Subdomain Updated",
        description: subdomainInput ? `Connected to: ${subdomainInput}` : "Using auto-detected subdomain",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update subdomain",
        variant: "destructive",
      });
    } finally {
      setIsSubdomainSaving(false);
    }
  };
  
  const handleClearApiKey = async () => {
    setIsClearingKey(true);
    try {
      const response = await fetch('/api/naca-proxy/set-api-key', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to clear API key');
      }
      
      toast({
        title: "API Key Cleared",
        description: "The API key has been removed. The server will use its own authentication.",
      });
      
      queryClient.invalidateQueries({ queryKey: nacaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['/api/naca-proxy/config'] });
      onRefresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to clear API key",
        variant: "destructive",
      });
    } finally {
      setIsClearingKey(false);
    }
  };
  
  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter an API key",
        variant: "destructive",
      });
      return;
    }
    
    if (apiKeyInput.trim().length < 8) {
      toast({
        title: "Invalid Format",
        description: "API key is too short. Please enter a valid API key.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSavingKey(true);
    try {
      const response = await fetch('/api/naca-proxy/set-api-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyInput.trim() }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to set API key');
      }
      
      toast({
        title: "API Key Updated",
        description: "Your API key has been set and API key auth is now enabled.",
      });
      
      setApiKeyDialogOpen(false);
      setApiKeyInput("");
      queryClient.invalidateQueries({ queryKey: nacaKeys.all });
      queryClient.invalidateQueries({ queryKey: ['/api/naca-proxy/config'] });
      onRefresh();
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to set API key",
        variant: "destructive",
      });
    } finally {
      setIsSavingKey(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium flex-1">Communities</h3>
        
        <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
          <Tooltip>
            <TooltipTrigger asChild>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-naca-api-key"
                >
                  <Key className="h-4 w-4" />
                </Button>
              </DialogTrigger>
            </TooltipTrigger>
            <TooltipContent>Set API Key</TooltipContent>
          </Tooltip>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>NACA API Key</DialogTitle>
              <DialogDescription>
                Enter your NACA Activity Editor API key to access community content.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showApiKey ? "text" : "password"}
                    placeholder="Enter your API key"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="pr-10"
                    data-testid="input-naca-api-key"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Contact NACA administrators for your API key.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setApiKeyDialogOpen(false);
                  setApiKeyInput("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveApiKey}
                disabled={isSavingKey || !apiKeyInput.trim()}
                data-testid="button-save-api-key"
              >
                {isSavingKey ? (
                  <>
                    <InlineThrobber size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Key"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  data-testid="button-naca-server-settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>NACA Server Settings</TooltipContent>
          </Tooltip>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex items-center gap-2">
              NACA Server
              {isNacaEnvLocked && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Lock className="w-3 h-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>Server is locked by environment</TooltipContent>
                </Tooltip>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup 
              value={settings.nacaEnvironment} 
              onValueChange={(value) => handleServerChange(value as NacaEnvironment)}
            >
              <DropdownMenuRadioItem
                value="development"
                className="flex items-center"
                data-testid="naca-server-development"
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
                data-testid="naca-server-production"
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
                  data-testid="input-community-subdomain"
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
                  data-testid="button-save-community-subdomain"
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
            <DropdownMenuLabel className="flex items-center gap-2">
              <Key className="w-3 h-3" />
              API Key
            </DropdownMenuLabel>
            <div className="px-2 py-1.5">
              {nacaConfig?.apiKeyDisabled ? (
                <div className="space-y-2">
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    API key auth disabled (server will use its own auth)
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Use the key icon to set a new key and re-enable.
                  </p>
                </div>
              ) : nacaConfig?.hasApiKey ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    API key is configured ({nacaConfig.apiKeySource})
                  </p>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="w-full h-7 text-xs"
                    onClick={handleClearApiKey}
                    disabled={isClearingKey}
                    data-testid="button-clear-api-key"
                  >
                    {isClearingKey ? (
                      <>
                        <InlineThrobber size="sm" className="mr-1" />
                        Clearing...
                      </>
                    ) : (
                      "Clear API Key"
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No API key configured. Use the key icon to set one.
                </p>
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
          data-testid="button-refresh-communities"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>
      
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search communities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
            data-testid="input-search-communities"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {needsSubdomainForDevServer ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Server className="h-8 w-8 text-amber-500 mb-3" />
            <h4 className="font-medium mb-2">Community Subdomain Required</h4>
            <p className="text-sm text-muted-foreground mb-4">
              The development server requires a community subdomain to load content.
              Enter your community subdomain in the settings above.
            </p>
            <div className="w-full max-w-xs space-y-2">
              <Input
                placeholder="e.g. the-piegan-institute"
                value={subdomainInput}
                onChange={(e) => setSubdomainInput(e.target.value)}
                className="text-center"
                data-testid="input-dev-subdomain-prompt"
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === 'Enter' && subdomainInput.trim()) {
                    handleSubdomainSave();
                  }
                }}
              />
              <Button 
                className="w-full" 
                onClick={handleSubdomainSave}
                disabled={!subdomainInput.trim() || isSubdomainSaving}
                data-testid="button-set-dev-subdomain"
              >
                {isSubdomainSaving ? (
                  <>
                    <InlineThrobber size="sm" className="mr-2" />
                    Connecting...
                  </>
                ) : (
                  "Connect to Community"
                )}
              </Button>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <AvatarThrobber 
              fallback="NACA" 
              size="lg"
              isLoading={true}
            />
            <span className="text-sm text-muted-foreground mt-3">Loading communities...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load communities</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={onRefresh}>
              Try Again
            </Button>
          </div>
        ) : communities.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Globe className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'No communities found' : 'No communities available'}
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {communities.map((community) => (
              <Card
                key={community.id}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelect(community)}
                data-testid={`card-community-${community.id}`}
              >
                <CardContent className="p-4 flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    {community.logoUrl ? (
                      <AvatarImage src={community.logoUrl} alt={community.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {community.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{community.name}</h4>
                    {community.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {community.description}
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface CommunityContentExplorerProps {
  community: NACACommunity;
  activeTab: TabValue;
  setActiveTab: (tab: TabValue) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onBack: () => void;
  onSelectMedia?: (media: NACAMediaFile, communityId: string) => void;
  onSelectVocabulary?: (entry: NACADictionaryEntry, dictionary: NACADictionary, communityId: string, bindingType?: VocabularyBindingType) => void;
  onSelectActivity?: (activity: NACAActivity, communityId: string) => void;
  onInsertActivityItems?: (items: NACAActivityItem[], activityId: string, communityId: string) => void;
  selectedObjectId?: string;
  currentScreenId?: string;
  currentScreen?: { id: string; title: string; nacaActivityId?: string; nacaCommunityId?: string };
  onAttachActivityToScreen?: (activityId: string, communityId: string) => void;
  onDetachActivityFromScreen?: () => void;
}

function CommunityContentExplorer({
  community,
  activeTab,
  setActiveTab,
  searchTerm,
  setSearchTerm,
  onBack,
  onSelectMedia,
  onSelectVocabulary,
  onSelectActivity,
  onInsertActivityItems,
  selectedObjectId,
  currentScreenId,
  currentScreen,
  onAttachActivityToScreen,
  onDetachActivityFromScreen
}: CommunityContentExplorerProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          data-testid="button-back-communities"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8">
          {community.logoUrl ? (
            <AvatarImage src={community.logoUrl} alt={community.name} />
          ) : null}
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {community.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{community.name}</h3>
        </div>
      </div>
      
      <Tabs 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as TabValue)}
        className="flex-1 flex flex-col"
      >
        <TabsList className="w-full justify-start rounded-none border-b px-3 h-auto py-1 bg-transparent">
          <TabsTrigger 
            value="activities" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2"
            data-testid="tab-activities"
          >
            <Gamepad2 className="h-4 w-4 mr-1.5" />
            Activities
          </TabsTrigger>
          <TabsTrigger 
            value="dictionaries" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2"
            data-testid="tab-dictionaries"
          >
            <Book className="h-4 w-4 mr-1.5" />
            Dictionary
          </TabsTrigger>
          <TabsTrigger 
            value="media" 
            className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none pb-2"
            data-testid="tab-media"
          >
            <Image className="h-4 w-4 mr-1.5" />
            Media
          </TabsTrigger>
        </TabsList>
        
        <div className="p-3 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              data-testid="input-search-content"
            />
          </div>
        </div>
        
        <TabsContent value="activities" className="flex-1 m-0 overflow-hidden">
          <ActivitiesTab
            communityId={community.id}
            searchTerm={searchTerm}
            onSelect={(activity) => onSelectActivity?.(activity, community.id)}
            onInsertActivityItems={onInsertActivityItems}
            currentScreenId={currentScreenId}
            currentScreen={currentScreen}
            onAttachActivityToScreen={onAttachActivityToScreen}
            onDetachActivityFromScreen={onDetachActivityFromScreen}
          />
        </TabsContent>
        
        <TabsContent value="dictionaries" className="flex-1 m-0 overflow-hidden">
          <DictionariesTab
            communityId={community.id}
            searchTerm={searchTerm}
            selectedObjectId={selectedObjectId}
            onSelect={(entry, dict, bindingType) => onSelectVocabulary?.(entry, dict, community.id, bindingType)}
          />
        </TabsContent>
        
        <TabsContent value="media" className="flex-1 m-0 overflow-hidden">
          <MediaTab
            communityId={community.id}
            searchTerm={searchTerm}
            onSelect={(media) => onSelectMedia?.(media, community.id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface ActivitiesTabProps {
  communityId: string;
  searchTerm: string;
  onSelect?: (activity: NACAActivity) => void;
  onInsertActivityItems?: (items: NACAActivityItem[], activityId: string, communityId: string) => void;
  currentScreenId?: string;
  currentScreen?: { id: string; title: string; nacaActivityId?: string; nacaCommunityId?: string };
  onAttachActivityToScreen?: (activityId: string, communityId: string) => void;
  onDetachActivityFromScreen?: () => void;
}

function ActivitiesTab({ 
  communityId, 
  searchTerm, 
  onSelect,
  onInsertActivityItems,
  currentScreenId,
  currentScreen,
  onAttachActivityToScreen,
  onDetachActivityFromScreen
}: ActivitiesTabProps) {
  const [selectedActivity, setSelectedActivity] = useState<NACAActivity | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const {
    data: activitiesData,
    isLoading,
    error,
    refetch
  } = useNacaActivities(communityId, { search: searchTerm || undefined });

  const activities = activitiesData?.activities || [];

  const filteredActivities = useMemo(() => {
    if (!searchTerm) return activities;
    const term = searchTerm.toLowerCase();
    return activities.filter(a => 
      a.name.toLowerCase().includes(term) ||
      a.type?.toLowerCase().includes(term) ||
      a.description?.toLowerCase().includes(term)
    );
  }, [activities, searchTerm]);

  const playAudio = useCallback((audioUrl: string | undefined, itemId: string) => {
    if (!audioUrl) return;
    
    if (playingAudio === itemId) {
      setPlayingAudio(null);
      return;
    }
    
    setPlayingAudio(itemId);
    const audio = new Audio(nacaApi.getProxiedMediaUrl(audioUrl));
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => setPlayingAudio(null);
    audio.play().catch(() => setPlayingAudio(null));
  }, [playingAudio]);

  if (selectedActivity) {
    return (
      <ActivityDetailView
        communityId={communityId}
        activity={selectedActivity}
        playingAudio={playingAudio}
        onPlayAudio={playAudio}
        onBack={() => setSelectedActivity(null)}
        onSelectItem={(activity) => onSelect?.(activity)}
        onInsertActivityItems={onInsertActivityItems}
        currentScreenId={currentScreenId}
        currentScreen={currentScreen}
        onAttachActivityToScreen={onAttachActivityToScreen}
        onDetachActivityFromScreen={onDetachActivityFromScreen}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AvatarThrobber 
          fallback="Activities" 
          size="lg"
          isLoading={true}
        />
        <span className="text-sm text-muted-foreground mt-3">Loading activities...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load activities</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()} data-testid="button-retry-activities">
          Try Again
        </Button>
      </div>
    );
  }

  if (filteredActivities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Gamepad2 className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {searchTerm ? 'No activities found' : 'No activities available'}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="py-2 space-y-1">
        {filteredActivities.map(activity => {
          const isAttachedToScreen = currentScreen?.nacaActivityId === activity.id && currentScreen?.nacaCommunityId === communityId;
          return (
            <div
              key={activity.id}
              className={cn(
                "flex items-center gap-3 px-3 py-3 hover:bg-accent cursor-pointer rounded-sm mx-2",
                isAttachedToScreen && "bg-green-500/10 ring-1 ring-green-500/30"
              )}
              onClick={() => setSelectedActivity(activity)}
              data-testid={`item-activity-${activity.id}`}
            >
              <Gamepad2 className={cn("h-5 w-5 shrink-0", isAttachedToScreen ? "text-green-600" : "text-primary")} />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{activity.name}</span>
                  {isAttachedToScreen && (
                    <Badge variant="default" className="text-xs shrink-0 bg-green-600">Attached</Badge>
                  )}
                  {activity.isPublished && !isAttachedToScreen && (
                    <Badge variant="default" className="text-xs shrink-0">Published</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                  <span className="truncate">{activity.type}</span>
                  {activity.entryCount !== undefined && activity.entryCount > 0 && (
                    <>
                      <span>•</span>
                      <span>{activity.entryCount} entries</span>
                    </>
                  )}
                </div>
              </div>
              
              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}

interface ActivityMetadataDisplayProps {
  activity: NACAActivity;
  activityDetails?: NACAActivityDetails;
  isLoading?: boolean;
}

const ACTIVITY_METADATA_FIELDS = [
  { key: 'activityDescriptionClean', label: 'Description' },
  { key: 'activityGenerator', label: 'Generator' },
  { key: 'interactionType', label: 'Interaction' },
  { key: 'difficultyLevel', label: 'Difficulty' },
  { key: 'tags', label: 'Tags' },
  { key: 'mediaIncluded', label: 'Media' },
  { key: 'learningFocus', label: 'Focus' },
  { key: 'activityModel', label: 'Model' },
  { key: 'mechanicRule', label: 'Mechanic' },
] as const;

function ActivityMetadataDisplay({ activity, activityDetails, isLoading }: ActivityMetadataDisplayProps) {
  const metadata = useMemo(() => {
    const merged = {
      ...(activity.metadata || {}),
      ...(activityDetails?.metadata || {}),
      ...(activityDetails?.settings || {}),
    };
    return merged;
  }, [activity.metadata, activityDetails?.metadata, activityDetails?.settings]);

  const hasAnyMetadata = ACTIVITY_METADATA_FIELDS.some(field => {
    const value = metadata[field.key] || metadata[field.key.toLowerCase()] || 
                  metadata[field.key.charAt(0).toUpperCase() + field.key.slice(1)];
    return value !== undefined && value !== null && value !== '';
  });

  if (isLoading) {
    return (
      <div className="px-3 py-2 border-b flex items-center justify-center">
        <AvatarThrobber 
          fallback="Meta" 
          size="md"
          isLoading={true}
        />
        <span className="text-xs text-muted-foreground ml-2">Loading metadata...</span>
      </div>
    );
  }

  if (!hasAnyMetadata) {
    return null;
  }

  const getValue = (key: string): string => {
    const value = metadata[key] || metadata[key.toLowerCase()] || 
                  metadata[key.charAt(0).toUpperCase() + key.slice(1)];
    if (value === undefined || value === null) return '—';
    if (Array.isArray(value)) return value.join(', ') || '—';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  return (
    <div className="px-3 py-2 border-b" data-testid="activity-metadata-display">
      <div className="text-xs font-medium text-muted-foreground mb-2">Activity Metadata</div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {ACTIVITY_METADATA_FIELDS.map(field => {
          const value = getValue(field.key);
          if (value === '—') return null;
          return (
            <div key={field.key} className="flex flex-col">
              <span className="text-muted-foreground">{field.label}</span>
              <span className="font-medium truncate" title={value} data-testid={`metadata-${field.key}`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface ActivityDetailViewProps {
  communityId: string;
  activity: NACAActivity;
  playingAudio: string | null;
  onPlayAudio: (audioUrl: string | undefined, itemId: string) => void;
  onBack: () => void;
  onSelectItem?: (activity: NACAActivity) => void;
  onInsertActivityItems?: (items: NACAActivityItem[], activityId: string, communityId: string) => void;
  currentScreenId?: string;
  currentScreen?: { id: string; title: string; nacaActivityId?: string; nacaCommunityId?: string };
  onAttachActivityToScreen?: (activityId: string, communityId: string) => void;
  onDetachActivityFromScreen?: () => void;
}

function ActivityDetailView({
  communityId,
  activity,
  playingAudio,
  onPlayAudio,
  onBack,
  onSelectItem,
  onInsertActivityItems,
  currentScreenId,
  currentScreen,
  onAttachActivityToScreen,
  onDetachActivityFromScreen
}: ActivityDetailViewProps) {
  const {
    data: activityDetails,
    isLoading: isLoadingDetails,
  } = useNacaActivityDetails(communityId, activity.id);

  const {
    data: itemsResult,
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems
  } = useNacaActivityItems(communityId, activity.id);

  const items = itemsResult?.items || [];
  const totalItems = itemsResult?.total ?? activity.entryCount ?? items.length;

  const mergedActivity = useMemo(() => ({
    ...activity,
    ...activityDetails,
    items
  }), [activity, activityDetails, items]);

  const isAttachedToCurrentScreen = currentScreen?.nacaActivityId === activity.id && currentScreen?.nacaCommunityId === communityId;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onBack}
          data-testid="button-back-activities"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Gamepad2 className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <span className="font-medium text-sm truncate block">{activity.name}</span>
          {activity.type && (
            <span className="text-xs text-muted-foreground">{activity.type}</span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {(activity.isPublished || activityDetails?.isPublished) && (
            <Badge variant="default" className="text-xs" data-testid="badge-activity-published">Published</Badge>
          )}
          <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-activity-items-count">
            {isLoadingItems ? (
              <InlineThrobber size="sm" />
            ) : (
              `${totalItems} items`
            )}
          </Badge>
        </div>
      </div>
      
      {(activity.description || activityDetails?.description) && (
        <div className="px-3 py-2 border-b bg-muted/10">
          <p className="text-sm text-muted-foreground" data-testid="text-activity-description">
            {activityDetails?.description || activity.description}
          </p>
        </div>
      )}
      
      <ActivityMetadataDisplay 
        activity={activity} 
        activityDetails={activityDetails} 
        isLoading={isLoadingDetails}
      />
      
      <div className="px-3 py-2 border-b">
        {!currentScreenId ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link className="h-4 w-4" />
            <span>Select a screen to attach activities</span>
          </div>
        ) : isAttachedToCurrentScreen ? (
          <div className="flex items-center gap-2">
            <Badge variant="default" className="bg-green-600 hover:bg-green-700" data-testid="badge-activity-attached">
              <Check className="h-3 w-3 mr-1" />
              Attached to {currentScreen?.title}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={() => onDetachActivityFromScreen?.()}
              data-testid="button-detach-activity"
            >
              <X className="h-3 w-3 mr-1" />
              Detach
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={() => onAttachActivityToScreen?.(activity.id, communityId)}
            data-testid="button-attach-activity"
          >
            <Link className="h-3 w-3 mr-1.5" />
            Attach to {currentScreen?.title}
          </Button>
        )}
      </div>
      
      {currentScreenId && (
        <div className="px-3 py-2 border-b">
          <Button
            variant="default"
            size="sm"
            className="w-full h-9 text-sm font-medium"
            disabled={isLoadingItems || items.length === 0}
            onClick={() => onInsertActivityItems?.(items, activity.id, communityId)}
            data-testid="button-insert-items-to-canvas"
          >
            {isLoadingItems ? (
              <>
                <InlineThrobber size="sm" className="mr-2" />
                Loading Items...
              </>
            ) : items.length === 0 ? (
              'No Items to Insert'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Insert {items.length} Items to Canvas
              </>
            )}
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        {isLoadingItems ? (
          <div className="flex flex-col items-center justify-center p-8">
            <AvatarThrobber 
              fallback="Items" 
              size="lg"
              isLoading={true}
            />
            <span className="text-sm text-muted-foreground mt-3">Loading activity items...</span>
          </div>
        ) : itemsError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-8 w-8 text-destructive mb-2" />
            <p className="text-sm text-muted-foreground">Failed to load activity items</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchItems()} data-testid="button-retry-activity-items">
              Try Again
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Gamepad2 className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No items in this activity</p>
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => onSelectItem?.(mergedActivity)}
                data-testid={`item-activity-item-${item.id}`}
              >
                {item.image && (
                  <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={nacaApi.getProxiedMediaUrl(item.image)}
                      alt={item.language || item.english || ''}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                      data-testid={`img-activity-item-${item.id}`}
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" data-testid={`text-language-${item.id}`}>
                      {item.language || '—'}
                    </span>
                    {item.category && (
                      <Badge variant="outline" className="text-xs" data-testid={`badge-category-${item.id}`}>
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate" data-testid={`text-english-${item.id}`}>
                    {item.english || '—'}
                  </p>
                </div>
                
                <div className="flex items-center gap-1 shrink-0">
                  {item.audio && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayAudio(item.audio, item.id);
                      }}
                      data-testid={`button-play-audio-${item.id}`}
                    >
                      {playingAudio === item.id ? (
                        <VolumeX className="h-4 w-4" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    data-testid={`button-select-item-${item.id}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}

interface DictionariesTabProps {
  communityId: string;
  searchTerm: string;
  selectedObjectId?: string;
  onSelect?: (entry: NACADictionaryEntry, dictionary: NACADictionary, bindingType?: VocabularyBindingType) => void;
}

function DictionariesTab({ communityId, searchTerm, selectedObjectId, onSelect }: DictionariesTabProps) {
  const [selectedDict, setSelectedDict] = useState<NACADictionary | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [viewingEntry, setViewingEntry] = useState<NACADictionaryEntry | null>(null);
  
  const {
    data: dictionaries = [],
    isLoading,
    error,
    refetch
  } = useNacaDictionaries(communityId, { useMockFallback: true });

  const {
    data: entriesResult,
    isLoading: isLoadingEntries,
    error: entriesError,
    refetch: refetchEntries
  } = useNacaDictionaryEntries(selectedDict?.id || '', {
    enabled: !!selectedDict?.id,
    limit: 200,
    useMockFallback: true
  });

  const entries = entriesResult?.entries || [];
  const totalEntries = entriesResult?.total ?? selectedDict?.entryCount ?? entries.length;

  useEffect(() => {
    if (!isLoading && dictionaries.length > 0 && !selectedDict) {
      setSelectedDict(dictionaries[0]);
    }
  }, [dictionaries, isLoading, selectedDict]);

  const filteredDictionaries = useMemo(() => {
    if (!searchTerm) return dictionaries;
    const term = searchTerm.toLowerCase();
    return dictionaries.filter(d => 
      d.name.toLowerCase().includes(term) ||
      d.description?.toLowerCase().includes(term)
    );
  }, [dictionaries, searchTerm]);

  const filteredEntries = useMemo(() => {
    if (!selectedDict) return [];
    if (!searchTerm) return entries;
    const term = searchTerm.toLowerCase();
    return entries.filter(e => {
      const word = e.indigenousWord || e.word || '';
      const translation = e.englishTranslation || e.translation || '';
      return (
        word.toLowerCase().includes(term) ||
        translation.toLowerCase().includes(term) ||
        e.category?.toLowerCase().includes(term)
      );
    });
  }, [selectedDict, searchTerm, entries]);

  const playAudio = useCallback((audioUrl: string | undefined, entryId: string) => {
    if (!audioUrl) return;
    
    if (playingAudio === entryId) {
      setPlayingAudio(null);
      return;
    }
    
    setPlayingAudio(entryId);
    const audio = new Audio(nacaApi.getProxiedMediaUrl(audioUrl));
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => setPlayingAudio(null);
    audio.play().catch(() => setPlayingAudio(null));
  }, [playingAudio]);

  const handleBindingSelect = useCallback((entry: NACADictionaryEntry, bindingType: VocabularyBindingType) => {
    if (selectedDict) {
      onSelect?.(entry, selectedDict, bindingType);
      setOpenPopoverId(null);
    }
  }, [selectedDict, onSelect]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AvatarThrobber 
          fallback="Dict" 
          size="lg"
          isLoading={true}
        />
        <span className="text-sm text-muted-foreground mt-3">Loading dictionaries...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load dictionaries</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  if (selectedDict) {
    const languagePair = selectedDict.sourceLanguage && selectedDict.targetLanguage 
      ? `${selectedDict.sourceLanguage} → ${selectedDict.targetLanguage}`
      : null;
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col border-b bg-muted/30">
          <div className="flex items-center gap-2 px-3 py-2">
            <Book className="h-4 w-4 text-primary shrink-0" />
            {dictionaries.length > 1 ? (
              <Select
                value={selectedDict.id}
                onValueChange={(value) => {
                  const dict = dictionaries.find(d => d.id === value);
                  if (dict) setSelectedDict(dict);
                }}
              >
                <SelectTrigger className="h-7 text-sm font-medium flex-1 min-w-0">
                  <SelectValue>{selectedDict.name}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {dictionaries.map(dict => (
                    <SelectItem key={dict.id} value={dict.id}>
                      {dict.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="font-medium text-sm truncate flex-1">{selectedDict.name}</span>
            )}
            <Badge variant="secondary" className="shrink-0 flex items-center gap-1">
              {isLoadingEntries ? (
                <InlineThrobber size="sm" />
              ) : (
                `${totalEntries} words`
              )}
            </Badge>
          </div>
          {languagePair && (
            <div className="px-3 pb-2 flex items-center gap-1.5">
              <Languages className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{languagePair}</span>
            </div>
          )}
        </div>

        {!selectedObjectId && (
          <div className="px-3 py-2 border-b bg-amber-500/10 flex items-center gap-2">
            <Link className="h-4 w-4 text-amber-600" />
            <span className="text-xs text-amber-700 dark:text-amber-400">
              Select an object on canvas to bind vocabulary
            </span>
          </div>
        )}
        
        <ScrollArea className="flex-1">
          {isLoadingEntries ? (
            <div className="flex flex-col items-center justify-center p-8">
              <AvatarThrobber 
                fallback="Words" 
                size="lg"
                isLoading={true}
              />
              <span className="text-sm text-muted-foreground mt-3">Loading vocabulary entries...</span>
            </div>
          ) : entriesError ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">Failed to load entries</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => refetchEntries()}>
                Try Again
              </Button>
            </div>
          ) : filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Book className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'No entries found' : 'No vocabulary entries'}
              </p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredEntries.map((entry) => {
                const hasWord = !!(entry.indigenousWord || entry.word);
                const hasTranslation = !!(entry.englishTranslation || entry.translation);
                const hasImage = !!entry.imageUrl;
                const hasAudio = !!entry.audioUrl;
                
                const entryContent = (
                  <div
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border bg-card transition-colors cursor-pointer",
                      selectedObjectId 
                        ? "hover:bg-accent/50 hover:ring-2 hover:ring-primary/50" 
                        : "hover:bg-accent/30"
                    )}
                    data-testid={`item-vocabulary-${entry.id}`}
                  >
                    {entry.imageUrl ? (
                      <div className="h-14 w-14 rounded-md overflow-hidden bg-muted shrink-0 border">
                        <img
                          src={nacaApi.getProxiedMediaUrl(entry.imageUrl)}
                          alt={entry.indigenousWord || entry.word || ''}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-md bg-muted shrink-0 flex items-center justify-center border">
                        <Book className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base">{entry.indigenousWord || entry.word || '—'}</span>
                        {selectedObjectId && (
                          <Link className="h-3 w-3 text-primary ml-auto shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {entry.englishTranslation || entry.translation || entry.definition || '—'}
                      </p>
                      {entry.pronunciation && (
                        <p className="text-xs text-muted-foreground/70 italic truncate">{entry.pronunciation}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 shrink-0">
                      {entry.audioUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(
                            "h-9 w-9 rounded-full",
                            playingAudio === entry.id && "bg-primary/10 text-primary"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            playAudio(entry.audioUrl || undefined, entry.id);
                          }}
                          data-testid={`button-play-audio-${entry.id}`}
                        >
                          {playingAudio === entry.id ? (
                            <VolumeX className="h-4 w-4" />
                          ) : (
                            <Volume2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setViewingEntry(entry);
                        }}
                        data-testid={`button-view-entry-${entry.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
                
                if (selectedObjectId) {
                  return (
                    <Popover 
                      key={entry.id} 
                      open={openPopoverId === entry.id}
                      onOpenChange={(open) => setOpenPopoverId(open ? entry.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <div>{entryContent}</div>
                      </PopoverTrigger>
                      <PopoverContent className="w-56 p-2" align="end">
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-muted-foreground px-2 pb-1">
                            Bind to selected object
                          </p>
                          
                          {hasWord && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 h-9"
                              onClick={() => handleBindingSelect(entry, 'word')}
                              data-testid={`button-bind-word-${entry.id}`}
                            >
                              <Type className="h-4 w-4 text-blue-500" />
                              <span className="flex-1 text-left">Bind Word</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                {entry.indigenousWord || entry.word}
                              </span>
                            </Button>
                          )}
                          
                          {hasTranslation && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 h-9"
                              onClick={() => handleBindingSelect(entry, 'translation')}
                              data-testid={`button-bind-translation-${entry.id}`}
                            >
                              <Languages className="h-4 w-4 text-green-500" />
                              <span className="flex-1 text-left">Bind Translation</span>
                              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                                {entry.englishTranslation || entry.translation}
                              </span>
                            </Button>
                          )}
                          
                          {hasImage && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 h-9"
                              onClick={() => handleBindingSelect(entry, 'image')}
                              data-testid={`button-bind-image-${entry.id}`}
                            >
                              <ImageIcon className="h-4 w-4 text-purple-500" />
                              <span className="flex-1 text-left">Bind Image</span>
                            </Button>
                          )}
                          
                          {hasAudio && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start gap-2 h-9"
                              onClick={() => handleBindingSelect(entry, 'audio')}
                              data-testid={`button-bind-audio-${entry.id}`}
                            >
                              <Volume2 className="h-4 w-4 text-orange-500" />
                              <span className="flex-1 text-left">Bind Audio</span>
                            </Button>
                          )}
                          
                          <Separator className="my-1" />
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start gap-2 h-9"
                            onClick={() => handleBindingSelect(entry, 'full')}
                            data-testid={`button-bind-full-${entry.id}`}
                          >
                            <Link className="h-4 w-4 text-primary" />
                            <span className="flex-1 text-left">Bind All (Reference)</span>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  );
                }
                
                return (
                  <div 
                    key={entry.id} 
                    onClick={() => {
                      if (onSelect) {
                        onSelect(entry, selectedDict);
                      }
                    }}
                  >
                    {entryContent}
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <Dialog open={!!viewingEntry} onOpenChange={(open) => !open && setViewingEntry(null)}>
          <DialogContent className="sm:max-w-lg">
            {viewingEntry && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5 text-primary" />
                    Dictionary Entry
                  </DialogTitle>
                  {languagePair && (
                    <DialogDescription className="flex items-center gap-1.5">
                      <Languages className="h-3.5 w-3.5" />
                      {languagePair}
                    </DialogDescription>
                  )}
                </DialogHeader>
                
                <div className="space-y-4">
                  {viewingEntry.imageUrl && (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border">
                      <img
                        src={nacaApi.getProxiedMediaUrl(viewingEntry.imageUrl)}
                        alt={viewingEntry.indigenousWord || viewingEntry.word || ''}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-primary/5 border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {selectedDict.sourceLanguage || 'Indigenous Word'}
                      </p>
                      <p className="text-xl font-semibold">
                        {viewingEntry.indigenousWord || viewingEntry.word || '—'}
                      </p>
                      {viewingEntry.pronunciation && (
                        <p className="text-sm text-muted-foreground italic mt-1">
                          /{viewingEntry.pronunciation}/
                        </p>
                      )}
                    </div>
                    
                    <div className="p-3 rounded-lg bg-muted/50 border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                        {selectedDict.targetLanguage || 'Translation'}
                      </p>
                      <p className="text-lg">
                        {viewingEntry.englishTranslation || viewingEntry.translation || '—'}
                      </p>
                    </div>
                    
                    {viewingEntry.definition && viewingEntry.definition !== viewingEntry.englishTranslation && (
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Definition</p>
                        <p className="text-sm">{viewingEntry.definition}</p>
                      </div>
                    )}
                    
                    {viewingEntry.partOfSpeech && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{viewingEntry.partOfSpeech}</Badge>
                      </div>
                    )}
                    
                    {viewingEntry.audioUrl && (
                      <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                        <Button
                          variant={playingAudio === viewingEntry.id ? "default" : "secondary"}
                          size="icon"
                          className="h-12 w-12 rounded-full shrink-0"
                          onClick={() => playAudio(viewingEntry.audioUrl || undefined, viewingEntry.id)}
                          data-testid="button-modal-play-audio"
                        >
                          {playingAudio === viewingEntry.id ? (
                            <VolumeX className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5" />
                          )}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">Listen to pronunciation</p>
                          <p className="text-xs text-muted-foreground">Click to play audio</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewingEntry(null)}>
                    Close
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (filteredDictionaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <Book className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          {searchTerm ? 'No dictionaries found' : 'No dictionaries available'}
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        {filteredDictionaries.map((dict) => (
          <Card
            key={dict.id}
            className="cursor-pointer hover:bg-accent transition-colors"
            onClick={() => setSelectedDict(dict)}
            data-testid={`card-dictionary-${dict.id}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{dict.name}</h4>
                  {dict.description && (
                    <p className="text-sm text-muted-foreground truncate">{dict.description}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <Badge variant="secondary">{dict.entryCount ?? (dict.entries || []).length}</Badge>
                  <p className="text-xs text-muted-foreground mt-0.5">words</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}

interface MediaTabProps {
  communityId: string;
  searchTerm: string;
  onSelect?: (media: NACAMediaFile) => void;
}

function MediaTab({ communityId, searchTerm, onSelect }: MediaTabProps) {
  const [mediaType, setMediaType] = useState<'all' | 'image' | 'audio' | 'video'>('all');
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  
  const {
    data: mediaResult,
    isLoading,
    error,
    refetch
  } = useNacaSearchMedia({
    communityId,
    filename: searchTerm || undefined,
    type: mediaType === 'all' ? undefined : mediaType,
    limit: 50
  }, { useMockFallback: true });

  const media = mediaResult?.media || [];

  const playAudio = useCallback((audioUrl: string, mediaId: string) => {
    if (playingAudio === mediaId) {
      setPlayingAudio(null);
      return;
    }
    
    setPlayingAudio(mediaId);
    const audio = new Audio(nacaApi.getProxiedMediaUrl(audioUrl));
    audio.onended = () => setPlayingAudio(null);
    audio.onerror = () => setPlayingAudio(null);
    audio.play().catch(() => setPlayingAudio(null));
  }, [playingAudio]);

  const getMediaType = useCallback((item: NACAMediaFile): 'image' | 'audio' | 'video' | 'unknown' => {
    if (item.type && item.type !== 'unknown') {
      return item.type as 'image' | 'audio' | 'video';
    }
    if (item.mimeType) {
      if (item.mimeType.startsWith('image/')) return 'image';
      if (item.mimeType.startsWith('audio/')) return 'audio';
      if (item.mimeType.startsWith('video/')) return 'video';
    }
    const ext = item.filename?.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')) return 'image';
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(ext || '')) return 'audio';
    if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext || '')) return 'video';
    return 'unknown';
  }, []);

  const MediaIcon = ({ type }: { type: 'image' | 'audio' | 'video' | 'unknown' }) => {
    switch (type) {
      case 'image': return <FileImage className="h-5 w-5" />;
      case 'audio': return <FileAudio className="h-5 w-5" />;
      case 'video': return <FileVideo className="h-5 w-5" />;
      default: return <FileImage className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AvatarThrobber 
          fallback="Media" 
          size="lg"
          isLoading={true}
        />
        <span className="text-sm text-muted-foreground mt-3">Loading media...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground">Failed to load media</p>
        <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 py-2 border-b">
        <Button
          variant={mediaType === 'all' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setMediaType('all')}
          data-testid="button-filter-all"
        >
          All
        </Button>
        <Button
          variant={mediaType === 'image' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setMediaType('image')}
          data-testid="button-filter-images"
        >
          <Image className="h-3.5 w-3.5 mr-1" />
          Images
        </Button>
        <Button
          variant={mediaType === 'audio' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setMediaType('audio')}
          data-testid="button-filter-audio"
        >
          <Music className="h-3.5 w-3.5 mr-1" />
          Audio
        </Button>
        <Button
          variant={mediaType === 'video' ? 'secondary' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => setMediaType('video')}
          data-testid="button-filter-video"
        >
          <Film className="h-3.5 w-3.5 mr-1" />
          Video
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <Image className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'No media found' : 'No media available'}
            </p>
          </div>
        ) : (
          <div className="p-2 grid grid-cols-3 gap-2" data-testid="grid-media">
            {media.map((item) => {
              const itemType = getMediaType(item);
              return (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-lg border bg-muted overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                  onClick={() => onSelect?.(item)}
                  data-testid={`item-media-${item.id}`}
                >
                  {itemType === 'image' ? (
                    <img
                      src={nacaApi.getProxiedMediaUrl(item.url)}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-muted">
                      <MediaIcon type={itemType} />
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {itemType === 'audio' ? (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          playAudio(item.url, item.id);
                        }}
                      >
                        {playingAudio === item.id ? (
                          <VolumeX className="h-5 w-5" />
                        ) : (
                          <Play className="h-5 w-5" />
                        )}
                      </Button>
                    ) : itemType === 'video' ? (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                      >
                        <Play className="h-5 w-5" />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full"
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-xs text-white truncate">{item.filename}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
