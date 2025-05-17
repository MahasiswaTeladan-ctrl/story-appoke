const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  async initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Error opening database'));
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          const store = db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });
  }

  async saveStory(story) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      
      const request = store.put(story);
      
      request.onsuccess = () => {
        console.log('Story saved to IndexedDB:', story);
        resolve(story);
      };
      request.onerror = () => {
        console.error('Error saving story to IndexedDB:', story);
        reject(new Error('Error saving story'));
      };
    });
  }

  async getAllStories() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], 'readonly');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Error getting stories'));
    });
  }

  async deleteStory(id) {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.delete(id);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Error deleting story'));
    });
  }

  async clearAllStories() {
    if (!this.db) await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([OBJECT_STORE_NAME], 'readwrite');
      const store = transaction.objectStore(OBJECT_STORE_NAME);
      const request = store.clear();
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(new Error('Error clearing stories'));
    });
  }
}

export const indexedDBService = new IndexedDBService(); 