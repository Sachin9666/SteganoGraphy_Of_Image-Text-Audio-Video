# Setup Trusted Virtual Environment in C:\Program Files to Bypass WDAC/AppLocker DLL Block
# Make sure to run this script in an Elevated PowerShell Prompt (Run as Administrator)

$ErrorActionPreference = "Stop"

# 1. Check for administrative privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "This script MUST be run as an Administrator to write to C:\Program Files. Please close this window, open PowerShell as Administrator, and try again."
    Exit 1
}

$VenvPath = "C:\Program Files\stego-env"
$ReqPath = Join-Path $PSScriptRoot "requirements.txt"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Setting up trusted virtual environment at:" -ForegroundColor Cyan
Write-Host "  $VenvPath" -ForegroundColor Yellow
Write-Host "Using dependencies from:" -ForegroundColor Cyan
Write-Host "  $ReqPath" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 2. Check if requirements.txt exists
if (-not (Test-Path $ReqPath)) {
    Write-Error "Could not find requirements.txt at $ReqPath"
    Exit 1
}

# 3. Create the virtual environment
if (Test-Path $VenvPath) {
    Write-Host "Virtual environment folder already exists at $VenvPath. Recreating to ensure clean state..." -ForegroundColor Cyan
    Remove-Item -Path $VenvPath -Recurse -Force
}

Write-Host "Creating python virtual environment..." -ForegroundColor Cyan
& python -m venv $VenvPath

# 4. Determine paths to python and pip in the new environment
$PythonExe = Join-Path $VenvPath "Scripts\python.exe"
$PipExe = Join-Path $VenvPath "Scripts\pip.exe"

# 5. Upgrade pip
Write-Host "Upgrading pip in the new environment..." -ForegroundColor Cyan
& $PythonExe -m pip install --upgrade pip

# 6. Install dependencies
Write-Host "Installing requirements from requirements.txt..." -ForegroundColor Cyan
& $PipExe install -r $ReqPath

# 7. Verify PyTorch
Write-Host "Verifying PyTorch load..." -ForegroundColor Cyan
try {
    $TestCmd = 'import torch; print("PyTorch version:", torch.__version__); print("CUDA available:", torch.cuda.is_available())'
    $Output = & $PythonExe -c $TestCmd
    Write-Host "SUCCESS: PyTorch was imported successfully!" -ForegroundColor Green
    Write-Host $Output -ForegroundColor Green
} catch {
    Write-Host "ERROR: PyTorch loading failed or was blocked." -ForegroundColor Red
    Write-Error $_
}

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "SETUP COMPLETED!" -ForegroundColor Green
Write-Host "To run the backend using this environment, run:" -ForegroundColor Green
Write-Host "  & `"$PythonExe`" -m uvicorn backend.main:app --reload" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
