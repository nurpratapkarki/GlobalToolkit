
import { Outlet } from "react-router-dom";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "./ui/button";

export function Layout() {
  const isMobile = useIsMobile();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Only show sidebar on desktop or when mobile sidebar is toggled */}
      {(!isMobile || showMobileSidebar) && (
        <div
          className={`${
            isMobile ? "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" : ""
          }`}
          onClick={isMobile ? () => setShowMobileSidebar(false) : undefined}
        >
          <div
            className={`${
              isMobile ? "h-full w-72" : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar />
          </div>
        </div>
      )}
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <div className="flex items-center">
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="ml-2"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          )}
          <div className="flex-1">
            <Header />
          </div>
        </div>
        
        <main className="flex-1 overflow-auto p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
