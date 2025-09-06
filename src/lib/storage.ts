Optionimport { AppData, ReadingItem, ReadingList, WishlistItem, ReadingProgress } from '@/types/reading';

const STORAGE_KEY = 'reading-manager-data';
const BACKUP_KEY = 'reading-manager-backup';

// Default data structure
const defaultData: AppData = {
  readingItems: [],
  readingLists: [],
  wishlistItems: [],
  readingProgress: [],
  settings: {
    theme: 'system',
    defaultView: 'grid',
    autoBackup: true,
  },
};

// Storage utilities
export class StorageManager {
  private static instance: StorageManager;
  private data: AppData;

  private constructor() {
    this.data = this.loadData();
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  private loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedData = JSON.parse(stored);
        // Merge with default data to ensure all properties exist
        return { ...defaultData, ...parsedData };
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    return { ...defaultData };
  }

  private saveData(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      
      // Auto backup if enabled
      if (this.data.settings.autoBackup) {
        this.createBackup();
      }
    } catch (error) {
      console.error('Error saving data to localStorage:', error);
      throw new Error('Failed to save data. Storage might be full.');
    }
  }

  private createBackup(): void {
    try {
      const backup = {
        data: this.data,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(BACKUP_KEY, JSON.stringify(backup));
    } catch (error) {
      console.error('Error creating backup:', error);
    }
  }

  // Reading Items
  public getReadingItems(): ReadingItem[] {
    return this.data.readingItems;
  }

  public addReadingItem(item: Omit<ReadingItem, 'id' | 'dateAdded' | 'lastUpdated'>): ReadingItem {
    const newItem: ReadingItem = {
      ...item,
      id: this.generateId(),
      dateAdded: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    this.data.readingItems.push(newItem);
    this.saveData();
    return newItem;
  }

  public updateReadingItem(id: string, updates: Partial<ReadingItem>): ReadingItem | null {
    const index = this.data.readingItems.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.data.readingItems[index] = {
      ...this.data.readingItems[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    this.saveData();
    return this.data.readingItems[index];
  }

  public deleteReadingItem(id: string): boolean {
    const index = this.data.readingItems.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data.readingItems.splice(index, 1);
    
    // Remove from all reading lists
    this.data.readingLists.forEach(list => {
      const itemIndex = list.items.indexOf(id);
      if (itemIndex > -1) {
        list.items.splice(itemIndex, 1);
      }
    });
    
    this.saveData();
    return true;
  }

  // Reading Lists
  public getReadingLists(): ReadingList[] {
    return this.data.readingLists;
  }

  public addReadingList(list: Omit<ReadingList, 'id' | 'dateCreated' | 'lastUpdated'>): ReadingList {
    const newList: ReadingList = {
      ...list,
      id: this.generateId(),
      dateCreated: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
    
    this.data.readingLists.push(newList);
    this.saveData();
    return newList;
  }

  public updateReadingList(id: string, updates: Partial<ReadingList>): ReadingList | null {
    const index = this.data.readingLists.findIndex(list => list.id === id);
    if (index === -1) return null;

    this.data.readingLists[index] = {
      ...this.data.readingLists[index],
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    
    this.saveData();
    return this.data.readingLists[index];
  }

  public deleteReadingList(id: string): boolean {
    const index = this.data.readingLists.findIndex(list => list.id === id);
    if (index === -1) return false;

    this.data.readingLists.splice(index, 1);
    this.saveData();
    return true;
  }

  // Wishlist Items
  public getWishlistItems(): WishlistItem[] {
    return this.data.wishlistItems;
  }

  public addWishlistItem(item: Omit<WishlistItem, 'id' | 'dateAdded'>): WishlistItem {
    const newItem: WishlistItem = {
      ...item,
      id: this.generateId(),
      dateAdded: new Date().toISOString(),
    };
    
    this.data.wishlistItems.push(newItem);
    this.saveData();
    return newItem;
  }

  public updateWishlistItem(id: string, updates: Partial<WishlistItem>): WishlistItem | null {
    const index = this.data.wishlistItems.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.data.wishlistItems[index] = {
      ...this.data.wishlistItems[index],
      ...updates,
    };
    
    this.saveData();
    return this.data.wishlistItems[index];
  }

  public deleteWishlistItem(id: string): boolean {
    const index = this.data.wishlistItems.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.data.wishlistItems.splice(index, 1);
    this.saveData();
    return true;
  }

  // Progress tracking
  public addProgress(progress: Omit<ReadingProgress, 'dateRead'>): ReadingProgress {
    const newProgress: ReadingProgress = {
      ...progress,
      dateRead: new Date().toISOString(),
    };
    
    this.data.readingProgress.push(newProgress);
    
    // Update the reading item's current chapter
    this.updateReadingItem(progress.itemId, {
      currentChapter: progress.chapterNumber,
    });
    
    return newProgress;
  }

  public getProgressForItem(itemId: string): ReadingProgress[] {
    return this.data.readingProgress.filter(p => p.itemId === itemId);
  }

  // Utility methods
  public exportData(): string {
    return JSON.stringify(this.data, null, 2);
  }

  public importData(jsonData: string): boolean {
    try {
      const importedData = JSON.parse(jsonData) as AppData;
      this.data = { ...defaultData, ...importedData };
      this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  public getStorageInfo(): { used: number; available: number } {
    const used = new Blob([JSON.stringify(this.data)]).size;
    const available = 5 * 1024 * 1024; // Approximate localStorage limit (5MB)
    return { used, available };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Export singleton instance
export const storage = StorageManager.getInstance();
