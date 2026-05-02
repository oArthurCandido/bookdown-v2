"use client";

import * as React from "react";
import { marked } from "marked";
import { resolveRelative, baseOfRaw } from "@/lib/github";
import { Book } from "@/lib/storage";

interface ReadingAreaProps {
  content: string;
  book: Book;
  chapterUrl: string;
  onHeadingsExtracted: (headings: { id: string; text: string; level: number }[]) => void;
}

export function ReadingArea({ content, book, chapterUrl, onHeadingsExtracted }: ReadingAreaProps) {
  const articleRef = React.useRef<HTMLElement>(null);
  const [html, setHtml] = React.useState("");

  React.useEffect(() => {
    // Parse markdown
    marked.setOptions({
      gfm: true,
      breaks: false,
    });
    
    // marked.parse can be synchronous if we don't use async extensions
    const parsedHtml = marked.parse(content, { async: false }) as string;
    setHtml(parsedHtml);
  }, [content]);

  React.useEffect(() => {
    if (!articleRef.current || !html) return;

    const container = articleRef.current;
    const base = baseOfRaw(chapterUrl);

    // Rewrite resource links (images, links)
    const imgs = container.querySelectorAll("img");
    imgs.forEach((img) => {
      const src = img.getAttribute("src");
      if (src) {
        img.setAttribute("src", resolveRelative(base, src));
        img.setAttribute("loading", "lazy");
      }
    });

    const links = container.querySelectorAll("a");
    links.forEach((a) => {
      const href = a.getAttribute("href");
      if (href) {
        // If it's not a hash link, resolve it
        if (!href.startsWith("#")) {
          a.setAttribute("href", resolveRelative(base, href));
          a.setAttribute("target", "_blank");
        }
      }
    });

    // Extract headings for inner TOC
    const headingElements = container.querySelectorAll("h1, h2, h3, h4");
    const extractedHeadings: { id: string; text: string; level: number }[] = [];
    
    const slugify = (str: string) => 
      str.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");

    headingElements.forEach((h, i) => {
      const text = h.textContent || "";
      let id = h.id;
      if (!id) {
        id = slugify(text) || `sec-${i}`;
        h.id = id;
      }
      extractedHeadings.push({
        id,
        text,
        level: parseInt(h.tagName.substring(1), 10)
      });
    });

    onHeadingsExtracted(extractedHeadings);

  }, [html, chapterUrl, onHeadingsExtracted]);

  return (
    <article 
      ref={articleRef}
      className="prose prose-slate dark:prose-invert max-w-3xl mx-auto py-8 px-4 sm:px-8 pb-32"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
