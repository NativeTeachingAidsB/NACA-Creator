import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  RefreshCw, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  HelpCircle,
  Globe,
  Server,
  Shield,
  Wifi,
  Download,
  Play,
  Settings,
  ExternalLink,
  Copy,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface SubdomainHealthResult {
  subdomain: string;
  fullDomain: string;
  overallHealth: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  checkedAt: string;
  checks: {
    dns: { status: 'pass' | 'fail' | 'warn'; details: string; ip: string | null; recordId: string | null };
    dnsResolution: { status: 'pass' | 'fail' | 'warn'; details: string; resolvedIp: string | null };
    ipMatch: { status: 'pass' | 'fail' | 'warn'; details: string };
    http: { status: 'pass' | 'fail' | 'warn'; details: string; statusCode: number | null };
    ssl: { status: 'pass' | 'fail' | 'warn'; details: string };
    routing: { status: 'pass' | 'fail' | 'warn'; details: string };
  };
  issues: KnownIssue[];
  recommendations: string[];
}

interface KnownIssue {
  id: string;
  category: 'dns' | 'http' | 'ssl' | 'auth' | 'routing' | 'config';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  solution: string;
  autoFixable: boolean;
}

interface BatchHealthResult {
  checkedAt: string;
  total: number;
  healthy: number;
  degraded: number;
  unhealthy: number;
  unknown: number;
  results: SubdomainHealthResult[];
}

interface ConfigurationStatus {
  subdomains: Array<{
    subdomain: string;
    fullDomain: string;
    status: string;
    hasDns: boolean;
    dnsIp: string | null;
    dnsRecordId: string | null;
  }>;
  configuration: {
    primaryDomain: string;
    serverIp: string;
    serverIpConfigured: boolean;
    porkbunConfigured: boolean;
  };
}

const StatusIcon = ({ status }: { status: 'pass' | 'fail' | 'warn' }) => {
  switch (status) {
    case 'pass':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'fail':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'warn':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  }
};

const HealthBadge = ({ health }: { health: SubdomainHealthResult['overallHealth'] }) => {
  const variants: Record<typeof health, { color: string; label: string }> = {
    healthy: { color: 'bg-green-100 text-green-800 border-green-300', label: 'Healthy' },
    degraded: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Degraded' },
    unhealthy: { color: 'bg-red-100 text-red-800 border-red-300', label: 'Unhealthy' },
    unknown: { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Unknown' },
  };
  
  const { color, label } = variants[health];
  return <Badge className={`${color} border`}>{label}</Badge>;
};

const SeverityBadge = ({ severity }: { severity: KnownIssue['severity'] }) => {
  const variants: Record<typeof severity, string> = {
    critical: 'bg-red-100 text-red-800 border-red-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  
  return <Badge className={`${variants[severity]} border text-xs`}>{severity}</Badge>;
};

interface SubdomainHealthCheckProps {
  autoRefreshInterval?: number;
  onHealthChange?: (summary: { healthy: number; degraded: number; unhealthy: number; unknown: number }) => void;
  onError?: (error: Error) => void;
  showExportButton?: boolean;
  showAutoRefreshToggle?: boolean;
  compactMode?: boolean;
}

export function SubdomainHealthCheck({
  autoRefreshInterval = 60000,
  onHealthChange,
  onError,
  showExportButton = true,
  showAutoRefreshToggle = true,
  compactMode = false
}: SubdomainHealthCheckProps) {
  const queryClient = useQueryClient();
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [selectedSubdomain, setSelectedSubdomain] = useState<string | null>(null);
  const [healthResults, setHealthResults] = useState<SubdomainHealthResult[]>([]);
  const [isRunningBatch, setIsRunningBatch] = useState(false);

  const { data: configStatus, isLoading: isLoadingConfig, refetch: refetchConfig } = useQuery<ConfigurationStatus>({
    queryKey: ["/api/admin/special-subdomains/status"],
    staleTime: 30000,
  });

  const { data: knownIssues } = useQuery<KnownIssue[]>({
    queryKey: ["/api/admin/special-subdomains/known-issues"],
    staleTime: 300000,
  });

  const singleHealthCheckMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const res = await fetch(`/api/admin/special-subdomains/${subdomain}/health-check`, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Health check failed');
      }
      return res.json() as Promise<SubdomainHealthResult>;
    },
    onSuccess: (result) => {
      setHealthResults(prev => {
        const filtered = prev.filter(r => r.subdomain !== result.subdomain);
        return [...filtered, result];
      });
      toast.success(`Health check complete for ${result.fullDomain}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      onError?.(error);
    },
  });

  const batchHealthCheckMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/special-subdomains/health-check-all', {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Batch health check failed');
      }
      return res.json() as Promise<BatchHealthResult>;
    },
    onSuccess: (result) => {
      setHealthResults(result.results);
      onHealthChange?.({
        healthy: result.healthy,
        degraded: result.degraded,
        unhealthy: result.unhealthy,
        unknown: result.unknown,
      });
      toast.success(`Checked ${result.total} subdomains: ${result.healthy} healthy, ${result.unhealthy} issues`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
      onError?.(error);
    },
  });

  const provisionMutation = useMutation({
    mutationFn: async (subdomain: string) => {
      const res = await fetch(`/api/admin/special-subdomains/${subdomain}/provision`, {
        method: 'POST',
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Provisioning failed');
      }
      return res.json();
    },
    onSuccess: (_result, subdomain) => {
      toast.success(`DNS record provisioned for ${subdomain}`);
      refetchConfig();
      singleHealthCheckMutation.mutate(subdomain);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const testPorkbunMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/admin/special-subdomains/test-porkbun', {
        method: 'POST',
      });
      return res.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast.success(`Porkbun API connected. Your IP: ${result.yourIp}`);
      } else {
        toast.error(`Porkbun test failed: ${result.error}`);
      }
    },
  });

  const runBatchHealthCheck = useCallback(() => {
    setIsRunningBatch(true);
    batchHealthCheckMutation.mutate(undefined, {
      onSettled: () => setIsRunningBatch(false),
    });
  }, [batchHealthCheckMutation]);

  useEffect(() => {
    if (autoRefresh && autoRefreshInterval > 0) {
      const interval = setInterval(runBatchHealthCheck, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, autoRefreshInterval, runBatchHealthCheck]);

  const exportMarkdown = () => {
    const lines: string[] = [];
    lines.push('# Subdomain Health Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date().toLocaleString()}`);
    lines.push(`**Primary Domain:** ${configStatus?.configuration.primaryDomain || 'N/A'}`);
    lines.push(`**Server IP:** ${configStatus?.configuration.serverIp || 'Not configured'}`);
    lines.push('');
    
    lines.push('## Summary');
    lines.push('');
    const summary = {
      healthy: healthResults.filter(r => r.overallHealth === 'healthy').length,
      degraded: healthResults.filter(r => r.overallHealth === 'degraded').length,
      unhealthy: healthResults.filter(r => r.overallHealth === 'unhealthy').length,
      unknown: healthResults.filter(r => r.overallHealth === 'unknown').length,
    };
    lines.push(`| Status | Count |`);
    lines.push(`|--------|-------|`);
    lines.push(`| Healthy | ${summary.healthy} |`);
    lines.push(`| Degraded | ${summary.degraded} |`);
    lines.push(`| Unhealthy | ${summary.unhealthy} |`);
    lines.push(`| Unknown | ${summary.unknown} |`);
    lines.push('');
    
    lines.push('## Subdomain Details');
    lines.push('');
    
    for (const result of healthResults) {
      lines.push(`### ${result.fullDomain}`);
      lines.push('');
      lines.push(`**Status:** ${result.overallHealth.toUpperCase()}`);
      lines.push(`**Last Checked:** ${new Date(result.checkedAt).toLocaleString()}`);
      lines.push('');
      lines.push('#### Checks');
      lines.push('');
      lines.push('| Check | Status | Details |');
      lines.push('|-------|--------|---------|');
      lines.push(`| DNS Record | ${result.checks.dns.status} | ${result.checks.dns.details} |`);
      lines.push(`| DNS Resolution | ${result.checks.dnsResolution.status} | ${result.checks.dnsResolution.details} |`);
      lines.push(`| IP Match | ${result.checks.ipMatch.status} | ${result.checks.ipMatch.details} |`);
      lines.push(`| HTTP | ${result.checks.http.status} | ${result.checks.http.details} |`);
      lines.push(`| SSL | ${result.checks.ssl.status} | ${result.checks.ssl.details} |`);
      lines.push(`| Routing | ${result.checks.routing.status} | ${result.checks.routing.details} |`);
      lines.push('');
      
      if (result.issues.length > 0) {
        lines.push('#### Issues');
        lines.push('');
        for (const issue of result.issues) {
          lines.push(`- **[${issue.severity.toUpperCase()}] ${issue.title}**: ${issue.description}`);
          lines.push(`  - Solution: ${issue.solution}`);
        }
        lines.push('');
      }
      
      if (result.recommendations.length > 0) {
        lines.push('#### Recommendations');
        lines.push('');
        for (const rec of result.recommendations) {
          lines.push(`- ${rec}`);
        }
        lines.push('');
      }
    }
    
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subdomain-health-report-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Health report exported');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getResultForSubdomain = (subdomain: string) => 
    healthResults.find(r => r.subdomain === subdomain);

  if (compactMode) {
    const summary = {
      healthy: healthResults.filter(r => r.overallHealth === 'healthy').length,
      degraded: healthResults.filter(r => r.overallHealth === 'degraded').length,
      unhealthy: healthResults.filter(r => r.overallHealth === 'unhealthy').length,
      total: healthResults.length,
    };
    
    return (
      <Card data-testid="subdomain-health-compact">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Subdomain Health</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={runBatchHealthCheck}
              disabled={isRunningBatch}
              data-testid="button-refresh-health-compact"
            >
              <RefreshCw className={`h-4 w-4 ${isRunningBatch ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>{summary.healthy}</span>
            </div>
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span>{summary.degraded}</span>
            </div>
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-500" />
              <span>{summary.unhealthy}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6" data-testid="subdomain-health-dashboard">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Subdomain Health Check
                </CardTitle>
                <CardDescription>
                  Monitor DNS, HTTP, and SSL status for all platform subdomains
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {showAutoRefreshToggle && (
                  <div className="flex items-center gap-2">
                    <Switch
                      id="auto-refresh"
                      checked={autoRefresh}
                      onCheckedChange={setAutoRefresh}
                      data-testid="switch-auto-refresh"
                    />
                    <Label htmlFor="auto-refresh" className="text-sm">Auto-refresh</Label>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={runBatchHealthCheck}
                  disabled={isRunningBatch}
                  data-testid="button-run-all-checks"
                >
                  <Play className="h-4 w-4 mr-1" />
                  {isRunningBatch ? 'Checking...' : 'Run All Checks'}
                </Button>
                {showExportButton && healthResults.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={exportMarkdown}
                    data-testid="button-export-report"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Primary Domain</div>
                    <Server className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="text-lg font-semibold">
                    {configStatus?.configuration.primaryDomain || 'Loading...'}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Server IP</div>
                    <Wifi className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {configStatus?.configuration.serverIp || 'Not configured'}
                    </span>
                    {configStatus?.configuration.serverIpConfigured ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Porkbun API</div>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-semibold">
                      {configStatus?.configuration.porkbunConfigured ? 'Configured' : 'Not configured'}
                    </span>
                    {configStatus?.configuration.porkbunConfigured ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => testPorkbunMutation.mutate()}
                        disabled={testPorkbunMutation.isPending}
                        data-testid="button-test-porkbun"
                      >
                        <RefreshCw className={`h-3 w-3 ${testPorkbunMutation.isPending ? 'animate-spin' : ''}`} />
                      </Button>
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Platform Subdomains</h3>
                {healthResults.length > 0 && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{healthResults.filter(r => r.overallHealth === 'healthy').length} healthy</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <span>{healthResults.filter(r => r.overallHealth === 'degraded').length} degraded</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span>{healthResults.filter(r => r.overallHealth === 'unhealthy').length} unhealthy</span>
                    </div>
                  </div>
                )}
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {isLoadingConfig ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    configStatus?.subdomains.map((sub) => {
                      const result = getResultForSubdomain(sub.subdomain);
                      const isChecking = singleHealthCheckMutation.isPending && 
                                         singleHealthCheckMutation.variables === sub.subdomain;
                      
                      return (
                        <Card 
                          key={sub.subdomain}
                          className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                            selectedSubdomain === sub.subdomain ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => setSelectedSubdomain(
                            selectedSubdomain === sub.subdomain ? null : sub.subdomain
                          )}
                          data-testid={`card-subdomain-${sub.subdomain}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Globe className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{sub.fullDomain}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        copyToClipboard(sub.fullDomain);
                                      }}
                                      data-testid={`button-copy-domain-${sub.subdomain}`}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                    <a
                                      href={`https://${sub.fullDomain}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    {sub.hasDns ? `DNS: ${sub.dnsIp}` : 'No DNS record'}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {result && <HealthBadge health={result.overallHealth} />}
                                
                                {!sub.hasDns && configStatus?.configuration.porkbunConfigured && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      provisionMutation.mutate(sub.subdomain);
                                    }}
                                    disabled={provisionMutation.isPending}
                                    data-testid={`button-provision-${sub.subdomain}`}
                                  >
                                    Provision DNS
                                  </Button>
                                )}
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    singleHealthCheckMutation.mutate(sub.subdomain);
                                  }}
                                  disabled={isChecking}
                                  data-testid={`button-check-${sub.subdomain}`}
                                >
                                  <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
                                </Button>
                              </div>
                            </div>
                            
                            {selectedSubdomain === sub.subdomain && result && (
                              <div className="mt-4 pt-4 border-t space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.checks.dns.status} />
                                    <div>
                                      <div className="text-xs text-muted-foreground">DNS Record</div>
                                      <div className="text-sm">{result.checks.dns.details}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.checks.dnsResolution.status} />
                                    <div>
                                      <div className="text-xs text-muted-foreground">DNS Resolution</div>
                                      <div className="text-sm">{result.checks.dnsResolution.details}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.checks.ipMatch.status} />
                                    <div>
                                      <div className="text-xs text-muted-foreground">IP Match</div>
                                      <div className="text-sm">{result.checks.ipMatch.details}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.checks.http.status} />
                                    <div>
                                      <div className="text-xs text-muted-foreground">HTTP</div>
                                      <div className="text-sm">{result.checks.http.details}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.checks.ssl.status} />
                                    <div>
                                      <div className="text-xs text-muted-foreground">SSL</div>
                                      <div className="text-sm">{result.checks.ssl.details}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <StatusIcon status={result.checks.routing.status} />
                                    <div>
                                      <div className="text-xs text-muted-foreground">Routing</div>
                                      <div className="text-sm">{result.checks.routing.details}</div>
                                    </div>
                                  </div>
                                </div>
                                
                                {result.issues.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-red-600">Issues Detected</h4>
                                    {result.issues.map((issue, idx) => (
                                      <div key={idx} className="bg-red-50 rounded-lg p-3 text-sm">
                                        <div className="flex items-center gap-2 mb-1">
                                          <SeverityBadge severity={issue.severity} />
                                          <span className="font-medium">{issue.title}</span>
                                        </div>
                                        <p className="text-muted-foreground mb-1">{issue.description}</p>
                                        <p className="text-green-700">
                                          <strong>Solution:</strong> {issue.solution}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {result.recommendations.length > 0 && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-blue-600">Recommendations</h4>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                                      {result.recommendations.map((rec, idx) => (
                                        <li key={idx}>{rec}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                
                                <div className="text-xs text-muted-foreground">
                                  Last checked: {new Date(result.checkedAt).toLocaleString()}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {knownIssues && knownIssues.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <HelpCircle className="h-4 w-4" />
                Known Issues Reference
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {knownIssues.map((issue) => (
                  <Tooltip key={issue.id}>
                    <TooltipTrigger asChild>
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-help">
                        <SeverityBadge severity={issue.severity} />
                        <span className="text-sm">{issue.title}</span>
                        {issue.autoFixable && (
                          <Badge variant="outline" className="text-xs">Auto-fix</Badge>
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-xs">
                      <p className="font-medium">{issue.title}</p>
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                      <p className="text-sm text-green-600 mt-1">Solution: {issue.solution}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}
