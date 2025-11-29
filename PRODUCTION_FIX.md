# إصلاح مشكلة تسجيل الدخول في الاستضافة (Production)

## المشكلة
عند فتح الموقع من الاستضافة (almasar-frontend.vercel.app)، صفحة تسجيل الدخول لا تعمل - بينما تعمل بشكل صحيح على localhost.

## السبب
الموقع في الاستضافة لا يعرف عنوان Backend API الصحيح. يحتاج لمتغير بيئة (Environment Variable) يحدد عنوان الـ API.

## الحل: إضافة متغيرات البيئة في Vercel

### الخطوات:

1. **افتح لوحة تحكم Vercel**
   - اذهب إلى: https://vercel.com/dashboard
   - اختر مشروع `almasar-frontend`

2. **اذهب إلى الإعدادات**
   - اضغط على "Settings" (الإعدادات)
   - اختر "Environment Variables" (متغيرات البيئة)

3. **أضف المتغيرات التالية:**

   **المتغير الأول:**
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://almasar-backend2025.onrender.com/api
   Environment: Production, Preview, Development (اختر الثلاثة)
   ```

   **المتغير الثاني:**
   ```
   Name: NEXT_PUBLIC_API_BASE_URL
   Value: https://almasar-backend2025.onrender.com
   Environment: Production, Preview, Development (اختر الثلاثة)
   ```

   **المتغير الثالث:**
   ```
   Name: NEXT_PUBLIC_WS_URL
   Value: https://almasar-backend2025.onrender.com
   Environment: Production, Preview, Development (اختر الثلاثة)
   ```

4. **أعد نشر الموقع (Redeploy)**
   - اذهب إلى "Deployments" (عمليات النشر)
   - اضغط على آخر deployment
   - اضغط على "..." (ثلاث نقاط)
   - اختر "Redeploy" (إعادة النشر)
   - انتظر حتى ينتهي النشر (سيأخذ دقيقة أو دقيقتين)

5. **اختبر الموقع**
   - افتح: https://almasar-frontend.vercel.app/login
   - جرب تسجيل الدخول ب:
     - Email: `admin@elmasarelsa5en.com`
     - Password: `Admin@123`

## تحقق من عمل Backend

قبل الاختبار، تأكد أن الـ Backend يعمل:
- افتح: https://almasar-backend2025.onrender.com/api/health
- يجب أن تظهر رسالة مثل `{"status":"ok"}`

إذا لم يعمل، قد يكون الـ Backend نائم (Render يوقف الـ Free Tier بعد فترة عدم استخدام).
انتظر 30-60 ثانية وجرب مرة أخرى.

## ملاحظات مهمة

### CORS (Cross-Origin Resource Sharing)
إذا استمرت المشكلة، قد تحتاج لتعديل إعدادات CORS في الـ Backend:

في ملف `backend/src/main.ts`، تأكد من وجود:
```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    'https://almasar-frontend.vercel.app'
  ],
  credentials: true,
});
```

### متغيرات البيئة المحلية
في ملف `frontend/.env.local` (للتطوير المحلي):
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_WS_URL=http://localhost:4000
NEXT_PUBLIC_APP_NAME=المسار الساخن
NEXT_PUBLIC_COMPANY_WEBSITE=https://www.elmasarelsa5en.com
```

## اختبار تسجيل دخول الموظفين

بعد إصلاح تسجيل الدخول الأساسي، اختبر نظام الموظفين:

1. **أنشئ حساب موظف:**
   - سجل دخول كـ Admin
   - اذهب إلى صفحة "إدارة الموظفين"
   - أضف موظف جديد

2. **سجل خروج وسجل دخول بحساب الموظف:**
   - اضغط "تسجيل الخروج"
   - سجل دخول ببيانات الموظف الجديد

3. **اختبر المكالمات:**
   - اذهب إلى "الرقم الموحد"
   - قم بمكالمة تجريبية
   - تحقق من ظهور اسم الموظف في سجل المكالمات

## إذا استمرت المشكلة

افتح Console في المتصفح (F12):
1. اذهب إلى تبويب "Console"
2. جرب تسجيل الدخول
3. ابحث عن رسائل الأخطاء باللون الأحمر
4. أرسل صورة للخطأ للمساعدة في الحل

رسائل الخطأ الشائعة:
- `CORS error` → مشكلة في إعدادات Backend
- `404 Not Found` → عنوان API غير صحيح
- `500 Server Error` → مشكلة في Backend نفسه
- `Network Error` → Backend غير متاح أو نائم

---

## التحسينات المطبقة على صفحة المكالمات المحمولة

تم إصلاح المشاكل التالية:

✅ **حجم الصفحة:** تم ضبط الارتفاع ليناسب الشاشة
✅ **التمرير في النموذج:** أضيفت خاصية التمرير لنموذج إضافة جهة اتصال
✅ **عرض جهات الاتصال:** يظهر عدد جهات الاتصال ورسالة إذا كانت القائمة فارغة
✅ **التمرير في القوائم:** سجل المكالمات وجهات الاتصال يدعمان التمرير
✅ **تصميم متجاوب:** تحسين الأحجام والمسافات للشاشات الصغيرة

### التغييرات التقنية:

1. **الحاوية الرئيسية:**
   ```tsx
   <div className="max-h-screen ... overflow-hidden">
   ```

2. **منطقة المحتوى:**
   ```tsx
   <div className="h-[calc(100vh-12rem)] overflow-y-auto">
   ```

3. **نموذج إضافة جهة اتصال:**
   ```tsx
   <div className="max-h-[300px] overflow-y-auto">
   ```

4. **قوائم جهات الاتصال والمكالمات:**
   ```tsx
   <div className="flex flex-col h-full">
     <div className="flex-shrink-0">Header</div>
     <div className="flex-1 overflow-y-auto">List</div>
   </div>
   ```
