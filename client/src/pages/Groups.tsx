import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users2, UserPlus, LogOut, Trophy, Crown } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { 
  getUserGroups,
  getAllGroups,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  getGroupLeaderboard
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function Groups() {
  return (
    <ProtectedRoute>
      <GroupsContent />
    </ProtectedRoute>
  );
}

function GroupsContent() {
  const { user } = useAuth();
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [allGroups, setAllGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [groupLeaderboard, setGroupLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [leaderboardDialogOpen, setLeaderboardDialogOpen] = useState(false);
  const { toast } = useToast();

  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      loadGroups();
    }
  }, [user]);

  const loadGroups = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [myGroupsData, allGroupsData] = await Promise.all([
        getUserGroups(user.id),
        getAllGroups(20)
      ]);
      setMyGroups(myGroupsData);
      setAllGroups(allGroupsData);
    } catch (error) {
      console.error("Failed to load groups:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroup.name.trim()) return;
    try {
      await createStudyGroup(user.id, newGroup.name, newGroup.description);
      toast({
        title: "Group Created!",
        description: `${newGroup.name} has been created successfully`,
      });
      setNewGroup({ name: "", description: "" });
      setDialogOpen(false);
      await loadGroups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async (groupId: string, groupName: string) => {
    if (!user) return;
    try {
      const joined = await joinStudyGroup(user.id, groupId);
      if (joined) {
        toast({
          title: "Joined Group!",
          description: `You are now a member of ${groupName}`,
        });
        await loadGroups();
      } else {
        toast({
          title: "Already a Member",
          description: `You're already in ${groupName}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive",
      });
    }
  };

  const handleLeaveGroup = async (groupId: string, groupName: string) => {
    if (!user) return;
    try {
      await leaveStudyGroup(user.id, groupId);
      toast({
        title: "Left Group",
        description: `You have left ${groupName}`,
      });
      await loadGroups();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive",
      });
    }
  };

  const handleViewLeaderboard = async (group: any) => {
    setSelectedGroup(group);
    try {
      const leaderboard = await getGroupLeaderboard(group.id);
      setGroupLeaderboard(leaderboard);
      setLeaderboardDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group leaderboard",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;
  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  const isInGroup = (groupId: string) => myGroups.some(g => g.id === groupId);

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO
        title="Study Groups"
        description="Join study groups, collaborate with classmates, and track collective progress."
        noindex={true}
      />
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            <Users2 className="h-8 w-8 text-primary" />
            Study Groups
          </h1>
          <p className="text-muted-foreground">
            Join or create study groups to learn together
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-group">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a Study Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="e.g., Computer Science Students"
                  data-testid="input-group-name"
                />
              </div>
              <div>
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="What's this group about?"
                  rows={3}
                  data-testid="input-group-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} disabled={!newGroup.name.trim()} data-testid="button-submit-create-group">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="my-groups" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-groups" data-testid="tab-my-groups">
            My Groups
            {myGroups.length > 0 && (
              <Badge variant="secondary" className="ml-2">{myGroups.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="discover" data-testid="tab-discover">Discover Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="my-groups" className="space-y-4">
          {myGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create a group or join an existing one to start studying together!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myGroups.map((group) => (
                <Card key={group.id} className="hover-elevate">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {group.name}
                          {group.role === "admin" && (
                            <Crown className="h-4 w-4 text-yellow-500" />
                          )}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {group.description || "No description"}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{group.memberCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                      </div>
                      <Badge variant="outline">{group.role || "member"}</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleViewLeaderboard(group)}
                        data-testid={`button-view-leaderboard-${group.id}`}
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Leaderboard
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleLeaveGroup(group.id, group.name)}
                        data-testid={`button-leave-group-${group.id}`}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Leave
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          {allGroups.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No groups available</h3>
                <p className="text-muted-foreground">
                  Be the first to create a study group!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {allGroups.map((group) => {
                const isMember = isInGroup(group.id);
                return (
                  <Card key={group.id} className="hover-elevate">
                    <CardHeader>
                      <CardTitle>{group.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {group.description || "No description"}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-primary">{group.memberCount || 0}</p>
                          <p className="text-xs text-muted-foreground">Members</p>
                        </div>
                        {isMember ? (
                          <Badge variant="secondary">Already a member</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinGroup(group.id, group.name)}
                            data-testid={`button-join-group-${group.id}`}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Join Group
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Group Leaderboard Dialog */}
      <Dialog open={leaderboardDialogOpen} onOpenChange={setLeaderboardDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {selectedGroup?.name} Leaderboard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {groupLeaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No members yet</p>
            ) : (
              groupLeaderboard.map((entry) => {
                const isCurrentUser = entry.id === user.id;
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      isCurrentUser
                        ? "bg-primary/10 border-2 border-primary"
                        : "bg-muted/30"
                    }`}
                  >
                    <div className="w-12 text-center font-bold text-muted-foreground">
                      #{entry.rank}
                    </div>
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {entry.name?.[0]}{entry.name?.split(" ")[1]?.[0] || ""}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold ${isCurrentUser ? "text-primary" : ""}`}>
                        {entry.name}
                        {isCurrentUser && (
                          <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">{entry.level}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{entry.xp?.toLocaleString() || 0} XP</p>
                      {entry.role === "admin" && (
                        <Badge variant="secondary" className="mt-1">Admin</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
