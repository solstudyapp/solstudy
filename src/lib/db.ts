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
  const numericId = typeof id === 'string' ? Number(id) : id;
  
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', numericId)
    .single();

  if (error) {
    console.error('Error fetching lesson:', error);
    return null;
  }

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

export async function updateLesson(id: number, lesson: Partial<LessonType>): Promise<{ success: boolean; error?: string }> {
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

export async function deleteLesson(id: number): Promise<{ success: boolean; error?: string }> {
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
export async function fetchSectionsByLessonId(lessonId: number): Promise<Section[]> {
  const { data, error } = await supabase
    .from('sections')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching sections:', error);
    return [];
  }

  return data || [];
}

export async function createSection(section: { lesson_id: number; title: string; position: number; quiz_id?: string }): Promise<{ id?: number; success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('sections')
    .insert(section)
    .select();

  if (error) {
    console.error('Error creating section:', error);
    return { success: false, error: error.message };
  }

  return { id: data?.[0]?.id, success: true };
}

export async function updateSection(id: number, section: { title?: string; position?: number; quiz_id?: string }): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('sections')
    .update(section)
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

export async function deleteSectionsByLessonId(lessonId: number): Promise<{ success: boolean; error?: string }> {
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

export async function createPage(page: { section_id: number; title: string; content: string; position: number }): Promise<{ id?: number; success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from('pages')
    .insert({
      ...page,
      content_html: page.content, // Ensure content_html is also set
    })
    .select();

  if (error) {
    console.error('Error creating page:', error);
    return { success: false, error: error.message };
  }

  return { id: data?.[0]?.id, success: true };
}

export async function updatePage(id: number, page: { title?: string; content?: string; position?: number }): Promise<{ success: boolean; error?: string }> {
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