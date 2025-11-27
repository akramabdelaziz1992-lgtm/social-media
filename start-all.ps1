# Almasar Suite - Start All Services
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Almasar Suite - Starting System" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Stop old processes
Write-Host "Stopping old processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "Done`n" -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\social media\almasar-suite\backend'; npm run start:dev" -WindowStyle Normal
Start-Sleep -Seconds 10
Write-Host "Backend started`n" -ForegroundColor Green

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\social media\almasar-suite\frontend'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 8
Write-Host "Frontend started`n" -ForegroundColor Green

# Start Ngrok
Write-Host "Starting Ngrok..." -ForegroundColor Yellow
Start-Process -FilePath "ngrok" -ArgumentList "http 4000" -WindowStyle Normal
Start-Sleep -Seconds 5

# Get Ngrok URL
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -Method Get
    $publicUrl = $ngrokApi.tunnels[0].public_url
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  System Ready!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Mobile Call: http://localhost:3000/mobile-call" -ForegroundColor Yellow
    Write-Host "Ngrok URL: $publicUrl" -ForegroundColor Cyan
    Write-Host "TwiML URL: $publicUrl/api/calls/twiml/outbound" -ForegroundColor White
    Write-Host ""
    Write-Host "========================================`n" -ForegroundColor Cyan
    
    Set-Clipboard -Value "$publicUrl/api/calls/twiml/outbound"
    Write-Host "TwiML URL copied to clipboard!" -ForegroundColor Green
    
} catch {
    Write-Host "Ngrok loading - Open http://127.0.0.1:4040`n" -ForegroundColor Yellow
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
