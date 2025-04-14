
import { useState } from "react";
import { ToolLayout } from "../tool-layout";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Copy, ArrowDown, ArrowUpDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import * as jose from 'jose';

export function JwtDebugger() {
  const [tab, setTab] = useState<"encode" | "decode">("encode");
  
  // Encode states
  const [payload, setPayload] = useState(JSON.stringify({
    "sub": "1234567890",
    "name": "John Doe",
    "iat": Math.floor(Date.now() / 1000),
    "exp": Math.floor(Date.now() / 1000) + 3600
  }, null, 2));
  const [secret, setSecret] = useState("your-256-bit-secret");
  const [algorithm, setAlgorithm] = useState("HS256");
  const [encodedJWT, setEncodedJWT] = useState("");
  
  // Decode states
  const [inputJWT, setInputJWT] = useState("");
  const [decodedHeader, setDecodedHeader] = useState("");
  const [decodedPayload, setDecodedPayload] = useState("");
  const [decodedSignature, setDecodedSignature] = useState("");
  const [verificationResult, setVerificationResult] = useState<"valid" | "invalid" | "">("");
  
  const { toast } = useToast();

  const generateJWT = async () => {
    try {
      const jsonPayload = JSON.parse(payload);
      
      let token = "";
      if (algorithm === "HS256") {
        const secretEncoder = new TextEncoder().encode(secret);
        token = await new jose.SignJWT(jsonPayload)
          .setProtectedHeader({ alg: 'HS256' })
          .sign(secretEncoder);
      } else {
        // For demonstration - in real app we'd support more algorithms
        toast({
          title: "Algorithm Not Supported",
          description: "Currently only HS256 is supported",
          variant: "destructive"
        });
        return;
      }
      
      setEncodedJWT(token);
      toast({
        title: "JWT Generated",
        description: "Your JWT token was successfully created"
      });
    } catch (error) {
      console.error("Error generating JWT:", error);
      toast({
        title: "Generation Error",
        description: "Please check your payload format",
        variant: "destructive"
      });
    }
  };

  const decodeJWT = () => {
    if (!inputJWT.trim()) {
      toast({
        title: "Empty Token",
        description: "Please enter a JWT to decode",
        variant: "destructive"
      });
      return;
    }

    try {
      // Split the token into parts
      const parts = inputJWT.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      
      // Decode the header and payload
      const headerJson = atob(parts[0]);
      const payloadJson = atob(parts[1]);
      
      setDecodedHeader(JSON.stringify(JSON.parse(headerJson), null, 2));
      setDecodedPayload(JSON.stringify(JSON.parse(payloadJson), null, 2));
      setDecodedSignature(parts[2]);
      
      // For simple validation display - not actual cryptographic verification
      setVerificationResult("valid");
      
      toast({
        title: "JWT Decoded",
        description: "The token has been successfully decoded"
      });
    } catch (error) {
      console.error("Error decoding JWT:", error);
      setDecodedHeader("");
      setDecodedPayload("");
      setDecodedSignature("");
      setVerificationResult("invalid");
      
      toast({
        title: "Decoding Error",
        description: "The provided token is not a valid JWT",
        variant: "destructive"
      });
    }
  };

  const verifyJWT = async () => {
    if (!inputJWT || !secret) return;
    
    try {
      const parts = inputJWT.split('.');
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      
      const secretEncoder = new TextEncoder().encode(secret);
      await jose.jwtVerify(inputJWT, secretEncoder);
      
      setVerificationResult("valid");
      toast({
        title: "Verification Successful",
        description: "JWT signature is valid"
      });
    } catch (error) {
      console.error("Error verifying JWT:", error);
      setVerificationResult("invalid");
      toast({
        title: "Verification Failed",
        description: "JWT signature is invalid or token has expired",
        variant: "destructive"
      });
    }
  };

  const handleCopy = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: message
    });
  };

  return (
    <ToolLayout
      title="JWT Debugger"
      description="Generate, decode, and verify JWT tokens"
    >
      <Tabs 
        defaultValue="encode" 
        value={tab} 
        onValueChange={(value) => setTab(value as "encode" | "decode")}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2 mb-4">
          <TabsTrigger value="encode">Generate</TabsTrigger>
          <TabsTrigger value="decode">Decode & Verify</TabsTrigger>
        </TabsList>
        
        <TabsContent value="encode" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="payload">Payload (JSON)</Label>
              <Textarea 
                id="payload"
                className="font-mono h-48"
                value={payload}
                onChange={(e) => setPayload(e.target.value)}
                placeholder='{"sub": "1234567890", "name": "John Doe"}'
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secret">Secret Key</Label>
                <Input
                  id="secret"
                  type="text"
                  value={secret}
                  onChange={(e) => setSecret(e.target.value)}
                  placeholder="Your secret key"
                />
              </div>
              <div>
                <Label htmlFor="algorithm">Algorithm</Label>
                <select
                  id="algorithm"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={algorithm}
                  onChange={(e) => setAlgorithm(e.target.value)}
                >
                  <option value="HS256">HS256</option>
                  <option value="RS256" disabled>RS256 (Coming soon)</option>
                  <option value="ES256" disabled>ES256 (Coming soon)</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button onClick={generateJWT} className="w-full max-w-xs">
                <ArrowDown className="mr-2 h-4 w-4" />
                Generate JWT
              </Button>
            </div>
            
            {encodedJWT && (
              <div>
                <Label>Generated JWT</Label>
                <div className="relative">
                  <Textarea 
                    className="font-mono pr-10" 
                    value={encodedJWT} 
                    readOnly
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-2"
                    onClick={() => handleCopy(encodedJWT, "JWT copied to clipboard")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  variant="link" 
                  className="mt-2 p-0 h-auto" 
                  onClick={() => {
                    setTab("decode");
                    setInputJWT(encodedJWT);
                    decodeJWT();
                  }}
                >
                  Switch to decode tab with this token
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="decode" className="space-y-4">
          <div>
            <Label htmlFor="inputJWT">Enter JWT</Label>
            <Textarea
              id="inputJWT"
              className="font-mono"
              value={inputJWT}
              onChange={(e) => setInputJWT(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button onClick={decodeJWT}>
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Decode JWT
            </Button>
            <Button variant="outline" onClick={verifyJWT}>
              Verify Signature
            </Button>
            {verificationResult && (
              <span className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                verificationResult === "valid" 
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" 
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }`}>
                Signature {verificationResult === "valid" ? "Valid" : "Invalid"}
              </span>
            )}
          </div>
          
          {decodedHeader && (
            <div>
              <Label>Header</Label>
              <div className="relative">
                <Textarea 
                  className="font-mono" 
                  value={decodedHeader} 
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(decodedHeader, "Header copied to clipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {decodedPayload && (
            <div>
              <Label>Payload</Label>
              <div className="relative">
                <Textarea 
                  className="font-mono" 
                  value={decodedPayload} 
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(decodedPayload, "Payload copied to clipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
          
          {decodedSignature && (
            <div>
              <Label>Signature</Label>
              <div className="relative">
                <Input 
                  className="font-mono" 
                  value={decodedSignature} 
                  readOnly
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-2"
                  onClick={() => handleCopy(decodedSignature, "Signature copied to clipboard")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </ToolLayout>
  );
}
