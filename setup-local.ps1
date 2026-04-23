# ============================================================
# INVITELY — Script de setup local para Windows
# Ejecutar: .\setup-local.ps1
# ============================================================

Write-Host ""
Write-Host "🚀 Invitely — Setup local" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray

# 1. Copiar .env
Write-Host ""
Write-Host "1/5 Creando archivos .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Copy-Item ".env.local.docker" ".env"
    Write-Host "   ✓ .env creado" -ForegroundColor Green
} else {
    Write-Host "   · .env ya existe, no se sobreescribe" -ForegroundColor Gray
}
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.local.docker" ".env.local"
    Write-Host "   ✓ .env.local creado" -ForegroundColor Green
} else {
    Write-Host "   · .env.local ya existe, no se sobreescribe" -ForegroundColor Gray
}

# 2. Crear base de datos
Write-Host ""
Write-Host "2/5 Creando base de datos 'invitely' en Docker..." -ForegroundColor Yellow
$containers = docker ps --format "{{.Names}}" 2>$null
if ($containers) {
    $pgContainer = $containers | Where-Object { $_ -like "*postgres*" } | Select-Object -First 1
    if ($pgContainer) {
        Write-Host "   · Contenedor encontrado: $pgContainer" -ForegroundColor Gray
        docker exec $pgContainer psql -U postgres -c "CREATE DATABASE invitely;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✓ Base de datos 'invitely' creada" -ForegroundColor Green
        } else {
            Write-Host "   · Base de datos ya existe o error (puede ser normal)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⚠ No se encontró contenedor postgres. Créala manualmente." -ForegroundColor Yellow
        Write-Host "     docker exec TU_CONTENEDOR psql -U postgres -c 'CREATE DATABASE invitely;'" -ForegroundColor Gray
    }
} else {
    Write-Host "   ⚠ Docker no está corriendo o no hay contenedores activos" -ForegroundColor Yellow
}

# 3. Instalar dependencias
Write-Host ""
Write-Host "3/5 Instalando dependencias npm..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Dependencias instaladas" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error instalando dependencias" -ForegroundColor Red
    exit 1
}

# 4. Migrations
Write-Host ""
Write-Host "4/5 Ejecutando migrations de base de datos..." -ForegroundColor Yellow
npx prisma migrate dev --name init
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Migrations ejecutadas" -ForegroundColor Green
} else {
    Write-Host "   ✗ Error en migrations. Revisa la conexión a la BD." -ForegroundColor Red
    exit 1
}

# 5. Seed
Write-Host ""
Write-Host "5/5 Insertando datos iniciales (templates)..." -ForegroundColor Yellow
npm run db:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✓ Templates insertados" -ForegroundColor Green
} else {
    Write-Host "   ⚠ Error en seed (puede ignorarse si ya existen)" -ForegroundColor Yellow
}

# Done
Write-Host ""
Write-Host "============================================================" -ForegroundColor Gray
Write-Host "✅ Setup completado. Ejecuta ahora:" -ForegroundColor Green
Write-Host ""
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "   → http://localhost:3000" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Gray
Write-Host ""
