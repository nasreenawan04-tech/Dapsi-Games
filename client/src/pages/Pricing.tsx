import { useEffect } from "react";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Footer from "@/components/Footer";

export default function Pricing() {
  useEffect(() => {
    document.title = "Pricing - DapsiGames | Affordable Study Platform";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Choose the perfect plan for your study needs. Start free or upgrade to Premium for $5/month. No hidden fees, cancel anytime.");
    }
  }, []);

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started with gamified studying",
      features: [
        "Unlimited Pomodoro sessions",
        "Study planner with task management",
        "XP & leveling system",
        "Global leaderboards",
        "8+ achievement badges",
        "Friend system",
        "Study groups",
        "Weekly progress tracking",
        "Activity feed"
      ],
      cta: "Start Free",
      ctaLink: "/signup",
      popular: false
    },
    {
      name: "Premium",
      price: "$5",
      period: "per month",
      description: "Unlock the full potential of your study experience",
      features: [
        "Everything in Free, plus:",
        "Ad-free experience",
        "Exclusive premium themes",
        "Advanced analytics & insights",
        "Cloud sync across devices",
        "Priority customer support",
        "Early access to new features",
        "Custom badge frames",
        "Unlimited sound packs",
        "Export study reports"
      ],
      cta: "Upgrade to Premium",
      ctaLink: "/subscribe",
      popular: true
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, cancel anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative hover-elevate transition-all duration-300 ${
                  plan.popular ? "border-2 border-primary shadow-xl" : ""
                }`}
                data-testid={`card-plan-${plan.name.toLowerCase()}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-full text-sm font-semibold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
                  </div>
                )}
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground ml-2">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className={feature.endsWith(":") ? "font-semibold" : ""}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.ctaLink}>
                    <Button
                      className="w-full"
                      size="lg"
                      variant={plan.popular ? "default" : "outline"}
                      data-testid={`button-${plan.name.toLowerCase()}`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Can I upgrade or downgrade anytime?</h3>
                <p className="text-muted-foreground">
                  Yes! You can upgrade to Premium at any time. If you decide to downgrade, you'll keep Premium features until the end of your billing period.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards through Stripe, including Visa, Mastercard, and American Express.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Is there a student discount?</h3>
                <p className="text-muted-foreground">
                  Our pricing is already student-friendly at just $5/month for Premium! We occasionally offer special promotions - follow us on social media to stay updated.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">What happens to my data if I cancel?</h3>
                <p className="text-muted-foreground">
                  Your data is safe! If you cancel Premium, you'll automatically move to the Free plan with all your progress, XP, and badges intact.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
