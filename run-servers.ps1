<#
Run-Servers.ps1

Usage:
  powershell -ExecutionPolicy Bypass -File .\run-servers.ps1
  powershell -ExecutionPolicy Bypass -File .\run-servers.ps1 -StopExisting:$false -OpenBrowser:$false

What it does:
 - Optionally stops existing `node` processes (set -StopExisting:$false to skip)
 - Starts backend (`npm run start:dev`) in a new PowerShell window
 - Starts frontend (`npm run dev`) in a new PowerShell window
 - Waits for backend (port 4000) and frontend (port 3000 or 3001) to become available
 - Optionally opens the browser to backend swagger and frontend root
#>

param(
  [switch]$StopExisting = $true,
  [switch]$OpenBrowser = $true,
  [int]$WaitSeconds = 60
)

function Wait-Port {
  param(
    [string]$Host = '127.0.0.1',
    [int]$Port = 3000,
    [int]$TimeoutSec = 60
  )
  $start = Get-Date
  while ((Get-Date) - $start -lt ([TimeSpan]::FromSeconds($TimeoutSec))) {
    try {
      $t = Test-NetConnection -ComputerName $Host -Port $Port -WarningAction SilentlyContinue
      if ($t.TcpTestSucceeded) { return $true }
    } catch { }
    Start-Sleep -Milliseconds 500
  }
  return $false
}

Write-Host "Run-Servers: StopExisting=$StopExisting, OpenBrowser=$OpenBrowser, WaitSeconds=$WaitSeconds"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendPath = Join-Path $scriptRoot 'backend'
$frontendPath = Join-Path $scriptRoot 'frontend'

if ($StopExisting) {
  Write-Host 'Stopping existing node processes (if any)...' -ForegroundColor Yellow
  Get-Process node -ErrorAction SilentlyContinue | ForEach-Object {
    try { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue } catch { }
  }
  Start-Sleep -Seconds 1
}

Write-Host "Starting backend in a new window: $backendPath" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command cd `"$backendPath`"; npm run start:dev" -WorkingDirectory $backendPath

Start-Sleep -Seconds 2

Write-Host "Starting frontend in a new window: $frontendPath" -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit","-Command cd `"$frontendPath`"; npm run dev" -WorkingDirectory $frontendPath

Write-Host 'Waiting for backend (localhost:4000)...' -ForegroundColor Green
if (Wait-Port -Host '127.0.0.1' -Port 4000 -TimeoutSec $WaitSeconds) {
  Write-Host 'Backend ready.' -ForegroundColor Green
} else {
  Write-Host 'Backend did not become ready within timeout.' -ForegroundColor Red
}

Write-Host 'Waiting for frontend (localhost:3000 or 3001)...' -ForegroundColor Green
if (Wait-Port -Host '127.0.0.1' -Port 3000 -TimeoutSec 6) {
  $frontendPort = 3000
} elseif (Wait-Port -Host '127.0.0.1' -Port 3001 -TimeoutSec $WaitSeconds) {
  $frontendPort = 3001
} else {
  $frontendPort = $null
}

if ($frontendPort) { Write-Host "Frontend ready on port $frontendPort." -ForegroundColor Green } else { Write-Host 'Frontend did not become ready within timeout.' -ForegroundColor Red }

if ($OpenBrowser) {
  if ($frontendPort) { Start-Process "http://localhost:$frontendPort/" }
  Start-Sleep -Milliseconds 400
  Start-Process "http://localhost:4000/api/docs"
}

Write-Host 'Done.' -ForegroundColor Magenta
