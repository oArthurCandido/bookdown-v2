import * as React from "react";
import Link from "next/link";
import { Book, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book as BookType } from "@/lib/storage";

interface BookCardProps {
  book: BookType;
  onRemove: (id: string) => void;
}

export function BookCard({ book, onRemove }: BookCardProps) {
  const chapterCount = book.chapters?.length || 1;
  const readCount = book.readChapters?.length || 0;
  const progressPercent = chapterCount > 0 ? Math.round((readCount / chapterCount) * 100) : 0;

  return (
    <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md pt-0" >
      <div className="relative aspect-[3/4] w-full bg-muted/30 overflow-hidden group">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.title}`}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary">
            <Book className="h-16 w-16 opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <Button asChild variant="secondary" className="scale-90 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
            <Link href={`/reader?url=${encodeURIComponent(book.indexUrl)}`}>
              Open Book
            </Link>
          </Button>
        </div>
      </div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="line-clamp-2 text-base leading-tight">
          {book.title || "Untitled Book"}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm text-muted-foreground flex-1">
        <p>{chapterCount} {chapterCount === 1 ? 'chapter' : 'chapters'}</p>
        <p>{progressPercent}% read</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="default" className="flex-1" asChild>
          <Link href={`/reader?url=${encodeURIComponent(book.indexUrl)}`}>
            Read
          </Link>
        </Button>
        <Button variant="outline" size="icon" onClick={() => onRemove(book.id)} aria-label="Remove book">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}
