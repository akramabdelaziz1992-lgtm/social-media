# ===============================================
# رفع الكود على GitHub
# ===============================================

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "       رفع الكود على GitHub" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# التأكد من وجود Git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "Git is not installed!" -ForegroundColor Red
    exit 1
}

# التوجه للمجلد
Set-Location "d:\social media\almasar-suite"

Write-Host "Step 1: Create GitHub Personal Access Token" -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "1. Browser will open to GitHub Token creation page" -ForegroundColor White
Write-Host "2. Click 'Generate token' button" -ForegroundColor White
Write-Host "3. Copy the token (ghp_xxxxxxxxxxxxx)" -ForegroundColor White
Write-Host "4. Come back here and paste it" -ForegroundColor White
Write-Host ""

# فتح المتصفح
Start-Process "https://github.com/settings/tokens/new?description=almasar-deployment&scopes=repo,workflow"

# انتظار المستخدم
Write-Host "Press any key after you copied the token..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# طلب Token
Write-Host ""
$token = Read-Host "Paste your GitHub token here"

if ([string]::IsNullOrWhiteSpace($token)) {
    Write-Host "No token provided!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Updating Git Remote..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

# تحديث Remote URL
git remote set-url origin "https://akramabdelaziz1992-lgtm:$token@github.com/akramabdelaziz1992-lgtm/social-media.git"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote URL updated successfully" -ForegroundColor Green
} else {
    Write-Host "Failed to update remote URL" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 3: Pushing to GitHub..." -ForegroundColor Green
Write-Host "----------------------------------------" -ForegroundColor Gray

# رفع الكود
git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "    Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Deploy Backend on Render.com" -ForegroundColor White
    Write-Host "2. Deploy Frontend on Vercel.com" -ForegroundColor White
    Write-Host "3. Update Twilio Webhooks" -ForegroundColor White
    Write-Host ""
    Write-Host "Open DEPLOY_NOW.md for detailed instructions" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Failed to push to GitHub!" -ForegroundColor Red
    Write-Host "Please check your token and try again" -ForegroundColor Yellow
    exit 1
}
