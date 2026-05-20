[README.md](https://github.com/user-attachments/files/28045115/README.md)
# MedTrain Pro — Backend API

تطبيق ويب احترافي لإدارة قسم التدريب — تجمع جازان الصحي

---

## ما الذي في هذه الحزمة

```
medtrain-pro/
├── backend/
│   ├── prisma/schema.prisma      # هيكل قاعدة البيانات (9 جداول)
│   ├── src/
│   │   ├── server.js             # نقطة الدخول الرئيسية
│   │   ├── lib/db.js             # Prisma + المصادقة
│   │   └── routes/
│   │       ├── auth.js           # تسجيل الدخول
│   │       ├── trainees.js       # المتدربون (CRUD كامل)
│   │       ├── courses.js        # الدورات
│   │       ├── reports.js        # التقارير
│   │       └── users.js          # إدارة المستخدمين
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
└── scripts/
    └── migrate-data.js           # ترحيل بياناتك الـ5,929 متدرب
```

هذا هو **الخادم الخلفي (Backend)** الكامل. الواجهة الأمامية (React) ستأتي في الدفعة التالية.

---

## التشغيل المحلي (للتجربة على جهازك)

### المتطلبات
- Node.js 20+ ([تحميل](https://nodejs.org))
- PostgreSQL 16 ([تحميل](https://www.postgresql.org/download/)) أو Docker

### الخطوات

```bash
# 1. ادخل مجلد الخادم
cd backend

# 2. ثبّت المكتبات
npm install

# 3. انسخ ملف البيئة واملأه
cp .env.example .env
# عدّل DATABASE_URL و JWT_SECRET

# 4. أنشئ الجداول في قاعدة البيانات
npx prisma migrate dev --name init

# 5. رحّل بياناتك الحالية
node ../scripts/migrate-data.js /path/to/medtrain-MASTER-2026-05-12T11-51-53.json

# 6. شغّل الخادم
npm run dev
```

الخادم يعمل الآن على `http://localhost:4000`

تسجيل دخول افتراضي: `admin@jazan.health.sa` / `ChangeMe123!`
**(غيّر كلمة المرور فوراً)**

---

## النشر على Railway (الأسهل — موصى به)

### 1. أنشئ حساب
- اذهب إلى [railway.app](https://railway.app) وسجّل بحساب GitHub

### 2. أنشئ مشروع جديد
- اضغط "New Project" → "Deploy from GitHub repo"
- ارفع هذا الكود إلى GitHub أولاً، أو استخدم "Empty Project"

### 3. أضف قاعدة بيانات
- في المشروع: "New" → "Database" → "PostgreSQL"
- Railway سيضبط `DATABASE_URL` تلقائياً

### 4. أضف الخادم
- "New" → "GitHub Repo" → اختر مستودعك
- في Settings → Variables، أضف:
  - `JWT_SECRET` = نص عشوائي طويل (64 حرف)
  - `FRONTEND_URL` = رابط الواجهة (لاحقاً)

### 5. الترحيل
- Railway سينفّذ `prisma migrate deploy` تلقائياً عند النشر
- لترحيل بياناتك: استخدم Railway CLI أو شغّل السكريبت محلياً موجّهاً لقاعدة Railway

### 6. احصل على الرابط
- Settings → Networking → "Generate Domain"
- رابط مثل: `https://medtrain-api.up.railway.app`

---

## توليد JWT_SECRET آمن

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

انسخ الناتج وضعه في `JWT_SECRET`.

---

## واجهات API الجاهزة

| الطريقة | المسار | الوصف | الصلاحية |
|---------|--------|-------|----------|
| POST | /api/auth/login | تسجيل دخول | الكل |
| GET | /api/auth/me | بياناتي | مسجّل |
| GET | /api/trainees | قائمة المتدربين | مسجّل |
| POST | /api/trainees | إضافة متدرب | Admin/Coordinator |
| PUT | /api/trainees/:id | تعديل | Admin/Coordinator |
| DELETE | /api/trainees/:id | حذف | Admin |
| GET | /api/courses | الدورات | مسجّل |
| POST | /api/courses | إضافة دورة | Admin/Coord/Trainer |
| GET | /api/reports/dashboard | إحصائيات | مسجّل |
| GET | /api/reports/by-specialty | توزيع التخصصات | مسجّل |
| GET | /api/users | المستخدمون | Admin |
| POST | /api/users | إضافة مستخدم | Admin |
| GET | /api/users/audit | سجل العمليات | Admin |

---

## الأمان المُطبّق

- ✅ كلمات المرور مشفّرة بـ bcrypt
- ✅ JWT بصلاحية 7 أيام
- ✅ Rate limiting (500 طلب / 15 دقيقة، 20 لتسجيل الدخول)
- ✅ التحقق من المدخلات بـ Zod
- ✅ صلاحيات على مستوى كل API
- ✅ سجل عمليات كامل (Audit log)
- ✅ حماية من SQL injection عبر Prisma

---

## الخطوة التالية

بعد تشغيل الخادم بنجاح، أخبرني وسأبني لك **الواجهة الأمامية (Frontend)** بنفس تصميم MedTrain الحالي، متصلة بهذا الـ API.

---

## ملاحظة قانونية مهمة

هذا النظام يخزّن بيانات شخصية حساسة (أرقام وطنية، بيانات صحية). قبل النشر الفعلي:
- تأكد من موافقة إدارة تقنية المعلومات في تجمع جازان
- راجع متطلبات حماية البيانات الصحية السعودية (PDPL)
- يُفضّل استضافة داخل السعودية أو على خوادم معتمدة
