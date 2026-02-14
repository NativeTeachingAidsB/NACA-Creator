import { SubdomainManager } from "@/components/SubdomainManager";
import { SubdomainHealthCheck } from "@/components/admin/SubdomainHealthCheck";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Globe, Activity } from "lucide-react";
import { Link } from "wouter";

export default function SubdomainAdmin() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="btn-back-home">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Domain Management</h1>
          <div className="w-[100px]" />
        </div>
        
        <Tabs defaultValue="health" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="health" className="flex items-center gap-2" data-testid="tab-health-check">
              <Activity className="h-4 w-4" />
              Health Check
            </TabsTrigger>
            <TabsTrigger value="manager" className="flex items-center gap-2" data-testid="tab-subdomain-manager">
              <Globe className="h-4 w-4" />
              Subdomain Manager
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="health">
            <SubdomainHealthCheck 
              autoRefreshInterval={60000}
              showExportButton={true}
              showAutoRefreshToggle={true}
            />
          </TabsContent>
          
          <TabsContent value="manager">
            <SubdomainManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
