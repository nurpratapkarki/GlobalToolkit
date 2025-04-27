
import { useState, useEffect } from "react";
import { ToolLayout } from "../tool-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRCodeGenerator } from "./qrcode/generator";
import { QRCodeScanner } from "./qrcode/scanner";

export function QRCodeTool() {
  const [activeTab, setActiveTab] = useState<string>("generator");

  const handleTabChange = (value: string) => {
    // Changing tabs will unmount the previous tab's components
    setActiveTab(value);
  };

  return (
    <ToolLayout
      title="QR Code Tool"
      description="Generate and scan QR codes easily"
    >
      <div className="max-w-4xl mx-auto">
        <Tabs
          defaultValue="generator"
          className="w-full"
          onValueChange={handleTabChange}
          value={activeTab}
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="scanner">Scanner</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="animate-fade-in">
            <QRCodeGenerator />
          </TabsContent>
          
          <TabsContent value="scanner" className="animate-fade-in">
            {/* Only mount scanner component when scanner tab is active */}
            {activeTab === "scanner" && <QRCodeScanner />}
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
