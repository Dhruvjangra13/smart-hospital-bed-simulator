# PowerShell Launcher for Smart Hospital Bed & Patient Deterioration Simulator
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host " PULSE-TWIN: Smart Hospital Bed & Patient Deterioration Simulator" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
Write-Host "Launching Backend on http://localhost:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; python run.py"

Write-Host "Launching Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`nDashboards:" -ForegroundColor Green
Write-Host "-> Frontend Web App: http://localhost:5173" -ForegroundColor White
Write-Host "-> Backend REST / Docs: http://localhost:8000/docs" -ForegroundColor White
Write-Host "=====================================================================" -ForegroundColor Cyan
