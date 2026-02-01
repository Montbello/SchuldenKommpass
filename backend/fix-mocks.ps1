# Script to fix Vitest mock patterns in test files
# Converts old mock pattern to new vi.mocked() pattern

$testFiles = Get-ChildItem -Path "src" -Recurse -Filter "*.spec.ts"

foreach ($file in $testFiles) {
    if ($file.Name -eq "users.service.spec.ts") {
        Write-Host "Skipping $($file.FullName) - already fixed"
        continue
    }
    
    Write-Host "Processing $($file.FullName)"
    
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    # Pattern 1: Replace const mockXxx = vi.fn(); declarations before vi.mock
    # We'll remove these lines as they cause hoisting issues
    $pattern1 = '(?m)^const mock\w+ = vi\.fn\(\);\r?\n'
    if ($content -match $pattern1) {
        $content = $content -replace $pattern1, ''
        $modified = $true
    }
    
    # Pattern 2: Replace mockXxx.mockResolvedValue with vi.mocked().mockResolvedValue
    # Find all instances like: mockUserFindUnique.mockResolvedValue
    $content = $content -replace 'mock(\w+)\.mock', 'vi.mocked(prisma.$1).mock'
    
    # Pattern 3: Replace expect(mockXxx) with expect(prisma.xxx)
    # This is more complex and may need manual adjustment
    
    # Pattern 4: Add vi.clearAllMocks() in beforeEach if not present
    if ($content -match 'beforeEach\(\(\) => \{' -and $content -notmatch 'vi\.clearAllMocks') {
        $content = $content -replace '(beforeEach\(\(\) => \{)\r?\n(\s+)mock', '$1$2vi.clearAllMocks();$2'
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  Modified: $($file.Name)" -ForegroundColor Green
    } else {
        Write-Host "  No changes needed: $($file.Name)" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Please review the changes and run tests." -ForegroundColor Cyan
