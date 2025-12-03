# Start backend and keep it running
Write-Host "Starting backend..." -ForegroundColor Cyan
Set-Location "d:\social media\almasar-suite\backend"
node dist/main.js
Write-Host "`nBackend stopped. Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
