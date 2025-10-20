<#
Run this script from the repository root (PowerShell).

What it does:
- Creates a timestamped directory under ./dumps
- Loads MONGODB_URI from .env (keeps credentials out of the commandline)
- Tries to run mongodump inside the official mongo container (Docker must be running)
- If Docker is not available, falls back to local mongodump binary if installed
- Compresses the dump folder into a zip file for easy transfer

Usage:
  .\server\scripts\dump-bloglikes.ps1

Note: the script does not print the full URI. Keep your .env private.
#>

Set-StrictMode -Version Latest
try {
    $ts = (Get-Date).ToString('yyyyMMdd-HHmmss')
    $root = (Get-Location).Path
    $dumpDir = Join-Path $root "dumps\bloglikes-$ts"
    New-Item -ItemType Directory -Path $dumpDir -Force | Out-Null

    # Load MONGODB_URI from .env (if present)
    if (Test-Path "$root\.env") {
        $kv = Get-Content "$root\.env" | Where-Object { $_ -match '^MONGODB_URI=' } | Select-Object -First 1
        if ($kv) { $env:MONGODB_URI = $kv -replace '^MONGODB_URI=' , '' ; Write-Host 'Loaded MONGODB_URI from .env (hidden)'}
    }

    Write-Host "Dump directory: $dumpDir"

    function Try-DockerDump {
        Write-Host 'Checking Docker availability...'
        $dockerInfo = & docker info 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'Docker daemon not available.'
            return $false
        }
        Write-Host 'Docker daemon available — running mongodump inside mongo container.'
        # Use absolute path for Windows mounting
        $mountPath = $dumpDir -replace '\\', '/'
        # Run container
        $cmd = "docker run --rm -v \"$dumpDir:/dump\" -e MONGODB_URI=\"$env:MONGODB_URI\" mongo:6.0 bash -lc \"mongodump --uri=\\\"\\\$MONGODB_URI\\\" --db=haltshelter --collection=bloglikes --out=/dump && ls -la /dump\""
        Write-Host 'Running:' $cmd
        & docker run --rm -v "$dumpDir:/dump" -e MONGODB_URI="$env:MONGODB_URI" mongo:6.0 bash -lc "mongodump --uri=\"\$MONGODB_URI\" --db=haltshelter --collection=bloglikes --out=/dump && ls -la /dump"
        if ($LASTEXITCODE -eq 0) { return $true }
        Write-Host 'Docker mongodump failed.'
        return $false
    }

    function Try-LocalMongoDump {
        Write-Host 'Checking local mongodump...'
        & mongodump --version 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host 'Local mongodump not found.'
            return $false
        }
        Write-Host 'Local mongodump found — running...'
        & mongodump --uri="$env:MONGODB_URI" --db=haltshelter --collection=bloglikes --out="$dumpDir"
        if ($LASTEXITCODE -eq 0) { return $true }
        Write-Host 'Local mongodump failed.'
        return $false
    }

    $ok = $false
    $ok = Try-DockerDump
    if (-not $ok) { $ok = Try-LocalMongoDump }

    if (-not $ok) {
        Write-Host ''
        Write-Host 'Neither Docker nor local mongodump succeeded. Next steps:'
        Write-Host '- Start Docker Desktop and run this script again, or'
        Write-Host '- Install MongoDB Database Tools (mongodump) and run this script again.'
        exit 2
    }

    # Compress the dump directory to a zip (portable on Windows)
    $archive = Join-Path $root "dumps\bloglikes-$ts.zip"
    Write-Host "Creating archive: $archive"
    if (Test-Path $archive) { Remove-Item $archive -Force }
    Compress-Archive -Path (Join-Path $dumpDir '*') -DestinationPath $archive -Force
    Write-Host 'Archive created:' (Get-Item $archive).FullName, 'Size:' (Get-Item $archive).Length
    Write-Host 'Done.'
    exit 0
} catch {
    Write-Error $_.Exception.Message
    exit 3
}
