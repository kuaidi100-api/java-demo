# Fetch OSM buildings inside KML service bbox → local GeoJSON/KML whitebox source
# Usage: powershell -File scripts/fetch-sez-buildings.ps1

$ErrorActionPreference = 'Stop'
$env:Path = "C:\Windows\System32;C:\Program Files\nodejs;" + $env:Path
$Root = Split-Path -Parent $PSScriptRoot
$Cache = Join-Path $Root '.cache\osm'
$Geo = Join-Path $Root 'apps\user-app\src\static\geo'
New-Item -ItemType Directory -Force -Path $Cache, $Geo | Out-Null

$query = '[out:json][timeout:90];way["building"](20.2558,100.0818,20.4067,100.1808);out body;>;out skel qt;'
$enc = [uri]::EscapeDataString($query)
$outJson = Join-Path $Cache 'overpass-buildings-wide.json'

Write-Host "Fetching Overpass…"
Invoke-WebRequest `
  -Uri "https://overpass-api.de/api/interpreter?data=$enc" `
  -Method GET `
  -OutFile $outJson `
  -TimeoutSec 120 `
  -UseBasicParsing `
  -Headers @{ Accept = 'application/json'; 'User-Agent' = 'KapokSezMap/1.0' }

# Converter also reads apps/.../overpass-*.json — copy into geo briefly
Copy-Item $outJson (Join-Path $Geo 'overpass-buildings-wide.json') -Force
node (Join-Path $PSScriptRoot 'osm-buildings-to-geojson.js')
Remove-Item (Join-Path $Geo 'overpass-buildings-wide.json') -Force -ErrorAction SilentlyContinue
Write-Host 'Done. Outputs: sez-buildings.geojson / sez-buildings.kml'
