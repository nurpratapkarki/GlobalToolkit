
import React, { ReactNode } from "react";
import { Copy, Download, Share2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ToolLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  actionButtons?: ReactNode;
};

export function ToolLayout({
  title,
  description,
  children,
  actionButtons,
}: ToolLayoutProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard",
    });
  };

  const handleDownload = () => {
    toast({
      title: "Download started",
      description: "Your file is being downloaded",
    });
  };

  const handleShare = () => {
    toast({
      title: "Share link generated",
      description: "Link has been copied to your clipboard",
    });
  };

  const handleSave = () => {
    toast({
      title: "Session saved",
      description: "Your session has been saved",
    });
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="border-b p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>
          <div className="flex space-x-2">
            {actionButtons ? (
              actionButtons
            ) : (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline">Copy</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Download</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex items-center gap-1"
                  onClick={handleSave}
                >
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Save</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-auto">{children}</div>
    </div>
  );
}
