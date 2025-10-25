import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity as ActivityIcon, Trophy, CheckCircle, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getGlobalActivityFeed } from "@/lib/firebase";

export default function Activity() {
  return (
    <ProtectedRoute>
      <ActivityContent />
    </ProtectedRoute>
  );
}

function ActivityContent() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadActivities = async () => {
    try {
      const data = await getGlobalActivityFeed(30);
      setActivities(data);
    } catch (error) {
      console.error("Failed to load activity feed:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="container mx-auto px-4 py-8">Loading activities...</div>;

  const getActivityIcon = (type: string) => {
    if (type === "session") return <Trophy className="h-5 w-5 text-primary" />;
    if (type === "task") return <CheckCircle className="h-5 w-5 text-secondary" />;
    return <ActivityIcon className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
          <ActivityIcon className="h-8 w-8 text-primary" />
          Activity Feed
        </h1>
        <p className="text-muted-foreground">
          See what other students are accomplishing
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        {activities.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ActivityIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Be the first to complete a study session or task!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <Card key={index} className="hover-elevate transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-semibold">{activity.userName}</span>
                        {" "}
                        <span className="text-muted-foreground">{activity.text}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          +{activity.xp} XP
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    <Avatar className="h-10 w-10 hidden sm:block">
                      <AvatarFallback className="text-xs">
                        {activity.userName?.[0]}{activity.userName?.split(" ")[1]?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
