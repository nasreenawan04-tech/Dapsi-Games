import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Trophy, Flame, TrendingUp, Settings } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { XPProgressBar } from "@/components/XPProgressBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const { toast } = useToast();

  if (!user) return null;

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved successfully.",
    });
  };

  const stats = [
    { label: "Total XP", value: user.xp.toLocaleString(), icon: Trophy, color: "text-primary" },
    { label: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-500" },
    { label: "Level", value: user.level, icon: TrendingUp, color: "text-secondary" },
  ];

  const xpHistory = [
    { date: "Today", xp: 150, activities: "3 sessions, 2 tasks completed" },
    { date: "Yesterday", xp: 200, activities: "4 sessions, 3 tasks completed" },
    { date: "2 days ago", xp: 100, activities: "2 sessions, 1 task completed" },
    { date: "3 days ago", xp: 175, activities: "3 sessions, 2 tasks completed" },
    { date: "4 days ago", xp: 125, activities: "2 sessions, 2 tasks completed" },
  ];

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
                <Avatar className="h-24 w-24 mb-4 border-4 border-primary">
                  <AvatarFallback className="text-2xl font-bold">
                    {user.name[0]}{user.name.split(" ")[1]?.[0] || ""}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{user.name}</h2>
                <p className="text-sm text-muted-foreground mb-3">{user.email}</p>
                <Badge className="mb-4">{user.level}</Badge>
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
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
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
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    data-testid="input-profile-name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground mt-2.5" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-profile-email"
                  />
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
              <Button onClick={handleSave} className="w-full" data-testid="button-save-profile">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* XP History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                XP History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {xpHistory.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover-elevate"
                    data-testid={`xp-history-${index}`}
                  >
                    <div className="flex-1">
                      <p className="font-semibold mb-1">{entry.date}</p>
                      <p className="text-sm text-muted-foreground">{entry.activities}</p>
                    </div>
                    <Badge variant="secondary" className="font-bold">
                      +{entry.xp} XP
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
