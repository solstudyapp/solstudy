# User Progress Tracking System

This document outlines the user progress tracking system implemented in the SolStudy application.

## Database Schema

The user progress is tracked in the `user_progress` table with the following structure:

```sql
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES sections(id) ON DELETE CASCADE,
  page_id TEXT REFERENCES pages(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id, section_id, page_id)
);
```

## Service Layer

The user progress functionality is implemented in the following files:

1. `src/services/userProgressService.ts` - Core service functions for interacting with the database
2. `src/hooks/use-progress.ts` - React hook for using the progress service in components
3. `src/components/lesson/PageCompletion.tsx` - UI component for marking pages as completed
4. `src/migrations/user_progress.sql` - SQL migration for setting up the database schema

## Key Features

### Progress Tracking

- **Page Completion**: Track individual page completion status
- **Section Completion**: Mark entire sections as completed
- **Progress Calculation**: Calculate overall lesson progress as a percentage
- **Points Tracking**: Track points earned from completed lessons

### Components

- **PageCompletion**: A button component that allows users to mark a page as completed
- **LessonNavigation**: Enhanced with progress tracking when moving between sections
- **LessonContent**: Displays the page completion status and button

## Usage

### Marking a Page as Completed

```tsx
import { PageCompletion } from '@/components/lesson/PageCompletion';

// In your component
<PageCompletion
  lessonId="intro-to-blockchain"
  sectionId="section-1"
  pageId="page-1"
  onComplete={() => {
    // Optional callback when page is completed
  }}
/>
```

### Using the Progress Hook

```tsx
import { useProgress } from '@/hooks/use-progress';

function MyComponent() {
  const { 
    isUpdating,
    completePage,
    checkPageCompletion,
    completeSection
  } = useProgress();
  
  // Check if a page is completed
  useEffect(() => {
    const checkCompletion = async () => {
      const isCompleted = await checkPageCompletion('lessonId', 'sectionId', 'pageId');
      // Do something with the result
    };
    
    checkCompletion();
  }, []);
  
  // Mark a page as completed
  const handleComplete = async () => {
    const success = await completePage('lessonId', 'sectionId', 'pageId');
    if (success) {
      // Handle successful completion
    }
  };
  
  // Mark an entire section as completed
  const handleSectionComplete = async () => {
    const success = await completeSection('lessonId', 'sectionId');
    if (success) {
      // Handle successful section completion
    }
  };
  
  return (
    <div>
      {/* Your component JSX */}
      <button 
        onClick={handleComplete}
        disabled={isUpdating}
      >
        {isUpdating ? 'Updating...' : 'Mark as Completed'}
      </button>
    </div>
  );
}
```

## Implementation Details

### User Progress Service

The `userProgressService` provides the following functions:

- `getCoursesInProgress`: Get all courses that the user has started but not completed
- `getCompletedCourses`: Get all courses that the user has completed
- `getTotalPoints`: Get the total points earned by the user
- `updatePageProgress`: Update the completion status of a specific page
- `completeSectionProgress`: Mark all pages in a section as completed
- `isPageCompleted`: Check if a specific page is completed

### Progress Hook

The `useProgress` hook provides a React-friendly interface to the progress service with the following features:

- State management for loading and completion status
- Caching of completion status to reduce database queries
- Error handling with toast notifications
- Simplified API for common operations

## Security

The user progress table has row-level security policies that ensure users can only:

- View their own progress data
- Update their own progress data
- Insert progress data for themselves
- Delete their own progress data

This ensures that user progress is private and secure. 