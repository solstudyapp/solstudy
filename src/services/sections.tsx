import { supabase } from "@/lib/supabase"
import { Section, Page } from "@/types/lesson"

/**
 * Fetch sections for a lesson from Supabase
 */
export async function fetchSections(
  lessonId: string | number
): Promise<Section[]> {
  console.log("fetchSections called with lessonId:", lessonId)

  try {
    // Skip fetching for new lessons
    if (
      typeof lessonId === "string" &&
      (lessonId === "lesson-new" || lessonId.startsWith("new-lesson-"))
    ) {
      console.log("New lesson detected, returning empty sections array")
      return []
    }

    // Convert string ID to number if needed
    const id =
      typeof lessonId === "string" && !isNaN(Number(lessonId))
        ? Number(lessonId)
        : lessonId

    console.log("fetchSections - converted lessonId:", id)

    // Fetch sections for the lesson
    const { data: sections, error } = await supabase
      .from("sections")
      .select("*")
      .eq("lesson_id", id)
      .order("position", { ascending: true })

    if (error) {
      console.error("Error fetching sections:", error)
      return []
    }

    console.log("fetchSections - raw sections from DB:", sections)

    if (!sections || sections.length === 0) {
      console.log("fetchSections - No sections found for lesson:", lessonId)
      return []
    }

    // For each section, fetch its pages
    const sectionsWithPages = await Promise.all(
      sections.map(async (section) => {
        const { data: pages, error: pagesError } = await supabase
          .from("pages")
          .select("*")
          .eq("section_id", section.id)
          .order("position", { ascending: true })

        if (pagesError) {
          console.error("Error fetching pages for section:", pagesError)
          return {
            id: section.id.toString(),
            title: section.title,
            pages: [],
            quizId: `quiz-${section.id}`,
          }
        }

        // Transform pages to match the Page type
        const transformedPages: Page[] = pages
          ? pages.map((page) => ({
              id: page.id.toString(),
              title: page.title,
              content: page.content_html || page.content || "",
            }))
          : []

        // Return the section with its pages
        return {
          id: section.id.toString(),
          title: section.title,
          pages: transformedPages,
          quizId: section.quiz_id || `quiz-${section.id}`,
        }
      })
    )

    return sectionsWithPages
  } catch (error) {
    console.error("Error in fetchSections:", error)
    return []
  }
}

/**
 * Save sections and pages for a lesson to Supabase
 */
export async function saveSections(
  lessonId: string | number,
  sections: Section[]
): Promise<{ success: boolean; error?: string }> {
  console.log("saveSections called with:", {
    lessonId,
    sections,
    sectionsLength: sections.length,
    sectionIds: sections.map((s) => s.id),
  })

  try {
    // Skip saving for new lessons
    if (
      typeof lessonId === "string" &&
      (lessonId === "lesson-new" || lessonId.startsWith("new-lesson-"))
    ) {
      console.log("New lesson detected, skipping section save")
      return { success: true }
    }

    // Convert string ID to number if needed
    const id =
      typeof lessonId === "string" && !isNaN(Number(lessonId))
        ? Number(lessonId)
        : lessonId

    console.log("saveSections - converted lessonId:", id)

    // Validate that we have a numeric ID
    if (typeof id !== "number") {
      console.error("saveSections - Invalid lesson ID:", lessonId)
      return {
        success: false,
        error: `Invalid lesson ID: ${lessonId}. Expected a number.`,
      }
    }

    // First, get existing sections to determine what to add, update, or delete
    const { data: existingSections, error: fetchError } = await supabase
      .from("sections")
      .select("id")
      .eq("lesson_id", id)

    if (fetchError) {
      console.error("Error fetching existing sections:", fetchError)
      return { success: false, error: fetchError.message }
    }

    console.log("saveSections - existingSections:", existingSections)

    const existingSectionIds = existingSections
      ? existingSections.map((s) => s.id)
      : []
    const newSectionIds = sections
      .map((s) => {
        // If the section ID is a string that can be converted to a number, do so
        if (
          typeof s.id === "string" &&
          !isNaN(Number(s.id)) &&
          !s.id.startsWith("section-") &&
          !s.id.includes("section")
        ) {
          return Number(s.id)
        }
        return null // This is a new section with a temporary ID
      })
      .filter((id) => id !== null) as number[]

    // Sections to delete (exist in DB but not in the new list)
    const sectionsToDelete = existingSectionIds.filter(
      (id) => !newSectionIds.includes(id)
    )

    // Delete sections that are no longer present
    if (sectionsToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("sections")
        .delete()
        .in("id", sectionsToDelete)

      if (deleteError) {
        console.error("Error deleting sections:", deleteError)
        return { success: false, error: deleteError.message }
      }
    }

    // Add or update sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const isNewSection =
        typeof section.id === "string" &&
        (section.id.startsWith("section-") ||
          section.id.includes("section") ||
          isNaN(Number(section.id)))

      // Prepare section data
      const sectionData = {
        lesson_id: id,
        title: section.title,
        quiz_id: section.quizId,
        position: i,
      }

      let sectionId: number

      if (isNewSection) {
        // Insert new section
        const { data: insertedSection, error: insertError } = await supabase
          .from("sections")
          .insert(sectionData)
          .select("id")
          .single()

        if (insertError) {
          console.error("Error inserting section:", insertError)
          return { success: false, error: insertError.message }
        }

        sectionId = insertedSection.id
      } else {
        // Update existing section
        const numericId =
          typeof section.id === "string" ? Number(section.id) : section.id

        const { error: updateError } = await supabase
          .from("sections")
          .update(sectionData)
          .eq("id", numericId)

        if (updateError) {
          console.error("Error updating section:", updateError)
          return { success: false, error: updateError.message }
        }

        sectionId = numericId as number
      }

      // Now handle pages for this section
      const result = await savePages(sectionId, section.pages)
      if (!result.success) {
        return result
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in saveSections:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Save pages for a section to Supabase
 */
async function savePages(
  sectionId: number,
  pages: Page[]
): Promise<{ success: boolean; error?: string }> {
  console.log("savePages called with:", {
    sectionId,
    pages,
    pagesLength: pages.length,
    pageIds: pages.map((p) => p.id),
  })

  try {
    // First, get existing pages to determine what to add, update, or delete
    const { data: existingPages, error: fetchError } = await supabase
      .from("pages")
      .select("id")
      .eq("section_id", sectionId)

    if (fetchError) {
      console.error("Error fetching existing pages:", fetchError)
      return { success: false, error: fetchError.message }
    }

    console.log("savePages - existingPages:", existingPages)

    const existingPageIds = existingPages ? existingPages.map((p) => p.id) : []
    const newPageIds = pages
      .map((p) => {
        // If the page ID is a string that can be converted to a number, do so
        if (
          typeof p.id === "string" &&
          !isNaN(Number(p.id)) &&
          !p.id.startsWith("page-") &&
          !p.id.includes("page")
        ) {
          return Number(p.id)
        }
        return null // This is a new page with a temporary ID
      })
      .filter((id) => id !== null) as number[]

    // Pages to delete (exist in DB but not in the new list)
    const pagesToDelete = existingPageIds.filter(
      (id) => !newPageIds.includes(id)
    )

    // Delete pages that are no longer present
    if (pagesToDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("pages")
        .delete()
        .in("id", pagesToDelete)

      if (deleteError) {
        console.error("Error deleting pages:", deleteError)
        return { success: false, error: deleteError.message }
      }
    }

    // Add or update pages
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const isNewPage =
        typeof page.id === "string" &&
        (page.id.startsWith("page-") ||
          page.id.includes("page") ||
          isNaN(Number(page.id)))

      // Prepare page data
      const pageData = {
        section_id: sectionId,
        title: page.title,
        content: page.content,
        content_html: page.content,
        position: i,
      }

      if (isNewPage) {
        // Insert new page
        const { error: insertError } = await supabase
          .from("pages")
          .insert(pageData)

        if (insertError) {
          console.error("Error inserting page:", insertError)
          return { success: false, error: insertError.message }
        }
      } else {
        // Update existing page
        const numericId =
          typeof page.id === "string" ? Number(page.id) : page.id

        const { error: updateError } = await supabase
          .from("pages")
          .update(pageData)
          .eq("id", numericId)

        if (updateError) {
          console.error("Error updating page:", updateError)
          return { success: false, error: updateError.message }
        }
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in savePages:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
