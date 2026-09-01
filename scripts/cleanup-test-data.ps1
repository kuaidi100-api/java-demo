# 测试数据清理包装脚本
# 用法:
#   .\scripts\cleanup-test-data.ps1              # dry-run
#   .\scripts\cleanup-test-data.ps1 -Execute     # 真正删除
#   .\scripts\cleanup-test-data.ps1 -Execute -IncludeSeedUsers
#   .\scripts\cleanup-test-data.ps1 -SkipApi
#
# 会设置安全相关环境变量（不覆盖你已有的 DATABASE_URL）。
# 密钥请放在 DK100/java-demo/.env，本脚本不写死密码。

[CmdletBinding()]
param(
  [switch]$Execute,
  [switch]$SkipApi,
  [switch]$SkipDb,
  [switch]$IncludeSeedUsers,
  [switch]$IKnowThisIsNotProd,
  [string]$ApiBaseUrl = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Set-Location $Root

if (-not $env:NODE_ENV -or $env:NODE_ENV -eq "production") {
  $env:NODE_ENV = "test"
}
if (-not $env:TEST_DB) { $env:TEST_DB = "1" }
if (-not $env:ALLOW_TEST_DATA_CLEANUP) { $env:ALLOW_TEST_DATA_CLEANUP = "1" }
if ($ApiBaseUrl) { $env:API_BASE_URL = $ApiBaseUrl }

$argsList = @()
if ($Execute) { $argsList += "--execute" }
if ($SkipApi) { $argsList += "--skip-api" }
if ($SkipDb) { $argsList += "--skip-db" }
if ($IncludeSeedUsers) { $argsList += "--include-seed-users" }
if ($IKnowThisIsNotProd) { $argsList += "--i-know-this-is-not-prod" }

Write-Host "Working directory: $Root"
Write-Host "NODE_ENV=$($env:NODE_ENV) TEST_DB=$($env:TEST_DB)"
node "$PSScriptRoot\cleanup-test-data.mjs" @argsList
exit $LASTEXITCODE
