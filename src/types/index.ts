export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'manager' | 'head';
  departmentId?: string;
  sectionId?: string;
  department?: Department;
  section?: Section;
}

export interface Department {
  id: string;
  name: string;
  sections?: Section[];
}

export interface Section {
  id: string;
  name: string;
  departmentId: string;
  department?: Department;
}

export interface Mail {
  id: string;
  referenceNumber: string;
  mailDate: string;
  subject: string;
  direction: 'incoming' | 'outgoing';
  fromDepartmentId?: string;
  toDepartmentId?: string;
  uploaderId: string;
  fromDepartment?: Department;
  toDepartment?: Department;
  uploader?: User;
  attachments?: Attachment[];
  referrals?: Referral[];
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  mailId: string;
  filePath: string;
  originalFilename: string;
  fileSize: number;
  mimeType: string;
}

export interface Referral {
  id: string;
  mailId: string;
  sectionId: string;
  status: 'Pending' | 'Viewed' | 'Completed';
  section?: Section;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  referralId: string;
  userId: string;
  text: string;
  user?: User;
  createdAt: string;
}

export interface SearchFilters {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  referenceNumber?: string;
  subject?: string;
  direction?: 'incoming' | 'outgoing';
  status?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  message: string;
  success: boolean;
}