import { useState, useRef } from "react";
import jsQR from "jsqr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, RefreshCw, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import React from "react";

export function QRCodeScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { toast } = useToast();

  // Start camera scanning
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        scanQRFromCamera();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  // Stop camera scanning
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  // Toggle camera scanning
  const toggleScanning = () => {
    if (isScanning) {
      stopScanning();
    } else {
      startScanning();
    }
  };

  // Continuously scan QR code from camera feed
  const scanQRFromCamera = () => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    // Only process frame if video is playing
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Get image data for QR processing
      try {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });
        
        if (code) {
          // QR code found
          setScanResult(code.data);
          stopScanning();
          toast({
            title: "Success",
            description: "QR Code scanned successfully",
          });
          return;
        }
      } catch (error) {
        console.error("Error processing video frame:", error);
      }
    }
    
    // Continue scanning
    requestAnimationFrame(scanQRFromCamera);
  };

  // Handle file uploads
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

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        context.drawImage(img, 0, 0, img.width, img.height);
        
        // Process the image data
        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });
          
          if (code) {
            setScanResult(code.data);
            toast({
              title: "Success",
              description: "QR Code found in image",
            });
          } else {
            toast({
              title: "No QR Code Found",
              description: "Could not detect a QR code in the image",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error processing image:", error);
          toast({
            title: "Processing Error",
            description: "Failed to process the image",
            variant: "destructive",
          });
        }
      };
      if (typeof e.target.result === "string") {
        img.src = e.target.result;
      } else {
        console.error("Unexpected result type:", typeof e.target.result);
      }
    };
    reader.readAsDataURL(file);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset the scanner
  const handleReset = () => {
    setScanResult(null);
    if (isScanning) {
      stopScanning();
    }
  };

  // Check if text is a valid URL
  const isValidURL = (text) => {
    try {
      new URL(text);
      return true;
    } catch (e) {
      return false;
    }
  };

  // Clean up on unmount
  React.useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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
                  <Button onClick={toggleScanning}>
                    {isScanning ? "Stop Camera" : "Start Camera"}
                    <Camera className="ml-2 h-4 w-4" />
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
                    <video 
                      ref={videoRef}
                      className="w-full h-[300px] object-cover border rounded-lg"
                    />
                    <canvas 
                      ref={canvasRef} 
                      className="hidden"
                    />
                  </div>
                )}

                {!isScanning && !scanResult && (
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