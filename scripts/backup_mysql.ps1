# MySQL Backup Script for XAMPP
# Run as administrator. Requires mysqldump in PATH or full path to XAMPP mysqldump.

param(
    [SecureString]$Password = $(Read-Host -AsSecureString -Prompt "Enter MySQL root password")
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "C:\backups"
$out = Join-Path $backupDir "all_db_$timestamp.sql"
$mysqldump = "C:\xampp\mysql\bin\mysqldump.exe"

# Convert SecureString to plain text for mysqldump
$plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password))

# Ensure backup directory exists
if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir | Out-Null
}

Write-Host "Starting mysqldump..."
try {
    & $mysqldump -u root -p$plainPassword --all-databases --single-transaction --quick > $out
    Write-Host "Dump completed: $out"
} catch {
    Write-Host "Error during dump: $_"
    exit 1
}

# Compress with 7zip if available
$seven = "C:\Program Files\7-Zip\7z.exe"
if (Test-Path $seven) {
    $compressed = "$out.7z"
    & $seven a $compressed $out | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Remove-Item $out
        Write-Host "Compressed: $compressed"
    } else {
        Write-Host "Compression failed, keeping uncompressed file"
    }
}

# Retention: Keep only last 7 backups
Get-ChildItem $backupDir -Filter "all_db_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 7 | Remove-Item -Force

Write-Host "Backup completed successfully"
