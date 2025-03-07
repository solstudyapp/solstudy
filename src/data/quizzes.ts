
import { SectionQuiz, FinalTest } from "@/types/lesson";

// Section quizzes (2 questions each)
export const sectionQuizzes: Record<string, SectionQuiz> = {
  "section1-quiz": {
    id: "section1-quiz",
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
  },
  "section2-quiz": {
    id: "section2-quiz",
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
  },
  "section3-quiz": {
    id: "section3-quiz",
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
};

// Final tests (5 questions each)
export const finalTests: Record<string, FinalTest> = {
  "intro-to-blockchain-test": {
    id: "intro-to-blockchain-test",
    lessonId: "intro-to-blockchain",
    title: "Blockchain Fundamentals Final Test",
    questions: [
      {
        id: "ft1",
        text: "What is blockchain?",
        options: [
          "A type of cryptocurrency",
          "A distributed database that maintains a growing list of records",
          "A cloud storage solution",
          "A programming language for smart contracts"
        ],
        correctOptionIndex: 1
      },
      {
        id: "ft2",
        text: "What property of blockchain makes it secure?",
        options: [
          "Centralization",
          "Government regulation",
          "Immutability",
          "Fast transaction speed"
        ],
        correctOptionIndex: 2
      },
      {
        id: "ft3",
        text: "What is a consensus mechanism?",
        options: [
          "A way to achieve agreement on the blockchain's state",
          "A type of cryptocurrency mining",
          "A blockchain messaging system",
          "A method to store private keys"
        ],
        correctOptionIndex: 0
      },
      {
        id: "ft4",
        text: "Which of these is NOT a common blockchain consensus mechanism?",
        options: [
          "Proof of Work",
          "Proof of Stake",
          "Proof of Authority",
          "Proof of Payment"
        ],
        correctOptionIndex: 3
      },
      {
        id: "ft5",
        text: "What is a 'block' in blockchain?",
        options: [
          "A unit of cryptocurrency",
          "A digital wallet",
          "A collection of transactions bundled together",
          "A type of smart contract"
        ],
        correctOptionIndex: 2
      }
    ],
    rewardPoints: 50
  }
};

// Helper functions to get quizzes and tests
export const getSectionQuiz = (quizId: string): SectionQuiz | undefined => {
  return sectionQuizzes[quizId];
};

export const getFinalTest = (lessonId: string): FinalTest | undefined => {
  return Object.values(finalTests).find(test => test.lessonId === lessonId);
};
