import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Trophy, ListTodo, Award, User, LogOut, Menu, X, Users, Users2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl" data-testid="link-home">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
              D
            </div>
            DapsiGames
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" data-testid="button-login">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button data-testid="button-signup">
                Start Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/planner", icon: ListTodo, label: "Planner" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/friends", icon: Users, label: "Friends" },
    { href: "/groups", icon: Users2, label: "Groups" },
    { href: "/activity", icon: Activity, label: "Activity" },
    { href: "/rewards", icon: Award, label: "Rewards" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl" data-testid="link-home">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
              D
            </div>
            DapsiGames
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="gap-2"
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* XP Display */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm" data-testid="text-user-xp">
              {user.xp} XP
            </span>
          </div>

          <ThemeToggle />

          {/* Desktop Logout */}
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="hidden md:flex gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 animate-slide-up">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-${item.label.toLowerCase()}`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2"
              data-testid="button-mobile-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navigation;