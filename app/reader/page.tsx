"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useBookStore } from "@/lib/store";
import { useMarkdown } from "@/lib/use-markdown";
import { extractBookInfoFromMarkdown, extractChaptersFromMarkdown } from "@/lib/markdown";
import { baseOfRaw, toRawUrl } from "@/lib/github";
import { Header } from "@/components/header";
import { SideNav } from "@/components/side-nav";
import { ReadingArea } from "@/components/reading-area";
import { ReadingProgress } from "@/components/reading-progress";
import { ChapterNavigation } from "@/components/chapter-navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { StorageAdapter, LocalStorageAdapter } from "@/lib/storage";

const storageAdapter: StorageAdapter = new LocalStorageAdapter();

export default function ReaderPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlParam = searchParams.get("url");

  const { books, addBook, activeBookId, setActiveBook, toggleChapterRead, updateBookProgress, markChapterRead } = useBookStore();
  
  const [activeChapterUrl, setActiveChapterUrl] = React.useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [headings, setHeadings] = React.useState<{ id: string; text: string; level: number }[]>([]);
  const [progress, setProgress] = React.useState(0);
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = React.useState(true);

  // Determine raw index url
  const rawIndexUrl = urlParam ? toRawUrl(urlParam) : null;
  const activeBook = books.find((b) => b.id === rawIndexUrl) || books.find((b) => b.id === activeBookId);

  // Fetch index markdown to initialize or verify book
  const { data: indexMd, error: indexError } = useMarkdown(!activeBook && rawIndexUrl ? rawIndexUrl : null);

  // Initialize book if not in store
  React.useEffect(() => {
    if (!rawIndexUrl) return;

    if (activeBook) {
      if (activeBook.id !== activeBookId) {
        setActiveBook(activeBook.id);
      }
      if (!activeChapterUrl) {
        setActiveChapterUrl(activeBook.lastChapterUrl || activeBook.chapters?.[0]?.url || activeBook.indexUrl);
      }
      setIsInitializing(false);
    } else if (indexMd) {
      const base = baseOfRaw(rawIndexUrl);
      const { title, coverImage } = extractBookInfoFromMarkdown(indexMd, base);
      const chapters = extractChaptersFromMarkdown(indexMd, base);
      
      let finalTitle = title;
      if (!finalTitle) {
        const m = indexMd.match(/^\s*#\s+(.+)$/m);
        if (m) finalTitle = m[1].trim();
      }

      const newBook = {
        id: rawIndexUrl,
        title: finalTitle || "Untitled Book",
        indexUrl: rawIndexUrl,
        baseRaw: base,
        coverImage,
        chapters: chapters.length > 0 ? chapters : [{ title: finalTitle || "Document", url: rawIndexUrl }],
        readChapters: [],
      };

      addBook(newBook).then(() => {
        setActiveChapterUrl(newBook.chapters[0].url);
        setIsInitializing(false);
      });
    }
  }, [rawIndexUrl, activeBook, indexMd, addBook, activeBookId, setActiveBook, activeChapterUrl]);

  React.useEffect(() => {
    if (indexError) {
      toast.error("Failed to load book from URL.");
      router.push("/");
    }
  }, [indexError, router]);

  // Fetch active chapter content
  const { data: chapterContent, isLoading: isChapterLoading } = useMarkdown(activeChapterUrl);

  // Handle scroll and progress tracking
  React.useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller || !activeBook || !activeChapterUrl) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(async () => {
          const scrollTop = scroller.scrollTop;
          const scrollHeight = scroller.scrollHeight;
          const clientHeight = scroller.clientHeight;

          const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
          const progressPercent = Math.min(scrollPercentage * 100, 100);
          setProgress(progressPercent);

          // Mark as read if reached end
          if (scrollPercentage >= 0.95) {
            markChapterRead(activeBook.id, activeChapterUrl);
          }

          // Throttle saving progress to avoid hitting storage too much
          // (In a real app, use a proper debounce hook)
          updateBookProgress(activeBook.id, activeChapterUrl, scrollTop);

          ticking = false;
        });
        ticking = true;
      }
    };

    scroller.addEventListener("scroll", handleScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", handleScroll);
  }, [activeBook, activeChapterUrl, markChapterRead, updateBookProgress]);

  // Restore scroll position when chapter loads
  React.useEffect(() => {
    const restoreScroll = async () => {
      if (chapterContent && activeBook && activeChapterUrl && scrollRef.current) {
        // Small delay to allow DOM to render the markdown
        setTimeout(async () => {
          const savedProgress = await storageAdapter.getProgress(activeBook.baseRaw, activeChapterUrl);
          if (scrollRef.current && savedProgress > 0) {
            scrollRef.current.scrollTo({ top: savedProgress });
          }
        }, 100);
      }
    };
    restoreScroll();
  }, [chapterContent, activeBook, activeChapterUrl]);


  if (!urlParam) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">No book URL provided.</p>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </div>
    );
  }

  if (isInitializing || !activeBook) {
    return (
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading book data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden bg-background">
      <ReadingProgress progress={progress} />
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        <SideNav 
          book={activeBook}
          activeChapterUrl={activeChapterUrl}
          onChapterSelect={(url) => {
            setActiveChapterUrl(url);
            setProgress(0);
            if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
          }}
          onToggleRead={(url) => toggleChapterRead(activeBook.id, url)}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
          headings={headings}
        />

        <main 
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth"
        >
          {/* Mobile sidebar toggle inside content area for easy access */}
          <div className="sticky top-0 z-10 p-4 md:hidden flex justify-start pointer-events-none">
            <Button 
              variant="secondary" 
              size="icon" 
              className="pointer-events-auto shadow-md rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {isChapterLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="animate-pulse flex flex-col gap-4 w-full max-w-3xl px-8">
                <div className="h-8 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-5/6" />
                <div className="h-32 bg-muted rounded w-full mt-4" />
              </div>
            </div>
          ) : chapterContent ? (
            <div className="pb-16">
              <ReadingArea 
                content={chapterContent}
                book={activeBook}
                chapterUrl={activeChapterUrl!}
                onHeadingsExtracted={setHeadings}
              />
              <div className="max-w-3xl mx-auto px-4 sm:px-8">
                <ChapterNavigation 
                  book={activeBook}
                  currentChapterUrl={activeChapterUrl!}
                  onNavigate={(url) => {
                    setActiveChapterUrl(url);
                    setProgress(0);
                    if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Failed to load chapter content.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
