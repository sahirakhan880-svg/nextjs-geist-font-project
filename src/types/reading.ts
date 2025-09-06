export interface ReadingItem {
  id: string;
  title: string;
  author: string;
  type: 'novel' | 'manhwa';
  genre: string[];
  status: 'reading' | 'completed' | 'paused' | 'dropped';
  currentChapter: number;
  totalChapters?: number;
  rating?: number;
  notes?: string;
  coverImage?: string;
  dateAdded: string;
  dateStarted?: string;
  dateCompleted?: string;
  lastUpdated: string;
}

export interface ReadingList {
  id: string;
  name: string;
  description?: string;
  items: string[]; // Array of ReadingItem IDs
  dateCreated: string;
  lastUpdated: string;
}

export interface WishlistItem {
  id: string;
  title: string;
  author: string;
  type: 'novel' | 'manhwa';
  genre: string[];
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  dateAdded: string;
}

export interface ReadingProgress {
  itemId: string;
  chapterNumber: number;
  dateRead: string;
  notes?: string;
}

export interface AppData {
  readingItems: ReadingItem[];
  readingLists: ReadingList[];
  wishlistItems: WishlistItem[];
  readingProgress: ReadingProgress[];
  settings: {
    theme: 'light' | 'dark' | 'system';
    defaultView: 'grid' | 'list';
    autoBackup: boolean;
  };
}
