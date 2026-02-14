import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, Edit, Trash2, Video, HelpCircle, Search, Eye, Check, X, Clock, Film, BarChart3, TrendingUp, Play, CheckSquare, Square
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { FeatureHelp, InsertFeatureHelp, HelpVideoCandidate } from "@shared/schema";
import { insertFeatureHelpSchema } from "@shared/schema";
import {
  useFeatureHelp,
  useCreateFeatureHelp,
  useUpdateFeatureHelp,
  useDeleteFeatureHelp,
  useFeatureHelpAnalytics,
} from "@/hooks/use-feature-help";
import {
  useVideoCandidates,
  useApproveVideoCandidate,
  useRejectVideoCandidate,
  useDeleteVideoCandidate,
} from "@/hooks/use-video-candidates";

const CATEGORIES = [
  { value: "canvas", label: "Canvas" },
  { value: "timeline", label: "Timeline" },
  { value: "objects", label: "Objects" },
  { value: "triggers", label: "Triggers" },
  { value: "scenes", label: "Scenes" },
  { value: "vocabulary", label: "Vocabulary" },
  { value: "figma", label: "Figma Integration" },
  { value: "shortcuts", label: "Keyboard Shortcuts" },
];

interface HelpFormData {
  featureKey: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  category: string;
  shortcutKey: string;
  order: number;
  isNew: boolean;
}

const emptyFormData: HelpFormData = {
  featureKey: "",
  title: "",
  description: "",
  videoUrl: "",
  thumbnailUrl: "",
  category: "canvas",
  shortcutKey: "",
  order: 0,
  isNew: true,
};

function formDataToInsert(data: HelpFormData): InsertFeatureHelp {
  return {
    featureKey: data.featureKey,
    title: data.title,
    description: data.description,
    videoUrl: data.videoUrl || undefined,
    thumbnailUrl: data.thumbnailUrl || undefined,
    category: data.category,
    shortcutKey: data.shortcutKey || undefined,
    order: data.order,
    isNew: data.isNew,
  };
}

function getChangedFields(
  original: FeatureHelp,
  updated: HelpFormData
): Partial<InsertFeatureHelp> {
  const changes: Partial<InsertFeatureHelp> = {};
  
  if (updated.title !== original.title) changes.title = updated.title;
  if ((updated.description || "") !== (original.description || "")) {
    changes.description = updated.description || undefined;
  }
  if ((updated.videoUrl || "") !== (original.videoUrl || "")) {
    changes.videoUrl = updated.videoUrl || undefined;
  }
  if ((updated.thumbnailUrl || "") !== (original.thumbnailUrl || "")) {
    changes.thumbnailUrl = updated.thumbnailUrl || undefined;
  }
  if ((updated.category || "") !== (original.category || "")) {
    changes.category = updated.category || undefined;
  }
  if ((updated.shortcutKey || "") !== (original.shortcutKey || "")) {
    changes.shortcutKey = updated.shortcutKey || undefined;
  }
  if (updated.order !== (original.order ?? 0)) changes.order = updated.order;
  if (updated.isNew !== (original.isNew ?? false)) changes.isNew = updated.isNew;
  
  return changes;
}

export function HelpAdminPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHelp, setEditingHelp] = useState<FeatureHelp | null>(null);
  const [formData, setFormData] = useState<HelpFormData>(emptyFormData);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewingCandidate, setPreviewingCandidate] = useState<HelpVideoCandidate | null>(null);
  const [activeTab, setActiveTab] = useState<"topics" | "videos" | "analytics">("topics");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingCandidate, setRejectingCandidate] = useState<HelpVideoCandidate | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [videoStatusFilter, setVideoStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());
  const [batchRejectDialogOpen, setBatchRejectDialogOpen] = useState(false);
  const [batchRejectReason, setBatchRejectReason] = useState("");
  const [replaceConfirmDialogOpen, setReplaceConfirmDialogOpen] = useState(false);
  const [pendingApprovalCandidate, setPendingApprovalCandidate] = useState<HelpVideoCandidate | null>(null);
  const [existingVideoHelpItem, setExistingVideoHelpItem] = useState<FeatureHelp | null>(null);

  const { data: helpItems = [], isLoading } = useFeatureHelp();
  const createMutation = useCreateFeatureHelp();
  const updateMutation = useUpdateFeatureHelp();
  const deleteMutation = useDeleteFeatureHelp();

  const { data: videoCandidates = [], isLoading: isLoadingVideos } = useVideoCandidates();
  const approveMutation = useApproveVideoCandidate();
  const rejectMutation = useRejectVideoCandidate();
  const deleteVideoMutation = useDeleteVideoCandidate();

  const { data: analytics, isLoading: isLoadingAnalytics } = useFeatureHelpAnalytics();

  const filteredVideoCandidates = useMemo(() => {
    return videoCandidates.filter(v => {
      const matchesStatus = videoStatusFilter === "all" || v.status === videoStatusFilter;
      const matchesSearch = !videoSearchQuery || 
        v.featureKey.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
        v.testDescription?.toLowerCase().includes(videoSearchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [videoCandidates, videoStatusFilter, videoSearchQuery]);

  const pendingVideos = useMemo(() => 
    filteredVideoCandidates.filter(v => v.status === "pending"), 
    [filteredVideoCandidates]
  );
  const approvedVideos = useMemo(() => 
    filteredVideoCandidates.filter(v => v.status === "approved"), 
    [filteredVideoCandidates]
  );
  const rejectedVideos = useMemo(() => 
    filteredVideoCandidates.filter(v => v.status === "rejected"), 
    [filteredVideoCandidates]
  );
  
  const selectableVideos = useMemo(() => 
    filteredVideoCandidates.filter(v => v.status === "pending"),
    [filteredVideoCandidates]
  );
  
  const allSelectableSelected = useMemo(() => 
    selectableVideos.length > 0 && selectableVideos.every(v => selectedVideoIds.has(v.id)),
    [selectableVideos, selectedVideoIds]
  );
  
  const someSelectableSelected = useMemo(() => 
    selectableVideos.some(v => selectedVideoIds.has(v.id)),
    [selectableVideos, selectedVideoIds]
  );

  const filteredItems = useMemo(() => {
    return helpItems.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.featureKey.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [helpItems, searchQuery, categoryFilter]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const category = item.category || "uncategorized";
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, FeatureHelp[]>);
  }, [filteredItems]);

  const handleEdit = (item: FeatureHelp) => {
    setEditingHelp(item);
    setFormData({
      featureKey: item.featureKey,
      title: item.title,
      description: item.description || "",
      videoUrl: item.videoUrl || "",
      thumbnailUrl: item.thumbnailUrl || "",
      category: item.category || "canvas",
      shortcutKey: item.shortcutKey || "",
      order: item.order ?? 0,
      isNew: item.isNew ?? false,
    });
    setIsEditDialogOpen(true);
  };

  const handleCreate = () => {
    setFormData(emptyFormData);
    setIsCreateDialogOpen(true);
  };

  const handleSubmitCreate = () => {
    const insertData = formDataToInsert(formData);
    
    const parseResult = insertFeatureHelpSchema.safeParse(insertData);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(e => e.message).join(", ");
      toast({ title: `Validation error: ${errorMessages}`, variant: "destructive" });
      return;
    }
    
    createMutation.mutate(parseResult.data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        setFormData(emptyFormData);
        toast({ title: "Help item created successfully" });
      },
      onError: () => {
        toast({ title: "Failed to create help item", variant: "destructive" });
      },
    });
  };

  const handleSubmitEdit = () => {
    if (!editingHelp) {
      return;
    }
    
    const changes = getChangedFields(editingHelp, formData);
    
    if (Object.keys(changes).length === 0) {
      setIsEditDialogOpen(false);
      setEditingHelp(null);
      toast({ title: "No changes to save" });
      return;
    }
    
    const parseResult = insertFeatureHelpSchema.partial().safeParse(changes);
    if (!parseResult.success) {
      const errorMessages = parseResult.error.errors.map(e => e.message).join(", ");
      toast({ title: `Validation error: ${errorMessages}`, variant: "destructive" });
      return;
    }
    
    updateMutation.mutate({ id: editingHelp.id, ...parseResult.data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setEditingHelp(null);
        setFormData(emptyFormData);
        toast({ title: "Help item updated successfully" });
      },
      onError: () => {
        toast({ title: "Failed to update help item", variant: "destructive" });
      },
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this help item?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast({ title: "Help item deleted successfully" });
        },
        onError: () => {
          toast({ title: "Failed to delete help item", variant: "destructive" });
        },
      });
    }
  };

  const handleApproveVideo = (candidate: HelpVideoCandidate) => {
    // Check if the help topic already has a video
    const existingHelpItem = helpItems.find(h => h.featureKey === candidate.featureKey);
    
    if (existingHelpItem?.videoUrl) {
      // Show confirmation dialog for replacing existing video
      setPendingApprovalCandidate(candidate);
      setExistingVideoHelpItem(existingHelpItem);
      setReplaceConfirmDialogOpen(true);
    } else {
      // No existing video, approve directly
      executeApproval(candidate);
    }
  };

  const executeApproval = (candidate: HelpVideoCandidate) => {
    approveMutation.mutate({ id: candidate.id, approvedBy: "admin" }, {
      onSuccess: () => {
        toast({ 
          title: "Video approved and linked", 
          description: `Video is now linked to "${candidate.featureKey}"` 
        });
      },
      onError: () => {
        toast({ title: "Failed to approve video", variant: "destructive" });
      },
    });
  };

  const handleConfirmReplacement = () => {
    if (pendingApprovalCandidate) {
      executeApproval(pendingApprovalCandidate);
      setReplaceConfirmDialogOpen(false);
      setPendingApprovalCandidate(null);
      setExistingVideoHelpItem(null);
    }
  };

  const handleCancelReplacement = () => {
    setReplaceConfirmDialogOpen(false);
    setPendingApprovalCandidate(null);
    setExistingVideoHelpItem(null);
  };

  const handleOpenRejectDialog = (candidate: HelpVideoCandidate) => {
    setRejectingCandidate(candidate);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectVideo = () => {
    if (!rejectingCandidate) return;
    
    rejectMutation.mutate({ id: rejectingCandidate.id, reason: rejectReason }, {
      onSuccess: () => {
        toast({ title: "Video rejected" });
        setRejectDialogOpen(false);
        setRejectingCandidate(null);
      },
      onError: () => {
        toast({ title: "Failed to reject video", variant: "destructive" });
      },
    });
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm("Are you sure you want to delete this video candidate?")) {
      deleteVideoMutation.mutate(id, {
        onSuccess: () => {
          toast({ title: "Video deleted successfully" });
        },
        onError: () => {
          toast({ title: "Failed to delete video", variant: "destructive" });
        },
      });
    }
  };

  const toggleVideoSelection = (id: string) => {
    setSelectedVideoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (allSelectableSelected) {
      setSelectedVideoIds(new Set());
    } else {
      setSelectedVideoIds(new Set(selectableVideos.map(v => v.id)));
    }
  };

  const clearSelection = () => {
    setSelectedVideoIds(new Set());
  };

  const handleBatchApprove = async () => {
    const selectedPending = Array.from(selectedVideoIds)
      .map(id => videoCandidates.find(v => v.id === id))
      .filter((v): v is HelpVideoCandidate => v !== undefined && v.status === "pending");
    
    if (selectedPending.length === 0) {
      toast({ title: "No pending videos selected", variant: "destructive" });
      return;
    }
    
    let successCount = 0;
    let failCount = 0;
    
    for (const candidate of selectedPending) {
      try {
        await new Promise<void>((resolve, reject) => {
          approveMutation.mutate({ id: candidate.id, approvedBy: "admin" }, {
            onSuccess: () => {
              successCount++;
              resolve();
            },
            onError: () => {
              failCount++;
              reject();
            },
          });
        });
      } catch {
        // Continue with next candidate
      }
    }
    
    clearSelection();
    if (successCount > 0) {
      toast({ title: `Approved ${successCount} video${successCount > 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}` });
    } else if (failCount > 0) {
      toast({ title: `Failed to approve ${failCount} video${failCount > 1 ? 's' : ''}`, variant: "destructive" });
    }
  };

  const openBatchRejectDialog = () => {
    const selectedPending = Array.from(selectedVideoIds)
      .map(id => videoCandidates.find(v => v.id === id))
      .filter((v): v is HelpVideoCandidate => v !== undefined && v.status === "pending");
    
    if (selectedPending.length === 0) {
      toast({ title: "No pending videos selected", variant: "destructive" });
      return;
    }
    
    setBatchRejectReason("");
    setBatchRejectDialogOpen(true);
  };

  const handleBatchReject = async () => {
    const selectedPending = Array.from(selectedVideoIds)
      .map(id => videoCandidates.find(v => v.id === id))
      .filter((v): v is HelpVideoCandidate => v !== undefined && v.status === "pending");
    
    let successCount = 0;
    let failCount = 0;
    
    for (const candidate of selectedPending) {
      try {
        await new Promise<void>((resolve, reject) => {
          rejectMutation.mutate({ id: candidate.id, reason: batchRejectReason }, {
            onSuccess: () => {
              successCount++;
              resolve();
            },
            onError: () => {
              failCount++;
              reject();
            },
          });
        });
      } catch {
        // Continue with next candidate
      }
    }
    
    clearSelection();
    setBatchRejectDialogOpen(false);
    if (successCount > 0) {
      toast({ title: `Rejected ${successCount} video${successCount > 1 ? 's' : ''}${failCount > 0 ? `, ${failCount} failed` : ''}` });
    } else if (failCount > 0) {
      toast({ title: `Failed to reject ${failCount} video${failCount > 1 ? 's' : ''}`, variant: "destructive" });
    }
  };

  const handlePreviewVideo = (candidate: HelpVideoCandidate) => {
    setPreviewingCandidate(candidate);
    setPreviewVideoUrl(candidate.videoUrl);
  };

  const closeVideoPreview = () => {
    setPreviewVideoUrl(null);
    setPreviewingCandidate(null);
  };

  const renderVideoCard = (candidate: HelpVideoCandidate, showActions: boolean = true) => {
    const isSelected = selectedVideoIds.has(candidate.id);
    const canSelect = candidate.status === "pending";
    
    return (
    <Card key={candidate.id} className={`group ${isSelected ? 'ring-2 ring-primary' : ''}`} data-testid={`video-card-${candidate.id}`}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {canSelect && (
            <div className="flex items-center">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleVideoSelection(candidate.id)}
                data-testid={`checkbox-video-${candidate.id}`}
              />
            </div>
          )}
          <div 
            className="w-32 h-20 bg-muted rounded overflow-hidden flex-shrink-0 cursor-pointer relative group/thumbnail"
            onClick={() => handlePreviewVideo(candidate)}
            data-testid={`video-thumbnail-${candidate.id}`}
          >
            {candidate.thumbnailUrl ? (
              <img 
                src={candidate.thumbnailUrl} 
                alt="Video thumbnail" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                <Film className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumbnail:opacity-100 transition-opacity flex items-center justify-center">
              <Play className="h-8 w-8 text-white" />
            </div>
            {candidate.duration && (
              <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 py-0.5 rounded">
                {Math.floor(candidate.duration / 60)}:{String(candidate.duration % 60).padStart(2, "0")}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
                {candidate.featureKey}
              </code>
              <Badge 
                variant={
                  candidate.status === "approved" ? "default" : 
                  candidate.status === "rejected" ? "destructive" : 
                  "secondary"
                }
                className="text-xs"
              >
                {candidate.status}
              </Badge>
            </div>
            <p className="text-sm line-clamp-2 mb-2">{candidate.testDescription}</p>
            <p className="text-xs text-muted-foreground">
              Captured: {new Date(candidate.capturedAt).toLocaleString()}
            </p>
            {candidate.rejectionReason && (
              <p className="text-xs text-destructive mt-1">
                Reason: {candidate.rejectionReason}
              </p>
            )}
          </div>
          {showActions && candidate.status === "pending" && (
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                variant="default"
                className="h-8"
                onClick={() => handleApproveVideo(candidate)}
                disabled={approveMutation.isPending}
                data-testid={`button-approve-video-${candidate.id}`}
              >
                <Check className="h-3 w-3 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
                onClick={() => handleOpenRejectDialog(candidate)}
                disabled={rejectMutation.isPending}
                data-testid={`button-reject-video-${candidate.id}`}
              >
                <X className="h-3 w-3 mr-1" />
                Reject
              </Button>
            </div>
          )}
          {showActions && candidate.status !== "pending" && (
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive"
              onClick={() => handleDeleteVideo(candidate.id)}
              data-testid={`button-delete-video-${candidate.id}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
  };

  const renderForm = (isEdit: boolean) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="featureKey">Feature Key</Label>
          <Input
            id="featureKey"
            value={formData.featureKey}
            onChange={(e) => setFormData({ ...formData, featureKey: e.target.value })}
            placeholder="e.g., timeline-playback"
            disabled={isEdit}
            data-testid="input-feature-key"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v })}
          >
            <SelectTrigger data-testid="select-category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Help topic title"
          data-testid="input-title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Detailed description of the feature..."
          rows={4}
          data-testid="input-description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="videoUrl">Video URL</Label>
          <div className="flex gap-2">
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="/help_videos/feature.mp4"
              data-testid="input-video-url"
            />
            {formData.videoUrl && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setPreviewVideoUrl(formData.videoUrl)}
                data-testid="button-preview-video"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="shortcutKey">Keyboard Shortcut</Label>
          <Input
            id="shortcutKey"
            value={formData.shortcutKey}
            onChange={(e) => setFormData({ ...formData, shortcutKey: e.target.value })}
            placeholder="e.g., Cmd+Z, Space"
            data-testid="input-shortcut-key"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="order">Display Order</Label>
          <Input
            id="order"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            data-testid="input-order"
          />
        </div>
        <div className="space-y-2 flex items-end">
          <div className="flex items-center gap-2">
            <Switch
              id="isNew"
              checked={formData.isNew}
              onCheckedChange={(checked) => setFormData({ ...formData, isNew: checked })}
              data-testid="switch-is-new"
            />
            <Label htmlFor="isNew">Mark as New</Label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5" />
          <h2 className="font-semibold">Help Content Manager</h2>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "topics" | "videos" | "analytics")} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b">
          <TabsList className="grid w-full max-w-lg grid-cols-3">
            <TabsTrigger value="topics" className="gap-2" data-testid="tab-topics">
              <HelpCircle className="h-4 w-4" />
              Topics
              <Badge variant="secondary" className="ml-1">{helpItems.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2" data-testid="tab-videos">
              <Film className="h-4 w-4" />
              Videos
              {pendingVideos.length > 0 && (
                <Badge variant="default" className="ml-1">{pendingVideos.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2" data-testid="tab-analytics">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="topics" className="flex-1 flex flex-col m-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search help topics..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="input-search-help"
                />
              </div>
              <Select
                value={categoryFilter || "all"}
                onValueChange={(v) => setCategoryFilter(v === "all" ? null : v)}
              >
                <SelectTrigger className="w-40" data-testid="select-filter-category">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleCreate} size="sm" className="ml-4" data-testid="button-create-help">
              <Plus className="h-4 w-4 mr-2" />
              Add Help Topic
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-8">Loading...</div>
              ) : Object.keys(groupedItems).length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No help topics found. Create one to get started.
                </div>
              ) : (
                Object.entries(groupedItems)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([category, items]) => (
                    <div key={category} className="space-y-3">
                      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {CATEGORIES.find((c) => c.value === category)?.label || category}
                      </h3>
                      <div className="space-y-2">
                        {items
                          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                          .map((item) => (
                            <Card key={item.id} className="group">
                              <CardContent className="p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-medium truncate">{item.title}</span>
                                      {item.isNew && (
                                        <Badge variant="default" className="text-xs">New</Badge>
                                      )}
                                      {item.videoUrl && (
                                        <Video className="h-3 w-3 text-muted-foreground" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                                      {item.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <code className="px-1 py-0.5 bg-muted rounded text-[10px]">
                                        {item.featureKey}
                                      </code>
                                      {item.shortcutKey && (
                                        <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">
                                          {item.shortcutKey}
                                        </kbd>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => handleEdit(item)}
                                      data-testid={`button-edit-${item.featureKey}`}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => handleDelete(item.id)}
                                      data-testid={`button-delete-${item.featureKey}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="videos" className="flex-1 flex flex-col m-0 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b gap-4">
            <div className="flex gap-2 flex-1">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  className="pl-10"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                  data-testid="input-search-videos"
                />
              </div>
              <Select
                value={videoStatusFilter}
                onValueChange={(v) => setVideoStatusFilter(v as "all" | "pending" | "approved" | "rejected")}
              >
                <SelectTrigger className="w-32" data-testid="select-video-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectableVideos.length > 0 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  data-testid="button-select-all"
                >
                  {allSelectableSelected ? (
                    <>
                      <Square className="h-4 w-4 mr-1" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-4 w-4 mr-1" />
                      Select All ({selectableVideos.length})
                    </>
                  )}
                </Button>
                {someSelectableSelected && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleBatchApprove}
                      disabled={approveMutation.isPending}
                      data-testid="button-batch-approve"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Approve ({selectedVideoIds.size})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={openBatchRejectDialog}
                      disabled={rejectMutation.isPending}
                      data-testid="button-batch-reject"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Reject ({selectedVideoIds.size})
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {isLoadingVideos ? (
                <div className="text-center text-muted-foreground py-8">Loading video candidates...</div>
              ) : filteredVideoCandidates.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <Film className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  {videoCandidates.length === 0 ? (
                    <>
                      <p className="font-medium">No video candidates yet</p>
                      <p className="text-sm mt-1">Test recordings will appear here for review and approval.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium">No matching videos</p>
                      <p className="text-sm mt-1">Try adjusting your search or filter criteria.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {pendingVideos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <h3 className="text-sm font-medium">Pending Review ({pendingVideos.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {pendingVideos.map((candidate) => renderVideoCard(candidate))}
                      </div>
                    </div>
                  )}
                  
                  {approvedVideos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <h3 className="text-sm font-medium">Approved ({approvedVideos.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {approvedVideos.map((candidate) => renderVideoCard(candidate))}
                      </div>
                    </div>
                  )}
                  
                  {rejectedVideos.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <X className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-medium">Rejected ({rejectedVideos.length})</h3>
                      </div>
                      <div className="space-y-2">
                        {rejectedVideos.map((candidate) => renderVideoCard(candidate))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 flex flex-col m-0 overflow-hidden">
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              {isLoadingAnalytics ? (
                <div className="text-center text-muted-foreground py-8">Loading analytics...</div>
              ) : !analytics ? (
                <div className="text-center text-muted-foreground py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No analytics data yet</p>
                  <p className="text-sm mt-1">View statistics will appear as users access help content.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                            <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Views</p>
                            <p className="text-2xl font-bold" data-testid="text-total-views">{analytics.totalViews}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/30">
                            <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Help Topics</p>
                            <p className="text-2xl font-bold" data-testid="text-total-topics">{helpItems.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/30">
                            <Video className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">With Videos</p>
                            <p className="text-2xl font-bold" data-testid="text-topics-with-videos">
                              {helpItems.filter(h => h.videoUrl).length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {analytics.topViewed.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                        <h3 className="text-sm font-medium">Most Viewed Topics</h3>
                      </div>
                      <div className="space-y-2">
                        {analytics.topViewed.map((item, index) => (
                          <Card key={item.id} data-testid={`card-top-viewed-${index}`}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <span className="text-lg font-semibold text-muted-foreground w-6">
                                    #{index + 1}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm">{item.title}</p>
                                    <p className="text-xs text-muted-foreground">{item.category}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="gap-1">
                                    <Eye className="h-3 w-3" />
                                    {item.viewCount} views
                                  </Badge>
                                  {item.videoUrl && <Video className="h-4 w-4 text-muted-foreground" />}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {analytics.recentlyViewed.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <h3 className="text-sm font-medium">Recently Viewed</h3>
                      </div>
                      <div className="space-y-2">
                        {analytics.recentlyViewed.map((item) => (
                          <Card key={item.id} data-testid={`card-recently-viewed-${item.featureKey}`}>
                            <CardContent className="py-3 px-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-sm">{item.title}</p>
                                  <p className="text-xs text-muted-foreground">{item.category}</p>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  {item.lastViewedAt && (
                                    <span>Last viewed: {new Date(item.lastViewedAt).toLocaleDateString()}</span>
                                  )}
                                  <Badge variant="outline" className="gap-1">
                                    <Eye className="h-3 w-3" />
                                    {item.viewCount}
                                  </Badge>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Help Topic</DialogTitle>
          </DialogHeader>
          {renderForm(false)}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitCreate}
              disabled={createMutation.isPending}
              data-testid="button-submit-create"
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Help Topic</DialogTitle>
          </DialogHeader>
          {renderForm(true)}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateMutation.isPending}
              data-testid="button-submit-edit"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Video</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejecting this video candidate.
            </p>
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              data-testid="input-reject-reason"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleRejectVideo}
              disabled={rejectMutation.isPending}
              data-testid="button-submit-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewVideoUrl} onOpenChange={closeVideoPreview}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden" data-testid="video-preview-dialog">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Film className="h-5 w-5" />
              Video Preview
            </DialogTitle>
          </DialogHeader>
          {previewVideoUrl && (
            <>
              <div className="aspect-video bg-black">
                <video
                  src={previewVideoUrl}
                  className="w-full h-full object-contain"
                  controls
                  autoPlay
                  data-testid="video-player"
                />
              </div>
              {previewingCandidate && (
                <div className="p-4 border-t bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
                          {previewingCandidate.featureKey}
                        </code>
                        <Badge 
                          variant={
                            previewingCandidate.status === "approved" ? "default" : 
                            previewingCandidate.status === "rejected" ? "destructive" : 
                            "secondary"
                          }
                        >
                          {previewingCandidate.status}
                        </Badge>
                        {previewingCandidate.duration && (
                          <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.floor(previewingCandidate.duration / 60)}:{String(previewingCandidate.duration % 60).padStart(2, "0")}
                          </span>
                        )}
                      </div>
                      {previewingCandidate.testDescription && (
                        <p className="text-sm text-muted-foreground">
                          {previewingCandidate.testDescription}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Captured: {new Date(previewingCandidate.capturedAt).toLocaleString()}
                      </p>
                      {previewingCandidate.rejectionReason && (
                        <p className="text-sm text-destructive">
                          Rejected: {previewingCandidate.rejectionReason}
                        </p>
                      )}
                    </div>
                    {previewingCandidate.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => {
                            handleApproveVideo(previewingCandidate);
                            closeVideoPreview();
                          }}
                          disabled={approveMutation.isPending}
                          data-testid="button-preview-approve"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            handleOpenRejectDialog(previewingCandidate);
                            closeVideoPreview();
                          }}
                          disabled={rejectMutation.isPending}
                          data-testid="button-preview-reject"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={batchRejectDialogOpen} onOpenChange={setBatchRejectDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject {selectedVideoIds.size} Video{selectedVideoIds.size > 1 ? 's' : ''}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Provide a reason for rejecting the selected video candidates.
            </p>
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={batchRejectReason}
              onChange={(e) => setBatchRejectReason(e.target.value)}
              data-testid="input-batch-reject-reason"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleBatchReject}
              disabled={rejectMutation.isPending}
              data-testid="button-submit-batch-reject"
            >
              {rejectMutation.isPending ? "Rejecting..." : `Reject ${selectedVideoIds.size} Video${selectedVideoIds.size > 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={replaceConfirmDialogOpen} onOpenChange={(open) => !open && handleCancelReplacement()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5 text-amber-500" />
              Replace Existing Video?
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              The help topic <code className="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">{pendingApprovalCandidate?.featureKey}</code> already has a video linked.
            </p>
            {existingVideoHelpItem && (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="text-sm font-medium mb-1">{existingVideoHelpItem.title}</p>
                <p className="text-xs text-muted-foreground">
                  Current video: <code className="text-xs">{existingVideoHelpItem.videoUrl}</code>
                </p>
              </div>
            )}
            <p className="text-sm">
              Approving this video will <span className="font-medium text-amber-600">replace</span> the existing video with the new one.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelReplacement} data-testid="button-cancel-replace">
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleConfirmReplacement}
              disabled={approveMutation.isPending}
              data-testid="button-confirm-replace"
            >
              {approveMutation.isPending ? "Replacing..." : "Replace Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
