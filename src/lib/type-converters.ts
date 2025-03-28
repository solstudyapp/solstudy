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
    reviewCount: lesson.rating_count || 0,
    icon: null, // Frontend will handle icon rendering
    is_sponsored: lesson.is_sponsored || false,
    sponsorLogo: lesson.sponsor?.logo_url || "",
    points: lesson.points || 0,
    bonusLesson: lesson.bonusLesson || false,
    sponsorName: lesson.sponsor?.name || "",
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
    is_sponsored: lesson.is_sponsored || false,
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
export function dbToFrontendSection(section: DbSection & { quizzes?: { id: string; title: string }[] }, pages: DbPage[]): Section {
  return {
    id: section.id.toString(),
    title: section.title,
    pages: pages.map(dbToFrontendPage),
    quizId: section.quizzes?.[0]?.id || null,
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
 * Safely parse an ID value. For lessons, always returns a string (since lessons use UUIDs).
 * For other entities (sections, pages), returns a number if it's a numeric string.
 */
export function safelyParseId(id: string | number, type: 'lesson' | 'section' | 'page' = 'lesson'): string | number | null {
  // If it's already a number, return it for sections and pages
  if (typeof id === 'number') {
    return type === 'lesson' ? id.toString() : id
  }

  // If it's a string...
  if (typeof id === 'string') {
    // For lessons, we want to validate and return the UUID
    if (type === 'lesson') {
      // Check if it's a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(id)) {
        return id;
      }
      
      // If it's a pure numeric string, convert it (for backward compatibility)
      if (!isNaN(Number(id)) && !id.includes('-')) {
        return id;
      }
      
      // If it's not a valid UUID or numeric string
      return null;
    }

    // For sections and pages, convert to number if possible
    if (!isNaN(Number(id)) && !id.includes('-')) {
      return Number(id)
    }
  }

  // If we couldn't parse it properly
  return null
}

/**
 * Check if a string ID is a temporary ID
 */
export function isTemporaryId(id: string): boolean {
  // Special cases that should always be considered temporary
  if (id === 'lesson-new' || id.startsWith('new-lesson-')) {
    return true;
  }
  
  // Check if it's a valid UUID format (not temporary)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return false;
  }
  
  return (
    id.startsWith('new-') || 
    id.startsWith('section-') || 
    id.includes('section') || 
    id.startsWith('page-') || 
    id.includes('page') || 
    (isNaN(Number(id)) && id !== 'lesson-new' && !id.startsWith('new-lesson-'))
  );
} 