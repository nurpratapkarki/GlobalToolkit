
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/theme-provider";
import { Layout } from "./components/layout";
import HomePage from "./pages/Index";
import NotFound from "./pages/NotFound";
import { JsonFormatter } from "./components/tools/json-formatter";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="devtoolbox-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/json" element={<JsonFormatter />} />
              <Route path="/regex" element={<div className="p-8">Regex Tool Coming Soon</div>} />
              <Route path="/uuid" element={<div className="p-8">UUID Tool Coming Soon</div>} />
              <Route path="/markdown" element={<div className="p-8">Markdown Tool Coming Soon</div>} />
              <Route path="/base64" element={<div className="p-8">Base64 Tool Coming Soon</div>} />
              <Route path="/jwt" element={<div className="p-8">JWT Tool Coming Soon</div>} />
              <Route path="/converter" element={<div className="p-8">Converter Tool Coming Soon</div>} />
              <Route path="/settings" element={<div className="p-8">Settings Coming Soon</div>} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
