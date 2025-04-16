import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { SettingsProvider } from "./contexts/settings-context";
import { Layout } from "./components/layout";
import HomePage from "./pages/Index";
import NotFound from "./pages/NotFound";
import { JsonFormatter } from "./components/tools/json-formatter";
import { RegexTester } from "./components/tools/regex-tester";
import { UuidGenerator } from "./components/tools/uuid-generator";
import { Base64Converter } from "./components/tools/base64-converter";
import { MarkdownPreviewer } from "./components/tools/markdown-previewer";
import { JwtDebugger } from "./components/tools/jwt-debugger";
import { Converter } from "./components/tools/converter";
import { ColorConverter } from "./components/tools/color-converter";
import { ColorPalette } from "./components/tools/color-palette";
import { CodeBeautifier } from "./components/tools/code-beautifier";

const App = () => {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="devtoolbox-theme">
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/json" element={<JsonFormatter />} />
                  <Route path="/regex" element={<RegexTester />} />
                  <Route path="/uuid" element={<UuidGenerator />} />
                  <Route path="/markdown" element={<MarkdownPreviewer />} />
                  <Route path="/base64" element={<Base64Converter />} />
                  <Route path="/jwt" element={<JwtDebugger />} />
                  <Route path="/converter" element={<Converter />} />
                  <Route path="/color" element={<ColorConverter />} />
                  <Route path="/palette" element={<ColorPalette />} />
                  <Route path="/beautify" element={<CodeBeautifier />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </SettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
