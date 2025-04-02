import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { LessonEditor } from "../components/admin/LessonEditor"
import { LessonType, Section } from "../types/lesson"
import * as sectionsService from "../services/sections"
import { supabase } from "../integrations/supabase/client"

// Mock the supabase client
vi.mock("../integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    then: vi.fn(),
  },
}))

// Mock the sections service
vi.mock("../services/sections", () => ({
  fetchSections: vi.fn(),
  saveSections: vi.fn().mockResolvedValue({ success: true }),
}))

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}))

// Mock the RichTextEditor component
vi.mock("../components/admin/RichTextEditor", () => ({
  RichTextEditor: ({ initialContent, onChange }) => (
    <div data-testid="rich-text-editor">
      <textarea
        data-testid="mock-editor"
        defaultValue={initialContent}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  ),
}))

describe("LessonEditor Component", () => {
  const mockLesson: LessonType = {
    id: "test-lesson-1",
    title: "Test Lesson",
    description: "Test Description",
    difficulty: "beginner",
    category: "Blockchain",
    sections: 1,
    pages: 1,
    rating: 4.5,
    reviewCount: 10,
    icon: null,
    sponsored: false,
    sponsorLogo: "",
    points: 100,
  }

  const mockSections: Section[] = [
    {
      id: "section-1",
      title: "Section 1",
      pages: [
        {
          id: "page-1",
          title: "Page 1",
          content: "<p>Test content</p>",
        },
      ],
      quizId: null,
    },
  ]

  const mockQuizzes = [
    {
      id: "quiz-1",
      title: "Blockchain Fundamentals Quiz",
      lesson_id: "test-lesson-1",
      section_id: null,
    },
    {
      id: "quiz-2",
      title: "Blockchain Applications Quiz",
      lesson_id: "test-lesson-1",
      section_id: null,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // Mock the fetchSections function to return mockSections
    vi.mocked(sectionsService.fetchSections).mockResolvedValue(mockSections)

    // Mock the supabase select to return mockQuizzes
    vi.mocked(supabase.from).mockImplementation(() => {
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => {
          return {
            then: vi.fn(),
            data: mockQuizzes,
            error: null,
          }
        }),
      } as any
    })

    // Mock console.log
    vi.spyOn(console, "log").mockImplementation(() => {})
  })

  it("renders the LessonEditor component", () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    render(
      <LessonEditor lesson={mockLesson} onSave={onSave} onCancel={onCancel} />
    )

    // Check if the basic details tab is rendered
    expect(
      screen.getByRole("tab", { name: /basic details/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("tab", { name: /lesson content/i })
    ).toBeInTheDocument()

    // Check if the lesson title input is rendered
    expect(screen.getByText("Title")).toBeInTheDocument()

    // Check if the save button is rendered
    expect(
      screen.getByRole("button", { name: /save lesson/i })
    ).toBeInTheDocument()
  })

  it("calls saveSections when saving an existing lesson", async () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    // Create a lesson with a valid UUID (not a new lesson)
    const existingLesson = {
      ...mockLesson,
      id: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID format
    }

    render(
      <LessonEditor
        lesson={existingLesson}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    // Save the lesson
    const saveButton = screen.getByRole("button", { name: /save lesson/i })
    fireEvent.click(saveButton)

    // Wait for saveSections to be called
    await waitFor(() => {
      expect(sectionsService.saveSections).toHaveBeenCalled()
    })

    // Check if onSave was called
    expect(onSave).toHaveBeenCalled()
  })

  it("calls onSave directly for new lessons", () => {
    const onSave = vi.fn()
    const onCancel = vi.fn()

    // Create a new lesson
    const newLesson = {
      ...mockLesson,
      id: "lesson-new",
    }

    render(
      <LessonEditor lesson={newLesson} onSave={onSave} onCancel={onCancel} />
    )

    // Save the lesson
    const saveButton = screen.getByRole("button", { name: /save lesson/i })
    fireEvent.click(saveButton)

    // Check if onSave was called with the lesson and sections
    expect(onSave).toHaveBeenCalledWith(expect.anything(), expect.anything())

    // saveSections should not be called for new lessons
    expect(sectionsService.saveSections).not.toHaveBeenCalled()
  })

  it("loads quiz data correctly", async () => {
    // Mock the quiz data
    const mockQuizzes = [
      {
        id: "quiz-1",
        title: "Blockchain Fundamentals Quiz",
        lesson_id: "test-lesson-1",
        section_id: null,
      },
      {
        id: "quiz-2",
        title: "Blockchain Applications Quiz",
        lesson_id: "test-lesson-1",
        section_id: null,
      },
    ]

    // Mock the supabase response
    vi.mocked(supabase.from).mockImplementation(() => {
      return {
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockImplementation(() => {
          return {
            then: vi.fn().mockImplementation((callback) => {
              if (callback) {
                callback({ data: mockQuizzes, error: null })
              }
              return { data: mockQuizzes, error: null }
            }),
            data: mockQuizzes,
            error: null,
          }
        }),
      } as any
    })

    // Create a section with a quiz ID
    const sectionWithQuiz: Section = {
      id: "section-with-quiz",
      title: "Section With Quiz",
      pages: [
        {
          id: "page-1",
          title: "Page 1",
          content: "<p>Test content</p>",
        },
      ],
      quizId: "quiz-1",
    }

    // Mock the fetchSections function to return a section with a quiz
    vi.mocked(sectionsService.fetchSections).mockResolvedValue([
      sectionWithQuiz,
    ])

    const onSave = vi.fn()
    const onCancel = vi.fn()

    // Use a valid UUID for the lesson ID
    const lessonWithValidId = {
      ...mockLesson,
      id: "123e4567-e89b-12d3-a456-426614174000", // Valid UUID format
    }

    render(
      <LessonEditor
        lesson={lessonWithValidId}
        onSave={onSave}
        onCancel={onCancel}
      />
    )

    // Wait for sections to load
    await waitFor(() => {
      expect(sectionsService.fetchSections).toHaveBeenCalled()
    })

    // Check that the quiz data was loaded correctly
    await waitFor(() => {
      // The component should have logged the fetched quizzes
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("fetched quizzes"),
        expect.arrayContaining([
          expect.objectContaining({
            id: "quiz-1",
            title: "Blockchain Fundamentals Quiz",
          }),
          expect.objectContaining({
            id: "quiz-2",
            title: "Blockchain Applications Quiz",
          }),
        ])
      )
    })
  })
})
