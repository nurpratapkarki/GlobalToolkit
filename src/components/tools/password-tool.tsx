
import { useState, useEffect } from "react";
import { ToolLayout } from "../tool-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PasswordStrengthChecker } from "./password/strength-checker";
import { PasswordHasher } from "./password/hasher";

export function PasswordTool() {
  const [activeTab, setActiveTab] = useState<string>("strength");

  return (
    <ToolLayout
      title="Password Tools"
      description="Check password strength and generate secure hashes"
    >
      <div className="max-w-4xl mx-auto">
        <Tabs
          defaultValue="strength"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="strength">Strength Checker</TabsTrigger>
            <TabsTrigger value="hasher">Password Hasher</TabsTrigger>
          </TabsList>
          
          <TabsContent value="strength" className="animate-fade-in">
            <PasswordStrengthChecker />
          </TabsContent>
          
          <TabsContent value="hasher" className="animate-fade-in">
            <PasswordHasher />
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
