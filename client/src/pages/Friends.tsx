import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, UserMinus, UserCheck, UserX, Search, Trophy } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { 
  getFriends, 
  getFriendRequests, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest,
  removeFriend,
  searchUsers
} from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Friends() {
  return (
    <ProtectedRoute>
      <FriendsContent />
    </ProtectedRoute>
  );
}

function FriendsContent() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    try {
      const data = await getFriends(user.id);
      setFriends(data);
    } catch (error) {
      console.error("Failed to load friends:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFriendRequests = async () => {
    if (!user) return;
    try {
      const data = await getFriendRequests(user.id);
      setFriendRequests(data);
    } catch (error) {
      console.error("Failed to load friend requests:", error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    setSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results.filter((u: any) => u.id !== user.id));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to search users",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSendRequest = async (toUserId: string, toUserName: string) => {
    if (!user) return;
    try {
      await sendFriendRequest(user.id, toUserId);
      toast({
        title: "Friend Request Sent",
        description: `Request sent to ${toUserName}`,
      });
      setSearchResults(prev => prev.filter(u => u.id !== toUserId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send friend request",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string, fromUserId: string, fromUserName: string) => {
    if (!user) return;
    try {
      await acceptFriendRequest(requestId, fromUserId, user.id);
      toast({
        title: "Friend Request Accepted",
        description: `You are now friends with ${fromUserName}`,
      });
      await loadFriends();
      await loadFriendRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to accept friend request",
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFriendRequest(requestId);
      toast({
        title: "Friend Request Rejected",
        description: "Request has been declined",
      });
      await loadFriendRequests();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject friend request",
        variant: "destructive",
      });
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!user) return;
    try {
      await removeFriend(user.id, friendId);
      toast({
        title: "Friend Removed",
        description: `${friendName} has been removed from your friends`,
      });
      await loadFriends();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove friend",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;
  if (loading) return <div className="container mx-auto px-4 py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          Friends
        </h1>
        <p className="text-muted-foreground">
          Connect with other students and compete together
        </p>
      </div>

      <Tabs defaultValue="my-friends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="my-friends" data-testid="tab-my-friends">
            My Friends
            {friends.length > 0 && (
              <Badge variant="secondary" className="ml-2">{friends.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="requests" data-testid="tab-requests">
            Requests
            {friendRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">{friendRequests.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="find-friends" data-testid="tab-find-friends">Find Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="my-friends" className="space-y-4">
          {friends.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
                <p className="text-muted-foreground mb-4">
                  Search for other students and send them friend requests!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friends.map((friend) => (
                <Card key={friend.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {friend.name?.[0]}{friend.name?.split(" ")[1]?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{friend.name}</h3>
                        <p className="text-sm text-muted-foreground">{friend.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-medium text-primary flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {friend.xp?.toLocaleString() || 0} XP
                          </span>
                          <Badge variant="outline">{friend.level || "Novice"}</Badge>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveFriend(friend.id, friend.name)}
                        data-testid={`button-remove-friend-${friend.id}`}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          {friendRequests.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No pending requests</h3>
                <p className="text-muted-foreground">
                  You don't have any friend requests at the moment
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {friendRequests.map((request) => (
                <Card key={request.id} className="hover-elevate">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="text-lg">
                          {request.fromUser.name?.[0]}{request.fromUser.name?.split(" ")[1]?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg">{request.fromUser.name}</h3>
                        <p className="text-sm text-muted-foreground">{request.fromUser.email}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm font-medium text-primary flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            {request.fromUser.xp?.toLocaleString() || 0} XP
                          </span>
                          <Badge variant="outline">{request.fromUser.level || "Novice"}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleAcceptRequest(request.id, request.fromUser.id, request.fromUser.name)}
                          data-testid={`button-accept-request-${request.id}`}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectRequest(request.id)}
                          data-testid={`button-reject-request-${request.id}`}
                        >
                          <UserX className="h-4 w-4 mr-2" />
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="find-friends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search for Students</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                    data-testid="input-search-users"
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching} data-testid="button-search">
                  {searching ? "Searching..." : "Search"}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold">Search Results</h3>
                  {searchResults.map((result) => (
                    <div key={result.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {result.name?.[0]}{result.name?.split(" ")[1]?.[0] || ""}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold">{result.name}</p>
                        <p className="text-sm text-muted-foreground">{result.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-medium text-primary flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {result.xp?.toLocaleString() || 0} XP
                          </span>
                          <Badge variant="outline" className="text-xs">{result.level || "Novice"}</Badge>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleSendRequest(result.id, result.name)}
                        data-testid={`button-add-friend-${result.id}`}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
