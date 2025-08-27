# نظام الأرشفة الإلكتروني - E-Archiving System

نظام شامل لإدارة المراسلات الداخلية مع الأرشفة والتوجيه والبحث الآمن بناءً على الصلاحيات.

## المميزات الرئيسية

### 🔐 نظام المصادقة والصلاحيات
- تسجيل دخول آمن مع JWT
- ثلاثة مستويات من الصلاحيات:
  - **مدير النظام (Admin)**: إدارة كاملة للنظام
  - **مدير الإدارة (Manager)**: إدارة مراسلات الإدارة
  - **رئيس القسم (Head)**: عرض الإحالات والتعليق عليها

### 📧 إدارة المراسلات
- رفع المراسلات مع المرفقات
- تصنيف المراسلات (واردة/صادرة)
- نظام الأرقام الإشارية
- إدارة المرفقات (PDF, DOC, صور)

### 🔍 البحث المتقدم
- البحث بالموضوع والرقم الإشاري
- فلترة بالتاريخ والإدارة
- البحث في المحتوى والمرفقات
- تصدير نتائج البحث

### 📋 نظام الإحالات
- إحالة المراسلات للأقسام المختصة
- تتبع حالة الإحالات (معلق/مُشاهد/مكتمل)
- نظام التعليقات والملاحظات
- إشعارات الإحالات الجديدة

### 🏢 إدارة الهيكل التنظيمي
- إدارة الإدارات والأقسام
- ربط المستخدمين بالهيكل التنظيمي
- صلاحيات مرنة حسب المنصب

## التقنيات المستخدمة

### Frontend
- **React 18** مع TypeScript
- **Vite** للبناء والتطوير
- **Tailwind CSS** للتصميم
- **React Router** للتنقل
- **Axios** للاتصال بالـ API
- **Lucide React** للأيقونات

### Backend (مطلوب تطويره)
- **Node.js** مع Express
- **TypeScript** للأمان النوعي
- **PostgreSQL** لقاعدة البيانات
- **JWT** للمصادقة
- **Multer** لرفع الملفات
- **bcrypt** لتشفير كلمات المرور

## إعداد المشروع

### متطلبات النظام
- Node.js 18+
- PostgreSQL 13+
- npm أو yarn

### تثبيت المشروع الكامل
```bash
# استنساخ المشروع
git clone <repository-url>
cd e-archiving-system

# تثبيت مكتبات Frontend
npm install

# تثبيت مكتبات Backend
cd server
npm install
cd ..

# نسخ ملف البيئة
cp .env.example .env

# تعديل متغيرات البيئة
nano .env

# تشغيل المشروع الكامل (Frontend + Backend)
npm run dev:full

# أو تشغيل Frontend فقط
npm run dev

# أو تشغيل Backend فقط
npm run server:dev
```

### إعداد قاعدة البيانات
```bash
# إنشاء قاعدة البيانات
createdb e_archiving_db

# تشغيل سكريبت الإعداد
psql -d e_archiving_db -f database-setup.sql

# أو من داخل مجلد server
cd server
npm run db:setup
```

### متغيرات البيئة المطلوبة
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api

# Backend Configuration
BACKEND_PORT=3001
BACKEND_NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/e_archiving_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=e_archiving_db
DB_USER=postgres
DB_PASSWORD=password

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
VITE_JWT_STORAGE_KEY=e_archiving_token

# File Upload
VITE_MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## هيكل المشروع

```
e-archiving-system/
├── server/                 # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── config/        # إعدادات قاعدة البيانات
│   │   ├── controllers/   # منطق الأعمال
│   │   ├── middleware/    # وسطاء المصادقة والتحقق
│   │   ├── routes/        # مسارات API
│   │   ├── types/         # تعريفات TypeScript
│   │   └── server.ts      # نقطة البداية
│   ├── uploads/           # ملفات المرفقات
│   └── package.json
src/
├── components/          # المكونات القابلة لإعادة الاستخدام
│   ├── Common/         # مكونات عامة
│   ├── Layout/         # مكونات التخطيط
│   └── Mail/           # مكونات المراسلات
├── context/            # إدارة الحالة العامة
├── lib/                # مكتبات مساعدة
├── pages/              # صفحات التطبيق
├── services/           # خدمات الـ API
└── types/              # تعريفات TypeScript
database-setup.sql      # سكريبت إعداد قاعدة البيانات
```

## المستخدمون التجريبيون

| المستخدم | كلمة المرور | الدور |
|----------|-------------|-------|
| admin | password123 | مدير النظام |
| manager_it | password123 | مدير إدارة تقنية المعلومات |
| head_prog | password123 | رئيس قسم البرمجة |

## الميزات المطلوب تطويرها

### Backend API ✅
- [x] نقاط وصول المصادقة
- [x] إدارة المستخدمين والصلاحيات
- [x] CRUD للمراسلات والمرفقات
- [x] نظام البحث المتقدم
- [x] إدارة الإحالات والتعليقات
- [x] رفع وتحميل الملفات

### Frontend المتقدم ✅
- [x] واجهة مستخدم كاملة باللغة العربية
- [x] نظام مصادقة مع إدارة الجلسات
- [x] لوحة تحكم تفاعلية
- [x] إدارة المراسلات والبحث المتقدم
- [x] نظام رفع الملفات
- [x] إدارة المستخدمين والصلاحيات
- [ ] إشعارات فورية
- [ ] طباعة التقارير
- [ ] تصدير البيانات
- [ ] لوحة تحكم تحليلية

### الأمان والأداء
- [x] مصادقة JWT آمنة
- [x] تشفير كلمات المرور
- [x] حماية المسارات حسب الصلاحيات
- [x] تحديد معدل الطلبات
- [ ] نسخ احتياطية تلقائية
- [ ] مراجعة العمليات (Audit Log)
- [x] تحسين الاستعلامات
- [ ] ضغط الصور تلقائياً

## تشغيل المشروع

### التطوير
```bash
# تشغيل Frontend + Backend معاً
npm run dev:full

# الوصول للتطبيق
Frontend: http://localhost:5173
Backend API: http://localhost:3001
```

### الإنتاج
```bash
# بناء Frontend
npm run build

# بناء Backend
npm run server:build

# تشغيل Backend في الإنتاج
npm run server:start
```

## المساهمة

نرحب بالمساهمات! يرجى:
1. عمل Fork للمشروع
2. إنشاء فرع للميزة الجديدة
3. كتابة الاختبارات
4. إرسال Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

للحصول على الدعم:
- إنشاء Issue في GitHub
- مراسلة فريق التطوير
- مراجعة الوثائق

---

**ملاحظة**: المشروع جاهز للاستخدام مع Backend API كامل وقاعدة بيانات PostgreSQL.