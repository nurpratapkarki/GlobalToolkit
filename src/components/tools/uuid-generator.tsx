
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ToolLayout } from "@/components/tool-layout";
import { Check, Copy, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";

type UuidVersion = 'v1' | 'v4';

export function UuidGenerator() {
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<UuidVersion>('v4');
  const [count, setCount] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Generate UUID function (client-side implementation)
  const generateUuidV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Generate UUID v1 (time-based with random node)
  const generateUuidV1 = (): string => {
    // Simple implementation - not truly spec compliant but visually correct
    const now = new Date();
    const timeStr = now.getTime().toString(16).padStart(12, '0');
    
    return (
      timeStr.substring(0, 8) + '-' +
      timeStr.substring(8, 12) + '-' +
      '1' + timeStr.substring(13, 16) + '-' +
      (0x8000 + Math.floor(Math.random() * 0x4000)).toString(16) + '-' +
      Math.floor(Math.random() * 0x1000000000000).toString(16).padStart(12, '0')
    );
  };

  const generateUuids = () => {
    const newUuids: string[] = [];
    
    for (let i = 0; i < count; i++) {
      if (version === 'v4') {
        newUuids.push(generateUuidV4());
      } else {
        newUuids.push(generateUuidV1());
      }
    }
    
    setUuids(newUuids);
  };

  const handleCopy = () => {
    if (!uuids.length) return;
    
    const textToCopy = uuids.join('\n');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: `${uuids.length} UUID${uuids.length > 1 ? 's' : ''} copied to clipboard`,
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!uuids.length) return;
    
    const textData = uuids.join('\n');
    const blob = new Blob([textData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `uuids-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${uuids.length} UUID${uuids.length > 1 ? 's' : ''} downloaded as text file`,
    });
  };

  return (
    <ToolLayout
      title="UUID Generator"
      description="Generate random UUIDs v1 or v4"
      actionButtons={
        <div className="flex space-x-2">
          <Button 
            variant="default"
            onClick={generateUuids}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Generate
          </Button>
          <Button
            variant="outline"
            onClick={handleCopy}
            disabled={!uuids.length}
            className="flex items-center gap-1"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <Button 
            variant="outline"
            onClick={handleDownload}
            disabled={!uuids.length}
            className="flex items-center gap-1 hidden sm:flex"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      }
    >
      <div className="grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="version" className="mb-2 block">UUID Version</Label>
            <RadioGroup 
              id="version"
              defaultValue="v4" 
              className="flex space-x-4"
              onValueChange={(val) => setVersion(val as UuidVersion)}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="v4" id="v4" />
                <Label htmlFor="v4" className="cursor-pointer">v4 (Random)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="v1" id="v1" />
                <Label htmlFor="v1" className="cursor-pointer">v1 (Time-based)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div>
            <Label htmlFor="count" className="mb-2 block">Count (1-100)</Label>
            <div className="flex items-center">
              <Input 
                id="count"
                type="number" 
                min="1" 
                max="100"
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-2 font-medium flex justify-between items-center">
            <span>Generated UUIDs {uuids.length > 0 && `(${uuids.length})`}</span>
          </div>
          <div
            className={cn(
              "p-4 border rounded-md bg-muted/20 font-mono text-sm min-h-[300px] overflow-y-auto",
              uuids.length === 0 ? "flex items-center justify-center text-muted-foreground" : ""
            )}
          >
            {uuids.length > 0 ? (
              <div className="space-y-1">
                {uuids.map((uuid, index) => (
                  <div key={index} className="select-all">
                    {uuid}
                  </div>
                ))}
              </div>
            ) : (
              <span>Click "Generate" to create UUIDs</span>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
