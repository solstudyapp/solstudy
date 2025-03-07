
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
  points?: number; // Adding points field to track lesson completion reward
}
