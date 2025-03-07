
import { Quiz } from "@/types/lesson";

export const quizData: Record<string, Quiz> = {
  "intro-section1-quiz": {
    id: "intro-section1-quiz",
    title: "Getting Started Quiz",
    lessonId: "intro-to-blockchain",
    sectionId: "intro-section1",
    rewardPoints: 20,
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
    ]
  },
  "intro-section2-quiz": {
    id: "intro-section2-quiz",
    title: "Core Components Quiz",
    lessonId: "intro-to-blockchain",
    sectionId: "intro-section2",
    rewardPoints: 20,
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
    ]
  },
  "solana-section2-quiz": {
    id: "solana-section2-quiz",
    title: "Solana Programming Quiz",
    lessonId: "solana-dev",
    sectionId: "solana-section2",
    rewardPoints: 20,
    questions: [
      {
        id: "sol2q1",
        text: "What is a Program Derived Address (PDA) in Solana?",
        options: [
          "A user's wallet address",
          "An address derived from a program's ID that doesn't lie on the Ed25519 curve",
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
    ]
  },
  // Add more quiz data as needed
};
