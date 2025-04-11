
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/components/Logo";

const LoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, signup, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Validation Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    const success = await login(loginEmail, loginPassword);
    
    if (success) {
      toast({
        title: "Login Successful",
        description: "Welcome back to MediTrust",
      });
      
      // Redirect to the previous page or home
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Try using user@example.com / password",
        variant: "destructive",
      });
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    const success = await signup(signupName, signupEmail, signupPassword);
    
    if (success) {
      toast({
        title: "Signup Successful",
        description: "Welcome to MediTrust",
      });
      
      // Redirect to the previous page or home
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } else {
      toast({
        title: "Signup Failed",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="mx-auto mb-4" size="lg" />
          <h1 className="text-3xl font-bold">MediTrust</h1>
          <p className="text-muted-foreground">Your Affordable Medicine Companion</p>
        </div>
        
        <Card>
          <CardHeader>
            <Tabs defaultValue="login" value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="mt-4">
                <CardTitle>Welcome Back</CardTitle>
                <CardDescription>
                  Login to access your medicine diary and saved items
                </CardDescription>
              </TabsContent>
              
              <TabsContent value="signup" className="mt-4">
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Sign up to track your medicines and find affordable alternatives
                </CardDescription>
              </TabsContent>
            </Tabs>
          </CardHeader>
          
          <CardContent>
            {activeTab === "login" ? (
              <form onSubmit={handleLogin}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Button variant="link" className="p-0 h-auto text-xs">
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                  
                  <div className="text-center text-sm text-muted-foreground mt-2">
                    <p>Use demo account: user@example.com / password</p>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {activeTab === "login" ? (
                <>
                  Don't have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setActiveTab("signup")}
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => setActiveTab("login")}
                  >
                    Login
                  </Button>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
