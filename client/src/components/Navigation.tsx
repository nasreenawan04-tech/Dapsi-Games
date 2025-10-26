import { Link, useLocation } from "wouter";
import { Home, LayoutDashboard, Trophy, ListTodo, Award, User, LogOut, Menu, X, Users, Users2, Activity, ShoppingBag, Info, Sparkles, DollarSign, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import logoSvg from "@assets/logo.svg";

function Navigation() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const publicNavItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/features", label: "Features" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
    { href: "/faq", label: "FAQ" },
  ];

  if (!user) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0" data-testid="link-home">
            <img src={logoSvg} alt="DapsiGames Logo" className="h-8 w-8" />
            <span className="hidden sm:inline">DapsiGames</span>
          </Link>

          {/* Desktop Public Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {publicNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    data-testid={`link-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="hidden sm:inline-block">
              <Button variant="ghost" size="sm" data-testid="button-login">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" data-testid="button-signup">
                <span className="hidden sm:inline">Start Free</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t bg-background p-4 animate-slide-up">
            <div className="flex flex-col gap-2">
              {publicNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`link-mobile-${item.label.toLowerCase()}`}
                    >
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
              <div className="border-t my-2" />
              <Link href="/login" className="sm:hidden">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="button-mobile-login"
                >
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    );
  }

  if (!user.emailVerified) {
    return (
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl">
            <img src={logoSvg} alt="DapsiGames Logo" className="h-8 w-8" />
            <span className="hidden sm:inline">DapsiGames</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="gap-2"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>
    );
  }

  const appNavItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/planner", icon: ListTodo, label: "Planner" },
    { href: "/leaderboard", icon: Trophy, label: "Leaderboard" },
    { href: "/rewards", icon: Award, label: "Rewards" },
    { href: "/store", icon: ShoppingBag, label: "Store" },
    { href: "/friends", icon: Users, label: "Friends" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  const moreNavItems = [
    { href: "/groups", icon: Users2, label: "Groups" },
    { href: "/activity", icon: Activity, label: "Activity" },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg sm:text-xl shrink-0" data-testid="link-home">
          <img src={logoSvg} alt="DapsiGames Logo" className="h-8 w-8" />
          <span className="hidden sm:inline">DapsiGames</span>
        </Link>

        {/* Desktop Navigation - Main App Items */}
        <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
          {appNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-1.5"
                  data-testid={`link-${item.label.toLowerCase()}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden xl:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* XP Display - Visible on tablet and up */}
          <div className="hidden md:flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-md bg-primary/10 border border-primary/20">
            <Trophy className="h-4 w-4 text-primary" />
            <span className="font-semibold text-sm" data-testid="text-user-xp">
              {user.xp.toLocaleString()}
            </span>
          </div>

          <ThemeToggle />

          {/* Desktop Logout - Hidden on mobile/tablet */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logout()}
            className="hidden lg:flex gap-2"
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden xl:inline">Logout</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile/Tablet Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t bg-background p-4 animate-slide-up max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col gap-2">
            {/* XP Display - Mobile Only */}
            <div className="md:hidden flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 mb-2">
              <span className="text-sm font-medium">Your XP</span>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="font-bold text-lg text-primary">{user.xp.toLocaleString()}</span>
              </div>
            </div>

            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">MAIN</div>
            {appNavItems.map((item) => {
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
            
            <div className="border-t my-2" />
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">SOCIAL</div>
            {moreNavItems.map((item) => {
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
            
            <div className="border-t my-2" />
            <div className="text-xs font-semibold text-muted-foreground px-2 mb-1">INFO</div>
            {publicNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid={`link-mobile-public-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
            
            <div className="border-t my-2" />
            <Button
              variant="ghost"
              onClick={() => {
                logout();
                setMobileMenuOpen(false);
              }}
              className="w-full justify-start gap-2 text-destructive hover:text-destructive"
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
