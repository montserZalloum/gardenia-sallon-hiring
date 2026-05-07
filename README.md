# 🌸 Gardenia — موقع التوظيف

موقع توظيف إلكتروني لصالون **Gardenia**. الأدمن (صاحبة الصالون) تنشر وظائف بحقول ديناميكية وتدير المتقدمين عبر لوحة محمية.

## ⚙️ Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **MongoDB** (محلي via `mongod`)
- **Tailwind CSS v4** + **shadcn/ui**
- **react-hook-form** + **zod** للنماذج
- **jose** لتوقيع جلسة الأدمن (HTTP-only cookie)
- **lucide-react** + خطوط **Cairo** و **El Messiri**

## 🚀 التشغيل المحلي

### 1. تأكدي من تشغيل MongoDB

```bash
brew services start mongodb-community
# أو يدوياً:
mongod --dbpath /your/path
```

### 2. تثبيت الحزم

```bash
npm install
```

### 3. ضبط المتغيرات

انسخي `.env.example` إلى `.env.local` وعدّلي القيم:

```bash
cp .env.example .env.local
```

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=gardenia
ADMIN_EMAIL=admin@gardenia.com
ADMIN_PASSWORD=your-password-here
SESSION_SECRET=at-least-32-bytes-of-random-hex
```

> ⚠️ غيّري `ADMIN_EMAIL` و `ADMIN_PASSWORD` و `SESSION_SECRET` قبل النشر.

### 4. تشغيل التطوير

```bash
npm run dev
```

افتحي <http://localhost:3000>.

## 🗂 البنية

```
app/
├── page.tsx                      # الصفحة الرئيسية (وظائف نشطة)
├── jobs/[id]/
│   ├── page.tsx                  # صفحة تقديم الوظيفة
│   └── success/page.tsx          # شاشة الشكر
├── admin/
│   ├── login/page.tsx            # دخول الأدمن
│   └── (authed)/                 # محمية بـ proxy.ts
│       ├── layout.tsx            # هيدر الإدارة + خروج
│       ├── page.tsx              # لوحة الوظائف
│       └── jobs/
│           ├── new/page.tsx      # إنشاء وظيفة
│           └── [id]/applicants/  # متقدمون + ديالوج
└── api/
    ├── auth/{login,logout}       # جلسة JWT
    ├── jobs[/[id]/applications]  # CRUD الوظائف + التقديم
    └── applications/[id]
        ├── route.ts              # تفاصيل/تحديث/حذف
        └── files/[fieldId]       # تنزيل ملف (محمي)

uploads/                          # 🔒 ملفات السير الذاتية (خارج public)
proxy.ts                          # حماية /admin/** والـ admin APIs
lib/                              # MongoDB, auth, validation, types
```

## 🔐 الأمان

- جلسة الأدمن في cookie HTTP-only موقّع بـ JWT (`jose`)
- ملفات السير الذاتية في `/uploads/` خارج `/public` — تُخدَم فقط عبر API محمي
- `proxy.ts` يحمي:
  - كل صفحات `/admin/**` (ما عدا `/admin/login`)
  - كل APIs الإدارية (POST/DELETE/PATCH على jobs، كل `/api/applications/**`)
  - يسمح بالعام: `GET /api/jobs`, `GET /api/jobs/[id]`, `POST /api/jobs/[id]/applications`

## 📋 تدفق الاستخدام

1. **الأدمن** تدخل من `/admin/login` بالبيانات في `.env.local`
2. تنشر وظيفة من `/admin/jobs/new` (تختار حقولها وأنواعها)
3. تنسخ رابط الوظيفة وترسله للمتقدمين
4. المتقدمة تفتح `/jobs/{id}`، تعبئ الفورم، ترفع سيرتها (≤ 3MB)
5. الأدمن ترى المتقدمين في `/admin/jobs/{id}/applicants`، تفتح ديالوج التفاصيل، تحدّث الحالة، تكتب ملاحظات، تنزّل السيرة

## 🎨 الهوية البصرية

ألوان دافئة (بيج كريمي + وردي خوخي + بُني داكن) وخطوط عربية: **Cairo** للنصوص + **El Messiri** للعناوين.

## 🛠 سكربتات

| الأمر | الوصف |
|------|-------|
| `npm run dev` | تشغيل التطوير (Turbopack) |
| `npm run build` | بناء للإنتاج |
| `npm start` | تشغيل الإنتاج |
| `npm run lint` | فحص ESLint |
| `npx tsc --noEmit` | فحص الأنواع |

## 🚧 خارج النطاق (المرحلة الأولى)

- ❌ تعدد أدمنين
- ❌ إشعارات إيميل
- ❌ تعديل الوظيفة بعد التقديم الأول
- ❌ تصدير المتقدمين CSV
- ❌ إحصائيات/داشبورد

## 📄 الملاحظات

- بمجرد تقديم أول متقدم على وظيفة، **لا يمكن** تعديل الوظيفة. يجب إنشاء وظيفة جديدة (تبسيط متعمد).
- الوظائف المنتهية تختفي من العامة وتظهر للأدمن فقط بشارة "منتهية".
- الديالوج يعلّم المتقدم كـ "مقروء" تلقائياً عند الفتح.
- الملاحظات تُحفظ تلقائياً (debounce 600ms).

🌸 **صُنع بحب**
