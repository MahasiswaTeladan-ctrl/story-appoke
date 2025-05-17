import Auth from '../utils/auth.js';
import { indexedDBService } from '../utils/indexed-db.js';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const StoryAPI = {
  async getStories() {
    try {
      const response = await fetch(`${BASE_URL}/stories`, {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      });
      const result = await response.json();
      
      // Simpan stories ke IndexedDB
      const stories = result.listStory;
      for (const story of stories) {
        await indexedDBService.saveStory(story);
      }
      
      return stories;
    } catch (error) {
      console.log('Error fetching stories:', error);
      // Jika offline, ambil dari IndexedDB
      const offlineStories = await indexedDBService.getAllStories();
      return offlineStories;
    }
  },

  async getDetailStory(id) {
    try {
      const response = await fetch(`${BASE_URL}/stories/${id}`, {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      });
      const result = await response.json();
      
      // Simpan detail story ke IndexedDB
      await indexedDBService.saveStory(result.story);
      
      return result;
    } catch (error) {
      console.log('Error fetching story detail:', error);
      // Jika offline, coba ambil dari IndexedDB
      const offlineStories = await indexedDBService.getAllStories();
      const story = offlineStories.find(s => s.id === id);
      return story ? { story } : null;
    }
  },

  async postStory({ description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append('description', description);

    const res = await fetch(photo);
    const blob = await res.blob();
    formData.append('photo', blob, 'photo.jpg');

    if (lat && lon) {
      formData.append('lat', lat);
      formData.append('lon', lon);
    }

    try {
      const response = await fetch(`${BASE_URL}/stories`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
        body: formData,
      });

      const result = await response.json();
      
      // Simpan story baru ke IndexedDB
      if (result.story) {
        await indexedDBService.saveStory(result.story);
      }
      
      return result;
    } catch (error) {
      console.log('Error posting story:', error);
      // Simpan ke IndexedDB sebagai draft jika offline
      const offlineStory = {
        id: `offline_${Date.now()}`,
        description,
        photoUrl: URL.createObjectURL(photo),
        lat,
        lon,
        createdAt: new Date().toISOString(),
        isOffline: true
      };
      
      await indexedDBService.saveStory(offlineStory);
      return { story: offlineStory, message: 'Story saved offline' };
    }
  },

  // Method baru untuk mengelola data offline
  async getOfflineStories() {
    return await indexedDBService.getAllStories();
  },

  async deleteOfflineStory(id) {
    return await indexedDBService.deleteStory(id);
  },

  async clearOfflineStories() {
    return await indexedDBService.clearAllStories();
  }
};

export default StoryAPI;