# Vehicle Manager

Sistema full stack para gestão de veículos com autenticação, CRUD e upload de fotos.

## Stack
- Frontend: Vue 3 + Quasar + TypeScript + Pinia
- Backend: NestJS + Prisma + MySQL + JWT

## Estrutura
- `backend/` API NestJS
- `view/` App Quasar
- `docker-compose.yml` MySQL local via Docker

## Funcionalidades
- Login e cadastro de conta (nome, e-mail e senha)
- Sessão com access token + refresh token
- Rotas privadas e logout
- CRUD de veículos
- Upload de múltiplas fotos (`multipart/form-data`)
- Listagem em cards com busca, filtro, ordenação e paginação
- Página de detalhes com galeria de fotos

---

## Credenciais iniciais
- Admin (criado automaticamente no boot do backend):
  - e-mail: `admin@vehiclemanager.com`
  - senha: `admin123`
- Você pode alterar essas credenciais via `DEFAULT_ADMIN_EMAIL` e `DEFAULT_ADMIN_PASSWORD` no `backend/.env`.

---

## 1) Pre-requisitos
- Node.js 20+ (recomendado)
- npm 10+
- Docker Desktop (opcional, para subir MySQL com mais facilidade)

---

## 2) Subir banco MySQL

### Opção A (recomendada): Docker
Na raiz do projeto:

```powershell
docker compose up -d
```

Isso sobe:
- host: `localhost`
- porta: `3306`
- database: `vehicle_manager`
- user: `root`
- password: `root`

### Opção B: MySQL local
Crie o banco manualmente:

```sql
CREATE DATABASE vehicle_manager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

## 3) Configurar e iniciar backend

```powershell
cd backend
Copy-Item .env.example .env -Force
```

Confirme em `.env`:

```env
DATABASE_URL="mysql://root:root@localhost:3306/vehicle_manager"
CORS_ORIGIN=http://localhost:9000
```

Instale as dependências, gere o Prisma e execute as migrações:

```powershell
npm install
npx prisma generate
npm run prisma:migrate
```

Inicie a API:

```powershell
npm run start:dev
```

API: `http://localhost:3000/api`

Usuário admin padrão (criado automaticamente no boot):
- e-mail: `admin@vehiclemanager.com`
- senha: `admin123`

---

## 4) Configurar e iniciar frontend

Em outro terminal:

```powershell
cd view
Copy-Item .env.example .env -Force
npm install
npm run dev
```

App: `http://localhost:9000`

Variáveis esperadas no `view/.env`:

```env
VITE_API_URL=http://localhost:3000/api
VITE_UPLOADS_URL=http://localhost:3000
```

---

## 5) Fluxo de uso rápido
1. Acesse `http://localhost:9000/#/login`
2. Clique em `Criar conta` para registrar um novo usuário
3. Ou entre com o admin padrão
4. Acesse `/vehicles` para listar/cadastrar/editar/excluir

---

## 6) Comandos úteis

### Backend
```powershell
cd backend
npm run -s lint
npx tsc --noEmit --incremental false
```

### Frontend
```powershell
cd view
npm run -s lint
npx vue-tsc --noEmit
```

---

## 7) Troubleshooting

- Erro de conexão com banco:
  - verifique se o MySQL está ativo na porta `3306`
  - valide usuário/senha no `backend/.env`

- Erro de Prisma migration:
  - rode `npx prisma generate`
  - depois `npm run prisma:migrate`

- Tela branca no frontend:
  - reinicie `npm run dev`
  - confira `view/.env` apontando para `http://localhost:3000/api`
