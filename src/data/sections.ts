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

// Add sections data for the daily bonus lesson
export const dailyBonusLessonSections = [
  {
    id: "daily-bonus-section1",
    title: "Market Analysis Fundamentals",
    pages: [
      {
        id: "daily-bonus-page1",
        title: "Understanding Market Trends",
        content: `
          <h2>Understanding Crypto Market Trends</h2>
          <p>Cryptocurrency markets are known for their volatility and rapid price movements. Understanding the underlying trends can help you make more informed decisions.</p>
          <h3>Key Market Indicators</h3>
          <ul>
            <li><strong>Volume</strong>: Higher trading volumes often indicate stronger trends.</li>
            <li><strong>Market Dominance</strong>: Bitcoin's percentage of the total crypto market cap.</li>
            <li><strong>Fear and Greed Index</strong>: Measuring market sentiment on a scale from extreme fear to extreme greed.</li>
          </ul>
          <p>Today's market is showing signs of increased institutional adoption, with several key metrics pointing toward a potential breakout period in the coming weeks.</p>
        `
      },
      {
        id: "daily-bonus-page2",
        title: "Technical Analysis Basics",
        content: `
          <h2>Technical Analysis for Crypto</h2>
          <p>Technical analysis involves studying price charts and using indicators to identify patterns and potential future price movements.</p>
          <h3>Essential Technical Indicators</h3>
          <ul>
            <li><strong>Moving Averages</strong>: Smooth out price data to identify trends.</li>
            <li><strong>Relative Strength Index (RSI)</strong>: Measures the speed and change of price movements.</li>
            <li><strong>MACD</strong>: Moving Average Convergence Divergence - shows relationship between two price moving averages.</li>
          </ul>
          <p>The current technical indicators for major cryptocurrencies suggest a consolidation phase before the next significant move.</p>
        `
      },
      {
        id: "daily-bonus-page3",
        title: "On-Chain Analysis",
        content: `
          <h2>On-Chain Analysis</h2>
          <p>One of the unique aspects of cryptocurrencies is the ability to analyze blockchain data directly to inform investment decisions.</p>
          <h3>Important On-Chain Metrics</h3>
          <ul>
            <li><strong>Active Addresses</strong>: Number of unique addresses active on the network.</li>
            <li><strong>Network Hash Rate</strong>: Measures the processing power of the network.</li>
            <li><strong>Exchange Flows</strong>: The amount of cryptocurrency flowing in and out of exchanges.</li>
          </ul>
          <p>Current on-chain data suggests strong accumulation by long-term holders, while short-term holders appear to be more active in trading.</p>
        `
      },
      {
        id: "daily-bonus-page4",
        title: "Market Correlation Analysis",
        content: `
          <h2>Crypto Market Correlations</h2>
          <p>Understanding how different cryptocurrencies correlate with each other and with traditional markets can provide valuable insights.</p>
          <h3>Key Correlations to Watch</h3>
          <ul>
            <li><strong>Bitcoin and Altcoins</strong>: When Bitcoin moves, altcoins often follow with higher volatility.</li>
            <li><strong>Crypto and Tech Stocks</strong>: Increasing correlation between crypto and NASDAQ.</li>
            <li><strong>Bitcoin and Gold</strong>: Both considered stores of value, but correlation varies.</li>
          </ul>
          <p>The recent market data shows decreasing correlation between Bitcoin and smaller altcoins, potentially signaling a maturing market.</p>
        `
      }
    ],
    quizId: "daily-bonus-quiz-section1"
  },
  {
    id: "daily-bonus-section2",
    title: "Advanced Trading Strategies",
    pages: [
      {
        id: "daily-bonus-page5",
        title: "Risk Management",
        content: `
          <h2>Crypto Risk Management</h2>
          <p>Proper risk management is crucial in the volatile crypto markets.</p>
          <h3>Essential Risk Management Techniques</h3>
          <ul>
            <li><strong>Position Sizing</strong>: Never risk more than 1-2% of your portfolio on a single trade.</li>
            <li><strong>Stop-Loss Orders</strong>: Automatically exit positions if they move against you by a predetermined amount.</li>
            <li><strong>Portfolio Diversification</strong>: Spread risk across multiple assets with different risk profiles.</li>
          </ul>
          <p>Today's market conditions suggest conservative position sizing given the recent volatility and unclear direction in the short term.</p>
        `
      },
      {
        id: "daily-bonus-page6",
        title: "Entry and Exit Strategies",
        content: `
          <h2>Effective Entry and Exit Strategies</h2>
          <p>Knowing when to enter and exit positions is one of the most challenging aspects of trading.</p>
          <h3>Key Strategies</h3>
          <ul>
            <li><strong>Dollar-Cost Averaging</strong>: Investing fixed amounts at regular intervals.</li>
            <li><strong>Scaling In/Out</strong>: Entering or exiting positions in portions rather than all at once.</li>
            <li><strong>Taking Partial Profits</strong>: Removing initial investment when in profit while letting remaining position run.</li>
          </ul>
          <p>With the current market conditions, scaling into positions gradually may be more prudent than making large one-time investments.</p>
        `
      },
      {
        id: "daily-bonus-page7",
        title: "Market Sentiment Analysis",
        content: `
          <h2>Analyzing Market Sentiment</h2>
          <p>Understanding the emotional state of the market can provide edge in your trading decisions.</p>
          <h3>Sentiment Indicators</h3>
          <ul>
            <li><strong>Social Media Volume</strong>: Tracking mentions of cryptocurrencies across platforms.</li>
            <li><strong>Funding Rates</strong>: In perpetual futures markets, indicating if traders are bullish or bearish.</li>
            <li><strong>Google Trends</strong>: Search volume for crypto-related terms.</li>
          </ul>
          <p>Current sentiment analysis shows a cautiously optimistic market, with moderate but growing interest from retail investors.</p>
        `
      },
      {
        id: "daily-bonus-page8",
        title: "Today's Market Opportunities",
        content: `
          <h2>Today's Crypto Market Opportunities</h2>
          <p>Based on our analysis, here are some potential opportunities in the current market environment.</p>
          <h3>Key Opportunities</h3>
          <ul>
            <li><strong>Layer 2 Solutions</strong>: Projects addressing Ethereum scaling continue to show promise.</li>
            <li><strong>DeFi 2.0 Projects</strong>: Next generation DeFi protocols with sustainable tokenomics.</li>
            <li><strong>Real-World Asset Tokenization</strong>: Bridging traditional finance with blockchain technology.</li>
          </ul>
          <p>Remember that this analysis is for educational purposes only and does not constitute investment advice. Always do your own research before making any investment decisions.</p>
        `
      }
    ],
    quizId: "daily-bonus-quiz-section2"
  }
];

// Update the getSectionsForLesson function to handle the daily bonus lesson
export const getSectionsForLesson = (lessonId: string) => {
  if (lessonId === "daily-bonus-lesson") {
    return dailyBonusLessonSections;
  }
  
  return sectionsByLesson[lessonId] || sectionsByLesson.default;
};
