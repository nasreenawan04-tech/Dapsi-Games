import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface UserAvatarProps {
  className?: string;
  showBorder?: boolean;
}

export function UserAvatar({ className = "", showBorder = true }: UserAvatarProps) {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? `${user.name[0]}${user.name.split(" ")[1]?.[0] || ""}`
    : "U";

  const getBorderStyle = () => {
    if (!showBorder) return "";
    
    const avatarBorder = (user as any).avatarBorder || "";
    
    if (avatarBorder === "avatar_gold") {
      return "ring-4 ring-yellow-500 ring-offset-2";
    } else if (avatarBorder === "avatar_platinum") {
      return "ring-4 ring-gray-400 ring-offset-2";
    } else if (avatarBorder === "avatar_rainbow") {
      return "ring-4 ring-offset-2 animate-gradient-border";
    }
    
    return "";
  };

  return (
    <Avatar className={`${className} ${getBorderStyle()}`} data-testid="avatar-user">
      <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground font-bold">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
