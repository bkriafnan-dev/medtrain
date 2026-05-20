# دليل النشر الكامل — MedTrain Pro
### من الصفر إلى تطبيق يعمل على الإنترنت (خطوة بخطوة)

هذا الدليل يفترض أنك **لست مبرمجاً** ويشرح كل نقرة. الوقت المتوقع: **ساعة إلى ساعتين**.

---

## ما ستحصل عليه في النهاية

- رابط للخادم: `https://medtrain-api.up.railway.app`
- رابط للتطبيق: `https://medtrain-jazan.vercel.app`
- تطبيق يفتح على أي جوال/كمبيوتر، بيانات موحّدة للفريق، تسجيل دخول بصلاحيات

---

## المتطلبات (كلها مجانية للبداية)

1. حساب [GitHub](https://github.com) — لتخزين الكود
2. حساب [Railway](https://railway.app) — للخادم وقاعدة البيانات
3. حساب [Vercel](https://vercel.com) — للواجهة

سجّل في الثلاثة بحساب Google أو GitHub (الأسهل).

---

## الجزء 1: رفع الكود على GitHub

### 1.1 ثبّت Git و GitHub Desktop
- حمّل [GitHub Desktop](https://desktop.github.com) (أسهل من سطر الأوامر)

### 1.2 أنشئ مستودعين (Repositories)
في GitHub، أنشئ مستودعين منفصلين:
- `medtrain-backend` (خاص/private)
- `medtrain-frontend` (خاص/private)

### 1.3 ارفع الكود
- فك ضغط `medtrain-pro-fullstack.zip`
- ضع محتوى مجلد `backend` في مستودع backend
- ضع محتوى مجلد `frontend` في مستودع frontend
- ارفعهما عبر GitHub Desktop (Commit → Push)

---

## الجزء 2: نشر الخادم وقاعدة البيانات (Railway)

### 2.1 أنشئ مشروع
- في Railway: **New Project** → **Deploy from GitHub repo** → اختر `medtrain-backend`

### 2.2 أضف قاعدة بيانات PostgreSQL
- داخل المشروع: **New** → **Database** → **Add PostgreSQL**
- Railway يربط `DATABASE_URL` تلقائياً ✓

### 2.3 أضف المتغيرات
- اضغط على خدمة backend → **Variables** → **New Variable**
- أضف:
  ```
  JWT_SECRET = (الصق نصاً عشوائياً طويلاً — انظر أدناه)
  FRONTEND_URL = https://medtrain-jazan.vercel.app
  ```
- لتوليد JWT_SECRET: افتح [هذا الموقع](https://generate-secret.vercel.app/64) وانسخ الناتج

### 2.4 انتظر النشر
- Railway سيبني وينشر تلقائياً (2-3 دقائق)
- سترى "Success" عند الانتهاء

### 2.5 احصل على رابط الخادم
- **Settings** → **Networking** → **Generate Domain**
- انسخ الرابط (مثل `https://medtrain-backend-production.up.railway.app`)

### 2.6 رحّل بياناتك
- في جهازك، افتح Terminal/CMD
- ثبّت Railway CLI: `npm i -g @railway/cli`
- `railway login`
- `railway link` (اختر مشروعك)
- ضع ملف `medtrain-MASTER-*.json` في مجلد backend
- `railway run node ../scripts/migrate-data.js medtrain-MASTER-2026-05-12T11-51-53.json`
- سترى تقدم الترحيل: 5,929 متدرب...

---

## الجزء 3: نشر الواجهة (Vercel)

### 3.1 استورد المشروع
- في Vercel: **Add New** → **Project** → اختر `medtrain-frontend`

### 3.2 أضف متغير البيئة
- في **Environment Variables**:
  ```
  VITE_API_URL = (رابط Railway من الخطوة 2.5)
  ```

### 3.3 انشر
- اضغط **Deploy**
- انتظر 1-2 دقيقة
- سترى رابط مثل `https://medtrain-frontend.vercel.app`

### 3.4 (اختياري) خصّص الاسم
- **Settings** → **Domains** → غيّر إلى `medtrain-jazan`

### 3.5 حدّث FRONTEND_URL في Railway
- ارجع لـ Railway → Variables → عدّل `FRONTEND_URL` للرابط الجديد من Vercel

---

## الجزء 4: التشغيل الأول

### 4.1 افتح التطبيق
- افتح رابط Vercel على متصفحك

### 4.2 سجّل دخول
- البريد: `admin@jazan.health.sa`
- كلمة المرور: `ChangeMe123!`

### 4.3 غيّر كلمة المرور فوراً
- أضف مستخدماً جديداً برتبة Admin بكلمة مرور قوية
- أو عدّل في قاعدة البيانات

### 4.4 أضف فريقك
- صفحة المستخدمين → إضافة مستخدم
- لكل زميل: اسم، بريد، كلمة مرور، صلاحية

---

## الصلاحيات (تذكير)

| الصلاحية | يستطيع |
|----------|--------|
| **Admin** | كل شيء + إدارة المستخدمين + الحذف |
| **Coordinator** | إضافة/تعديل المتدربين والدورات + الاستيراد |
| **Trainer** | إدارة الدورات وورش العمل |
| **Viewer** | عرض فقط |

---

## فتح على الجوال

التطبيق يعمل على جوال أي شخص فور فتح الرابط:
- **iPhone:** Safari → مشاركة → "إضافة إلى الشاشة الرئيسية"
- **Android:** Chrome → القائمة → "تثبيت التطبيق"

البيانات موحّدة — أي تعديل من أي شخص يظهر للجميع فوراً (على عكس النسخة القديمة).

---

## التكلفة الشهرية المتوقعة

- Railway: $5 رصيد مجاني شهرياً (يكفي للبداية)، ثم ~$5-10
- Vercel: مجاني
- **الإجمالي: $0-10 شهرياً** في البداية

---

## الأمان والامتثال — مهم جداً

⚠️ نظامك يحوي **أرقاماً وطنية وبيانات صحية** لـ5,929 شخص. قبل الاستخدام الفعلي:

1. **راجع إدارة تقنية المعلومات** في تجمع جازان
2. **نظام حماية البيانات السعودي (PDPL)** قد يتطلب استضافة داخل المملكة
3. فكّر في **استضافة معتمدة حكومياً** بدل Railway/Vercel للبيانات الحساسة الحقيقية
4. فعّل **النسخ الاحتياطي التلقائي** في Railway (Settings → Backups)

للتجربة والاختبار، Railway/Vercel ممتازان. للإنتاج الفعلي ببيانات حقيقية، استشر IT.

---

## الدعم

إذا واجهت مشكلة في أي خطوة، الأخطاء الشائعة:
- **"Build failed"** → تحقق من رفع كل الملفات بما فيها package.json
- **"Cannot connect to database"** → تأكد أن PostgreSQL مضاف في نفس مشروع Railway
- **"CORS error"** → تأكد أن FRONTEND_URL في Railway = رابط Vercel بالضبط
- **صفحة بيضاء** → تأكد أن VITE_API_URL في Vercel صحيح

كل خطأ له حل — راجع logs في Railway/Vercel لمعرفة التفاصيل.
