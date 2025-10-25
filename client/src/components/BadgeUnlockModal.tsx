import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy, Star, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

interface BadgeUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  badgeName: string;
  badgeDescription: string;
  badgeIcon?: any;
}

export function BadgeUnlockModal({
  isOpen,
  onClose,
  badgeName,
  badgeDescription,
  badgeIcon,
}: BadgeUnlockModalProps) {
  const [show, setShow] = useState(false);
  const BadgeIcon = badgeIcon || Trophy;

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      triggerConfetti();
      
      const timer = setTimeout(() => {
        triggerConfetti();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const triggerConfetti = () => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
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
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
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
    });
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md overflow-hidden"
        data-testid="modal-badge-unlock"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-orange-500/20 to-purple-500/20 animate-pulse" />
        
        <DialogHeader className="relative">
          <div className="mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-gradient-to-br from-yellow-400 to-orange-500 p-6 rounded-full">
                <BadgeIcon className="h-16 w-16 text-white animate-bounce" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-400 animate-spin" />
              </div>
              <div className="absolute -bottom-2 -left-2">
                <Star className="h-6 w-6 text-orange-400 animate-pulse" />
              </div>
            </div>
          </div>

          <DialogTitle className="text-center text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
            🎉 Badge Unlocked!
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p className="text-2xl font-bold text-foreground">{badgeName}</p>
            <p className="text-base text-muted-foreground">{badgeDescription}</p>
            <div className="pt-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full border border-primary/30">
                <Trophy className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Achievement Earned</span>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
