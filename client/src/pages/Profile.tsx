import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Trophy, Flame, TrendingUp, Settings, Award, Lock, Key, Upload, Trash2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { XPProgressBar } from "@/components/XPProgressBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { ThemeIndicator } from "@/components/ThemeIndicator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";
import { queryClient } from "@/lib/queryClient";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SEO } from "@/components/SEO";

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Fetch badges using authenticated API
  const { data: badges = [], isLoading: badgesLoading } = useQuery<any[]>({
    queryKey: ["/api/badges"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/badges");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch recent activities using authenticated API
  const { data: recentActivities = [], isLoading: activitiesLoading } = useQuery<any[]>({
    queryKey: ["/api/users/activities"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/activities?limit=5");
      return res.json();
    },
    enabled: !!user,
  });

  // Fetch detailed statistics
  const { data: detailedStats, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["/api/users/detailed-stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/users/detailed-stats");
      return res.json();
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      const res = await apiRequest("PATCH", "/api/users/profile", data);
      return res.json();
    },
    onSuccess: (data) => {
      refreshUser();
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
    },
    onError: (error) => {
      let errorMessage = "Failed to update profile. Please try again.";
      
      try {
        // Simplified error handling for non-async callback
        errorMessage = (error as any)?.message || errorMessage;
      } catch (e) {
        // Use default message
      }

      toast({
        title: "Error Updating Profile",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (avatarUrl: string) => {
      const res = await apiRequest("PATCH", "/api/users/avatar", { avatarUrl });
      return res.json();
    },
    onSuccess: () => {
      refreshUser();
      toast({
        title: "Avatar Updated",
        description: "Your avatar has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", "/api/users/account");
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      window.location.href = "/";
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (!user) return null;

  const handleSave = () => {
    // Reset errors
    setNameError("");
    setEmailError("");

    // Trim inputs
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    // Validate name
    if (trimmedName.length < 2) {
      setNameError("Name must be at least 2 characters");
      return;
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Check for changes
    const updates: { name?: string; email?: string } = {};
    
    if (trimmedName !== user.name) {
      updates.name = trimmedName;
    }
    
    if (trimmedEmail !== user.email) {
      updates.email = trimmedEmail;
    }

    if (Object.keys(updates).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes were made to your profile.",
      });
      return;
    }

    updateProfileMutation.mutate(updates);
  };

  const handlePasswordChange = async () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All password fields are required");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error("Not authenticated");
      }

      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      await reauthenticateWithCredential(currentUser, credential);

      await updatePassword(currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });
    } catch (error: any) {
      let errorMessage = "Failed to update password.";
      
      if (error.code === "auth/wrong-password") {
        errorMessage = "Current password is incorrect";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      } else if (error.code === "auth/requires-recent-login") {
        errorMessage = "Please log out and log in again to change your password";
      }

      setPasswordError(errorMessage);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isLoading = badgesLoading || activitiesLoading;
  const isSaving = updateProfileMutation.isPending;

  const stats = [
    { label: "Total XP", value: user.xp.toLocaleString(), icon: Trophy, color: "text-primary" },
    { label: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-500" },
    { label: "Level", value: user.level, icon: TrendingUp, color: "text-secondary" },
  ];

  const badgeIcons: Record<string, any> = {
    first_focus: Trophy,
    dedicated_learner: Flame,
    task_master: TrendingUp,
    rising_star: Award,
    focus_champion: Trophy,
    consistency_king: Flame,
    xp_collector: Trophy,
    master_learner: Award,
  };

  const badgeNames: Record<string, string> = {
    first_focus: "First Focus",
    dedicated_learner: "Dedicated Learner",
    task_master: "Task Master",
    rising_star: "Rising Star",
    focus_champion: "Focus Champion",
    consistency_king: "Consistency King",
    xp_collector: "XP Collector",
    master_learner: "Master Learner",
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <SEO
        title="Your Profile"
        description="Manage your profile, view your progress, and customize your study experience."
        noindex={true}
      />
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base">
          Manage your account and view your progress
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group">
                  <UserAvatar className="h-24 w-24 mb-4 ring-4 ring-primary/10 group-hover:ring-primary/30 transition-all" showBorder={true} />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-all duration-300"></div>
                </div>
                <h2 className="text-xl font-bold mb-1" data-testid="text-profile-name">{user.name}</h2>
                <p className="text-sm text-muted-foreground mb-3" data-testid="text-profile-email">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <Badge className="px-3 py-1" data-testid="badge-user-level">{user.level}</Badge>
                  <ThemeIndicator />
                </div>
                <div className="w-full">
                  <XPProgressBar currentXP={user.xp} level={user.level} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/40 transition-all duration-200 border border-border/50" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-background/80">
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <span className="text-sm font-medium">{stat.label}</span>
                    </div>
                    <span className="font-bold text-lg">{stat.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Account Settings */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError("");
                  }}
                  data-testid="input-profile-name"
                  disabled={isSaving}
                  className={`transition-all ${nameError ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                  placeholder="Enter your name"
                />
                {nameError && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1" data-testid="error-profile-name">
                    <span className="text-red-500">⚠</span> {nameError}
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailError("");
                  }}
                  data-testid="input-profile-email"
                  disabled={isSaving}
                  className={`transition-all ${emailError ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-primary"}`}
                  placeholder="Enter your email"
                />
                {emailError && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1" data-testid="error-profile-email">
                    <span className="text-red-500">⚠</span> {emailError}
                  </p>
                )}
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold mb-1 flex items-center gap-2">
                      <span className="text-2xl">🎨</span>
                      Theme Preference
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Switch between light and dark mode
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
              </div>
              
              <Button 
                onClick={handleSave} 
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                data-testid="button-save-profile"
                disabled={isSaving}
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Saving...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Save Changes
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-secondary" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4 text-secondary" />
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setPasswordError("");
                  }}
                  data-testid="input-current-password"
                  disabled={isChangingPassword}
                  placeholder="Enter current password"
                  className="transition-all focus-visible:ring-secondary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4 text-secondary" />
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setPasswordError("");
                  }}
                  data-testid="input-new-password"
                  disabled={isChangingPassword}
                  placeholder="Enter new password (min 6 characters)"
                  className="transition-all focus-visible:ring-secondary"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold flex items-center gap-2">
                  <Key className="h-4 w-4 text-secondary" />
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError("");
                  }}
                  data-testid="input-confirm-password"
                  disabled={isChangingPassword}
                  placeholder="Confirm new password"
                  className="transition-all focus-visible:ring-secondary"
                />
              </div>
              
              {passwordError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900">
                  <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2" data-testid="error-password">
                    <span className="text-red-500">⚠</span> {passwordError}
                  </p>
                </div>
              )}
              
              <Button 
                onClick={handlePasswordChange} 
                className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-all" 
                data-testid="button-change-password"
                disabled={isChangingPassword}
                variant="secondary"
              >
                {isChangingPassword ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> Updating Password...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Update Password
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Badges Showcase */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                Your Badges
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {badgesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-xl bg-muted/30">
                      <Skeleton className="h-14 w-14 rounded-full mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center py-12 px-4" data-testid="empty-badges">
                  <div className="relative inline-block">
                    <Lock className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                    <div className="absolute inset-0 blur-xl bg-primary/10"></div>
                  </div>
                  <p className="text-lg font-semibold mb-2">No Badges Yet</p>
                  <p className="text-sm text-muted-foreground">Complete achievements to unlock badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {badges.map((badge: any) => {
                    const Icon = badgeIcons[badge.badgeId] || Award;
                    return (
                      <div
                        key={badge.id}
                        className="group flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-amber-500/10 to-primary/10 hover:from-amber-500/20 hover:to-primary/20 border border-amber-200/20 dark:border-amber-800/20 transition-all duration-300 hover:scale-105 hover:shadow-md cursor-pointer"
                        data-testid={`badge-${badge.badgeId}`}
                      >
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <p className="text-xs font-bold text-center leading-tight">
                          {badgeNames[badge.badgeId] || badge.badgeId}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-2 hover:shadow-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/30">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center py-12 px-4" data-testid="empty-activities">
                  <div className="relative inline-block">
                    <Trophy className="h-16 w-16 mx-auto mb-4 opacity-30 text-muted-foreground" />
                    <div className="absolute inset-0 blur-xl bg-green-500/10"></div>
                  </div>
                  <p className="text-lg font-semibold mb-2">No Activity Yet</p>
                  <p className="text-sm text-muted-foreground">Complete tasks and sessions to see your activity!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="group flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-muted/40 to-muted/20 hover:from-green-500/10 hover:to-primary/10 border border-border/50 hover:border-green-500/30 transition-all duration-200"
                      data-testid={`activity-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold mb-1 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" data-testid={`activity-text-${index}`}>
                          {activity.text}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1" data-testid={`activity-time-${index}`}>
                          <span className="text-xs">🕐</span> {activity.time}
                        </p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className="font-bold px-3 py-1 bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 group-hover:bg-green-500/20 transition-colors" 
                        data-testid={`activity-xp-${index}`}
                      >
                        +{activity.xp} XP
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
