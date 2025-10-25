import { Palette, User, Sparkles, Crown, Zap, Heart, Star, Trophy } from "lucide-react";

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: "theme" | "avatar" | "badge" | "boost";
  price: number;
  icon: any;
  color: string;
  bgColor: string;
  previewImage?: string;
  effect?: string;
}

export const STORE_ITEMS: StoreItem[] = [
  // Themes
  {
    id: "theme_ocean",
    name: "Ocean Breeze",
    description: "Calming blue and teal color scheme perfect for focused study sessions",
    category: "theme",
    price: 500,
    icon: Palette,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    effect: "Changes your dashboard to ocean-inspired colors"
  },
  {
    id: "theme_sunset",
    name: "Sunset Glow",
    description: "Warm orange and pink tones to brighten your study experience",
    category: "theme",
    price: 500,
    icon: Palette,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    effect: "Warm, energizing color palette"
  },
  {
    id: "theme_forest",
    name: "Forest Zen",
    description: "Natural green tones for a peaceful learning environment",
    category: "theme",
    price: 500,
    icon: Palette,
    color: "text-green-500",
    bgColor: "bg-green-500/10",
    effect: "Nature-inspired green theme"
  },
  {
    id: "theme_galaxy",
    name: "Galaxy Dark",
    description: "Deep purple and cosmic vibes for night owls",
    category: "theme",
    price: 750,
    icon: Palette,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    effect: "Premium dark theme with purple accents"
  },
  
  // Avatar Borders
  {
    id: "avatar_gold",
    name: "Golden Frame",
    description: "Prestigious gold border for your profile avatar",
    category: "avatar",
    price: 300,
    icon: Crown,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    effect: "Gold border around your avatar"
  },
  {
    id: "avatar_platinum",
    name: "Platinum Edge",
    description: "Sleek platinum border showing your dedication",
    category: "avatar",
    price: 400,
    icon: Sparkles,
    color: "text-gray-400",
    bgColor: "bg-gray-400/10",
    effect: "Platinum border around your avatar"
  },
  {
    id: "avatar_rainbow",
    name: "Rainbow Aura",
    description: "Animated rainbow border that stands out",
    category: "avatar",
    price: 600,
    icon: Star,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    effect: "Animated rainbow border"
  },
  
  // Special Badges
  {
    id: "badge_vip",
    name: "VIP Scholar",
    description: "Exclusive badge showing your commitment to excellence",
    category: "badge",
    price: 1000,
    icon: Trophy,
    color: "text-yellow-600",
    bgColor: "bg-yellow-600/10",
    effect: "Special VIP badge in your collection"
  },
  {
    id: "badge_legend",
    name: "Study Legend",
    description: "The ultimate badge of a true DapsiGames master",
    category: "badge",
    price: 2000,
    icon: Crown,
    color: "text-purple-600",
    bgColor: "bg-purple-600/10",
    effect: "Legendary status badge"
  },
  
  // XP Boosts
  {
    id: "boost_2x_1h",
    name: "2x XP Boost (1 hour)",
    description: "Double XP for your next hour of study",
    category: "boost",
    price: 200,
    icon: Zap,
    color: "text-yellow-500",
    bgColor: "bg-yellow-500/10",
    effect: "2x XP multiplier for 60 minutes"
  },
  {
    id: "boost_2x_24h",
    name: "2x XP Boost (24 hours)",
    description: "Double XP for a full day of studying",
    category: "boost",
    price: 1500,
    icon: Zap,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
    effect: "2x XP multiplier for 24 hours"
  },
  {
    id: "boost_streak_save",
    name: "Streak Protector",
    description: "Protects your streak if you miss one day",
    category: "boost",
    price: 400,
    icon: Heart,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
    effect: "One-time streak protection"
  },
];

export const CATEGORY_LABELS = {
  theme: "Themes",
  avatar: "Avatar Customization",
  badge: "Special Badges",
  boost: "XP Boosts"
};
