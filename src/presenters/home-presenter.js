import StoryAPI from '../api/story-api.js';

const HomePagePresenter = {
  async loadStories() {
    try {
      const stories = await StoryAPI.getStories();
      return stories;
    } catch (error) {
      console.error('Error loading stories:', error);
      throw error;
    }
  }
};

export default HomePagePresenter; 