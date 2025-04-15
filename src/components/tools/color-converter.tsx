
import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, Pipette, PaintBucket, RefreshCw } from "lucide-react";
import tinycolor from "tinycolor2";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";

export function ColorConverter() {
  const [color, setColor] = useState(tinycolor("#6366f1"));
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
    const newColor = tinycolor({ 
      h: parseInt(h) || 0, 
      s: parseInt(s) / 100 || 0, 
      l: parseInt(l) / 100 || 0 
    });
    if (newColor.isValid()) setColor(newColor);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${text} copied to clipboard`,
    });
  };

  const generateRandomColor = () => {
    const randomColor = tinycolor.random();
    setColor(randomColor);
    toast({
      title: "Random Color",
      description: `Generated color: ${randomColor.toHexString()}`,
    });
  };

  const rgb = color.toRgb();
  const hsl = color.toHsl();
  const complementary = tinycolor(color).complement();
  
  // Generate color variations
  const variations = {
    lighten: Array.from({length: 5}, (_, i) => tinycolor(color).lighten((i + 1) * 5)),
    darken: Array.from({length: 5}, (_, i) => tinycolor(color).darken((i + 1) * 5)),
    saturate: Array.from({length: 5}, (_, i) => tinycolor(color).saturate((i + 1) * 10)),
    desaturate: Array.from({length: 5}, (_, i) => tinycolor(color).desaturate((i + 1) * 10)),
  };

  return (
    <ToolLayout
      title="Color Converter"
      description="Convert between color formats (HEX, RGB, HSL) and explore variations"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="picker" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="picker">Color Picker</TabsTrigger>
            <TabsTrigger value="variations">Color Variations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="picker" className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Card className="overflow-hidden">
                  <div 
                    className="w-full h-40 rounded-t-lg transition-colors duration-200"
                    style={{ 
                      background: `linear-gradient(135deg, ${color.toHexString()} 0%, ${tinycolor(color).lighten(10).toHexString()} 100%)` 
                    }}
                  />
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">Selected Color</h3>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => copyToClipboard(color.toHexString())}
                      >
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Copy HEX
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                      <span>HEX: {color.toHexString()}</span>
                      <span>RGB: {`${rgb.r}, ${rgb.g}, ${rgb.b}`}</span>
                      <span>HSL: {`${Math.round(hsl.h)}°, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%`}</span>
                      <span>Name: {tinycolor(color).toName() || 'Custom'}</span>
                    </div>
                  </div>
                </Card>
                
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <Label className="mb-2 block">Complementary</Label>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-md border"
                        style={{ backgroundColor: complementary.toHexString() }}
                      />
                      <div>
                        <div className="font-mono text-sm">{complementary.toHexString()}</div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 mt-1"
                          onClick={() => setColor(complementary)}
                        >
                          Use this color
                        </Button>
                      </div>
                    </div>
                  </Card>
                  
                  <Card className="p-4">
                    <Label className="mb-2 block">Contrast Check</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: color.toHexString() }}>
                        <span className="font-medium" style={{ color: '#ffffff' }}>White Text</span>
                        <span className="text-xs">{tinycolor.readability(color, '#ffffff').toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: color.toHexString() }}>
                        <span className="font-medium" style={{ color: '#000000' }}>Black Text</span>
                        <span className="text-xs">{tinycolor.readability(color, '#000000').toFixed(1)}</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
              
              <div className="space-y-6">
                <Card className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label>HEX</Label>
                    <div className="flex gap-2">
                      <Input
                        value={color.toHexString()}
                        onChange={(e) => handleHexChange(e.target.value)}
                        placeholder="#000000"
                        className="font-mono"
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
                        className="font-mono"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="255"
                        value={rgb.g}
                        onChange={(e) => handleRgbChange(rgb.r.toString(), e.target.value, rgb.b.toString())}
                        placeholder="G"
                        className="font-mono"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="255"
                        value={rgb.b}
                        onChange={(e) => handleRgbChange(rgb.r.toString(), rgb.g.toString(), e.target.value)}
                        placeholder="B"
                        className="font-mono"
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
                        onChange={(e) => handleHslChange(e.target.value, (Math.round(hsl.s * 100)).toString(), (Math.round(hsl.l * 100)).toString())}
                        placeholder="H"
                        className="font-mono"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(hsl.s * 100)}
                        onChange={(e) => handleHslChange(Math.round(hsl.h).toString(), e.target.value, (Math.round(hsl.l * 100)).toString())}
                        placeholder="S"
                        className="font-mono"
                      />
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={Math.round(hsl.l * 100)}
                        onChange={(e) => handleHslChange(Math.round(hsl.h).toString(), (Math.round(hsl.s * 100)).toString(), e.target.value)}
                        placeholder="L"
                        className="font-mono"
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

                  <div className="pt-4 space-y-2">
                    <Label className="block">Color Picker</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="color" 
                        value={color.toHexString()} 
                        onChange={(e) => handleHexChange(e.target.value)}
                        className="w-full h-12 cursor-pointer"
                      />
                      <Button
                        variant="outline"
                        onClick={generateRandomColor}
                        title="Generate random color"
                        className="flex-shrink-0"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Random
                      </Button>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-4 space-y-4">
                  <Label className="block">Color Samples</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {['#FFFFFF', '#F2F2F2', '#CCCCCC', '#666666', '#333333', '#000000'].map((sampleColor) => (
                      <div 
                        key={sampleColor}
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => handleHexChange(sampleColor)}
                      >
                        <div
                          className="w-full aspect-square rounded-md border shadow-sm transition-transform hover:scale-105"
                          style={{ backgroundColor: sampleColor }}
                        />
                        <span className="text-xs font-mono mt-1">{sampleColor}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="variations" className="space-y-6">
            {Object.entries(variations).map(([type, colors]) => (
              <Card key={type} className="p-4 space-y-3">
                <Label className="capitalize">{type}</Label>
                <div className="grid grid-cols-5 gap-2">
                  {colors.map((c, i) => (
                    <div 
                      key={i}
                      className="flex flex-col items-center"
                    >
                      <button
                        className="w-full aspect-square rounded-md border shadow-sm transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                        style={{ backgroundColor: c.toHexString() }}
                        onClick={() => setColor(c)}
                        title="Use this color"
                      />
                      <span className="text-xs font-mono mt-1">{c.toHexString()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}
