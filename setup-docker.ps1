#!/usr/bin/env pwsh

# 🐳 Script de Configuração Docker + Supabase
# Execute este script após instalar o Docker Desktop

Write-Host "🐳 Configurando Docker + Supabase Local..." -ForegroundColor Cyan

# 1. Verificar Docker
Write-Host "`n📋 Verificando Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker instalado: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker não encontrado. Instale Docker Desktop primeiro!" -ForegroundColor Red
    Write-Host "📥 Download: https://docs.docker.com/desktop/install/windows/" -ForegroundColor Cyan
    exit 1
}

# 2. Verificar Docker Compose
Write-Host "`n📋 Verificando Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker compose version
    Write-Host "✅ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Docker Compose não encontrado" -ForegroundColor Yellow
}

# 3. Testar Docker
Write-Host "`n🧪 Testando Docker..." -ForegroundColor Yellow
try {
    docker run --rm hello-world | Out-Null
    Write-Host "✅ Docker funcionando corretamente!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao testar Docker. Verifique se está rodando." -ForegroundColor Red
    exit 1
}

# 4. Verificar Supabase CLI
Write-Host "`n📋 Verificando Supabase CLI..." -ForegroundColor Yellow
try {
    npx supabase --version
    Write-Host "✅ Supabase CLI disponível" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Supabase CLI não encontrado" -ForegroundColor Yellow
}

# 5. Iniciar Supabase Local
Write-Host "`n🚀 Iniciando Supabase Local..." -ForegroundColor Yellow
try {
    Write-Host "⏳ Isso pode demorar alguns minutos na primeira vez..." -ForegroundColor Cyan
    npx supabase start
    Write-Host "✅ Supabase iniciado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao iniciar Supabase. Verifique Docker." -ForegroundColor Red
    exit 1
}

# 6. Mostrar Status
Write-Host "`n📊 Status do Supabase:" -ForegroundColor Yellow
npx supabase status

# 7. Aplicar Migrations
Write-Host "`n🔄 Aplicando migrations..." -ForegroundColor Yellow
try {
    npx supabase db push
    Write-Host "✅ Migrations aplicadas!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao aplicar migrations. Verifique manualmente." -ForegroundColor Yellow
}

# 8. Testar Conexão
Write-Host "`n🧪 Testando conexão com banco..." -ForegroundColor Yellow
try {
    node test-direct-connection.js
} catch {
    Write-Host "⚠️ Teste de conexão falhou. Verifique configuração." -ForegroundColor Yellow
}

Write-Host "`n🎉 Configuração concluída!" -ForegroundColor Green
Write-Host "📱 Acesse Supabase Studio: http://127.0.0.1:54323" -ForegroundColor Cyan
Write-Host "🔧 Para parar: npx supabase stop" -ForegroundColor Cyan
