import AuthModel from '../models/auth-model.js';
import Auth from '../utils/auth.js';

const LoginPagePresenter = {
  async login(email, password) {
    try {
      const response = await AuthModel.login({ email, password });
      Auth.setToken(response.loginResult.token);
      Auth.setUser(response.loginResult);
      return response;
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }
};

export default LoginPagePresenter; 