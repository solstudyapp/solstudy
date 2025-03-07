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
  bonusLesson?: boolean; // Added bonusLesson property
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  lessonId: string;
  sectionId: string;
  rewardPoints: number;
  questions: Question[];
  isFinalTest?: boolean;
}

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
