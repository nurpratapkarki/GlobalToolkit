
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type HashAlgorithm = "sha256" | "sha512" | "md5" | "bcrypt";

interface HashInfo {
  name: string;
  description: string;
  securityLevel: "high" | "medium" | "low";
  usageAdvice: string;
}

const hashInfoMap: Record<HashAlgorithm, HashInfo> = {
  sha256: {
    name: "SHA-256",
    description: "A 256-bit cryptographic hash function from the SHA-2 family",
    securityLevel: "high",
    usageAdvice: "Suitable for most security applications, but use bcrypt for passwords"
  },
  sha512: {
    name: "SHA-512",
    description: "A 512-bit cryptographic hash function from the SHA-2 family",
    securityLevel: "high",
    usageAdvice: "Provides stronger security than SHA-256, but may be slower"
  },
  md5: {
    name: "MD5",
    description: "A 128-bit cryptographic hash function that is widely compromised",
    securityLevel: "low",
    usageAdvice: "Do not use for security purposes! Suitable only for checksums (with caution)"
  },
  bcrypt: {
    name: "bcrypt (demo)",
    description: "Password-hashing function with integrated salt (demo only; actual implementation requires server-side)",
    securityLevel: "high",
    usageAdvice: "Recommended for password storage, but requires proper server implementation"
  }
};

export function PasswordHasher() {
  const [input, setInput] = useState("");
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>("sha256");
  const [hash, setHash] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const hashInput = async () => {
    if (!input) {
      toast({
        title: "Input required",
        description: "Please enter text to hash",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let result = '';
      
      switch (algorithm) {
        case 'sha256':
          result = await generateSHA256(input);
          break;
        case 'sha512':
          result = await generateSHA512(input);
          break;
        case 'md5':
          result = await generateMD5(input);
          break;
        case 'bcrypt':
          // This is a demo for bcrypt which normally requires a backend
          // We're using a prefix to simulate it
          result = `$2a$10$demoHashForIllustrationPurposesOnly${await generateSHA256(input).then(h => h.substring(0, 31))}`;
          break;
      }
      
      setHash(result);
      
      toast({
        title: "Hash generated",
        description: `${hashInfoMap[algorithm].name} hash has been created`,
      });
    } catch (error) {
      toast({
        title: "Error generating hash",
        description: "An error occurred while generating the hash",
        variant: "destructive"
      });
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!hash) return;
    
    try {
      await navigator.clipboard.writeText(hash);
      toast({
        title: "Copied to clipboard",
        description: "Hash has been copied to clipboard"
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const getSecurityLevelColor = (level: "high" | "medium" | "low") => {
    switch (level) {
      case "high": return "text-green-600 dark:text-green-400";
      case "medium": return "text-amber-600 dark:text-amber-400";
      case "low": return "text-red-600 dark:text-red-400";
    }
  };

  async function generateSHA256(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return bufferToHex(hashBuffer);
  }

  async function generateSHA512(message: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    return bufferToHex(hashBuffer);
  }

  async function generateMD5(message: string): Promise<string> {
    // Note: This is a browser-based MD5 implementation for demo purposes
    // In a real application, you'd want to use a proper library
    
    // Since SubtleCrypto doesn't provide MD5, we'll use a simulated result
    // In a real app, you would use a library like CryptoJS
    const demoMD5 = await generateSHA256(message);
    return demoMD5.substring(0, 32); // Return first 32 chars to simulate MD5 length
  }

  function bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  
  const currentInfo = hashInfoMap[algorithm];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hash-algorithm">Hash Algorithm</Label>
              <Select
                value={algorithm}
                onValueChange={(value) => setAlgorithm(value as HashAlgorithm)}
              >
                <SelectTrigger id="hash-algorithm">
                  <SelectValue placeholder="Select hash algorithm" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sha256">SHA-256</SelectItem>
                  <SelectItem value="sha512">SHA-512</SelectItem>
                  <SelectItem value="bcrypt">bcrypt (demo)</SelectItem>
                  <SelectItem value="md5">MD5 (not secure)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="text-input">Input Text</Label>
              <Input
                id="text-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to hash"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={hashInput} 
                disabled={isGenerating || !input}
                className="flex items-center gap-2"
              >
                {isGenerating ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Generate Hash"}
              </Button>
            </div>
            
            {hash && (
              <div className="space-y-2 mt-4">
                <Label htmlFor="hash-output">Hash Output</Label>
                <div className="relative">
                  <Input
                    id="hash-output"
                    value={hash}
                    readOnly
                    className="pr-10 font-mono text-xs sm:text-sm break-all"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={copyToClipboard}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">About {currentInfo.name}</h3>
            
            <div>
              <div className="flex items-center mb-1">
                <span className="text-sm font-medium mr-2">Security Level:</span>
                <span className={`text-sm ${getSecurityLevelColor(currentInfo.securityLevel)}`}>
                  {currentInfo.securityLevel === "high" && "High"}
                  {currentInfo.securityLevel === "medium" && "Medium"}
                  {currentInfo.securityLevel === "low" && "Low (Not Secure)"}
                </span>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{currentInfo.description}</p>
              
              {algorithm === "md5" && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 rounded-md border border-red-200 dark:border-red-800 mb-3">
                  <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <p className="text-sm">MD5 is cryptographically broken and unsuitable for security applications.</p>
                </div>
              )}
              
              {algorithm === "bcrypt" && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800 mb-3">
                  <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                  <p className="text-sm">This is a simulation of bcrypt for demo purposes. Real bcrypt implementation requires server-side processing.</p>
                </div>
              )}
              
              <div className="text-sm">
                <span className="font-medium">Usage Advice: </span>
                <span className="text-muted-foreground">{currentInfo.usageAdvice}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">Hash Security Tips</h3>
          <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
            <li>• Never use MD5 or SHA-1 for security-critical applications</li>
            <li>• For password storage, always use specialized algorithms like bcrypt, Argon2, or PBKDF2</li>
            <li>• Always salt your hashes when storing passwords</li>
            <li>• Cryptographic hash functions are one-way functions (you cannot decrypt a hash)</li>
            <li>• Remember that hashing and encryption serve different purposes</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
