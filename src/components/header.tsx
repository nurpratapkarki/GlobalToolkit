
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Trash2, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const { toast } = useToast();
  
  const handleNewSession = () => {
    // This would clear the current tool state
    // For now, we'll just show a toast
    toast({
      title: "New Session",
      description: "Current session has been cleared",
    });
  };

  const handleDonate = () => {
    // You can replace this URL with your actual donation link
    window.open('https://github.com/sponsors', '_blank');
    toast({
      title: "Thank you!",
      description: "Your support helps keep this project alive ❤️",
    });
  };

  return (
    <header className="h-16 border-b flex items-center justify-between px-4 bg-background">
      <div className="flex items-center">
        <div className="text-xl font-mono font-semibold hidden md:block">
          &lt;/DevToolBox&gt;
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNewSession}
          className="flex items-center gap-1"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline">New Session</span>
        </Button>
        
        <ThemeToggle />
        
        <Button 
          variant="default" 
          size="sm"
          onClick={handleDonate}
          className="flex items-center gap-1"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Donate</span>
        </Button>
      </div>
    </header>
  );
}
