
import { ReactNode } from "react";

export interface LessonType {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  category: string;
  sections: number;
  pages: number;
  completedSections?: number;
  rating: number;
  reviewCount: number;
  sponsored?: boolean;
  sponsorLogo?: string;
  icon: ReactNode;
  progress?: number;
}

export interface Section {
  id: string;
  title: string;
  pages: Page[];
  quizId: string;
}

export interface Page {
  id: string;
  title: string;
  content: string;
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  rewardPoints: number;
  lessonId: string;
  sectionId: string;
  isFinalTest?: boolean;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
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

export interface UserFeedback {
  userId: string;
  lessonId: string;
  rating: number;
  comments?: string;
  timestamp: Date;
}
