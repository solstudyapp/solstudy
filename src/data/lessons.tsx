
import { ReactNode } from "react";
import {
  Wallet,
  LineChart,
  BarChart,
  Key,
  Rocket,
  Database,
  BookOpen,
  Lock,
  ShieldCheck,
  Network,
  Code,
  BarChart3,
  Layers,
  Bird,
  Gem,
  PaintBucket,
  Sparkles,
  Share2,
  GraduationCap,
} from "lucide-react";
import { LessonType } from "@/types/lesson";

// Sponsor logos
const COINGECKO_LOGO = "https://static.coingecko.com/s/coingecko-logo-8903d34ce19ca4be1c81f0db30e924154750d208683fad7ae6f2ce06c76d0a56.png";

export const lessonData: LessonType[] = [
  {
    id: "intro-to-blockchain",
    title: "Introduction to Blockchain",
    description: "Learn the fundamentals of blockchain technology and how it works.",
    difficulty: "beginner",
    category: "blockchain",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.7,
    reviewCount: 156,
    icon: <Database size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 100,
  },
  {
    id: "crypto-trading-101",
    title: "Crypto Trading 101",
    description: "Master the basics of cryptocurrency trading and market analysis.",
    difficulty: "beginner",
    category: "trading",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.5,
    reviewCount: 89,
    icon: <LineChart size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 125,
  },
  {
    id: "defi-essentials",
    title: "DeFi Essentials",
    description: "Understand decentralized finance and how to use DeFi platforms.",
    difficulty: "intermediate",
    category: "defi",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.8,
    reviewCount: 132,
    icon: <BarChart size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 150,
  },
  {
    id: "nft-creation",
    title: "NFT Creation Workshop",
    description: "Learn to create, mint, and sell your own NFT collections.",
    difficulty: "intermediate",
    category: "nft",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.6,
    reviewCount: 78,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    icon: <PaintBucket size={24} />,
    points: 175,
  },
  {
    id: "solana-dev",
    title: "Solana Development",
    description: "Build decentralized applications on the Solana blockchain.",
    difficulty: "advanced",
    category: "solana",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.9,
    reviewCount: 64,
    icon: <Code size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 250,
  },
  {
    id: "crypto-security",
    title: "Crypto Security Best Practices",
    description: "Protect your digital assets with advanced security techniques.",
    difficulty: "intermediate",
    category: "blockchain",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.7,
    reviewCount: 112,
    icon: <ShieldCheck size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 150,
  },
  {
    id: "advanced-trading",
    title: "Advanced Trading Strategies",
    description: "Master complex trading strategies used by professional traders.",
    difficulty: "advanced",
    category: "trading",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.4,
    reviewCount: 56,
    icon: <BarChart3 size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 200,
  },
  {
    id: "wallet-management",
    title: "Wallet Management",
    description: "Learn how to manage multiple cryptocurrency wallets securely.",
    difficulty: "beginner",
    category: "blockchain",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.3,
    reviewCount: 94,
    icon: <Wallet size={24} />,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    points: 100,
  },
  {
    id: "solana-token",
    title: "Creating a Solana Token",
    description: "Step-by-step guide to launch your own token on Solana.",
    difficulty: "advanced",
    category: "solana",
    sections: 3,
    pages: 12,
    completedSections: 0,
    rating: 4.8,
    reviewCount: 47,
    sponsored: true,
    sponsorLogo: COINGECKO_LOGO,
    icon: <Sparkles size={24} />,
    points: 300,
  },
];
