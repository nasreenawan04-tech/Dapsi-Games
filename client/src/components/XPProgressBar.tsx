import { Trophy } from "lucide-react";

interface XPProgressBarProps {
  currentXP: number;
  level: string;
  className?: string;
}

const LEVEL_THRESHOLDS = {
  Novice: 0,
  Scholar: 500,
  Master: 2000,
};

export function XPProgressBar({ currentXP, level, className = "" }: XPProgressBarProps) {
  const getLevelInfo = () => {
    if (currentXP < LEVEL_THRESHOLDS.Scholar) {
      return {
        current: "Novice",
        next: "Scholar",
        progress: (currentXP / LEVEL_THRESHOLDS.Scholar) * 100,
        xpToNext: LEVEL_THRESHOLDS.Scholar - currentXP,
      };
    } else if (currentXP < LEVEL_THRESHOLDS.Master) {
      return {
        current: "Scholar",
        next: "Master",
        progress: ((currentXP - LEVEL_THRESHOLDS.Scholar) / (LEVEL_THRESHOLDS.Master - LEVEL_THRESHOLDS.Scholar)) * 100,
        xpToNext: LEVEL_THRESHOLDS.Master - currentXP,
      };
    } else {
      return {
        current: "Master",
        next: "Master",
        progress: 100,
        xpToNext: 0,
      };
    }
  };

  const levelInfo = getLevelInfo();

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-primary" />
          <span className="font-semibold">{levelInfo.current}</span>
        </div>
        {levelInfo.xpToNext > 0 && (
          <span className="text-muted-foreground">
            {levelInfo.xpToNext} XP to {levelInfo.next}
          </span>
        )}
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-accent rounded-full transition-all duration-500"
          style={{ width: `${Math.min(levelInfo.progress, 100)}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground text-center" data-testid="text-xp-display">
        {currentXP.toLocaleString()} Total XP
      </div>
    </div>
  );
}
