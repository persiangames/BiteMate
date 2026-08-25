# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder

WORKDIR /app

ENV NODE_ENV=development

COPY package.json package-lock.json ./

COPY apps/api/package.json ./apps/api/

COPY apps/web/package.json ./apps/web/

COPY apps/admin/package.json ./apps/admin/

COPY shared/package.json ./shared/

RUN npm ci

COPY . .

RUN npm install --workspace=api --include-workspace-root

RUN npm run build --workspace=@bitemate/shared

WORKDIR /app/apps/api

RUN npx prisma generate

RUN npx tsc -p tsconfig.build.json



FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY package.json package-lock.json ./

COPY apps/api/package.json ./apps/api/

COPY apps/web/package.json ./apps/web/

COPY apps/admin/package.json ./apps/admin/

COPY shared/package.json ./shared/

COPY --from=builder /app/shared/dist ./shared/dist

COPY --from=builder /app/apps/api/dist ./apps/api/dist

COPY --from=builder /app/apps/api/prisma ./apps/api/prisma

RUN npm ci --omit=dev --workspace=api --include-workspace-root && \
    npm install prisma --workspace=api --include-workspace-root --no-save

WORKDIR /app/apps/api

COPY infra/docker/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3000/api/health', (response) => process.exit(response.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
