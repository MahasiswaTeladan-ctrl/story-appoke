const BASE_URL = 'https://story-api.dicoding.dev/v1';

const AuthModel = {
  async login({ email, password }) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const responseJson = await response.json();
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  },

  async register({ name, email, password }) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const responseJson = await response.json();
    
    if (responseJson.error) {
      throw new Error(responseJson.message);
    }

    return responseJson;
  },
};

export default AuthModel; 