[CmdletBinding()]
param(
  [switch]$SkipInstall,
  [switch]$SkipSeed
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $repoRoot

if (-not (Test-Path '.env')) {
  Copy-Item -LiteralPath '.env.example' -Destination '.env'
  Write-Host 'Created local .env from .env.example. Replace placeholder secrets before shared use.'
}

Get-Content -LiteralPath '.env' | ForEach-Object {
  $line = $_.Trim()
  if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
    $name, $value = $line.Split('=', 2)
    [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), 'Process')
  }
}

docker info *> $null
if ($LASTEXITCODE -ne 0) {
  $dockerDesktop = 'C:\Program Files\Docker\Docker\Docker Desktop.exe'
  if (-not (Test-Path -LiteralPath $dockerDesktop)) {
    throw 'Docker engine is unavailable and Docker Desktop was not found.'
  }
  Start-Process -FilePath $dockerDesktop -WindowStyle Hidden
  Write-Host 'Waiting for Docker Desktop...'
  $ready = $false
  foreach ($attempt in 1..60) {
    Start-Sleep -Seconds 2
    docker info *> $null
    if ($LASTEXITCODE -eq 0) {
      $ready = $true
      break
    }
  }
  if (-not $ready) { throw 'Docker Desktop did not become ready within 120 seconds.' }
}

if (-not $SkipInstall) { npm install }
docker compose up -d mysql redis

Write-Host 'Waiting for MySQL health check...'
$mysqlReady = $false
foreach ($attempt in 1..60) {
  $status = docker inspect --format '{{.State.Health.Status}}' express-platform-mysql 2>$null
  if ($status -eq 'healthy') {
    $mysqlReady = $true
    break
  }
  Start-Sleep -Seconds 2
}
if (-not $mysqlReady) { throw 'MySQL did not become healthy within 120 seconds.' }

npm run db:generate
npm run db:migrate
if (-not $SkipSeed) { npm run db:seed }
npm run typecheck
npm run build

Write-Host 'API: http://localhost:3000/api/v1/health'
Write-Host 'Swagger: http://localhost:3000/docs'
Write-Host 'Starting NestJS API. Press Ctrl+C to stop the API process.'
npm run start:api
