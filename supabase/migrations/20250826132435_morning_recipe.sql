-- E-Archiving System Database Setup
-- إعداد قاعدة البيانات لنظام الأرشفة الإلكتروني

-- Create database (run this as postgres superuser)
-- CREATE DATABASE e_archiving_db WITH ENCODING 'UTF8' LC_COLLATE='ar_SA.UTF-8' LC_CTYPE='ar_SA.UTF-8';

-- Connect to the database and run the following:
-- \c e_archiving_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create departments table - جدول الإدارات
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create sections table - جدول الأقسام
CREATE TABLE IF NOT EXISTS sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, department_id)
);

-- Create users table - جدول المستخدمين
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

-- Create mails table - جدول المراسلات
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

-- Create attachments table - جدول المرفقات
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail_id UUID NOT NULL REFERENCES mails(id) ON DELETE CASCADE,
  file_path VARCHAR(500) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create referrals table - جدول الإحالات
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mail_id UUID NOT NULL REFERENCES mails(id) ON DELETE CASCADE,
  section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Viewed', 'Completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(mail_id, section_id)
);

-- Create comments table - جدول التعليقات
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance - إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department_id);
CREATE INDEX IF NOT EXISTS idx_users_section ON users(section_id);

CREATE INDEX IF NOT EXISTS idx_sections_department ON sections(department_id);

CREATE INDEX IF NOT EXISTS idx_mails_reference_number ON mails(reference_number);
CREATE INDEX IF NOT EXISTS idx_mails_date ON mails(mail_date);
CREATE INDEX IF NOT EXISTS idx_mails_direction ON mails(direction);
CREATE INDEX IF NOT EXISTS idx_mails_uploader ON mails(uploader_id);
CREATE INDEX IF NOT EXISTS idx_mails_from_dept ON mails(from_department_id);
CREATE INDEX IF NOT EXISTS idx_mails_to_dept ON mails(to_department_id);
CREATE INDEX IF NOT EXISTS idx_mails_created_at ON mails(created_at);

CREATE INDEX IF NOT EXISTS idx_attachments_mail ON attachments(mail_id);

CREATE INDEX IF NOT EXISTS idx_referrals_mail ON referrals(mail_id);
CREATE INDEX IF NOT EXISTS idx_referrals_section ON referrals(section_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);

CREATE INDEX IF NOT EXISTS idx_comments_referral ON comments(referral_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at);

-- Create updated_at trigger function - دالة تحديث التاريخ
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at - إنشاء المحفزات لتحديث التاريخ
CREATE TRIGGER update_departments_updated_at 
  BEFORE UPDATE ON departments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sections_updated_at 
  BEFORE UPDATE ON sections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mails_updated_at 
  BEFORE UPDATE ON mails 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_referrals_updated_at 
  BEFORE UPDATE ON referrals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample departments - إدراج إدارات تجريبية
INSERT INTO departments (name) VALUES 
  ('إدارة تقنية المعلومات'),
  ('الإدارة المالية'),
  ('إدارة الموارد البشرية'),
  ('الإدارة القانونية'),
  ('إدارة العلاقات العامة'),
  ('إدارة المشاريع'),
  ('إدارة الجودة'),
  ('الإدارة الهندسية')
ON CONFLICT (name) DO NOTHING;

-- Insert sample sections - إدراج أقسام تجريبية
WITH dept_ids AS (
  SELECT id, name FROM departments
)
INSERT INTO sections (name, department_id) 
SELECT 'قسم البرمجة', id FROM dept_ids WHERE name = 'إدارة تقنية المعلومات'
UNION ALL
SELECT 'قسم الشبكات', id FROM dept_ids WHERE name = 'إدارة تقنية المعلومات'
UNION ALL
SELECT 'قسم الأمن السيبراني', id FROM dept_ids WHERE name = 'إدارة تقنية المعلومات'
UNION ALL
SELECT 'قسم المحاسبة', id FROM dept_ids WHERE name = 'الإدارة المالية'
UNION ALL
SELECT 'قسم الميزانية', id FROM dept_ids WHERE name = 'الإدارة المالية'
UNION ALL
SELECT 'قسم التوظيف', id FROM dept_ids WHERE name = 'إدارة الموارد البشرية'
UNION ALL
SELECT 'قسم التدريب', id FROM dept_ids WHERE name = 'إدارة الموارد البشرية'
UNION ALL
SELECT 'قسم الاستشارات القانونية', id FROM dept_ids WHERE name = 'الإدارة القانونية'
UNION ALL
SELECT 'قسم الإعلام', id FROM dept_ids WHERE name = 'إدارة العلاقات العامة'
UNION ALL
SELECT 'قسم التخطيط', id FROM dept_ids WHERE name = 'إدارة المشاريع'
UNION ALL
SELECT 'قسم ضمان الجودة', id FROM dept_ids WHERE name = 'إدارة الجودة'
UNION ALL
SELECT 'قسم الهندسة المدنية', id FROM dept_ids WHERE name = 'الإدارة الهندسية'
ON CONFLICT (name, department_id) DO NOTHING;

-- Insert sample users - إدراج مستخدمين تجريبيين
-- Password for all users: password123 (hashed with bcrypt)
WITH dept_it AS (SELECT id FROM departments WHERE name = 'إدارة تقنية المعلومات' LIMIT 1),
     dept_hr AS (SELECT id FROM departments WHERE name = 'إدارة الموارد البشرية' LIMIT 1),
     section_prog AS (SELECT id FROM sections WHERE name = 'قسم البرمجة' LIMIT 1),
     section_hr AS (SELECT id FROM sections WHERE name = 'قسم التوظيف' LIMIT 1)
INSERT INTO users (username, password_hash, full_name, role, department_id, section_id) VALUES 
  ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'مدير النظام', 'admin', NULL, NULL),
  ('manager_it', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'مدير إدارة تقنية المعلومات', 'manager', (SELECT id FROM dept_it), NULL),
  ('manager_hr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'مدير إدارة الموارد البشرية', 'manager', (SELECT id FROM dept_hr), NULL),
  ('head_prog', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'رئيس قسم البرمجة', 'head', (SELECT id FROM dept_it), (SELECT id FROM section_prog)),
  ('head_hr', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO.G', 'رئيس قسم التوظيف', 'head', (SELECT id FROM dept_hr), (SELECT id FROM section_hr))
ON CONFLICT (username) DO NOTHING;

-- Create views for easier querying - إنشاء عروض لسهولة الاستعلام
CREATE OR REPLACE VIEW v_users_with_details AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.role,
  u.created_at,
  u.updated_at,
  d.name as department_name,
  s.name as section_name,
  u.department_id,
  u.section_id
FROM users u
LEFT JOIN departments d ON u.department_id = d.id
LEFT JOIN sections s ON u.section_id = s.id;

CREATE OR REPLACE VIEW v_mails_with_details AS
SELECT 
  m.id,
  m.reference_number,
  m.mail_date,
  m.subject,
  m.direction,
  m.created_at,
  m.updated_at,
  fd.name as from_department_name,
  td.name as to_department_name,
  u.full_name as uploader_name,
  u.username as uploader_username,
  COUNT(a.id) as attachment_count,
  COUNT(r.id) as referral_count
FROM mails m
LEFT JOIN departments fd ON m.from_department_id = fd.id
LEFT JOIN departments td ON m.to_department_id = td.id
LEFT JOIN users u ON m.uploader_id = u.id
LEFT JOIN attachments a ON m.id = a.mail_id
LEFT JOIN referrals r ON m.id = r.mail_id
GROUP BY m.id, fd.name, td.name, u.full_name, u.username;

CREATE OR REPLACE VIEW v_referrals_with_details AS
SELECT 
  r.id,
  r.mail_id,
  r.section_id,
  r.status,
  r.created_at,
  r.updated_at,
  m.reference_number,
  m.subject,
  m.mail_date,
  s.name as section_name,
  d.name as department_name,
  COUNT(c.id) as comment_count
FROM referrals r
JOIN mails m ON r.mail_id = m.id
JOIN sections s ON r.section_id = s.id
JOIN departments d ON s.department_id = d.id
LEFT JOIN comments c ON r.id = c.referral_id
GROUP BY r.id, m.reference_number, m.subject, m.mail_date, s.name, d.name;

-- Grant permissions (adjust as needed for your setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_app_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_app_user;

-- Display setup completion message
SELECT 'Database setup completed successfully! - تم إعداد قاعدة البيانات بنجاح!' as message;