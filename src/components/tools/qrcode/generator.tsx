
import { useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Download, QrCode } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QRCodeGenerator() {
  const [text, setText] = useState("");
  const [qrValue, setQrValue] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerate = () => {
    if (!text.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter text or URL to generate a QR code",
        variant: "destructive",
      });
      return;
    }
    setQrValue(text);
    toast({
      title: "QR Code Generated",
      description: "Your QR code has been created successfully",
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrValue);
    toast({
      title: "Text Copied",
      description: "The QR code content has been copied to clipboard",
    });
  };

  const handleDownload = () => {
    if (!qrRef.current || !qrValue) return;
    
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;
    
    // Create a temporary link element and trigger download without appending to DOM
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.png";
    
    // Use modern approach to click the link without appending to the DOM
    link.style.display = "none";
    link.click();
    
    toast({
      title: "QR Code Downloaded",
      description: "Your QR code has been downloaded as PNG",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Generate QR Code</CardTitle>
          <CardDescription>
            Enter text or a URL to generate a QR code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="Enter text or URL" 
                value={text} 
                onChange={(e) => setText(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleGenerate}>Generate</Button>
            </div>
            
            {qrValue && (
              <div className="flex flex-col items-center space-y-4 pt-4">
                <div 
                  ref={qrRef} 
                  className="p-4 bg-white rounded-md shadow-sm"
                >
                  <QRCodeCanvas 
                    value={qrValue} 
                    size={200}
                    level="H"
                    includeMargin
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCopy}>
                    <Copy className="mr-2 h-4 w-4" /> Copy Text
                  </Button>
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {!qrValue && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-md">
          <QrCode className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Enter text and click Generate to create a QR code</p>
        </div>
      )}
    </div>
  );
}
