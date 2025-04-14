
import { useState, useRef, ChangeEvent } from "react";
import { ToolLayout } from "../tool-layout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftRight, Copy, Download, Upload, FileJson, RefreshCw, FileText, FileSpreadsheet } from "lucide-react";
import yaml from "js-yaml";
import { parse as csvParse } from "csv-parse/sync";
import { stringify as csvStringify } from "csv-stringify/sync";
import { js2xml, xml2js } from "xml-js";

type ConversionFormat = "json" | "yaml" | "csv" | "xml" | "base64";

interface ConversionOption {
  value: ConversionFormat;
  label: string;
  icon: React.ReactNode;
}

export function Converter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [inputFormat, setInputFormat] = useState<ConversionFormat>("json");
  const [outputFormat, setOutputFormat] = useState<ConversionFormat>("yaml");
  const [prettyPrint, setPrettyPrint] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const conversionOptions: ConversionOption[] = [
    { value: "json", label: "JSON", icon: <FileJson className="h-4 w-4" /> },
    { value: "yaml", label: "YAML", icon: <FileText className="h-4 w-4" /> },
    { value: "csv", label: "CSV", icon: <FileSpreadsheet className="h-4 w-4" /> },
    { value: "xml", label: "XML", icon: <FileText className="h-4 w-4" /> },
    { value: "base64", label: "Base64", icon: <RefreshCw className="h-4 w-4" /> }
  ];

  const handleConvert = () => {
    try {
      if (!inputText.trim()) {
        toast({
          title: "Error",
          description: "Input text is empty",
          variant: "destructive",
        });
        return;
      }

      let result = "";

      // JSON conversions
      if (inputFormat === "json" && outputFormat === "yaml") {
        const jsonObj = JSON.parse(inputText);
        result = yaml.dump(jsonObj, { indent: prettyPrint ? 2 : 0 });
      } else if (inputFormat === "json" && outputFormat === "csv") {
        const jsonObj = JSON.parse(inputText);
        if (!Array.isArray(jsonObj)) {
          throw new Error("JSON must be an array of objects to convert to CSV");
        }
        result = csvStringify(jsonObj, { header: true });
      } else if (inputFormat === "json" && outputFormat === "xml") {
        const jsonObj = JSON.parse(inputText);
        result = js2xml(jsonObj, { compact: true, spaces: prettyPrint ? 2 : 0 });
      } else if (inputFormat === "json" && outputFormat === "base64") {
        result = btoa(inputText);
      }
      
      // YAML conversions
      else if (inputFormat === "yaml" && outputFormat === "json") {
        const yamlObj = yaml.load(inputText);
        result = JSON.stringify(yamlObj, null, prettyPrint ? 2 : 0);
      } else if (inputFormat === "yaml" && outputFormat === "csv") {
        const yamlObj = yaml.load(inputText);
        if (!Array.isArray(yamlObj)) {
          throw new Error("YAML must be an array of objects to convert to CSV");
        }
        result = csvStringify(yamlObj, { header: true });
      } else if (inputFormat === "yaml" && outputFormat === "xml") {
        const yamlObj = yaml.load(inputText);
        result = js2xml(yamlObj, { compact: true, spaces: prettyPrint ? 2 : 0 });
      } else if (inputFormat === "yaml" && outputFormat === "base64") {
        result = btoa(inputText);
      }
      
      // CSV conversions
      else if (inputFormat === "csv" && outputFormat === "json") {
        const records = csvParse(inputText, { columns: true });
        result = JSON.stringify(records, null, prettyPrint ? 2 : 0);
      } else if (inputFormat === "csv" && outputFormat === "yaml") {
        const records = csvParse(inputText, { columns: true });
        result = yaml.dump(records, { indent: prettyPrint ? 2 : 0 });
      } else if (inputFormat === "csv" && outputFormat === "xml") {
        const records = csvParse(inputText, { columns: true });
        result = js2xml({ records }, { compact: true, spaces: prettyPrint ? 2 : 0 });
      } else if (inputFormat === "csv" && outputFormat === "base64") {
        result = btoa(inputText);
      }
      
      // XML conversions
      else if (inputFormat === "xml" && outputFormat === "json") {
        const xmlObj = xml2js(inputText, { compact: true });
        result = JSON.stringify(xmlObj, null, prettyPrint ? 2 : 0);
      } else if (inputFormat === "xml" && outputFormat === "yaml") {
        const xmlObj = xml2js(inputText, { compact: true });
        result = yaml.dump(xmlObj, { indent: prettyPrint ? 2 : 0 });
      } else if (inputFormat === "xml" && outputFormat === "csv") {
        toast({
          title: "Conversion not supported",
          description: "Direct XML to CSV conversion is not supported",
          variant: "destructive",
        });
        return;
      } else if (inputFormat === "xml" && outputFormat === "base64") {
        result = btoa(inputText);
      }

      // Base64 conversions
      else if (inputFormat === "base64" && outputFormat === "json") {
        result = atob(inputText);
        // Try to parse it as JSON to validate
        JSON.parse(result);
      } else if (inputFormat === "base64" && outputFormat === "yaml") {
        result = atob(inputText);
        // Try to parse it as YAML to validate
        yaml.load(result);
      } else if (inputFormat === "base64" && outputFormat === "csv") {
        result = atob(inputText);
      } else if (inputFormat === "base64" && outputFormat === "xml") {
        result = atob(inputText);
      }

      // Same format
      else if (inputFormat === outputFormat) {
        if (inputFormat === "json") {
          const jsonObj = JSON.parse(inputText);
          result = JSON.stringify(jsonObj, null, prettyPrint ? 2 : 0);
        } else if (inputFormat === "yaml") {
          const yamlObj = yaml.load(inputText);
          result = yaml.dump(yamlObj, { indent: prettyPrint ? 2 : 0 });
        } else {
          result = inputText;
        }
      }
      
      setOutputText(result);
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion Error",
        description: error?.message || "Failed to convert the input",
        variant: "destructive",
      });
    }
  };

  const handleInputFormatChange = (value: ConversionFormat) => {
    if (value === outputFormat) {
      // Swap formats if they would be the same
      setOutputFormat(inputFormat);
    }
    setInputFormat(value);
  };

  const handleOutputFormatChange = (value: ConversionFormat) => {
    if (value === inputFormat) {
      // Swap formats if they would be the same
      setInputFormat(outputFormat);
    }
    setOutputFormat(value);
  };

  const handleSwapFormats = () => {
    setInputFormat(outputFormat);
    setOutputFormat(inputFormat);
    setInputText(outputText);
    setOutputText(inputText);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await readFileAsText(file);
      setInputText(content);
      
      // Auto-detect format from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension === 'json') setInputFormat('json');
      else if (extension === 'yml' || extension === 'yaml') setInputFormat('yaml');
      else if (extension === 'csv') setInputFormat('csv');
      else if (extension === 'xml') setInputFormat('xml');
      else if (file.type.startsWith('text/')) {
        // Try to detect format from content
        try {
          JSON.parse(content);
          setInputFormat('json');
        } catch {
          // Not JSON, try YAML
          try {
            yaml.load(content);
            setInputFormat('yaml');
          } catch {
            // Not YAML either, assume it's text
            setInputFormat('csv');
          }
        }
      }
    } catch (error) {
      console.error("Error reading file:", error);
      toast({
        title: "File Error",
        description: "Failed to read the file",
        variant: "destructive",
      });
    }
    
    // Clear the input value so the same file can be uploaded again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied",
      description: "Output copied to clipboard",
    });
  };

  const handleDownloadOutput = () => {
    let extension = '.txt';
    let mimeType = 'text/plain';
    
    switch (outputFormat) {
      case 'json': extension = '.json'; mimeType = 'application/json'; break;
      case 'yaml': extension = '.yaml'; mimeType = 'application/x-yaml'; break;
      case 'csv': extension = '.csv'; mimeType = 'text/csv'; break;
      case 'xml': extension = '.xml'; mimeType = 'application/xml'; break;
      case 'base64': extension = '.txt'; mimeType = 'text/plain'; break;
    }
    
    const blob = new Blob([outputText], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download Started",
      description: `Your file is being downloaded as converted${extension}`,
    });
  };

  return (
    <ToolLayout
      title="Format Converter"
      description="Convert between different data formats: JSON, YAML, CSV, XML, Base64"
      actionButtons={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleCopyOutput}
            disabled={!outputText}
          >
            <Copy className="h-4 w-4" />
            <span className="hidden sm:inline">Copy</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleDownloadOutput}
            disabled={!outputText}
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </Button>
        </div>
      }
    >
      <div className="flex flex-col space-y-4">
        <Tabs defaultValue="text-input" className="w-full">
          <TabsList>
            <TabsTrigger value="text-input">Text Input</TabsTrigger>
            <TabsTrigger value="file-upload">File Upload</TabsTrigger>
          </TabsList>
          
          <TabsContent value="text-input" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div>
                <Label htmlFor="input-format">Input Format</Label>
                <Select
                  value={inputFormat}
                  onValueChange={(value) => handleInputFormatChange(value as ConversionFormat)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select input format" />
                  </SelectTrigger>
                  <SelectContent>
                    {conversionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSwapFormats}
                  className="rounded-full"
                >
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label htmlFor="output-format">Output Format</Label>
                <Select
                  value={outputFormat}
                  onValueChange={(value) => handleOutputFormatChange(value as ConversionFormat)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select output format" />
                  </SelectTrigger>
                  <SelectContent>
                    {conversionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="flex items-center">
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <Textarea
              placeholder={`Enter ${inputFormat.toUpperCase()} here...`}
              className="font-mono text-sm h-[200px]"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </TabsContent>
          
          <TabsContent value="file-upload">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary/50 hover:bg-secondary"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supported formats: JSON, YAML, CSV, XML, TXT
                      </p>
                    </div>
                    <Input
                      ref={fileInputRef}
                      id="file-upload"
                      type="file"
                      accept=".json,.yaml,.yml,.csv,.xml,.txt,text/plain"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center gap-4">
          <Button onClick={handleConvert} className="min-w-[100px]">
            Convert
          </Button>
          <div className="flex items-center space-x-2">
            <Switch
              id="pretty-print"
              checked={prettyPrint}
              onCheckedChange={setPrettyPrint}
            />
            <Label htmlFor="pretty-print">Pretty Print</Label>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <Label htmlFor="output" className="text-sm font-medium">
              Output ({outputFormat.toUpperCase()})
            </Label>
          </div>
          <Textarea
            id="output"
            placeholder="Output will appear here..."
            className="font-mono text-sm h-[200px]"
            value={outputText}
            readOnly
          />
        </div>
      </div>
    </ToolLayout>
  );
}
