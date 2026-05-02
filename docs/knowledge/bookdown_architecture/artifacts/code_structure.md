# Code Structure & Main Functions

The application logic is entirely contained within the `<script>` tag in `index.html`.

## Utility Functions
- `$`, `$$`, `byId`: DOM selection helpers.
- `toRawUrl(url)`: Converts GitHub URLs to raw content URLs.
- `baseOfRaw(rawUrl)`: Extracts the directory base for relative link resolution.
- `resolveRelative(base, href)`: Resolves relative paths to absolute URLs.

## Data Extraction (Markdown Parsing)
- `extractChaptersFromMarkdown(md, base)`: Finds the first list in the Markdown content and extracts links as chapters.
- `extractBookInfoFromMarkdown(md, base)`: Extracts the first `#` heading as the title and finds a potential cover image.

## View Management
- `showView(name)`: Switches between `home` and `reader` views.
- `renderHistory()`: Populates the home screen with books from `localStorage`.
- `renderBookTOC()`: Populates the sidebar with chapters.
- `buildInnerTOC(container)`: Generates a TOC for the current chapter based on headings (`h1-h4`).

## Reading Logic
- `openChapter(url, startFromTop)`: Fetches, parses, and renders a chapter. Attaches scroll savers and navigation.
- `saveScrollProgress()`: Throttled function to save current scroll position to `localStorage`.
- `restoreScrollProgress()`: Restores scroll position when a chapter is opened.
- `checkIfChapterCompleted()`: Marks a chapter as read when the user reaches 95% scroll depth.

## Mobile Optimizations
- `setupMobileScrollHandler()`: Implements "auto-hide" behavior for the header on mobile scroll.
- `toggleSidebar()`: Handles the drawer-style sidebar on small screens.
