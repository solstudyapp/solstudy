
import {
  Wallet,
  LineChart,
  BarChart,
  Key,
  Rocket,
  Database,
  BookOpen,
  LucideIcon,
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
import { Section } from "@/types/lesson";

// Define section content for each lesson
export const lessonSections: Record<string, Section[]> = {
  "intro-to-blockchain": [
    {
      id: "intro-section1",
      title: "Getting Started",
      pages: [
        { id: "intro-page1", title: "Introduction", content: "<h1>Welcome to Blockchain Fundamentals!</h1><p>In this section, you'll learn the basics of cryptocurrency and blockchain technology.</p>" },
        { id: "intro-page2", title: "What is Blockchain?", content: "<h1>Blockchain Technology</h1><p>Blockchain is a distributed ledger technology that enables secure, transparent, and immutable record-keeping without central authority.</p>" },
        { id: "intro-page3", title: "Key Concepts", content: "<h1>Key Blockchain Concepts</h1><p>Let's explore decentralization, consensus mechanisms, and cryptographic security - the foundations of blockchain technology.</p>" },
        { id: "intro-page4", title: "History of Blockchain", content: "<h1>A Brief History</h1><p>From Bitcoin's creation in 2009 to the modern blockchain ecosystem - understanding how we got here helps predict where we're going.</p>" },
      ],
      quiz: { 
        id: "intro-section1-quiz", 
        title: "Getting Started Quiz", 
        questions: [
          {
            id: "s1q1",
            text: "What is the main purpose of blockchain technology?",
            options: [
              "To create cryptocurrencies only",
              "To enable secure, transparent record-keeping without central authority",
              "To replace traditional banking systems entirely",
              "To make database queries faster"
            ],
            correctOptionIndex: 1
          },
          {
            id: "s1q2",
            text: "When was Bitcoin created?",
            options: [
              "2005",
              "2007",
              "2009",
              "2013"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "intro-section2",
      title: "Core Components",
      pages: [
        { id: "intro-page5", title: "Cryptography Basics", content: "<h1>Cryptography in Blockchain</h1><p>Public/private keys, hash functions, and digital signatures are the building blocks of blockchain security.</p>" },
        { id: "intro-page6", title: "Consensus Mechanisms", content: "<h1>How Blockchains Agree</h1><p>Proof of Work, Proof of Stake, and other mechanisms ensure that all participants can trust the blockchain's state.</p>" },
        { id: "intro-page7", title: "Transactions & Blocks", content: "<h1>The Anatomy of Blockchain</h1><p>Understanding how transactions are created, validated, and permanently recorded in blocks.</p>" },
        { id: "intro-page8", title: "Smart Contracts", content: "<h1>Self-Executing Agreements</h1><p>Smart contracts are programs stored on the blockchain that run when predetermined conditions are met.</p>" },
      ],
      quiz: { 
        id: "intro-section2-quiz", 
        title: "Core Components Quiz", 
        questions: [
          {
            id: "s2q1",
            text: "What does a hash function do in blockchain?",
            options: [
              "Encrypts user passwords only",
              "Creates a unique, fixed-size output from input data",
              "Mines new cryptocurrencies",
              "Connects blocks in sequential order"
            ],
            correctOptionIndex: 1
          },
          {
            id: "s2q2",
            text: "What is a smart contract?",
            options: [
              "A legal agreement about blockchain usage",
              "A standard cryptocurrency transaction",
              "Self-executing code that runs when predefined conditions are met",
              "A secure wallet for storing cryptocurrency"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "intro-section3",
      title: "Applications & Future",
      pages: [
        { id: "intro-page9", title: "DeFi Overview", content: "<h1>Decentralized Finance</h1><p>DeFi aims to recreate and improve traditional financial systems using blockchain technology.</p>" },
        { id: "intro-page10", title: "NFTs Explained", content: "<h1>Non-Fungible Tokens</h1><p>NFTs represent unique digital assets, enabling new forms of digital ownership and creator economies.</p>" },
        { id: "intro-page11", title: "DAOs & Governance", content: "<h1>Decentralized Autonomous Organizations</h1><p>DAOs enable community governance of blockchain protocols and projects through token voting.</p>" },
        { id: "intro-page12", title: "Future Trends", content: "<h1>Where Blockchain Is Heading</h1><p>Scalability solutions, institutional adoption, and emerging use cases are shaping the future of blockchain.</p>" },
      ],
      quiz: { 
        id: "intro-section3-quiz", 
        title: "Applications & Future Quiz", 
        questions: [
          {
            id: "s3q1",
            text: "What is DeFi?",
            options: [
              "Digital finance software",
              "A type of cryptocurrency",
              "Decentralized finance applications built on blockchain",
              "Department of Financial Investigation"
            ],
            correctOptionIndex: 2
          },
          {
            id: "s3q2",
            text: "What does NFT stand for?",
            options: [
              "New Financial Transaction",
              "Non-Fungible Token",
              "Network File Transfer",
              "National Fintech Technology"
            ],
            correctOptionIndex: 1
          }
        ],
        rewardPoints: 20
      }
    }
  ],
  "crypto-trading-101": [
    {
      id: "trading-section1",
      title: "Trading Fundamentals",
      pages: [
        { id: "trading-page1", title: "Introduction to Trading", content: "<h1>Welcome to Crypto Trading 101!</h1><p>In this course, you'll learn the essentials of cryptocurrency trading and market analysis.</p>" },
        { id: "trading-page2", title: "Market Basics", content: "<h1>Understanding Crypto Markets</h1><p>Learn about exchanges, order books, trading pairs, and market capitalization.</p>" },
        { id: "trading-page3", title: "Types of Orders", content: "<h1>Order Types Explained</h1><p>Explore market, limit, stop, and other order types that will help you trade effectively.</p>" },
        { id: "trading-page4", title: "Reading Charts", content: "<h1>Chart Analysis Basics</h1><p>Learn how to read candlestick charts and understand basic price action patterns.</p>" },
      ],
      quiz: { 
        id: "trading-section1-quiz", 
        title: "Trading Fundamentals Quiz", 
        questions: [
          {
            id: "t1q1",
            text: "What is a market order?",
            options: [
              "An order to buy/sell at a specific price",
              "An order to buy/sell at the best available current price",
              "An order that executes only when certain conditions are met",
              "A subscription to market data"
            ],
            correctOptionIndex: 1
          },
          {
            id: "t1q2",
            text: "What does 'trading volume' represent?",
            options: [
              "The total number of traders active in a market",
              "The price difference between buy and sell orders",
              "The amount of an asset traded during a specific period",
              "The maximum amount you can trade on an exchange"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "trading-section2",
      title: "Technical Analysis",
      pages: [
        { id: "trading-page5", title: "Trend Analysis", content: "<h1>Identifying Market Trends</h1><p>Learn how to identify bullish and bearish trends and understand market cycles.</p>" },
        { id: "trading-page6", title: "Indicators", content: "<h1>Technical Indicators</h1><p>Explore moving averages, RSI, MACD and other popular technical indicators used by traders.</p>" },
        { id: "trading-page7", title: "Chart Patterns", content: "<h1>Common Chart Patterns</h1><p>Discover head and shoulders, triangles, flags, and other patterns that signal potential price movements.</p>" },
        { id: "trading-page8", title: "Support & Resistance", content: "<h1>Support and Resistance Levels</h1><p>Learn how to identify these critical price levels that often influence market direction.</p>" },
      ],
      quiz: { 
        id: "trading-section2-quiz", 
        title: "Technical Analysis Quiz", 
        questions: [
          {
            id: "t2q1",
            text: "What does RSI stand for?",
            options: [
              "Really Simple Indicator",
              "Relative Strength Index",
              "Resistance Support Indicator",
              "Repeating Signal Identifier"
            ],
            correctOptionIndex: 1
          },
          {
            id: "t2q2",
            text: "Which pattern often signals a trend reversal?",
            options: [
              "Flag pattern",
              "Triangle pattern",
              "Head and shoulders pattern",
              "Channel pattern"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "trading-section3",
      title: "Trading Strategies",
      pages: [
        { id: "trading-page9", title: "Risk Management", content: "<h1>Managing Trading Risk</h1><p>Learn position sizing, stop losses, and portfolio management to protect your capital.</p>" },
        { id: "trading-page10", title: "Day Trading", content: "<h1>Day Trading Strategies</h1><p>Explore scalping, range trading, and news trading approaches for short-term profits.</p>" },
        { id: "trading-page11", title: "Swing Trading", content: "<h1>Swing Trading Approaches</h1><p>Learn how to capture medium-term market moves lasting days to weeks.</p>" },
        { id: "trading-page12", title: "Building Your Strategy", content: "<h1>Creating Your Trading Plan</h1><p>Put everything together to create a personalized trading strategy that fits your goals.</p>" },
      ],
      quiz: { 
        id: "trading-section3-quiz", 
        title: "Trading Strategies Quiz", 
        questions: [
          {
            id: "t3q1",
            text: "What is a stop-loss order?",
            options: [
              "An order to buy when prices start rising",
              "An order to sell when prices start falling",
              "An order that automatically closes your position at a specified loss limit",
              "An order that prevents you from trading anymore"
            ],
            correctOptionIndex: 2
          },
          {
            id: "t3q2",
            text: "Which trading style typically holds positions for several days or weeks?",
            options: [
              "Scalping",
              "Day trading",
              "Swing trading",
              "Position trading"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    }
  ],
  "defi-essentials": [
    {
      id: "defi-section1",
      title: "DeFi Fundamentals",
      pages: [
        { id: "defi-page1", title: "What is DeFi?", content: "<h1>Welcome to DeFi Essentials!</h1><p>Learn what decentralized finance is and how it's revolutionizing financial services.</p>" },
        { id: "defi-page2", title: "Traditional Finance vs DeFi", content: "<h1>TradFi vs DeFi</h1><p>Compare centralized financial systems with decentralized alternatives and understand the key differences.</p>" },
        { id: "defi-page3", title: "DeFi Ecosystem", content: "<h1>The DeFi Landscape</h1><p>Explore the various categories of DeFi applications and how they interact with each other.</p>" },
        { id: "defi-page4", title: "Smart Contracts in DeFi", content: "<h1>Smart Contract Foundations</h1><p>Understand how smart contracts enable trustless financial applications in DeFi.</p>" },
      ],
      quiz: { 
        id: "defi-section1-quiz", 
        title: "DeFi Fundamentals Quiz", 
        questions: [
          {
            id: "d1q1",
            text: "What is the main advantage of DeFi over traditional finance?",
            options: [
              "Government oversight and regulation",
              "Lower transaction fees in all cases",
              "Permissionless access and elimination of intermediaries",
              "Complete security with no risks"
            ],
            correctOptionIndex: 2
          },
          {
            id: "d1q2",
            text: "Which blockchain hosts the majority of DeFi applications?",
            options: [
              "Bitcoin",
              "Ethereum",
              "Solana",
              "Ripple"
            ],
            correctOptionIndex: 1
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "defi-section2",
      title: "DeFi Applications",
      pages: [
        { id: "defi-page5", title: "Decentralized Exchanges", content: "<h1>DEX Platforms</h1><p>Learn about AMMs, order book DEXes, and how to trade without intermediaries.</p>" },
        { id: "defi-page6", title: "Lending & Borrowing", content: "<h1>DeFi Lending Protocols</h1><p>Explore how decentralized lending works and how to earn interest or obtain loans.</p>" },
        { id: "defi-page7", title: "Yield Farming", content: "<h1>Maximizing DeFi Returns</h1><p>Learn strategies for earning yield through liquidity provision and farming.</p>" },
        { id: "defi-page8", title: "Stablecoins", content: "<h1>Crypto Stability</h1><p>Understand different types of stablecoins and their role in the DeFi ecosystem.</p>" },
      ],
      quiz: { 
        id: "defi-section2-quiz", 
        title: "DeFi Applications Quiz", 
        questions: [
          {
            id: "d2q1",
            text: "What is an Automated Market Maker (AMM)?",
            options: [
              "A robot that automatically trades cryptocurrency",
              "A type of decentralized exchange that uses liquidity pools and algorithms",
              "A person who manages market trading operations",
              "A centralized exchange feature"
            ],
            correctOptionIndex: 1
          },
          {
            id: "d2q2",
            text: "Which of these is a stablecoin?",
            options: [
              "Bitcoin",
              "Ethereum",
              "USDC",
              "Dogecoin"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "defi-section3",
      title: "Advanced DeFi",
      pages: [
        { id: "defi-page9", title: "DeFi Derivatives", content: "<h1>Synthetic Assets</h1><p>Explore options, futures, and other derivative products in decentralized finance.</p>" },
        { id: "defi-page10", title: "Insurance Protocols", content: "<h1>Risk Protection in DeFi</h1><p>Learn about decentralized insurance solutions that protect against smart contract risks.</p>" },
        { id: "defi-page11", title: "DAOs in DeFi", content: "<h1>Governance Models</h1><p>Understand how decentralized autonomous organizations govern DeFi protocols.</p>" },
        { id: "defi-page12", title: "DeFi Security", content: "<h1>Staying Safe in DeFi</h1><p>Learn best practices for security and risk management when using DeFi applications.</p>" },
      ],
      quiz: { 
        id: "defi-section3-quiz", 
        title: "Advanced DeFi Quiz", 
        questions: [
          {
            id: "d3q1",
            text: "What is a flash loan?",
            options: [
              "A loan with extremely high interest rates",
              "A loan that must be repaid within the same transaction block",
              "A loan that is approved instantly",
              "A loan offered only to premium users"
            ],
            correctOptionIndex: 1
          },
          {
            id: "d3q2",
            text: "What is the primary purpose of a DAO in DeFi?",
            options: [
              "To ensure regulatory compliance",
              "To centralize decision-making",
              "To enable community governance of protocols",
              "To eliminate the need for users"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    }
  ],
  "nft-creation": [
    {
      id: "nft-section1",
      title: "NFT Basics",
      pages: [
        { id: "nft-page1", title: "Introduction to NFTs", content: "<h1>Welcome to NFT Creation Workshop!</h1><p>Learn what non-fungible tokens are and why they're revolutionizing digital ownership.</p>" },
        { id: "nft-page2", title: "NFT Standards", content: "<h1>NFT Technical Standards</h1><p>Understanding ERC-721, ERC-1155 and other token standards for NFTs.</p>" },
        { id: "nft-page3", title: "NFT Use Cases", content: "<h1>Applications of NFTs</h1><p>Explore how NFTs are being used in art, gaming, music, collectibles, and beyond.</p>" },
        { id: "nft-page4", title: "NFT Marketplaces", content: "<h1>Where NFTs are Traded</h1><p>Learn about popular NFT marketplaces and how they work.</p>" },
      ],
      quiz: { 
        id: "nft-section1-quiz", 
        title: "NFT Basics Quiz", 
        questions: [
          {
            id: "n1q1",
            text: "What does NFT stand for?",
            options: [
              "New Financial Token",
              "Non-Fungible Token",
              "Network File Transfer",
              "Newly Formed Technology"
            ],
            correctOptionIndex: 1
          },
          {
            id: "n1q2",
            text: "What is the most widely used Ethereum standard for NFTs?",
            options: [
              "ERC-20",
              "ERC-721",
              "ERC-777",
              "ERC-1155"
            ],
            correctOptionIndex: 1
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "nft-section2",
      title: "Creating NFT Art",
      pages: [
        { id: "nft-page5", title: "Digital Art Basics", content: "<h1>Creating NFT-Ready Art</h1><p>Learn about digital art creation tools and best practices for NFT-worthy content.</p>" },
        { id: "nft-page6", title: "Generative Art", content: "<h1>Algorithmic NFT Collections</h1><p>Explore tools and techniques for creating generative art collections.</p>" },
        { id: "nft-page7", title: "Metadata & Properties", content: "<h1>NFT Attributes</h1><p>Learn how to design and implement traits and properties for your NFTs.</p>" },
        { id: "nft-page8", title: "Storytelling with NFTs", content: "<h1>Narrative-Driven NFTs</h1><p>Understand how to create compelling stories that add value to your NFT projects.</p>" },
      ],
      quiz: { 
        id: "nft-section2-quiz", 
        title: "Creating NFT Art Quiz", 
        questions: [
          {
            id: "n2q1",
            text: "What is generative art in the context of NFTs?",
            options: [
              "Art created by AI only",
              "Algorithmically created art with randomized traits",
              "Art that grows over time",
              "Art that generates passive income"
            ],
            correctOptionIndex: 1
          },
          {
            id: "n2q2",
            text: "What is NFT metadata?",
            options: [
              "The blockchain where the NFT exists",
              "The price history of the NFT",
              "Additional data describing the NFT's properties and attributes",
              "The marketing strategy for the NFT"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "nft-section3",
      title: "Minting & Marketing",
      pages: [
        { id: "nft-page9", title: "Minting Process", content: "<h1>Creating Your NFTs</h1><p>Learn the technical process of minting NFTs on various blockchains.</p>" },
        { id: "nft-page10", title: "Gas Optimization", content: "<h1>Efficient NFT Creation</h1><p>Understand gas fees and how to optimize your NFT contracts for cost efficiency.</p>" },
        { id: "nft-page11", title: "Marketing Your NFTs", content: "<h1>Building an Audience</h1><p>Learn effective strategies for promoting your NFT collection and building community.</p>" },
        { id: "nft-page12", title: "Launching a Collection", content: "<h1>Successful NFT Drops</h1><p>Explore best practices for launching and selling your NFT collection.</p>" },
      ],
      quiz: { 
        id: "nft-section3-quiz", 
        title: "Minting & Marketing Quiz", 
        questions: [
          {
            id: "n3q1",
            text: "What is 'minting' an NFT?",
            options: [
              "Creating physical copies of digital art",
              "The process of creating and registering an NFT on the blockchain",
              "Setting the price for an NFT",
              "Earning rewards from your NFT"
            ],
            correctOptionIndex: 1
          },
          {
            id: "n3q2",
            text: "What is a gas fee in the context of NFTs?",
            options: [
              "A fee paid to the artist",
              "A fee paid to the marketplace",
              "A transaction fee paid to blockchain validators",
              "A subscription fee for NFT services"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    }
  ],
  "solana-dev": [
    {
      id: "solana-section1",
      title: "Solana Fundamentals",
      pages: [
        { id: "solana-page1", title: "Introduction to Solana", content: "<h1>Welcome to Solana Development!</h1><p>Learn about the Solana blockchain and its unique architecture.</p>" },
        { id: "solana-page2", title: "Solana's Architecture", content: "<h1>Understanding Solana</h1><p>Explore Proof of History, Tower BFT, and other core components of Solana's design.</p>" },
        { id: "solana-page3", title: "Account Model", content: "<h1>Solana Account System</h1><p>Learn about Solana's account structure which differs from Ethereum's model.</p>" },
        { id: "solana-page4", title: "Transaction Flow", content: "<h1>How Transactions Work</h1><p>Understand how transactions are processed and confirmed on Solana.</p>" },
      ],
      quiz: { 
        id: "solana-section1-quiz", 
        title: "Solana Fundamentals Quiz", 
        questions: [
          {
            id: "sol1q1",
            text: "What is Proof of History (PoH) in Solana?",
            options: [
              "A consensus mechanism that replaces Proof of Stake",
              "A way to verify the historical accuracy of the blockchain",
              "A verifiable delay function that creates a historical record of transactions",
              "A method to prove ownership of NFTs"
            ],
            correctOptionIndex: 2
          },
          {
            id: "sol1q2",
            text: "What programming language is primarily used for Solana development?",
            options: [
              "JavaScript",
              "Solidity",
              "Python",
              "Rust"
            ],
            correctOptionIndex: 3
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "solana-section2",
      title: "Solana Programming",
      pages: [
        { id: "solana-page5", title: "Rust Basics", content: "<h1>Programming Language of Solana</h1><p>Get introduced to Rust programming for Solana development.</p>" },
        { id: "solana-page6", title: "Program Structure", content: "<h1>Solana Program Architecture</h1><p>Learn how to structure Solana programs and understand the entry point.</p>" },
        { id: "solana-page7", title: "Instruction Processing", content: "<h1>Handling Instructions</h1><p>Understand how to process instructions in Solana programs.</p>" },
        { id: "solana-page8", title: "Program Derived Addresses", content: "<h1>PDAs Explained</h1><p>Learn about PDAs and how they enable cross-program invocation.</p>" },
      ],
      quiz: { 
        id: "solana-section2-quiz", 
        title: "Solana Programming Quiz", 
        questions: [
          {
            id: "sol2q1",
            text: "What is a Program Derived Address (PDA) in Solana?",
            options: [
              "A user's wallet address",
              "An address derived from a program's ID that doesn't lie on the Ed25519
 curve",
              "The location where program code is stored",
              "A special address for staking SOL"
            ],
            correctOptionIndex: 1
          },
          {
            id: "sol2q2",
            text: "What Solana feature allows programs to call other programs?",
            options: [
              "Program Linking",
              "Cross-Program Invocation (CPI)",
              "Program Integration",
              "Inter-Program Communication (IPC)"
            ],
            correctOptionIndex: 1
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "solana-section3",
      title: "Building on Solana",
      pages: [
        { id: "solana-page9", title: "Token Creation", content: "<h1>SPL Tokens</h1><p>Learn how to create and manage tokens on Solana using the SPL token standard.</p>" },
        { id: "solana-page10", title: "NFTs on Solana", content: "<h1>Metaplex Standards</h1><p>Explore how to create NFTs on Solana using the Metaplex standard.</p>" },
        { id: "solana-page11", title: "DApps Integration", content: "<h1>Frontend Integration</h1><p>Learn how to connect Solana programs to web applications with JavaScript.</p>" },
        { id: "solana-page12", title: "Testing & Deployment", content: "<h1>Going to Production</h1><p>Understand testing strategies and deployment processes for Solana programs.</p>" },
      ],
      quiz: { 
        id: "solana-section3-quiz", 
        title: "Building on Solana Quiz", 
        questions: [
          {
            id: "sol3q1",
            text: "What is the Solana Program Library (SPL)?",
            options: [
              "A collection of books about Solana",
              "A collection of on-chain programs/smart contracts",
              "A JavaScript library for frontend development",
              "The official Solana documentation"
            ],
            correctOptionIndex: 1
          },
          {
            id: "sol3q2",
            text: "What JavaScript library is commonly used to interact with Solana from web applications?",
            options: [
              "@solana/web3.js",
              "solana-js",
              "sol-connect",
              "solana-react"
            ],
            correctOptionIndex: 0
          }
        ],
        rewardPoints: 20
      }
    }
  ],
  // Default sections for other lessons not explicitly defined
  "default": [
    {
      id: "default-section1",
      title: "Section 1",
      pages: [
        { id: "default-page1", title: "Introduction", content: "<h1>Welcome to this Course!</h1><p>This is a placeholder for custom lesson content that will be added soon.</p>" },
        { id: "default-page2", title: "Topic 1", content: "<h1>First Topic</h1><p>Content for the first topic will be available soon.</p>" },
        { id: "default-page3", title: "Topic 2", content: "<h1>Second Topic</h1><p>Content for the second topic will be available soon.</p>" },
        { id: "default-page4", title: "Topic 3", content: "<h1>Third Topic</h1><p>Content for the third topic will be available soon.</p>" },
      ],
      quiz: { 
        id: "default-section1-quiz", 
        title: "Section 1 Quiz", 
        questions: [
          {
            id: "def1q1",
            text: "Sample question 1",
            options: [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            correctOptionIndex: 1
          },
          {
            id: "def1q2",
            text: "Sample question 2",
            options: [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "default-section2",
      title: "Section 2",
      pages: [
        { id: "default-page5", title: "Advanced Topic 1", content: "<h1>Advanced Topic 1</h1><p>Content for this advanced topic will be available soon.</p>" },
        { id: "default-page6", title: "Advanced Topic 2", content: "<h1>Advanced Topic 2</h1><p>Content for this advanced topic will be available soon.</p>" },
        { id: "default-page7", title: "Advanced Topic 3", content: "<h1>Advanced Topic 3</h1><p>Content for this advanced topic will be available soon.</p>" },
        { id: "default-page8", title: "Advanced Topic 4", content: "<h1>Advanced Topic 4</h1><p>Content for this advanced topic will be available soon.</p>" },
      ],
      quiz: { 
        id: "default-section2-quiz", 
        title: "Section 2 Quiz", 
        questions: [
          {
            id: "def2q1",
            text: "Sample question 1",
            options: [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            correctOptionIndex: 1
          },
          {
            id: "def2q2",
            text: "Sample question 2",
            options: [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    },
    {
      id: "default-section3",
      title: "Section 3",
      pages: [
        { id: "default-page9", title: "Final Topic 1", content: "<h1>Final Topic 1</h1><p>Content for this final topic will be available soon.</p>" },
        { id: "default-page10", title: "Final Topic 2", content: "<h1>Final Topic 2</h1><p>Content for this final topic will be available soon.</p>" },
        { id: "default-page11", title: "Final Topic 3", content: "<h1>Final Topic 3</h1><p>Content for this final topic will be available soon.</p>" },
        { id: "default-page12", title: "Conclusion", content: "<h1>Course Conclusion</h1><p>Congratulations on completing this course! A summary will be available soon.</p>" },
      ],
      quiz: { 
        id: "default-section3-quiz", 
        title: "Section 3 Quiz", 
        questions: [
          {
            id: "def3q1",
            text: "Sample question 1",
            options: [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            correctOptionIndex: 1
          },
          {
            id: "def3q2",
            text: "Sample question 2",
            options: [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            correctOptionIndex: 2
          }
        ],
        rewardPoints: 20
      }
    }
  ]
};

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
    icon: <PaintBucket size={24} />,
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
    icon: <Sparkles size={24} />,
  },
];

