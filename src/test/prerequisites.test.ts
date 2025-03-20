import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usePrerequisites } from '../hooks/use-prerequisites'

// Mock the Supabase client
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: {
          user: { id: 'test-user-id' }
        }
      })
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(() => {
        return Promise.resolve({
          data: {
            completed_sections: ['section1', 'section2'],
            completed_quizzes: ['quiz1'],
            completed_pages: ['page1', 'page2', 'page3']
          },
          error: null
        })
      })
    })
  }
}))

describe('prerequisite checking', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('allows access to beginner courses without prerequisites', () => {
    // For beginner courses, no prerequisites are needed
    const hook = usePrerequisites()
    expect(hook.checkPrerequisites('beginner')).toBe(true)
  })

  it('requires beginner completion for intermediate courses', () => {
    const hook = usePrerequisites()
    
    // When beginner courses are not completed
    Object.defineProperty(hook, 'beginnerCompleted', { value: false })
    expect(hook.checkPrerequisites('intermediate')).toBe(false)
    
    // When beginner courses are completed
    Object.defineProperty(hook, 'beginnerCompleted', { value: true })
    expect(hook.checkPrerequisites('intermediate')).toBe(true)
  })
  
  it('requires both beginner and intermediate completion for advanced courses', () => {
    const hook = usePrerequisites()
    
    // When neither beginner nor intermediate courses are completed
    Object.defineProperty(hook, 'beginnerCompleted', { value: false })
    Object.defineProperty(hook, 'intermediateCompleted', { value: false })
    expect(hook.checkPrerequisites('advanced')).toBe(false)
    
    // When only beginner courses are completed
    Object.defineProperty(hook, 'beginnerCompleted', { value: true })
    Object.defineProperty(hook, 'intermediateCompleted', { value: false })
    expect(hook.checkPrerequisites('advanced')).toBe(false)
    
    // When both beginner and intermediate courses are completed
    Object.defineProperty(hook, 'beginnerCompleted', { value: true })
    Object.defineProperty(hook, 'intermediateCompleted', { value: true })
    expect(hook.checkPrerequisites('advanced')).toBe(true)
  })
}) 