import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Check, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { STORE_ITEMS, CATEGORY_LABELS, StoreItem } from "@/lib/store-items";
import { getUserPurchases, purchaseItem, applyTheme, applyAvatarBorder } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function Store() {
  return (
    <ProtectedRoute>
      <StoreContent />
    </ProtectedRoute>
  );
}

function StoreContent() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPurchases();
    }
  }, [user]);

  const loadPurchases = async () => {
    if (!user) return;
    try {
      const userPurchases = await getUserPurchases(user.id);
      setPurchases(userPurchases);
    } catch (error) {
      console.error("Error loading purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: StoreItem) => {
    if (!user || purchasingItem) return;

    if (purchases.includes(item.id)) {
      toast({
        title: "Already Owned",
        description: "You already own this item!",
        variant: "destructive",
      });
      return;
    }

    if (user.xp < item.price) {
      toast({
        title: "Insufficient XP",
        description: `You need ${item.price - user.xp} more XP to purchase this item.`,
        variant: "destructive",
      });
      return;
    }

    setPurchasingItem(item.id);
    try {
      await purchaseItem(user.id, item.id, item.price);
      await refreshUser();
      await loadPurchases();

      toast({
        title: "Purchase Successful! 🎉",
        description: `You've unlocked ${item.name}!`,
      });

      if (item.category === "theme" || item.category === "avatar") {
        if (item.category === "theme") {
          await applyTheme(user.id, item.id);
        } else {
          await applyAvatarBorder(user.id, item.id);
        }
        await refreshUser();
        
        toast({
          title: "Auto-Applied",
          description: `${item.name} has been applied to your profile!`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to complete purchase",
        variant: "destructive",
      });
    } finally {
      setPurchasingItem(null);
    }
  };

  if (!user || loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading store...</div>
      </div>
    );
  }

  const groupedItems = STORE_ITEMS.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, StoreItem[]>);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <ShoppingBag className="h-8 w-8 text-primary" />
          <h1 className="text-3xl sm:text-4xl font-bold">XP Store</h1>
        </div>
        <p className="text-muted-foreground mb-4">
          Spend your hard-earned XP on exclusive themes, customizations, and boosts!
        </p>
        <Card className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Your Balance</p>
                <p className="text-3xl font-bold text-primary" data-testid="text-xp-balance">
                  {user.xp.toLocaleString()} XP
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Items Owned</p>
                <p className="text-3xl font-bold text-secondary">
                  {purchases.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-8">
          <TabsTrigger value="all" data-testid="tab-all">All Items</TabsTrigger>
          <TabsTrigger value="theme" data-testid="tab-theme">Themes</TabsTrigger>
          <TabsTrigger value="avatar" data-testid="tab-avatar">Avatars</TabsTrigger>
          <TabsTrigger value="badge" data-testid="tab-badge">Badges</TabsTrigger>
          <TabsTrigger value="boost" data-testid="tab-boost">Boosts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-8">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-2xl font-bold mb-4">{CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <StoreItemCard
                    key={item.id}
                    item={item}
                    owned={purchases.includes(item.id)}
                    onPurchase={handlePurchase}
                    isPurchasing={purchasingItem === item.id}
                    userXP={user.xp}
                  />
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {Object.entries(groupedItems).map(([category, items]) => (
          <TabsContent key={category} value={category}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => (
                <StoreItemCard
                  key={item.id}
                  item={item}
                  owned={purchases.includes(item.id)}
                  onPurchase={handlePurchase}
                  isPurchasing={purchasingItem === item.id}
                  userXP={user.xp}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface StoreItemCardProps {
  item: StoreItem;
  owned: boolean;
  onPurchase: (item: StoreItem) => void;
  isPurchasing: boolean;
  userXP: number;
}

function StoreItemCard({ item, owned, onPurchase, isPurchasing, userXP }: StoreItemCardProps) {
  const Icon = item.icon;
  const canAfford = userXP >= item.price;

  return (
    <Card
      className={`hover-elevate transition-all ${
        owned ? "border-green-500 bg-green-500/5" : ""
      }`}
      data-testid={`card-store-item-${item.id}`}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className={`p-3 rounded-lg ${item.bgColor}`}>
            <Icon className={`h-6 w-6 ${item.color}`} />
          </div>
          {owned && (
            <Badge className="bg-green-500 hover:bg-green-600" data-testid={`badge-owned-${item.id}`}>
              <Check className="h-3 w-3 mr-1" />
              Owned
            </Badge>
          )}
          {!owned && !canAfford && (
            <Badge variant="secondary">
              <Lock className="h-3 w-3 mr-1" />
              Locked
            </Badge>
          )}
        </div>
        <CardTitle className="mt-4">{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Price</span>
            <span className="text-lg font-bold text-primary">
              {item.price.toLocaleString()} XP
            </span>
          </div>
          {item.effect && (
            <p className="text-xs text-muted-foreground border-t pt-2">
              ✨ {item.effect}
            </p>
          )}
          <Button
            className="w-full"
            onClick={() => onPurchase(item)}
            disabled={owned || isPurchasing || !canAfford}
            variant={owned ? "secondary" : "default"}
            data-testid={`button-purchase-${item.id}`}
          >
            {owned ? "Owned" : isPurchasing ? "Purchasing..." : `Buy for ${item.price} XP`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
