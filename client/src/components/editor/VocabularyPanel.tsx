import { useState, useEffect, type KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Book, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Volume2, 
  Tag,
  X,
  ChevronDown,
  ChevronUp,
  Globe,
  Download,
  RefreshCw,
  Settings,
  Check,
  Search,
  Loader2
} from "lucide-react";
import { useVocabulary, useCreateVocabulary, useDeleteVocabulary } from "@/hooks/use-game-data";
import { toast } from "@/hooks/use-toast";
import type { Vocabulary } from "@shared/schema";
import { nacaApi, type NACACommunity, type NACADictionary, type NACADictionaryEntry } from "@/lib/naca-api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface VocabularyPanelProps {
  projectId?: string;
}

export function VocabularyPanel({ projectId }: VocabularyPanelProps) {
  const { data: vocabulary = [], isLoading } = useVocabulary();
  const createVocabulary = useCreateVocabulary();
  const deleteVocabulary = useDeleteVocabulary();
  
  const [isAdding, setIsAdding] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    word: "",
    translation: "",
    imageUrl: "",
    audioUrl: "",
    category: ""
  });
  const [activeTab, setActiveTab] = useState<string>("local");
  const [nacaBaseUrl, setNacaBaseUrl] = useState(nacaApi.getBaseUrl());
  const [showNacaSettings, setShowNacaSettings] = useState(false);

  const handleSubmit = () => {
    if (!newItem.word.trim() || !newItem.translation.trim()) {
      toast({ 
        title: "Required fields missing", 
        description: "Word and translation are required",
        variant: "destructive"
      });
      return;
    }

    createVocabulary.mutate({
      projectId: projectId,
      word: newItem.word.trim(),
      translation: newItem.translation.trim(),
      imageUrl: newItem.imageUrl.trim() || null,
      audioUrl: newItem.audioUrl.trim() || null,
      category: newItem.category.trim() || null
    }, {
      onSuccess: () => {
        toast({ title: "Vocabulary added", description: `Added "${newItem.word}"` });
        setNewItem({ word: "", translation: "", imageUrl: "", audioUrl: "", category: "" });
        setIsAdding(false);
      },
      onError: () => {
        toast({ title: "Failed to add", variant: "destructive" });
      }
    });
  };

  const handleDelete = (id: string, word: string) => {
    deleteVocabulary.mutate(id, {
      onSuccess: () => {
        toast({ title: "Deleted", description: `Removed "${word}"` });
        if (expandedId === id) setExpandedId(null);
      },
      onError: () => {
        toast({ title: "Failed to delete", variant: "destructive" });
      }
    });
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleImportFromNaca = (entry: NACADictionaryEntry) => {
    createVocabulary.mutate({
      projectId: projectId,
      word: entry.indigenousWord || entry.word || '',
      translation: entry.englishTranslation || entry.translation || '',
      imageUrl: entry.imageUrl || null,
      audioUrl: entry.audioUrl || null,
      category: entry.category || null
    }, {
      onSuccess: () => {
        toast({ title: "Imported", description: `Added "${entry.word}" from NACA` });
      },
      onError: () => {
        toast({ title: "Failed to import", variant: "destructive" });
      }
    });
  };

  const handleSaveNacaUrl = () => {
    nacaApi.setBaseUrl(nacaBaseUrl);
    setShowNacaSettings(false);
    toast({ title: "NACA URL saved", description: "Dictionary browser is now available" });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
            <Book className="w-3 h-3" />
            Vocabulary
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {vocabulary.length} item{vocabulary.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNacaSettings(!showNacaSettings)}
            className="h-7 px-2"
            title="NACA Settings"
            data-testid="button-naca-settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(!isAdding)}
            className="h-7 px-2"
            data-testid="button-add-vocabulary"
          >
            {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {showNacaSettings && (
        <div className="p-3 border-b border-border bg-muted/30 space-y-2">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" />
            NACA Server URL
          </div>
          <div className="flex gap-2">
            <Input
              value={nacaBaseUrl}
              onChange={(e) => setNacaBaseUrl(e.target.value)}
              placeholder="https://your-naca-server.com"
              className="h-8 text-xs flex-1"
              data-testid="input-naca-url"
            />
            <Button
              size="sm"
              onClick={handleSaveNacaUrl}
              className="h-8 text-xs"
              data-testid="button-save-naca-url"
            >
              Save
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            {nacaApi.isConfigured() ? (
              <span className="text-green-600 flex items-center gap-1">
                <Check className="w-3 h-3" /> Connected to NACA
              </span>
            ) : (
              "Enter the NACA server URL to browse dictionaries"
            )}
          </p>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent h-9 px-4">
          <TabsTrigger 
            value="local" 
            className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            data-testid="tab-local-vocabulary"
          >
            <Book className="w-3 h-3 mr-1" />
            Local
          </TabsTrigger>
          <TabsTrigger 
            value="naca" 
            className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            data-testid="tab-naca-vocabulary"
          >
            <Globe className="w-3 h-3 mr-1" />
            NACA
          </TabsTrigger>
          <TabsTrigger 
            value="search" 
            className="text-xs data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
            data-testid="tab-dictionary-search"
          >
            <Search className="w-3 h-3 mr-1" />
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local" className="flex-1 mt-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {isAdding && (
                <div className="space-y-3 p-3 bg-muted/30 rounded-lg border border-border">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Add New Word</div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Word *</Label>
                    <Input
                      value={newItem.word}
                      onChange={(e) => setNewItem(p => ({ ...p, word: e.target.value }))}
                      placeholder="Enter word..."
                      className="h-8 text-xs"
                      data-testid="input-vocabulary-word"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Translation *</Label>
                    <Input
                      value={newItem.translation}
                      onChange={(e) => setNewItem(p => ({ ...p, translation: e.target.value }))}
                      placeholder="Enter translation..."
                      className="h-8 text-xs"
                      data-testid="input-vocabulary-translation"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" /> Image URL
                    </Label>
                    <Input
                      value={newItem.imageUrl}
                      onChange={(e) => setNewItem(p => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      className="h-8 text-xs"
                      data-testid="input-vocabulary-image"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Audio URL
                    </Label>
                    <Input
                      value={newItem.audioUrl}
                      onChange={(e) => setNewItem(p => ({ ...p, audioUrl: e.target.value }))}
                      placeholder="https://..."
                      className="h-8 text-xs"
                      data-testid="input-vocabulary-audio"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Category
                    </Label>
                    <Input
                      value={newItem.category}
                      onChange={(e) => setNewItem(p => ({ ...p, category: e.target.value }))}
                      placeholder="e.g., Animals, Colors..."
                      className="h-8 text-xs"
                      data-testid="input-vocabulary-category"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={createVocabulary.isPending}
                      className="flex-1 h-8 text-xs"
                      data-testid="button-save-vocabulary"
                    >
                      {createVocabulary.isPending ? "Adding..." : "Add Word"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsAdding(false);
                        setNewItem({ word: "", translation: "", imageUrl: "", audioUrl: "", category: "" });
                      }}
                      className="h-8 text-xs"
                      data-testid="button-cancel-vocabulary"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : vocabulary.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  <Book className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No vocabulary items yet</p>
                  <p className="text-xs mt-1">Click + to add your first word</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {vocabulary.map((item) => (
                    <VocabularyItem
                      key={item.id}
                      item={item}
                      isExpanded={expandedId === item.id}
                      onToggle={() => toggleExpand(item.id)}
                      onDelete={() => handleDelete(item.id, item.word)}
                      isDeleting={deleteVocabulary.isPending}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="naca" className="flex-1 mt-0 overflow-hidden">
          <NACAdictionaryBrowser 
            onImport={handleImportFromNaca} 
            existingWords={vocabulary.map(v => v.word)}
          />
        </TabsContent>

        <TabsContent value="search" className="flex-1 mt-0 overflow-hidden">
          <DictionarySearch 
            onImport={handleImportFromNaca} 
            existingWords={vocabulary.map(v => v.word)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface NACAdictionaryBrowserProps {
  onImport: (entry: NACADictionaryEntry) => void;
  existingWords: string[];
}

function NACAdictionaryBrowser({ onImport, existingWords }: NACAdictionaryBrowserProps) {
  const [communities, setCommunities] = useState<NACACommunity[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [dictionaries, setDictionaries] = useState<NACADictionary[]>([]);
  const [selectedDictionary, setSelectedDictionary] = useState<string>("");
  const [entries, setEntries] = useState<NACADictionaryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = nacaApi.isConfigured();

  const loadCommunities = async () => {
    if (!isConfigured) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await nacaApi.getCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDictionaries = async (communityId: string) => {
    if (!communityId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await nacaApi.getCommunityDictionaries(communityId);
      setDictionaries(data);
      setEntries([]);
      setSelectedDictionary("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dictionaries");
    } finally {
      setIsLoading(false);
    }
  };

  const loadEntries = async (dictionaryId: string) => {
    const dictionary = dictionaries.find(d => d.id === dictionaryId);
    if (dictionary?.entries) {
      setEntries(dictionary.entries);
    }
  };

  useEffect(() => {
    if (isConfigured) {
      loadCommunities();
    }
  }, [isConfigured]);

  useEffect(() => {
    if (selectedCommunity) {
      loadDictionaries(selectedCommunity);
    }
  }, [selectedCommunity]);

  useEffect(() => {
    if (selectedDictionary) {
      loadEntries(selectedDictionary);
    }
  }, [selectedDictionary]);

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Globe className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm font-medium">NACA Not Configured</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click the settings icon above to enter your NACA server URL
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Globe className="w-3 h-3" />
            Browse NACA Dictionaries
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadCommunities}
            className="h-7 px-2"
            disabled={isLoading}
            data-testid="button-refresh-naca"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-xs">Community</Label>
          <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
            <SelectTrigger className="h-8 text-xs" data-testid="select-naca-community">
              <SelectValue placeholder="Select a community..." />
            </SelectTrigger>
            <SelectContent>
              {communities.map((c) => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedCommunity && dictionaries.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Dictionary</Label>
            <Select value={selectedDictionary} onValueChange={setSelectedDictionary}>
              <SelectTrigger className="h-8 text-xs" data-testid="select-naca-dictionary">
                <SelectValue placeholder="Select a dictionary..." />
              </SelectTrigger>
              <SelectContent>
                {dictionaries.map((d) => (
                  <SelectItem key={d.id} value={d.id} className="text-xs">
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {selectedDictionary && entries.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {entries.length} entries available
            </div>
            <div className="space-y-2">
              {entries.map((entry) => {
                const word = entry.indigenousWord || entry.word || '';
                const isImported = existingWords.includes(word);
                return (
                  <div 
                    key={entry.id} 
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border"
                    data-testid={`naca-entry-${entry.id}`}
                  >
                    {entry.imageUrl ? (
                      <div className="w-8 h-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                        <img 
                          src={entry.imageUrl} 
                          alt={word}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                        <Book className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{word}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{entry.englishTranslation || entry.translation}</div>
                    </div>

                    {entry.audioUrl && (
                      <Volume2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}

                    <Button
                      variant={isImported ? "ghost" : "secondary"}
                      size="sm"
                      onClick={() => !isImported && onImport(entry)}
                      disabled={isImported}
                      className="h-7 px-2 flex-shrink-0"
                      data-testid={`button-import-${entry.id}`}
                    >
                      {isImported ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedCommunity && dictionaries.length === 0 && !isLoading && (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No dictionaries found for this community
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface DictionarySearchProps {
  onImport: (entry: NACADictionaryEntry) => void;
  existingWords: string[];
}

function DictionarySearch({ onImport, existingWords }: DictionarySearchProps) {
  const [communities, setCommunities] = useState<NACACommunity[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<string>("");
  const [dictionaries, setDictionaries] = useState<NACADictionary[]>([]);
  const [selectedDictionary, setSelectedDictionary] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<NACADictionaryEntry[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = nacaApi.isConfigured();

  const loadCommunities = async () => {
    if (!isConfigured) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await nacaApi.getCommunities();
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDictionaries = async (communityId: string) => {
    if (!communityId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const data = await nacaApi.getCommunityDictionaries(communityId);
      setDictionaries(data);
      setSelectedDictionary("");
      setSearchResults([]);
      setSearchQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dictionaries");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!selectedDictionary || !searchQuery.trim()) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const response = await nacaApi.getDictionaryEntries(selectedDictionary, {
        search: searchQuery.trim(),
        limit: 50,
      });
      setSearchResults(response.entries);
      setTotalResults(response.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  useEffect(() => {
    if (isConfigured) {
      loadCommunities();
    }
  }, [isConfigured]);

  useEffect(() => {
    if (selectedCommunity) {
      loadDictionaries(selectedCommunity);
    }
  }, [selectedCommunity]);

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <Search className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
        <p className="text-sm font-medium">NACA Not Configured</p>
        <p className="text-xs text-muted-foreground mt-1">
          Click the settings icon above to enter your NACA server URL
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground flex items-center gap-1">
            <Search className="w-3 h-3" />
            Search Dictionary Entries
          </div>
        </div>

        {error && (
          <div className="p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-2">
            <Label className="text-xs">Community</Label>
            <Select value={selectedCommunity} onValueChange={setSelectedCommunity}>
              <SelectTrigger className="h-8 text-xs" data-testid="search-select-community">
                <SelectValue placeholder="Select a community..." />
              </SelectTrigger>
              <SelectContent>
                {communities.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedCommunity && dictionaries.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Dictionary</Label>
              <Select value={selectedDictionary} onValueChange={setSelectedDictionary}>
                <SelectTrigger className="h-8 text-xs" data-testid="search-select-dictionary">
                  <SelectValue placeholder="Select a dictionary..." />
                </SelectTrigger>
                <SelectContent>
                  {dictionaries.map((d) => (
                    <SelectItem key={d.id} value={d.id} className="text-xs">
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedDictionary && (
            <div className="space-y-2">
              <Label className="text-xs">Search Term</Label>
              <div className="flex gap-2">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for words..."
                  className="h-8 text-xs flex-1"
                  data-testid="input-dictionary-search"
                />
                <Button
                  size="sm"
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="h-8 px-3"
                  data-testid="button-search-dictionary"
                >
                  {isSearching ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Search className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
              {searchResults.length < totalResults && ` (showing ${searchResults.length})`}
            </div>
            <div className="space-y-2">
              {searchResults.map((entry) => {
                const word = entry.indigenousWord || entry.word || '';
                const isImported = existingWords.includes(word);
                return (
                  <div 
                    key={entry.id} 
                    className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border"
                    data-testid={`search-result-${entry.id}`}
                  >
                    {entry.imageUrl ? (
                      <div className="w-8 h-8 rounded bg-muted flex-shrink-0 overflow-hidden">
                        <img 
                          src={entry.imageUrl} 
                          alt={word}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-muted flex-shrink-0 flex items-center justify-center">
                        <Book className="w-3 h-3 text-muted-foreground" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-xs truncate">{word}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {entry.englishTranslation || entry.translation}
                      </div>
                    </div>

                    {entry.audioUrl && (
                      <Volume2 className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                    )}

                    <Button
                      variant={isImported ? "ghost" : "secondary"}
                      size="sm"
                      onClick={() => !isImported && onImport(entry)}
                      disabled={isImported}
                      className="h-7 px-2 flex-shrink-0"
                      data-testid={`button-import-search-${entry.id}`}
                    >
                      {isImported ? (
                        <Check className="w-3 h-3 text-green-600" />
                      ) : (
                        <Download className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selectedDictionary && searchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No results found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}

        {!selectedDictionary && selectedCommunity && dictionaries.length === 0 && !isLoading && (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No dictionaries found for this community
          </div>
        )}

        {!selectedCommunity && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a community and dictionary</p>
            <p className="text-xs mt-1">Then search for words to import</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface VocabularyItemProps {
  item: Vocabulary;
  isExpanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function VocabularyItem({ item, isExpanded, onToggle, onDelete, isDeleting }: VocabularyItemProps) {
  return (
    <div 
      className="border border-border rounded-lg overflow-hidden bg-card"
      data-testid={`vocabulary-item-${item.id}`}
    >
      <div 
        className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={onToggle}
      >
        {item.imageUrl ? (
          <div className="w-10 h-10 rounded bg-muted flex-shrink-0 overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.word}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded bg-muted flex-shrink-0 flex items-center justify-center">
            <Book className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm truncate">{item.word}</span>
            {item.category && (
              <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary rounded">
                {item.category}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{item.translation}</p>
        </div>

        <div className="flex items-center gap-1">
          {item.audioUrl && (
            <Volume2 className="w-3 h-3 text-muted-foreground" />
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-border p-3 bg-muted/20 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-muted-foreground">Word:</span>
              <p className="font-medium">{item.word}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Translation:</span>
              <p className="font-medium">{item.translation}</p>
            </div>
          </div>

          {item.imageUrl && (
            <div>
              <span className="text-xs text-muted-foreground">Image:</span>
              <div className="mt-1 w-full h-24 rounded bg-muted overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.word}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {item.audioUrl && (
            <div>
              <span className="text-xs text-muted-foreground">Audio:</span>
              <audio 
                controls 
                src={item.audioUrl} 
                className="w-full h-8 mt-1"
                data-testid={`audio-${item.id}`}
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="text-[10px] text-muted-foreground font-mono">
              ID: {item.id.slice(0, 8)}...
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              disabled={isDeleting}
              className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              data-testid={`button-delete-vocabulary-${item.id}`}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
