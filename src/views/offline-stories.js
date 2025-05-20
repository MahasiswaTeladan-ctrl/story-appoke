import StoryAPI from '../api/story-api.js';

const OfflineStories = {
  async render() {
    return `
      <div class="offline-stories">
        <h2>Offline Stories</h2>
        <div class="offline-stories__container">
          <div class="offline-stories__list" id="offlineStoriesList"></div>
        </div>
        <div class="offline-stories__actions">
          <button id="clearOfflineStories" class="button button--danger">Clear All Offline Stories</button>
        </div>
        <div id="offline-msg" style="display:none; color:#e74c3c; text-align:center; margin-top:1rem;">Kamu sedang offline. Data di bawah adalah data lokal.</div>
      </div>
    `;
  },

  async afterRender() {
    const offlineStoriesList = document.getElementById('offlineStoriesList');
    const clearButton = document.getElementById('clearOfflineStories');
    const offlineMsg = document.getElementById('offline-msg');
    if (!navigator.onLine) {
      offlineMsg.style.display = 'block';
    }
    const stories = await StoryAPI.getOfflineStories();
    
    if (stories.length === 0) {
      offlineStoriesList.innerHTML = '<p class="empty-message">No offline stories found</p>';
      return;
    }

    offlineStoriesList.innerHTML = stories.map(story => `
      <div class="story-item offline-story" data-id="${story.id}">
        <img src="${story.photoUrl || story.photo}" alt="${story.description}" class="story-item__image" onerror="this.onerror=null;this.src='icons/icon-192x192.png'">
        <div class="story-item__content">
          <p class="story-item__description">${story.description}</p>
          <p class="story-item__date">${new Date(story.createdAt).toLocaleDateString()}</p>
          ${story.isOffline ? '<span class="offline-badge">Offline</span>' : ''}
        </div>
        <button class="button button--danger delete-offline-story" data-id="${story.id}">
          Delete
        </button>
      </div>
    `).join('');

    const deleteButtons = document.querySelectorAll('.delete-offline-story');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const storyId = e.target.dataset.id;
        if (confirm('Are you sure you want to delete this offline story?')) {
          await StoryAPI.deleteOfflineStory(storyId);
          const storyElement = document.querySelector(`.offline-story[data-id="${storyId}"]`);
          storyElement.remove();
          
          if (document.querySelectorAll('.offline-story').length === 0) {
            offlineStoriesList.innerHTML = '<p class="empty-message">No offline stories found</p>';
          }
        }
      });
    });

    clearButton.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete all offline stories?')) {
        await StoryAPI.clearOfflineStories();
        offlineStoriesList.innerHTML = '<p class="empty-message">No offline stories found</p>';
      }
    });
  }
};

export default OfflineStories; 