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
  quizId: string | null;
}

export type LessonType = {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  sections: number;
  pages: number;
  completedSections?: number;
  rating: number;
  reviewCount: number;
  icon: ReactNode;
  is_sponsored: boolean;
  sponsorId?: number | null;
  sponsorLogo: string;
  sponsorName: string;
  points: number;
  bonusLesson?: boolean;
  progress?: number;
};

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string; // Add explanation field
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

// Database model interfaces to match Supabase schema
export interface DbLessonData {
  id: string | number;
  title: string;
  description?: string;
  difficulty?: string;
  category?: string;
  rating?: number;
  rating_count?: number;
  is_sponsored?: boolean;
  sponsor?: {
    id: string;
    name: string;
    logo_url: string;
  };
  points?: number;
  icon?: string; // Store icon as string in DB
  bonusLesson?: boolean;
}

export interface DbSection {
  id: number;
  title: string;
  lesson_id: string | number;
  position: number;
  quizzes?: { id: string; title: string }[];
}

export interface DbPage {
  id: number;
  title: string;
  section_id: number;
  content?: string;
  content_html?: string;
  position: number;
}
