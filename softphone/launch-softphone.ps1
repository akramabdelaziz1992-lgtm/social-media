# Script to launch Mobile Call Softphone
# This script can be called from the backend to launch the softphone application

$softphonePath = Join-Path $PSScriptRoot "node_modules\.bin\electron.cmd"
$mainPath = Join-Path $PSScriptRoot "main.js"

if (Test-Path $softphonePath) {
    Write-Host "🚀 Launching Mobile Call Softphone..."
    Start-Process -FilePath $softphonePath -ArgumentList $mainPath -WindowStyle Normal
    Write-Host "✅ Mobile Call launched successfully"
} else {
    Write-Host "❌ Error: Electron not found. Please run 'npm install' first."
    exit 1
}
