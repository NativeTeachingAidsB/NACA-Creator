
import { useState } from "react";
import { CollapsiblePalette, PaletteGroup } from "@/components/ui/collapsible-palette";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Image, Music, Video, Grid3x3, List, Loader2, AlertCircle, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MediaAsset } from "@shared/types";
import { useNacaCommunities, useNacaMediaSearch } from "@/hooks/use-naca";
import { nacaApi } from "@/lib/naca-api";

export function MediaLibraryPanel() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");

  const isNacaConfigured = nacaApi.isConfigured();
  const { data: nacaCommunities = [], isLoading: isLoadingCommunities, error: communitiesError } = useNacaCommunities();
  
  // Map NACA communities to the format we need
  const communities = nacaCommunities.map(c => ({ id: c.id, name: c.name }));

  const { data: mediaResults = [], isLoading: isLoadingMedia } = useNacaMediaSearch({
    communityId: selectedCommunity || undefined,
    type: selectedType !== 'all' ? selectedType as 'image' | 'audio' | 'video' : undefined,
    filename: searchTerm || undefined,
  }, { enabled: isNacaConfigured && !!selectedCommunity });
  
  // Map NACA media to our MediaAsset format
  const assets: MediaAsset[] = mediaResults.map(m => ({
    id: m.id,
    filename: m.filename,
    url: m.url,
    type: m.type,
    communityId: m.communityId || selectedCommunity,
    category: 'activity' as const,
    mimeType: m.mimeType || '',
    size: m.size || 0,
    tags: [],
    createdAt: new Date().toISOString(),
  }));

  const filteredAssets = assets.filter((asset) =>
    asset.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <PaletteGroup>
      <CollapsiblePalette
        id="media-library"
        title="Media Library"
        icon={<Image className="h-4 w-4" />}
        badge={<Badge variant="secondary">{filteredAssets.length}</Badge>}
        defaultOpen={true}
      >
        <div className="space-y-3">
          {/* NACA Connection Status */}
          {!isNacaConfigured && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>NACA server not configured. Set your NACA server URL in Settings.</span>
            </div>
          )}
          
          {communitiesError && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-md text-red-700 text-xs">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>Failed to load communities: {communitiesError.message}</span>
            </div>
          )}
          
          {/* Community Selector */}
          <Select 
            value={selectedCommunity} 
            onValueChange={setSelectedCommunity}
            disabled={!isNacaConfigured || isLoadingCommunities}
          >
            <SelectTrigger data-testid="select-community">
              {isLoadingCommunities ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading communities...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select community..." />
              )}
            </SelectTrigger>
            <SelectContent>
              {communities.length === 0 && !isLoadingCommunities ? (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  No communities available
                </div>
              ) : (
                communities.map((community) => (
                  <SelectItem key={community.id} value={community.id} data-testid={`community-option-${community.id}`}>
                    {community.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="video">Video</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="vocabulary">Vocabulary</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
                <SelectItem value="activity">Activity</SelectItem>
                <SelectItem value="pronunciation">Pronunciation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Toggle */}
          <div className="flex gap-1">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Asset Grid/List */}
          <div className={cn(
            viewMode === "grid" 
              ? "grid grid-cols-2 gap-2" 
              : "flex flex-col gap-1"
          )}>
            {filteredAssets.map((asset: MediaAsset) => (
              <MediaAssetCard
                key={asset.id}
                asset={asset}
                viewMode={viewMode}
              />
            ))}
          </div>
        </div>
      </CollapsiblePalette>
    </PaletteGroup>
  );
}

function MediaAssetCard({ asset, viewMode }: { asset: MediaAsset; viewMode: "grid" | "list" }) {
  const getIcon = () => {
    switch (asset.type) {
      case "audio": return <Music className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  if (viewMode === "list") {
    return (
      <div className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
        {getIcon()}
        <span className="text-sm truncate flex-1">{asset.filename}</span>
        <Badge variant="outline" className="text-xs">{asset.category}</Badge>
      </div>
    );
  }

  return (
    <div className="aspect-square rounded border bg-muted/30 hover:bg-muted/50 cursor-pointer flex flex-col items-center justify-center p-2 gap-1">
      {asset.type === "image" && asset.url ? (
        <img src={asset.url} alt={asset.filename} className="w-full h-full object-cover rounded" />
      ) : (
        getIcon()
      )}
      <span className="text-xs truncate w-full text-center">{asset.filename}</span>
    </div>
  );
}
