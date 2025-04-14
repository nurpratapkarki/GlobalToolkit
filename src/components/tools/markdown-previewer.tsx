
import { useState, useEffect } from "react";
import { marked } from "marked";
import { ToolLayout } from "../tool-layout";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Copy, Download, ArrowLeftRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = useState("# Hello Markdown\n\nStart typing your markdown here...");
  const [html, setHtml] = useState("");
  const [view, setView] = useState<"split" | "edit" | "preview">("split");
  const { toast } = useToast();

  useEffect(() => {
    // Set up marked options
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    
    try {
      // Handle the potential Promise return type
      const renderMarkdown = async () => {
        const rendered = await marked.parse(markdown);
        setHtml(rendered);
      };
      
      renderMarkdown().catch(error => {
        console.error("Error parsing markdown:", error);
        setHtml("<p>Error parsing markdown</p>");
      });
    } catch (error) {
      console.error("Error parsing markdown:", error);
      setHtml("<p>Error parsing markdown</p>");
    }
  }, [markdown]);

  const handleCopy = () => {
    navigator.clipboard.writeText(html);
    toast({
      title: "HTML Copied",
      description: "HTML content has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([html], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = "markdown-export.html";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Download Started",
      description: "Your HTML file is being downloaded",
    });
  };

  const toggleView = () => {
    if (view === "split") setView("edit");
    else if (view === "edit") setView("preview");
    else setView("split");
  };

  return (
    <ToolLayout
      title="Markdown Previewer"
      description="Write markdown and see the HTML preview in real-time"
      actionButtons={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={toggleView}
          >
            <ArrowLeftRight className="h-4 w-4" />
            <span className="hidden sm:inline">
              {view === "split" && "Edit Only"}
              {view === "edit" && "Preview Only"}
              {view === "preview" && "Split View"}
            </span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy HTML</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download HTML</span>
          </Button>
        </div>
      }
    >
      <div className="h-full flex flex-col md:flex-row gap-4">
        {(view === "split" || view === "edit") && (
          <div className={`${view === "split" ? "md:w-1/2" : "w-full"}`}>
            <div className="mb-2 text-sm font-medium">Markdown Input</div>
            <Textarea
              className="h-[calc(100vh-250px)] font-mono text-sm"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Type your markdown here..."
              spellCheck="false"
            />
          </div>
        )}
        {(view === "split" || view === "preview") && (
          <div className={`${view === "split" ? "md:w-1/2" : "w-full"}`}>
            <div className="mb-2 text-sm font-medium">HTML Preview</div>
            <div
              className="border rounded-md p-4 h-[calc(100vh-250px)] overflow-auto prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
