import * as React from "react";
import { useFeatureHelp } from "@/hooks/use-feature-help";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, Play, Pause, X, ChevronRight, BookOpen, Video, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import type { FeatureHelp } from "@shared/schema";

interface HelpPanelProps {
  onClose?: () => void;
}

export function HelpPanel({ onClose }: HelpPanelProps) {
  const { data: helpItems, isLoading } = useFeatureHelp();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedItem, setSelectedItem] = React.useState<FeatureHelp | null>(null);

  const filteredItems = React.useMemo(() => {
    if (!helpItems) return [];
    if (!searchQuery.trim()) return helpItems;
    
    const query = searchQuery.toLowerCase();
    return helpItems.filter(
      (item) =>
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.shortcutKey?.toLowerCase().includes(query))
    );
  }, [helpItems, searchQuery]);

  const groupedItems = React.useMemo(() => {
    const groups: Record<string, FeatureHelp[]> = {};
    for (const item of filteredItems) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [filteredItems]);

  const categoryNames: Record<string, string> = {
    timeline: "Timeline & Animation",
    canvas: "Canvas & Selection",
    objects: "Game Objects",
    scenes: "Scenes & States",
    triggers: "Triggers & Actions",
    vocabulary: "Vocabulary",
    figma: "Figma Integration",
    general: "General",
  };

  return (
    <div className="flex flex-col h-full bg-background border-l" data-testid="help-panel">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-sm">Help & Tutorials</h2>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onClose}
            data-testid="help-panel-close"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="px-4 py-2 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
            data-testid="help-search-input"
          />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-muted-foreground">Loading help topics...</div>
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <HelpCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No matching help topics found" : "No help topics available yet"}
              </p>
            </div>
          ) : (
            <Accordion type="multiple" defaultValue={Object.keys(groupedItems)} className="px-2 py-2">
              {Object.entries(groupedItems).map(([category, items]) => (
                <AccordionItem key={category} value={category} className="border-none">
                  <AccordionTrigger className="px-2 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground hover:no-underline">
                    {categoryNames[category] || category}
                    <span className="ml-1 text-[10px] font-normal">({items.length})</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-2">
                    <div className="space-y-0.5">
                      {items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setSelectedItem(item)}
                          className={cn(
                            "w-full flex items-start gap-2 px-2 py-1.5 rounded-md text-left text-sm hover:bg-muted transition-colors",
                            selectedItem?.id === item.id && "bg-muted"
                          )}
                          data-testid={`help-item-${item.featureKey}`}
                        >
                          {item.videoUrl ? (
                            <Video className="h-4 w-4 mt-0.5 text-blue-500 shrink-0" />
                          ) : (
                            <HelpCircle className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{item.title}</div>
                            {item.shortcutKey && (
                              <div className="flex gap-1 mt-0.5">
                                {item.shortcutKey.split(",").slice(0, 2).map((key: string, i: number) => (
                                  <kbd key={i} className="px-1 py-0.5 text-[10px] font-mono bg-muted-foreground/10 rounded">
                                    {key.trim()}
                                  </kbd>
                                ))}
                              </div>
                            )}
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                        </button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </ScrollArea>

        {selectedItem && (
          <HelpDetailView
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </div>

      <div className="px-4 py-2 border-t">
        <Link href="/admin/help">
          <Button variant="ghost" size="sm" className="w-full gap-2 text-muted-foreground hover:text-foreground" data-testid="link-help-admin">
            <Settings className="h-3.5 w-3.5" />
            Manage Help Content
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface HelpDetailViewProps {
  item: FeatureHelp;
  onClose: () => void;
}

function HelpDetailView({ item, onClose }: HelpDetailViewProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    if (videoRef.current && item.videoUrl) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [item.id, item.videoUrl]);

  return (
    <div className="w-80 border-l flex flex-col bg-muted/30" data-testid={`help-detail-${item.featureKey}`}>
      <div className="flex items-center justify-between px-3 py-2 border-b bg-background">
        <h3 className="font-medium text-sm truncate">{item.title}</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={onClose}
          data-testid="help-detail-close"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {item.videoUrl && (
            <div className="relative rounded-md overflow-hidden bg-black aspect-video">
              <video
                ref={videoRef}
                src={item.videoUrl}
                className="w-full h-full object-contain"
                loop
                muted
                playsInline
                controls
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          <p className="text-sm text-muted-foreground leading-relaxed">
            {item.description}
          </p>

          {item.shortcutKey && (
            <div className="space-y-1.5">
              <div className="text-xs font-medium text-muted-foreground">Keyboard Shortcuts</div>
              <div className="flex flex-wrap gap-1.5">
                {item.shortcutKey.split(",").map((shortcut: string, i: number) => (
                  <kbd
                    key={i}
                    className="px-2 py-1 text-xs font-mono bg-background rounded border"
                  >
                    {shortcut.trim()}
                  </kbd>
                ))}
              </div>
            </div>
          )}

          {item.relatedFeatures && item.relatedFeatures.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t">
              <div className="text-xs font-medium text-muted-foreground">Related Features</div>
              <div className="flex flex-wrap gap-1">
                {item.relatedFeatures.map((key: string, i: number) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 text-xs bg-muted rounded"
                  >
                    {key}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
