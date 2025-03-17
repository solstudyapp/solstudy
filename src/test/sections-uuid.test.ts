import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchSections, saveSections, _setDbForTesting } from '../services/sections';
import { Section, Page } from '../types/lesson';
import * as dbModule from '@/lib/db';

describe('Sections Service with UUID Support', () => {
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
    it('should fetch sections for a lesson with UUID', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';
      const mockSections = [
        { 
          id: 1, 
          title: 'Section 1', 
          lesson_id: uuid, 
          position: 0,
          quizzes: [{ id: 'quiz-1', title: 'Quiz 1' }]
        },
        { 
          id: 2, 
          title: 'Section 2', 
          lesson_id: uuid, 
          position: 1,
          quizzes: [{ id: 'quiz-2', title: 'Quiz 2' }]
        },
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
      const result = await fetchSections(uuid);

      // Assertions
      expect(mockDb.fetchSectionsByLessonId).toHaveBeenCalledWith(uuid);
      expect(mockDb.fetchPagesBySectionId).toHaveBeenCalledTimes(2);
      expect(mockDb.fetchPagesBySectionId).toHaveBeenCalledWith(1);
      expect(mockDb.fetchPagesBySectionId).toHaveBeenCalledWith(2);
      
      // Check the transformed result
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1');
      expect(result[0].title).toBe('Section 1');
      expect(result[0].quizId).toBe('quiz-1');
      expect(result[0].pages).toHaveLength(2);
      
      expect(result[1].id).toBe('2');
      expect(result[1].pages).toHaveLength(1);
    });
  });

  describe('saveSections', () => {
    it('should save sections for a lesson with UUID', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';
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
      const result = await saveSections(uuid, sections);

      // Assertions
      expect(result.success).toBe(true);
      expect(mockDb.fetchSectionsByLessonId).toHaveBeenCalledWith(uuid);
      expect(mockDb.createSection).toHaveBeenCalledWith({
        lesson_id: uuid,
        title: 'New Section',
        position: 0
      });
      expect(mockDb.createPage).toHaveBeenCalledWith({
        section_id: 10,
        title: 'New Page',
        content: 'Content',
        position: 0
      });
    });

    it('should update existing sections for a lesson with UUID', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';
      const existingSections = [
        { id: 10, title: 'Existing Section', lesson_id: uuid, position: 0 }
      ];
      const existingPages = [
        { id: 20, title: 'Existing Page', section_id: 10, content: 'Old content', position: 0 }
      ];
      
      const sections: Section[] = [
        {
          id: '10', // Existing section ID as string
          title: 'Updated Section',
          quizId: null,
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
      const result = await saveSections(uuid, sections);

      // Assertions
      expect(result.success).toBe(true);
      expect(mockDb.fetchSectionsByLessonId).toHaveBeenCalledWith(uuid);
      expect(mockDb.updateSection).toHaveBeenCalledWith(10, {
        lesson_id: uuid,
        title: 'Updated Section',
        position: 0
      });
      expect(mockDb.updatePage).toHaveBeenCalledWith(20, {
        title: 'Updated Page',
        content: 'New content',
        position: 0,
        section_id: 10
      });
    });
  });
}); 