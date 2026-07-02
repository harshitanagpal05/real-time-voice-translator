# VoxAI — Start Node API, Python API, and frontend (Windows PowerShell)

$ErrorActionPreference = "Continue"

$root = $PSScriptRoot



function Test-PortFree([int]$Port) {

  $inUse = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

  return -not $inUse

}



function Get-FreePort([int[]]$Candidates) {

  foreach ($p in $Candidates) {

    if (Test-PortFree $p) { return $p }

  }

  return $Candidates[-1]

}



$nodePort = Get-FreePort @(5000, 5001, 5002)

$pythonPort = Get-FreePort @(8000, 8001, 8080)

$frontendPort = Get-FreePort @(5173, 5174, 5175)



Write-Host ""

Write-Host "  VoxAI Translator — Starting servers..." -ForegroundColor Cyan

Write-Host ""



if ($nodePort -ne 5000) {

  Write-Host "  Port 5000 busy — using Node API port $nodePort" -ForegroundColor DarkYellow

}

if ($pythonPort -ne 8000) {

  Write-Host "  Port 8000 busy — using Python API port $pythonPort" -ForegroundColor DarkYellow

}



Write-Host "  [1/3] Node API    -> http://127.0.0.1:$nodePort" -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(

  "-NoExit",

  "-Command",

  "Set-Location '$root\backend'; `$env:PORT='$nodePort'; Write-Host 'Node API on port $nodePort' -ForegroundColor Green; npm run dev"

)



Start-Sleep -Seconds 2



Write-Host "  [2/3] Python API  -> http://127.0.0.1:$pythonPort" -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(

  "-NoExit",

  "-Command",

  "Set-Location '$root\backend\API'; `$env:PORT='$pythonPort'; Write-Host 'Python API on port $pythonPort' -ForegroundColor Green; python -m uvicorn main:app --host 127.0.0.1 --port $pythonPort --reload"

)



Start-Sleep -Seconds 2



Write-Host "  [3/3] Frontend    -> http://localhost:$frontendPort" -ForegroundColor Yellow

Start-Process powershell -ArgumentList @(

  "-NoExit",

  "-Command",

  "Set-Location '$root\ai-translator-frontend'; Write-Host 'Frontend on port $frontendPort' -ForegroundColor Green; npm run dev -- --port $frontendPort --host localhost"

)



Start-Sleep -Seconds 4



Write-Host ""

Write-Host "  Servers launched in separate windows." -ForegroundColor Green

Write-Host "  Open: http://localhost:$frontendPort" -ForegroundColor White

Write-Host ""



if ($nodePort -ne 5000) {

  Write-Host "  NOTE: Update ai-translator-frontend/.env if Node API is not on 5000:" -ForegroundColor DarkYellow

  Write-Host "        VITE_API_URL=http://127.0.0.1:$nodePort" -ForegroundColor DarkYellow

  Write-Host ""

}



try {

  $nodeHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$nodePort/health" -TimeoutSec 8

  Write-Host "  Node API health: $($nodeHealth.status)" -ForegroundColor Green

} catch {

  Write-Host "  Node API still starting... wait a few seconds." -ForegroundColor DarkYellow

}



try {

  $pythonHealth = Invoke-RestMethod -Uri "http://127.0.0.1:$pythonPort/" -TimeoutSec 8

  Write-Host "  Python API health: $($pythonHealth.status)" -ForegroundColor Green

} catch {

  Write-Host "  Python API still starting... wait a few seconds." -ForegroundColor DarkYellow

}

