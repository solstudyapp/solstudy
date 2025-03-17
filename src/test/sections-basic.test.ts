import { describe, it, expect } from 'vitest';
import { fetchSections, saveSections } from '../services/sections';

describe('Sections Service - Basic Tests', () => {
  describe('fetchSections', () => {
    it('should skip fetching for new lessons', async () => {
      // Test with "lesson-new"
      let result = await fetchSections('lesson-new');
      expect(result).toEqual([]);

      // Test with "new-lesson-123"
      result = await fetchSections('new-lesson-123');
      expect(result).toEqual([]);
    });
  });

  describe('saveSections', () => {
    it('should skip saving for new lessons', async () => {
      // Test with "lesson-new"
      let result = await saveSections('lesson-new', []);
      expect(result).toEqual({ success: true });

      // Test with "new-lesson-123"
      result = await saveSections('new-lesson-123', []);
      expect(result).toEqual({ success: true });
    });

    it('should validate UUID lesson ID', async () => {
      // Test with invalid UUID format
      const result = await saveSections('invalid-id', []);
      expect(result).toEqual({ 
        success: false, 
        error: 'Invalid lesson ID: invalid-id. Expected a UUID.' 
      });

      // Test with valid UUID format
      const validResult = await saveSections('b93adc56-7644-4bbf-ace3-202942c4ac14', []);
      expect(validResult).toEqual({ success: true });
    });
  });
}); 