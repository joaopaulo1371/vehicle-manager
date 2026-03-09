# Vehicle Manager - Desafio Full Stack

Implementação completa do desafio técnico com:

- Front-end: Vue 3 + Quasar + TypeScript + Pinia
- Back-end: NestJS + Prisma + MySQL + JWT
- Upload de fotos com `multipart/form-data`

## Estrutura

- `view/` -> aplicação Quasar
- `backend/` -> API NestJS

## Funcionalidades implementadas

- Login com validação de e-mail/senha e feedback de erro
- Sessão com `accessToken` + `refreshToken`
- Interceptor no front para renovar token expirado
- Rotas privadas com guard
- Logout com revogação de refresh token
- CRUD de veículos
- Upload de múltiplas fotos (JPG/PNG/WEBP, até 5MB por arquivo)
- Listagem em cards com:
  - busca (marca/modelo) com debounce
  - filtro por status
  - ordenação
  - paginação
  - loading skeleton
  - estado vazio
- Página de detalhes com galeria/carrossel e modal de imagem

## Back-end - como rodar

1. Entre em `backend/`:
   - `cd backend`
2. Instale dependências:
   - `npm install`
3. Copie variáveis:
   - `cp .env.example .env` (ou equivalente no Windows)
4. Suba MySQL local e ajuste `DATABASE_URL` no `.env`
5. Gere client e rode migrations:
   - `npm run prisma:generate`
   - `npm run prisma:migrate`
6. Inicie API:
   - `npm run start:dev`

API disponível em `http://localhost:3000/api`

Usuário padrão (seed automático no boot):
- e-mail: `admin@vehiclemanager.com`
- senha: `admin123`

## Front-end - como rodar

1. Entre em `view/`:
   - `cd view`
2. Instale dependências:
   - `npm install`
3. Copie variáveis:
   - `cp .env.example .env` (ou equivalente no Windows)
4. Inicie app:
   - `npm run dev`

App disponível em `http://localhost:9000` (porta padrão do Quasar dev).

## Decisões técnicas

- Separação por módulos no NestJS (`auth`, `users`, `vehicles`).
- Prisma para persistência e modelagem de domínio.
- Refresh token persistido e revogado no banco para logout seguro.
- Pinia para estado de autenticação e listagem.
- Componentização de UI com `VehicleCard`.
- Upload com validações no backend e preview no frontend.

## Diferenciais já entregues

- Refresh token
- Persistência de sessão
- Tratamento de token expirado com interceptor
- Paginação server-side
- Skeleton loading

## Próximos incrementos sugeridos

- Testes automatizados (Jest no backend e Vitest/Cypress no frontend)
- Docker Compose (API + MySQL + Redis)
- Controle de permissões por perfil
- CI/CD + deploy
