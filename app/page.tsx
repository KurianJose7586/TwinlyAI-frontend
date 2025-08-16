"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, MessageSquare, Globe, Code, KeyRound, FileText, Trash } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WebsiteHeader } from "@/components/website-header"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"

export default function LandingPage() {
  const heroAnimation = useScrollAnimation(0.1)
  const howItWorksAnimation = useScrollAnimation(0.1)
  const testimonialsAnimation = useScrollAnimation(0.1)
  const techStackAnimation = useScrollAnimation(0.1)
  const featuresAnimation = useScrollAnimation(0.1)
  const ctaAnimation = useScrollAnimation(0.1)

  return (
    <>
      <WebsiteHeader currentPage="home" />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative px-6 py-24 md:py-32 lg:py-40">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />
          <div
            ref={heroAnimation.ref}
            className={`relative mx-auto max-w-4xl text-center transition-all duration-1000 ease-out ${
              heroAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-6xl lg:text-7xl">
              Create a Personal Chatbot From Your Resume
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
              Upload your resume and get an intelligent AI assistant that knows your career history, ready to be
              embedded on your portfolio.
            </p>
            <div className="mt-10">
              <Button
                asChild
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                data-testid="get-started-button"
              >
                <Link href="/auth">Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div
              ref={howItWorksAnimation.ref}
              className={`text-center mb-16 transition-all duration-800 ease-out ${
                howItWorksAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              <AnimatedHowItWorksCard
                icon={<Upload className="h-8 w-8 text-blue-600" />}
                title="Upload Your Resume"
                description="Simply upload your resume in PDF, DOCX, or TXT format. Our AI will analyze and understand your career history."
                delay={0}
              />
              <AnimatedHowItWorksCard
                icon={<MessageSquare className="h-8 w-8 text-blue-600" />}
                title="AI Learns Your Story"
                description="Our intelligent system processes your experience, skills, and achievements to create a personalized chatbot."
                delay={200}
              />
              <AnimatedHowItWorksCard
                icon={<Globe className="h-8 w-8 text-blue-600" />}
                title="Embed Anywhere"
                description="Get a simple code snippet to embed your AI assistant on your portfolio, website, or anywhere you want."
                delay={400}
              />
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div
              ref={testimonialsAnimation.ref}
              className={`text-center mb-16 transition-all duration-800 ease-out ${
                testimonialsAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Trusted by Developers and PMs Alike</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <AnimatedTestimonialCard
                quote="TwinlyAI is a game-changer. I embedded a chatbot on my portfolio in minutes, and it answers questions about my career with perfect accuracy. The developer API is the cherry on top."
                name="Alex Martinez"
                title="Senior Software Engineer"
                avatar="/professional-male-developer-avatar.png"
                delay={0}
              />
              <AnimatedTestimonialCard
                quote="Finally, a tool that lets me control my own career narrative. The ability to instantly update the bot's knowledge by just re-uploading my resume is incredibly powerful."
                name="Samantha Chen"
                title="Lead Product Manager"
                avatar="/professional-female-product-manager-avatar.png"
                delay={200}
              />
            </div>
          </div>
        </section>

        {/* Technology Stack Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div
              ref={techStackAnimation.ref}
              className={`text-center mb-16 transition-all duration-800 ease-out ${
                techStackAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">Built on a Foundation of Excellence</h2>
            </div>
            <div
              className={`flex justify-center items-center gap-12 flex-wrap transition-all duration-1000 ease-out ${
                techStackAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              }`}
            >
              <TechLogo name="LangChain" />
              <TechLogo name="FAISS" />
              <TechLogo name="OpenAI" />
              <TechLogo name="Groq" />
              <TechLogo name="React" />
            </div>
          </div>
        </section>

        {/* Powerful Features Section */}
        <section className="px-6 py-16 md:py-24">
          <div className="mx-auto max-w-6xl">
            <div
              ref={featuresAnimation.ref}
              className={`text-center mb-16 transition-all duration-800 ease-out ${
                featuresAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
            >
              <h2 className="text-3xl font-bold text-foreground md:text-4xl">
                Everything You Need to Create Your Personal AI
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              <AnimatedFeatureCard
                icon={<Code className="h-12 w-12 text-blue-600" />}
                title="Embeddable Widget"
                description="Easily embed your personal chatbot on your portfolio or website with a simple, secure JavaScript snippet."
                delay={0}
              />
              <AnimatedFeatureCard
                icon={<KeyRound className="h-12 w-12 text-blue-600" />}
                title="Developer API"
                description="Integrate your chatbot into any application with secure, per-user API keys and clear documentation."
                delay={200}
              />
              <AnimatedFeatureCard
                icon={<FileText className="h-12 w-12 text-blue-600" />}
                title="Multiple Formats Supported"
                description="Upload your resume in any format you prefer, including PDF, DOCX, TXT, or even raw JSON."
                delay={400}
              />
              <AnimatedFeatureCard
                icon={<Trash className="h-12 w-12 text-blue-600" />}
                title="You're in Control"
                description="Your data is yours. Instantly re-index, replace, or permanently delete all your resume data at any time."
                delay={600}
              />
            </div>
          </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="px-6 py-16 md:py-24 bg-muted/20">
          <div
            ref={ctaAnimation.ref}
            className={`mx-auto max-w-4xl text-center transition-all duration-1000 ease-out ${
              ctaAnimation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            <h2 className="text-4xl font-bold text-foreground md:text-5xl mb-8">Ready to Build Your AI Assistant?</h2>
            <Button
              asChild
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-xl"
              data-testid="final-cta-button"
            >
              <Link href="/auth">Get Started for Free</Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}

function AnimatedHowItWorksCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  const animation = useScrollAnimation(0.1)

  return (
    <Card
      ref={animation.ref}
      className={`border-border bg-card transition-all duration-800 ease-out ${
        animation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="p-6 text-center">
        <div className="mb-4 flex justify-center">{icon}</div>
        <h3 className="mb-2 text-xl font-semibold text-card-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function AnimatedTestimonialCard({
  quote,
  name,
  title,
  avatar,
  delay,
}: {
  quote: string
  name: string
  title: string
  avatar: string
  delay: number
}) {
  const animation = useScrollAnimation(0.1)

  return (
    <Card
      ref={animation.ref}
      className={`border-border bg-card hover:border-blue-600/50 transition-all duration-800 ease-out ${
        animation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="p-8">
        <blockquote className="text-lg text-card-foreground mb-6 italic leading-relaxed">"{quote}"</blockquote>
        <div className="flex items-center gap-4">
          <Image
            src={avatar || "/placeholder.svg"}
            alt={`${name} avatar`}
            width={60}
            height={60}
            className="rounded-full"
          />
          <div>
            <div className="font-semibold text-card-foreground">{name}</div>
            <div className="text-muted-foreground">{title}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TechLogo({ name }: { name: string }) {
  return (
    <div className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
      <Image
        src={`/abstract-geometric-shapes.png?key=f1fkd&height=60&width=120&query=${name} logo`}
        alt={`${name} logo`}
        width={120}
        height={60}
        className="h-12 w-auto"
      />
    </div>
  )
}

function AnimatedFeatureCard({
  icon,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  title: string
  description: string
  delay: number
}) {
  const animation = useScrollAnimation(0.1)

  return (
    <Card
      ref={animation.ref}
      className={`border-border bg-card transition-all duration-800 ease-out ${
        animation.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <CardContent className="p-8 text-center">
        <div className="mb-6 flex justify-center">{icon}</div>
        <h3 className="mb-4 text-xl font-semibold text-card-foreground">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}
