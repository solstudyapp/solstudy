
import { ReactNode } from "react";

export interface Page {
  id: string;
  title: string;
  content: string;
}

export interface Section {
  id: string;
  title: string;
  pages: Page[];
  quizId: string;
}

export interface LessonType {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  sections: number;
  pages: number;
  completedSections: number;
  rating: number;
  reviewCount: number;
  icon: ReactNode;
  sponsored?: boolean;
  sponsorLogo?: string;
  points?: number; // Points field for lesson completion reward
}

// Add missing Question interface
export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

// Add missing Quiz interface
export interface Quiz {
  id: string;
  title: string;
  lessonId: string;
  sectionId: string;
  rewardPoints: number;
  questions: Question[];
  isFinalTest?: boolean;
}

// Add missing UserProgress interface
export interface UserProgress {
  userId: string;
  lessonId: string;
  currentSectionId: string;
  currentPageId: string;
  completedSections: string[];
  completedQuizzes: string[];
  testCompleted: boolean;
  earnedPoints: number;
}
