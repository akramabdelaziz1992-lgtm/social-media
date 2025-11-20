# Creates a Desktop shortcut that launches the project's run-servers.ps1 using PowerShell
try {
    $ws = New-Object -ComObject WScript.Shell
    $desktop = [Environment]::GetFolderPath('Desktop')
    $shortcutName = 'Start Almasar Servers.lnk'
    $shortcutPath = Join-Path $desktop $shortcutName

    $powershellExe = Join-Path $env:SystemRoot 'System32\WindowsPowerShell\v1.0\powershell.exe'

    # run-servers.ps1 is expected to be in the same repository root as this script
    $runServers = Join-Path $PSScriptRoot 'run-servers.ps1'
    if (-not (Test-Path $runServers)) {
        Write-Error "Cannot find run-servers.ps1 at: $runServers`nPlace this script in the repo root alongside run-servers.ps1 or adjust the path."; exit 1
    }

    $arguments = "-ExecutionPolicy Bypass -NoProfile -WindowStyle Normal -File `"$runServers`""

    $shortcut = $ws.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = $powershellExe
    $shortcut.Arguments = $arguments
    $shortcut.WorkingDirectory = $PSScriptRoot
    $shortcut.IconLocation = "$powershellExe,0"
    $shortcut.Save()

    Write-Host "Shortcut created:" $shortcutPath
    exit 0
} catch {
    Write-Error "Failed to create shortcut: $_"
    exit 1
}
