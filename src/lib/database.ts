// Database connection and query utilities
// أدوات الاتصال بقاعدة البيانات والاستعلامات

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export const dbConfig: DatabaseConfig = {
  host: import.meta.env.DB_HOST || 'localhost',
  port: parseInt(import.meta.env.DB_PORT) || 5432,
  database: import.meta.env.DB_NAME || 'e_archiving_db',
  user: import.meta.env.DB_USER || 'postgres',
  password: import.meta.env.DB_PASSWORD || 'password'
};

// Database schema types
export interface DatabaseTables {
  users: {
    id: string;
    username: string;
    password_hash: string;
    full_name: string;
    role: 'admin' | 'manager' | 'head';
    department_id?: string;
    section_id?: string;
    created_at: string;
    updated_at: string;
  };
  
  departments: {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
  };
  
  sections: {
    id: string;
    name: string;
    department_id: string;
    created_at: string;
    updated_at: string;
  };
  
  mails: {
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
  };
  
  attachments: {
    id: string;
    mail_id: string;
    file_path: string;
    original_filename: string;
    file_size: number;
    mime_type: string;
    created_at: string;
  };
  
  referrals: {
    id: string;
    mail_id: string;
    section_id: string;
    status: 'Pending' | 'Viewed' | 'Completed';
    created_at: string;
    updated_at: string;
  };
  
  comments: {
    id: string;
    referral_id: string;
    user_id: string;
    text: string;
    created_at: string;
  };
}

// SQL queries for database operations
export const SQL_QUERIES = {
  // Users
  CREATE_USER: `
    INSERT INTO users (id, username, password_hash, full_name, role, department_id, section_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,
  
  GET_USER_BY_USERNAME: `
    SELECT u.*, d.name as department_name, s.name as section_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN sections s ON u.section_id = s.id
    WHERE u.username = $1
  `,
  
  GET_USER_BY_ID: `
    SELECT u.*, d.name as department_name, s.name as section_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    LEFT JOIN sections s ON u.section_id = s.id
    WHERE u.id = $1
  `,
  
  // Departments
  GET_ALL_DEPARTMENTS: `
    SELECT * FROM departments ORDER BY name
  `,
  
  CREATE_DEPARTMENT: `
    INSERT INTO departments (id, name) VALUES ($1, $2) RETURNING *
  `,
  
  // Sections
  GET_SECTIONS_BY_DEPARTMENT: `
    SELECT * FROM sections WHERE department_id = $1 ORDER BY name
  `,
  
  CREATE_SECTION: `
    INSERT INTO sections (id, name, department_id) VALUES ($1, $2, $3) RETURNING *
  `,
  
  // Mails
  CREATE_MAIL: `
    INSERT INTO mails (id, reference_number, mail_date, subject, direction, from_department_id, to_department_id, uploader_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `,
  
  GET_MAILS_WITH_PAGINATION: `
    SELECT m.*, 
           fd.name as from_department_name,
           td.name as to_department_name,
           u.full_name as uploader_name,
           COUNT(a.id) as attachment_count
    FROM mails m
    LEFT JOIN departments fd ON m.from_department_id = fd.id
    LEFT JOIN departments td ON m.to_department_id = td.id
    LEFT JOIN users u ON m.uploader_id = u.id
    LEFT JOIN attachments a ON m.id = a.mail_id
    GROUP BY m.id, fd.name, td.name, u.full_name
    ORDER BY m.created_at DESC
    LIMIT $1 OFFSET $2
  `,
  
  SEARCH_MAILS: `
    SELECT m.*, 
           fd.name as from_department_name,
           td.name as to_department_name,
           u.full_name as uploader_name
    FROM mails m
    LEFT JOIN departments fd ON m.from_department_id = fd.id
    LEFT JOIN departments td ON m.to_department_id = td.id
    LEFT JOIN users u ON m.uploader_id = u.id
    WHERE 1=1
  `,
  
  // Attachments
  CREATE_ATTACHMENT: `
    INSERT INTO attachments (id, mail_id, file_path, original_filename, file_size, mime_type)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,
  
  GET_ATTACHMENTS_BY_MAIL: `
    SELECT * FROM attachments WHERE mail_id = $1
  `,
  
  // Referrals
  CREATE_REFERRAL: `
    INSERT INTO referrals (id, mail_id, section_id, status)
    VALUES ($1, $2, $3, 'Pending')
    RETURNING *
  `,
  
  GET_REFERRALS_BY_SECTION: `
    SELECT r.*, m.subject, m.reference_number, s.name as section_name
    FROM referrals r
    JOIN mails m ON r.mail_id = m.id
    JOIN sections s ON r.section_id = s.id
    WHERE r.section_id = $1
    ORDER BY r.created_at DESC
  `,
  
  UPDATE_REFERRAL_STATUS: `
    UPDATE referrals SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING *
  `,
  
  // Comments
  CREATE_COMMENT: `
    INSERT INTO comments (id, referral_id, user_id, text)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `,
  
  GET_COMMENTS_BY_REFERRAL: `
    SELECT c.*, u.full_name as user_name
    FROM comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.referral_id = $1
    ORDER BY c.created_at ASC
  `
};

// Database initialization script
export const INIT_DATABASE_SCRIPT = `
-- Create database schema for E-Archiving System
-- إنشاء مخطط قاعدة البيانات لنظام الأرشفة الإلكتروني

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sections table
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, department_id)
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'head')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create mails table
CREATE TABLE IF NOT EXISTS mails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reference_number VARCHAR(100) NOT NULL UNIQUE,
  mail_date DATE NOT NULL,
  subject TEXT NOT NULL,
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  from_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  to_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  uploader_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail_id UUID NOT NULL REFERENCES mails(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail_id UUID NOT NULL REFERENCES mails(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Viewed', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mail_id, section_id)
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_mails_reference_number ON mails(reference_number);
CREATE INDEX IF NOT EXISTS idx_mails_date ON mails(mail_date);
CREATE INDEX IF NOT EXISTS idx_mails_uploader ON mails(uploader_id);
CREATE INDEX IF NOT EXISTS idx_attachments_mail ON attachments(mail_id);
CREATE INDEX IF NOT EXISTS idx_referrals_section ON referrals(section_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_comments_referral ON comments(referral_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sections_updated_at BEFORE UPDATE ON sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mails_updated_at BEFORE UPDATE ON mails FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO departments (name) VALUES 
  ('إدارة تقنية المعلومات'),
  ('الإدارة المالية'),
  ('إدارة الموارد البشرية'),
  ('الإدارة القانونية'),
  ('إدارة العلاقات العامة')
ON CONFLICT (name) DO NOTHING;

-- Insert sample sections
INSERT INTO sections (name, department_id) 
SELECT 'قسم البرمجة', id FROM departments WHERE name = 'إدارة تقنية المعلومات'
UNION ALL
SELECT 'قسم الشبكات', id FROM departments WHERE name = 'إدارة تقنية المعلومات'
UNION ALL
SELECT 'قسم المحاسبة', id FROM departments WHERE name = 'الإدارة المالية'
UNION ALL
SELECT 'قسم التوظيف', id FROM departments WHERE name = 'إدارة الموارد البشرية'
ON CONFLICT (name, department_id) DO NOTHING;

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, password_hash, full_name, role) VALUES 
  ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'مدير النظام', 'admin')
ON CONFLICT (username) DO NOTHING;
`;

export default {
  dbConfig,
  SQL_QUERIES,
  INIT_DATABASE_SCRIPT
};