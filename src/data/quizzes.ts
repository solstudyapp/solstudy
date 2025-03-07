
import { Quiz } from "@/types/lesson";

// Map of quizzes by quiz ID
export const quizzesData: Record<string, Quiz> = {
  "quiz-section1": {
    id: "quiz-section1",
    title: "Blockchain Fundamentals Quiz",
    lessonId: "intro-to-blockchain",
    sectionId: "section1",
    rewardPoints: 100,
    questions: [
      {
        id: "q1",
        text: "What is the main innovation of blockchain technology?",
        options: [
          "Fast transaction processing",
          "Distributed, immutable ledger",
          "Cheap international payments",
          "Anonymous transactions"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q2",
        text: "Which of these is NOT a key property of most blockchains?",
        options: [
          "Decentralization",
          "Immutability",
          "Central authority",
          "Transparency"
        ],
        correctOptionIndex: 2
      },
      {
        id: "q3",
        text: "When was the Bitcoin whitepaper published?",
        options: [
          "2007",
          "2008",
          "2010",
          "2013"
        ],
        correctOptionIndex: 1
      },
    ]
  },
  "quiz-section2": {
    id: "quiz-section2",
    title: "Blockchain Core Components Quiz",
    lessonId: "intro-to-blockchain",
    sectionId: "section2",
    rewardPoints: 150,
    questions: [
      {
        id: "q1",
        text: "What is the purpose of a hash function in blockchain?",
        options: [
          "To encrypt user data",
          "To generate a fixed-size output from variable input",
          "To speed up transaction processing",
          "To reduce network congestion"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q2",
        text: "What is Proof of Stake?",
        options: [
          "A consensus mechanism where validators stake cryptocurrency",
          "A method for proving ownership of tokens",
          "A technique for validating transactions",
          "A way to prove the stake of the network"
        ],
        correctOptionIndex: 0
      },
      {
        id: "q3",
        text: "What is a smart contract?",
        options: [
          "A legal agreement between blockchain users",
          "A self-executing program on the blockchain",
          "A contract managed by AI",
          "A method for securing private keys"
        ],
        correctOptionIndex: 1
      },
    ]
  },
  "quiz-section3": {
    id: "quiz-section3",
    title: "Blockchain Applications Quiz",
    lessonId: "intro-to-blockchain",
    sectionId: "section3",
    rewardPoints: 200,
    questions: [
      {
        id: "q1",
        text: "What is DeFi?",
        options: [
          "Decentralized Finance",
          "Defined Financial Instruments",
          "Digital Finance",
          "Distributed Financial Technology"
        ],
        correctOptionIndex: 0
      },
      {
        id: "q2",
        text: "What does NFT stand for?",
        options: [
          "New Financial Token",
          "Non-Fungible Token",
          "Network For Trading",
          "National FinTech Technology"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q3",
        text: "What is a DAO?",
        options: [
          "Digital Asset Organization",
          "Distributed Application Ownership",
          "Decentralized Autonomous Organization",
          "Direct Access Operation"
        ],
        correctOptionIndex: 2
      },
    ]
  },
  // Final tests for each lesson
  "final-test-intro-to-blockchain": {
    id: "final-test-intro-to-blockchain",
    title: "Blockchain Mastery Final Test",
    lessonId: "intro-to-blockchain",
    sectionId: "final",
    rewardPoints: 500,
    isFinalTest: true,
    questions: [
      {
        id: "q1",
        text: "Which of these is NOT a component of blockchain architecture?",
        options: [
          "Consensus mechanism",
          "Distributed ledger",
          "Central database",
          "Cryptographic hashing"
        ],
        correctOptionIndex: 2
      },
      {
        id: "q2",
        text: "What is the main purpose of a public key in blockchain cryptography?",
        options: [
          "To sign transactions",
          "To decrypt messages",
          "To identify the user publicly",
          "To validate blocks"
        ],
        correctOptionIndex: 2
      },
      {
        id: "q3",
        text: "Which industry is NOT currently exploring blockchain applications?",
        options: [
          "Healthcare",
          "Supply chain",
          "Finance",
          "There is no industry NOT exploring blockchain"
        ],
        correctOptionIndex: 3
      },
      {
        id: "q4",
        text: "What problem does blockchain primarily solve?",
        options: [
          "Fast computation",
          "Trust in distributed systems",
          "User privacy",
          "Energy efficiency"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q5",
        text: "Which of these is an example of a Layer 2 scaling solution?",
        options: [
          "Bitcoin",
          "Lightning Network",
          "Proof of Stake",
          "Merkle Trees"
        ],
        correctOptionIndex: 1
      }
    ]
  },
  "final-test-crypto-trading-101": {
    id: "final-test-crypto-trading-101",
    title: "Crypto Trading Final Test",
    lessonId: "crypto-trading-101",
    sectionId: "final",
    rewardPoints: 500,
    isFinalTest: true,
    questions: [
      {
        id: "q1",
        text: "What indicator is best for identifying overbought/oversold conditions?",
        options: [
          "Moving Average",
          "MACD",
          "RSI",
          "Bollinger Bands"
        ],
        correctOptionIndex: 2
      },
      {
        id: "q2",
        text: "What is the recommended maximum percentage of your portfolio to risk on a single trade?",
        options: [
          "1-2%",
          "5-10%",
          "15-20%",
          "25-30%"
        ],
        correctOptionIndex: 0
      },
      {
        id: "q3",
        text: "What is the primary purpose of a stop-loss order?",
        options: [
          "Maximize profits",
          "Limit potential losses",
          "Increase trading volume",
          "Improve entry timing"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q4",
        text: "Which pattern often signals a trend reversal?",
        options: [
          "Cup and Handle",
          "Head and Shoulders",
          "Flag Pattern",
          "Triangle Pattern"
        ],
        correctOptionIndex: 1
      },
      {
        id: "q5",
        text: "What psychological bias causes traders to hold losing positions too long?",
        options: [
          "FOMO",
          "Loss aversion",
          "Confirmation bias",
          "Hindsight bias"
        ],
        correctOptionIndex: 1
      }
    ]
  },
  // Default quiz when no specific quiz is found
  "default-quiz": {
    id: "default-quiz",
    title: "Knowledge Check",
    lessonId: "default",
    sectionId: "default",
    rewardPoints: 50,
    questions: [
      {
        id: "q1",
        text: "This is a sample question?",
        options: [
          "Option A",
          "Option B",
          "Option C",
          "Option D"
        ],
        correctOptionIndex: 0
      },
      {
        id: "q2",
        text: "Another sample question?",
        options: [
          "Option 1",
          "Option 2",
          "Option 3",
          "Option 4"
        ],
        correctOptionIndex: 1
      },
    ]
  }
};

// Helper function to get a quiz by ID
export const getQuizById = (quizId: string): Quiz => {
  return quizzesData[quizId] || quizzesData["default-quiz"];
};

// Helper function to get a quiz by lesson ID and section ID
export const getQuizByLessonAndSection = (lessonId: string, sectionId: string, isFinalTest: boolean = false): Quiz => {
  if (isFinalTest) {
    const finalTestId = `final-test-${lessonId}`;
    return quizzesData[finalTestId] || quizzesData["default-quiz"];
  }
  
  const quizId = `quiz-${sectionId}`;
  return quizzesData[quizId] || quizzesData["default-quiz"];
};
