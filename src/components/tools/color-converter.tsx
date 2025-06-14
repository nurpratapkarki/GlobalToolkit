import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check, Palette, Droplet, SlidersHorizontal, Grid3X3, PaintBucket, Pipette } from "lucide-react";
import tinycolor from "tinycolor2";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const colorUtils = {
  isValidHex: (hex) => /^#?([0-9A-Fa-f]{3}){1,2}$/i.test(hex),
  formatHex: (hex) => hex.startsWith('#') ? hex : `#${hex}`,
  formatRgb: (rgb) => `rgb(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)})`,
  formatRgba: (rgb) => `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${rgb.a || 1})`,
  formatHsl: (hsl) => `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s*100)}%, ${Math.round(hsl.l*100)}%)`,
  formatHsla: (hsl) => `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s*100)}%, ${Math.round(hsl.l*100)}%, ${hsl.a || 1})`,
};

export function ColorConverter() {
  const { toast } = useToast();
  const [colorObj, setColorObj] = useState(tinycolor("#6366f1"));
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({ 
    hex: '', 
    rgb: { r: 0, g: 0, b: 0 }, 
    hsl: { h: 0, s: 0, l: 0 },
    alpha: 1
  });
  const [copied, setCopied] = useState('');
  const [activeTab, setActiveTab] = useState('picker');
  const [selectedScheme, setSelectedScheme] = useState('analogous');

  const hex = colorObj.toHexString();
  const rgb = colorObj.toRgb();
  const hsl = colorObj.toHsl();
  const formattedRgb = colorUtils.formatRgb(rgb);
  const formattedHsl = colorUtils.formatHsl(hsl);

  useEffect(() => {
    if (editing !== 'hex') setDraft(v => ({ ...v, hex }));
    if (editing !== 'rgb') setDraft(v => ({
      ...v,
      rgb: { r: rgb.r, g: rgb.g, b: rgb.b }
    }));
    if (editing !== 'hsl') setDraft(v => ({
      ...v,
      hsl: { h: hsl.h, s: hsl.s*100, l: hsl.l*100 }
    }));
    if (editing !== 'alpha') setDraft(v => ({ ...v, alpha: rgb.a }));
  }, [colorObj, editing]);

  const handleHexChange = (value) => {
    const formatted = colorUtils.formatHex(value);
    setDraft(v => ({ ...v, hex: formatted }));
    if (colorUtils.isValidHex(formatted)) {
      const newColor = tinycolor(formatted);
      if (newColor.isValid()) {
        newColor.setAlpha(draft.alpha);
        setColorObj(newColor);
      }
    }
  };

  const handleRgbChange = (field, value) => {
    const newVal = Math.min(255, Math.max(0, parseInt(value) || 0));
    const newRgb = { ...draft.rgb, [field]: newVal };
    setDraft(v => ({ ...v, rgb: newRgb }));
    const newColor = tinycolor({
      r: newRgb.r || 0,
      g: newRgb.g || 0,
      b: newRgb.b || 0,
      a: draft.alpha
    });
    if (newColor.isValid()) setColorObj(newColor);
  };

  const handleHslChange = (field, value) => {
    const newVal = field === 'h' 
      ? Math.min(360, Math.max(0, parseInt(value) || 0))
      : Math.min(100, Math.max(0, parseInt(value) || 0));
    const newHsl = { ...draft.hsl, [field]: newVal };
    setDraft(v => ({ ...v, hsl: newHsl }));
    const newColor = tinycolor({
      h: newHsl.h,
      s: newHsl.s/100,
      l: newHsl.l/100,
      a: draft.alpha
    });
    if (newColor.isValid()) setColorObj(newColor);
  };

  const handleAlphaChange = (value) => {
    const newAlpha = Math.min(1, Math.max(0, parseFloat(value) || 0));
    setDraft(v => ({ ...v, alpha: newAlpha }));
    const newColor = tinycolor(colorObj);
    newColor.setAlpha(newAlpha);
    setColorObj(newColor);
  };

  const handleColorPickerChange = (e) => {
    const newColor = tinycolor(e.target.value);
    if (newColor.isValid()) {
      newColor.setAlpha(draft.alpha);
      setColorObj(newColor);
      toast({
        title: "Color Updated",
        description: `Color changed to ${newColor.toHexString()}`,
      });
    }
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
    toast({ title: "Copied!", description: `${text} copied to clipboard` });
  };

  const generateRandomColor = () => {
    const newColor = tinycolor.random();
    newColor.setAlpha(draft.alpha);
    setColorObj(newColor);
    toast({ title: "Random Color", description: `Generated: ${newColor.toHexString()}` });
  };

  const generateColorScheme = () => {
    switch (selectedScheme) {
      case 'analogous':
        return tinycolor(hex).analogous(6);
      case 'monochromatic':
        return tinycolor(hex).monochromatic(6);
      case 'splitcomplement':
        return tinycolor(hex).splitcomplement();
      case 'triad':
        return tinycolor(hex).triad();
      case 'tetrad':
        return tinycolor(hex).tetrad();
      case 'complement':
        return [tinycolor(hex), tinycolor(hex).complement()];
      default:
        return tinycolor(hex).analogous(6);
    }
  };

  const colorScheme = generateColorScheme();
  
  const generateVariations = () => {
    const darken = [];
    const lighten = [];
    const desaturate = [];
    const saturate = [];
    
    for (let i = 1; i <= 5; i++) {
      darken.push(tinycolor(hex).darken(i * 10));
      lighten.push(tinycolor(hex).lighten(i * 10));
      desaturate.push(tinycolor(hex).desaturate(i * 10));
      saturate.push(tinycolor(hex).saturate(i * 10));
    }
    
    return { darken, lighten, desaturate, saturate };
  };
  
  const variations = generateVariations();

  const getBrightness = tinycolor(hex).getBrightness();
  const isDark = tinycolor(hex).isDark();
  const contrastWithWhite = tinycolor.readability(hex, "#ffffff").toFixed(2);
  const contrastWithBlack = tinycolor.readability(hex, "#000000").toFixed(2);
  const isAccessibleOnWhite = tinycolor.isReadable(hex, "#ffffff");
  const isAccessibleOnBlack = tinycolor.isReadable(hex, "#000000");

  return (
    <ToolLayout 
      title="Color Converter" 
      description="Convert, explore, and analyze colors with ease"
      actionButtons={
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-2"
            onClick={generateRandomColor}
          >
            <RefreshCw className="h-4 w-4" />
            Random Color
          </Button>
        </div>
      }
    >
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <Tabs defaultValue="picker" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4 bg-secondary/50">
            <TabsTrigger value="picker" className="flex items-center gap-2">
              <Pipette className="h-4 w-4" /> Color Picker
            </TabsTrigger>
            <TabsTrigger value="schemes" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" /> Color Schemes
            </TabsTrigger>
            <TabsTrigger value="variations" className="flex items-center gap-2">
              <Droplet className="h-4 w-4" /> Variations
            </TabsTrigger>
            <TabsTrigger value="accessibility" className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4" /> Accessibility
            </TabsTrigger>
          </TabsList>

          <TabsContent value="picker">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="shadow-lg border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-primary" /> Color Preview
                  </CardTitle>
                </CardHeader>
                <div 
                  style={{ 
                    backgroundColor: colorObj.toRgbString(),
                    boxShadow: `0 10px 25px -5px ${colorObj.setAlpha(0.3).toRgbString()}`
                  }} 
                  className="h-48 w-full rounded-b-lg transition-all duration-300 ease-in-out hover:scale-[1.01]" 
                />
                <CardContent className="p-4 grid grid-cols-2 gap-2">
                  {[
                    { label: 'HEX', value: hex, key: 'hex' },
                    { label: 'RGB', value: formattedRgb, key: 'rgb' },
                    { label: 'HSL', value: formattedHsl, key: 'hsl' }
                  ].map((format) => (
                    <Button 
                      key={format.key}
                      onClick={() => copyToClipboard(format.value, format.key)} 
                      variant="outline" 
                      className="w-full flex justify-between"
                    >
                      {format.label}
                      {copied === format.key ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-lg border-none">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PaintBucket className="h-5 w-5 text-primary" /> Color Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>HEX</Label>
                    <Input
                      value={draft.hex}
                      onChange={(e) => handleHexChange(e.target.value)}
                      onFocus={() => setEditing('hex')}
                      onBlur={() => setEditing(null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>RGB</Label>
                    <div className="flex gap-2">
                      {['r', 'g', 'b'].map((c) => (
                        <div key={c} className="w-full">
                          <Label className="text-xs">{c.toUpperCase()}</Label>
                          <Input
                            value={Math.round(draft.rgb[c] || 0)}
                            onChange={(e) => handleRgbChange(c, e.target.value)}
                            onFocus={() => setEditing('rgb')}
                            onBlur={() => setEditing(null)}
                            type="number"
                            min="0"
                            max="255"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>HSL</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'h', label: 'Hue', max: 360 },
                        { key: 's', label: 'Saturation', max: 100 },
                        { key: 'l', label: 'Lightness', max: 100 }
                      ].map((item) => (
                        <div key={item.key} className="w-full">
                          <Label className="text-xs">{item.label}</Label>
                          <Input
                            value={Math.round(draft.hsl[item.key] || 0)}
                            onChange={(e) => handleHslChange(item.key, e.target.value)}
                            onFocus={() => setEditing('hsl')}
                            onBlur={() => setEditing(null)}
                            type="number"
                            min="0"
                            max={item.max}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex justify-between">
                      <span>Alpha: {draft.alpha.toFixed(2)}</span>
                      <span>{Math.round(draft.alpha * 100)}%</span>
                    </Label>
                    <Slider
                      value={[draft.alpha]}
                      onValueChange={(value) => handleAlphaChange(value[0])}
                      onFocus={() => setEditing('alpha')}
                      onBlur={() => setEditing(null)}
                      min={0}
                      max={1}
                      step={0.01}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="relative">
                      <input
                        type="color"
                        value={hex}
                        onChange={handleColorPickerChange}
                        className="h-12 w-16 rounded border border-input cursor-pointer"
                        title="Pick a color"
                      />
                      <Pipette className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-4 w-4 text-white pointer-events-none" />
                    </div>
                    <div className="grid grid-cols-4 gap-2 flex-1">
                      {["#f44336", "#2196f3", "#4caf50", "#ffeb3b"].map((color) => (
                        <Button
                          key={color}
                          style={{ backgroundColor: color }}
                          className="w-full h-12 border border-input"
                          onClick={() => {
                            const newColor = tinycolor(color);
                            newColor.setAlpha(draft.alpha);
                            setColorObj(newColor);
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="schemes">
            <Card>
              <CardHeader>
                <CardTitle>Color Schemes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {['analogous', 'monochromatic', 'splitcomplement', 'triad', 'tetrad', 'complement'].map((scheme) => (
                    <Button 
                      key={scheme}
                      variant={selectedScheme === scheme ? "default" : "outline"}
                      onClick={() => setSelectedScheme(scheme)}
                      className="capitalize"
                    >
                      {scheme}
                    </Button>
                  ))}
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex flex-wrap gap-2">
                    {colorScheme.map((color, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div 
                          style={{ backgroundColor: color.toHexString() }} 
                          className="w-16 h-16 rounded cursor-pointer border border-input"
                          onClick={() => setColorObj(color)}
                        />
                        <div className="text-center mt-1 text-xs font-mono">
                          {color.toHexString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => copyToClipboard(color.toHexString(), `scheme-${index}`)}
                        >
                          {copied === `scheme-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="variations">
            <Card>
              <CardHeader>
                <CardTitle>Color Variations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Shades (Darker)</h3>
                  <div className="flex flex-wrap gap-2">
                    {variations.darken.map((color, index) => (
                      <div key={`darken-${index}`} className="flex flex-col items-center">
                        <div 
                          style={{ backgroundColor: color.toHexString() }} 
                          className="w-16 h-16 rounded cursor-pointer border border-input"
                          onClick={() => setColorObj(color)}
                        />
                        <div className="text-center mt-1 text-xs font-mono">
                          {color.toHexString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => copyToClipboard(color.toHexString(), `darken-${index}`)}
                        >
                          {copied === `darken-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Tints (Lighter)</h3>
                  <div className="flex flex-wrap gap-2">
                    {variations.lighten.map((color, index) => (
                      <div key={`lighten-${index}`} className="flex flex-col items-center">
                        <div 
                          style={{ backgroundColor: color.toHexString() }} 
                          className="w-16 h-16 rounded cursor-pointer border border-input"
                          onClick={() => setColorObj(color)}
                        />
                        <div className="text-center mt-1 text-xs font-mono">
                          {color.toHexString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => copyToClipboard(color.toHexString(), `lighten-${index}`)}
                        >
                          {copied === `lighten-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Saturated</h3>
                  <div className="flex flex-wrap gap-2">
                    {variations.saturate.map((color, index) => (
                      <div key={`saturate-${index}`} className="flex flex-col items-center">
                        <div 
                          style={{ backgroundColor: color.toHexString() }} 
                          className="w-16 h-16 rounded cursor-pointer border border-input"
                          onClick={() => setColorObj(color)}
                        />
                        <div className="text-center mt-1 text-xs font-mono">
                          {color.toHexString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => copyToClipboard(color.toHexString(), `saturate-${index}`)}
                        >
                          {copied === `saturate-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Desaturated</h3>
                  <div className="flex flex-wrap gap-2">
                    {variations.desaturate.map((color, index) => (
                      <div key={`desaturate-${index}`} className="flex flex-col items-center">
                        <div 
                          style={{ backgroundColor: color.toHexString() }} 
                          className="w-16 h-16 rounded cursor-pointer border border-input"
                          onClick={() => setColorObj(color)}
                        />
                        <div className="text-center mt-1 text-xs font-mono">
                          {color.toHexString()}
                        </div>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="mt-1 h-6 text-xs"
                          onClick={() => copyToClipboard(color.toHexString(), `desaturate-${index}`)}
                        >
                          {copied === `desaturate-${index}` ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accessibility">
            <Card>
              <CardHeader>
                <CardTitle>Accessibility Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Color Properties</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Brightness:</span>
                        <span>{Math.round(getBrightness)}/255</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Perceived as:</span>
                        <span>{isDark ? 'Dark' : 'Light'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Contrast Ratios</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>With White:</span>
                        <span className={isAccessibleOnWhite ? 'text-green-600' : 'text-red-600'}>
                          {contrastWithWhite} {isAccessibleOnWhite ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>With Black:</span>
                        <span className={isAccessibleOnBlack ? 'text-green-600' : 'text-red-600'}>
                          {contrastWithBlack} {isAccessibleOnBlack ? '✓' : '✗'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Text Samples</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div 
                      style={{ backgroundColor: 'white', color: colorObj.toRgbString() }} 
                      className="p-4 rounded border"
                    >
                      <h4 className="font-bold mb-2">On White Background</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                    
                    <div 
                      style={{ backgroundColor: 'black', color: colorObj.toRgbString() }} 
                      className="p-4 rounded border"
                    >
                      <h4 className="font-bold mb-2">On Black Background</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                    
                    <div 
                      style={{ backgroundColor: colorObj.toRgbString(), color: 'white' }} 
                      className="p-4 rounded border"
                    >
                      <h4 className="font-bold mb-2">White Text on This Color</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                    
                    <div 
                      style={{ backgroundColor: colorObj.toRgbString(), color: 'black' }} 
                      className="p-4 rounded border"
                    >
                      <h4 className="font-bold mb-2">Black Text on This Color</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ToolLayout>
  );
}