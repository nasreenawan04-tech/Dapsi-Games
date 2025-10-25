import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import Dashboard from "@/pages/Dashboard";
import Planner from "@/pages/Planner";
import Leaderboard from "@/pages/Leaderboard";
import Rewards from "@/pages/Rewards";
import Profile from "@/pages/Profile";
import Activity from "@/pages/Activity";
import Friends from "@/pages/Friends";
import Groups from "@/pages/Groups";
import NotFound from "@/pages/not-found";

function Router() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

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
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/forgot-password" component={ForgotPassword} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/planner" component={Planner} />
        <ProtectedRoute path="/leaderboard" component={Leaderboard} />
        <ProtectedRoute path="/rewards" component={Rewards} />
        <ProtectedRoute path="/profile" component={Profile} />
        <ProtectedRoute path="/activity" component={Activity} />
        <ProtectedRoute path="/friends" component={Friends} />
        <ProtectedRoute path="/groups" component={Groups} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;