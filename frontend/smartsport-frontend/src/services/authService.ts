import axios from 'axios';

interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
  token: string;
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post('/api/auth/login/', { email, password });
    const { token, user } = response.data;
    
    // Store the token in localStorage
    localStorage.setItem('token', token);
    
    return { token, user };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('An error occurred during login');
  }
}; 