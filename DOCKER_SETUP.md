# 🐳 Configuração Docker + Supabase Local

## 1. Instalar Docker Desktop

1. **Baixar Docker Desktop:**
   - Acesse: https://docs.docker.com/desktop/install/windows/
   - Baixe o Docker Desktop for Windows
   - Execute o instalador como Administrador

2. **Configurações importantes:**
   - ✅ Enable WSL 2 integration
   - ✅ Use WSL 2 instead of Hyper-V
   - ✅ Start Docker Desktop at login

3. **Após instalação:**
   - Reinicie o computador
   - Abra Docker Desktop
   - Aguarde inicialização completa

## 2. Verificar Instalação

```powershell
# Verificar se Docker está funcionando
docker --version
docker compose --version

# Testar com container simples
docker run hello-world
```

## 3. Configurar Supabase Local

```powershell
# No diretório do projeto
cd "c:\Users\kefer\Downloads\app-dieta-facil"

# Iniciar Supabase local
npx supabase start

# Verificar status
npx supabase status
```

## 4. Conectar ao Banco Local

Após `supabase start`, você receberá URLs locais:
- **API URL:** http://127.0.0.1:54321
- **DB URL:** postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL:** http://127.0.0.1:54323

## 5. Configurar Variáveis de Ambiente

Crie `.env.local`:
```env
# Supabase Local
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=seu_anon_key_local

# Ou use remoto
VITE_SUPABASE_URL=https://vpezrzahyctoeozjqbrd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwZXpyemFoeWN0b2VvempxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEyMDY2MDIsImV4cCI6MjA2Njc4MjYwMn0.3yqV4LGuR89wCGUSJ4b6CqvfI_BkU2nCIv4UIfQR43k
```

## 6. Comandos Úteis

```powershell
# Parar Supabase local
npx supabase stop

# Resetar banco local
npx supabase db reset

# Aplicar migrations
npx supabase db push

# Ver logs
npx supabase logs

# Abrir Studio local
npx supabase studio
```

## 7. Troubleshooting

### Docker não inicia:
- Verificar se WSL2 está ativo
- Executar Docker Desktop como Administrador
- Reiniciar serviço Docker

### Supabase não conecta:
- Verificar se Docker está rodando
- Verificar portas disponíveis (54321, 54322, 54323)
- Limpar containers: `docker system prune`

### Migrations não aplicam:
- Verificar conexão: `npx supabase status`
- Reset: `npx supabase db reset`
- Push: `npx supabase db push`
