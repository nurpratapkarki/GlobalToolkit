
import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import tinycolor from "tinycolor2";
import { useToast } from "@/hooks/use-toast";

type PaletteType = "analogous" | "monochromatic" | "splitcomplement" | "triad" | "tetrad";

export function ColorPalette() {
  const [baseColor, setBaseColor] = useState(tinycolor("#ff0000"));
  const { toast } = useToast();

  const generatePalette = (type: PaletteType) => {
    switch (type) {
      case "analogous":
        return baseColor.analogous();
      case "monochromatic":
        return baseColor.monochromatic();
      case "splitcomplement":
        return baseColor.splitcomplement();
      case "triad":
        return baseColor.triad();
      case "tetrad":
        return baseColor.tetrad();
      default:
        return [];
    }
  };

  const handleColorChange = (hex: string) => {
    const newColor = tinycolor(hex);
    if (newColor.isValid()) setBaseColor(newColor);
  };

  const copyPalette = (colors: tinycolor.Instance[]) => {
    const hexColors = colors.map(c => c.toHexString()).join(", ");
    navigator.clipboard.writeText(hexColors);
    toast({
      title: "Copied!",
      description: "Color palette copied to clipboard",
    });
  };

  const ColorRow = ({ colors, title }: { colors: tinycolor.Instance[], title: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyPalette(colors)}
          className="gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Palette
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-4">
        {colors.map((color, i) => (
          <div key={i} className="space-y-2">
            <div
              className="w-full h-20 rounded-lg shadow-md border"
              style={{ backgroundColor: color.toHexString() }}
            />
            <p className="text-xs text-center font-mono">{color.toHexString()}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <ToolLayout
      title="Color Palette Generator"
      description="Generate color palettes from a base color"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <Label>Base Color</Label>
          <div className="flex gap-4">
            <div
              className="w-20 h-20 rounded-lg shadow-md border"
              style={{ backgroundColor: baseColor.toHexString() }}
            />
            <div className="flex-1">
              <Input
                value={baseColor.toHexString()}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <ColorRow colors={generatePalette("analogous")} title="Analogous" />
          <ColorRow colors={generatePalette("monochromatic")} title="Monochromatic" />
          <ColorRow colors={generatePalette("splitcomplement")} title="Split Complementary" />
          <ColorRow colors={generatePalette("triad")} title="Triadic" />
          <ColorRow colors={generatePalette("tetrad")} title="Tetradic" />
        </div>
      </div>
    </ToolLayout>
  );
}
