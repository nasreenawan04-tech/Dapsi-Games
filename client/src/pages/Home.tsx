import { Link, useLocation } from "wouter";
import { Trophy, Clock, ListChecks, Award, Zap, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import Footer from "@/components/Footer";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    document.title = "DapsiGames - Gamified Study Platform | Study Smarter, Play Harder";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Transform your study sessions into an epic adventure with DapsiGames. Earn XP, unlock badges, and compete with students worldwide. Join 10,000+ motivated learners.");
    }
    
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const features = [
    {
      icon: Clock,
      title: "Pomodoro Timer",
      description: "Stay focused with customizable 25 or 50-minute study sessions that automatically reward XP."
    },
    {
      icon: ListChecks,
      title: "Study Planner",
      description: "Organize tasks by subject, set deadlines, and earn XP rewards for completion."
    },
    {
      icon: Trophy,
      title: "Leaderboards",
      description: "Compete with students worldwide and climb the ranks as you earn more XP."
    },
    {
      icon: Award,
      title: "Badges & Rewards",
      description: "Unlock achievements for consistency and milestones. Progress from Novice to Master Learner."
    },
    {
      icon: Target,
      title: "Daily Goals",
      description: "Track your daily and weekly study goals with visual progress indicators."
    },
    {
      icon: TrendingUp,
      title: "XP System",
      description: "Level up your profile and showcase your dedication through gamified progression."
    }
  ];

  const testimonials = [
    {
      quote: "DapsiGames turned studying from a chore into a fun challenge. I'm more motivated than ever!",
      author: "Sarah M."
    },
    {
      quote: "The Pomodoro timer and XP system helped me stay focused and track my progress effectively.",
      author: "James L."
    },
    {
      quote: "Competing on the leaderboard makes studying exciting. I actually look forward to study sessions now!",
      author: "Emma K."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 animate-bounce-subtle">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Join 10,000+ students leveling up their study game</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Study Smarter, Play Harder
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Transform your study sessions into an epic adventure. Earn XP, unlock badges, and compete with students worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-lg px-8 h-14" data-testid="button-hero-signup">
                  <Trophy className="h-5 w-5" />
                  Start Free
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 h-14" data-testid="button-hero-login">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need to Excel</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful tools designed to boost your focus, track your progress, and make learning fun.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Students Are Saying</h2>
            <p className="text-lg text-muted-foreground">Join thousands of motivated learners</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover-elevate">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Trophy key={i} className="h-4 w-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                  <p className="text-sm font-semibold text-muted-foreground">&mdash; {testimonial.author}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Level Up Your Study Game?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join DapsiGames today and turn every study session into progress.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="gap-2 text-lg px-8 h-14" data-testid="button-cta-signup">
                <Award className="h-5 w-5" />
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
