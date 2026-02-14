import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { ApiDocMonitor } from "@/components/admin/ApiDocMonitor";
import { 
  RefreshCw, 
  Check, 
  Clock, 
  AlertTriangle,
  FileJson,
  FileText,
  Upload,
  Copy,
  ExternalLink,
  Code,
  BookOpen,
  Zap,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

interface DocStatus {
  exists: boolean;
  slug?: string;
  version?: string;
  lastUpdated?: string;
  publishStatus?: string;
  publishedAt?: string;
  publishedToDev?: boolean;
  publishedToProd?: boolean;
  schemaHash?: string;
  needsRebuild?: boolean;
}

interface ApiDocPayload {
  apiVersion: string;
  generatedAt: string;
  schemaHash: string;
  endpoints: Array<{
    id: string;
    path: string;
    method: string;
    description: string;
    category: string;
    parameters?: Array<{
      name: string;
      in: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
    samples?: {
      request?: Record<string, unknown>;
      response?: Record<string, unknown>;
    };
  }>;
  schemas: Record<string, {
    name: string;
    fields: Array<{
      name: string;
      type: string;
      required: boolean;
      description?: string;
    }>;
  }>;
  websocketTopics?: Array<{
    name: string;
    direction: string;
    description: string;
  }>;
  _meta?: {
    slug: string;
    version: string;
    lastUpdated: string;
    publishStatus: string;
    publishedAt?: string;
    schemaHash: string;
    publishedToDev?: boolean;
    publishedToProd?: boolean;
  };
}

function StatusBadge({ status }: { status: DocStatus }) {
  if (!status.exists) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Not Generated
      </Badge>
    );
  }
  
  if (status.needsRebuild) {
    return (
      <Badge variant="secondary" className="gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        <Clock className="h-3 w-3" />
        Needs Rebuild
      </Badge>
    );
  }
  
  return (
    <Badge variant="default" className="gap-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
      <Check className="h-3 w-3" />
      Up to Date
    </Badge>
  );
}

function PublishBadge({ publishedToDev, publishedToProd }: { publishedToDev?: boolean; publishedToProd?: boolean }) {
  if (publishedToDev && publishedToProd) {
    return <Badge variant="default">Dev + Prod</Badge>;
  }
  if (publishedToDev) {
    return <Badge variant="secondary">Dev Only</Badge>;
  }
  if (publishedToProd) {
    return <Badge variant="default">Prod Only</Badge>;
  }
  return <Badge variant="outline">Not Published</Badge>;
}

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    POST: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    PATCH: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    PUT: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    DELETE: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    ALL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  };
  
  return (
    <Badge variant="secondary" className={colors[method] || "bg-gray-100 text-gray-800"}>
      {method}
    </Badge>
  );
}

export default function ApiDocsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<"json" | "human">("human");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading } = useQuery<DocStatus>({
    queryKey: ["api-docs-status"],
    queryFn: async () => {
      const res = await fetch("/api/docs/activity-editor/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
  });

  const { data: docs, isLoading: docsLoading } = useQuery<ApiDocPayload>({
    queryKey: ["api-docs"],
    queryFn: async () => {
      const res = await fetch("/api/docs/activity-editor");
      if (!res.ok) throw new Error("Failed to fetch docs");
      return res.json();
    },
  });

  const { data: markdown, isLoading: markdownLoading } = useQuery<string>({
    queryKey: ["api-docs-markdown"],
    queryFn: async () => {
      const res = await fetch("/api/docs/activity-editor/markdown");
      if (!res.ok) throw new Error("Failed to fetch markdown");
      return res.text();
    },
    enabled: activeView === "human",
  });

  const rebuildMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/docs/activity-editor/rebuild", { method: "POST" });
      if (!res.ok) throw new Error("Failed to rebuild");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Documentation rebuilt successfully" });
      queryClient.invalidateQueries({ queryKey: ["api-docs"] });
      queryClient.invalidateQueries({ queryKey: ["api-docs-status"] });
      queryClient.invalidateQueries({ queryKey: ["api-docs-markdown"] });
    },
    onError: () => {
      toast({ title: "Failed to rebuild documentation", variant: "destructive" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: async (environment: string) => {
      const res = await fetch("/api/docs/activity-editor/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ environment }),
      });
      if (!res.ok) throw new Error("Failed to publish");
      return res.json();
    },
    onSuccess: (_, environment) => {
      toast({ title: `Documentation published to ${environment}` });
      queryClient.invalidateQueries({ queryKey: ["api-docs-status"] });
    },
    onError: () => {
      toast({ title: "Failed to publish documentation", variant: "destructive" });
    },
  });

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  const categories = docs?.endpoints 
    ? Array.from(new Set(docs.endpoints.map(e => e.category)))
    : [];

  const filteredEndpoints = docs?.endpoints?.filter(
    e => !selectedCategory || e.category === selectedCategory
  ) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="btn-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
              <BookOpen className="h-8 w-8" />
              Activity Editor API Documentation
            </h1>
            <p className="text-muted-foreground mt-2">
              Machine-readable and human-readable API documentation for NACA integration
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {status && <StatusBadge status={status} />}
            {status?.publishedToDev !== undefined && (
              <PublishBadge 
                publishedToDev={status.publishedToDev} 
                publishedToProd={status.publishedToProd} 
              />
            )}
          </div>
        </div>

        <div className="mb-6">
          <ApiDocMonitor />
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Documentation Status</CardTitle>
                <CardDescription>
                  {status?.lastUpdated 
                    ? `Last updated: ${new Date(status.lastUpdated).toLocaleString()}`
                    : "Not yet generated"
                  }
                </CardDescription>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => rebuildMutation.mutate()}
                  disabled={rebuildMutation.isPending}
                  data-testid="button-rebuild"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${rebuildMutation.isPending ? "animate-spin" : ""}`} />
                  Rebuild
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => publishMutation.mutate("dev")}
                  disabled={publishMutation.isPending}
                  data-testid="button-publish-dev"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Publish Dev
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => publishMutation.mutate("both")}
                  disabled={publishMutation.isPending}
                  data-testid="button-publish-both"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Publish All
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Version:</span>
                <span className="ml-2 font-medium">{docs?._meta?.version || status?.version || "1.0.0"}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Schema Hash:</span>
                <code className="ml-2 text-xs bg-muted px-1 py-0.5 rounded">{status?.schemaHash || "—"}</code>
              </div>
              <div>
                <span className="text-muted-foreground">Endpoints:</span>
                <span className="ml-2 font-medium">{docs?.endpoints?.length || 0}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Schemas:</span>
                <span className="ml-2 font-medium">{docs?.schemas ? Object.keys(docs.schemas).length : 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "json" | "human")}>
          <TabsList className="mb-4">
            <TabsTrigger value="human" className="gap-2" data-testid="tab-human">
              <FileText className="h-4 w-4" />
              Human View
            </TabsTrigger>
            <TabsTrigger value="json" className="gap-2" data-testid="tab-json">
              <FileJson className="h-4 w-4" />
              Machine View (JSON)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="human">
            <div className="grid grid-cols-4 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1 p-2">
                    <Button
                      variant={selectedCategory === null ? "secondary" : "ghost"}
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Endpoints
                    </Button>
                    {categories.map(cat => (
                      <Button
                        key={cat}
                        variant={selectedCategory === cat ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => setSelectedCategory(cat)}
                      >
                        {cat}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="col-span-3 space-y-4">
                {docsLoading ? (
                  <div className="text-center py-8 text-muted-foreground">Loading...</div>
                ) : (
                  filteredEndpoints.map(endpoint => (
                    <Card key={endpoint.id} data-testid={`card-endpoint-${endpoint.id}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                          <MethodBadge method={endpoint.method} />
                          <code className="text-sm font-mono">{endpoint.path}</code>
                          <Badge variant="outline" className="ml-auto">{endpoint.category}</Badge>
                        </div>
                        <CardDescription className="mt-2">{endpoint.description}</CardDescription>
                      </CardHeader>
                      
                      {(endpoint.parameters || endpoint.samples) && (
                        <CardContent className="pt-0">
                          {endpoint.parameters && endpoint.parameters.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium mb-2">Parameters</h4>
                              <div className="rounded-md border">
                                <table className="w-full text-sm">
                                  <thead className="bg-muted/50">
                                    <tr>
                                      <th className="text-left p-2">Name</th>
                                      <th className="text-left p-2">In</th>
                                      <th className="text-left p-2">Type</th>
                                      <th className="text-left p-2">Required</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.parameters.map(param => (
                                      <tr key={param.name} className="border-t">
                                        <td className="p-2 font-mono text-xs">{param.name}</td>
                                        <td className="p-2">{param.in}</td>
                                        <td className="p-2">{param.type}</td>
                                        <td className="p-2">{param.required ? "Yes" : "No"}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                          
                          {endpoint.samples && (
                            <div className="grid grid-cols-2 gap-4">
                              {endpoint.samples.request && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium">Request</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.samples?.request, null, 2))}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-32">
                                    {JSON.stringify(endpoint.samples.request, null, 2)}
                                  </pre>
                                </div>
                              )}
                              {endpoint.samples.response && (
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium">Response</h4>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 px-2"
                                      onClick={() => copyToClipboard(JSON.stringify(endpoint.samples?.response, null, 2))}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-32">
                                    {JSON.stringify(endpoint.samples.response, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      )}
                    </Card>
                  ))
                )}

                <Separator className="my-8" />

                <h2 className="text-xl font-bold mb-4">Data Schemas</h2>
                <div className="grid grid-cols-2 gap-4">
                  {docs?.schemas && Object.entries(docs.schemas).map(([name, schema]) => (
                    <Card key={name} data-testid={`card-schema-${name}`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{schema.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="rounded-md border">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="text-left p-2">Field</th>
                                <th className="text-left p-2">Type</th>
                                <th className="text-left p-2">Req</th>
                              </tr>
                            </thead>
                            <tbody>
                              {schema.fields.map(field => (
                                <tr key={field.name} className="border-t">
                                  <td className="p-2 font-mono text-xs">{field.name}</td>
                                  <td className="p-2 text-xs">{field.type}</td>
                                  <td className="p-2 text-xs">{field.required ? "✓" : ""}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {docs?.websocketTopics && docs.websocketTopics.length > 0 && (
                  <>
                    <Separator className="my-8" />
                    <h2 className="text-xl font-bold mb-4">WebSocket Topics</h2>
                    <div className="space-y-2">
                      {docs.websocketTopics.map(topic => (
                        <Card key={topic.name}>
                          <CardContent className="py-3">
                            <div className="flex items-center gap-3">
                              <Badge variant={topic.direction === "inbound" ? "secondary" : "default"}>
                                {topic.direction}
                              </Badge>
                              <code className="font-mono text-sm">{topic.name}</code>
                              <span className="text-muted-foreground text-sm ml-auto">{topic.description}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Raw JSON Documentation
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open("/api/docs/activity-editor", "_blank")}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Raw
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => docs && copyToClipboard(JSON.stringify(docs, null, 2))}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  This is the machine-readable format for NACA build agents to consume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <pre className="text-xs bg-muted p-4 rounded-md">
                    {docsLoading ? "Loading..." : JSON.stringify(docs, null, 2)}
                  </pre>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
