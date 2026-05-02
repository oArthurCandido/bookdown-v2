# Migration Plan: Single-file to Next.js

This document outlines the strategy for transforming the single-file Vanilla JS application into a robust Next.js application using Shadcn/UI, Zustand, and React Query.

## Component Architecture

### 1. Global Shell & Layout
- **AppShell**: Root container managing the high-level layout.
- **Header**: Sticky navigation bar.
  - **URLInput**: Specialized input component for GitHub links.
  - **ExitButton**: Return to home view.
- **Providers**: Wrapper for React Query, Next-Themes, and Sonner (for notifications).

### 2. Home View (Bookshelf)
- **Bookshelf**: The grid container for saved books.
- **BookCard**: Individual book entry.
  - Displays cover image (fetched or placeholder).
  - Shows progress/chapter count.
  - Actions: Open, Remove from history.
- **EmptyState**: Informational UI when no books are saved.

### 3. Reader View
- **ReaderContainer**: Grid layout (320px Sidebar | 1fr Content).
- **SideNav**: Book-level Table of Contents.
  - **ChapterItem**: Link to chapter with "Read" status toggle.
  - **InnerTOC**: Nested list of headings within the active chapter.
- **ReadingArea**: The main content scrollable area.
  - **ReadingProgress**: Top-fixed progress bar.
  - **MarkdownRenderer**: Logic for rendering HTML from Markdown (using `marked`).
  - **ChapterNavigation**: Footer with Previous/Next chapter buttons.

## State & Storage Architecture (Decoupled)

To ensure the app can scale from `localStorage` to a full database/auth system, we will implement a **Storage Adapter** pattern:

### 1. Storage Interface
- We will define a `StorageAdapter` interface that handles CRUD operations for books, history, and reading progress.
- **Initial Implementation**: `LocalStorageAdapter` (using Zustand's `persist` or custom logic).
- **Future Ready**: `DatabaseAdapter` or `CloudSyncAdapter` can be plugged in without changing component logic.

### 2. Zustand Store (`useBookStore`)
- The store will interact only with the `StorageAdapter`.
- It will manage the "Local First" state, ensuring the UI is always optimistic and responsive.

### 3. Dark Mode & Theming
- **Next-Themes**: Integrate `next-themes` for system-aware dark mode.
- **Color Palette**: Use CSS variables (HSL) compatible with Shadcn/UI for consistent theming across both Light and Dark modes.
- **Theme Toggle**: Add a `ThemeToggle` component to the Header.

## Roadmap
1. [ ] **Setup Foundation**:
   - Providers (React Query, ThemeProvider, Sonner).
   - Define `StorageAdapter` interface and `LocalStorageAdapter`.
2. [ ] **Core Store**:
   - Implement `useBookStore` using the adapter.
3. [ ] **Utilities**:
   - Port GitHub resolver and Markdown parsing logic.
4. [ ] **UI Components**:
   - **Header**: Logo, `UrlInput`, `ThemeToggle`, `ExitButton`.
   - **HomeView**: `Bookshelf`, `BookCard` (with Dark Mode styles).
   - **ReaderView**: `SideNav`, `ReadingArea`, `ReadingProgress`.
5. [ ] **Integrations**:
   - React Query for Markdown fetching.
   - Reading progress persistence via adapter.
6. [ ] **Polish**:
   - Animations (Framer Motion).
   - Responsive refinements and accessibility (Aria labels).
