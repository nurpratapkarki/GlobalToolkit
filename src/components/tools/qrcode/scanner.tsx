import { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, RefreshCw, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function QRCodeScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleScan = (result) => {
    if (result) {
      setScanResult(result?.text);
      setIsScanning(false);
      toast({
        title: "Success",
        description: "QR Code scanned successfully",
      });
    }
  };

  const handleScanError = (error) => {
    console.error("QR Scanner error:", error);
    toast({
      title: "Scanner Error",
      description: "Could not access camera or scan QR code",
      variant: "destructive",
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // For file uploads, we can use a third-party library like jsQR
    // but for this example, let's inform the user about the limitation
    toast({
      title: "Feature Limitation",
      description: "The current version of react-qr-reader doesn't fully support image uploads. Consider upgrading to a newer QR scanning library.",
    });
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(false);
  };

  const isValidURL = (text) => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Scan a QR code using your camera or upload an image
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!scanResult && (
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setIsScanning(!isScanning)}>
                    {isScanning ? "Stop Camera" : "Start Camera"}
                  </Button>
                  <Button variant="outline">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="qr-file-input"
                      ref={fileInputRef}
                    />
                    <label htmlFor="qr-file-input" className="flex items-center cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </label>
                  </Button>
                </div>

                {isScanning && (
                  <div className="w-full min-h-[300px] relative">
                    <QrReader
                      constraints={{
                        facingMode: "environment"
                      }}
                      onResult={handleScan}
                      onError={handleScanError}
                      scanDelay={300}
                      videoId="qr-video"
                      videoStyle={{ width: '100%', height: '300px' }}
                      className="w-full h-[300px] border rounded-lg overflow-hidden"
                    />
                  </div>
                )}

                {!isScanning && (
                  <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center border rounded-lg">
                    <p className="text-muted-foreground text-center px-4">
                      Start the camera or upload an image to scan a QR code
                    </p>
                  </div>
                )}
              </div>
            )}

            {scanResult && (
              <Alert>
                <AlertTitle>QR Code Content</AlertTitle>
                <AlertDescription className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded break-all">
                    {scanResult}
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleReset} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan Another
                    </Button>
                    {isValidURL(scanResult) && (
                      <Button onClick={() => window.open(scanResult, "_blank", "noopener,noreferrer")}>
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open URL
                      </Button>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
