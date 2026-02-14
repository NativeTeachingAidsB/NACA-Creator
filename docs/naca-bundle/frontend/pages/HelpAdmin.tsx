import { HelpAdminPanel } from "@/components/admin/HelpAdminPanel";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function HelpAdmin() {
  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="h-14 border-b flex items-center px-4 gap-4 shrink-0">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Editor
          </Button>
        </Link>
        <h1 className="font-semibold">Help Content Administration</h1>
      </header>
      <main className="flex-1 overflow-hidden">
        <HelpAdminPanel />
      </main>
    </div>
  );
}
