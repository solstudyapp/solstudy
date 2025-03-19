import { render, screen, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, test, expect, beforeEach, vi } from "vitest"
import { RichTextEditor } from "@/components/admin/RichTextEditor"

// Mock the imageService
vi.mock("@/services/imageService", () => ({
  imageService: {
    uploadImage: vi.fn().mockResolvedValue("https://example.com/image.jpg"),
  },
}))

// Mock the toast
vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}))

describe("RichTextEditor", () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  test("renders the editor with toolbar", async () => {
    render(
      <RichTextEditor
        initialContent="<p>Test content</p>"
        onChange={mockOnChange}
      />
    )

    // Wait for editor to initialize
    await screen.findByText("Test content")

    // Check if table button exists
    expect(screen.getByTitle("Table")).toBeInTheDocument()
  })

  test("can switch between visual and HTML mode", async () => {
    render(
      <RichTextEditor
        initialContent="<p>Test content</p>"
        onChange={mockOnChange}
      />
    )

    // Switch to HTML mode
    const htmlTab = screen.getByRole("tab", { name: /html/i })
    await userEvent.click(htmlTab)

    // Check if we can see the HTML code
    const textarea = screen.getByRole("textbox")
    expect(textarea).toHaveValue("<p>Test content</p>")

    // Modify HTML and check if onChange is called
    await userEvent.clear(textarea)
    await userEvent.type(textarea, "<p>Modified content</p>")
    expect(mockOnChange).toHaveBeenCalledWith("<p>Modified content</p>")

    // Switch back to visual mode
    const visualTab = screen.getByRole("tab", { name: /visual/i })
    await userEvent.click(visualTab)

    // Check if content is updated in visual mode
    expect(screen.getByText("Modified content")).toBeInTheDocument()
  })
})
