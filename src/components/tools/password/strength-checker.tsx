
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, Eye, EyeOff, Shuffle, AlertTriangle, ThumbsUp, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StrengthCriteria {
  hasMinLength: boolean;
  hasUpperCase: boolean;
  hasLowerCase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
  hasNoCommonPatterns: boolean;
}

export function PasswordStrengthChecker() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("Enter a password");
  const [strengthLevel, setStrengthLevel] = useState("");
  const [criteria, setCriteria] = useState<StrengthCriteria>({
    hasMinLength: false,
    hasUpperCase: false,
    hasLowerCase: false,
    hasNumber: false,
    hasSymbol: false,
    hasNoCommonPatterns: true,
  });
  
  const { toast } = useToast();

  // Common patterns to avoid in passwords
  const commonPatterns = [
    "123456", "password", "qwerty", "admin", "welcome",
    "123456789", "12345678", "abc123", "password1", "admin123",
    "letmein", "monkey", "1234567", "12345", "111111"
  ];

  useEffect(() => {
    checkPassword(password);
  }, [password]);

  const checkPassword = (pwd: string) => {
    // Check criteria
    const newCriteria = {
      hasMinLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSymbol: /[^A-Za-z0-9]/.test(pwd),
      hasNoCommonPatterns: !commonPatterns.some(pattern => 
        pwd.toLowerCase().includes(pattern.toLowerCase()))
    };
    
    setCriteria(newCriteria);
    
    // Calculate score (0-100)
    let newScore = 0;
    if (pwd) {
      // Base score from length (max 30 points)
      newScore += Math.min(30, pwd.length * 3);
      
      // Add points for complexity (70 points max)
      if (newCriteria.hasUpperCase) newScore += 15;
      if (newCriteria.hasLowerCase) newScore += 10;
      if (newCriteria.hasNumber) newScore += 15;
      if (newCriteria.hasSymbol) newScore += 20;
      if (newCriteria.hasNoCommonPatterns) newScore += 10;
      
      // Penalty for not meeting criteria
      if (!newCriteria.hasMinLength) newScore -= 20;
    }
    
    // Ensure score is between 0 and 100
    newScore = Math.max(0, Math.min(100, newScore));
    setScore(newScore);
    
    // Set strength level
    if (newScore >= 90) {
      setStrengthLevel("Very Strong");
    } else if (newScore >= 70) {
      setStrengthLevel("Strong");
    } else if (newScore >= 40) {
      setStrengthLevel("Medium");
    } else if (newScore > 0) {
      setStrengthLevel("Weak");
    } else {
      setStrengthLevel("");
    }
    
    // Generate feedback
    generateFeedback(pwd, newCriteria, newScore);
  };

  const generateFeedback = (pwd: string, crit: StrengthCriteria, scr: number) => {
    if (!pwd) {
      setFeedback("Enter a password");
      return;
    }
    
    if (pwd.length < 4) {
      setFeedback("Password is too short 💀");
      return;
    }
    
    if (!crit.hasMinLength) {
      setFeedback("Password should be at least 8 characters long");
      return;
    }
    
    if (!crit.hasUpperCase) {
      setFeedback("Add uppercase letters to strengthen your password");
      return;
    }
    
    if (!crit.hasLowerCase) {
      setFeedback("Add lowercase letters for better balance");
      return;
    }
    
    if (!crit.hasNumber) {
      setFeedback("Add numbers to increase complexity");
      return;
    }
    
    if (!crit.hasSymbol) {
      setFeedback("Special symbols would make this stronger");
      return;
    }
    
    if (!crit.hasNoCommonPatterns) {
      setFeedback("This contains common patterns - try something more unique");
      return;
    }
    
    // All criteria met
    if (scr >= 90) {
      setFeedback("🚀 God-tier password! You're a security pro!");
    } else if (scr >= 70) {
      setFeedback("🔒 Great password! Very secure!");
    } else if (scr >= 40) {
      setFeedback("👌 Good start, but could be stronger");
    }
  };

  const getStrengthColor = () => {
    if (score >= 90) return "bg-green-500";
    if (score >= 70) return "bg-emerald-500";
    if (score >= 40) return "bg-amber-500";
    if (score > 0) return "bg-red-500";
    return "bg-gray-200";
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateRandomPassword = () => {
    const length = 16;
    const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
    const numberChars = "0123456789";
    const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
    
    const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars;
    
    // Generate a base with at least one of each char type
    let newPassword = 
      uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)] +
      lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)] +
      numberChars[Math.floor(Math.random() * numberChars.length)] +
      specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill up the rest of the length
    for (let i = 4; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * allChars.length);
      newPassword += allChars[randomIndex];
    }
    
    // Shuffle the password
    newPassword = newPassword
      .split('')
      .sort(() => 0.5 - Math.random())
      .join('');
    
    setPassword(newPassword);
    toast({
      title: "Random Password Generated",
      description: "A secure random password has been created for you"
    });
  };

  const getEmoji = () => {
    if (score >= 90) return <Zap className="h-5 w-5 text-green-500" />;
    if (score >= 70) return <ThumbsUp className="h-5 w-5 text-emerald-500" />;
    if (score >= 40) return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    if (score > 0) return <AlertCircle className="h-5 w-5 text-red-500" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to check"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <Button onClick={generateRandomPassword} variant="outline" className="whitespace-nowrap">
                <Shuffle className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
            
            {/* Strength meter */}
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Password Strength</span>
                <div className="flex items-center gap-1.5">
                  {getEmoji()}
                  <span className="text-sm font-medium">{strengthLevel}</span>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getStrengthColor()}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <div className="text-xs text-right text-muted-foreground">
                Score: {score}/100
              </div>
            </div>
            
            {/* Feedback */}
            <div className="text-sm mt-2 p-3 bg-background border rounded-md flex items-center gap-2">
              {password ? (
                criteria.hasMinLength &&
                criteria.hasUpperCase &&
                criteria.hasLowerCase &&
                criteria.hasNumber &&
                criteria.hasSymbol &&
                criteria.hasNoCommonPatterns ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                )
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>{feedback}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-medium mb-3">Password Requirements</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {criteria.hasMinLength ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>At least 8 characters long</span>
            </div>
            
            <div className="flex items-center gap-2">
              {criteria.hasUpperCase ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Contains uppercase letters (A-Z)</span>
            </div>
            
            <div className="flex items-center gap-2">
              {criteria.hasLowerCase ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Contains lowercase letters (a-z)</span>
            </div>
            
            <div className="flex items-center gap-2">
              {criteria.hasNumber ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Contains numbers (0-9)</span>
            </div>
            
            <div className="flex items-center gap-2">
              {criteria.hasSymbol ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
              )}
              <span>Contains special symbols (!@#$...)</span>
            </div>
            
            <div className="flex items-center gap-2">
              {criteria.hasNoCommonPatterns ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              <span>No common patterns or sequences</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-300">Coming Soon: Password Breach Checker</h3>
              <p className="text-sm text-amber-700 dark:text-amber-400">
                We're working on integrating with the HaveIBeenPwned API to check if your password has appeared in known data breaches.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
