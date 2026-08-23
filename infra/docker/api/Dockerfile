# syntax=docker/dockerfile:1



FROM node:20-alpine AS base

WORKDIR /app



FROM base AS deps

COPY package.json package-lock.json* ./

COPY apps/api/package.json ./apps/api/

COPY shared/package.json ./shared/

RUN npm ci --workspace=api --include-workspace-root



FROM base AS builder

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build --workspace=@bitemate/shared

WORKDIR /app/apps/api

RUN npx prisma generate

RUN npm run build



FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production



RUN addgroup --system --gid 1001 nodejs && \

    adduser --system --uid 1001 nestjs



COPY --from=builder /app/apps/api/dist ./dist

COPY --from=builder /app/apps/api/package.json ./package.json

COPY --from=builder /app/apps/api/prisma ./prisma

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/shared/dist ./shared/dist

COPY infra/docker/api/docker-entrypoint.sh ./docker-entrypoint.sh



RUN chmod +x ./docker-entrypoint.sh



USER nestjs

EXPOSE 3000



HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \

  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (response) => process.exit(response.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"



ENTRYPOINT ["./docker-entrypoint.sh"]

