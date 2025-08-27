import { apiService } from './api';
import { Department, Section, User, ApiResponse } from '../types';

class AdminService {
  // Department management
  async getAllDepartments(): Promise<Department[]> {
    const response = await apiService.get<ApiResponse<Department[]>>('/departments');
    return response.data.data;
  }

  async createDepartment(name: string): Promise<Department> {
    const response = await apiService.post<ApiResponse<Department>>('/departments', { name });
    return response.data.data;
  }

  async updateDepartment(id: string, name: string): Promise<Department> {
    const response = await apiService.put<ApiResponse<Department>>(`/departments/${id}`, { name });
    return response.data.data;
  }

  async deleteDepartment(id: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`/departments/${id}`);
  }

  // Section management
  async getAllSections(): Promise<Section[]> {
    const response = await apiService.get<ApiResponse<Section[]>>('/sections');
    return response.data.data;
  }

  async getSectionsByDepartment(departmentId: string): Promise<Section[]> {
    const response = await apiService.get<ApiResponse<Section[]>>(`/departments/${departmentId}/sections`);
    return response.data.data;
  }

  async createSection(name: string, departmentId: string): Promise<Section> {
    const response = await apiService.post<ApiResponse<Section>>('/sections', { name, departmentId });
    return response.data.data;
  }

  async updateSection(id: string, name: string, departmentId: string): Promise<Section> {
    const response = await apiService.put<ApiResponse<Section>>(`/sections/${id}`, { name, departmentId });
    return response.data.data;
  }

  async deleteSection(id: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`/sections/${id}`);
  }

  // User management
  async getAllUsers(): Promise<User[]> {
    const response = await apiService.get<ApiResponse<User[]>>('/users');
    return response.data.data;
  }

  async createUser(userData: Omit<User, 'id'> & { password: string }): Promise<User> {
    const response = await apiService.post<ApiResponse<User>>('/users', userData);
    return response.data.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await apiService.put<ApiResponse<User>>(`/users/${id}`, userData);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`/users/${id}`);
  }
}

export const adminService = new AdminService();