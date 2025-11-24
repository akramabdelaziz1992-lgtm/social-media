# Deploy AlMasar Application
Write-Host "========================================"
Write-Host "نشر تطبيق المسار الساخن على الاستضافة"
Write-Host "========================================"
Write-Host ""

# Step 1: Git Setup
Write-Host "الخطوة 1: تجهيز Git" -ForegroundColor Cyan
Write-Host ""

if (-Not (Test-Path ".git")) {
    Write-Host "تهيئة Git..."
    git init
    git add .
    git commit -m "Initial commit - Ready for deployment"
    Write-Host "تم تهيئة Git بنجاح"
} else {
    Write-Host "Git موجود مسبقاً"
    
    # Check for changes
    $changes = git status --porcelain
    if ($changes) {
        Write-Host "حفظ التغييرات..."
        git add .
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm"
        git commit -m "Update: $timestamp"
        Write-Host "تم حفظ التغييرات"
    } else {
        Write-Host "لا توجد تغييرات جديدة"
    }
}

Write-Host ""
Write-Host "========================================"
Write-Host "خطوات النشر على الاستضافة"
Write-Host "========================================"
Write-Host ""

Write-Host "1. رفع على GitHub:" -ForegroundColor Yellow
Write-Host "   - اذهب إلى: https://github.com/new"
Write-Host "   - اسم Repository: almasar-suite"
Write-Host "   - Public أو Private"
Write-Host "   - Create repository"
Write-Host ""
Write-Host "   ثم نفذ:"
Write-Host "   git remote add origin <YOUR_REPO_URL>"
Write-Host "   git push -u origin main"
Write-Host ""

Write-Host "2. Backend على Render.com:" -ForegroundColor Yellow
Write-Host "   - اذهب إلى: https://render.com"
Write-Host "   - New + > Web Service"
Write-Host "   - Connect GitHub repository"
Write-Host "   - اسم: almasar-backend"
Write-Host "   - Root Directory: backend"
Write-Host "   - Build: npm install && npm run build"
Write-Host "   - Start: npm run start:prod"
Write-Host "   - Add Environment Variables من ملف .env"
Write-Host ""

Write-Host "3. Database على Render.com:" -ForegroundColor Yellow
Write-Host "   - New + > PostgreSQL"
Write-Host "   - اسم: almasar-db"
Write-Host "   - انسخ Internal Database URL"
Write-Host "   - أضفه في Backend Environment Variables"
Write-Host ""

Write-Host "4. Frontend على Vercel.com:" -ForegroundColor Yellow
Write-Host "   - اذهب إلى: https://vercel.com"
Write-Host "   - New Project"
Write-Host "   - Import GitHub: almasar-suite"
Write-Host "   - Root Directory: frontend"
Write-Host "   - Framework: Next.js"
Write-Host "   - Environment Variable:"
Write-Host "     NEXT_PUBLIC_API_URL=<your-backend-url>"
Write-Host ""

Write-Host "========================================"
Write-Host "للمزيد من التفاصيل، راجع:"
Write-Host "DEPLOYMENT_GUIDE.md"
Write-Host "========================================"
Write-Host ""

Write-Host "جاهز للنشر!" -ForegroundColor Green
