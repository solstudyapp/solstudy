
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
        correctOptionIndex: 1,
        explanation: "The main innovation of blockchain is its distributed, immutable ledger that allows for trustless transactions without central authorities."
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
        correctOptionIndex: 2,
        explanation: "Central authority is not a key property of most blockchains. In fact, blockchains are designed to eliminate the need for central authorities through decentralization."
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
        correctOptionIndex: 1,
        explanation: "The Bitcoin whitepaper titled 'Bitcoin: A Peer-to-Peer Electronic Cash System' was published by Satoshi Nakamoto in October 2008."
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
        correctOptionIndex: 1,
        explanation: "Hash functions in blockchain convert data of any size into a fixed-size output, creating a digital fingerprint that's vital for blockchain security and data integrity."
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
        correctOptionIndex: 0,
        explanation: "Proof of Stake is a consensus mechanism where validators must stake (lock up) cryptocurrency to participate in block validation, with their stake serving as collateral against malicious behavior."
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
        correctOptionIndex: 1,
        explanation: "Smart contracts are self-executing programs stored on a blockchain that run automatically when predetermined conditions are met, enabling trustless transactions without intermediaries."
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
        correctOptionIndex: 0,
        explanation: "DeFi (Decentralized Finance) refers to financial applications built on blockchain technology that aim to recreate and improve traditional financial systems without centralized intermediaries."
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
        correctOptionIndex: 1,
        explanation: "NFT stands for Non-Fungible Token. Unlike cryptocurrencies, NFTs are unique digital assets that cannot be exchanged on a one-to-one basis, making them ideal for representing ownership of unique items."
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
        correctOptionIndex: 2,
        explanation: "A DAO (Decentralized Autonomous Organization) is an organization represented by rules encoded as a computer program that is transparent, controlled by the organization members, and not influenced by a central government."
      },
    ]
  },
  // Final comprehensive test for the blockchain course
  "final-test-intro-to-blockchain": {
    id: "final-test-intro-to-blockchain",
    title: "Blockchain Mastery Final Test",
    lessonId: "intro-to-blockchain",
    sectionId: "final",
    rewardPoints: 500,
    isFinalTest: true,
    questions: [
      {
        id: "ft-q1",
        text: "Which of these is NOT considered one of the three main properties of blockchain technology?",
        options: [
          "Decentralization",
          "Scalability",
          "Security",
          "Immutability"
        ],
        correctOptionIndex: 1,
        explanation: "Scalability is not one of the three main properties of blockchain (which are decentralization, security, and immutability). In fact, scalability has been a challenge that blockchain technologies are working to overcome."
      },
      {
        id: "ft-q2",
        text: "In the context of blockchain, what is a 'genesis block'?",
        options: [
          "The last block in the chain",
          "The first block in the chain",
          "A block containing the blockchain's code",
          "A special block created during network upgrades"
        ],
        correctOptionIndex: 1,
        explanation: "The genesis block is the first block of a blockchain. It's the only block that doesn't reference a previous block and is hardcoded into the blockchain's protocol."
      },
      {
        id: "ft-q3",
        text: "Which consensus mechanism is known for its high energy consumption?",
        options: [
          "Proof of Stake (PoS)",
          "Proof of Authority (PoA)",
          "Proof of Work (PoW)",
          "Delegated Proof of Stake (DPoS)"
        ],
        correctOptionIndex: 2,
        explanation: "Proof of Work (PoW) is notorious for its high energy consumption as it requires miners to solve complex mathematical puzzles that demand significant computational power and electricity."
      },
      {
        id: "ft-q4",
        text: "What is a key difference between a public and private blockchain?",
        options: [
          "Private blockchains don't use cryptography",
          "Public blockchains allow anyone to participate in the network",
          "Private blockchains don't use blocks to store data",
          "Public blockchains can't support smart contracts"
        ],
        correctOptionIndex: 1,
        explanation: "A key difference is that public blockchains allow anyone to participate in the network (permissionless), while private blockchains restrict access to authorized participants (permissioned)."
      },
      {
        id: "ft-q5",
        text: "Which of these is NOT typically a use case for NFTs?",
        options: [
          "Digital art ownership",
          "Decentralized currency",
          "Gaming assets",
          "Event tickets"
        ],
        correctOptionIndex: 1,
        explanation: "Decentralized currency is not a typical use case for NFTs. NFTs represent unique items, while cryptocurrencies like Bitcoin are fungible tokens designed to serve as currency. NFTs are better suited for digital art, collectibles, gaming assets, and event tickets."
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
        correctOptionIndex: 0,
        explanation: "Option A is the correct answer because this is a sample question with sample explanations."
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
        correctOptionIndex: 1,
        explanation: "Option 2 is the correct answer for this sample question."
      },
    ]
  }
};

// Helper function to get a quiz by ID
export const getQuizById = (quizId: string): Quiz => {
  return quizzesData[quizId] || quizzesData["default-quiz"];
};

// Helper function to get a quiz by lesson ID and section ID
export const getQuizByLessonAndSection = (
  lessonId: string, 
  sectionId: string,
  isFinalTest = false
): Quiz => {
  if (isFinalTest || sectionId === 'final') {
    const finalQuizId = `final-test-${lessonId}`;
    return quizzesData[finalQuizId] || quizzesData["default-quiz"];
  }
  
  const quizId = `quiz-${sectionId}`;
  return quizzesData[quizId] || quizzesData["default-quiz"];
};
