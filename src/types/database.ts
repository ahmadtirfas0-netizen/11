// Database types for PostgreSQL
// أنواع قاعدة البيانات لـ PostgreSQL

export interface DatabaseUser {
  id: string;
  username: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'manager' | 'head';
  department_id?: string;
  section_id?: string;
  created_at: string;
  updated_at: string;
  department_name?: string;
  section_name?: string;
}

export interface DatabaseDepartment {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseSection {
  id: string;
  name: string;
  department_id: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMail {
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

export interface DatabaseAttachment {
  id: string;
  mail_id: string;
  file_path: string;
  original_filename: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export interface DatabaseReferral {
  id: string;
  mail_id: string;
  section_id: string;
  status: 'Pending' | 'Viewed' | 'Completed';
  created_at: string;
  updated_at: string;
  subject?: string;
  reference_number?: string;
  section_name?: string;
}

export interface DatabaseComment {
  id: string;
  referral_id: string;
  user_id: string;
  text: string;
  created_at: string;
  user_name?: string;
}

// Query result types
export interface QueryResult<T> {
  rows: T[];
  rowCount: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface SearchParams {
  dateFrom?: string;
  dateTo?: string;
  departmentId?: string;
  referenceNumber?: string;
  subject?: string;
  direction?: 'incoming' | 'outgoing';
}

// Database connection types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl?: boolean;
  connectionTimeoutMillis?: number;
  idleTimeoutMillis?: number;
  max?: number;
}

export interface DatabaseConnection {
  query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>>;
  end(): Promise<void>;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: DatabaseUser;
        Insert: Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseUser, 'id' | 'created_at' | 'updated_at'>>;
      };
      departments: {
        Row: DatabaseDepartment;
        Insert: Omit<DatabaseDepartment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseDepartment, 'id' | 'created_at' | 'updated_at'>>;
      };
      sections: {
        Row: DatabaseSection;
        Insert: Omit<DatabaseSection, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseSection, 'id' | 'created_at' | 'updated_at'>>;
      };
      mails: {
        Row: DatabaseMail;
        Insert: Omit<DatabaseMail, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseMail, 'id' | 'created_at' | 'updated_at'>>;
      };
      attachments: {
        Row: DatabaseAttachment;
        Insert: Omit<DatabaseAttachment, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseAttachment, 'id' | 'created_at'>>;
      };
      referrals: {
        Row: DatabaseReferral;
        Insert: Omit<DatabaseReferral, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<DatabaseReferral, 'id' | 'created_at' | 'updated_at'>>;
      };
      comments: {
        Row: DatabaseComment;
        Insert: Omit<DatabaseComment, 'id' | 'created_at'>;
        Update: Partial<Omit<DatabaseComment, 'id' | 'created_at'>>;
      };
    };
  };
};