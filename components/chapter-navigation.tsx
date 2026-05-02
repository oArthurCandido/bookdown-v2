import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Book } from "@/lib/storage";

interface ChapterNavigationProps {
  book: Book;
  currentChapterUrl: string;
  onNavigate: (url: string) => void;
}

export function ChapterNavigation({ book, currentChapterUrl, onNavigate }: ChapterNavigationProps) {
  if (!book.chapters || book.chapters.length <= 1) return null;

  const currentIndex = book.chapters.findIndex(ch => ch.url === currentChapterUrl);
  if (currentIndex === -1) return null;

  const prevChapter = currentIndex > 0 ? book.chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < book.chapters.length - 1 ? book.chapters[currentIndex + 1] : null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 pt-8 border-t">
      {prevChapter ? (
        <Button 
          variant="outline" 
          className="w-full sm:w-auto flex flex-col items-start h-auto py-3 px-4 gap-1"
          onClick={() => onNavigate(prevChapter.url)}
        >
          <div className="flex items-center text-xs text-muted-foreground uppercase tracking-wider">
            <ChevronLeft className="mr-1 h-3 w-3" /> Previous
          </div>
          <div className="font-medium truncate max-w-[200px]">{prevChapter.title}</div>
        </Button>
      ) : (
        <div /> // empty div to maintain flex-between spacing
      )}

      {nextChapter && (
        <Button 
          variant="outline" 
          className="w-full sm:w-auto flex flex-col items-end h-auto py-3 px-4 gap-1"
          onClick={() => onNavigate(nextChapter.url)}
        >
          <div className="flex items-center text-xs text-muted-foreground uppercase tracking-wider">
            Next <ChevronRight className="ml-1 h-3 w-3" />
          </div>
          <div className="font-medium truncate max-w-[200px]">{nextChapter.title}</div>
        </Button>
      )}
    </div>
  );
}
