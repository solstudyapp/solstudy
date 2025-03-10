import { describe, it, expect } from 'vitest';
import { fetchSections, saveSections } from '../services/sections';

describe('Sections Service - Core Tests', () => {
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

    it('should validate numeric lesson ID', async () => {
      // Test with non-numeric ID
      const result = await saveSections('invalid-id', []);
      expect(result).toEqual({ 
        success: false, 
        error: 'Invalid lesson ID: invalid-id. Expected a number.' 
      });
    });
  });
}); 