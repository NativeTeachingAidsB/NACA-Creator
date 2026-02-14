import { useState, useCallback, useMemo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Folder, 
  FolderOpen,
  FileImage, 
  FileAudio, 
  FileVideo,
  FileText,
  ChevronRight, 
  ChevronDown,
  Home,
  RefreshCw,
  Search,
  Globe,
  AlertCircle,
  Gamepad2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nacaApi, type NACAFolderNode } from "@/lib/naca-api";
import { useNacaCommunities, useNacaDropboxBrowser } from "@/hooks/use-naca";

interface ActivityFolderBrowserProps {
  onSelectFile?: (file: NACAFolderNode) => void;
  onBindMedia?: (file: NACAFolderNode, bindType: 'image' | 'audio', communityId: string) => void;
  selectedObjectId?: string;
}

interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

export function ActivityFolderBrowser({ 
  onSelectFile, 
  onBindMedia,
  selectedObjectId 
}: ActivityFolderBrowserProps) {
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [currentPath, setCurrentPath] = useState<string>("/");
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { id: "root", name: "Root", path: "/" }
  ]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFile, setSelectedFile] = useState<NACAFolderNode | null>(null);
  
  const isConfigured = nacaApi.isConfigured();
  
  const { 
    data: communities = [], 
    isLoading: communitiesLoading 
  } = useNacaCommunities();
  
  const { 
    data: folderData, 
    isLoading: folderLoading,
    refetch: refetchFolder,
    error: folderError
  } = useNacaDropboxBrowser(selectedCommunity, { path: currentPath });

  const navigateToFolder = useCallback((folder: NACAFolderNode) => {
    setCurrentPath(folder.path);
    
    const pathParts = folder.path.split('/').filter(Boolean);
    const newBreadcrumbs: BreadcrumbItem[] = [
      { id: "root", name: "Root", path: "/" }
    ];
    
    let cumulativePath = "";
    for (const part of pathParts) {
      cumulativePath += `/${part}`;
      newBreadcrumbs.push({
        id: cumulativePath,
        name: part,
        path: cumulativePath
      });
    }
    
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const navigateToBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setCurrentPath(item.path);
    
    const index = breadcrumbs.findIndex(b => b.id === item.id);
    if (index >= 0) {
      setBreadcrumbs(breadcrumbs.slice(0, index + 1));
    }
  }, [breadcrumbs]);

  const toggleFolder = useCallback((folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  }, []);

  const handleFileSelect = useCallback((file: NACAFolderNode) => {
    setSelectedFile(file);
    onSelectFile?.(file);
  }, [onSelectFile]);

  const handleBindMedia = useCallback((file: NACAFolderNode, bindType: 'image' | 'audio') => {
    if (selectedCommunity) {
      onBindMedia?.(file, bindType, selectedCommunity);
    }
  }, [onBindMedia, selectedCommunity]);

  const filteredEntries = useMemo(() => {
    if (!folderData?.entries) return [];
    
    if (!searchTerm) return folderData.entries;
    
    const lowerSearch = searchTerm.toLowerCase();
    return folderData.entries.filter((entry) => 
      entry.name.toLowerCase().includes(lowerSearch)
    );
  }, [folderData?.entries, searchTerm]);

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Globe className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm font-medium">NACA Not Configured</p>
        <p className="text-xs text-muted-foreground mt-1">
          Configure NACA server URL in Vocabulary Panel settings
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b space-y-3">
        <Select value={selectedCommunity} onValueChange={(val) => {
          setSelectedCommunity(val);
          setCurrentPath("/");
          setBreadcrumbs([{ id: "root", name: "Root", path: "/" }]);
        }}>
          <SelectTrigger className="h-8 text-xs" data-testid="select-folder-community">
            <SelectValue placeholder={communitiesLoading ? "Loading..." : "Select community..."} />
          </SelectTrigger>
          <SelectContent>
            {communities.map((c) => (
              <SelectItem key={c.id} value={c.id} className="text-xs">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedCommunity && (
          <>
            <div className="flex items-center gap-1 flex-wrap text-xs">
              {breadcrumbs.map((item, index) => (
                <div key={item.id} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground mx-0.5" />}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-1.5 text-xs hover:bg-muted"
                    onClick={() => navigateToBreadcrumb(item)}
                    data-testid={`breadcrumb-${item.id}`}
                  >
                    {index === 0 ? <Home className="w-3 h-3" /> : item.name}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search files..."
                  className="h-7 text-xs pl-7"
                  data-testid="input-folder-search"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => refetchFolder()}
                disabled={folderLoading}
                data-testid="button-refresh-folder"
              >
                <RefreshCw className={cn("w-3 h-3", folderLoading && "animate-spin")} />
              </Button>
            </div>
          </>
        )}
      </div>

      <ScrollArea className="flex-1">
        {!selectedCommunity ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Folder className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">Select a community to browse</p>
          </div>
        ) : folderLoading ? (
          <div className="p-3 space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : folderError ? (
          <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
            <AlertCircle className="w-8 h-8 text-destructive mb-2" />
            <p className="text-xs text-destructive">Failed to load folder</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => refetchFolder()}
            >
              Retry
            </Button>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
            <Folder className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">
              {searchTerm ? "No matching files" : "This folder is empty"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {filteredEntries.map((entry) => (
              entry.type === 'folder' ? (
                <FolderRow
                  key={entry.id}
                  folder={entry}
                  isExpanded={expandedFolders.has(entry.id)}
                  onToggle={() => toggleFolder(entry.id)}
                  onNavigate={() => navigateToFolder(entry)}
                />
              ) : entry.type === 'activity' ? (
                <ActivityRow
                  key={entry.id}
                  activity={entry}
                  isSelected={selectedFile?.id === entry.id}
                  onSelect={() => handleFileSelect(entry)}
                />
              ) : (
                <FileRow
                  key={entry.id}
                  file={entry}
                  isSelected={selectedFile?.id === entry.id}
                  onSelect={() => handleFileSelect(entry)}
                  onBind={onBindMedia ? (bindType) => handleBindMedia(entry, bindType) : undefined}
                  showBindButtons={!!selectedObjectId}
                />
              )
            ))}
          </div>
        )}
      </ScrollArea>

      {selectedFile && selectedFile.type === 'file' && (
        <div className="p-3 border-t bg-muted/30 space-y-2">
          <div className="text-xs font-medium truncate">{selectedFile.name}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              {getFileTypeLabel(selectedFile.metadata?.mimeType as string)}
            </Badge>
            {typeof selectedFile.metadata?.size === 'number' && (
              <span>{formatFileSize(selectedFile.metadata.size)}</span>
            )}
          </div>
          {selectedObjectId && (
            <div className="flex gap-2 pt-1">
              {isImageFile(selectedFile.metadata?.mimeType as string) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => handleBindMedia(selectedFile, 'image')}
                  data-testid="button-bind-image"
                >
                  <FileImage className="w-3 h-3 mr-1" />
                  Bind as Image
                </Button>
              )}
              {isAudioFile(selectedFile.metadata?.mimeType as string) && (
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => handleBindMedia(selectedFile, 'audio')}
                  data-testid="button-bind-audio"
                >
                  <FileAudio className="w-3 h-3 mr-1" />
                  Bind as Audio
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface FolderRowProps {
  folder: NACAFolderNode;
  isExpanded: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}

function FolderRow({ folder, isExpanded, onToggle, onNavigate }: FolderRowProps) {
  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer group"
      onClick={onNavigate}
      data-testid={`folder-${folder.id}`}
    >
      <Button
        variant="ghost"
        size="sm"
        className="h-5 w-5 p-0"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
      >
        {isExpanded ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </Button>
      {isExpanded ? (
        <FolderOpen className="w-4 h-4 text-yellow-600" />
      ) : (
        <Folder className="w-4 h-4 text-yellow-600" />
      )}
      <span className="text-xs flex-1 truncate">{folder.name}</span>
      <ChevronRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
    </div>
  );
}

interface ActivityRowProps {
  activity: NACAFolderNode;
  isSelected: boolean;
  onSelect: () => void;
}

function ActivityRow({ activity, isSelected, onSelect }: ActivityRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group",
        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
      )}
      onClick={onSelect}
      data-testid={`activity-${activity.id}`}
    >
      <div className="w-5" />
      <Gamepad2 className="w-4 h-4 text-purple-500" />
      <span className="text-xs flex-1 truncate">{activity.name}</span>
      <Badge variant="outline" className="text-xs">Activity</Badge>
    </div>
  );
}

interface FileRowProps {
  file: NACAFolderNode;
  isSelected: boolean;
  onSelect: () => void;
  onBind?: (bindType: 'image' | 'audio') => void;
  showBindButtons?: boolean;
}

function FileRow({ file, isSelected, onSelect, onBind, showBindButtons }: FileRowProps) {
  const mimeType = file.metadata?.mimeType as string || '';
  const FileIcon = getFileIcon(mimeType);
  const thumbnailUrl = file.metadata?.thumbnailUrl as string;
  
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer group",
        isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
      )}
      onClick={onSelect}
      data-testid={`file-${file.id}`}
    >
      <div className="w-5" />
      <FileIcon className={cn(
        "w-4 h-4",
        getFileIconColor(mimeType)
      )} />
      <span className="text-xs flex-1 truncate">{file.name}</span>
      {thumbnailUrl && (
        <img 
          src={thumbnailUrl} 
          alt="" 
          className="w-6 h-6 object-cover rounded"
        />
      )}
      {showBindButtons && onBind && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
          {isImageFile(mimeType) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onBind('image');
              }}
              title="Bind as image"
            >
              <FileImage className="w-3 h-3" />
            </Button>
          )}
          {isAudioFile(mimeType) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onBind('audio');
              }}
              title="Bind as audio"
            >
              <FileAudio className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function getFileIcon(mimeType: string) {
  if (mimeType?.startsWith('image/')) return FileImage;
  if (mimeType?.startsWith('audio/')) return FileAudio;
  if (mimeType?.startsWith('video/')) return FileVideo;
  return FileText;
}

function getFileIconColor(mimeType: string): string {
  if (mimeType?.startsWith('image/')) return 'text-blue-500';
  if (mimeType?.startsWith('audio/')) return 'text-green-500';
  if (mimeType?.startsWith('video/')) return 'text-purple-500';
  return 'text-gray-500';
}

function getFileTypeLabel(mimeType: string): string {
  if (mimeType?.startsWith('image/')) return 'Image';
  if (mimeType?.startsWith('audio/')) return 'Audio';
  if (mimeType?.startsWith('video/')) return 'Video';
  return 'File';
}

function isImageFile(mimeType: string): boolean {
  return mimeType?.startsWith('image/') || false;
}

function isAudioFile(mimeType: string): boolean {
  return mimeType?.startsWith('audio/') || false;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
