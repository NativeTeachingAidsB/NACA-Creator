import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DevSyncProvider } from "@/contexts/DevSyncContext";
import { RecordingProvider } from "@/contexts/RecordingContext";
import { useApplyTheme } from "@/hooks/use-settings-profiles";
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

function ThemeApplicator({ children }: { children: React.ReactNode }) {
  useApplyTheme();
  return <>{children}</>;
}

function App() {
  useEffect(() => {
    nacaApi.initializeProxy();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeApplicator>
        <DevSyncProvider>
          <RecordingProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
              <ApiDocMonitorCompact />
            </TooltipProvider>
          </RecordingProvider>
        </DevSyncProvider>
      </ThemeApplicator>
    </QueryClientProvider>
  );
}

export default App;
