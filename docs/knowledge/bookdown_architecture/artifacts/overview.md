# Bookdown Application Overview

Bookdown is a lightweight, single-file web application designed to read Markdown-based books or documentation directly from GitHub repositories. It provides a "Kindle-like" reading experience with progress persistence and navigation features.

## Key Features
- **GitHub Integration**: Automatically converts GitHub blob URLs to raw content URLs.
- **Dynamic TOC Extraction**: Parses Markdown to extract chapters and headings.
- **Reading Progress**: Automatically tracks and restores scroll position per chapter.
- **History Management**: Keeps a local history of recently read books with cover images.
- **Responsive Design**: Optimized for both desktop and mobile reading (Reading Mode).

## Technology Stack
- **Structure/Logic**: Vanilla HTML5, Javascript (ES6+).
- **Styling**: Vanilla CSS3 with HSL variables for theme control.
- **Markdown Rendering**: [Marked.js](https://marked.js.org/).
- **Persistence**: `localStorage` (History, Progress, Read Status).

## Core Data Structures
- **State Object**:
  ```javascript
  let state = {
    page: "home" | "reader",
    book: {
      id: string (rawIndexUrl),
      title: string,
      indexUrl: string,
      baseRaw: string,
      coverImage: string | null,
      chapters: [{ title, url }],
      lastChapterUrl: string,
      lastScroll: number,
      readChapters: string[] // URLs of read chapters
    },
    chapterUrl: string,
    observer: IntersectionObserver | null
  };
  ```

## URL Resolution Logic
The app converts standard GitHub URLs to raw URLs:
- `github.com/.../blob/main/README.md` -> `raw.githubusercontent.com/.../main/README.md`
- Handles relative links within Markdown by resolving them against the `baseRaw` URL.
