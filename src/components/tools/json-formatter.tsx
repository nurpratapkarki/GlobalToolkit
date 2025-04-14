
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToolLayout } from "@/components/tool-layout";
import { Check, Copy, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const formatJSON = () => {
    try {
      if (!input.trim()) {
        setOutput("");
        setError(null);
        return;
      }

      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Invalid JSON: ${err.message}`
          : "Something went wrong"
      );
      setOutput("");
    }
  };

  const handleCopy = () => {
    if (!output) return;
    
    navigator.clipboard.writeText(output);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Formatted JSON has been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <ToolLayout
      title="JSON Formatter"
      description="Format and validate JSON data"
      actionButtons={
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={formatJSON}
            className="flex items-center gap-1"
          >
            <Play className="h-4 w-4" />
            Format
          </Button>
          <Button
            variant={copied ? "outline" : "outline"}
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
        <div className="flex flex-col h-full">
          <div className="mb-2 font-medium">Input</div>
          <Textarea
            placeholder="Paste JSON here..."
            className="flex-1 font-mono text-sm resize-none min-h-[300px]"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col h-full">
          <div className="mb-2 font-medium">Output</div>
          <div
            className={cn(
              "flex-1 font-mono text-sm p-4 border rounded-md overflow-auto min-h-[300px]",
              error ? "border-red-400 bg-red-50 dark:bg-red-900/10" : ""
            )}
          >
            {error ? (
              <div className="text-red-500">{error}</div>
            ) : (
              <pre>{output}</pre>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
