
import { useState, useEffect } from "react";
import { ToolLayout } from "../tool-layout";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Moon, Sun, SunMoon, RefreshCw, Check, Settings as SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface UserSettings {
  regexFlags: {
    global: boolean;
    caseInsensitive: boolean;
    multiline: boolean;
    singleLine: boolean;
    unicode: boolean;
    sticky: boolean;
  };
  jwtSettings: {
    defaultExpiration: number; // in hours
    algorithm: string;
  };
  markdownSettings: {
    livePreview: boolean;
    defaultView: "split" | "edit" | "preview";
  };
  base64Settings: {
    lineBreaks: boolean;
    urlSafe: boolean;
  };
  converterSettings: {
    defaultInputFormat: string;
    defaultOutputFormat: string;
    prettyPrint: boolean;
  };
  display: {
    fontSize: number; // in pixels
  };
}

const defaultSettings: UserSettings = {
  regexFlags: {
    global: true,
    caseInsensitive: false,
    multiline: false,
    singleLine: false,
    unicode: false,
    sticky: false,
  },
  jwtSettings: {
    defaultExpiration: 24,
    algorithm: "HS256",
  },
  markdownSettings: {
    livePreview: true,
    defaultView: "split",
  },
  base64Settings: {
    lineBreaks: false,
    urlSafe: false,
  },
  converterSettings: {
    defaultInputFormat: "json",
    defaultOutputFormat: "yaml",
    prettyPrint: true,
  },
  display: {
    fontSize: 14,
  },
};

export function Settings() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("devtoolbox-settings");
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings(parsedSettings);
      } catch (error) {
        console.error("Error parsing saved settings:", error);
      }
    }
  }, []);

  // Update settings handler
  const updateSettings = <K extends keyof UserSettings, S extends keyof UserSettings[K]>(
    category: K,
    setting: S,
    value: UserSettings[K][S]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
    setIsDirty(true);
  };

  // Save settings to localStorage
  const saveSettings = () => {
    localStorage.setItem("devtoolbox-settings", JSON.stringify(settings));
    setIsDirty(false);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved",
    });
  };

  // Reset to default settings
  const resetSettings = () => {
    setSettings(defaultSettings);
    setIsDirty(true);
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults",
    });
  };

  // Clear all saved data
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all saved data? This cannot be undone.")) {
      localStorage.clear();
      setSettings(defaultSettings);
      setIsDirty(false);
      toast({
        title: "Data Cleared",
        description: "All saved data has been cleared",
      });
    }
  };

  return (
    <ToolLayout
      title="Settings"
      description="Configure application preferences and tool settings"
      actionButtons={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetSettings}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button
            size="sm"
            onClick={saveSettings}
            disabled={!isDirty}
            className="flex items-center gap-1"
          >
            <Check className="h-4 w-4" />
            <span className="hidden sm:inline">Save Changes</span>
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <div className="mb-4">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="tools">Tool Settings</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>
          </div>
          
          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-base">Theme</Label>
                  <RadioGroup 
                    defaultValue={theme} 
                    className="flex space-x-4"
                    onValueChange={(value) => {
                      setTheme(value as "light" | "dark" | "system");
                    }}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="theme-light" />
                      <Label htmlFor="theme-light" className="flex items-center">
                        <Sun className="h-4 w-4 mr-1" /> Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="theme-dark" />
                      <Label htmlFor="theme-dark" className="flex items-center">
                        <Moon className="h-4 w-4 mr-1" /> Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="theme-system" />
                      <Label htmlFor="theme-system" className="flex items-center">
                        <SunMoon className="h-4 w-4 mr-1" /> System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="font-size">Font Size ({settings.display.fontSize}px)</Label>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs">12px</span>
                    <Slider 
                      id="font-size"
                      min={12} 
                      max={20}
                      step={1}
                      defaultValue={[settings.display.fontSize]}
                      value={[settings.display.fontSize]}
                      onValueChange={(value) => 
                        updateSettings("display", "fontSize", value[0])
                      }
                      className="flex-1"
                    />
                    <span className="text-xs">20px</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Data & Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={clearAllData}
                  >
                    Clear All Saved Data
                  </Button>
                  <CardDescription>
                    This will clear all locally stored data including settings and history.
                  </CardDescription>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tool Settings */}
          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Regex Tester Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Label>Default Regex Flags</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flag-global"
                      checked={settings.regexFlags.global}
                      onCheckedChange={(checked) => 
                        updateSettings("regexFlags", "global", checked)
                      }
                    />
                    <Label htmlFor="flag-global">Global (g)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flag-case"
                      checked={settings.regexFlags.caseInsensitive}
                      onCheckedChange={(checked) => 
                        updateSettings("regexFlags", "caseInsensitive", checked)
                      }
                    />
                    <Label htmlFor="flag-case">Case Insensitive (i)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flag-multiline"
                      checked={settings.regexFlags.multiline}
                      onCheckedChange={(checked) => 
                        updateSettings("regexFlags", "multiline", checked)
                      }
                    />
                    <Label htmlFor="flag-multiline">Multiline (m)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flag-singleline"
                      checked={settings.regexFlags.singleLine}
                      onCheckedChange={(checked) => 
                        updateSettings("regexFlags", "singleLine", checked)
                      }
                    />
                    <Label htmlFor="flag-singleline">Single Line (s)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flag-unicode"
                      checked={settings.regexFlags.unicode}
                      onCheckedChange={(checked) => 
                        updateSettings("regexFlags", "unicode", checked)
                      }
                    />
                    <Label htmlFor="flag-unicode">Unicode (u)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="flag-sticky"
                      checked={settings.regexFlags.sticky}
                      onCheckedChange={(checked) => 
                        updateSettings("regexFlags", "sticky", checked)
                      }
                    />
                    <Label htmlFor="flag-sticky">Sticky (y)</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">JWT Debugger Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="jwt-expiration">Default Token Expiration</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="jwt-expiration"
                      type="number" 
                      min="1"
                      value={settings.jwtSettings.defaultExpiration}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        if (value > 0) {
                          updateSettings("jwtSettings", "defaultExpiration", value);
                        }
                      }}
                      className="w-20"
                    />
                    <span>hours</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="jwt-algorithm">Default Algorithm</Label>
                  <Select
                    value={settings.jwtSettings.algorithm}
                    onValueChange={(value) => 
                      updateSettings("jwtSettings", "algorithm", value)
                    }
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HS256">HS256</SelectItem>
                      <SelectItem value="HS384">HS384</SelectItem>
                      <SelectItem value="HS512">HS512</SelectItem>
                      <SelectItem value="RS256">RS256</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Markdown Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="md-live-preview"
                    checked={settings.markdownSettings.livePreview}
                    onCheckedChange={(checked) => 
                      updateSettings("markdownSettings", "livePreview", checked)
                    }
                  />
                  <Label htmlFor="md-live-preview">Live Preview</Label>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="md-default-view">Default View</Label>
                  <Select
                    value={settings.markdownSettings.defaultView}
                    onValueChange={(value) => 
                      updateSettings("markdownSettings", "defaultView", value as "split" | "edit" | "preview")
                    }
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select view" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="split">Split</SelectItem>
                      <SelectItem value="edit">Edit Only</SelectItem>
                      <SelectItem value="preview">Preview Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Base64 & Converter Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="base64-linebreaks"
                    checked={settings.base64Settings.lineBreaks}
                    onCheckedChange={(checked) => 
                      updateSettings("base64Settings", "lineBreaks", checked)
                    }
                  />
                  <Label htmlFor="base64-linebreaks">Add Line Breaks</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="base64-urlsafe"
                    checked={settings.base64Settings.urlSafe}
                    onCheckedChange={(checked) => 
                      updateSettings("base64Settings", "urlSafe", checked)
                    }
                  />
                  <Label htmlFor="base64-urlsafe">URL Safe Encoding</Label>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-2">
                  <Label htmlFor="converter-input">Default Input Format</Label>
                  <Select
                    value={settings.converterSettings.defaultInputFormat}
                    onValueChange={(value) => 
                      updateSettings("converterSettings", "defaultInputFormat", value)
                    }
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="base64">Base64</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="converter-output">Default Output Format</Label>
                  <Select
                    value={settings.converterSettings.defaultOutputFormat}
                    onValueChange={(value) => 
                      updateSettings("converterSettings", "defaultOutputFormat", value)
                    }
                  >
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="yaml">YAML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="base64">Base64</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="converter-pretty"
                    checked={settings.converterSettings.prettyPrint}
                    onCheckedChange={(checked) => 
                      updateSettings("converterSettings", "prettyPrint", checked)
                    }
                  />
                  <Label htmlFor="converter-pretty">Pretty Print by Default</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Advanced Settings */}
          <TabsContent value="advanced" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Developer Settings</CardTitle>
                <CardDescription>Advanced options for developers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="console-logs" defaultChecked />
                  <Label htmlFor="console-logs">Enable Console Logs</Label>
                </div>
                
                <div className="pt-4">
                  <Button variant="outline" onClick={() => console.log("Current Settings:", settings)}>
                    Log Current Settings to Console
                  </Button>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      const settingsData = JSON.stringify(settings, null, 2);
                      const blob = new Blob([settingsData], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "devtoolbox-settings.json";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Export Settings as JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">About DevToolBox</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Version: 1.0.0
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created with ❤️ using React, Tailwind, and ShadcnUI
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
