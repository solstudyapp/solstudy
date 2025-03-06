
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
export const getQuizByLessonAndSection = (lessonId: string, sectionId: string): Quiz => {
  const quizId = `quiz-${sectionId}`;
  return quizzesData[quizId] || quizzesData["default-quiz"];
};
