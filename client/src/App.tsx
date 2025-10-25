import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { initGA } from "@/lib/analytics";
import { useAnalytics } from "@/hooks/use-analytics";
import { AdSenseScript } from "@/components/AdSense";

import Home from "@/pages/Home";
import About from "@/pages/About";
import Features from "@/pages/Features";
import Pricing from "@/pages/Pricing";
import Contact from "@/pages/Contact";
import FAQ from "@/pages/FAQ";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import EmailVerification from "@/pages/EmailVerification";
import Dashboard from "@/pages/Dashboard";
import Planner from "@/pages/Planner";
import Leaderboard from "@/pages/Leaderboard";
import Rewards from "@/pages/Rewards";
import Store from "@/pages/Store";
import Profile from "@/pages/Profile";
import Activity from "@/pages/Activity";
import Friends from "@/pages/Friends";
import Groups from "@/pages/Groups";
import Subscribe from "@/pages/Subscribe";
import NotFound from "@/pages/not-found";

function Router() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  useAnalytics();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      <Navigation />
      {isOffline && (
        <div className="fixed top-16 left-0 right-0 z-50 px-4 py-2">
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>You're offline</AlertTitle>
            <AlertDescription>
              Some features may not work until your connection is restored.
            </AlertDescription>
          </Alert>
        </div>
      )}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/features" component={Features} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/contact" component={Contact} />
        <Route path="/faq" component={FAQ} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <Route path="/verify-email" component={EmailVerification} />
        <Route path="/dashboard">
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        </Route>
        <Route path="/planner">
          <ProtectedRoute>
            <Planner />
          </ProtectedRoute>
        </Route>
        <Route path="/leaderboard">
          <ProtectedRoute>
            <Leaderboard />
          </ProtectedRoute>
        </Route>
        <Route path="/rewards">
          <ProtectedRoute>
            <Rewards />
          </ProtectedRoute>
        </Route>
        <Route path="/store">
          <ProtectedRoute>
            <Store />
          </ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        </Route>
        <Route path="/activity">
          <ProtectedRoute>
            <Activity />
          </ProtectedRoute>
        </Route>
        <Route path="/friends">
          <ProtectedRoute>
            <Friends />
          </ProtectedRoute>
        </Route>
        <Route path="/groups">
          <ProtectedRoute>
            <Groups />
          </ProtectedRoute>
        </Route>
        <Route path="/subscribe">
          <ProtectedRoute>
            <Subscribe />
          </ProtectedRoute>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  useEffect(() => {
    if (import.meta.env.VITE_GA_MEASUREMENT_ID) {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AdSenseScript />
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;