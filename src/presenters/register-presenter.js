import AuthModel from '../models/auth-model.js';

const RegisterPagePresenter = {
  async register(name, email, password) {
    try {
      const response = await AuthModel.register({ name, email, password });
      return response;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }
};

export default RegisterPagePresenter; 