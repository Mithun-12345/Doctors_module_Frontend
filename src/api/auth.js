import axios from 'axios';
import { API_URL } from '../config';

export const login = async (phoneNumber, password, role) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      phoneNumber,
      password,
      role
    });
    return response.data;
  } catch (error) {
    console.error('Login error:', error.response || error.message);
    throw error;
  }
};
