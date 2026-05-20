# MedTrain Pro — وثيقة المعمارية وخطة التنفيذ
### تطبيق ويب احترافي كامل لإدارة قسم التدريب — تجمع جازان الصحي

---

## 1. نظرة عامة

تحويل نظام MedTrain الحالي (ملف HTML واحد، تخزين محلي) إلى تطبيق ويب احترافي متعدد المستخدمين مع قاعدة بيانات سحابية، يدعم الفريق الكامل مع صلاحيات وأمان على مستوى المؤسسات.

**الوضع الحالي:**
- ملف HTML واحد (1.7 ميجا)
- تخزين في متصفح كل مستخدم (localStorage + IndexedDB)
- لا مشاركة بيانات بين الأجهزة
- 5,929 متدرب، 53 دورة، 29 جلسة تهيئة، إثباتات حضور

**الهدف:**
- تطبيق ويب حقيقي على خادم سحابي
- قاعدة بيانات موحدة يراها الجميع لحظياً
- صلاحيات متعددة (مدير، منسق، مدرب، مُطّلع)
- أمان وتشفير ونسخ احتياطي تلقائي

---

## 2. المعمارية التقنية (Tech Stack)

### الواجهة الأمامية (Frontend)
| المكوّن | التقنية | السبب |
|---------|---------|-------|
| إطار العمل | React 18 + Vite | سريع، حديث، سهل الصيانة |
| التنسيق | Tailwind CSS | نفس تصميم MedTrain الحالي |
| إدارة الحالة | React Query + Zustand | تزامن مع الخادم تلقائياً |
| الرسوم البيانية | Recharts | نفس المخططات الحالية |
| التدويل | i18next | عربي/إنجليزي مع RTL |
| الملفات | react-dropzone | رفع ملفات وصور |

### الخادم الخلفي (Backend)
| المكوّن | التقنية | السبب |
|---------|---------|-------|
| البيئة | Node.js 20 + Express | شائع، مدعوم، سريع التطوير |
| المصادقة | JWT + bcrypt | تسجيل دخول آمن |
| قاعدة البيانات | PostgreSQL 16 | موثوقة، علائقية، قوية |
| ORM | Prisma | كتابة استعلامات آمنة وسهلة |
| تخزين الملفات | S3 / Cloudflare R2 | للصور وملفات PDF الكبيرة |
| التحقق | Zod | حماية من المدخلات الخاطئة |

### البنية التحتية (Infrastructure)
| الخدمة | الخيار الموصى به | البديل |
|--------|-----------------|--------|
| استضافة Frontend | Vercel | Netlify |
| استضافة Backend | Railway | Render / Fly.io |
| قاعدة البيانات | Railway PostgreSQL | Supabase / Neon |
| تخزين الملفات | Cloudflare R2 | AWS S3 |
| الدومين | jazan.health.sa subdomain | namecheap |

---

## 3. هيكل قاعدة البيانات (Database Schema)

### الجداول الرئيسية

**users** — المستخدمون والصلاحيات
- id, email, password_hash, name, role (admin/coordinator/trainer/viewer), active, created_at, last_login

**trainees** — المتدربون (5,929 سجل)
- id, name, specialty_id, program_type, status, gender, email, mobile, national_id, university, start_date, end_date, paid, revenue, scfhs_no, scfhs_expiry, cpr_expiry, acls_expiry, pals_expiry, atls_expiry, certs (JSON), source, created_at, updated_at

**specialties** — التخصصات (200 سجل)
- id, name_en, name_ar, color

**program_types** — أنواع البرامج (17 نوع)
- id, code, name_en, name_ar, color, paid

**courses** — الدورات وورش العمل (53 سجل)
- id, title, category, date, year, sessions, total_attendance, speaker, job_title, department, pathway, hospital, description, created_at

**course_files** — ملفات الدورات
- id, course_id, name, type, size, storage_key (S3), uploaded_at

**orientation_sessions** — جلسات التهيئة (29 سجل)
- id, title, date, year, attendees, notes, created_at

**attendance_proofs** — إثباتات الحضور
- id, title, year, linked_course_id, uploaded_at

**attendance_proof_files** — ملفات الإثباتات (في S3)
- id, proof_id, name, type, size, storage_key

**audit_logs** — سجل العمليات
- id, user_id, action, target, ip, timestamp

---

## 4. نظام الصلاحيات (Roles & Permissions)

| الصلاحية | Admin | Coordinator | Trainer | Viewer |
|----------|:-----:|:-----------:|:-------:|:------:|
| عرض المتدربين | ✅ | ✅ | ✅ | ✅ |
| إضافة/تعديل متدرب | ✅ | ✅ | ❌ | ❌ |
| حذف متدرب | ✅ | ❌ | ❌ | ❌ |
| إدارة الدورات | ✅ | ✅ | ✅ | ❌ |
| رفع إثباتات الحضور | ✅ | ✅ | ✅ | ❌ |
| استيراد ملفات (Excel/PDF) | ✅ | ✅ | ❌ | ❌ |
| إدارة المستخدمين | ✅ | ❌ | ❌ | ❌ |
| التقارير والتصدير | ✅ | ✅ | ✅ | ✅ |
| سجل العمليات | ✅ | ❌ | ❌ | ❌ |
| الإعدادات | ✅ | ❌ | ❌ | ❌ |

---

## 5. واجهات API الرئيسية (REST Endpoints)

### المصادقة
- POST /api/auth/login — تسجيل الدخول
- POST /api/auth/logout — تسجيل الخروج
- GET /api/auth/me — بيانات المستخدم الحالي

### المتدربون
- GET /api/trainees — قائمة (مع فلترة وبحث وصفحات)
- GET /api/trainees/:id — متدرب واحد
- POST /api/trainees — إضافة
- PUT /api/trainees/:id — تعديل
- DELETE /api/trainees/:id — حذف
- POST /api/trainees/import — استيراد Excel

### الدورات
- GET /api/courses — قائمة
- POST /api/courses — إضافة
- PUT /api/courses/:id — تعديل
- DELETE /api/courses/:id — حذف
- POST /api/courses/import-pdf — استيراد PDF
- POST /api/courses/:id/files — رفع ملف

### إثباتات الحضور
- GET /api/proofs — قائمة (مع فلترة بالسنة)
- POST /api/proofs — إضافة مع ملفات
- DELETE /api/proofs/:id — حذف

### التقارير
- GET /api/reports/dashboard — إحصائيات لوحة التحكم
- GET /api/reports/by-specialty — توزيع حسب التخصص
- GET /api/reports/export — تصدير Excel/PDF

### الإدارة
- GET /api/users — المستخدمون (admin فقط)
- POST /api/users — إضافة مستخدم
- GET /api/audit — سجل العمليات

---

## 6. خطة التنفيذ على مراحل

### المرحلة 1: الأساس (الأسبوع 1)
- إعداد المشروع (Frontend + Backend)
- قاعدة البيانات + Prisma schema
- نظام المصادقة وتسجيل الدخول
- ترحيل بياناتك الحالية (5,929 متدرب) من JSON
- نشر أولي على Railway + Vercel

### المرحلة 2: الوظائف الأساسية (الأسبوع 2)
- إدارة المتدربين (CRUD كامل + بحث + فلترة)
- إدارة التخصصات والبرامج
- لوحة التحكم والإحصائيات
- الصلاحيات الأساسية

### المرحلة 3: المميزات المتقدمة (الأسبوع 3)
- الدورات وورش العمل + رفع الملفات
- جلسات التهيئة المؤسسية
- إثباتات الحضور + معرض الصور
- استيراد Excel و PDF

### المرحلة 4: التحسين والإطلاق (الأسبوع 4)
- التقارير والتصدير
- سجل العمليات (Audit)
- النسخ الاحتياطي التلقائي
- الدومين الخاص + شهادة SSL
- اختبار شامل وإطلاق

---

## 7. التكاليف التقديرية الشهرية

### خيار اقتصادي (للبداية)
| الخدمة | التكلفة الشهرية |
|--------|----------------|
| Railway (Backend + PostgreSQL) | $5-10 |
| Vercel (Frontend) | مجاني |
| Cloudflare R2 (تخزين الملفات) | $0-5 |
| الدومين (سنوي مقسّم) | ~$1 |
| **الإجمالي** | **$10-20 شهرياً** |

### خيار احترافي (للنمو)
| الخدمة | التكلفة الشهرية |
|--------|----------------|
| Railway Pro / DigitalOcean | $25-50 |
| قاعدة بيانات مُدارة | $15-25 |
| تخزين + CDN | $10-20 |
| نسخ احتياطي + مراقبة | $10 |
| **الإجمالي** | **$60-105 شهرياً** |

---

## 8. الأمان والامتثال

- **تشفير كلمات المرور** بـ bcrypt
- **JWT** بصلاحية محدودة + refresh tokens
- **HTTPS** إلزامي (شهادة SSL مجانية)
- **حماية من SQL Injection** عبر Prisma
- **حماية من XSS** عبر التحقق من المدخلات
- **Rate limiting** لمنع الهجمات
- **نسخ احتياطي يومي تلقائي** للقاعدة
- **سجل عمليات** كامل لكل تعديل
- **النسخ الاحتياطي** يُحفظ 30 يوماً

---

## 9. الخطوات التي تحتاج تنفيذها بنفسك

بما أنني أبني الكود لكن لا أملك حسابك، ستحتاج:

1. **إنشاء حساب Railway** (railway.app) — للخادم وقاعدة البيانات
2. **إنشاء حساب Vercel** (vercel.com) — للواجهة
3. **إنشاء حساب Cloudflare** (اختياري) — لتخزين الملفات
4. **شراء/تخصيص دومين** — إذا أردت رابط مخصص
5. **ربط GitHub** — لرفع الكود والنشر التلقائي

سأرشدك خطوة بخطوة في كل واحدة عند الوصول إليها.

---

## 10. ملاحظة مهمة حول البناء

التطبيق الكامل يتكون من **40-60 ملف كود** موزعة على Frontend و Backend. لا يمكن وضعها كلها في رد واحد. لذلك سأبنيها على دفعات:

1. **الدفعة 1:** هيكل المشروع + قاعدة البيانات + سكريبت ترحيل بياناتك
2. **الدفعة 2:** الخادم الخلفي (API + مصادقة)
3. **الدفعة 3:** الواجهة الأمامية (الصفحات الأساسية)
4. **الدفعة 4:** المميزات المتقدمة + النشر

كل دفعة ستكون ملفات حقيقية قابلة للتشغيل، مع تعليمات واضحة.

---

*أُعدّت هذه الوثيقة لمشروع MedTrain Pro — تجمع جازان الصحي*
