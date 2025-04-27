
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, ExternalLink, RefreshCw, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5QrcodeScanner } from "html5-qrcode";

export function QRCodeScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      // Cleanup scanner on component unmount
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  const initializeScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }

    try {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: 250,
          aspectRatio: 1.0,
          supportedScanTypes: [],
        },
        false
      );

      scannerRef.current.render(
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          console.log("QR Code scanning in progress...");
        }
      );

      setIsScanning(true);
      setScanResult(null);
    } catch (err) {
      console.error("Scanner initialization error:", err);
      toast({
        title: "Scanner Error",
        description: "Could not initialize the QR code scanner. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setIsScanning(false);
    setScanResult(decodedText);
    toast({
      title: "Success",
      description: "QR Code scanned successfully",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create a new scanner instance for file scanning
    const html5QrcodeScanner = new Html5QrcodeScanner(
      "qr-reader-file",
      { fps: 10, qrbox: 250, supportedScanTypes: [] },
      false
    );

    try {
      const imageUrl = URL.createObjectURL(file);
      await html5QrcodeScanner.render();
      
      const result = await html5QrcodeScanner.scanFile(file);
      handleScanSuccess(result);
    } catch (error) {
      console.error("Scanning error:", error);
      toast({
        title: "Scanning Failed",
        description: "Could not detect a QR code in the image",
        variant: "destructive",
      });
    } finally {
      html5QrcodeScanner.clear();
      URL.revokeObjectURL(imageUrl);
    }
  };

  const handleReset = () => {
    setScanResult(null);
    setIsScanning(false);
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
  };

  const isValidURL = (text: string): boolean => {
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
                  <Button onClick={isScanning ? handleReset : initializeScanner}>
                    <Camera className="mr-2 h-4 w-4" />
                    {isScanning ? "Stop Camera" : "Start Camera"}
                  </Button>
                  <Button variant="outline">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="qr-file-input"
                    />
                    <label htmlFor="qr-file-input" className="flex items-center cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Image
                    </label>
                  </Button>
                </div>

                <div 
                  id="qr-reader"
                  className="w-full min-h-[300px] border rounded-lg overflow-hidden bg-muted/30"
                >
                  {!isScanning && (
                    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center">
                      <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center px-4">
                        Start the camera or upload an image to scan a QR code
                      </p>
                    </div>
                  )}
                </div>
                <div id="qr-reader-file" className="hidden"></div>
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
