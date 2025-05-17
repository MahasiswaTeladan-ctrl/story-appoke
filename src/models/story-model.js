import Auth from '../utils/auth.js';

const BASE_URL = 'https://story-api.dicoding.dev/v1';

const StoryModel = {
  async getStories() {
    const response = await fetch(`${BASE_URL}/stories`, {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });
    const result = await response.json();
    return result.listStory;
  },

  async getDetailStory(id) {
    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
    });
    const result = await response.json();
    return result;
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

    const response = await fetch(`${BASE_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${Auth.getToken()}`,
      },
      body: formData,
    });

    const result = await response.json();
    return result;
  },
};

export default StoryModel; 