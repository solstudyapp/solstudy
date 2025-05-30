import { supabase } from "@/lib/supabase"
import { Section, Page, DbSection, DbPage } from "@/types/lesson"
import * as dbModule from "@/lib/db"
import {
  dbToFrontendSection,
  dbToFrontendPage,
  frontendToDbSection,
  frontendToDbPage,
  safelyParseId,
  isTemporaryId,
} from "@/lib/type-converters"

// For testing purposes - allows injecting mock db functions
let db = dbModule
export function _setDbForTesting(mockDb: typeof dbModule) {
  const originalDb = db
  db = mockDb
  return () => {
    db = originalDb
  }
}

/**
 * Fetch sections for a lesson from Supabase
 */
export async function fetchSections(
  lessonId: string | number
): Promise<Section[]> {
  try {
    // Skip fetching for new lessons
    if (
      typeof lessonId === "string" &&
      (lessonId === "lesson-new" || lessonId.startsWith("new-lesson-"))
    ) {
      return []
    }

    // Parse the lesson ID (will always return a string since it's a UUID)
    const id = safelyParseId(lessonId, "lesson")

    if (id === null) {
      console.error("fetchSections - Invalid lesson ID:", lessonId)
      return []
    }

    // Fetch sections for the lesson
    try {
      const sections = (await db.fetchSectionsByLessonId(
        id
      )) as unknown as DbSection[]

      if (!sections || sections.length === 0) {
        return []
      }

      // For each section, fetch its pages
      const sectionsWithPages = await Promise.all(
        sections.map(async (section: DbSection) => {
          const pages = (await db.fetchPagesBySectionId(
            section.id
          )) as unknown as DbPage[]

          // Return the section with its pages
          return dbToFrontendSection(section, pages)
        })
      )

      return sectionsWithPages
    } catch (sectionError) {
      console.error("Error fetching sections:", sectionError)
      return []
    }
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
  try {
    // Skip saving for new lessons
    if (
      typeof lessonId === "string" &&
      (lessonId === "lesson-new" || lessonId.startsWith("new-lesson-"))
    ) {
      return { success: true }
    }

    // Parse the lesson ID (will always return a string since it's a UUID)
    const id = safelyParseId(lessonId, "lesson")

    if (id === null) {
      console.error("saveSections - Invalid lesson ID:", lessonId)
      return {
        success: false,
        error: `Invalid lesson ID: ${lessonId}. Expected a UUID.`,
      }
    }

    // First, get existing sections to determine what to add, update, or delete
    const existingSections = (await db.fetchSectionsByLessonId(
      id
    )) as unknown as DbSection[]

    const existingSectionIds = existingSections
      ? existingSections.map((s) => s.id)
      : []

    const newSectionIds = sections
      .map((s) => {
        // If the section ID is a string that can be converted to a number and is not a temporary ID
        if (
          typeof s.id === "string" &&
          !isNaN(Number(s.id)) &&
          !isTemporaryId(s.id)
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
      for (const sectionId of sectionsToDelete) {
        await db.deleteSection(sectionId)
      }
    }

    // Add or update sections
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i]
      const isNewSection = isTemporaryId(section.id)

      // Prepare section data
      const sectionData = frontendToDbSection(section, id, i)

      let sectionId: number

      if (isNewSection) {
        // Insert new section

        const result = await db.createSection(sectionData)

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Failed to create section",
          }
        }

        sectionId = result.id!
      } else {
        // Update existing section
        const numericId = Number(section.id)

        const result = await db.updateSection(numericId, sectionData)

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Failed to update section",
          }
        }

        sectionId = numericId
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
  try {
    // First, get existing pages to determine what to add, update, or delete
    const existingPages = (await db.fetchPagesBySectionId(
      sectionId
    )) as unknown as DbPage[]

    const existingPageIds = existingPages ? existingPages.map((p) => p.id) : []
    const newPageIds = pages
      .map((p) => {
        // If the page ID is a string that can be converted to a number, do so
        if (
          typeof p.id === "string" &&
          !isNaN(Number(p.id)) &&
          !isTemporaryId(p.id)
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
      for (const pageId of pagesToDelete) {
        await db.deletePage(pageId)
      }
    }

    // To handle the unique constraint (section_id, position),
    // we'll use a two-phase approach:

    // Phase 1: Update all pages with temporary positions to avoid conflicts
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      if (!isTemporaryId(page.id)) {
        const numericId = Number(page.id)
        // Use negative positions temporarily to avoid conflicts with the unique constraint
        // This works because our real positions are always non-negative
        const tempPosition = -(i + 1000) // Ensure it's negative and unique

        await db.updatePage(numericId, {
          position: tempPosition,
        })
      }
    }

    // Phase 2: Now update all pages with their final positions
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      const isNewPage = isTemporaryId(page.id)

      // Ensure position is set explicitly based on array index
      const pageData = frontendToDbPage(page, sectionId, i)

      if (isNewPage) {
        // Insert new page
        const result = await db.createPage(pageData)

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Failed to create page",
          }
        }
      } else {
        // Update existing page
        const numericId = Number(page.id)
        const result = await db.updatePage(numericId, pageData)

        if (!result.success) {
          return {
            success: false,
            error: result.error || "Failed to update page",
          }
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
