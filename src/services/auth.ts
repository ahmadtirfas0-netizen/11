import { apiService } from './api';
import { User, ApiResponse } from '../types';

interface LoginResponse {
  user: User;
  token: string;
}

class AuthService {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiService.post<ApiResponse<LoginResponse>>('/auth/login', {
      username,
      password,
    });
    return response.data.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiService.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  }

  async logout(): Promise<void> {
    // Clear local storage and any other cleanup
    localStorage.removeItem('authToken');
  }
}

export const authService = new AuthService();