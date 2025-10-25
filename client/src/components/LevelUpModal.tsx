import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, Star, Sparkles, Zap } from "lucide-react";
import confetti from "canvas-confetti";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: string;
  currentXP: number;
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  currentXP,
}: LevelUpModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      triggerConfetti();
      
      const timer1 = setTimeout(() => {
        triggerConfetti();
      }, 400);
      
      const timer2 = setTimeout(() => {
        triggerConfetti();
      }, 800);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    const count = 250;
    const defaults = {
      origin: { y: 0.6 },
      zIndex: 9999,
    };

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      colors: ['#3b82f6', '#14b8a6', '#8b5cf6'],
    });

    fire(0.2, {
      spread: 60,
      colors: ['#f59e0b', '#ef4444', '#10b981'],
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
      colors: ['#3b82f6', '#14b8a6', '#8b5cf6'],
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      colors: ['#fbbf24', '#ec4899', '#06b6d4'],
    });
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const levelInfo = {
    Novice: { color: "from-gray-400 to-gray-600", emoji: "🌱", next: "Scholar", nextXP: 500 },
    Scholar: { color: "from-blue-400 to-blue-600", emoji: "📚", next: "Master", nextXP: 2000 },
    Master: { color: "from-purple-400 to-purple-600", emoji: "🎓", next: "Legend", nextXP: 5000 },
  };

  const info = levelInfo[newLevel as keyof typeof levelInfo] || levelInfo.Novice;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md overflow-hidden"
        data-testid="modal-level-up"
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${info.color.replace('from-', 'from-').replace('to-', 'to-')}/20 animate-pulse`} />
        
        <DialogHeader className="relative">
          <div className="mx-auto mb-6">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${info.color} rounded-full blur-2xl opacity-50 animate-pulse`} />
              <div className={`relative bg-gradient-to-br ${info.color} p-8 rounded-full`}>
                <TrendingUp className="h-20 w-20 text-white animate-bounce" />
              </div>
              <div className="absolute -top-3 -right-3">
                <Sparkles className="h-10 w-10 text-yellow-400 animate-spin" />
              </div>
              <div className="absolute -bottom-3 -left-3">
                <Star className="h-8 w-8 text-blue-400 animate-pulse" />
              </div>
              <div className="absolute top-0 right-0">
                <Zap className="h-7 w-7 text-yellow-300 animate-ping" />
              </div>
            </div>
          </div>

          <DialogTitle className={`text-center text-4xl font-bold bg-gradient-to-r ${info.color} bg-clip-text text-transparent`}>
            🎊 LEVEL UP! 🎊
          </DialogTitle>
          
          <DialogDescription className="text-center space-y-6 pt-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                You've reached
              </p>
              <p className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
                <span>{info.emoji}</span>
                <span>{newLevel}</span>
                <span>{info.emoji}</span>
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-4 text-lg">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{currentXP}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${info.color.replace('from-', 'from-').replace('to-', 'to-')}/20 rounded-full border-2 ${info.color.replace('from-', 'border-').split(' ')[0]}`}>
                <TrendingUp className="h-5 w-5" />
                <span className="text-base font-bold">Keep Learning, Keep Growing!</span>
              </div>
              
              {newLevel !== "Master" && (
                <p className="text-sm text-muted-foreground">
                  Next level: <span className="font-semibold text-foreground">{info.next}</span> at {info.nextXP} XP
                </p>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
