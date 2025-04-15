
import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Eraser, Download, Upload, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function CodeBeautifier() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [format, setFormat] = useState<"js" | "css" | "html" | "json">("js");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const minify = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to minify",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let minified = "";
      
      // Basic minification for different formats
      switch (format) {
        case "json":
          // For JSON, we parse and stringify without spaces
          const jsonObj = JSON.parse(input);
          minified = JSON.stringify(jsonObj);
          break;
          
        case "js":
          // Basic JS minification
          minified = input
            .replace(/\/\/.*?\n/g, '') // Remove single line comments
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .replace(/\s*([=+\-*/{}\[\]();,:<>])\s*/g, '$1') // Remove spaces around operators
            .trim();
          break;
          
        case "css":
          // Basic CSS minification
          minified = input
            .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .replace(/\s*([:;{},])\s*/g, '$1') // Remove spaces around special chars
            .replace(/;}|{ /g, '}') // Clean up semicolons and spaces
            .trim();
          break;
          
        case "html":
          // Basic HTML minification
          minified = input
            .replace(/<!--[\s\S]*?-->/g, '') // Remove HTML comments
            .replace(/\s+/g, ' ') // Replace multiple spaces with a single space
            .replace(/>\s+</g, '><') // Remove spaces between tags
            .trim();
          break;
      }
      
      setOutput(minified);
      toast({
        title: "Success",
        description: "Code minified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to minify code. Make sure it's valid " + format.toUpperCase(),
        variant: "destructive",
      });
      setOutput("Error: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const beautify = () => {
    if (!input.trim()) {
      toast({
        title: "Error",
        description: "Please enter some code to beautify",
        variant: "destructive",
      });
      return;
    }
    
    try {
      let beautified = "";
      
      // Improved beautification for different formats
      switch (format) {
        case "json":
          // For JSON, we use JSON.stringify with indentation
          const jsonObj = JSON.parse(input);
          beautified = JSON.stringify(jsonObj, null, 2);
          break;
          
        case "js":
          // Improved JS formatting - fix the broken logic
          beautified = formatJavaScript(input);
          break;
          
        case "css":
          // Basic CSS formatting
          beautified = input
            .replace(/\s*{\s*/g, ' {\n  ')
            .replace(/;\s*/g, ';\n  ')
            .replace(/\s*}\s*/g, '\n}\n')
            .replace(/\n\s*\n/g, '\n')
            .trim();
          break;
          
        case "html":
          // Basic HTML formatting
          beautified = formatHtml(input);
          break;
      }
      
      setOutput(beautified);
      toast({
        title: "Success",
        description: "Code beautified successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to beautify code. Make sure it's valid " + format.toUpperCase(),
        variant: "destructive",
      });
      setOutput("Error: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  // Improved JavaScript formatting function
  const formatJavaScript = (code: string) => {
    try {
      // First try to parse as JSON, which is valid JavaScript
      try {
        const obj = JSON.parse(code);
        return JSON.stringify(obj, null, 2);
      } catch {
        // Not valid JSON, continue with JS formatting
      }
      
      // Basic indentation
      let result = '';
      let indentLevel = 0;
      let inString = false;
      let stringChar = '';
      let escaped = false;
      
      // Process the code character by character
      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        const nextChar = code[i + 1] || '';
        const prevChar = code[i - 1] || '';
        
        // Handle strings
        if ((char === '"' || char === "'" || char === '`') && !escaped) {
          if (inString && stringChar === char) {
            inString = false;
          } else if (!inString) {
            inString = true;
            stringChar = char;
          }
          result += char;
          continue;
        }
        
        // Handle escape characters in strings
        if (char === '\\' && inString) {
          escaped = !escaped;
          result += char;
          continue;
        } else {
          escaped = false;
        }
        
        // Skip formatting inside strings
        if (inString) {
          result += char;
          continue;
        }
        
        // Handle block comments
        if (char === '/' && nextChar === '*') {
          const endComment = code.indexOf('*/', i + 2);
          if (endComment !== -1) {
            result += '/*' + code.substring(i + 2, endComment) + '*/';
            i = endComment + 1;
            continue;
          }
        }
        
        // Handle line comments
        if (char === '/' && nextChar === '/') {
          const endLine = code.indexOf('\n', i);
          if (endLine !== -1) {
            result += '//' + code.substring(i + 2, endLine);
            i = endLine - 1;
          } else {
            result += '//' + code.substring(i + 2);
            i = code.length;
          }
          continue;
        }
        
        // Handle line breaks
        if (char === '\n') {
          result += '\n' + '  '.repeat(indentLevel);
          continue;
        }
        
        // Handle opening brackets
        if (char === '{' || char === '[') {
          result += char;
          if (nextChar !== '\n') {
            result += '\n' + '  '.repeat(++indentLevel);
          } else {
            indentLevel++;
          }
          continue;
        }
        
        // Handle closing brackets
        if (char === '}' || char === ']') {
          if (prevChar !== '\n') {
            result += '\n' + '  '.repeat(--indentLevel);
          } else {
            indentLevel--;
          }
          result += char;
          if (nextChar !== ';' && nextChar !== ',' && nextChar !== ')') {
            result += '\n' + '  '.repeat(indentLevel);
          }
          continue;
        }
        
        // Handle semicolons
        if (char === ';') {
          result += char;
          if (nextChar !== '\n' && nextChar !== '}') {
            result += '\n' + '  '.repeat(indentLevel);
          }
          continue;
        }
        
        // Add all other characters
        result += char;
      }
      
      return result;
    } catch (error) {
      // Fallback to basic formatting if advanced formatting fails
      return formatBasic(code);
    }
  };
  
  // Basic code formatting as fallback
  const formatBasic = (code: string) => {
    let result = '';
    let indentLevel = 0;
    
    code.split(/[\r\n]+/).forEach(line => {
      line = line.trim();
      if (!line) return;
      
      // Decrease indent for closing braces/brackets
      if (line.match(/^[}\])]/) || line.startsWith('case ') || line === 'default:') {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // Add current line with proper indentation
      result += '  '.repeat(indentLevel) + line + '\n';
      
      // Increase indent for opening braces/brackets
      if (line.endsWith('{') || line.endsWith('[') || line.endsWith('(') || 
          line.endsWith(':') && !line.match(/^(case|default):/)) {
        indentLevel++;
      }
      
      // Handle one-liners with braces
      if (line.includes('{') && line.includes('}')) {
        // No change to indent level
      } else if (line.endsWith('}') || line.endsWith(']') || line.endsWith(')')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
    });
    
    return result;
  };

  // Basic HTML formatting
  const formatHtml = (html: string) => {
    let formatted = '';
    let indent = 0;
    
    // Remove existing whitespace
    html = html.replace(/>\s+</g, '><');
    
    // Process each character
    for (let i = 0; i < html.length; i++) {
      const char = html[i];
      
      if (char === '<') {
        // Check if it's a closing tag
        if (html[i+1] === '/') {
          indent--;
        }
        
        // Add newline and indentation before tags (except first)
        if (formatted.length > 0) {
          formatted += '\n' + '  '.repeat(Math.max(0, indent));
        }
        
        // Add the character
        formatted += char;
        
        // Check if it's not a closing tag or self-closing tag
        if (html[i+1] !== '/' && html[i+1] !== '!' && !/<[^>]*\/>/.test(html.substring(i, i + 30))) {
          // Don't increment for self-closing tags, comments, etc.
          if (!/\/>/.test(html.substring(i, i + 30)) && 
              !/<(br|hr|img|input|link|meta|area|base|col|embed|keygen|param|source|track)[\s>]/.test(html.substring(i, i + 30))) {
            indent++;
          }
        }
      } else if (char === '>') {
        formatted += char;
      } else {
        formatted += char;
      }
    }
    
    return formatted;
  };

  const copyToClipboard = () => {
    if (!output) {
      toast({
        title: "Nothing to copy",
        description: "Generate some output first",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: "Copied!",
      description: "Output copied to clipboard",
    });
  };

  const clear = () => {
    setInput("");
    setOutput("");
    toast({
      title: "Cleared",
      description: "Input and output have been cleared",
    });
  };

  const downloadOutput = () => {
    if (!output) {
      toast({
        title: "Nothing to download",
        description: "Generate some output first",
        variant: "destructive",
      });
      return;
    }
    
    const extensions: Record<string, string> = {
      js: 'js',
      json: 'json',
      css: 'css',
      html: 'html',
    };
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${extensions[format]}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: `Output saved as formatted.${extensions[format]}`,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Auto-detect format from file extension
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (extension === 'js' || extension === 'json' || extension === 'css' || extension === 'html') {
      setFormat(extension as any);
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setInput(content);
        toast({
          title: "File loaded",
          description: `${file.name} loaded successfully`,
        });
      }
    };
    reader.onerror = () => {
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      });
    };
    reader.readAsText(file);
  };

  return (
    <ToolLayout title="Code Beautifier" description="Minify or beautify your code">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-4">
            <Tabs defaultValue={format} onValueChange={(v) => setFormat(v as any)}>
              <TabsList>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="html">HTML</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between bg-muted/40 px-4 py-2 border-b">
                <h3 className="font-medium">Input</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={clear} className="h-8">
                    <Eraser className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      accept=".js,.json,.css,.html"
                    />
                    <Button variant="ghost" size="sm" className="h-8">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
              <Textarea 
                placeholder={`Paste your ${format.toUpperCase()} code here...`} 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[400px] font-mono border-0 rounded-none focus-visible:ring-0 resize-none"
              />
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between bg-muted/40 px-4 py-2 border-b">
                <h3 className="font-medium">Output</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={copyToClipboard} className="h-8">
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadOutput} className="h-8">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea 
                readOnly
                value={output}
                className="min-h-[400px] font-mono border-0 rounded-none focus-visible:ring-0 resize-none"
                placeholder={`Formatted ${format.toUpperCase()} will appear here...`}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2 justify-center">
          <Button size="lg" onClick={minify} className="px-8">Minify</Button>
          <Button size="lg" onClick={beautify} className="px-8">Beautify</Button>
        </div>
      </div>
    </ToolLayout>
  );
}
