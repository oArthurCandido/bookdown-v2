import { marked } from "marked";
import { resolveRelative } from "./github";
import { ChapterMetadata } from "./storage";

export function extractChaptersFromMarkdown(md: string, base: string): ChapterMetadata[] {
  const tokens = marked.lexer(md);
  const chapters: ChapterMetadata[] = [];

  const pushListItems = (items: any[]) => {
    for (const it of items) {
      // Find links inside list items
      const textTokens = (it as any).tokens || [];
      for (const t of textTokens) {
        if (t.type === "text" && (t as any).tokens) {
          const linkToken = (t as any).tokens.find((subT: any) => subT.type === "link");
          if (linkToken) {
            const raw = resolveRelative(base, (linkToken as any).href);
            chapters.push({
              title: (linkToken as any).text || "Chapter",
              url: raw,
            });
          }
        } else if (t.type === "link") {
          const raw = resolveRelative(base, (t as any).href);
          chapters.push({
            title: (t as any).text || "Chapter",
            url: raw,
          });
        }
      }
    }
  };

  for (const t of tokens) {
    if (t.type === "list" && (t as any).items?.length) {
      pushListItems((t as any).items);
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
    if (t.type === "heading" && (t as any).depth === 1 && !title) {
      title = (t as any).text;
    }

    if (t.type === "paragraph" && !coverImage) {
      const imgToken = (t as any).tokens?.find((subT: any) => subT.type === "image");
      if (imgToken) {
        coverImage = resolveRelative(base, (imgToken as any).href);
      } else {
        // sometimes HTML img tag is used
        const htmlMatch = (t as any).text.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i);
        if (htmlMatch) {
          coverImage = resolveRelative(base, htmlMatch[1]);
        }
      }
    } else if (t.type === "html" && !coverImage) {
      const htmlMatch = (t as any).text.match(/<img[^>]+src\s*=\s*["']([^"']+)["'][^>]*>/i);
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
