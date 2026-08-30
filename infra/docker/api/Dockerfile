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

RUN npm ci --omit=dev --workspace=api --include-workspace-root

COPY --from=builder /app/node_modules/prisma /app/node_modules/prisma

COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

WORKDIR /app/apps/api

RUN node /app/node_modules/prisma/build/index.js generate

RUN mkdir -p /app/apps/api/uploads && chown -R nestjs:nodejs /app/apps/api/uploads

COPY infra/docker/api/docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x ./docker-entrypoint.sh

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=180s --retries=5 \
  CMD node -e "const p=process.env.PORT||3000; require('http').get('http://127.0.0.1:'+p+'/api/health', (response) => process.exit(response.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

ENTRYPOINT ["./docker-entrypoint.sh"]
