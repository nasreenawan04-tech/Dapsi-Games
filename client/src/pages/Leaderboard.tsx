import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Crown, TrendingUp } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { getFilteredLeaderboard, getFriendsLeaderboard } from "@/lib/firebase";

export default function Leaderboard() {
  return (
    <ProtectedRoute>
      <LeaderboardContent />
    </ProtectedRoute>
  );
}

function LeaderboardContent() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<"all" | "weekly" | "daily" | "friends">("all");

  useEffect(() => {
    loadLeaderboard(currentTab);
  }, [currentTab, user]);

  const loadLeaderboard = async (filter: "all" | "weekly" | "daily" | "friends") => {
    if (!user) return;
    setLoading(true);
    try {
      let data;
      if (filter === "friends") {
        data = await getFriendsLeaderboard(user.id, 20);
      } else {
        data = await getFilteredLeaderboard(filter, 20);
      }
      setLeaderboardData(data);
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (loading) return <div className="container mx-auto px-4 py-8">Loading leaderboard...</div>;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-orange-600" />;
    return <span className="text-muted-foreground font-semibold">#{rank}</span>;
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  const getTabLabel = () => {
    if (currentTab === "all") return "Global Leaderboard";
    if (currentTab === "weekly") return "Weekly Leaderboard";
    if (currentTab === "daily") return "Daily Leaderboard";
    return "Friends Leaderboard";
  };

  const getTabDescription = () => {
    if (currentTab === "all") return "See how you rank against students worldwide";
    if (currentTab === "weekly") return "Top performers this week";
    if (currentTab === "daily") return "Top performers today";
    return "See how you rank against your friends";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-primary" />
          {getTabLabel()}
        </h1>
        <p className="text-muted-foreground">
          {getTabDescription()}
        </p>
      </div>

      <Tabs 
        value={currentTab} 
        onValueChange={(value) => setCurrentTab(value as any)}
        className="mb-8"
      >
        <TabsList className="grid w-full grid-cols-4" data-testid="leaderboard-tabs">
          <TabsTrigger value="all" data-testid="tab-all">All Time</TabsTrigger>
          <TabsTrigger value="weekly" data-testid="tab-weekly">Weekly</TabsTrigger>
          <TabsTrigger value="daily" data-testid="tab-daily">Daily</TabsTrigger>
          <TabsTrigger value="friends" data-testid="tab-friends">Friends</TabsTrigger>
        </TabsList>
      </Tabs>

      {leaderboardData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No data yet</h3>
            <p className="text-muted-foreground">
              {currentTab === "friends" 
                ? "Add friends to see them here!" 
                : "Start earning XP to appear on the leaderboard!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
      {/* Top 3 Podium */}
      {leaderboardData.length >= 3 && (
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {/* Second Place */}
        <div className="md:order-1 order-2">
          <Card className="hover-elevate bg-gradient-to-br from-muted/50 to-background">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Medal className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <div className="text-6xl font-bold text-muted-foreground mb-2">2</div>
              </div>
              <Avatar className="h-16 w-16 mx-auto mb-3 border-4 border-gray-400">
                <AvatarFallback className="text-lg font-bold">
                  {topThree[1].name?.[0]}{topThree[1].name?.split(" ")[1]?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-1">{topThree[1].name}</h3>
              <p className="text-2xl font-bold text-primary mb-2">
                {topThree[1].xp.toLocaleString()} XP
              </p>
              <Badge variant="secondary">{topThree[1].level}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* First Place */}
        <div className="md:order-2 order-1">
          <Card className="hover-elevate bg-gradient-to-br from-yellow-500/10 to-background transform md:scale-105 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900 px-4 py-1 rounded-full text-xs font-bold">
                CHAMPION
              </div>
            </div>
            <CardContent className="p-6 text-center pt-8">
              <div className="mb-4">
                <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-2 animate-bounce-subtle" />
                <div className="text-7xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-600 bg-clip-text text-transparent mb-2">
                  1
                </div>
              </div>
              <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-yellow-500">
                <AvatarFallback className="text-xl font-bold">
                  {topThree[0].name?.[0]}{topThree[0].name?.split(" ")[1]?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-xl mb-1">{topThree[0].name}</h3>
              <p className="text-3xl font-bold text-primary mb-2">
                {topThree[0].xp.toLocaleString()} XP
              </p>
              <Badge>{topThree[0].level}</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Third Place */}
        <div className="md:order-3 order-3">
          <Card className="hover-elevate bg-gradient-to-br from-muted/50 to-background">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <Medal className="h-12 w-12 text-orange-600 mx-auto mb-2" />
                <div className="text-6xl font-bold text-muted-foreground mb-2">3</div>
              </div>
              <Avatar className="h-16 w-16 mx-auto mb-3 border-4 border-orange-600">
                <AvatarFallback className="text-lg font-bold">
                  {topThree[2].name?.[0]}{topThree[2].name?.split(" ")[1]?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-bold text-lg mb-1">{topThree[2].name}</h3>
              <p className="text-2xl font-bold text-primary mb-2">
                {topThree[2].xp.toLocaleString()} XP
              </p>
              <Badge variant="secondary">{topThree[2].level}</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
      )}

      {/* Full Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rankings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboardData.map((entry) => {
              const isCurrentUser = entry.name === user.name;
              return (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isCurrentUser
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/30 hover-elevate"
                  }`}
                  data-testid={`leaderboard-row-${entry.rank}`}
                >
                  <div className="w-12 text-center flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{entry.name?.[0]}{entry.name?.split(" ")[1]?.[0] || ""}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                      {entry.name}
                      {isCurrentUser && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          You
                        </Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{entry.level}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{entry.xp.toLocaleString()} XP</p>
                    <p className="text-xs text-muted-foreground">{entry.streak || 0} day streak</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
      </>
      )}
    </div>
  );
}
