import StoryModel from '../models/story-model.js';

const StoryFormPresenter = {
  async postStory(description, photo, lat, lon) {
    try {
      const result = await StoryModel.postStory({ description, photo, lat, lon });
      return result;
    } catch (error) {
      console.error('Error posting story:', error);
      throw error;
    }
  }
};

export default StoryFormPresenter; 