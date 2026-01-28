$content = Get-Content 'E:\Sistema de Gestion de Proyectos\sigp-backend\test-planning-fixed.ps1' -Raw -Encoding UTF8
$content = $content -replace '→', '->'
$content | Set-Content 'E:\Sistema de Gestion de Proyectos\sigp-backend\test-planning-fixed.ps1' -Encoding UTF8
Write-Host "Fixed encoding issues"
