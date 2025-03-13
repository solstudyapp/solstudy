import { LessonType, Section, Page, DbLessonData, DbSection, DbPage } from "@/types/lesson";

/**
 * Convert database lesson data to frontend lesson type
 */
export function dbToFrontendLesson(lesson: DbLessonData): LessonType {
  return {
    id: typeof lesson.id === 'string' ? lesson.id : lesson.id.toString(),
    title: lesson.title,
    description: lesson.description || `Learn about ${lesson.title}`,
    difficulty: (lesson.difficulty as "beginner" | "intermediate" | "advanced") || "beginner",
    category: lesson.category || "General",
    sections: 0, // Will be populated later
    pages: 0, // Will be populated later
    rating: lesson.rating || 0,
    reviewCount: lesson.reviewCount || 0,
    icon: null, // Frontend will handle icon rendering
    sponsored: lesson.sponsored || false,
    sponsorLogo: lesson.sponsorLogo || "",
    points: lesson.points || 0,
    bonusLesson: lesson.bonusLesson || false,
  };
}

/**
 * Convert frontend lesson type to database lesson data (for create/update operations)
 */
export function frontendToDbLesson(lesson: LessonType): Omit<DbLessonData, 'id'> {
  return {
    title: lesson.title,
    description: lesson.description,
    difficulty: lesson.difficulty,
    category: lesson.category,
    rating: lesson.rating || 0,
    reviewCount: lesson.reviewCount || 0,
    sponsored: lesson.sponsored || false,
    sponsorLogo: lesson.sponsorLogo || "",
    points: lesson.points || 0,
    // Convert icon ReactNode to string if needed
    icon: typeof lesson.icon === 'string' ? lesson.icon : undefined,
    bonusLesson: lesson.bonusLesson || false,
  };
}

/**
 * Convert database section to frontend section
 */
export function dbToFrontendSection(section: DbSection, pages: DbPage[]): Section {
  return {
    id: section.id.toString(),
    title: section.title,
    pages: pages.map(dbToFrontendPage),
    quizId: section.quiz_id || `quiz-${section.id}`,
  };
}

/**
 * Convert database page to frontend page
 */
export function dbToFrontendPage(page: DbPage): Page {
  return {
    id: page.id.toString(),
    title: page.title,
    content: page.content || page.content_html || "",
  };
}

/**
 * Convert frontend section to database section (for create/update operations)
 */
export function frontendToDbSection(section: Section, lessonId: string | number, position: number): Omit<DbSection, 'id'> {
  return {
    lesson_id: lessonId,
    title: section.title,
    quiz_id: section.quizId,
    position: position,
  };
}

/**
 * Convert frontend page to database page (for create/update operations)
 */
export function frontendToDbPage(page: Page, sectionId: number, position: number): Omit<DbPage, 'id'> {
  return {
    section_id: sectionId,
    title: page.title,
    content: page.content || '',
    position: position,
  };
}

/**
 * Safely handle ID conversion
 * Returns the ID as is for UUID strings, or converts numeric strings to numbers
 */
export function safelyParseId(id: string | number): string | number | null {
  if (typeof id === 'number') return id;
  if (typeof id === 'string') {
    // Check if it's a UUID (simple check for now)
    if (id.includes('-') || id.length === 36) {
      return id;
    }
    // If it's a numeric string, convert to number
    if (!isNaN(Number(id))) {
      return Number(id);
    }
  }
  return null;
}

/**
 * Check if a string ID is a temporary ID
 */
export function isTemporaryId(id: string): boolean {
  return (
    id.startsWith('new-') || 
    id.startsWith('section-') || 
    id.includes('section') || 
    id.startsWith('page-') || 
    id.includes('page') || 
    isNaN(Number(id))
  );
} 