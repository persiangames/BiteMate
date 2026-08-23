# BiteMate



Global food social networking platform — production-grade monorepo foundation.



## Structure



```

BiteMateApp/

├── apps/

│   ├── api/          # NestJS modular monolith backend

│   ├── web/          # React web app (primary client)

│   └── mobile/       # Flutter mobile app (clean architecture)

├── services/         # Future microservices

├── shared/           # Shared DTOs and TypeScript types

└── infra/

    └── docker/       # Docker Compose & API Dockerfile

```



## Prerequisites



- **Node.js** >= 20.11 (see `.nvmrc`)

- **Flutter** SDK (latest stable, optional — for mobile only)

- **Docker** & Docker Compose

- **PostgreSQL** & **Redis** (via Docker or local install)



## Quick Start



### 1. Install dependencies



```bash

npm install

npm run shared:build

```



### 2. Start infrastructure (PostgreSQL + Redis)



```bash

docker compose -f infra/docker/docker-compose.dev.yml up -d

```



### 3. Configure API environment



```bash

cp apps/api/.env.example apps/api/.env

```



### 4. Run database migrations



```bash

npm run db:migrate:deploy

```



For local development with new schema changes, use:



```bash

npm run db:migrate

```



### 5. Start the API



```bash

npm run api:dev

```



Health check: [http://localhost:3000/api/health](http://localhost:3000/api/health)



Expected response:



```json

{ "status": "ok" }

```



Readiness check (PostgreSQL + Redis): [http://localhost:3000/api/health/ready](http://localhost:3000/api/health/ready)



### 6. Start the web app



```bash

cp apps/web/.env.example apps/web/.env

npm run web:dev

```



Open [http://localhost:5173](http://localhost:5173). The dev server proxies `/api` to the backend.



### 7. Flutter mobile app (optional)



If platform folders are missing, generate them once:



```bash

cd apps/mobile

flutter create . --org com.bitemate --project-name bitemate

flutter pub get

flutter run --dart-define=API_BASE_URL=http://localhost:3000/api

```



## Full stack with Docker



```bash

cp infra/docker/.env.example infra/docker/.env

docker compose -f infra/docker/docker-compose.yml up -d --build

```



## Architecture



### Backend (NestJS)



- **Modular monolith** — microservices-ready module boundaries

- **Config** — `@nestjs/config` with Joi validation

- **Database** — PostgreSQL via Prisma ORM

- **Cache** — Redis via ioredis

- **Realtime** — Socket.io gateway scaffold (`/realtime` namespace)

- **Cross-cutting** — global exception filter, validation pipe, HTTP logging



### Web (React + Vite)



- **Primary client** for BiteMate

- **Architecture** — presentation / data layers (domain types via `@bitemate/shared`)

- **Dev proxy** — `/api` → NestJS backend



### Mobile (Flutter)



- **Clean architecture** — `presentation` / `domain` / `data` layers

- **State management** — Riverpod

- **Routing** — GoRouter

- **Networking** — Dio



### Shared



TypeScript DTOs and types consumed by the API and web app (`@bitemate/shared` workspace package).



## Scripts



| Command | Description |

|---------|-------------|

| `npm run api:dev` | Start API in watch mode |

| `npm run api:build` | Build API for production |

| `npm run api:test` | Run API unit tests |

| `npm run web:dev` | Start web app in dev mode |

| `npm run web:build` | Build web app for production |

| `npm run shared:build` | Build shared TypeScript package |

| `npm run db:generate` | Generate Prisma client |

| `npm run db:migrate` | Run Prisma migrations (dev) |

| `npm run db:migrate:deploy` | Apply migrations (CI/production) |

| `npm run docker:up` | Start full Docker stack |

| `npm run docker:down` | Stop Docker stack |



## License



Proprietary — BiteMate

