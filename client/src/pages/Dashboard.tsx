import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { XPProgressBar } from "@/components/XPProgressBar";
import { Trophy, Target, Flame, TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getUserTasks } from "@/lib/firebase";

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [pendingTasksCount, setPendingTasksCount] = useState(0);

  useEffect(() => {
    if (user) {
      getUserTasks(user.id).then(tasks => {
        setPendingTasksCount(tasks.filter((t: any) => !t.completed).length);
      });
    }
  }, [user]);

  if (!user) return null;

  const dailyGoals = [
    { id: 1, title: "Complete 2 Pomodoro sessions", completed: false, xp: 100 },
    { id: 2, title: `Finish 3 tasks (${pendingTasksCount} pending)`, completed: false, xp: 50 },
    { id: 3, title: "Study for 1 hour", completed: false, xp: 75 },
  ];

  const recentActivities = [
    { type: "session", text: "Completed 25-min focus session", xp: 50, time: "2 hours ago" },
    { type: "task", text: "Finished Math homework", xp: 10, time: "5 hours ago" },
    { type: "badge", text: "Unlocked 'First Focus' badge", time: "1 day ago" },
  ];

  const stats = [
    { label: "Total XP", value: user.xp.toLocaleString(), icon: Trophy, color: "text-primary" },
    { label: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-500" },
    { label: "Level", value: user.level, icon: TrendingUp, color: "text-secondary" },
    { label: "Badges Earned", value: "3", icon: Award, color: "text-accent" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Ready to level up your study game today?
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover-elevate">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold" data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, "-")}`}>
                  {stat.value}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* XP Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <XPProgressBar currentXP={user.xp} level={user.level} />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Pomodoro Timer */}
        <div className="lg:col-span-2">
          <PomodoroTimer
            onComplete={(duration, xpEarned) => {
              console.log(`Session completed: ${duration} min, ${xpEarned} XP`);
            }}
          />
        </div>

        {/* Daily Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Daily Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {dailyGoals.map((goal) => (
              <div
                key={goal.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate"
                data-testid={`goal-${goal.id}`}
              >
                <CheckCircle2
                  className={`h-5 w-5 mt-0.5 ${
                    goal.completed ? "text-primary fill-primary" : "text-muted-foreground"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${goal.completed ? "line-through text-muted-foreground" : ""}`}>
                    {goal.title}
                  </p>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    +{goal.xp} XP
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover-elevate"
                data-testid={`activity-${index}`}
              >
                <div className="flex items-center gap-3">
                  {activity.type === "session" && (
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Trophy className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  {activity.type === "task" && (
                    <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    </div>
                  )}
                  {activity.type === "badge" && (
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                      <Award className="h-5 w-5 text-accent" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm">{activity.text}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
                {activity.xp && (
                  <Badge variant="outline">+{activity.xp} XP</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
