export interface User {
  id: string;
  username: string;
  password_hash?: string;
  full_name: string;
  role: 'admin' | 'manager' | 'head';
  department_id?: string;
  section_id?: string;
  created_at: string;
  updated_at: string;
  department_name?: string;
  section_name?: string;
}

export interface Department {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface Section {
  id: string;
  name: string;
  department_id: string;
  created_at: string;
  updated_at: string;
  department_name?: string;
}

export interface Mail {
  id: string;
  reference_number: string;
  mail_date: string;
  subject: string;
  direction: 'incoming' | 'outgoing';
  from_department_id?: string;
  to_department_id?: string;
  uploader_id: string;
  created_at: string;
  updated_at: string;
  from_department_name?: string;
  to_department_name?: string;
  uploader_name?: string;
  attachment_count?: number;
}

export interface Attachment {
  id: string;
  mail_id: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface Referral {
  id: string;
  mail_id: string;
  section_id: string;
  status: 'Pending' | 'Viewed' | 'Completed';
  created_at: string;
  updated_at: string;
  reference_number?: string;
  subject?: string;
  section_name?: string;
  department_name?: string;
}

export interface Comment {
  id: string;
  referral_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  referenceNumber?: string;
  subject?: string;
  direction?: 'incoming' | 'outgoing';
}