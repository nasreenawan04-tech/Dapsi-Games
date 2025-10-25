import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Loader2, CheckCircle, RefreshCw, LogOut } from "lucide-react";
import { auth } from "@/lib/firebase";
import { resendVerificationEmail } from "@/lib/firebase";

export default function EmailVerification() {
  const { user, logout, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResendEmail = async () => {
    setResending(true);
    try {
      await resendVerificationEmail();
      toast({
        title: "Verification email sent!",
        description: "Please check your inbox for the verification link.",
      });
      setCooldown(60);
    } catch (error) {
      toast({
        title: "Failed to send email",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  const handleCheckVerification = async () => {
    setChecking(true);
    try {
      await auth.currentUser?.reload();
      await refreshUser();
      
      if (auth.currentUser?.emailVerified) {
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified. Redirecting to dashboard...",
        });
        setTimeout(() => {
          setLocation("/dashboard");
        }, 1000);
      } else {
        toast({
          title: "Not verified yet",
          description: "Please click the verification link in your email first.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check verification status",
        variant: "destructive",
      });
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setLocation("/login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-lg">
              D
            </div>
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          </div>
          <CardDescription>
            Please verify your email address to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-muted-foreground mb-4">
              We've sent a verification email to{" "}
              <strong className="text-foreground">{user?.email || auth.currentUser?.email}</strong>.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Please check your inbox and click the verification link to activate your account.
              Don't forget to check your spam folder!
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleCheckVerification}
                className="w-full gap-2"
                disabled={checking}
                data-testid="button-check-verification"
              >
                {checking ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    I've Verified My Email
                  </>
                )}
              </Button>

              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full gap-2"
                disabled={resending || cooldown > 0}
                data-testid="button-resend-email"
              >
                {resending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : cooldown > 0 ? (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend in {cooldown}s
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Resend Verification Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
