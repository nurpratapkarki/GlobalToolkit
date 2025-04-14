
import React, { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowDownUp, Copy, Upload, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export function Base64Converter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeMode, setActiveMode] = useState("encode");
  const [inputMode, setInputMode] = useState("text");
  const { toast } = useToast();

  const handleEncode = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input is empty",
        description: "Please enter some text to encode",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const encoded = window.btoa(inputText);
      setOutputText(encoded);
      toast({
        title: "Encoded successfully",
        description: "Text has been encoded to Base64",
      });
    } catch (error) {
      toast({
        title: "Encoding failed",
        description: "This text contains characters that cannot be encoded",
        variant: "destructive",
      });
    }
  };

  const handleDecode = () => {
    if (!inputText.trim()) {
      toast({
        title: "Input is empty",
        description: "Please enter some Base64 text to decode",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const decoded = window.atob(inputText);
      setOutputText(decoded);
      toast({
        title: "Decoded successfully",
        description: "Base64 has been decoded to text",
      });
    } catch (error) {
      toast({
        title: "Decoding failed",
        description: "Invalid Base64 string",
        variant: "destructive",
      });
    }
  };

  const handleSwap = () => {
    setInputText(outputText);
    setOutputText(inputText);
    setActiveMode(activeMode === "encode" ? "decode" : "encode");
  };

  const handleCopy = () => {
    if (!outputText) {
      toast({
        title: "Nothing to copy",
        description: "Generate some output first",
        variant: "destructive",
      });
      return;
    }
    
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied to clipboard",
      description: "Output has been copied to your clipboard",
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;
      
      if (typeof content === "string") {
        if (activeMode === "encode") {
          // For text files, use the content directly
          setInputText(content);
        } else {
          // For decode mode, assume file contains base64
          setInputText(content.trim());
        }
      } else if (content instanceof ArrayBuffer) {
        // Handle binary files (images, etc.)
        const bytes = new Uint8Array(content);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        
        if (activeMode === "encode") {
          // Encode binary data to base64
          try {
            const encoded = window.btoa(binary);
            setInputText(encoded);
          } catch (e) {
            toast({
              title: "File processing failed",
              description: "Could not process the binary file",
              variant: "destructive",
            });
          }
        }
      }
    };

    reader.onerror = () => {
      toast({
        title: "Error reading file",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      });
    };

    if (activeMode === "encode" && file.type.startsWith("text/")) {
      reader.readAsText(file);
    } else if (activeMode === "encode") {
      reader.readAsArrayBuffer(file);
    } else {
      // For decode mode, read as text
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!outputText) {
      toast({
        title: "Nothing to download",
        description: "Generate some output first",
        variant: "destructive",
      });
      return;
    }

    const blob = new Blob([outputText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `base64-${activeMode === "encode" ? "encoded" : "decoded"}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download started",
      description: "Your file is being downloaded",
    });
  };

  const actionButtons = (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleCopy}
      >
        <Copy className="h-4 w-4" />
        <span className="hidden sm:inline">Copy</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleDownload}
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </Button>
    </div>
  );

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Convert text to and from Base64 encoding"
      actionButtons={actionButtons}
    >
      <Tabs value={activeMode} onValueChange={setActiveMode} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="encode">Encode</TabsTrigger>
          <TabsTrigger value="decode">Decode</TabsTrigger>
        </TabsList>
        
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-4">
              <Label className="text-lg font-medium">Input</Label>
              <div className="mt-2">
                <RadioGroup
                  value={inputMode}
                  onValueChange={setInputMode}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="text" />
                    <Label htmlFor="text">Text</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="file" id="file" />
                    <Label htmlFor="file">File</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {inputMode === "text" ? (
              <Textarea
                placeholder={
                  activeMode === "encode"
                    ? "Enter text to encode as Base64..."
                    : "Enter Base64 string to decode..."
                }
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
            ) : (
              <div className="border border-input rounded-md p-4 bg-muted/20">
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                  accept={activeMode === "encode" ? "*/*" : "text/plain"}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {activeMode === "encode"
                    ? "Upload a file to encode its contents as Base64"
                    : "Upload a text file containing Base64 to decode"}
                </p>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <Button
                variant="default"
                onClick={activeMode === "encode" ? handleEncode : handleDecode}
                className="flex-1"
              >
                {activeMode === "encode" ? "Encode to Base64" : "Decode from Base64"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSwap}
                title="Swap input and output"
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-lg font-medium">Output</Label>
            <Textarea
              placeholder={
                activeMode === "encode"
                  ? "Base64 encoded output will appear here..."
                  : "Decoded text will appear here..."
              }
              value={outputText}
              readOnly
              className="min-h-[200px] font-mono text-sm mt-2"
            />
          </div>
        </div>
      </Tabs>
    </ToolLayout>
  );
}
