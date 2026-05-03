# Bookdown Application Overview

Bookdown is a high-performance, responsive web application designed to read Markdown-based books or documentation directly from GitHub repositories. It provides a "Kindle-like" reading experience with progress persistence, custom typography, and navigation features. It was recently migrated from a legacy single-file Vanilla JS application to a modern Next.js architecture.

## Key Features
- **GitHub Integration**: Automatically converts GitHub blob URLs to raw content URLs.
- **Dynamic TOC Extraction**: Parses Markdown to extract chapters and headings.
- **Reading Progress**: Automatically tracks and restores scroll position per chapter.
- **History Management**: Keeps a local history of recently read books with cover images.
- **Responsive Design**: Optimized for both desktop and mobile reading (Reading Mode).

## Technology Stack
- **Framework**: Next.js (App Router), React 18+.
- **State Management**: Zustand (for global book data, appearance settings, and progress persistence).
- **Styling**: Tailwind CSS with Shadcn/UI for components, next-themes for dark mode.
- **Markdown Rendering**: [Marked.js](https://marked.js.org/) for Markdown to HTML conversion.
- **Data Fetching**: React Query (TanStack Query) for fetching Markdown contents.
- **Persistence**: `LocalStorageAdapter` (extensible via `StorageAdapter` interface for future cloud/auth integration).

## Core Data Structures
- **Zustand Store (`useBookStore`)**:
  ```typescript
  interface BookState {
    books: Book[];
    activeBookId: string | null;
    isLoading: boolean;
    // Actions for adding books, toggling read status, and updating progress
  }
  ```
- **Zustand Store (`useAppearanceStore`)**:
  ```typescript
  interface AppearanceState {
    fontFamily: 'sans' | 'serif';
    fontSize: number;
    // Persists typography settings
  }
  ```

## URL Resolution Logic
The app converts standard GitHub URLs to raw URLs:
- `github.com/.../blob/main/README.md` -> `raw.githubusercontent.com/.../main/README.md`
- Handles relative links within Markdown by resolving them against the `baseRaw` URL.
