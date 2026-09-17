$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$projectRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$distPath = [IO.Path]::GetFullPath((Join-Path $projectRoot 'dist'))
$artifactPath = [IO.Path]::GetFullPath((Join-Path $projectRoot 'artifacts/sweep-shift-itch.zip'))
$checkPath = [IO.Path]::GetFullPath((Join-Path $projectRoot 'tmp/package-check'))
$rootPrefix = $projectRoot.TrimEnd([IO.Path]::DirectorySeparatorChar) + [IO.Path]::DirectorySeparatorChar
foreach ($target in @($artifactPath, $checkPath)) {
  if (-not $target.StartsWith($rootPrefix, [StringComparison]::OrdinalIgnoreCase)) { throw "Output is outside the project: $target" }
}
if ($checkPath -ne [IO.Path]::GetFullPath((Join-Path $projectRoot 'tmp/package-check'))) { throw 'Unexpected extraction target.' }

$sourceFiles = @(Get-ChildItem -LiteralPath $distPath -File -Recurse)
if (-not (Test-Path -LiteralPath (Join-Path $distPath 'index.html') -PathType Leaf)) { throw 'dist/index.html is missing.' }
$expected = @{}
foreach ($file in $sourceFiles) {
  $relative = [IO.Path]::GetRelativePath($distPath, $file.FullName).Replace('\', '/')
  $expected[$relative] = @{ bytes = $file.Length; sha256 = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
}

New-Item -ItemType Directory -Path (Split-Path $artifactPath) -Force | Out-Null
New-Item -ItemType Directory -Path $checkPath -Force | Out-Null
# Do not recursively clear extraction folders. Unknown files are an explicit error.
foreach ($file in @(Get-ChildItem -LiteralPath $checkPath -File -Recurse)) {
  $relative = [IO.Path]::GetRelativePath($checkPath, $file.FullName).Replace('\', '/')
  if (-not $expected.ContainsKey($relative)) { throw "Unexpected existing extraction file; left untouched: $($file.FullName)" }
}
if (Test-Path -LiteralPath $artifactPath) { Remove-Item -LiteralPath $artifactPath }
[IO.Compression.ZipFile]::CreateFromDirectory($distPath, $artifactPath, [IO.Compression.CompressionLevel]::Optimal, $false)

$archive = [IO.Compression.ZipFile]::OpenRead($artifactPath)
try {
  $entries = @($archive.Entries | Where-Object { -not $_.FullName.EndsWith('/') })
  if ($entries.Count -ne $sourceFiles.Count) { throw 'Archive file count differs from dist.' }
  if (-not ($entries.FullName -contains 'index.html')) { throw 'index.html is not at the ZIP root.' }
  foreach ($entry in $entries) {
    if (-not $expected.ContainsKey($entry.FullName)) { throw "Unexpected archive entry: $($entry.FullName)" }
    $stream = $entry.Open()
    $sha = [Security.Cryptography.SHA256]::Create()
    try { $hash = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() }
    finally { $stream.Dispose(); $sha.Dispose() }
    if ($hash -ne $expected[$entry.FullName].sha256) { throw "Archive hash mismatch: $($entry.FullName)" }
  }
} finally { $archive.Dispose() }

[IO.Compression.ZipFile]::ExtractToDirectory($artifactPath, $checkPath, $true)
$extractedFiles = @(Get-ChildItem -LiteralPath $checkPath -File -Recurse)
if ($extractedFiles.Count -ne $sourceFiles.Count) { throw 'Extracted file count differs from dist.' }
foreach ($file in $extractedFiles) {
  $relative = [IO.Path]::GetRelativePath($checkPath, $file.FullName).Replace('\', '/')
  if ((Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash.ToLowerInvariant() -ne $expected[$relative].sha256) { throw "Extracted hash mismatch: $relative" }
}
$result = [ordered]@{
  passed = $true
  zip = $artifactPath
  bytes = (Get-Item -LiteralPath $artifactPath).Length
  sha256 = (Get-FileHash -LiteralPath $artifactPath -Algorithm SHA256).Hash.ToLowerInvariant()
  files = $sourceFiles.Count
  rootIndex = $true
  extracted = $checkPath
  contents = $expected
}
$result | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $projectRoot 'tmp/package-manifest.json') -Encoding utf8
[pscustomobject]$result | Select-Object passed,zip,bytes,sha256,files,rootIndex,extracted | ConvertTo-Json
