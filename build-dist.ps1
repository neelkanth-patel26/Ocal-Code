# Ocal Code Studio Premium Build & Inno Setup Script
# Automates TypeScript compilation, Vite bundling, Electron packaging, and Inno Setup 6 compilation.

$ErrorActionPreference = "Stop"

$pkg = Get-Content package.json | ConvertFrom-Json
$version = $pkg.version
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   ⚡ Ocal Code Studio v$version Premium Inno Setup Builder" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Directory Cleanup
Write-Host "`n[1/4] Cleaning build directories..." -ForegroundColor Gray
if (Test-Path "dist-inno") { Remove-Item -Recurse -Force "dist-inno" }
New-Item -ItemType Directory -Path "dist-inno" -Force | Out-Null

# 2. Production Web Bundle & Electron Packaging
Write-Host "`n[2/4] Compiling frontend & packaging Electron binaries..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "TypeScript / Vite build failed." }

cmd.exe /c npx electron-builder --dir
if ($LASTEXITCODE -ne 0) { throw "Electron packaging failed." }

# 3. Inno Setup 6 Compilation
Write-Host "`n[3/4] Compiling Inno Setup installer..." -ForegroundColor Magenta

$isccPaths = @(
    "ISCC.exe",
    "$env:USERPROFILE\AppData\Local\Programs\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe",
    "C:\Program Files\Inno Setup 6\ISCC.exe",
    "C:\Program Files (x86)\Inno Setup 5\ISCC.exe",
    "$env:LOCALAPPDATA\Programs\Inno Setup 6\ISCC.exe"
)

$isccPath = $null
foreach ($path in $isccPaths) {
    if (Get-Command $path -ErrorAction SilentlyContinue) {
        $isccPath = (Get-Command $path).Source
        break
    }
    if (Test-Path $path) {
        $isccPath = $path
        break
    }
}

if (-not $isccPath) {
    Write-Host "WARNING: ISCC.exe (Inno Setup 6) not detected in standard system paths." -ForegroundColor Yellow
    Write-Host "If Inno Setup 6 is installed elsewhere, please add it to your PATH." -ForegroundColor Gray
    Write-Host "Portable binaries are ready at: release\win-unpacked\Ocal Code.exe" -ForegroundColor Green
} else {
    Write-Host "Using ISCC compiler at: $isccPath" -ForegroundColor Gray
    & $isccPath installer.iss
    if ($LASTEXITCODE -ne 0) { throw "Inno Setup compilation failed." }
    Write-Host "Inno Setup installer created successfully in dist-inno\" -ForegroundColor Green
}

# 4. Final Summary
Write-Host "`n[4/4] Build Complete!" -ForegroundColor Green
$setupFile = Get-ChildItem "dist-inno\Ocal-Code-*-Setup.exe" -ErrorAction SilentlyContinue
if ($setupFile) {
    Write-Host "Inno Setup Executable: $($setupFile.FullName)" -ForegroundColor White
} else {
    Write-Host "Unpacked Executable: release\win-unpacked\Ocal Code.exe" -ForegroundColor White
}
