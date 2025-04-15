
import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Check, RefreshCw } from "lucide-react";
import tinycolor from "tinycolor2";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type PaletteType = "analogous" | "monochromatic" | "splitcomplement" | "triad" | "tetrad" | "complementary";

export function ColorPalette() {
  const [baseColor, setBaseColor] = useState(tinycolor("#6366f1"));
  const [copiedPalette, setCopiedPalette] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePalette = (type: PaletteType) => {
    switch (type) {
      case "analogous":
        return baseColor.analogous(6);
      case "monochromatic":
        return baseColor.monochromatic(5);
      case "splitcomplement":
        return baseColor.splitcomplement();
      case "triad":
        return baseColor.triad();
      case "tetrad":
        return baseColor.tetrad();
      case "complementary":
        return [baseColor, baseColor.complement()];
      default:
        return [];
    }
  };

  const handleColorChange = (hex: string) => {
    const newColor = tinycolor(hex);
    if (newColor.isValid()) setBaseColor(newColor);
  };

  const generateRandomColor = () => {
    const randomColor = tinycolor.random();
    setBaseColor(randomColor);
  };

  const copyPalette = (colors: tinycolor.Instance[], type: string) => {
    const hexColors = colors.map(c => c.toHexString()).join(", ");
    navigator.clipboard.writeText(hexColors);
    setCopiedPalette(type);
    setTimeout(() => setCopiedPalette(null), 2000);
    
    toast({
      title: "Copied!",
      description: "Color palette copied to clipboard",
    });
  };

  const ColorRow = ({ colors, title, type }: { colors: tinycolor.Instance[], title: string, type: string }) => (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">{title}</Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyPalette(colors, type)}
            className="gap-2"
          >
            {copiedPalette === type ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Palette
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
          {colors.map((color, i) => (
            <div key={i} className="space-y-2">
              <button
                className="w-full aspect-square rounded-md shadow-sm border transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ backgroundColor: color.toHexString() }}
                onClick={() => handleColorChange(color.toHexString())}
                title="Use this color as base"
              />
              <p className="text-xs text-center font-mono">{color.toHexString()}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate color palettes from a base color"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <Label className="text-lg">Base Color</Label>
              <div className="flex gap-4 items-center">
                <div
                  className="w-24 h-24 rounded-lg shadow-md border"
                  style={{ backgroundColor: baseColor.toHexString() }}
                />
                <div className="flex-1 space-y-4">
                  <div className="flex gap-3">
                    <Input
                      value={baseColor.toHexString()}
                      onChange={(e) => handleColorChange(e.target.value)}
                      placeholder="#000000"
                      className="font-mono"
                    />
                    <Input 
                      type="color" 
                      value={baseColor.toHexString()} 
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-12 h-10 cursor-pointer p-1"
                    />
                    <Button
                      variant="outline"
                      onClick={generateRandomColor}
                      title="Generate random color"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Random
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>RGB: {baseColor.toRgbString()}</div>
                    <div>HSL: {baseColor.toHslString()}</div>
                    <div>Name: {baseColor.toName() || 'Custom'}</div>
                    <div>Brightness: {Math.round(baseColor.getBrightness())}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Palettes</TabsTrigger>
            <TabsTrigger value="complementary">Complementary</TabsTrigger>
            <TabsTrigger value="analogous">Analogous</TabsTrigger>
            <TabsTrigger value="monochromatic">Monochromatic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <ColorRow colors={generatePalette("complementary")} title="Complementary" type="complementary" />
            <ColorRow colors={generatePalette("analogous")} title="Analogous" type="analogous" />
            <ColorRow colors={generatePalette("monochromatic")} title="Monochromatic" type="monochromatic" />
            <ColorRow colors={generatePalette("splitcomplement")} title="Split Complementary" type="splitcomplement" />
            <ColorRow colors={generatePalette("triad")} title="Triadic" type="triad" />
            <ColorRow colors={generatePalette("tetrad")} title="Tetradic" type="tetrad" />
          </TabsContent>
          
          <TabsContent value="complementary">
            <ColorRow colors={generatePalette("complementary")} title="Complementary" type="complementary" />
          </TabsContent>
          
          <TabsContent value="analogous">
            <ColorRow colors={generatePalette("analogous")} title="Analogous" type="analogous" />
          </TabsContent>
          
          <TabsContent value="monochromatic">
            <ColorRow colors={generatePalette("monochromatic")} title="Monochromatic" type="monochromatic" />
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
