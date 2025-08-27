import { apiService } from './api';
import type { Referral, Comment, ApiResponse, PaginatedResponse } from '../types';

class ReferralService {
  async getReferralsBySection(sectionId: string, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Referral>> {
    const response = await apiService.get<PaginatedResponse<Referral>>(`/referrals/section/${sectionId}`, {
      page,
      limit,
    });
    return response.data;
  }

  async getReferralById(id: string): Promise<Referral> {
    const response = await apiService.get<ApiResponse<Referral>>(`/referrals/${id}`);
    return response.data.data;
  }

  async updateReferralStatus(id: string, status: 'Pending' | 'Viewed' | 'Completed'): Promise<Referral> {
    const response = await apiService.put<ApiResponse<Referral>>(`/referrals/${id}/status`, {
      status,
    });
    return response.data.data;
  }

  async getCommentsByReferral(referralId: string): Promise<Comment[]> {
    const response = await apiService.get<ApiResponse<Comment[]>>(`/referrals/${referralId}/comments`);
    return response.data.data;
  }

  async addComment(referralId: string, text: string): Promise<Comment> {
    const response = await apiService.post<ApiResponse<Comment>>(`/referrals/${referralId}/comments`, {
      text,
    });
    return response.data.data;
  }

  async createReferral(mailId: string, sectionId: string): Promise<Referral> {
    const response = await apiService.post<ApiResponse<Referral>>('/referrals', {
      mailId,
      sectionId,
    });
    return response.data.data;
  }

  async deleteReferral(id: string): Promise<void> {
    await apiService.delete<ApiResponse<void>>(`/referrals/${id}`);
  }
}

export const referralService = new ReferralService();