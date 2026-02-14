import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Copy, 
  ExternalLink,
  AlertCircle,
  Server
} from "lucide-react";
import { toast } from "sonner";

interface Subdomain {
  id: string;
  subdomain: string;
  parentDomain: string;
  fullDomain: string;
  purpose: string;
  description: string | null;
  targetIp: string;
  dnsStatus: string;
  replitVerified: boolean;
  sslCertStatus: string;
  lastDnsCheck: string | null;
  dnsCheckResult: {
    resolvedIp?: string;
    httpStatus?: number;
    error?: string;
    checkedAt: string;
  } | null;
  porkbunRecords: {
    aRecord?: { host: string; answer: string; added: boolean };
    txtRecord?: { host: string; answer: string; added: boolean };
  } | null;
  replitVerificationCode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ValidationResult {
  subdomain: string;
  targetIp: string;
  resolvedIp?: string;
  httpStatus?: number;
  dnsStatus: string;
  isCorrectIp: boolean;
  isHttpOk: boolean;
  error?: string;
  checkedAt: string;
  porkbunInstructions?: {
    aRecord: { type: string; host: string; answer: string };
    txtRecord: { type: string; host: string; answer: string } | null;
  } | null;
}

const STATUS_ICONS = {
  pending: <Clock className="h-4 w-4 text-yellow-500" />,
  propagating: <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />,
  verified: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  error: <XCircle className="h-4 w-4 text-red-500" />,
};

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  propagating: "bg-blue-100 text-blue-800",
  verified: "bg-green-100 text-green-800",
  error: "bg-red-100 text-red-800",
};

export function SubdomainManager() {
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newSubdomain, setNewSubdomain] = useState({
    subdomain: "",
    purpose: "main-app",
    description: "",
    replitVerificationCode: "",
  });

  const { data: subdomains = [], isLoading, refetch } = useQuery<Subdomain[]>({
    queryKey: ["/api/subdomains"],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof newSubdomain) => {
      const res = await fetch("/api/subdomains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create subdomain");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subdomains"] });
      setIsAddDialogOpen(false);
      setNewSubdomain({ subdomain: "", purpose: "main-app", description: "", replitVerificationCode: "" });
      toast.success("Subdomain added successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subdomains/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete subdomain");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/subdomains"] });
      toast.success("Subdomain deleted");
    },
    onError: () => {
      toast.error("Failed to delete subdomain");
    },
  });

  const validateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/subdomains/${id}/validate-dns`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to validate DNS");
      return res.json() as Promise<ValidationResult>;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subdomains"] });
      if (result.dnsStatus === "verified") {
        toast.success(`${result.subdomain} is fully configured!`);
      } else if (result.dnsStatus === "propagating") {
        toast.info(`DNS is correct but Replit verification pending for ${result.subdomain}`);
      } else {
        toast.warning(`${result.subdomain}: ${result.error || "DNS not configured"}`);
      }
    },
    onError: () => {
      toast.error("Failed to validate DNS");
    },
  });

  const validateAllMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/subdomains/validate-all", { method: "POST" });
      if (!res.ok) throw new Error("Failed to validate all");
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/subdomains"] });
      const verified = data.results.filter((r: any) => r.dnsStatus === "verified").length;
      toast.success(`Validated ${data.results.length} subdomains (${verified} verified)`);
    },
    onError: () => {
      toast.error("Failed to validate subdomains");
    },
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard`);
  };

  const renderPorkbunInstructions = (subdomain: Subdomain) => {
    if (!subdomain.porkbunRecords) return null;
    
    return (
      <div className="mt-4 p-4 bg-muted rounded-lg space-y-3">
        <h4 className="font-medium flex items-center gap-2">
          <Server className="h-4 w-4" />
          Porkbun DNS Configuration
        </h4>
        
        {subdomain.porkbunRecords.aRecord && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">A Record</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background rounded text-sm">
                Type: A | Host: {subdomain.porkbunRecords.aRecord.host} | Answer: {subdomain.porkbunRecords.aRecord.answer}
              </code>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => copyToClipboard(subdomain.porkbunRecords!.aRecord!.answer, "IP address")}
                data-testid={`btn-copy-a-record-${subdomain.id}`}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Badge variant={subdomain.porkbunRecords.aRecord.added ? "default" : "outline"}>
                {subdomain.porkbunRecords.aRecord.added ? "Added" : "Pending"}
              </Badge>
            </div>
          </div>
        )}
        
        {subdomain.porkbunRecords.txtRecord && subdomain.replitVerificationCode && (
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">TXT Record (Verification)</Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-background rounded text-sm overflow-x-auto">
                Type: TXT | Host: {subdomain.porkbunRecords.txtRecord.host} | Answer: {subdomain.replitVerificationCode}
              </code>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => copyToClipboard(subdomain.replitVerificationCode!, "verification code")}
                data-testid={`btn-copy-txt-record-${subdomain.id}`}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Badge variant={subdomain.porkbunRecords.txtRecord.added ? "default" : "outline"}>
                {subdomain.porkbunRecords.txtRecord.added ? "Added" : "Pending"}
              </Badge>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="mt-2 text-muted-foreground">Loading subdomains...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Subdomain Manager
          </h2>
          <p className="text-muted-foreground">Configure and validate custom domain DNS settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => validateAllMutation.mutate()}
            disabled={validateAllMutation.isPending || subdomains.length === 0}
            data-testid="btn-validate-all"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${validateAllMutation.isPending ? "animate-spin" : ""}`} />
            Validate All
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="btn-add-subdomain">
                <Plus className="h-4 w-4 mr-2" />
                Add Subdomain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Subdomain</DialogTitle>
                <DialogDescription>
                  Configure a new subdomain for the NACA platform
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="subdomain">Subdomain</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="subdomain"
                      placeholder="create or api.create"
                      value={newSubdomain.subdomain}
                      onChange={(e) => setNewSubdomain({ ...newSubdomain, subdomain: e.target.value })}
                      data-testid="input-subdomain"
                    />
                    <span className="text-muted-foreground">.naca.community</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Select
                    value={newSubdomain.purpose}
                    onValueChange={(value) => setNewSubdomain({ ...newSubdomain, purpose: value })}
                  >
                    <SelectTrigger data-testid="select-purpose">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-app">Main Application</SelectItem>
                      <SelectItem value="api-docs">API Documentation</SelectItem>
                      <SelectItem value="staging">Staging Environment</SelectItem>
                      <SelectItem value="preview">Preview/Demo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="What this subdomain is used for..."
                    value={newSubdomain.description}
                    onChange={(e) => setNewSubdomain({ ...newSubdomain, description: e.target.value })}
                    data-testid="input-description"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Replit Verification Code (optional)</Label>
                  <Input
                    id="verificationCode"
                    placeholder="From Replit deployment settings"
                    value={newSubdomain.replitVerificationCode}
                    onChange={(e) => setNewSubdomain({ ...newSubdomain, replitVerificationCode: e.target.value })}
                    data-testid="input-verification-code"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get this from Replit's deployment settings when linking a custom domain
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={() => createMutation.mutate(newSubdomain)}
                  disabled={!newSubdomain.subdomain || createMutation.isPending}
                  data-testid="btn-save-subdomain"
                >
                  {createMutation.isPending ? "Adding..." : "Add Subdomain"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {subdomains.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Subdomains Configured</h3>
            <p className="text-muted-foreground mb-4">
              Add your first subdomain to start managing DNS configuration
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} data-testid="btn-add-first-subdomain">
              <Plus className="h-4 w-4 mr-2" />
              Add First Subdomain
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {subdomains.map((subdomain) => (
            <Card key={subdomain.id} data-testid={`card-subdomain-${subdomain.id}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {STATUS_ICONS[subdomain.dnsStatus as keyof typeof STATUS_ICONS] || STATUS_ICONS.pending}
                      {subdomain.fullDomain}
                    </CardTitle>
                    <Badge className={STATUS_COLORS[subdomain.dnsStatus as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending}>
                      {subdomain.dnsStatus}
                    </Badge>
                    {subdomain.replitVerified && (
                      <Badge variant="outline" className="border-green-500 text-green-600">
                        Replit Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(`https://${subdomain.fullDomain}`, "_blank")}
                      data-testid={`btn-open-${subdomain.id}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => validateMutation.mutate(subdomain.id)}
                      disabled={validateMutation.isPending}
                      data-testid={`btn-validate-${subdomain.id}`}
                    >
                      <RefreshCw className={`h-4 w-4 mr-1 ${validateMutation.isPending ? "animate-spin" : ""}`} />
                      Validate
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => {
                        if (confirm(`Delete ${subdomain.fullDomain}?`)) {
                          deleteMutation.mutate(subdomain.id);
                        }
                      }}
                      data-testid={`btn-delete-${subdomain.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="flex items-center gap-4 mt-1">
                  <span>Purpose: {subdomain.purpose}</span>
                  {subdomain.description && <span>• {subdomain.description}</span>}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-xs text-muted-foreground">Target IP</Label>
                    <div className="font-mono">{subdomain.targetIp}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Resolved IP</Label>
                    <div className="font-mono flex items-center gap-1">
                      {subdomain.dnsCheckResult?.resolvedIp || "—"}
                      {subdomain.dnsCheckResult?.resolvedIp === subdomain.targetIp && (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      )}
                      {subdomain.dnsCheckResult?.resolvedIp && subdomain.dnsCheckResult.resolvedIp !== subdomain.targetIp && (
                        <AlertCircle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">HTTP Status</Label>
                    <div className="font-mono">{subdomain.dnsCheckResult?.httpStatus || "—"}</div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Last Check</Label>
                    <div>
                      {subdomain.lastDnsCheck 
                        ? new Date(subdomain.lastDnsCheck).toLocaleString()
                        : "Never"
                      }
                    </div>
                  </div>
                </div>
                
                {subdomain.dnsCheckResult?.error && (
                  <div className="mt-3 p-2 bg-red-50 text-red-700 rounded text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {subdomain.dnsCheckResult.error}
                  </div>
                )}
                
                {subdomain.dnsStatus !== "verified" && renderPorkbunInstructions(subdomain)}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">Quick Reference: Porkbun DNS Setup</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>1. Login to <a href="https://porkbun.com" target="_blank" className="text-blue-600 hover:underline">Porkbun</a> → Account → Domain Management</p>
          <p>2. Find <code className="bg-background px-1 rounded">naca.community</code> → Click Details → Edit DNS Records</p>
          <p>3. Add A Record: Type = A, Host = subdomain name, Answer = IP address</p>
          <p>4. Add TXT Record (if needed): Type = TXT, Host = _replit-verify.subdomain, Answer = verification code</p>
          <p>5. Wait 5-30 minutes for DNS propagation, then click Validate</p>
        </CardContent>
      </Card>
    </div>
  );
}
