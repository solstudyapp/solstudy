import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fetchSections, saveSections, _setDbForTesting } from '../services/sections';
import { Section, Page } from '../types/lesson';
import * as dbModule from '@/lib/db';

describe('Sections Service with Mocks', () => {
  // Create mock db functions
  const mockDb = {
    fetchSectionsByLessonId: vi.fn(),
    fetchPagesBySectionId: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
    createPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn(),
    deletePagesBySectionId: vi.fn(),
  };

  // Store the restore function
  let restoreDb: () => void;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockDb).forEach(mock => mock.mockReset());
    
    // Set up the mock db
    restoreDb = _setDbForTesting(mockDb as unknown as typeof dbModule);
  });

  afterEach(() => {
    // Restore the original db
    restoreDb();
  });

  describe('fetchSections', () => {
    it('should skip fetching for new lessons', async () => {
      // Test with "lesson-new"
      let result = await fetchSections('lesson-new');
      expect(result).toEqual([]);
      expect(mockDb.fetchSectionsByLessonId).not.toHaveBeenCalled();

      // Test with "new-lesson-123"
      result = await fetchSections('new-lesson-123');
      expect(result).toEqual([]);
      expect(mockDb.fetchSectionsByLessonId).not.toHaveBeenCalled();
    });

    it('should fetch sections and pages for a valid lesson ID', async () => {
      // Mock data
      const lessonId = 1;
      const mockSections = [
        { id: 1, title: 'Section 1', lesson_id: lessonId, position: 0, quiz_id: 'quiz-1' },
        { id: 2, title: 'Section 2', lesson_id: lessonId, position: 1, quiz_id: 'quiz-2' },
      ];
      
      const mockPages1 = [
        { id: 1, title: 'Page 1', section_id: 1, content: 'Content 1', content_html: 'Content 1', position: 0 },
        { id: 2, title: 'Page 2', section_id: 1, content: 'Content 2', content_html: 'Content 2', position: 1 },
      ];
      
      const mockPages2 = [
        { id: 3, title: 'Page 3', section_id: 2, content: 'Content 3', content_html: 'Content 3', position: 0 },
      ];

      // Setup mocks
      mockDb.fetchSectionsByLessonId.mockResolvedValue(mockSections);
      mockDb.fetchPagesBySectionId.mockImplementation((sectionId) => {
        if (sectionId === 1) return Promise.resolve(mockPages1);
        if (sectionId === 2) return Promise.resolve(mockPages2);
        return Promise.resolve([]);
      });

      // Call the function
      const result = await fetchSections(lessonId);

      // Assertions
      expect(mockDb.fetchSectionsByLessonId).toHaveBeenCalledWith(lessonId);
      expect(mockDb.fetchPagesBySectionId).toHaveBeenCalledTimes(2);
      expect(mockDb.fetchPagesBySectionId).toHaveBeenCalledWith(1);
      expect(mockDb.fetchPagesBySectionId).toHaveBeenCalledWith(2);
      
      // Check the transformed result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Section 1');
      expect(result[0].quizId).toBe('quiz-1');
      expect(result[0].pages).toHaveLength(2);
      expect(result[0].pages[0].id).toBe('1');
      expect(result[0].pages[0].title).toBe('Page 1');
      expect(result[0].pages[0].content).toBe('Content 1');
      
      expect(result[1].id).toBe('2');
      expect(result[1].pages).toHaveLength(1);
      expect(result[1].pages[0].id).toBe('3');
    });

    it('should handle errors when fetching sections', async () => {
      // Setup mock to throw an error
      mockDb.fetchSectionsByLessonId.mockRejectedValue(new Error('Database error'));

      // Call the function
      const result = await fetchSections(1);

      // Assertions
      expect(result).toEqual([]);
      expect(mockDb.fetchSectionsByLessonId).toHaveBeenCalledWith(1);
    });
  });

  describe('saveSections', () => {
    it('should skip saving for new lessons', async () => {
      // Test with "lesson-new"
      let result = await saveSections('lesson-new', []);
      expect(result).toEqual({ success: true });
      expect(mockDb.createSection).not.toHaveBeenCalled();

      // Test with "new-lesson-123"
      result = await saveSections('new-lesson-123', []);
      expect(result).toEqual({ success: true });
      expect(mockDb.createSection).not.toHaveBeenCalled();
    });

    it('should validate numeric lesson ID', async () => {
      // Test with non-numeric ID
      const result = await saveSections('invalid-id', []);
      expect(result).toEqual({ 
        success: false, 
        error: 'Invalid lesson ID: invalid-id. Expected a number.' 
      });
      expect(mockDb.createSection).not.toHaveBeenCalled();
    });

    it('should save new sections and pages', async () => {
      // Mock data
      const lessonId = 1;
      const sections: Section[] = [
        {
          id: 'section-123',
          title: 'New Section',
          quizId: 'quiz-123',
          pages: [
            { id: 'page-123', title: 'New Page', content: 'Content' }
          ]
        }
      ];

      // Setup mocks
      mockDb.fetchSectionsByLessonId.mockResolvedValue([]);
      mockDb.createSection.mockResolvedValue({ id: 10, success: true });
      mockDb.createPage.mockResolvedValue({ id: 20, success: true });

      // Call the function
      const result = await saveSections(lessonId, sections);

      // Assertions
      expect(result).toEqual({ success: true });
      expect(mockDb.createSection).toHaveBeenCalledWith({
        lesson_id: lessonId,
        title: 'New Section',
        quiz_id: 'quiz-123',
        position: 0
      });
      expect(mockDb.createPage).toHaveBeenCalledWith({
        section_id: 10,
        title: 'New Page',
        content: 'Content',
        position: 0
      });
    });

    it('should update existing sections and pages', async () => {
      // Mock data
      const lessonId = 1;
      const existingSections = [
        { id: 10, title: 'Existing Section', lesson_id: lessonId, position: 0 }
      ];
      const existingPages = [
        { id: 20, title: 'Existing Page', section_id: 10, content: 'Old content', position: 0 }
      ];
      
      const sections: Section[] = [
        {
          id: '10', // Existing section ID as string
          title: 'Updated Section',
          quizId: 'quiz-10',
          pages: [
            { id: '20', title: 'Updated Page', content: 'New content' } // Existing page ID as string
          ]
        }
      ];

      // Setup mocks
      mockDb.fetchSectionsByLessonId.mockResolvedValue(existingSections);
      mockDb.fetchPagesBySectionId.mockResolvedValue(existingPages);
      mockDb.updateSection.mockResolvedValue({ success: true });
      mockDb.updatePage.mockResolvedValue({ success: true });

      // Call the function
      const result = await saveSections(lessonId, sections);

      // Assertions
      expect(result).toEqual({ success: true });
      expect(mockDb.updateSection).toHaveBeenCalledWith(10, {
        title: 'Updated Section',
        quiz_id: 'quiz-10',
        position: 0,
        lesson_id: 1
      });
      expect(mockDb.updatePage).toHaveBeenCalledWith(20, {
        title: 'Updated Page',
        content: 'New content',
        position: 0,
        section_id: 10
      });
    });

    it('should delete sections that are no longer present', async () => {
      // Mock data
      const lessonId = 1;
      const existingSections = [
        { id: 10, title: 'Section to Keep', lesson_id: lessonId, position: 0 },
        { id: 11, title: 'Section to Delete', lesson_id: lessonId, position: 1 }
      ];
      
      const sections: Section[] = [
        {
          id: '10', // Only keeping this section
          title: 'Section to Keep',
          quizId: 'quiz-10',
          pages: []
        }
      ];

      // Setup mocks
      mockDb.fetchSectionsByLessonId.mockResolvedValue(existingSections);
      mockDb.fetchPagesBySectionId.mockResolvedValue([]);
      mockDb.updateSection.mockResolvedValue({ success: true });
      mockDb.deleteSection.mockResolvedValue({ success: true });

      // Call the function
      const result = await saveSections(lessonId, sections);

      // Assertions
      expect(result).toEqual({ success: true });
      expect(mockDb.deleteSection).toHaveBeenCalledWith(11);
      expect(mockDb.updateSection).toHaveBeenCalledWith(10, expect.objectContaining({
        title: 'Section to Keep',
        quiz_id: 'quiz-10',
        position: 0,
        lesson_id: 1
      }));
    });

    it('should handle errors during saving', async () => {
      // Setup mock to throw an error
      mockDb.fetchSectionsByLessonId.mockRejectedValue(new Error('Database error'));

      // Call the function
      const result = await saveSections(1, []);

      // Assertions
      expect(result).toEqual({ 
        success: false, 
        error: 'Database error' 
      });
    });
  });
}); 