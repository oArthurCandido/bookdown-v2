export interface ChapterMetadata {
  title: string;
  url: string;
}

export interface Book {
  id: string; // usually rawIndexUrl
  title: string;
  indexUrl: string;
  baseRaw: string;
  coverImage: string | null;
  chapters: ChapterMetadata[];
  lastChapterUrl?: string;
  lastScroll?: number;
  readChapters: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StorageAdapter {
  getBooks(): Promise<Book[]>;
  saveBook(book: Book): Promise<Book>;
  removeBook(id: string): Promise<void>;
  clearAllBooks(): Promise<void>;
  saveProgress(bookBaseRaw: string, chapterUrl: string, scrollPosition: number): Promise<void>;
  getProgress(bookBaseRaw: string, chapterUrl: string): Promise<number>;
  clearBookProgress(book: Book): Promise<void>;
}

// LocalStorage Implementation
export class LocalStorageAdapter implements StorageAdapter {
  private LS_HISTORY = "gbreader.history.v2";

  private progressKey(bookBase: string, chapterUrl: string): string {
    return `progress-${encodeURIComponent(bookBase)}-${encodeURIComponent(chapterUrl)}`;
  }

  async getBooks(): Promise<Book[]> {
    if (typeof window === "undefined") return [];
    try {
      const data = localStorage.getItem(this.LS_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  async saveBook(book: Book): Promise<Book> {
    const books = await this.getBooks();
    const idx = books.findIndex((b) => b.id === book.id);
    
    let updatedBook: Book;
    if (idx >= 0) {
      updatedBook = {
        ...books[idx],
        ...book,
        updatedAt: new Date().toISOString(),
      };
      books[idx] = updatedBook;
    } else {
      updatedBook = {
        ...book,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      books.unshift(updatedBook);
    }
    
    localStorage.setItem(this.LS_HISTORY, JSON.stringify(books));
    return updatedBook;
  }

  async removeBook(id: string): Promise<void> {
    const books = await this.getBooks();
    const book = books.find((b) => b.id === id);
    if (book) {
      await this.clearBookProgress(book);
    }
    
    const filtered = books.filter((b) => b.id !== id);
    localStorage.setItem(this.LS_HISTORY, JSON.stringify(filtered));
  }

  async clearAllBooks(): Promise<void> {
    const books = await this.getBooks();
    for (const book of books) {
      await this.clearBookProgress(book);
    }
    localStorage.setItem(this.LS_HISTORY, JSON.stringify([]));
  }

  async saveProgress(bookBaseRaw: string, chapterUrl: string, scrollPosition: number): Promise<void> {
    if (typeof window === "undefined") return;
    const key = this.progressKey(bookBaseRaw, chapterUrl);
    localStorage.setItem(key, String(scrollPosition));
  }

  async getProgress(bookBaseRaw: string, chapterUrl: string): Promise<number> {
    if (typeof window === "undefined") return 0;
    const key = this.progressKey(bookBaseRaw, chapterUrl);
    const val = Number(localStorage.getItem(key) || "0");
    return Number.isFinite(val) && val >= 0 ? val : 0;
  }

  async clearBookProgress(book: Book): Promise<void> {
    if (typeof window === "undefined") return;
    if (book.chapters && book.baseRaw) {
      book.chapters.forEach((chapter) => {
        const key = this.progressKey(book.baseRaw, chapter.url);
        localStorage.removeItem(key);
      });
    }

    if (book.indexUrl && book.baseRaw) {
      const indexKey = this.progressKey(book.baseRaw, book.indexUrl);
      localStorage.removeItem(indexKey);
    }

    // Attempt to clear other keys matching the book id or base
    const bookId = encodeURIComponent(book.id);
    const bookBase = book.baseRaw ? encodeURIComponent(book.baseRaw) : "";

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes(bookId) || (bookBase && key.includes(bookBase)))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  }
}
