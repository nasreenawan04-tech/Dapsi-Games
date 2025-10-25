import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Flame, Star, Target, Zap, Lock } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";

export default function Rewards() {
  return (
    <ProtectedRoute>
      <RewardsContent />
    </ProtectedRoute>
  );
}

function RewardsContent() {
  const { user } = useAuth();

  if (!user) return null;

  const badges = [
    {
      id: 1,
      name: "First Focus",
      description: "Complete your first Pomodoro session",
      icon: Trophy,
      unlocked: true,
      requirement: "Complete 1 session",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      id: 2,
      name: "Dedicated Learner",
      description: "Maintain a 7-day study streak",
      icon: Flame,
      unlocked: true,
      requirement: "7 day streak",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      id: 3,
      name: "Task Master",
      description: "Complete 10 study tasks",
      icon: Target,
      unlocked: true,
      requirement: "10 tasks completed",
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      id: 4,
      name: "Rising Star",
      description: "Reach 500 total XP",
      icon: Star,
      unlocked: user.xp >= 500,
      requirement: "500 XP earned",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
    },
    {
      id: 5,
      name: "Focus Champion",
      description: "Complete 25 Pomodoro sessions",
      icon: Zap,
      unlocked: false,
      requirement: "25 sessions completed",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      id: 6,
      name: "Consistency King",
      description: "Maintain a 30-day study streak",
      icon: Flame,
      unlocked: false,
      requirement: "30 day streak",
      color: "text-orange-600",
      bgColor: "bg-orange-600/10",
    },
    {
      id: 7,
      name: "XP Collector",
      description: "Earn 2000 total XP",
      icon: Trophy,
      unlocked: false,
      requirement: "2000 XP earned",
      color: "text-yellow-600",
      bgColor: "bg-yellow-600/10",
    },
    {
      id: 8,
      name: "Master Learner",
      description: "Reach Master level",
      icon: Award,
      unlocked: user.level === "Master",
      requirement: "Reach Master level",
      color: "text-purple-600",
      bgColor: "bg-purple-600/10",
    },
  ];

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
          <Award className="h-8 w-8 text-primary" />
          Badges & Rewards
        </h1>
        <p className="text-muted-foreground">
          Unlock achievements by completing milestones and staying consistent
        </p>
      </div>

      {/* Stats */}
      <Card className="mb-8 bg-gradient-to-br from-primary/5 to-accent/5">
        <CardContent className="p-6">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Badges</p>
              <p className="text-3xl font-bold">{badges.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Unlocked</p>
              <p className="text-3xl font-bold text-primary">{unlockedBadges.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-3xl font-bold text-secondary">
                {Math.round((unlockedBadges.length / badges.length) * 100)}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unlocked Badges */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          Your Badges
        </h2>
        {unlockedBadges.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Award className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p>Start studying to unlock your first badge!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {unlockedBadges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card
                  key={badge.id}
                  className="hover-elevate transition-all duration-300 transform hover:scale-105"
                  data-testid={`badge-unlocked-${badge.id}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className={`h-20 w-20 rounded-full ${badge.bgColor} flex items-center justify-center mx-auto mb-4 animate-scale-in`}>
                      <Icon className={`h-10 w-10 ${badge.color}`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {badge.description}
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      Unlocked
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Locked Badges */}
      <div>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Lock className="h-6 w-6 text-muted-foreground" />
          Locked Badges
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {lockedBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card
                key={badge.id}
                className="opacity-60 hover:opacity-80 transition-opacity"
                data-testid={`badge-locked-${badge.id}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 relative">
                    <Icon className="h-10 w-10 text-muted-foreground" />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                      <Lock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {badge.description}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {badge.requirement}
                  </Badge>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
