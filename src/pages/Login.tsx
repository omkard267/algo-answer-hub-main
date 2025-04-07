
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Check auth status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking auth status:", error);
          return;
        }
        
        console.log("Current auth session:", data.session ? "Logged in" : "No session");
        if (data.session) {
          console.log("User is already logged in, redirecting to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Unexpected error checking auth status:", error);
      }
    };
    
    checkAuthStatus();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    setLoginError(null);
    
    try {
      console.log(`Attempting login with email: ${email}`);
      const success = await login(email, password);
      
      if (success) {
        console.log("Login successful, redirecting to home");
        toast({
          title: "Success",
          description: "Logged in successfully",
        });
        navigate("/");
      } else {
        console.error("Login failed but no exception was thrown");
        setLoginError("Invalid login credentials. Please check your email and password.");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setLoginError(error?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Demo user login info
  const loginAsDemoUser = async (type: "user" | "admin") => {
    setIsLoading(true);
    setLoginError(null);
    
    try {
      const email = type === "admin" ? "admin@example.com" : "user@example.com";
      const password = "password";
      
      console.log(`Attempting to login as demo ${type} with email: ${email}`);
      
      // Try to login directly - we don't need to check if user exists first
      const success = await login(email, password);
      if (success) {
        console.log(`Successfully logged in as demo ${type}`);
        toast({
          title: "Success",
          description: `Logged in as demo ${type}`,
        });
        navigate("/");
      } else {
        console.error(`Failed to log in as demo ${type} but no exception was thrown`);
        setLoginError(`Failed to log in as demo ${type}. Please try again.`);
      }
    } catch (error: any) {
      console.error(`Demo ${type} login error:`, error);
      setLoginError(error?.message || `Failed to log in as demo ${type}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold">
            AlgoAnswerHub
          </Link>
          <h2 className="mt-2 text-lg text-muted-foreground">
            Log in to your account
          </h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loginError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="text-sm text-center">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
            
            <div className="w-full">
              <p className="text-center text-sm mb-2 text-muted-foreground">Demo accounts (password: "password")</p>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loginAsDemoUser("user")}
                  disabled={isLoading}
                >
                  Login as User
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => loginAsDemoUser("admin")}
                  disabled={isLoading}
                >
                  Login as Admin
                </Button>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
