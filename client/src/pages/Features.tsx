import { useEffect } from "react";
import { Clock, ListChecks, Trophy, Award, Target, TrendingUp, Users, Calendar, BarChart3, Sparkles, Shield, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Features() {
  useEffect(() => {
    document.title = "Features - DapsiGames | Complete Study Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Discover all the powerful features of DapsiGames: Pomodoro timer, study planner, leaderboards, badges, XP system, and more. Everything you need to excel.");
    }
  }, []);

  const coreFeatures = [
    {
      icon: Clock,
      title: "Pomodoro Focus Timer",
      description: "Stay in the zone with customizable 25 or 50-minute study sessions. Earn XP automatically when you complete a session.",
      benefits: ["Customizable durations", "Automatic XP rewards", "Session history tracking", "Break reminders"]
    },
    {
      icon: ListChecks,
      title: "Smart Study Planner",
      description: "Organize all your tasks by subject, set deadlines, and get XP rewards for completion. Never miss an assignment again.",
      benefits: ["Subject categorization", "Due date tracking", "Priority levels", "Completion rewards"]
    },
    {
      icon: Trophy,
      title: "Global Leaderboards",
      description: "Compete with students worldwide. Filter by all-time, weekly, or daily rankings to see where you stand.",
      benefits: ["Real-time rankings", "Multiple timeframes", "Friend leaderboards", "Achievement tracking"]
    },
    {
      icon: Award,
      title: "Badges & Achievements",
      description: "Unlock 8+ unique badges as you hit milestones. From 'First Focus' to 'Master Learner', celebrate every achievement.",
      benefits: ["8+ unique badges", "Automatic unlocking", "Visual celebrations", "Progress showcase"]
    },
    {
      icon: Target,
      title: "Daily Goals System",
      description: "Set and track your daily and weekly study goals with beautiful visual progress indicators.",
      benefits: ["Custom goal setting", "Visual progress bars", "Streak tracking", "Daily reminders"]
    },
    {
      icon: TrendingUp,
      title: "XP & Leveling System",
      description: "Earn XP for every action. Progress from Novice to Scholar to Master Learner. Level up and show off your dedication.",
      benefits: ["3 tier levels", "XP for all activities", "Level-up celebrations", "Progress visualization"]
    }
  ];

  const additionalFeatures = [
    {
      icon: Users,
      title: "Friend System",
      description: "Connect with study buddies, send friend requests, and compete on friend-only leaderboards."
    },
    {
      icon: Calendar,
      title: "Study Groups",
      description: "Join or create study groups. Collaborate with peers and track group progress together."
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Visualize your weekly progress with detailed charts and activity feeds."
    },
    {
      icon: Sparkles,
      title: "Virtual Store",
      description: "Spend your hard-earned XP on themes, sound packs, and exclusive items."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and secure. We never share your information."
    },
    {
      icon: Zap,
      title: "Progressive Web App",
      description: "Install on any device. Works offline with automatic sync when you're back online."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Everything You Need to Excel
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              A comprehensive suite of tools designed to make studying productive, organized, and genuinely enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Core Features</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The powerful tools that form the foundation of your study success
            </p>
          </div>
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover-elevate transition-all duration-300" data-testid={`card-feature-${index}`}>
                  <CardContent className="p-8">
                    <div className="flex gap-4 mb-4">
                      <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                        <Icon className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-2 ml-[4.5rem]">
                      {feature.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">And Much More</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Additional features that enhance your experience
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {additionalFeatures.map((feature, index) => {
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

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-primary via-secondary to-accent text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Experience All These Features?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Start your journey to better studying today - completely free.
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
