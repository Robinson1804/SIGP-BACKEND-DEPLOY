$content = Get-Content 'E:\Sistema de Gestion de Proyectos\sigp-backend\test-planning-fixed.ps1' -Raw
$content = $content -replace "\`$ids\['(\w+)'\]", '$ids.$1'
$content | Set-Content 'E:\Sistema de Gestion de Proyectos\sigp-backend\test-planning-fixed.ps1'
Write-Host "Fixed all hashtable access patterns"
