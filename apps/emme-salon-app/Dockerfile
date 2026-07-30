# ─── Emme Salon — Production Docker Image (PWA) ───
# Multi-stage: deps → build → nginx

# ─── Stage 1: Dependencies ───
FROM oven/bun:1 AS deps
WORKDIR /app

SHELL ["/bin/ash", "-eo", "pipefail", "-c"]

COPY package.json bun.lock ./
COPY apps/emme-salon-app/package.json ./apps/emme-salon-app/
COPY packages/api-client/package.json ./packages/api-client/
COPY packages/contracts/package.json ./packages/contracts/
COPY packages/ui/package.json ./packages/ui/
COPY packages/validation/package.json ./packages/validation/

RUN bun install --frozen-lockfile --filter @emme/emme-salon-app...

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
LABEL org.opencontainers.image.source="https://github.com/emme/emme-modulith"

RUN rm /etc/nginx/conf.d/default.conf
COPY apps/emme-salon-app/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder --chown=nginx:nginx /app/apps/emme-salon-app/dist /usr/share/nginx/html

RUN chown -R nginx:nginx /var/cache/nginx /var/run

USER nginx

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80/health || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
