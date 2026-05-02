import { create } from 'zustand';
import { Book, LocalStorageAdapter, StorageAdapter } from './storage';

// In a real app with DI, you might inject this. For now, we instantiate it.
const storageAdapter: StorageAdapter = new LocalStorageAdapter();

interface BookState {
  books: Book[];
  activeBookId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  addBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  setActiveBook: (id: string | null) => void;
  markChapterRead: (bookId: string, chapterUrl: string) => Promise<void>;
  toggleChapterRead: (bookId: string, chapterUrl: string) => Promise<void>;
  updateBookProgress: (bookId: string, chapterUrl: string, scrollPosition: number) => Promise<void>;
}

export const useBookStore = create<BookState>((set, get) => ({
  books: [],
  activeBookId: null,
  isLoading: true,
  error: null,

  initialize: async () => {
    try {
      set({ isLoading: true, error: null });
      const books = await storageAdapter.getBooks();
      set({ books, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || "Failed to load history", isLoading: false });
    }
  },

  addBook: async (book: Book) => {
    try {
      const updatedBook = await storageAdapter.saveBook(book);
      const books = await storageAdapter.getBooks();
      set({ books, activeBookId: updatedBook.id });
    } catch (err: any) {
      set({ error: err.message || "Failed to add book" });
    }
  },

  removeBook: async (id: string) => {
    try {
      await storageAdapter.removeBook(id);
      const books = await storageAdapter.getBooks();
      const currentActive = get().activeBookId;
      set({ 
        books, 
        activeBookId: currentActive === id ? null : currentActive 
      });
    } catch (err: any) {
      set({ error: err.message || "Failed to remove book" });
    }
  },

  clearAll: async () => {
    try {
      await storageAdapter.clearAllBooks();
      set({ books: [], activeBookId: null });
    } catch (err: any) {
      set({ error: err.message || "Failed to clear books" });
    }
  },

  setActiveBook: (id: string | null) => {
    set({ activeBookId: id });
  },

  markChapterRead: async (bookId: string, chapterUrl: string) => {
    const { books } = get();
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const readSet = new Set(book.readChapters || []);
    if (!readSet.has(chapterUrl)) {
      readSet.add(chapterUrl);
      const updatedBook = { ...book, readChapters: Array.from(readSet) };
      await get().addBook(updatedBook); // addBook handles the upsert
    }
  },

  toggleChapterRead: async (bookId: string, chapterUrl: string) => {
    const { books } = get();
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    const readSet = new Set(book.readChapters || []);
    if (readSet.has(chapterUrl)) {
      readSet.delete(chapterUrl);
    } else {
      readSet.add(chapterUrl);
    }
    
    const updatedBook = { ...book, readChapters: Array.from(readSet) };
    await get().addBook(updatedBook);
  },

  updateBookProgress: async (bookId: string, chapterUrl: string, scrollPosition: number) => {
    const { books } = get();
    const book = books.find(b => b.id === bookId);
    if (!book) return;

    // Update last chapter url in book object
    const updatedBook = { ...book, lastChapterUrl: chapterUrl, lastScroll: scrollPosition };
    await storageAdapter.saveBook(updatedBook);
    
    // Save specific progress via adapter
    await storageAdapter.saveProgress(book.baseRaw, chapterUrl, scrollPosition);

    // Refresh state
    const updatedBooks = await storageAdapter.getBooks();
    set({ books: updatedBooks });
  }
}));

// Export a helper to get the active book directly
export const useActiveBook = () => {
  const { books, activeBookId } = useBookStore();
  return books.find(b => b.id === activeBookId) || null;
};
