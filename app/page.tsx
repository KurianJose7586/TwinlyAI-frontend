"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Upload, MessageSquare, Globe, Code, KeyRound, FileText, Trash } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { WebsiteHeader } from "@/components/website-header"
import { GradientButton } from "@/components/ui/gradient-button"
import LightRays from "@/components/light-rays"
import { Card, CardContent } from "@/components/ui/card"
import { motion, useScroll, useTransform, Variants } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// --- ANIMATION VARIANTS ---
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: "easeOut" } 
  }
}

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Delay between each child animation
      delayChildren: 0.1
    }
  }
}

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" }
  }
}

export default function LandingPage() {
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false)

  // --- PARALLAX SETUP ---
  const containerRef = useRef(null)
  const { scrollY } = useScroll()
  
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200])
  const logoY = useTransform(scrollY, [0, 1000], [0, 150])
  
  // Note: We apply this scroll-fade to the wrapper, so the inner entrance animations can run independently
  const scrollFadeOpacity = useTransform(scrollY, [0, 400], [1, 0])

  return (
    <div ref={containerRef} className="relative bg-[#050505] overflow-x-hidden text-white selection:bg-blue-500/30">
      <WebsiteHeader currentPage="home" />
      
      {/* --- GLOBAL FIXED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Static Lights */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[600px] bg-blue-600/10 blur-[120px] rounded-full" />
            <div className="absolute inset-0 mix-blend-screen opacity-40">
              <LightRays
                raysOrigin="top-center"
                raysColor="#ffffff"
                raysSpeed={0.2}
                lightSpread={10}
                rayLength={0.8}
                followMouse={true}
                mouseInfluence={0.1}
                noiseAmount={0.02}
                distortion={0.02}
                pulsating={false}
                className="custom-rays"
              />
            </div>
        </div>

        {/* Moving Grid */}
        <motion.div 
          style={{ y: backgroundY }}
          className="absolute inset-0 z-0"
        >
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `linear-gradient(to right, #333 1px, transparent 1px),
                                linear-gradient(to bottom, #333 1px, transparent 1px)`,
              backgroundSize: '4rem 4rem',
              maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' 
            }}
          />
        </motion.div>
      </div>

      <main className="relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 mt-16">
            <div className="grid lg:grid-cols-12 items-center">
              
              {/* --- Left Column: Text Content --- */}
              {/* Wrapper handles Scroll Fade-out */}
              <motion.div
                style={{ opacity: scrollFadeOpacity }}
                className="lg:col-span-8 relative z-20 flex flex-col items-center lg:items-start text-center lg:text-left"
              >
                {/* Inner Motion handles Entrance Animation */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={staggerContainer} // Stagger the title, text, and button
                >
                  <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tighter text-white leading-[1.1]">
                    No More Keyword <br /> Matching.
                    <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 pb-2">
                      Start Semantic Recruiting
                    </span>
                  </motion.h1>
                  
                  <motion.p variants={fadeInUp} className="mt-8 text-lg text-gray-400 max-w-2xl font-light leading-relaxed">
                    Upload your resume and get an intelligent AI assistant that knows your career history, ready to be
                    embedded on your portfolio.
                  </motion.p>
                  
                  <motion.div variants={fadeInUp} className="mt-10">
                    <GradientButton asChild variant="variant">
                      <Link href="/auth">Get Started for Free</Link>
                    </GradientButton>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* --- Right Column: Butterfly Logo --- */}
              <motion.div 
                style={{ y: logoY, opacity: scrollFadeOpacity }} 
                className="lg:col-span-4 relative flex justify-center items-center mt-12 lg:mt-0 lg:-ml-40 z-10"
              >
                {/* Entrance Animation for Logo */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                  onClick={() => setIsLogoModalOpen(true)}
                  className="relative w-[300px] sm:w-[400px] lg:w-[650px] h-auto drop-shadow-2xl cursor-pointer hover:scale-105 transition-transform duration-500 ease-out"
                >
                  {/* Glow Orb */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-blue-600/20 blur-[90px] rounded-full pointer-events-none" />
                  
                  <Image 
                    src="/butterfly1000.png" 
                    alt="TwinlyAI Butterfly Logo"
                    width={800}
                    height={800}
                    className="object-contain"
                    priority
                    unoptimized
                  />
                </motion.div>
              </motion.div>

            </div>
          </div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{ opacity: scrollFadeOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500"
          >
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-[1px] h-12 bg-gradient-to-b from-gray-500 to-transparent" />
          </motion.div>
        </section>

        {/* --- How It Works Section --- */}
        <section className="px-6 py-24 relative z-20">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white md:text-4xl">How It Works</h2>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-3"
            >
              <FeatureCard
                icon={<Upload className="h-8 w-8 text-blue-500" />}
                title="Upload Your Resume"
                description="Simply upload your resume in PDF, DOCX, or TXT format. Our AI will analyze and understand your career history."
              />
              <FeatureCard
                icon={<MessageSquare className="h-8 w-8 text-blue-500" />}
                title="AI Learns Your Story"
                description="Our intelligent system processes your experience, skills, and achievements to create a personalized chatbot."
              />
              <FeatureCard
                icon={<Globe className="h-8 w-8 text-blue-500" />}
                title="Embed Anywhere"
                description="Get a simple code snippet to embed your AI assistant on your portfolio, website, or anywhere you want."
              />
            </motion.div>
          </div>
        </section>

        {/* --- Testimonials Section --- */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white md:text-4xl">Trusted by Developers and PMs Alike</h2>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-2"
            >
              <TestimonialCard
                quote="TwinlyAI is a game-changer. I embedded a chatbot on my portfolio in minutes, and it answers questions about my career with perfect accuracy."
                name="Alex Martinez"
                title="Senior Software Engineer"
                avatar="/professional-male-developer-avatar.png"
              />
              <TestimonialCard
                quote="Finally, a tool that lets me control my own career narrative. The ability to instantly update the bot's knowledge by just re-uploading my resume is incredibly powerful."
                name="Samantha Chen"
                title="Lead Product Manager"
                avatar="/professional-female-product-manager-avatar.png"
              />
            </motion.div>
          </div>
        </section>

        {/* --- Tech Stack Section --- */}
        <section className="px-6 py-24 border-y border-white/5 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white md:text-4xl">Built on a Foundation of Excellence</h2>
            </motion.div>
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="flex justify-center items-center gap-12 flex-wrap"
            >
              <TechLogo name="LangChain" />
              <TechLogo name="FAISS" />
              <TechLogo name="OpenAI" />
              <TechLogo name="Groq" />
              <TechLogo name="React" />
            </motion.div>
          </div>
        </section>

        {/* --- Features Grid --- */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl font-bold text-white md:text-4xl">
                Everything You Need to Create Your Personal AI
              </h2>
            </motion.div>
            
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid gap-8 md:grid-cols-2"
            >
              <FeatureCardBig
                icon={<Code className="h-10 w-10 text-blue-500" />}
                title="Embeddable Widget"
                description="Easily embed your personal chatbot on your portfolio or website with a simple, secure JavaScript snippet."
              />
              <FeatureCardBig
                icon={<KeyRound className="h-10 w-10 text-blue-500" />}
                title="Developer API"
                description="Integrate your chatbot into any application with secure, per-user API keys and clear documentation."
              />
              <FeatureCardBig
                icon={<FileText className="h-10 w-10 text-blue-500" />}
                title="Multiple Formats Supported"
                description="Upload your resume in any format you prefer, including PDF, DOCX, TXT, or even raw JSON."
              />
              <FeatureCardBig
                icon={<Trash className="h-10 w-10 text-blue-500" />}
                title="You're in Control"
                description="Your data is yours. Instantly re-index, replace, or permanently delete all your resume data at any time."
              />
            </motion.div>
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="px-6 py-32 bg-gradient-to-b from-transparent to-blue-900/40 relative z-20">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="text-4xl font-bold text-white md:text-6xl mb-8 tracking-tighter">Ready to Build Your AI Assistant?</h2>
            <GradientButton asChild variant="variant">
              <Link href="/auth">Get Started for Free</Link>
            </GradientButton>
          </motion.div>
        </section>
      </main>

{/* --- UPDATED LOGO MODAL --- */}
      <Dialog open={isLogoModalOpen} onOpenChange={setIsLogoModalOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0A0A0A] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-2">The Twinly Butterfly: The Story of Two</DialogTitle>
            <DialogDescription className="text-gray-400 text-base leading-relaxed">
              At first glance, it appears to be a butterfly taking flight. <strong>But look closer.</strong>
              <br/><br/>
              The wings are formed by two stylized embryos facing each other, symbolizing the <strong>genesis of your Digital Twin</strong>.
              <br/><br/>
              This emblem represents the core mission of TwinlyAI: we don't just host your resume; we birth a living, breathing AI counterpart from your data. It represents the perfect symmetry between you and your AI, working together to advance your career.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-6">
             <Image 
                src="/butterfly1000.png" 
                alt="TwinlyAI Butterfly Logo"
                width={180}
                height={180}
                className="opacity-100 drop-shadow-[0_0_30px_rgba(59,130,246,0.3)]"
             />
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}

// --- HELPER COMPONENTS (Now wrapped with Motion variants) ---

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-white/10 bg-zinc-900/80 backdrop-blur-md hover:border-blue-500/30 transition-colors h-full">
        <CardContent className="p-6 text-center h-full flex flex-col items-center">
          <div className="mb-4 flex justify-center p-3 bg-blue-500/10 rounded-full w-fit">{icon}</div>
          <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-400">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function FeatureCardBig({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-white/10 bg-zinc-900/80 backdrop-blur-md transition-colors hover:bg-zinc-900/90 h-full">
        <CardContent className="p-8 text-center h-full flex flex-col items-center">
          <div className="mb-6 flex justify-center p-4 bg-blue-500/10 rounded-2xl w-fit">{icon}</div>
          <h3 className="mb-4 text-xl font-semibold text-white">{title}</h3>
          <p className="text-gray-400 leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TestimonialCard({ quote, name, title, avatar }: { quote: string; name: string; title: string; avatar: string }) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="border-white/10 bg-zinc-900/80 backdrop-blur-md hover:border-blue-600/50 transition-colors h-full">
        <CardContent className="p-8 h-full flex flex-col justify-between">
          <blockquote className="text-lg text-gray-300 mb-6 italic leading-relaxed">"{quote}"</blockquote>
          <div className="flex items-center gap-4">
            <Image
              src={avatar || "/placeholder.svg"}
              alt={`${name} avatar`}
              width={60}
              height={60}
              className="rounded-full border-2 border-blue-500/20"
            />
            <div>
              <div className="font-semibold text-white">{name}</div>
              <div className="text-gray-500">{title}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function TechLogo({ name }: { name: string }) {
  return (
    <motion.div variants={fadeInUp} className="grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 brightness-200 contrast-0 hover:contrast-100">
      <Image
        src={`/abstract-geometric-shapes.png?key=f1fkd&height=60&width=120&query=${name} logo`}
        alt={`${name} logo`}
        width={120}
        height={60}
        className="h-12 w-auto"
      />
    </motion.div>
  )
}