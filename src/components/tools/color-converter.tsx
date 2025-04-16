import { useState, useEffect } from "react";
import { ToolLayout } from "@/components/tool-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Check, Palette, Droplet, SlidersHorizontal, Grid3X3 } from "lucide-react";
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

  // Derived values
  const hex = colorObj.toHexString();
  const rgb = colorObj.toRgb();
  const hsl = colorObj.toHsl();
  const formattedRgb = colorUtils.formatRgb(rgb);
  const formattedHsl = colorUtils.formatHsl(hsl);

  // Update draft values when color changes
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

  // Common handlers
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

  // Color schemes and variations
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
  
  // Generate shades and tints
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

  // Generate accessibility info
  const getBrightness = tinycolor(hex).getBrightness();
  const isDark = tinycolor(hex).isDark();
  const contrastWithWhite = tinycolor.readability(hex, "#ffffff").toFixed(2);
  const contrastWithBlack = tinycolor.readability(hex, "#000000").toFixed(2);
  const isAccessibleOnWhite = tinycolor.isReadable(hex, "#ffffff");
  const isAccessibleOnBlack = tinycolor.isReadable(hex, "#000000");

  return (
    <ToolLayout title="Color Converter" description="Convert between color formats and generate color schemes">
      <div className="max-w-4xl mx-auto space-y-8">
        <Tabs defaultValue="picker" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="picker"><Palette className="mr-2 h-4 w-4" /> Color Picker</TabsTrigger>
            <TabsTrigger value="schemes"><Grid3X3 className="mr-2 h-4 w-4" /> Color Schemes</TabsTrigger>
            <TabsTrigger value="variations"><Droplet className="mr-2 h-4 w-4" /> Variations</TabsTrigger>
            <TabsTrigger value="accessibility"><SlidersHorizontal className="mr-2 h-4 w-4" /> Accessibility</TabsTrigger>
          </TabsList>

          <TabsContent value="picker">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Color Preview */}
              <Card>
                <CardHeader>
                  <CardTitle>Preview</CardTitle>
                </CardHeader>
                <div style={{ backgroundColor: colorObj.toRgbString() }} className="h-40" />
                <CardContent className="p-4 space-y-2 grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => copyToClipboard(hex, 'hex')} 
                    variant="outline" 
                    className="w-full"
                  >
                    {copied === 'hex' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} 
                    Copy HEX
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(formattedRgb, 'rgb')} 
                    variant="outline" 
                    className="w-full"
                  >
                    {copied === 'rgb' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} 
                    Copy RGB
                  </Button>
                  <Button 
                    onClick={() => copyToClipboard(formattedHsl, 'hsl')} 
                    variant="outline" 
                    className="w-full"
                  >
                    {copied === 'hsl' ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />} 
                    Copy HSL
                  </Button>
                  <Button 
                    onClick={generateRandomColor} 
                    variant="outline" 
                    className="w-full"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" /> Random
                  </Button>
                </CardContent>
              </Card>

              {/* Input Controls */}
              <Card className="p-4 space-y-4">
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
                  <Input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={draft.alpha}
                    onChange={(e) => handleAlphaChange(e.target.value)}
                    onFocus={() => setEditing('alpha')}
                    onBlur={() => setEditing(null)}
                  />
                </div>

                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={hex}
                    onChange={(e) => setColorObj(tinycolor(e.target.value).setAlpha(draft.alpha))}
                    className="h-12"
                  />
                  <div className="grid grid-cols-4 gap-2 w-full">
                    {["#f44336", "#2196f3", "#4caf50", "#ffeb3b"].map((color) => (
                      <Button
                        key={color}
                        style={{ backgroundColor: color }}
                        className="w-full h-12"
                        onClick={() => setColorObj(tinycolor(color).setAlpha(draft.alpha))}
                      />
                    ))}
                  </div>
                </div>
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
                          className="w-16 h-16 rounded cursor-pointer"
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
                          className="w-16 h-16 rounded cursor-pointer"
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
                          className="w-16 h-16 rounded cursor-pointer"
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
                          className="w-16 h-16 rounded cursor-pointer"
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
                          className="w-16 h-16 rounded cursor-pointer"
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
                      className="p-4 rounded"
                    >
                      <h4 className="font-bold mb-2">On White Background</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                    
                    <div 
                      style={{ backgroundColor: 'black', color: colorObj.toRgbString() }} 
                      className="p-4 rounded"
                    >
                      <h4 className="font-bold mb-2">On Black Background</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                    
                    <div 
                      style={{ backgroundColor: colorObj.toRgbString(), color: 'white' }} 
                      className="p-4 rounded"
                    >
                      <h4 className="font-bold mb-2">White Text on This Color</h4>
                      <p>This is normal text</p>
                      <p className="text-sm">This is smaller text</p>
                    </div>
                    
                    <div 
                      style={{ backgroundColor: colorObj.toRgbString(), color: 'black' }} 
                      className="p-4 rounded"
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