# ===============================================
# تعليمات رفع الكود - بسيطة جداً
# ===============================================

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Git Push Failed - Solution" -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "The problem: GitHub token is for wrong account (stay5422-wq)" -ForegroundColor Red
Write-Host ""

Write-Host "SOLUTION:" -ForegroundColor Green
Write-Host "----------" -ForegroundColor Gray
Write-Host ""

Write-Host "Step 1: Sign out from stay5422-wq on GitHub" -ForegroundColor Yellow
Write-Host "  1. Open: https://github.com" -ForegroundColor White
Write-Host "  2. Click your profile (top right)" -ForegroundColor White
Write-Host "  3. Click 'Sign out'" -ForegroundColor White
Write-Host ""

Write-Host "Step 2: Sign in with akramabdelaziz1992-lgtm" -ForegroundColor Yellow
Write-Host "  1. Click 'Sign in'" -ForegroundColor White
Write-Host "  2. Use: akramabdelaziz1992@gmail.com" -ForegroundColor White
Write-Host ""

Write-Host "Step 3: Create new token (IMPORTANT!)" -ForegroundColor Yellow
Write-Host "  1. Click this link (will open browser):" -ForegroundColor White
Write-Host ""

# فتح الرابط
Start-Process "https://github.com/settings/tokens/new?description=almasar-deployment&scopes=repo,workflow"

Write-Host "  2. Click 'Generate token'" -ForegroundColor White
Write-Host "  3. Copy the new token (ghp_xxxxx...)" -ForegroundColor White
Write-Host ""

Write-Host "Step 4: Run this command:" -ForegroundColor Yellow
Write-Host ""
Write-Host '  cd "d:\social media\almasar-suite"' -ForegroundColor Cyan
Write-Host '  git remote set-url origin https://akramabdelaziz1992-lgtm:YOUR_NEW_TOKEN@github.com/akramabdelaziz1992-lgtm/social-media.git' -ForegroundColor Cyan
Write-Host '  git push origin main' -ForegroundColor Cyan
Write-Host ""
Write-Host "  (Replace YOUR_NEW_TOKEN with the token you copied)" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# إنشاء ملف نصي بالتعليمات
$instructions = @"
================================================
GITHUB PUSH INSTRUCTIONS
================================================

PROBLEM: Token is for wrong account (stay5422-wq)

SOLUTION:
---------

1. Sign out from GitHub.com (stay5422-wq)
2. Sign in as: akramabdelaziz1992-lgtm
3. Create token: https://github.com/settings/tokens/new
   - Scopes: repo, workflow
   - Click "Generate token"
   - COPY THE TOKEN!

4. Run these commands in PowerShell:

cd "d:\social media\almasar-suite"

git remote set-url origin https://akramabdelaziz1992-lgtm:YOUR_TOKEN@github.com/akramabdelaziz1992-lgtm/social-media.git

git push origin main

================================================

After successful push:
- Go to Render.com for Backend
- Go to Vercel.com for Frontend
- See DEPLOY_NOW.md for details

================================================
"@

$instructions | Out-File "GITHUB_FIX.txt" -Encoding UTF8

Write-Host "Instructions saved to: GITHUB_FIX.txt" -ForegroundColor Green
Write-Host ""
