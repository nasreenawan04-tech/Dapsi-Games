import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Activity as ActivityIcon, Trophy, CheckCircle, Clock } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { SEO } from "@/components/SEO";

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
    const activitiesQuery = query(
      collection(db, "activities"),
      orderBy("createdAt", "desc"),
      limit(30)
    );

    const unsubscribe = onSnapshot(activitiesQuery, async (snapshot) => {
      const activitiesData = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const userDoc = await getDoc(doc(db, "users", data.userId));
          const userData = userDoc.data();
          
          const now = new Date();
          const createdAt = data.createdAt?.toDate() || now;
          const diffMs = now.getTime() - createdAt.getTime();
          const diffMins = Math.floor(diffMs / 60000);
          const diffHours = Math.floor(diffMs / 3600000);
          const diffDays = Math.floor(diffMs / 86400000);
          
          let timeAgo = "just now";
          if (diffDays > 0) timeAgo = `${diffDays}d ago`;
          else if (diffHours > 0) timeAgo = `${diffHours}h ago`;
          else if (diffMins > 0) timeAgo = `${diffMins}m ago`;

          return {
            id: docSnapshot.id,
            userId: data.userId,
            userName: userData?.name || "Unknown User",
            type: data.type,
            text: data.text,
            xp: data.xp,
            time: timeAgo,
          };
        })
      );
      setActivities(activitiesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (!user) return null;
  if (loading) return <div className="container mx-auto px-4 py-8">Loading activities...</div>;

  const getActivityIcon = (type: string) => {
    if (type === "session") return <Trophy className="h-5 w-5 text-primary" />;
    if (type === "task") return <CheckCircle className="h-5 w-5 text-secondary" />;
    return <ActivityIcon className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Activity Feed"
        description="See what other students are accomplishing and get motivated by their progress."
        noindex={true}
      />
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
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-activities">No activity yet</h3>
              <p className="text-muted-foreground">
                Be the first to complete a study session or task!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <Card key={index} className="hover-elevate transition-all" data-testid={`card-activity-${index}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm" data-testid={`text-activity-description-${index}`}>
                        <span className="font-semibold">{activity.userName}</span>
                        {" "}
                        <span className="text-muted-foreground">{activity.text}</span>
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs" data-testid={`badge-activity-xp-${index}`}>
                          +{activity.xp} XP
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1" data-testid={`text-activity-time-${index}`}>
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
