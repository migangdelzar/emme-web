# ─── Emme Salon — Production Docker Image (PWA) ───
# Multi-stage: deps → build → nginx

# ─── Stage 1: Dependencies ───
FROM oven/bun:1 AS deps
WORKDIR /app

SHELL ["/bin/sh", "-c"]

COPY package.json bun.lock ./
COPY apps/emme-salon-app/package.json ./apps/emme-salon-app/
COPY e2e/src/package.json ./e2e/src/
COPY packages/api/package.json ./packages/api/
COPY packages/application/package.json ./packages/application/
COPY packages/core/package.json ./packages/core/
COPY packages/domain/package.json ./packages/domain/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/test-support/package.json ./packages/test-support/
COPY packages/ui/package.json ./packages/ui/
COPY packages/validation/package.json ./packages/validation/

RUN bun install --frozen-lockfile --filter @emme/emme-salon-app

# ─── Stage 2: Build ───
FROM deps AS builder

COPY apps/emme-salon-app/ ./apps/emme-salon-app/
COPY packages/ ./packages/

WORKDIR /app/apps/emme-salon-app
RUN bun run build

# ─── Stage 3: Production (Nginx) ───
FROM nginx:1.27-alpine AS production

LABEL org.opencontainers.image.title="Emme Salon App"
LABEL org.opencontainers.image.description="EmmeNails Studio Manager PWA"
LABEL org.opencontainers.image.source="https://github.com/migangdelzar/emme-web"

ENV EMME_API_UPSTREAM=host.docker.internal:8081

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/emme-salon-app/nginx.conf.template /etc/nginx/templates/default.conf.template

COPY --from=builder --chown=nginx:nginx /app/apps/emme-salon-app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /var/cache/nginx /var/run

USER nginx

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
