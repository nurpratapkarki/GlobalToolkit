
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { FileJson, Code2, Hash, FileText, RefreshCw, KeyRound, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolCardProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  path: string;
  className?: string;
};

const ToolCard = ({ title, description, icon: Icon, path, className }: ToolCardProps) => (
  <Link to={path}>
    <Card className={cn(
      "transition-all hover:shadow-md hover:border-primary/50 cursor-pointer", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  </Link>
);

const HomePage = () => {
  const tools = [
    {
      title: "JSON Formatter",
      description: "Format and validate JSON data",
      icon: FileJson,
      path: "/json",
      className: "border-blue-200 dark:border-blue-900",
    },
    {
      title: "Regex Tester",
      description: "Build and test regular expressions",
      icon: Code2,
      path: "/regex",
      className: "border-green-200 dark:border-green-900",
    },
    {
      title: "UUID Generator",
      description: "Generate random UUIDs",
      icon: Hash,
      path: "/uuid",
      className: "border-purple-200 dark:border-purple-900",
    },
    {
      title: "Markdown Preview",
      description: "Write and preview Markdown",
      icon: FileText,
      path: "/markdown",
      className: "border-yellow-200 dark:border-yellow-900",
    },
    {
      title: "Base64 Converter",
      description: "Encode and decode Base64",
      icon: RefreshCw,
      path: "/base64",
      className: "border-orange-200 dark:border-orange-900",
    },
    {
      title: "JWT Debugger",
      description: "Decode and verify JWTs",
      icon: KeyRound,
      path: "/jwt",
      className: "border-red-200 dark:border-red-900",
    },
    {
      title: "Unit Converter",
      description: "Convert between different units",
      icon: RefreshCw,
      path: "/converter",
      className: "border-indigo-200 dark:border-indigo-900",
    },
    {
      title: "Settings",
      description: "Configure application settings",
      icon: Settings,
      path: "/settings",
      className: "border-gray-200 dark:border-gray-800",
    },
  ];

  return (
    <div className="container py-6 max-w-7xl animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 font-mono">&lt;/DevToolBox&gt;</h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          A collection of tools for developers to format, convert, and debug code. Select a tool to get started.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.title}
            title={tool.title}
            description={tool.description}
            icon={tool.icon}
            path={tool.path}
            className={tool.className}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePage;
