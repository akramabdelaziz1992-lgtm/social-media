كيفية إنشاء زر (اختصار) لتشغيل الخوادم من سطح المكتب

1) الغرض
- ملف `create-desktop-shortcut.ps1` ينشئ اختصارًا على سطح المكتب يقوم بتشغيل `run-servers.ps1` بواسطة PowerShell (مع `ExecutionPolicy Bypass`).

2) كيفية الاستخدام
- تأكد أن كلا الملفين `create-desktop-shortcut.ps1` و `run-servers.ps1` موجودان في جذر المشروع `almasar-suite`.
- من داخل مجلد المشروع شغّل (PowerShell):

```powershell
powershell -ExecutionPolicy Bypass -File "d:\social media\almasar-suite\create-desktop-shortcut.ps1"
```

- سيُنشَأ اختصار باسم "Start Almasar Servers" على سطح المكتب. انقر عليه مرتين لتشغيل السكربت الذي يفتح الخوادم.

3) ملاحظات
- إذا لم يعمل الاختصار، افتح خصائصه وتأكد أن المسار إلى `run-servers.ps1` صحيح وأن لديك أذونات تشغيل سكربتات PowerShell.
- يمكنك تغيير اسم الاختصار بتعديل المتغيّر `$shortcutName` داخل `create-desktop-shortcut.ps1`.
