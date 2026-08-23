# syntax=docker/dockerfile:1

FROM nginx:1.27-alpine

RUN apk add --no-cache curl

COPY infra/docker/gateway/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1/health || exit 1
