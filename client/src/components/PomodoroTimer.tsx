import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Pause, RotateCcw, Trophy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PomodoroTimerProps {
  onComplete?: (duration: number, xpEarned: number) => void;
}

export function PomodoroTimer({ onComplete }: PomodoroTimerProps) {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  const handleComplete = () => {
    setIsRunning(false);
    const xpEarned = duration === 25 ? 50 : 100;
    
    toast({
      title: "🎉 Session Complete!",
      description: `Great job! You earned ${xpEarned} XP!`,
    });

    if (onComplete) {
      onComplete(duration, xpEarned);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const changeDuration = (newDuration: number) => {
    setDuration(newDuration);
    setTimeLeft(newDuration * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Card className="hover-elevate">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Pomodoro Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Circular Timer Display */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="transition-all duration-1000"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" className="text-primary" style={{ stopColor: "currentColor" }} />
                <stop offset="100%" className="text-secondary" style={{ stopColor: "currentColor" }} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold" data-testid="text-timer-display">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                {isRunning ? "Focus Time" : "Ready"}
              </div>
            </div>
          </div>
        </div>

        {/* Duration Selection */}
        <div className="flex gap-2 justify-center">
          <Button
            variant={duration === 25 ? "default" : "outline"}
            size="sm"
            onClick={() => changeDuration(25)}
            disabled={isRunning}
            data-testid="button-duration-25"
          >
            25 min
          </Button>
          <Button
            variant={duration === 50 ? "default" : "outline"}
            size="sm"
            onClick={() => changeDuration(50)}
            disabled={isRunning}
            data-testid="button-duration-50"
          >
            50 min
          </Button>
        </div>

        {/* Controls */}
        <div className="flex gap-2 justify-center">
          <Button
            onClick={toggleTimer}
            size="lg"
            className="gap-2"
            data-testid="button-timer-toggle"
          >
            {isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-5 w-5" />
                Start
              </>
            )}
          </Button>
          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            className="gap-2"
            data-testid="button-timer-reset"
          >
            <RotateCcw className="h-5 w-5" />
            Reset
          </Button>
        </div>

        {/* XP Info */}
        <div className="text-center text-sm text-muted-foreground">
          Complete this session to earn <strong className="text-primary">{duration === 25 ? 50 : 100} XP</strong>
        </div>
      </CardContent>
    </Card>
  );
}
