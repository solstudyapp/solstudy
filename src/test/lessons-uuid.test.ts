import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { saveLesson, deleteLesson } from '../services/lessons';
import { LessonType } from '../types/lesson';
import * as dbModule from '@/lib/db';

// Mock the db module
vi.mock('@/lib/db', () => ({
  updateLesson: vi.fn(),
  createLesson: vi.fn(),
  deleteLesson: vi.fn(),
}));

describe('Lesson Service with UUID Support', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('saveLesson', () => {
    it('should update an existing lesson with UUID', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';
      const lesson: LessonType = {
        id: uuid,
        title: 'Test Lesson',
        description: 'Test Description',
        difficulty: 'beginner',
        category: 'Blockchain',
        sections: 0,
        pages: 0,
        rating: 0,
        reviewCount: 0,
        icon: null,
        sponsored: false,
        sponsorLogo: '',
        points: 0
      };

      // Setup mock
      (dbModule.updateLesson as any).mockResolvedValue({ success: true });

      // Call the function
      const result = await saveLesson(lesson);

      // Assertions
      expect(result.success).toBe(true);
      expect(dbModule.updateLesson).toHaveBeenCalledWith(uuid, expect.any(Object));
      expect(dbModule.createLesson).not.toHaveBeenCalled();
    });

    it('should create a new lesson when ID is a temporary ID', async () => {
      // Mock data
      const lesson: LessonType = {
        id: 'new-123',
        title: 'New Lesson',
        description: 'New Description',
        difficulty: 'beginner',
        category: 'Blockchain',
        sections: 0,
        pages: 0,
        rating: 0,
        reviewCount: 0,
        icon: null,
        sponsored: false,
        sponsorLogo: '',
        points: 0
      };

      // Setup mock
      (dbModule.createLesson as any).mockResolvedValue({ success: true, id: 123 });

      // Call the function
      const result = await saveLesson(lesson);

      // Assertions
      expect(result.success).toBe(true);
      expect(dbModule.createLesson).toHaveBeenCalled();
      expect(dbModule.updateLesson).not.toHaveBeenCalled();
      expect(result.data).toEqual([{ id: '123' }]);
    });

    it('should handle errors when saving a lesson', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';
      const lesson: LessonType = {
        id: uuid,
        title: 'Test Lesson',
        description: 'Test Description',
        difficulty: 'beginner',
        category: 'Blockchain',
        sections: 0,
        pages: 0,
        rating: 0,
        reviewCount: 0,
        icon: null,
        sponsored: false,
        sponsorLogo: '',
        points: 0
      };

      // Setup mock to throw an error
      (dbModule.updateLesson as any).mockResolvedValue({ 
        success: false, 
        error: 'Database error' 
      });

      // Call the function
      const result = await saveLesson(lesson);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('deleteLesson', () => {
    it('should delete a lesson with UUID', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';

      // Setup mock
      (dbModule.deleteLesson as any).mockResolvedValue({ success: true });

      // Call the function
      const result = await deleteLesson(uuid);

      // Assertions
      expect(result.success).toBe(true);
      expect(dbModule.deleteLesson).toHaveBeenCalledWith(uuid);
    });

    it('should handle errors when deleting a lesson', async () => {
      // Mock data
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';

      // Setup mock to throw an error
      (dbModule.deleteLesson as any).mockResolvedValue({ 
        success: false, 
        error: 'Database error' 
      });

      // Call the function
      const result = await deleteLesson(uuid);

      // Assertions
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
}); 