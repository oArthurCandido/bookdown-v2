import { marked } from "marked";
import { resolveRelative } from "./github";
import { ChapterMetadata } from "./storage";

export function extractChaptersFromMarkdown(md: string, base: string): ChapterMetadata[] {
  const tokens = marked.lexer(md);
  const chapters: ChapterMetadata[] = [];

  const pushListItems = (items: any[]) => {
    for (const it of items) {
      // Find links inside list items
      const textTokens = it.tokens || [];
      for (const t of textTokens) {
        if (t.type === "text" && t.tokens) {
          const linkToken = t.tokens.find((subT: any) => subT.type === "link");
          if (linkToken) {
            const raw = resolveRelative(base, linkToken.href);
            chapters.push({
              title: linkToken.text || "Chapter",
              url: raw,
            });
          }
        } else if (t.type === "link") {
          const raw = resolveRelative(base, t.href);
          chapters.push({
            title: t.text || "Chapter",
            url: raw,
          });
        }
      }
    }
  };

  for (const t of tokens) {
    if (t.type === "list" && t.items?.length) {
      pushListItems(t.items);
      if (chapters.length) break; // Only take the first list with links
    }
  }

  return chapters;
}

export function extractBookInfoFromMarkdown(md: string, base: string): { title: string | null; coverImage: string | null } {
  const tokens = marked.lexer(md);
  let coverImage: string | null = null;
  let title: string | null = null;

  for (const t of tokens) {
    if (t.type === "heading" && t.depth === 1 && !title) {
      title = t.text;
    }

    if (t.type === "paragraph" && !coverImage) {
      const imgToken = t.tokens?.find((subT: any) => subT.type === "image");
      if (imgToken) {
        coverImage = resolveRelative(base, imgToken.href);
      } else {
        // sometimes HTML img tag is used
        const htmlMatch = t.text.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i);
        if (htmlMatch) {
          coverImage = resolveRelative(base, htmlMatch[1]);
        }
      }
    } else if (t.type === "html" && !coverImage) {
      const htmlMatch = t.text.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i);
      if (htmlMatch) {
        coverImage = resolveRelative(base, htmlMatch[1]);
      }
    }
  }

  // Fallback regex for cover image if not found by lexer
  if (!coverImage) {
    const imgMatch = md.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i);
    if (imgMatch) {
      coverImage = resolveRelative(base, imgMatch[1]);
    }
  }

  return { title, coverImage };
}
