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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your account and view your progress
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center text-center">
                <UserAvatar className="h-24 w-24 mb-4" showBorder={true} />
                <h2 className="text-xl font-bold mb-1" data-testid="text-profile-name">{user.name}</h2>
                <p className="text-sm text-muted-foreground mb-3" data-testid="text-profile-email">{user.email}</p>
                <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                  <Badge data-testid="badge-user-level">{user.level}</Badge>
                  <ThemeIndicator />
                </div>
                <XPProgressBar currentXP={user.xp} level={user.level} />
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30" data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <span className="text-sm text-muted-foreground">{stat.label}</span>
                    </div>
                    <span className="font-bold">{stat.value}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <div className="flex gap-2">
                  <User className="h-5 w-5 text-muted-foreground mt-2.5" />
                  <div className="flex-1">
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setNameError("");
                      }}
                      data-testid="input-profile-name"
                      disabled={isSaving}
                      className={nameError ? "border-red-500" : ""}
                    />
                    {nameError && (
                      <p className="text-sm text-red-500 mt-1" data-testid="error-profile-name">{nameError}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-2.5" />
                  <div className="flex-1">
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
                      className={emailError ? "border-red-500" : ""}
                    />
                    {emailError && (
                      <p className="text-sm text-red-500 mt-1" data-testid="error-profile-email">{emailError}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                <div>
                  <p className="font-medium mb-1">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
                <ThemeToggle />
              </div>
              <Button 
                onClick={handleSave} 
                className="w-full" 
                data-testid="button-save-profile"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          {/* Password Change */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <div className="flex gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground mt-2.5" />
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="flex gap-2">
                  <Key className="h-5 w-5 text-muted-foreground mt-2.5" />
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
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="flex gap-2">
                  <Key className="h-5 w-5 text-muted-foreground mt-2.5" />
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
                  />
                </div>
              </div>
              {passwordError && (
                <p className="text-sm text-red-500" data-testid="error-password">{passwordError}</p>
              )}
              <Button 
                onClick={handlePasswordChange} 
                className="w-full" 
                data-testid="button-change-password"
                disabled={isChangingPassword}
                variant="secondary"
              >
                {isChangingPassword ? "Updating Password..." : "Update Password"}
              </Button>
            </CardContent>
          </Card>

          {/* Badges Showcase */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Your Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {badgesLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex flex-col items-center p-4 rounded-lg bg-muted/30">
                      <Skeleton className="h-12 w-12 rounded-full mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : badges.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground" data-testid="empty-badges">
                  <Lock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Complete achievements to unlock badges!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {badges.map((badge: any) => {
                    const Icon = badgeIcons[badge.badgeId] || Award;
                    return (
                      <div
                        key={badge.id}
                        className="flex flex-col items-center p-4 rounded-lg bg-muted/30 hover-elevate"
                        data-testid={`badge-${badge.badgeId}`}
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <p className="text-xs font-semibold text-center">
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activitiesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <Skeleton className="h-4 w-48 mb-2" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="text-center p-8 text-muted-foreground" data-testid="empty-activities">
                  <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover-elevate"
                      data-testid={`activity-${index}`}
                    >
                      <div className="flex-1">
                        <p className="font-semibold mb-1" data-testid={`activity-text-${index}`}>{activity.text}</p>
                        <p className="text-sm text-muted-foreground" data-testid={`activity-time-${index}`}>{activity.time}</p>
                      </div>
                      <Badge variant="secondary" className="font-bold" data-testid={`activity-xp-${index}`}>
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
