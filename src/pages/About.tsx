import React from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  ShieldCheck,
  MessageSquare,
  LineChart,
  BookText,
  Users,
  Rocket,
  GraduationCap,
  Globe,
} from "lucide-react"

const About = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Main About Section */}
        <div className="mb-12 overflow-hidden rounded-xl border border-border p-8 bg-gradient-to-br from-[#9945FF]/5 to-[#14F195]/5">
          <div className="flex flex-col items-center text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-gradient">
              About SolStudy
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#9945FF] to-[#14F195] rounded-full mb-8"></div>
            <p className="text-xl max-w-3xl text-foreground">
              Welcome to SolStudy, your premier platform for crypto education.
              We're dedicated to making crypto knowledge accessible to everyone,
              from beginners to advanced traders.
            </p>
          </div>

          {/* Mission Statement */}
          <div className="border border-border rounded-xl p-6 mb-12 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] opacity-70 animate-spin-slow"></div>
                  <div className="relative bg-background p-6 rounded-full z-10">
                    <Rocket className="h-16 w-16 text-foreground" />
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gradient">
                  Our Mission
                </h2>
                <p className="text-foreground/90 text-lg">
                  SolStudy aims to empower individuals with comprehensive
                  knowledge about cryptocurrency, blockchain technology, and
                  trading strategies. We believe in learning at your own pace,
                  with structured courses designed for all skill levels. As part
                  of the growing SocialFiLy ecosystem, we're committed to
                  building a community of informed crypto enthusiasts.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Course Types Section */}
        <div className="mb-12 overflow-hidden rounded-xl border border-border p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
            Our Course Categories
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Blockchain Courses */}
            <div className="border border-border rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-green-400/10 to-emerald-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                  <BookOpen className="h-10 w-10 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Blockchain Fundamentals
                </h3>
                <p className="text-foreground/80">
                  Learn the core concepts of blockchain technology, from basic
                  principles to advanced applications.
                </p>
              </div>
            </div>

            {/* Trading Courses */}
            <div className="border border-border rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-blue-400/10 to-purple-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                  <LineChart className="h-10 w-10 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Trading Strategies
                </h3>
                <p className="text-foreground/80">
                  Master crypto trading with our beginner and advanced trading
                  courses, complete with market analysis techniques.
                </p>
              </div>
            </div>

            {/* DeFi Courses */}
            <div className="border border-border rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-green-400/10 to-emerald-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                  <BookText className="h-10 w-10 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  DeFi Essentials
                </h3>
                <p className="text-foreground/80">
                  Understand decentralized finance platforms, protocols, and how
                  to safely participate in the DeFi ecosystem.
                </p>
              </div>
            </div>

            {/* Security Courses */}
            <div className="border border-border rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-blue-400/10 to-purple-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                  <ShieldCheck className="h-10 w-10 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Crypto Security
                </h3>
                <p className="text-foreground/80">
                  Learn to identify scams and protect your digital assets with
                  advanced security best practices.
                </p>
              </div>
            </div>

            {/* Solana Development */}
            <div className="border border-border rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-green-400/10 to-emerald-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                  <GraduationCap className="h-10 w-10 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Solana Development
                </h3>
                <p className="text-foreground/80">
                  Learn the fundametal theory to build decentralized
                  applications on Solana with our comprehensive development
                  courses.
                </p>
              </div>
            </div>

            {/* NFT Creation */}
            <div className="border border-border rounded-xl p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg bg-gradient-to-br from-blue-400/10 to-purple-500/20">
              <div className="flex flex-col items-center text-center">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full mb-4">
                  <Globe className="h-10 w-10 text-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  NFT Creation
                </h3>
                <p className="text-foreground/80">
                  Future courses will teach you to create, mint, and sell your
                  own NFT collections with our comprehensive course material.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-12 overflow-hidden rounded-xl border border-border p-8">
          <h2 className="text-3xl font-bold mb-8 text-center text-gradient">
            What Sets Us Apart
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col md:flex-row gap-6 border border-border rounded-xl p-6 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full">
                  <BookOpen className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Structured Learning
                </h3>
                <p className="text-foreground/80">
                  Progress through beginner, intermediate, and advanced lessons
                  at your own pace with our carefully structured curriculum.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 border border-border rounded-xl p-6 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full">
                  <LineChart className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Track Progress
                </h3>
                <p className="text-foreground/80">
                  Monitor your learning journey with a personalized dashboard
                  and detailed progress tracking.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 border border-border rounded-xl p-6 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full">
                  <MessageSquare className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Provide Feedback
                </h3>
                <p className="text-foreground/80">
                  Help shape the future of crypto education by providing
                  valuable feedback on course content.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 border border-border rounded-xl p-6 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
              <div className="flex-shrink-0">
                <div className="bg-gradient-to-r from-[#9945FF]/20 to-[#14F195]/20 p-4 rounded-full">
                  <Users className="h-8 w-8 text-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Community Learning
                </h3>
                <p className="text-foreground/80">
                  Join a vibrant community of crypto enthusiasts and learn
                  together through shared experiences.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SocialFiLy Ecosystem Section */}
        <div className="mb-12 overflow-hidden rounded-xl border border-border p-8 bg-gradient-to-br from-[#9945FF]/10 to-[#14F195]/10">
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-4 text-gradient">
                Part of the SocialFiLy Ecosystem
              </h2>
              <p className="text-foreground/90 text-lg mb-6">
                SolStudy is proud to be part of the growing SocialFiLy
                ecosystem. By completing courses and referring others, you can
                earn SOFLY rewards points that will be converted to tokens upon
                SocialFiLy TGE (Token Generation Event).
              </p>
              <p className="text-foreground/90 text-lg mb-6">
                Our integration with the SocialFiLy ecosystem provides you with
                additional benefits and opportunities to participate in a
                growing community of crypto enthusiasts and professionals.
              </p>
              <Button
                className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90 text-white border-0"
                asChild
              >
                <Link to="/">Start Learning Today</Link>
              </Button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#9945FF] to-[#14F195] animate-spin-slow"></div>
                <div className="relative bg-background rounded-full m-1 p-8 z-10">
                  <Rocket className="h-32 w-32 text-foreground" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About
