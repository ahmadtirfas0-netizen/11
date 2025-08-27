import axios, { AxiosInstance, AxiosResponse } from 'axios';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
      timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'e_archiving_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem(import.meta.env.VITE_JWT_STORAGE_KEY || 'e_archiving_token');
          window.location.href = '/login';
        }
        
        // Log error in development
        if (import.meta.env.VITE_DEV_MODE === 'true') {
          console.error('API Error:', error.response?.data || error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  public get<T = any>(url: string, params?: any): Promise<AxiosResponse<T>> {
    return this.api.get(url, { params });
  }

  public post<T = any>(url: string, data?: any, config?: any): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config);
  }

  public put<T = any>(url: string, data?: any): Promise<AxiosResponse<T>> {
    return this.api.put(url, data);
  }

  public delete<T = any>(url: string): Promise<AxiosResponse<T>> {
    return this.api.delete(url);
  }

  public uploadFile<T = any>(url: string, formData: FormData): Promise<AxiosResponse<T>> {
    return this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export const apiService = new ApiService();