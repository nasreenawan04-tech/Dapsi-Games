import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { XPProgressBar } from "@/components/XPProgressBar";
import { WeeklyProgressChart } from "@/components/WeeklyProgressChart";
import { Trophy, Target, Flame, TrendingUp, Award, CheckCircle2 } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getUserTasks, getWeeklyStats, getRecentActivities, getUserBadges, getTodayStats } from "@/lib/firebase";
import { Skeleton } from "@/components/ui/skeleton";
import { SEO } from "@/components/SEO";

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
  const [weeklyStats, setWeeklyStats] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [badgeCount, setBadgeCount] = useState(0);
  const [todayStats, setTodayStats] = useState({ pomodoroSessions: 0, totalStudyTime: 0, tasksCompleted: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tasks, stats, activities, badges, today] = await Promise.all([
        getUserTasks(user.id),
        getWeeklyStats(user.id),
        getRecentActivities(user.id, 5),
        getUserBadges(user.id),
        getTodayStats(user.id),
      ]);
      
      setPendingTasksCount(tasks.filter((t: any) => !t.completed).length);
      setWeeklyStats(stats);
      setRecentActivities(activities);
      setBadgeCount(badges.length);
      setTodayStats(today);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const dailyGoals = [
    { 
      id: 1, 
      title: `Complete 2 Pomodoro sessions (${todayStats.pomodoroSessions}/2)`, 
      completed: todayStats.pomodoroSessions >= 2, 
      xp: 100 
    },
    { 
      id: 2, 
      title: `Finish 3 tasks (${todayStats.tasksCompleted}/3)`, 
      completed: todayStats.tasksCompleted >= 3, 
      xp: 50 
    },
    { 
      id: 3, 
      title: `Study for 60 minutes (${todayStats.totalStudyTime}/60 min)`, 
      completed: todayStats.totalStudyTime >= 60, 
      xp: 75 
    },
  ];

  const stats = [
    { label: "Total XP", value: user.xp.toLocaleString(), icon: Trophy, color: "text-primary" },
    { label: "Current Streak", value: `${user.streak} days`, icon: Flame, color: "text-orange-500" },
    { label: "Level", value: user.level, icon: TrendingUp, color: "text-secondary" },
    { label: "Badges Earned", value: badgeCount.toString(), icon: Award, color: "text-accent" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Dashboard"
        description="Your personalized study dashboard with progress tracking, Pomodoro timer, and daily goals."
        noindex={true}
      />
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
            onComplete={async () => {
              await loadDashboardData();
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

      {/* Weekly Progress Chart */}
      {loading ? (
        <Card className="mb-8">
          <CardContent className="p-6">
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8">
          <WeeklyProgressChart data={weeklyStats} />
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity yet. Start a focus session or complete a task!</p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
