Param()
$ErrorActionPreference = "Stop"

Write-Host "==> Windows setup for Job Application Organizer"

if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
  Write-Host "winget not found. Install App Installer from Microsoft Store and re-run."
  exit 1
}

Write-Host "==> Installing system deps (ImageMagick, Ghostscript, MiKTeX)"
winget install -e --id ImageMagick.ImageMagick --accept-source-agreements --accept-package-agreements
winget install -e --id ArtifexSoftware.Ghostscript --accept-source-agreements --accept-package-agreements
winget install -e --id MiKTeX.MiKTeX --accept-source-agreements --accept-package-agreements

Write-Host "==> Backend setup"
Set-Location (Join-Path $PSScriptRoot "..\backend")
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate

Write-Host "==> Frontend setup"
Set-Location (Join-Path $PSScriptRoot "..\frontend")
npm install

Write-Host ""
Write-Host "Done."
Write-Host "Start backend:"
Write-Host "  cd ..\backend"
Write-Host "  .\.venv\Scripts\Activate.ps1"
Write-Host "  python manage.py runserver"
Write-Host "Start frontend:"
Write-Host "  cd ..\frontend"
Write-Host "  npm run dev"

