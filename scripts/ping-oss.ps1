$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Get-Content (Join-Path $root '.env') | ForEach-Object {
  if ($_ -match '^\s*#' -or $_ -notmatch '=') { return }
  $name, $value = $_.Split('=', 2)
  Set-Item -Path "Env:$($name.Trim())" -Value $value.Trim()
}

$ak = $env:OSS_ACCESS_KEY_ID
$sk = $env:OSS_ACCESS_KEY_SECRET
$bucket = if ($env:OSS_BUCKET) { $env:OSS_BUCKET } else { '100kda' }
$endpoint = if ($env:OSS_ENDPOINT) { $env:OSS_ENDPOINT } else { 'oss-cn-hongkong.aliyuncs.com' }

if (-not $ak -or -not $sk) {
  Write-Output 'MISSING_KEYS'
  exit 1
}

function Invoke-Oss([string]$method, [string]$resource, [string]$url) {
  $date = [DateTime]::UtcNow.ToString('r')
  $stringToSign = "$method`n`n`n$date`n$resource"
  $hmac = New-Object System.Security.Cryptography.HMACSHA1
  $hmac.Key = [Text.Encoding]::UTF8.GetBytes($sk)
  $sig = [Convert]::ToBase64String($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($stringToSign)))
  $headers = @{ Date = $date; Authorization = "OSS ${ak}:${sig}" }
  try {
    $resp = Invoke-WebRequest -Uri $url -Headers $headers -Method $method -UseBasicParsing
    return @{ Status = [int]$resp.StatusCode; Body = [string]$resp.Content }
  } catch {
    $r = $_.Exception.Response
    if (-not $r) { return @{ Status = 0; Body = $_.Exception.Message } }
    $code = [int]$r.StatusCode
    $reader = New-Object IO.StreamReader($r.GetResponseStream())
    return @{ Status = $code; Body = $reader.ReadToEnd() }
  }
}

Write-Output "BUCKET=$bucket"
Write-Output "ENDPOINT=$endpoint"
Write-Output "AK_PREFIX=$($ak.Substring(0, [Math]::Min(8, $ak.Length)))..."

$info = Invoke-Oss 'GET' "/${bucket}/?bucketInfo" "https://${bucket}.${endpoint}/?bucketInfo"
Write-Output "BUCKET_INFO_STATUS=$($info.Status)"
$body = $info.Body
if ($body.Length -gt 600) { $body = $body.Substring(0, 600) }
Write-Output $body

$key = "healthchecks/oss-ping.txt"
$date = [DateTime]::UtcNow.ToString('r')
$contentType = 'text/plain'
$resource = "/${bucket}/${key}"
$stringToSign = "PUT`n`n$contentType`n$date`n$resource"
$hmac = New-Object System.Security.Cryptography.HMACSHA1
$hmac.Key = [Text.Encoding]::UTF8.GetBytes($sk)
$sig = [Convert]::ToBase64String($hmac.ComputeHash([Text.Encoding]::UTF8.GetBytes($stringToSign)))
$putHeaders = @{
  Date = $date
  Authorization = "OSS ${ak}:${sig}"
  'Content-Type' = $contentType
}
try {
  $put = Invoke-WebRequest -Uri "https://${bucket}.${endpoint}/${key}" -Headers $putHeaders -Method PUT -Body 'ok' -UseBasicParsing
  Write-Output "PUT_STATUS=$($put.StatusCode)"
} catch {
  $r = $_.Exception.Response
  if ($r) { Write-Output "PUT_STATUS=$([int]$r.StatusCode)" } else { Write-Output "PUT_ERROR=$($_.Exception.Message)" }
}

$del = Invoke-Oss 'DELETE' $resource "https://${bucket}.${endpoint}/${key}"
Write-Output "DELETE_STATUS=$($del.Status)"
