import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, RefreshCw, Palette, Monitor, Plus } from "lucide-react";
import tinycolor from "tinycolor2";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type WebsiteType = "corporate" | "creative" | "ecommerce" | "blog" | "portfolio";
type GradientType = "linear" | "solid";

interface GradientStop {
  color: string;
  position: number;
}

const websitePresets = {
  corporate: {
    gradients: [
      "linear-gradient(to right, #0ea5e9, #2563eb)",
      "linear-gradient(to right, #475569, #1e293b)",
      "linear-gradient(to right, #0891b2, #0c4a6e)"
    ],
    combinations: [
      ["#0ea5e9", "#2563eb", "#475569"],
      ["#1e293b", "#475569", "#94a3b8"],
      ["#0891b2", "#0c4a6e", "#164e63"]
    ]
  },
  creative: {
    gradients: [
      "linear-gradient(to right, #ec4899, #8b5cf6)",
      "linear-gradient(to right, #f97316, #db2777)",
      "linear-gradient(to right, #8b5cf6, #6366f1)"
    ],
    combinations: [
      ["#ec4899", "#8b5cf6", "#6366f1"],
      ["#f97316", "#db2777", "#ec4899"],
      ["#8b5cf6", "#6366f1", "#3b82f6"]
    ]
  },
  ecommerce: {
    gradients: [
      "linear-gradient(to right, #16a34a, #059669)",
      "linear-gradient(to right, #7c3aed, #4f46e5)",
      "linear-gradient(to right, #ea580c, #dc2626)"
    ],
    combinations: [
      ["#16a34a", "#059669", "#0d9488"],
      ["#7c3aed", "#4f46e5", "#6366f1"],
      ["#ea580c", "#dc2626", "#ef4444"]
    ]
  },
  blog: {
    gradients: [
      "linear-gradient(to right, #8b5cf6, #ec4899)",
      "linear-gradient(to right, #06b6d4, #3b82f6)",
      "linear-gradient(to right, #f97316, #db2777)"
    ],
    combinations: [
      ["#8b5cf6", "#ec4899", "#f43f5e"],
      ["#06b6d4", "#3b82f6", "#6366f1"],
      ["#f97316", "#db2777", "#e11d48"]
    ]
  },
  portfolio: {
    gradients: [
      "linear-gradient(to right, #6366f1, #2563eb)",
      "linear-gradient(to right, #0ea5e9, #2dd4bf)",
      "linear-gradient(to right, #8b5cf6, #6366f1)"
    ],
    combinations: [
      ["#6366f1", "#2563eb", "#3b82f6"],
      ["#0ea5e9", "#2dd4bf", "#06b6d4"],
      ["#8b5cf6", "#6366f1", "#818cf8"]
    ]
  }
};

export function ColorPalette() {
  const [websiteType, setWebsiteType] = useState<WebsiteType>("corporate");
  const [gradientType, setGradientType] = useState<GradientType>("linear");
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [selectedGradient, setSelectedGradient] = useState<string>(websitePresets[websiteType].gradients[0]);
  const [selectedCombination, setSelectedCombination] = useState<string[]>(websitePresets[websiteType].combinations[0]);
  const [customColors, setCustomColors] = useState<string[]>(['#0ea5e9', '#2563eb', '#475569']);
  const [generatedCombinations, setGeneratedCombinations] = useState<string[][]>([]);
  const [showMore, setShowMore] = useState(false);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    
    toast({
      title: "Copied!",
      description: "Color value copied to clipboard",
    });
  };

  const handleWebsiteTypeChange = (value: WebsiteType) => {
    setWebsiteType(value);
    setSelectedGradient(websitePresets[value].gradients[0]);
    setSelectedCombination(websitePresets[value].combinations[0]);
  };

  const generateColorCombinations = (baseColors: string[]) => {
    const combinations: string[][] = [];
    const color = tinycolor(baseColors[0]);
    
    combinations.push(
      color.analogous().map(c => c.toHexString())
    );
    
    combinations.push(
      color.triad().map(c => c.toHexString())
    );
    
    combinations.push(
      color.splitcomplement().map(c => c.toHexString())
    );

    combinations.push(
      color.monochromatic().slice(0, 3).map(c => c.toHexString())
    );

    setGeneratedCombinations(combinations);
  };

  const handleColorChange = (index: number, value: string) => {
    const newColors = [...customColors];
    newColors[index] = value;
    setCustomColors(newColors);
    generateColorCombinations(newColors);
  };

  const handleGenerateMore = () => {
    setShowMore(true);
    generateColorCombinations(customColors);
  };

  return (
    <ToolLayout
      title="Gradient & Color Scheme Generator"
      description="Generate gradients and color schemes for different types of websites"
    >
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <Label className="text-lg">Website Type</Label>
                <Select value={websiteType} onValueChange={handleWebsiteTypeChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select website type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corporate">Corporate / Business</SelectItem>
                    <SelectItem value="creative">Creative / Agency</SelectItem>
                    <SelectItem value="ecommerce">E-commerce</SelectItem>
                    <SelectItem value="blog">Blog / Publishing</SelectItem>
                    <SelectItem value="portfolio">Portfolio / Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <Label className="text-lg">Style Type</Label>
                <div className="flex gap-4">
                  <Button
                    variant={gradientType === "linear" ? "default" : "outline"}
                    onClick={() => setGradientType("linear")}
                    className="flex-1"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Gradient
                  </Button>
                  <Button
                    variant={gradientType === "solid" ? "default" : "outline"}
                    onClick={() => setGradientType("solid")}
                    className="flex-1"
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Solid Colors
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {gradientType === "linear" ? (
            <div className="space-y-6">
              <Label className="text-lg">Recommended Gradients</Label>
              <div className="grid gap-6">
                {websitePresets[websiteType].gradients.map((gradient, index) => (
                  <Card key={gradient} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <button
                        className="w-full h-32 transition-transform hover:scale-105"
                        style={{ background: gradient }}
                        onClick={() => copyToClipboard(gradient, index)}
                      />
                      <div className="p-4 flex items-center justify-between">
                        <code className="text-sm font-mono">{gradient}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(gradient, index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Label className="text-lg">Recommended Color Combinations</Label>
              <div className="grid gap-6">
                {websitePresets[websiteType].combinations.map((combination, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {combination.map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="aspect-square rounded-lg shadow-sm transition-transform hover:scale-105"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                          {combination.map((color, colorIndex) => (
                            <code key={colorIndex} className="text-sm font-mono">
                              {color}
                            </code>
                          ))}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(combination.join(", "), index)}
                        >
                          {copiedIndex === index ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        <Card className="mt-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Custom Color Generator</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generateColorCombinations(customColors)}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {customColors.map((color, index) => (
                  <div key={index} className="space-y-2">
                    <Input
                      type="color"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="h-12 w-full cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>

              {generatedCombinations.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-lg">Generated Combinations</Label>
                  <div className="grid gap-4">
                    {generatedCombinations.map((combination, index) => (
                      <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardContent className="p-4">
                          <div className="grid grid-cols-3 gap-4 mb-4">
                            {combination.map((color, colorIndex) => (
                              <div
                                key={colorIndex}
                                className="aspect-square rounded-lg shadow-sm transition-transform hover:scale-105"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex gap-2">
                              {combination.map((color, colorIndex) => (
                                <code key={colorIndex} className="text-sm font-mono">
                                  {color}
                                </code>
                              ))}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(combination.join(", "), index + 100)}
                            >
                              {copiedIndex === index + 100 ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {!showMore && (
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={handleGenerateMore}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Load More Combinations
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </ToolLayout>
  );
}
