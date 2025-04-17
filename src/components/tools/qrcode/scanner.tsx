
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, ExternalLink, RefreshCw, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";

export function QRCodeScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanActive, setScanActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Function to check if the scanned text is a URL
  const isValidURL = (text: string): boolean => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Initialize scanner
  useEffect(() => {
    if (scannerDivRef.current) {
      scannerRef.current = new Html5Qrcode("qr-reader");
    }

    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error("Error stopping scanner:", error);
        });
      }
    };
  }, []);

  const startScanner = async () => {
    if (!scannerRef.current) return;
    
    try {
      setScanActive(true);
      setScanResult(null);
      
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // We don't need to show QR scanning errors to the user
          console.log(errorMessage);
        }
      );
    } catch (err) {
      console.error("Error starting scanner:", err);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check your permissions.",
        variant: "destructive",
      });
      setScanActive(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
        setScanActive(false);
      } catch (error) {
        console.error("Error stopping scanner:", error);
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.match('image.*')) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file (PNG, JPG, JPEG, WEBP)",
        variant: "destructive",
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target && typeof event.target.result === 'string') {
        setUploadedImage(event.target.result);
        
        if (scannerRef.current) {
          try {
            const result = await scannerRef.current.scanFile(file, true);
            setScanResult(result);
            toast({
              title: "QR Code Detected",
              description: "Successfully scanned the QR code from the image",
            });
          } catch (error) {
            console.error("QR Code scan error:", error);
            toast({
              title: "Scan Failed",
              description: "Could not detect a valid QR code in the image",
              variant: "destructive",
            });
          }
        }
      }
    };
    reader.readAsDataURL(file);
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
            Scan a QR code using your camera or upload an image
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
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    style={{ display: 'none' }}
                  />
                </div>
                
                <div 
                  id="qr-reader" 
                  ref={scannerDivRef}
                  style={{ width: '100%', minHeight: '300px' }}
                  className="border rounded-md overflow-hidden"
                >
                  {!scanActive && !uploadedImage && (
                    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center bg-muted/30">
                      <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center px-4">
                        Start the camera or upload an image to scan a QR code
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
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {scanResult && (
              <Alert className="animate-fade-in">
                <AlertTitle>QR Code Content</AlertTitle>
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
