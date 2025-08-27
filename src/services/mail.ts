import { apiService } from './api';
import type { Mail, ApiResponse, PaginatedResponse, SearchFilters } from '../types';

class MailService {
  async getAllMails(page: number = 1, limit: number = 10): Promise<PaginatedResponse<Mail>> {
    const response = await apiService.get<PaginatedResponse<Mail>>('/mails', {
      page,
      limit,
    });
    return response.data;
  }

  async searchMails(filters: SearchFilters, page: number = 1, limit: number = 10): Promise<PaginatedResponse<Mail>> {
    const response = await apiService.get<PaginatedResponse<Mail>>('/mails/search', {
      ...filters,
      page,
      limit,
    });
    return response.data;
  }

  async getMailById(id: string): Promise<Mail> {
    const response = await apiService.get<ApiResponse<Mail>>(`/mails/${id}`);
    return response.data.data;
  }

  async createMail(mailData: FormData): Promise<Mail> {
    const response = await apiService.uploadFile<ApiResponse<Mail>>('/mails', mailData);
    return response.data.data;
  }

  async referMail(mailId: string, sectionId: string): Promise<void> {
    await apiService.post<ApiResponse<void>>(`/mails/${mailId}/refer`, {
      sectionId,
    });
  }

  async downloadAttachment(attachmentId: string): Promise<Blob> {
    const response = await apiService.get(`/attachments/${attachmentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getAttachmentsByMail(mailId: string) {
    const response = await apiService.get<ApiResponse<any[]>>(`/attachments/mail/${mailId}`);
    return response.data.data;
  }
}

export const mailService = new MailService();