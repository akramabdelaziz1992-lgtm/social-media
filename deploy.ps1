# نشر التطبيق - خطوات سريعة
Write-Host "========================================"
Write-Host "نشر تطبيق المسار الساخن"
Write-Host "========================================"
Write-Host ""

# Check if Git is initialized
if (-Not (Test-Path ".git")) {
    Write-Host "تهيئة Git..."
    git init
    Write-Host "تم تهيئة Git"
    Write-Host ""
}

# Check for uncommitted changes
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "📝 توجد تغييرات غير محفوظة" -ForegroundColor Yellow
    Write-Host ""
    
    $commit = Read-Host "هل تريد حفظ التغييرات والرفع على GitHub؟ (y/n)"
    
    if ($commit -eq 'y' -or $commit -eq 'Y') {
        Write-Host ""
        Write-Host "💾 حفظ التغييرات..." -ForegroundColor Cyan
        
        git add .
        
        $commitMsg = Read-Host "رسالة الحفظ (اتركها فارغة للرسالة الافتراضية)"
        if ([string]::IsNullOrWhiteSpace($commitMsg)) {
            $commitMsg = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        
        git commit -m $commitMsg
        Write-Host "✅ تم حفظ التغييرات" -ForegroundColor Green
        Write-Host ""
        
        # Check if remote exists
        $remotes = git remote
        if (-Not $remotes) {
            Write-Host "⚠️  لم يتم ربط GitHub بعد" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "الخطوات:" -ForegroundColor Cyan
            Write-Host "1. اذهب إلى https://github.com/new" -ForegroundColor White
            Write-Host "2. أنشئ repository جديد باسم: almasar-suite" -ForegroundColor White
            Write-Host "3. انسخ URL الخاص بالـ repository" -ForegroundColor White
            Write-Host ""
            
            $repoUrl = Read-Host "الصق GitHub repository URL هنا (أو اضغط Enter للتخطي)"
            
            if (-Not [string]::IsNullOrWhiteSpace($repoUrl)) {
                git remote add origin $repoUrl
                git branch -M main
                git push -u origin main
                
                Write-Host "✅ تم رفع الكود على GitHub!" -ForegroundColor Green
            }
        } else {
            Write-Host "📤 رفع التغييرات على GitHub..." -ForegroundColor Cyan
            git push
            Write-Host "✅ تم رفع التغييرات!" -ForegroundColor Green
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    خطوات النشر" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 الخطوات المطلوبة:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1️⃣  Backend (Render.com):" -ForegroundColor Cyan
Write-Host "   → اذهب إلى https://render.com" -ForegroundColor White
Write-Host "   → New + → Web Service" -ForegroundColor White
Write-Host "   → اختر almasar-suite repository" -ForegroundColor White
Write-Host "   → Root Directory: backend" -ForegroundColor White
Write-Host "   → Build: npm install && npm run build" -ForegroundColor White
Write-Host "   → Start: npm run start:prod" -ForegroundColor White
Write-Host ""

Write-Host "2️⃣  Database (Render.com):" -ForegroundColor Cyan
Write-Host "   → New + → PostgreSQL" -ForegroundColor White
Write-Host "   → انسخ Internal Database URL" -ForegroundColor White
Write-Host "   → أضفه في Backend Environment Variables" -ForegroundColor White
Write-Host ""

Write-Host "3️⃣  Frontend (Vercel.com):" -ForegroundColor Cyan
Write-Host "   → اذهب إلى https://vercel.com" -ForegroundColor White
Write-Host "   → New Project → Import almasar-suite" -ForegroundColor White
Write-Host "   → Root Directory: frontend" -ForegroundColor White
Write-Host "   → Framework: Next.js" -ForegroundColor White
Write-Host "   → Environment: NEXT_PUBLIC_API_URL=<backend-url>" -ForegroundColor White
Write-Host ""

Write-Host "4️⃣  تطبيق موبايل كول:" -ForegroundColor Cyan
Write-Host "   → cd softphone" -ForegroundColor White
Write-Host "   → npm run build:win" -ForegroundColor White
Write-Host "   → شارك ملف dist/*.exe" -ForegroundColor White
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$openGuide = Read-Host "هل تريد فتح دليل النشر الكامل؟ (y/n)"
if ($openGuide -eq 'y' -or $openGuide -eq 'Y') {
    Start-Process "DEPLOYMENT_GUIDE.md"
}

Write-Host ""
Write-Host "✨ جاهز للنشر!" -ForegroundColor Green
Write-Host ""
