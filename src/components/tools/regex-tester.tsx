
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ToolLayout } from "@/components/tool-layout";
import { Copy, Play, Check, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [flags, setFlags] = useState({
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false
  });
  const [highlightedText, setHighlightedText] = useState<React.ReactNode | string>("");
  
  const { toast } = useToast();

  // Test regex when pattern, text, or flags change
  useEffect(() => {
    if (pattern && testText) {
      testRegex();
    }
  }, [pattern, testText, flags]);

  const getFlagsString = () => {
    return Object.entries(flags)
      .filter(([_, enabled]) => enabled)
      .map(([flag]) => flag)
      .join("");
  };

  const testRegex = () => {
    if (!pattern) {
      setError(null);
      setOutput([]);
      setHighlightedText(testText);
      return;
    }

    try {
      const flagsString = getFlagsString();
      const regex = new RegExp(pattern, flagsString);
      
      // Find all matches
      const matches: string[] = [];
      let match;
      
      // Need to manually implement matchAll logic for non-global regex
      if (flags.g) {
        try {
          const matchesArray = [...testText.matchAll(regex)];
          matchesArray.forEach(match => {
            if (match[0]) matches.push(match[0]);
          });
        } catch (err) {
          // Fallback for browsers without matchAll
          let tempMatches = testText.match(regex);
          if (tempMatches) matches.push(...tempMatches);
        }
      } else {
        match = testText.match(regex);
        if (match && match[0]) matches.push(match[0]);
      }
      
      // Highlight matches in text
      let highlightedResult = testText;
      if (matches.length > 0) {
        // Create a version of text with matches highlighted
        try {
          const parts: React.ReactNode[] = [];
          let lastIndex = 0;
          
          const highlightRegex = new RegExp(pattern, flagsString);
          let match;
          
          // For non-global regex, we need to manually find matches
          if (flags.g) {
            let allMatches: RegExpExecArray[] = [];
            while ((match = highlightRegex.exec(testText)) !== null) {
              allMatches.push(match);
              if (!flags.g) break; // If not global, only get the first match
            }
            
            allMatches.forEach((match) => {
              // Add text before the match
              if (match.index > lastIndex) {
                parts.push(testText.substring(lastIndex, match.index));
              }
              
              // Add highlighted match
              parts.push(
                <span key={`match-${match.index}`} className="bg-yellow-200 dark:bg-yellow-900">
                  {match[0]}
                </span>
              );
              
              lastIndex = match.index + match[0].length;
            });
            
            // Add remaining text after the last match
            if (lastIndex < testText.length) {
              parts.push(testText.substring(lastIndex));
            }
            
            setHighlightedText(<>{parts}</>);
          } else {
            // For non-global regex, just highlight the first match
            match = highlightRegex.exec(testText);
            if (match) {
              parts.push(testText.substring(0, match.index));
              parts.push(
                <span key="match" className="bg-yellow-200 dark:bg-yellow-900">
                  {match[0]}
                </span>
              );
              parts.push(testText.substring(match.index + match[0].length));
              setHighlightedText(<>{parts}</>);
            } else {
              setHighlightedText(testText);
            }
          }
        } catch (err) {
          // Fallback if highlighting fails
          setHighlightedText(testText);
        }
      } else {
        setHighlightedText(testText);
      }
      
      setOutput(matches);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? `Invalid regex: ${err.message}`
          : "Something went wrong"
      );
      setOutput([]);
      setHighlightedText(testText);
    }
  };

  const handleCopy = () => {
    if (!output || output.length === 0) return;
    
    const textToCopy = output.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "Regex matches have been copied to your clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFlag = (flag: keyof typeof flags) => {
    setFlags(prev => ({ ...prev, [flag]: !prev[flag] }));
  };

  return (
    <ToolLayout
      title="Regex Tester"
      description="Test and validate regular expressions"
      actionButtons={
        <div className="flex space-x-2">
          <Button 
            variant="default" 
            onClick={testRegex}
            className="flex items-center gap-1"
          >
            <Play className="h-4 w-4" />
            Test
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!output || output.length === 0}
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
          <div className="mb-4">
            <div className="mb-2 font-medium">Regex Pattern</div>
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex-grow">
                <Input
                  placeholder="/pattern/flags"
                  className="font-mono"
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(flags).map(([flag, enabled]) => (
                  <Badge 
                    key={flag}
                    variant={enabled ? "default" : "outline"} 
                    className="cursor-pointer select-none"
                    onClick={() => toggleFlag(flag as keyof typeof flags)}
                  >
                    {flag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mb-2 font-medium">Test Text</div>
          <Textarea
            placeholder="Type or paste text to test against your regex pattern..."
            className="flex-1 resize-none min-h-[200px]"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col h-full">
          <div className="mb-2 font-medium">Results</div>
          {error && (
            <div className="p-2 mb-4 border rounded-md bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="mb-4">
            <div className="text-sm font-medium text-muted-foreground mb-1">
              Matches ({output.length})
            </div>
            <div className="border rounded-md p-2 bg-muted/30 font-mono text-sm max-h-[150px] overflow-y-auto">
              {output.length > 0 ? (
                output.map((match, i) => (
                  <div key={i} className="mb-1 last:mb-0">
                    {match}
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground italic">No matches found</div>
              )}
            </div>
          </div>
          
          <div className="text-sm font-medium text-muted-foreground mb-1">
            Highlighted Text
          </div>
          <div
            className={cn(
              "flex-1 p-3 border rounded-md overflow-auto whitespace-pre-wrap min-h-[150px]",
              error ? "border-red-400 bg-red-50 dark:bg-red-900/10" : ""
            )}
          >
            {highlightedText}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
