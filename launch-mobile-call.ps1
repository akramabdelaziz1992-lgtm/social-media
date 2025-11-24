# Launch Mobile Call Softphone - موبايل كول

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    موبايل كول - Mobile Call" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to softphone directory
$softphoneDir = Join-Path $PSScriptRoot "softphone"
Set-Location $softphoneDir

Write-Host "📂 Directory: $softphoneDir" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  Node modules not found. Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Launch the application
Write-Host "🚀 Launching Mobile Call Softphone..." -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Use Ctrl+C to stop the application" -ForegroundColor Gray
Write-Host "   - Window will minimize to system tray" -ForegroundColor Gray
Write-Host "   - All calls are logged to the database" -ForegroundColor Gray
Write-Host ""

npm start
