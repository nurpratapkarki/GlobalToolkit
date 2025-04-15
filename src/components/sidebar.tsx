
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Code2,
  RefreshCw,
  FileJson,
  Hash,
  Braces,
  FileText,
  KeyRound,
  Settings,
  ChevronRight,
  ChevronLeft,
  Palette,
  PaintBucket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type SidebarItem = {
  name: string;
  icon: React.ElementType;
  path: string;
};

const sidebarItems: SidebarItem[] = [
  {
    name: "JSON",
    icon: FileJson,
    path: "/json",
  },
  {
    name: "Regex",
    icon: Code2,
    path: "/regex",
  },
  {
    name: "UUID",
    icon: Hash,
    path: "/uuid",
  },
  {
    name: "Markdown",
    icon: FileText,
    path: "/markdown",
  },
  {
    name: "Base64",
    icon: RefreshCw,
    path: "/base64",
  },
  {
    name: "JWT",
    icon: KeyRound,
    path: "/jwt",
  },
  {
    name: "Converter",
    icon: RefreshCw,
    path: "/converter",
  },
  {
    name: "Color Converter",
    icon: PaintBucket,
    path: "/color",
  },
  {
    name: "Color Palette",
    icon: Palette,
    path: "/palette",
  },
  {
    name: "Code Beautifier",
    icon: Braces,
    path: "/beautify",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div 
      className={cn(
        "h-screen bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div className="text-xl font-mono font-bold">
            &lt;/DevToolBox&gt;
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="flex-1 py-4 overflow-y-auto scrollbar-hide">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Tooltip key={item.name} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link to={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 font-medium",
                        collapsed ? "justify-center px-2" : "px-3",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {!collapsed && <span>{item.name}</span>}
                    </Button>
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {item.name}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
