import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as db from '../lib/db';
import { supabase } from '../integrations/supabase/client';

// Mock the supabase client
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn(),
  },
}));

describe('Database Functions', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('fetchSectionsByLessonId', () => {
    it('should fetch sections for a lesson', async () => {
      // Mock data
      const lessonId = 1;
      const mockSections = [
        { 
          id: 1, 
          title: 'Section 1', 
          lesson_id: lessonId, 
          position: 0,
          quizzes: [{ id: 'quiz-1', title: 'Quiz 1' }]
        },
        { 
          id: 2, 
          title: 'Section 2', 
          lesson_id: lessonId, 
          position: 1,
          quizzes: [{ id: 'quiz-2', title: 'Quiz 2' }]
        },
      ];
      
      // Setup mock chain
      const mockOrder = {
        data: mockSections,
        error: null,
      };
      
      const mockEq = {
        order: vi.fn().mockReturnValue(mockOrder),
      };
      
      const mockSelect = {
        eq: vi.fn().mockReturnValue(mockEq),
      };
      
      const mockFrom = {
        select: vi.fn().mockReturnValue(mockSelect),
      };
      
      supabase.from = vi.fn().mockReturnValue(mockFrom);

      // Call the function
      const result = await db.fetchSectionsByLessonId(lessonId);

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('sections');
      expect(mockFrom.select).toHaveBeenCalledWith(`
      *,
      quizzes (
        id,
        title
      )
    `);
      expect(mockSelect.eq).toHaveBeenCalledWith('lesson_id', lessonId.toString());
      expect(mockEq.order).toHaveBeenCalledWith('position', { ascending: true });
      expect(result).toEqual(mockSections);
    });
  });

  describe('fetchPagesBySectionId', () => {
    it('should fetch pages for a section', async () => {
      // Mock data
      const sectionId = 1;
      const mockPages = [
        { id: 1, title: 'Page 1', section_id: sectionId, content: 'Content 1', position: 0 },
        { id: 2, title: 'Page 2', section_id: sectionId, content: 'Content 2', position: 1 },
      ];
      
      // Setup mock chain
      const mockOrder = {
        data: mockPages,
        error: null,
      };
      
      const mockEq = {
        order: vi.fn().mockReturnValue(mockOrder),
      };
      
      const mockSelect = {
        eq: vi.fn().mockReturnValue(mockEq),
      };
      
      const mockFrom = {
        select: vi.fn().mockReturnValue(mockSelect),
      };
      
      supabase.from = vi.fn().mockReturnValue(mockFrom);

      // Call the function
      const result = await db.fetchPagesBySectionId(sectionId);

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('pages');
      expect(mockFrom.select).toHaveBeenCalledWith('*');
      expect(mockSelect.eq).toHaveBeenCalledWith('section_id', sectionId);
      expect(mockEq.order).toHaveBeenCalledWith('position', { ascending: true });
      expect(result).toEqual(mockPages);
    });
  });
});
