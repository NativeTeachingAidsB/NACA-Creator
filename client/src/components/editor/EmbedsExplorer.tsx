import { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Component,
  RefreshCw,
  AlertCircle,
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  Code,
  FileJson,
  Puzzle,
  Loader2,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nacaApi, type NACAEmbedComponent, type NACAEmbedManifest, type NACAEmbedTokenRequest } from "@/lib/naca-api";
import { useNacaEmbeds, useNacaEmbedManifest, useNacaGenerateEmbedToken } from "@/hooks/use-naca";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNacaCommunities } from "@/hooks/use-naca";

interface EmbedsExplorerProps {
  onSelectEmbed?: (embed: NACAEmbedComponent, manifest: NACAEmbedManifest | null) => void;
  communityId?: string;
}

export function EmbedsExplorer({ onSelectEmbed, communityId }: EmbedsExplorerProps) {
  const { toast } = useToast();
  const [selectedEmbed, setSelectedEmbed] = useState<NACAEmbedComponent | null>(null);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [tokenCommunityId, setTokenCommunityId] = useState(communityId || '');
  
  const isConfigured = nacaApi.isConfigured();
  
  const { 
    data: embeds = [], 
    isLoading: embedsLoading,
    refetch: refetchEmbeds,
    error: embedsError
  } = useNacaEmbeds();
  
  const {
    data: manifest,
    isLoading: manifestLoading,
  } = useNacaEmbedManifest(selectedEmbed?.type || '', { enabled: !!selectedEmbed });
  
  const { data: communities = [] } = useNacaCommunities({ useMockFallback: true });
  
  const generateTokenMutation = useNacaGenerateEmbedToken();

  const handleSelectEmbed = useCallback((embed: NACAEmbedComponent) => {
    setSelectedEmbed(embed);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedEmbed(null);
    setGeneratedToken(null);
  }, []);

  const handleUseEmbed = useCallback(() => {
    if (selectedEmbed && onSelectEmbed) {
      onSelectEmbed(selectedEmbed, manifest || null);
      toast({
        title: "Component Selected",
        description: `${selectedEmbed.name} is ready to use.`,
      });
    }
  }, [selectedEmbed, manifest, onSelectEmbed, toast]);

  const handleGenerateToken = useCallback(async () => {
    if (!selectedEmbed || !tokenCommunityId) {
      toast({
        title: "Missing Information",
        description: "Please select a community first.",
        variant: "destructive",
      });
      return;
    }

    const request: NACAEmbedTokenRequest = {
      communityId: tokenCommunityId,
      expiresIn: 3600,
    };

    try {
      const result = await generateTokenMutation.mutateAsync({
        componentType: selectedEmbed.type,
        request,
      });

      if (result?.token) {
        setGeneratedToken(result.token);
        toast({
          title: "Token Generated",
          description: "Embed token created successfully.",
        });
      } else {
        toast({
          title: "Token Generation Failed",
          description: "Could not generate embed token.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[EmbedsExplorer] Token generation error:', error);
      toast({
        title: "Token Generation Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, [selectedEmbed, tokenCommunityId, generateTokenMutation, toast]);

  const handleCopyToken = useCallback(() => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
      toast({
        title: "Copied",
        description: "Token copied to clipboard.",
      });
    }
  }, [generatedToken, toast]);

  if (!isConfigured) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="font-medium text-lg mb-2">NACA Not Connected</h3>
        <p className="text-sm text-muted-foreground">
          Configure the NACA server connection to browse embeddable components.
        </p>
      </div>
    );
  }

  if (selectedEmbed) {
    return (
      <EmbedDetails
        embed={selectedEmbed}
        manifest={manifest}
        isLoading={manifestLoading}
        onBack={handleBack}
        onUse={onSelectEmbed ? handleUseEmbed : undefined}
        onGenerateToken={() => setShowTokenDialog(true)}
        showTokenDialog={showTokenDialog}
        setShowTokenDialog={setShowTokenDialog}
        tokenCommunityId={tokenCommunityId}
        setTokenCommunityId={setTokenCommunityId}
        communities={communities}
        generatedToken={generatedToken}
        onGenerateTokenSubmit={handleGenerateToken}
        isGenerating={generateTokenMutation.isPending}
        copiedToken={copiedToken}
        onCopyToken={handleCopyToken}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="embeds-explorer">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <Puzzle className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Embeddable Components</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => refetchEmbeds()}
          disabled={embedsLoading}
          data-testid="button-refresh-embeds"
        >
          <RefreshCw className={cn("h-3.5 w-3.5", embedsLoading && "animate-spin")} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {embedsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="cursor-pointer">
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-10 w-10 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : embedsError ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm text-muted-foreground">
                Failed to load embeddable components
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetchEmbeds()}
              >
                Try Again
              </Button>
            </div>
          ) : embeds.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Component className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No embeddable components available
              </p>
            </div>
          ) : (
            embeds.map((embed) => (
              <Card
                key={embed.type}
                className="cursor-pointer transition-colors hover:bg-accent"
                onClick={() => handleSelectEmbed(embed)}
                data-testid={`card-embed-${embed.type}`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                      <Component className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm truncate">{embed.name}</h4>
                        {embed.category && (
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {embed.category}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {embed.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface EmbedDetailsProps {
  embed: NACAEmbedComponent;
  manifest: NACAEmbedManifest | null | undefined;
  isLoading: boolean;
  onBack: () => void;
  onUse?: () => void;
  onGenerateToken: () => void;
  showTokenDialog: boolean;
  setShowTokenDialog: (show: boolean) => void;
  tokenCommunityId: string;
  setTokenCommunityId: (id: string) => void;
  communities: { id: string; name: string }[];
  generatedToken: string | null;
  onGenerateTokenSubmit: () => void;
  isGenerating: boolean;
  copiedToken: boolean;
  onCopyToken: () => void;
}

function EmbedDetails({
  embed,
  manifest,
  isLoading,
  onBack,
  onUse,
  onGenerateToken,
  showTokenDialog,
  setShowTokenDialog,
  tokenCommunityId,
  setTokenCommunityId,
  communities,
  generatedToken,
  onGenerateTokenSubmit,
  isGenerating,
  copiedToken,
  onCopyToken,
}: EmbedDetailsProps) {
  return (
    <div className="flex flex-col h-full" data-testid="embed-details">
      <div className="flex items-center gap-2 p-3 border-b">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={onBack}
          data-testid="button-back-embeds"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-medium text-sm truncate">{embed.name}</h3>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Component className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">{embed.name}</CardTitle>
                  <CardDescription className="text-xs">
                    Type: <code className="bg-muted px-1 rounded">{embed.type}</code>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{embed.description}</p>
            </CardContent>
          </Card>

          {isLoading ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ) : manifest ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4 text-muted-foreground" />
                    <CardTitle className="text-sm">Configuration</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {manifest.requiredProps.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1.5">Required Properties</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {manifest.requiredProps.map((prop) => (
                          <Badge key={prop} variant="default" className="text-xs">
                            {prop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {manifest.optionalProps.length > 0 && (
                    <div>
                      <h5 className="text-xs font-medium mb-1.5">Optional Properties</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {manifest.optionalProps.map((prop) => (
                          <Badge key={prop} variant="outline" className="text-xs">
                            {prop}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {manifest.version && (
                    <div className="pt-2 border-t">
                      <span className="text-xs text-muted-foreground">
                        Version: {manifest.version}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {manifest.schema && Object.keys(manifest.schema).length > 0 && (
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-muted-foreground" />
                      <CardTitle className="text-sm">Schema</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-xs bg-muted p-3 rounded-md overflow-x-auto max-h-48">
                      {JSON.stringify(manifest.schema, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Manifest not available</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>

      <Separator />
      
      <div className="p-3 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={onGenerateToken}
          data-testid="button-generate-token"
        >
          <Key className="h-3.5 w-3.5 mr-1.5" />
          Generate Token
        </Button>
        {onUse && (
          <Button
            size="sm"
            className="flex-1"
            onClick={onUse}
            data-testid="button-use-embed"
          >
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Use Component
          </Button>
        )}
      </div>

      <Dialog open={showTokenDialog} onOpenChange={setShowTokenDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Embed Token</DialogTitle>
            <DialogDescription>
              Create a secure token to embed this component in external sites.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="community">Community</Label>
              <Select value={tokenCommunityId} onValueChange={setTokenCommunityId}>
                <SelectTrigger id="community" data-testid="select-token-community">
                  <SelectValue placeholder="Select a community" />
                </SelectTrigger>
                <SelectContent>
                  {communities.map((community) => (
                    <SelectItem key={community.id} value={community.id}>
                      {community.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {generatedToken && (
              <div className="space-y-2">
                <Label>Generated Token</Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={generatedToken}
                    className="font-mono text-xs"
                    data-testid="input-generated-token"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onCopyToken}
                    data-testid="button-copy-token"
                  >
                    {copiedToken ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  This token expires in 1 hour. Store it securely.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTokenDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={onGenerateTokenSubmit} 
              disabled={isGenerating || !tokenCommunityId}
              data-testid="button-submit-generate-token"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Token'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
