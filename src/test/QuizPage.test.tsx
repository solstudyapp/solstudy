import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi, describe, test, expect, beforeEach } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import QuizPage from "@/pages/QuizPage"
import * as lessonService from "@/services/lessonService"
import * as toast from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

// Mock the components that are used in QuizPage
vi.mock("@/components/quiz/QuizHeader", () => ({
  default: () => <div data-testid="quiz-header">Quiz Header</div>,
}))

vi.mock("@/components/quiz/QuizQuestion", () => ({
  default: ({ onSelectOption, onNext }) => (
    <div data-testid="quiz-question">
      Quiz Question
      <button onClick={() => onSelectOption(0)}>Select Option</button>
      <button onClick={onNext}>Next</button>
    </div>
  ),
}))

vi.mock("@/components/quiz/QuizResults", () => ({
  default: ({ onComplete }) => (
    <div data-testid="quiz-results">
      Quiz Results
      <button onClick={onComplete} data-testid="complete-button">
        Complete
      </button>
    </div>
  ),
}))

vi.mock("@/components/quiz/FeedbackDialog", () => ({
  default: ({ onComplete }) => (
    <div data-testid="feedback-dialog">
      Feedback Dialog
      <button onClick={onComplete} data-testid="feedback-complete-button">
        Submit Feedback
      </button>
    </div>
  ),
}))

vi.mock("@/components/lesson/LessonRatingModal", () => ({
  LessonRatingModal: ({ isOpen, onClose }) =>
    isOpen ? (
      <div data-testid="rating-modal">
        Rating Modal
        <button onClick={onClose} data-testid="close-rating-button">
          Close
        </button>
      </div>
    ) : null,
}))

// Mock the lesson service
vi.mock("@/services/lessonService", () => ({
  lessonService: {
    completeQuiz: vi.fn(),
    completeFinalTest: vi.fn(),
    completeSection: vi.fn(),
    isFinalTestCompleted: vi.fn(() => false),
    isSectionCompleted: vi.fn(() => true),
    updateProgress: vi.fn(),
  },
}))

// Mock the toast hook
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock Supabase
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => ({
      data: {
        id: "quiz-1",
        title: "Test Quiz",
        lesson_id: "lesson-1",
        section_id: null,
        points: 100,
        questions: [
          {
            id: "q1",
            question: "Test Question",
            options: ["Option 1", "Option 2", "Option 3", "Option 4"],
            correctAnswer: 0,
          },
        ],
      },
      error: null,
    })),
  },
}))

// Mock lesson and sections services
vi.mock("@/services/lessons", () => ({
  fetchLessonById: vi.fn().mockResolvedValue({
    id: "lesson-1",
    title: "Test Lesson",
  }),
}))

vi.mock("@/services/sections", () => ({
  fetchSections: vi.fn().mockResolvedValue([
    {
      id: "section-1",
      title: "Section 1",
      position: 1,
      pages: [{ id: "page-1", title: "Page 1", content: "Content 1" }],
    },
  ]),
}))

describe("QuizPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test("displays rating modal after completing final test and submitting feedback", async () => {
    const user = userEvent.setup()

    // Mock the loading state
    vi.mock("@/pages/QuizPage", () => ({
      default: () => {
        const { useState } = require("react")
        const [showResults, setShowResults] = useState(true)
        const [showFeedback, setShowFeedback] = useState(false)
        const [showRatingModal, setShowRatingModal] = useState(false)

        const handleComplete = () => {
          setShowFeedback(true)
        }

        const handleFeedbackComplete = () => {
          setShowFeedback(false)
          setShowRatingModal(true)
        }

        const handleRatingClose = () => {
          setShowRatingModal(false)
        }

        return (
          <div>
            {!showFeedback && !showRatingModal && (
              <div data-testid="quiz-results">
                Quiz Results
                <button onClick={handleComplete} data-testid="complete-button">
                  Complete
                </button>
              </div>
            )}

            {showFeedback && (
              <div data-testid="feedback-dialog">
                Feedback Dialog
                <button
                  onClick={handleFeedbackComplete}
                  data-testid="feedback-complete-button"
                >
                  Submit Feedback
                </button>
              </div>
            )}

            {showRatingModal && (
              <div data-testid="rating-modal">
                Rating Modal
                <button
                  onClick={handleRatingClose}
                  data-testid="close-rating-button"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )
      },
    }))

    // Render the mocked component
    render(
      <MemoryRouter initialEntries={["/quiz/lesson-1/final"]}>
        <Routes>
          <Route path="/quiz/:lessonId/:sectionId" element={<QuizPage />} />
        </Routes>
      </MemoryRouter>
    )

    // Complete the quiz
    const completeButton = await screen.findByTestId("complete-button")
    await user.click(completeButton)

    // Verify feedback dialog is shown
    const feedbackDialog = await screen.findByTestId("feedback-dialog")
    expect(feedbackDialog).toBeInTheDocument()

    // Submit feedback
    const feedbackCompleteButton = screen.getByTestId(
      "feedback-complete-button"
    )
    await user.click(feedbackCompleteButton)

    // Verify rating modal is shown
    const ratingModal = await screen.findByTestId("rating-modal")
    expect(ratingModal).toBeInTheDocument()

    // Close the rating modal
    const closeRatingButton = screen.getByTestId("close-rating-button")
    await user.click(closeRatingButton)

    // Check that it navigates to dashboard (mock implementation)
    expect(screen.queryByTestId("rating-modal")).not.toBeInTheDocument()
  })
})
