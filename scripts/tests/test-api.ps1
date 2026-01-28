$body = @{
    email = "admin@inei.gob.pe"
    password = "Password123!"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3010/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "[OK] API responde correctamente" -ForegroundColor Green
    Write-Host "Usuario: $($response.data.user.email)" -ForegroundColor Cyan
    Write-Host "Rol: $($response.data.user.rol)" -ForegroundColor Cyan
} catch {
    Write-Host "[ERROR] API no responde o error en login" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}
