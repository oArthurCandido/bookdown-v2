"use client";

import { useEffect } from "react";
import { useBookStore } from "@/lib/store";
import { BookCard } from "@/components/book-card";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { BookOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { books, isLoading, error, initialize, removeBook, clearAll } = useBookStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const handleRemove = async (id: string) => {
    if (confirm("Are you sure you want to remove this book?")) {
      await removeBook(id);
      toast.success("Book removed from history.");
    }
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      await clearAll();
      toast.success("History cleared.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto p-4 sm:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">My Books</h1>
          {books.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleClearAll} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear History
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        ) : books.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((book) => (
              <BookCard key={book.id} book={book} onRemove={handleRemove} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
            <h2 className="text-lg font-semibold">No books added yet</h2>
            <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">
              Paste a GitHub markdown URL in the top bar to start reading and save it to your bookshelf.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
