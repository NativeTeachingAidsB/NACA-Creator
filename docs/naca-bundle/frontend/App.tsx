import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DevSyncProvider } from "@/contexts/DevSyncContext";
import { nacaApi } from "@/lib/naca-api";
import { ApiDocMonitorCompact } from "@/components/admin/ApiDocMonitor";
import Home from "@/pages/Home";
import HelpAdmin from "@/pages/HelpAdmin";
import ApiDocsPage from "@/pages/ApiDocsPage";
import SubdomainAdmin from "@/pages/SubdomainAdmin";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/help" component={HelpAdmin} />
      <Route path="/admin/subdomains" component={SubdomainAdmin} />
      <Route path="/docs/activity-editor" component={ApiDocsPage} />
      <Route path="/API" component={ApiDocsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize NACA proxy with stored URL on app load
  useEffect(() => {
    nacaApi.initializeProxy();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <DevSyncProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ApiDocMonitorCompact />
        </TooltipProvider>
      </DevSyncProvider>
    </QueryClientProvider>
  );
}

export default App;
