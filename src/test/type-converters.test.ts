import { describe, it, expect } from 'vitest';
import { isTemporaryId, safelyParseId } from '../lib/type-converters';

describe('Type Converters', () => {
  describe('isTemporaryId', () => {
    it('should identify temporary IDs correctly', () => {
      // Temporary IDs
      expect(isTemporaryId('new-123')).toBe(true);
      expect(isTemporaryId('section-456')).toBe(true);
      expect(isTemporaryId('page-789')).toBe(true);
      expect(isTemporaryId('temp-section-123')).toBe(true);
      expect(isTemporaryId('some-page-id')).toBe(true);
      
      // Non-numeric strings that aren't UUIDs
      expect(isTemporaryId('abc')).toBe(true);
      expect(isTemporaryId('invalid-id')).toBe(true);
    });

    it('should identify UUIDs as non-temporary IDs', () => {
      // Valid UUIDs
      expect(isTemporaryId('b93adc56-7644-4bbf-ace3-202942c4ac14')).toBe(false);
      expect(isTemporaryId('123e4567-e89b-12d3-a456-426614174000')).toBe(false);
      expect(isTemporaryId('00000000-0000-0000-0000-000000000000')).toBe(false);
    });

    it('should identify numeric IDs as non-temporary', () => {
      // Numeric IDs
      expect(isTemporaryId('123')).toBe(false);
      expect(isTemporaryId('456789')).toBe(false);
    });

    it('should handle special cases', () => {
      // Special cases
      expect(isTemporaryId('lesson-new')).toBe(true); // This is a special temporary ID
      expect(isTemporaryId('new-lesson-123')).toBe(true); // This is a special temporary ID
    });
  });

  describe('safelyParseId', () => {
    it('should handle UUIDs correctly', () => {
      const uuid = 'b93adc56-7644-4bbf-ace3-202942c4ac14';
      expect(safelyParseId(uuid, 'lesson')).toBe(uuid);
    });

    it('should handle numeric IDs correctly', () => {
      expect(safelyParseId('123', 'lesson')).toBe('123');
      expect(safelyParseId(123, 'lesson')).toBe('123');
      
      expect(safelyParseId('456', 'section')).toBe(456);
      expect(safelyParseId(456, 'section')).toBe(456);
    });

    it('should return null for invalid IDs', () => {
      expect(safelyParseId('invalid-id', 'lesson')).toBe(null);
      expect(safelyParseId('invalid-id', 'section')).toBe(null);
    });
  });
}); 