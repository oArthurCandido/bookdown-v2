"use client";

import * as React from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book } from "@/lib/storage";

interface SideNavProps {
  book: Book;
  activeChapterUrl: string | null;
  onChapterSelect: (url: string) => void;
  onToggleRead: (url: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  headings?: { id: string; text: string; level: number }[];
  activeHeadingId?: string | null;
}

export function SideNav({
  book,
  activeChapterUrl,
  onChapterSelect,
  onToggleRead,
  isOpen,
  setIsOpen,
  headings = [],
  activeHeadingId,
}: SideNavProps) {
  const readSet = new Set(book.readChapters || []);

  const activeHeadingIndex = activeHeadingId 
    ? headings.findIndex((h) => h.id === activeHeadingId)
    : -1;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-muted/30 border-r transition-transform duration-300 ease-in-out md:static md:translate-x-0 pt-14 md:pt-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full overflow-y-auto p-4 flex flex-col gap-4">
          <h2 className="font-bold text-lg leading-tight mb-2">{book.title}</h2>
          
          <nav className="flex flex-col gap-2">
            {book.chapters.map((chapter) => {
              const isActive = chapter.url === activeChapterUrl;
              const isRead = readSet.has(chapter.url);

              return (
                <div key={chapter.url} className="flex flex-col">
                  <div 
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                      isActive ? "bg-accent text-accent-foreground font-medium" : "text-muted-foreground"
                    )}
                    onClick={() => {
                      onChapterSelect(chapter.url);
                      setIsOpen(false);
                    }}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleRead(chapter.url);
                      }}
                      className={cn(
                        "flex-shrink-0 flex items-center justify-center rounded-full hover:bg-background transition-colors",
                        isRead ? "text-primary" : "text-muted-foreground/50 hover:text-foreground"
                      )}
                      aria-label={isRead ? "Mark as unread" : "Mark as read"}
                    >
                      {isRead ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                    </button>
                    <span className="line-clamp-2">{chapter.title}</span>
                  </div>

                  {/* Inner TOC for active chapter */}
                  {isActive && headings.length > 0 && (
                    <div className="ml-7 mt-1 flex flex-col gap-1 border-l-2 border-muted pl-2 py-1">
                      {headings.map((h, i) => {
                        const isHeadingRead = activeHeadingIndex !== -1 && i < activeHeadingIndex;
                        const isHeadingActive = i === activeHeadingIndex;

                        return (
                          <a
                            key={`${h.id}-${i}`}
                            href={`#${h.id}`}
                            className={cn(
                              "flex items-start gap-2 text-xs py-1 transition-colors hover:text-foreground",
                              isHeadingActive ? "text-primary font-medium" : "text-muted-foreground",
                              h.level === 1 ? "font-medium" : "",
                              h.level === 3 ? "ml-2" : "",
                              h.level === 4 ? "ml-4" : ""
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              const el = document.getElementById(h.id);
                              if (el) {
                                const scroller = el.closest('main');
                                if (scroller) {
                                  const scrollerRect = scroller.getBoundingClientRect();
                                  const elRect = el.getBoundingClientRect();
                                  const scrollTop = scroller.scrollTop;
                                  scroller.scrollTo({
                                    top: scrollTop + (elRect.top - scrollerRect.top) - 20, // 20px top padding
                                    behavior: "smooth"
                                  });
                                } else {
                                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                                }
                              }
                              setIsOpen(false);
                            }}
                          >
                            <span className={cn(
                              "flex-shrink-0 flex items-center justify-center w-3 h-3 rounded-full border mt-0.5 transition-colors",
                              isHeadingRead ? "bg-primary border-primary text-primary-foreground" : 
                              isHeadingActive ? "border-primary bg-primary/20" : "border-muted-foreground/30"
                            )}>
                              {isHeadingRead && <CheckCircle2 className="h-2 w-2" strokeWidth={3} />}
                              {isHeadingActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                            </span>
                            <span className="line-clamp-2 leading-tight flex-1">{h.text}</span>
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
