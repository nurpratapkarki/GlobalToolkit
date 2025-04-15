
import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eraser } from "lucide-react";

export function CodeBeautifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<"js" | "css" | "html">("js");
  const { toast } = useToast();

  const minify = () => {
    // Basic minification (placeholder)
    const minified = input.replace(/\s+/g, ' ').trim();
    setOutput(minified);
  };

  const beautify = () => {
    // Basic beautification (placeholder)
    try {
      const formatted = JSON.stringify(JSON.parse(input), null, 2);
      setOutput(formatted);
    } catch {
      setOutput(input);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied!",
      description: "Output copied to clipboard",
    });
  };

  const clear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <ToolLayout title="Code Beautifier" description="Minify or beautify your code">
      <div className="max-w-6xl mx-auto space-y-6">
        <Tabs defaultValue="js" onValueChange={(v) => setFormat(v as "js" | "css" | "html")}>
          <TabsList>
            <TabsTrigger value="js">JavaScript</TabsTrigger>
            <TabsTrigger value="css">CSS</TabsTrigger>
            <TabsTrigger value="html">HTML</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Textarea 
              placeholder="Paste your code here..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[400px] font-mono"
            />
          </div>
          
          <div className="space-y-2">
            <Textarea 
              readOnly
              value={output}
              className="min-h-[400px] font-mono"
              placeholder="Output will appear here..."
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={clear}>
            <Eraser className="h-4 w-4 mr-2" />
            Clear
          </Button>
          <Button onClick={minify}>Minify</Button>
          <Button onClick={beautify}>Beautify</Button>
          <Button variant="outline" onClick={copyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </ToolLayout>
  );
}
