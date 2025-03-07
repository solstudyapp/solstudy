
import { Section } from "@/types/lesson";

// Map of lesson sections by lesson ID
export const sectionsByLesson: Record<string, Section[]> = {
  "intro-to-blockchain": [
    {
      id: "section1",
      title: "Getting Started",
      pages: [
        { id: "page1", title: "Introduction", content: "<h1>Welcome to this lesson!</h1><p>In this section, you'll learn the basics of cryptocurrency and blockchain technology.</p>" },
        { id: "page2", title: "What is Blockchain?", content: "<h1>Blockchain Technology</h1><p>Blockchain is a distributed ledger technology that enables secure, transparent, and immutable record-keeping without central authority.</p>" },
        { id: "page3", title: "Key Concepts", content: "<h1>Key Blockchain Concepts</h1><p>Let's explore decentralization, consensus mechanisms, and cryptographic security - the foundations of blockchain technology.</p>" },
        { id: "page4", title: "History of Blockchain", content: "<h1>A Brief History</h1><p>From Bitcoin's creation in 2009 to the modern blockchain ecosystem - understanding how we got here helps predict where we're going.</p>" },
      ],
      quizId: "quiz-section1"
    },
    {
      id: "section2",
      title: "Core Components",
      pages: [
        { id: "page5", title: "Cryptography Basics", content: "<h1>Cryptography in Blockchain</h1><p>Public/private keys, hash functions, and digital signatures are the building blocks of blockchain security.</p>" },
        { id: "page6", title: "Consensus Mechanisms", content: "<h1>How Blockchains Agree</h1><p>Proof of Work, Proof of Stake, and other mechanisms ensure that all participants can trust the blockchain's state.</p>" },
        { id: "page7", title: "Transactions & Blocks", content: "<h1>The Anatomy of Blockchain</h1><p>Understanding how transactions are created, validated, and permanently recorded in blocks.</p>" },
        { id: "page8", title: "Smart Contracts", content: "<h1>Self-Executing Agreements</h1><p>Smart contracts are programs stored on the blockchain that run when predetermined conditions are met.</p>" },
      ],
      quizId: "quiz-section2"
    },
    {
      id: "section3",
      title: "Applications & Future",
      pages: [
        { id: "page9", title: "DeFi Overview", content: "<h1>Decentralized Finance</h1><p>DeFi aims to recreate and improve traditional financial systems using blockchain technology.</p>" },
        { id: "page10", title: "NFTs Explained", content: "<h1>Non-Fungible Tokens</h1><p>NFTs represent unique digital assets, enabling new forms of digital ownership and creator economies.</p>" },
        { id: "page11", title: "DAOs & Governance", content: "<h1>Decentralized Autonomous Organizations</h1><p>DAOs enable community governance of blockchain protocols and projects through token voting.</p>" },
        { id: "page12", title: "Future Trends", content: "<h1>Where Blockchain Is Heading</h1><p>Scalability solutions, institutional adoption, and emerging use cases are shaping the future of blockchain.</p>" },
      ],
      quizId: "quiz-section3"
    }
  ],
  "crypto-trading-101": [
    {
      id: "section1",
      title: "Trading Fundamentals",
      pages: [
        { id: "page1", title: "Introduction to Trading", content: "<h1>Welcome to Crypto Trading 101!</h1><p>This course covers the essentials of cryptocurrency trading for beginners.</p>" },
        { id: "page2", title: "Market Basics", content: "<h1>Understanding Markets</h1><p>Learn about order books, market makers, and how cryptocurrency exchanges work.</p>" },
        { id: "page3", title: "Trading Psychology", content: "<h1>The Trader's Mindset</h1><p>Discover the psychological factors that impact trading decisions and how to manage them.</p>" },
      ],
      quizId: "quiz-trading-section1"
    },
    {
      id: "section2",
      title: "Technical Analysis",
      pages: [
        { id: "page4", title: "Chart Reading", content: "<h1>Chart Patterns</h1><p>Learn to identify common chart patterns that can signal future price movements.</p>" },
        { id: "page5", title: "Indicators", content: "<h1>Technical Indicators</h1><p>Explore tools like RSI, MACD, and moving averages to inform your trading decisions.</p>" },
      ],
      quizId: "quiz-trading-section2"
    },
    {
      id: "section3",
      title: "Risk Management",
      pages: [
        { id: "page6", title: "Position Sizing", content: "<h1>Sizing Your Trades</h1><p>Learn how to determine appropriate position sizes to manage risk effectively.</p>" },
        { id: "page7", title: "Stop Losses", content: "<h1>Protecting Your Capital</h1><p>Discover strategies for setting stop-losses to minimize potential losses.</p>" },
      ],
      quizId: "quiz-trading-section3"
    }
  ],
  // Default empty sections for other lessons - would be filled with actual content in production
  "default": [
    {
      id: "section1",
      title: "Section 1",
      pages: [
        { id: "page1", title: "Introduction", content: "<h1>Welcome to this lesson!</h1><p>This is an introduction to the course material.</p>" },
      ],
      quizId: "quiz-section1"
    },
    {
      id: "section2",
      title: "Section 2",
      pages: [
        { id: "page2", title: "Getting Started", content: "<h1>Getting Started</h1><p>Let's begin exploring this fascinating topic.</p>" },
      ],
      quizId: "quiz-section2"
    },
    {
      id: "section3",
      title: "Section 3",
      pages: [
        { id: "page3", title: "Advanced Concepts", content: "<h1>Advanced Concepts</h1><p>Now let's dive into more complex ideas.</p>" },
      ],
      quizId: "quiz-section3"
    }
  ]
};

// Helper function to get sections for a lesson
export const getSectionsForLesson = (lessonId: string): Section[] => {
  return sectionsByLesson[lessonId] || sectionsByLesson.default;
};
