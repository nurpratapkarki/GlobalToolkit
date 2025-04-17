import { useState } from "react";
import { AlertCircle, CheckCircle, Eye, EyeOff, Loader, ShieldAlert, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import * as crypto from 'crypto-js';

export function PasswordBreachChecker() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [breachResult, setBreachResult] = useState<null | { breached: boolean; count?: number }>(null);
  const { toast } = useToast();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateRandomPassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+={}[]|:;<>,.?/~";
    let newPassword = "";
    
    // Generate a random password of length 16
    for (let i = 0; i < 16; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      newPassword += charset[randomIndex];
    }
    
    setPassword(newPassword);
    toast({
      title: "Password Generated",
      description: "A new secure random password has been generated.",
    });
  };

  const checkPasswordBreach = async () => {
    if (!password.trim()) {
      toast({
        title: "Error",
        description: "Please enter a password to check",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setBreachResult(null);

    try {
      // Hash the password with SHA-1 (required by HIBP API)
      const hashedPassword = crypto.SHA1(password).toString().toUpperCase();
      
      // Get the first 5 characters (prefix)
      const prefix = hashedPassword.substring(0, 5);
      
      // The rest of the hash will be used for local comparison
      const suffix = hashedPassword.substring(5);

      // Fetch the breached password hashes with the same prefix
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      
      if (!response.ok) {
        throw new Error("Failed to check password breach status");
      }

      const data = await response.text();
      
      // Parse the response (format is: HASH_SUFFIX:COUNT)
      const breachedHashes = data.split('\r\n').map(line => {
        const [hashSuffix, count] = line.split(':');
        return { suffix: hashSuffix, count: parseInt(count, 10) };
      });

      // Check if our password suffix exists in the breached data
      const match = breachedHashes.find(hash => hash.suffix === suffix);

      if (match) {
        setBreachResult({ breached: true, count: match.count });
        toast({
          title: "Password Compromised",
          description: `This password has been found in ${match.count.toLocaleString()} data breaches.`,
          variant: "destructive",
        });
      } else {
        setBreachResult({ breached: false });
        toast({
          title: "Good News!",
          description: "This password hasn't been found in any known data breaches.",
        });
      }
    } catch (error) {
      console.error("Error checking password breach:", error);
      toast({
        title: "Error",
        description: "Failed to check password breach status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Check Password Security</CardTitle>
          <CardDescription>
            Securely check if your password has appeared in data breaches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter a password to check"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-0 top-0"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={checkPasswordBreach}
                disabled={isLoading || !password.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" /> Checking...
                  </>
                ) : (
                  "Check Password"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={generateRandomPassword}
              >
                Generate Secure Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {breachResult && (
        <Alert variant={breachResult.breached ? "destructive" : "default"} className="animate-fade-in">
          {breachResult.breached ? (
            <>
              <ShieldAlert className="h-5 w-5" />
              <AlertTitle>Password Compromised!</AlertTitle>
              <AlertDescription className="space-y-2">
                <p>This password has been found in {breachResult.count?.toLocaleString()} data breaches.</p>
                <p>You should:</p>
                <ul className="list-disc pl-5">
                  <li>Change this password immediately where used</li>
                  <li>Never reuse passwords across different sites</li>
                  <li>Consider using a password manager</li>
                </ul>
              </AlertDescription>
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              <AlertTitle>Password Not Found in Breaches</AlertTitle>
              <AlertDescription>
                <p>Good news! This password hasn't been found in any known data breaches.</p>
                <p className="mt-2">However, always use unique, strong passwords for each site and consider using a password manager.</p>
              </AlertDescription>
            </>
          )}
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This tool uses the "k-Anonymity" model to check if your password has been exposed in data breaches 
            without sending your actual password across the internet. Only the first 5 characters of a one-way 
            hash of your password are sent to the HaveIBeenPwned API. Your full password never leaves your browser.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
