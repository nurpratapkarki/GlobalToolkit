import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Camera,
  ExternalLink,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";

export function QRCodeScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanActive, setScanActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [scannerInitialized, setScannerInitialized] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const isValidURL = (text: string) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (!scannerInitialized) {
      try {
        scannerRef.current = new Html5Qrcode("qr-reader");
        setScannerInitialized(true);
      } catch (error) {
        console.error("Error initializing scanner:", error);
        toast({
          title: "Scanner Error",
          description: "Could not initialize the QR scanner",
          variant: "destructive",
        });
      }
    }

    return () => {
      if (scannerRef.current && scanActive) {
        scannerRef.current.stop().catch((err) =>
          console.error("Error stopping scanner on unmount:", err)
        );
      }
    };
  }, [toast, scanActive, scannerInitialized]);

  const startScanner = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
  
    try {
      setScanResult(null);
      setUploadedImage(null);
      setScanActive(true);
  
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        handleScanSuccess,
        (err) => console.log("Camera scanning error:", err)
      );
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        title: "Camera Failed",
        description: "Couldn't start camera. Check permissions or restart device.",
        variant: "destructive",
      });
    }
  };
  
  

  const stopScanner = async () => {
    if (scannerRef.current && scanActive) {
      try {
        await scannerRef.current.stop();
        setScanActive(false);
      } catch (err) {
        console.error("Stop error:", err);
      }
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    await stopScanner();
    setScanResult(decodedText);
    toast({
      title: "QR Code Detected",
      description: "Successfully scanned a QR code",
    });
  };

  const handleRestart = () => {
    setScanResult(null);
    setUploadedImage(null);
    startScanner();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    setScanResult(null);
    setUploadedImage(URL.createObjectURL(file));
  
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
  
    try {
      const result = await scannerRef.current.scanFile(file, true);
      setScanResult(result);
      toast({
        title: "QR Code Detected",
        description: "Scanned from image",
      });
    } catch (err) {
      console.error("Image scan failed:", err);
      toast({
        title: "No QR Code Found",
        description: "Try uploading a clearer image",
        variant: "destructive",
      });
    }
  
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const openURL = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Scan via camera or upload an image to decode a QR code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!scanResult && (
              <div className="flex flex-col space-y-4">
                <div className="flex justify-center space-x-4">
                  <Button onClick={scanActive ? stopScanner : startScanner}>
                    <Camera className="mr-2 h-4 w-4" />
                    {scanActive ? "Stop Camera" : "Start Camera"}
                  </Button>
                  <Button variant="outline" onClick={triggerFileUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    hidden
                  />
                </div>

                <div
                  id="qr-reader"
                  className="border rounded-md min-h-[300px] overflow-hidden"
                >
                  {!scanActive && !uploadedImage && (
                    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-muted/30">
                      <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center px-4">
                        Start camera or upload image to scan QR
                      </p>
                    </div>
                  )}
                  {uploadedImage && (
                    <div className="relative w-full flex justify-center p-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded QR"
                        className="max-w-full max-h-[400px] object-contain"
                      />
                      <div className="absolute inset-0 bg-black opacity-50" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Camera className="h-16 w-16 text-white" /> 
                        <p className="text-white text-center px-4">
                          Scanning image...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {scanResult && (
              <Alert className="animate-fade-in">
                <AlertTitle>QR Code Result</AlertTitle>
                <AlertDescription className="space-y-4">
                  <div className="p-4 bg-muted/30 rounded break-all">
                    {scanResult}
                  </div>
                  <div className="flex space-x-3">
                    <Button onClick={handleRestart} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan Another
                    </Button>
                    {isValidURL(scanResult) && (
                      <Button onClick={() => openURL(scanResult)}>
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
