[CmdletBinding()]
param([switch]$SkipInstall)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

if (-not $SkipInstall) { npm install }

try {
  $health = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:3000/api/v1/health' -TimeoutSec 3
  if ($health.StatusCode -ne 200) { throw 'API health check failed.' }
} catch {
  throw 'API 未运行或数据库未就绪。请先启动 API，再运行本脚本。'
}

$previews = @(
  @{ Name = '用户端'; Port = 5173; Workspace = '@express-platform/user-app'; Script = 'dev:h5' },
  @{ Name = '配送员端'; Port = 5174; Workspace = '@express-platform/courier-app'; Script = 'dev:h5' },
  @{ Name = '管理后台'; Port = 5175; Workspace = '@express-platform/admin-web'; Script = 'dev' }
)

foreach ($preview in $previews) {
  $existing = Get-NetTCPConnection -LocalPort $preview.Port -State Listen -ErrorAction SilentlyContinue
  if (-not $existing) {
    Start-Process -FilePath 'npm.cmd' -ArgumentList @('run', $preview.Script, '-w', $preview.Workspace) -WorkingDirectory $repoRoot -WindowStyle Hidden
  }
}

foreach ($preview in $previews) {
  $ready = $false
  foreach ($attempt in 1..30) {
    try {
      $response = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$($preview.Port)/" -TimeoutSec 2
      if ($response.StatusCode -eq 200) { $ready = $true; break }
    } catch {
      Start-Sleep -Milliseconds 500
    }
  }
  if (-not $ready) { throw "$($preview.Name) 未能在端口 $($preview.Port) 启动。" }
  Write-Host "$($preview.Name): http://127.0.0.1:$($preview.Port)/"
}
