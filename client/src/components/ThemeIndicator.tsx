import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Palette } from "lucide-react";

export function ThemeIndicator() {
  const { user } = useAuth();

  if (!user) return null;

  const activeTheme = (user as any).activeTheme || "default";

  const getThemeName = () => {
    if (activeTheme === "theme_ocean") return "Ocean Breeze";
    if (activeTheme === "theme_sunset") return "Sunset Glow";
    if (activeTheme === "theme_forest") return "Forest Zen";
    if (activeTheme === "theme_galaxy") return "Galaxy Dark";
    return "Default Theme";
  };

  const getThemeColor = () => {
    if (activeTheme === "theme_ocean") return "bg-blue-500/10 text-blue-600 border-blue-500/20";
    if (activeTheme === "theme_sunset") return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    if (activeTheme === "theme_forest") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (activeTheme === "theme_galaxy") return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    return "bg-primary/10 text-primary border-primary/20";
  };

  if (activeTheme === "default") return null;

  return (
    <Badge variant="outline" className={`gap-1 ${getThemeColor()}`} data-testid="badge-active-theme">
      <Palette className="h-3 w-3" />
      {getThemeName()}
    </Badge>
  );
}
