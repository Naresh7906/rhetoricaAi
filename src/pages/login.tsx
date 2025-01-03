import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { Building, Building2, Loader2, Mic } from "lucide-react";
import { useUser } from "@/contexts/user-context";
import type { UserRole } from "@/contexts/user-context";
import { useNavigate } from "react-router-dom";

export function Login() {
  const { loginWithSSO, isLoading } = useUser();
  const [role, setRole] = useState<UserRole>("employee");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSSOLogin = async () => {
    try {
      setError(null);
      await loginWithSSO(role);
    } catch (err) {
      setError('SSO login failed. Please try again.');
      console.error('Login error:', err);
    }
  };

  const toggleRole = () => {
    setRole(role === "employee" ? "hr" : "employee");
    setError(null);
  };

  const isEmployee = role === "employee";
  const Icon = isEmployee ? Building : Building2;
  
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Left Section - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-600/10 via-background to-background">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative z-10 w-full flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="space-y-4">
              {isEmployee ? (
                <>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold">
                    <span className="gradient-text">Develop your</span>
                    <br />
                    <span className="text-purple-600 dark:text-purple-400">Professional</span>
                    <br />
                    <span className="text-foreground">and</span>
                    <br />
                    <span className="text-purple-600 dark:text-purple-400">Communication</span>
                    <br />
                    <span className="text-foreground">expertise</span>
                  </h1>
                </>
              ) : (
                <>
                  <h1 className="text-3xl lg:text-4xl xl:text-5xl font-bold">
                    <span className="gradient-text">Empower your team's</span>
                    <br />
                    <span className="text-purple-600 dark:text-purple-400">Communication</span>
                    <br />
                    <span className="text-foreground">and</span>
                    <br />
                    <span className="text-purple-600 dark:text-purple-400">Leadership</span>
                    <br />
                    <span className="text-foreground">skills</span>
                  </h1>
                </>
              )}
            </div>
            <div className="mt-8 w-full aspect-square max-w-lg mx-auto">
              <img 
                src="/images/rhetorica_landing.png" 
                alt={isEmployee ? "Professional Development" : "Corporate Training"}
                className="w-full h-full object-contain animate-float opacity-90"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex-1 flex flex-col bg-gradient-to-b from-background via-background to-purple-900/5">
        <div className="absolute right-4 top-4 z-50">
          <ThemeToggle />
        </div>
        
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <Card className="w-full max-w-md relative overflow-hidden border-purple-200/20 bg-background/80 backdrop-blur-sm">
            {/* Decorative Elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent" />
            <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
              <div className="relative left-[calc(50%-20rem)] aspect-[1155/678] w-[27.125rem] -translate-x-1 rotate-[30deg] bg-gradient-to-tr from-purple-600 to-purple-400 opacity-10 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
            </div>
            
            <CardHeader className="space-y-4 text-center relative z-10">
              <div className="mx-auto w-[15%] aspect-square rounded-3xl bg-gradient-to-br from-purple-500 to-indigo-600 p-0.5 shadow-2xl shadow-purple-500/20">
                <div className="w-full h-full rounded-3xl bg-background/90 backdrop-blur-2xl flex items-center justify-center">
                  <Icon className="w-1/2 h-1/2 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-1.5">
                <CardTitle className="text-[clamp(1.4rem,4vw,1.875rem)] font-bold gradient-text">
                  Rhetorica.AI
                </CardTitle>
                <div className="space-y-0.5">
                  <p className="text-[clamp(1.1rem,3vw,1.25rem)] font-semibold text-foreground">
                    {isEmployee ? "Employee" : "HR"} Portal
                  </p>
                  <p className="text-[clamp(0.875rem,2vw,1rem)] text-muted-foreground">
                    Sign in with your corporate credentials
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 relative z-10 pt-4">
              {error && (
                <div className="text-red-500 text-sm text-center bg-red-100/10 p-2 rounded-lg">
                  {error}
                </div>
              )}
              
              <Button 
                className="w-full gradient-bg hover:opacity-90 text-[clamp(1rem,2.5vw,1.125rem)] h-[clamp(3rem,8vw,3.5rem)] rounded-2xl shadow-xl shadow-purple-500/20 transition-all duration-300 hover:shadow-purple-500/30 hover:scale-[1.02]"
                onClick={handleSSOLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in with SSO"
                )}
              </Button>
              
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-purple-200/20"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground text-[clamp(0.75rem,2vw,0.875rem)]">or</span>
                </div>
              </div>

              <Button
                variant="ghost"
                className="w-full text-[clamp(0.875rem,2vw,1rem)] text-muted-foreground hover:text-primary hover:bg-purple-500/5 transition-colors rounded-xl h-[clamp(2.5rem,6vw,3rem)]"
                onClick={toggleRole}
                disabled={isLoading}
              >
                Switch to {isEmployee ? "HR" : "Employee"} Login
              </Button>

              <div className="text-center text-[clamp(0.75rem,2vw,0.875rem)] text-muted-foreground pt-2">
                <p>
                  By continuing, you agree to our{" "}
                  <a href="#" className="text-primary hover:text-purple-400 transition-colors">Terms of Service</a>
                  {" "}and{" "}
                  <a href="#" className="text-primary hover:text-purple-400 transition-colors">Privacy Policy</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 