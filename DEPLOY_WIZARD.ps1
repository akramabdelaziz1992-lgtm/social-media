# ===============================================
# 🚀 COMPLETE DEPLOYMENT GUIDE - STEP BY STEP
# ===============================================

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host "     DEPLOYMENT WIZARD" -ForegroundColor Yellow
Write-Host "     Follow Steps 1→2→3→4" -ForegroundColor Yellow  
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

function Show-Step {
    param($number, $title, $file)
    Write-Host "[$number] $title" -ForegroundColor Green
    Write-Host "    → Open: $file" -ForegroundColor White
    Write-Host ""
}

# القائمة الرئيسية
Write-Host "PREPARATION:" -ForegroundColor Magenta
Write-Host "------------" -ForegroundColor Gray
Show-Step "0" "Fix GitHub Push (MUST DO FIRST!)" "GITHUB_FIX.txt"

Write-Host "DEPLOYMENT STEPS:" -ForegroundColor Magenta
Write-Host "-----------------" -ForegroundColor Gray
Show-Step "1" "Deploy Backend on Render.com" "RENDER_SETTINGS.txt"
Show-Step "2" "Deploy Frontend on Vercel.com" "VERCEL_SETTINGS.txt"
Show-Step "3" "Update Twilio Webhooks" "TWILIO_WEBHOOKS.txt"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# قائمة التفاعلية
Write-Host "What do you want to do?" -ForegroundColor Yellow
Write-Host ""
Write-Host "[0] Fix GitHub Push (Start Here!)" -ForegroundColor White
Write-Host "[1] Open Render Settings" -ForegroundColor White
Write-Host "[2] Open Vercel Settings" -ForegroundColor White
Write-Host "[3] Open Twilio Webhooks" -ForegroundColor White
Write-Host "[4] Open ALL files" -ForegroundColor White
Write-Host "[5] Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (0-5)"

switch ($choice) {
    "0" {
        Write-Host ""
        Write-Host "Opening GitHub Fix instructions..." -ForegroundColor Green
        notepad "GITHUB_FIX.txt"
        Start-Process "https://github.com"
    }
    "1" {
        Write-Host ""
        Write-Host "Opening Render settings..." -ForegroundColor Green
        notepad "RENDER_SETTINGS.txt"
        Start-Process "https://dashboard.render.com"
    }
    "2" {
        Write-Host ""
        Write-Host "Opening Vercel settings..." -ForegroundColor Green
        notepad "VERCEL_SETTINGS.txt"
        Start-Process "https://vercel.com/dashboard"
    }
    "3" {
        Write-Host ""
        Write-Host "Opening Twilio webhooks..." -ForegroundColor Green
        notepad "TWILIO_WEBHOOKS.txt"
        Start-Process "https://console.twilio.com"
    }
    "4" {
        Write-Host ""
        Write-Host "Opening all deployment files..." -ForegroundColor Green
        notepad "GITHUB_FIX.txt"
        Start-Sleep 1
        notepad "RENDER_SETTINGS.txt"
        Start-Sleep 1
        notepad "VERCEL_SETTINGS.txt"
        Start-Sleep 1
        notepad "TWILIO_WEBHOOKS.txt"
        Write-Host ""
        Write-Host "All files opened! Follow them in order (0→1→2→3)" -ForegroundColor Yellow
    }
    "5" {
        Write-Host ""
        Write-Host "Good luck with deployment! 🚀" -ForegroundColor Green
        Write-Host ""
        exit
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice!" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Need help? All settings files are in:" -ForegroundColor Yellow
Write-Host "d:\social media\almasar-suite\" -ForegroundColor White
Write-Host ""
Write-Host "Files created:" -ForegroundColor Yellow
Write-Host "  ✓ GITHUB_FIX.txt" -ForegroundColor Green
Write-Host "  ✓ RENDER_SETTINGS.txt" -ForegroundColor Green
Write-Host "  ✓ VERCEL_SETTINGS.txt" -ForegroundColor Green
Write-Host "  ✓ TWILIO_WEBHOOKS.txt" -ForegroundColor Green
Write-Host ""
