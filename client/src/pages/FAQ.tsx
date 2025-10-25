import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      category: "Getting Started",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click the 'Start Free' button at the top of any page, enter your email and password, and verify your email address. It takes less than 2 minutes!"
        },
        {
          q: "Is DapsiGames really free?",
          a: "Yes! Our core features are completely free forever. This includes the Pomodoro timer, study planner, XP system, leaderboards, and badges. Premium features are available for $5/month."
        },
        {
          q: "What devices can I use DapsiGames on?",
          a: "DapsiGames works on any device with a web browser - desktop, laptop, tablet, or smartphone. You can also install it as a Progressive Web App (PWA) on your device for an app-like experience."
        }
      ]
    },
    {
      category: "Features & Functionality",
      questions: [
        {
          q: "How does the XP system work?",
          a: "You earn XP by completing Pomodoro sessions (50 XP for 25min, 100 XP for 50min) and finishing study tasks (XP value set per task). As you accumulate XP, you level up from Novice to Scholar to Master Learner."
        },
        {
          q: "What badges can I unlock?",
          a: "There are 8+ unique badges including First Focus (complete your first session), Task Master (complete 10 tasks), Streak Star (maintain a 7-day streak), Master Learner (reach 10,000 XP), and more. Badges unlock automatically when you hit milestones."
        },
        {
          q: "How do leaderboards work?",
          a: "Leaderboards rank users by total XP. You can view global rankings or filter by timeframe (all-time, weekly, daily). There's also a friend-only leaderboard to compete with people you know."
        },
        {
          q: "Can I customize the Pomodoro timer?",
          a: "Yes! Choose between 25-minute or 50-minute focus sessions. Premium users get additional customization options and exclusive sound packs."
        }
      ]
    },
    {
      category: "Study Groups & Social Features",
      questions: [
        {
          q: "How do I add friends?",
          a: "Go to the Friends page, search for users by name or email, and send them a friend request. Once they accept, you can see each other on the friend leaderboard and activity feed."
        },
        {
          q: "What are study groups?",
          a: "Study groups let you collaborate with classmates. Create a group for a specific subject or class, invite members, and track collective progress on a group leaderboard."
        }
      ]
    },
    {
      category: "Premium & Pricing",
      questions: [
        {
          q: "What do I get with Premium?",
          a: "Premium ($5/month) includes an ad-free experience, exclusive themes, advanced analytics, cloud sync, priority support, early access to features, custom badge frames, unlimited sound packs, and study report exports."
        },
        {
          q: "Can I cancel Premium anytime?",
          a: "Absolutely! Cancel anytime from your profile settings. You'll keep Premium features until the end of your billing period, then automatically switch to the Free plan with all your data intact."
        },
        {
          q: "Is there a free trial for Premium?",
          a: "Currently, we offer a robust free plan instead of a trial. Try all core features for free, and upgrade to Premium when you're ready for advanced tools."
        }
      ]
    },
    {
      category: "Privacy & Security",
      questions: [
        {
          q: "Is my data safe?",
          a: "Yes! We use industry-standard encryption to protect your data. Your study information is private and we never share it with third parties."
        },
        {
          q: "Can I delete my account?",
          a: "Yes. Go to Profile > Settings and you'll find an option to delete your account. This permanently removes all your data from our servers."
        }
      ]
    },
    {
      category: "Troubleshooting",
      questions: [
        {
          q: "I didn't receive my verification email",
          a: "Check your spam/junk folder. If it's not there, click 'Resend verification email' on the verification page. If you're still having issues, contact us at support@dapsigames.com."
        },
        {
          q: "My XP isn't updating",
          a: "Make sure you're connected to the internet. XP is calculated server-side for security. Refresh the page - your XP should sync automatically. If the issue persists, contact support."
        },
        {
          q: "The timer isn't working",
          a: "Try refreshing the page. Make sure your browser allows JavaScript. If you're using an ad blocker, try disabling it temporarily. Contact support if the problem continues."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="FAQ"
        description="Find answers to frequently asked questions about DapsiGames. Learn about our features, XP system, badges, pricing, study groups, privacy, and more."
        keywords="FAQ, frequently asked questions, help, support, how to use dapsigames, XP system, badges, premium features"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Find quick answers to common questions about DapsiGames
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            {faqs.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">{category.category}</h2>
                <div className="space-y-4">
                  {category.questions.map((faq, qIndex) => {
                    const globalIndex = catIndex * 100 + qIndex;
                    const isOpen = openIndex === globalIndex;
                    return (
                      <div
                        key={qIndex}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <button
                          onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                          className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 hover:bg-muted/50 transition-colors"
                          data-testid={`button-faq-${globalIndex}`}
                        >
                          <span className="font-semibold text-lg">{faq.q}</span>
                          <ChevronDown
                            className={`h-5 w-5 flex-shrink-0 transition-transform ${
                              isOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-6 pb-4 pt-2 text-muted-foreground animate-accordion-down" data-testid={`answer-faq-${globalIndex}`}>
                            {faq.a}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <Link href="/contact">
              <Button size="lg" data-testid="button-contact">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
