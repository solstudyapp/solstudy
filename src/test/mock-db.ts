import { vi } from 'vitest';

// Create mock implementations for all db functions
export const mockDb = {
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

// Reset all mocks
export function resetMocks() {
  Object.values(mockDb).forEach(mock => mock.mockReset());
}

// Mock the entire db module
vi.mock('../lib/db', () => mockDb); 