import { Users, Target, Heart, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

export default function About() {

  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "We're committed to making education engaging and accessible for every student."
    },
    {
      icon: Heart,
      title: "Student-Focused",
      description: "Every feature we build is designed with student success and wellbeing in mind."
    },
    {
      icon: Rocket,
      title: "Innovation First",
      description: "We continuously push boundaries to create cutting-edge learning experiences."
    },
    {
      icon: Users,
      title: "Community Powered",
      description: "Built by learners, for learners. Your feedback shapes our platform."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title="About Us"
        description="Learn about DapsiGames' mission to revolutionize education through gamification. We're helping over 10,000 students worldwide transform studying into an engaging, productive adventure."
        keywords="about dapsigames, gamified learning mission, educational technology, student success platform"
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              About DapsiGames
            </h1>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              We're on a mission to revolutionize how students learn by making studying as engaging as gaming.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none">
              <p className="text-lg text-muted-foreground mb-6">
                DapsiGames was born from a simple observation: students spend hours playing games,
                but often struggle to find the same motivation for studying. We asked ourselves,
                "What if we could bring that same level of engagement to education?"
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                Founded in 2024, DapsiGames combines proven study techniques like the Pomodoro method
                with gamification elements that keep students motivated. Our platform transforms
                studying from a tedious task into an exciting journey of progress and achievement.
              </p>
              <p className="text-lg text-muted-foreground">
                Today, we're proud to serve over 10,000 students worldwide, helping them achieve
                their academic goals while maintaining a healthy, balanced approach to learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 sm:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="hover-elevate transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <div className="h-14 w-14 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 mx-auto">
                      <Icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">Our Team</h2>
            <p className="text-lg text-muted-foreground mb-12">
              DapsiGames is built by a passionate team of educators, developers, and designers
              who believe in the power of gamification to transform education. We're students
              ourselves, which means we understand your challenges firsthand.
            </p>
            <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 rounded-lg p-8">
              <p className="text-xl font-semibold mb-4">
                Interested in joining our mission?
              </p>
              <p className="text-muted-foreground">
                We're always looking for talented individuals who share our passion for education.
                Reach out to us at{" "}
                <a href="mailto:careers@dapsigames.com" className="text-primary hover:underline">
                  careers@dapsigames.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
