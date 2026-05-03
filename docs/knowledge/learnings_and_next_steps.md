# Session Learnings & Next Steps

This document summarizes the technical learnings and architectural decisions made during the migration of Bookdown from a single-file Vanilla JS application to a modern Next.js architecture. This prepares the ground for future feature requests and scaling.

## Technical Learnings

### 1. Scroll State Management & CSS Jitter
**Learning**: Applying global `scroll-smooth` via CSS (e.g., `scroll-smooth` on the `<main>` scroll container) intercepts programmatic scroll events like `scrollTo({ top: val })`. During the smooth scroll animation upon entering a book, multiple `scroll` events are fired. This tricked the throttled progress-saver into capturing intermediate, incomplete scroll positions, leading to an insidious bug where exiting the reader without scrolling would save an inaccurate position.
**Solution**: We removed global `scroll-smooth` behavior and restricted it only to explicit user-driven navigation actions (e.g., clicking on a TOC link triggers `scrollTo({ behavior: "smooth" })`). When automatically restoring the user's progress upon opening the book, the scroll is instant (`behavior: "auto"`), preventing inaccurate saves and providing a better user experience.

### 2. React DOM Reconciliation vs Manual DOM Injection
**Learning**: In the legacy Vanilla JS app, we manually injected `id` attributes into headings (e.g., `h1`, `h2`) after the HTML was rendered by `marked.js`. In React, attempting to modify the DOM directly *after* rendering caused hydration mismatches and issues with React's reconciliation engine (the IDs would sometimes disappear on re-renders).
**Solution**: We perform all HTML mutations (ID injection for headings, intercepting external links, resolving relative paths) entirely *in memory* using an off-screen `document.createElement("div")` within a `useEffect`, and only then pass the finalized, stable HTML string to React's `dangerouslySetInnerHTML`.

### 3. Tailwind Typography & Dynamic Sizing
**Learning**: Implementing dynamic font sizing requested by the user could have been complex. However, Tailwind's `@tailwindcss/typography` plugin (`.prose` class) internally scales all margins, paddings, and child text sizes (headings, blockquotes, etc.) using `em` units. 
**Solution**: We created a Zustand `AppearanceStore` and dynamically applied the user's chosen base `fontSize` (in pixels) as an inline style strictly to the `<article>` wrapper in `reading-area.tsx`. Tailwind handles the rest, resulting in perfect, proportional scaling of the entire document without messy custom CSS.

### 4. Decoupling Persistence for the Future
**Learning**: The old application coupled `localStorage` reads/writes tightly with DOM updates.
**Solution**: We abstracted persistence into a `StorageAdapter` interface (currently implemented as `LocalStorageAdapter`). The Zustand store (`useBookStore`) acts as a middleman, updating the UI instantly (optimistic updates) while persisting to the adapter in the background. This guarantees that implementing cloud syncing (e.g., Supabase or Firebase) in the future will require zero changes to the UI components.

## Prepared Ground / Next Steps

The application is now structurally sound and ready for advanced features:
1. **Cloud Synchronization**: With the `StorageAdapter` pattern, the user can easily request a "Login with GitHub/Google" feature to sync their reading progress across mobile and desktop devices.
2. **Search functionality**: The modular structure allows us to easily implement a local full-text search feature for downloaded books, caching the Markdown locally.
3. **PWA (Progressive Web App)**: Next.js makes it trivial to convert this high-performance reader into an installable PWA for offline reading.
4. **Enhanced Markdown Rendering**: We can expand the `ReadingArea` logic to inject custom React components (like syntax-highlighted code blocks or interactive widgets) by replacing `dangerouslySetInnerHTML` with a robust library like `react-markdown` if the requirements grow.
