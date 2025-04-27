import { useState, useEffect } from "react";
import { ToolLayout } from "../tool-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeGenerator } from "./qrcode/generator";
import { QRCodeScanner } from "./qrcode/scanner";

export function QRCodeTool() {
  const [activeTab, setActiveTab] = useState<string>("generator");

  // This keeps track of whether components should be mounted
  const [mountScanner, setMountScanner] = useState(false);

  // Use useEffect to manage scanner mounting with a slight delay
  useEffect(() => {
    if (activeTab === "scanner") {
      // Small delay to ensure clean mounting
      const timer = setTimeout(() => {
        setMountScanner(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setMountScanner(false);
    }
  }, [activeTab]);

  return (
    <ToolLayout
      title="QR Code Tool"
      description="Generate and scan QR codes easily"
    >
      <div className="max-w-4xl mx-auto">
        <Tabs
          defaultValue="generator"
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="animate-fade-in">
            <QRCodeGenerator />
          </TabsContent>
          
          <TabsContent value="scanner" className="animate-fade-in">
            {mountScanner && <QRCodeScanner key={`scanner-${Date.now()}`} />}
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
