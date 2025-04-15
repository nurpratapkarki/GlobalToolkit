
import { useState } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import tinycolor from "tinycolor2";
import { useToast } from "@/hooks/use-toast";

export function ColorConverter() {
  const [color, setColor] = useState(tinycolor("#ff0000"));
  const { toast } = useToast();

  const handleHexChange = (hex: string) => {
    const newColor = tinycolor(hex);
    if (newColor.isValid()) setColor(newColor);
  };

  const handleRgbChange = (r: string, g: string, b: string) => {
    const newColor = tinycolor({ r: parseInt(r) || 0, g: parseInt(g) || 0, b: parseInt(b) || 0 });
    if (newColor.isValid()) setColor(newColor);
  };

  const handleHslChange = (h: string, s: string, l: string) => {
    const newColor = tinycolor({ h: parseInt(h) || 0, s: parseInt(s) || 0, l: parseInt(l) || 0 });
    if (newColor.isValid()) setColor(newColor);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${text} copied to clipboard`,
    });
  };

  const rgb = color.toRgb();
  const hsl = color.toHsl();

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between color formats (HEX, RGB, HSL)"
    >
      <div className="max-w-2xl mx-auto space-y-8">
        <div 
          className="w-full h-32 rounded-lg shadow-md border"
          style={{ backgroundColor: color.toHexString() }}
        />

        <div className="grid gap-6">
          <div className="space-y-2">
            <Label>HEX</Label>
            <div className="flex gap-2">
              <Input
                value={color.toHexString()}
                onChange={(e) => handleHexChange(e.target.value)}
                placeholder="#000000"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(color.toHexString())}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>RGB</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="255"
                value={rgb.r}
                onChange={(e) => handleRgbChange(e.target.value, rgb.g.toString(), rgb.b.toString())}
                placeholder="R"
              />
              <Input
                type="number"
                min="0"
                max="255"
                value={rgb.g}
                onChange={(e) => handleRgbChange(rgb.r.toString(), e.target.value, rgb.b.toString())}
                placeholder="G"
              />
              <Input
                type="number"
                min="0"
                max="255"
                value={rgb.b}
                onChange={(e) => handleRgbChange(rgb.r.toString(), rgb.g.toString(), e.target.value)}
                placeholder="B"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>HSL</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="0"
                max="360"
                value={Math.round(hsl.h)}
                onChange={(e) => handleHslChange(e.target.value, (hsl.s * 100).toString(), (hsl.l * 100).toString())}
                placeholder="H"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={Math.round(hsl.s * 100)}
                onChange={(e) => handleHslChange(hsl.h.toString(), e.target.value, (hsl.l * 100).toString())}
                placeholder="S"
              />
              <Input
                type="number"
                min="0"
                max="100"
                value={Math.round(hsl.l * 100)}
                onChange={(e) => handleHslChange(hsl.h.toString(), (hsl.s * 100).toString(), e.target.value)}
                placeholder="L"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(`hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)`)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}
