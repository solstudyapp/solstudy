import { supabase } from './supabase';
import { Section, Page, LessonType } from '@/types/lesson';

// Lesson operations
export async function fetchAllLessons(): Promise<LessonType[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lessons:', error);
    return [];
  }

  return data || [];
}

export async function fetchLessonById(id: string | number): Promise<LessonType | null> {
  console.log('DB fetchLessonById called with ID:', id, 'Type:', typeof id);
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }

  console.log('DB fetchLessonById result:', data);
  return data || null;
}

export async function createLesson(lesson: Omit<LessonType, 'id'>): Promise<{ id?: number; success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('lessons')
    .insert({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      category: lesson.category,
      rating: lesson.rating || 0,
      rating_count: lesson.reviewCount || 0,
      is_sponsored: lesson.sponsored,
      points: lesson.points,
    })
    .select();

  if (error) {
    console.error('Error creating lesson:', error);
    return { success: false, error: error.message };
  }

  return { id: data?.[0]?.id, success: true };
}

export async function updateLesson(id: string | number, lesson: Partial<LessonType>): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('lessons')
    .update({
      title: lesson.title,
      description: lesson.description,
      difficulty: lesson.difficulty,
      category: lesson.category,
      rating: lesson.rating,
      rating_count: lesson.reviewCount,
      is_sponsored: lesson.sponsored,
      points: lesson.points,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating lesson:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteLesson(id: string | number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lesson:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Section operations
export async function fetchSectionsByLessonId(lessonId: string | number): Promise<Section[]> {
  console.log('DB fetchSectionsByLessonId called with lessonId:', lessonId, 'Type:', typeof lessonId);
  
  // Ensure lessonId is treated as a string (UUID)
  const id = typeof lessonId === 'number' ? lessonId.toString() : lessonId;
  
  const { data, error } = await supabase
    .from('sections')
    .select(`
      *,
      quizzes (
        id,
        title
      )
    `)
    .eq('lesson_id', id)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching sections:', error);
    return [];
  }

  console.log('DB fetchSectionsByLessonId result:', data?.length || 0, 'sections found');
  return data || [];
}

export async function createSection(section: { lesson_id: string | number; title: string; position: number }): Promise<{ id?: number; success: boolean; error?: string }> {
  // Ensure lesson_id is treated as a string (UUID)
  const sectionData = {
    lesson_id: typeof section.lesson_id === 'number' ? section.lesson_id.toString() : section.lesson_id,
    title: section.title,
    position: section.position
  };

  const { data, error } = await supabase
    .from('sections')
    .insert(sectionData)
    .select();

  if (error) {
    console.error('Error creating section:', error);
    return { success: false, error: error.message };
  }

  return { id: data?.[0]?.id, success: true };
}

export async function updateSection(
  id: number,
  section: { lesson_id: string | number; title: string; position: number }
): Promise<{ success: boolean; error?: string }> {
  // Ensure lesson_id is treated as a string (UUID)
  const sectionData = {
    lesson_id: typeof section.lesson_id === 'number' ? section.lesson_id.toString() : section.lesson_id,
    title: section.title,
    position: section.position
  };

  const { error } = await supabase
    .from('sections')
    .update(sectionData)
    .eq('id', id);

  if (error) {
    console.error('Error updating section:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteSection(id: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting section:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteSectionsByLessonId(lessonId: string | number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('sections')
    .delete()
    .eq('lesson_id', lessonId);

  if (error) {
    console.error('Error deleting sections by lesson ID:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Page operations
export async function fetchPagesBySectionId(sectionId: number): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('section_id', sectionId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching pages:', error);
    return [];
  }

  return data || [];
}

export async function createPage(page: { section_id: string | number; title: string; content?: string; position: number }): Promise<{ id?: number; success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('pages')
    .insert({
      ...page,
      content_html: page.content || '', // Ensure content_html is also set
    })
    .select();

  if (error) {
    console.error('Error creating page:', error);
    return { success: false, error: error.message };
  }

  return { id: data?.[0]?.id, success: true };
}

export async function updatePage(id: string | number, page: { title?: string; content?: string; position?: number }): Promise<{ success: boolean; error?: string }> {
  const updateData: { title?: string; content?: string; position?: number; content_html?: string } = { ...page };
  
  // If content is being updated, also update content_html
  if (page.content) {
    updateData.content_html = page.content;
  }
  
  const { error } = await supabase
    .from('pages')
    .update(updateData)
    .eq('id', id);

  if (error) {
    console.error('Error updating page:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deletePage(id: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting page:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deletePagesBySectionId(sectionId: number): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('section_id', sectionId);

  if (error) {
    console.error('Error deleting pages by section ID:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
} 