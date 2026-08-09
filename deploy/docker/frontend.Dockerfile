# One production image recipe, parameterized by the deployable app directory.
# Build with: docker build -f deploy/docker/frontend.Dockerfile \
#   --build-arg APP_NAME=salon-app -t emme/salon-frontend:local .

FROM oven/bun:1 AS dependencies

WORKDIR /workspace

ARG APP_NAME

COPY package.json bun.lock ./
COPY apps/client-app/package.json ./apps/client-app/
COPY apps/admin-app/package.json ./apps/admin-app/
COPY apps/salon-app/package.json ./apps/salon-app/
COPY e2e/src/package.json ./e2e/src/
COPY packages/api/package.json ./packages/api/
COPY packages/application/package.json ./packages/application/
COPY packages/core/package.json ./packages/core/
COPY packages/domain/package.json ./packages/domain/
COPY packages/features/package.json ./packages/features/
COPY packages/i18n/package.json ./packages/i18n/
COPY packages/infrastructure/package.json ./packages/infrastructure/
COPY packages/kernel/package.json ./packages/kernel/
COPY packages/test-support/package.json ./packages/test-support/
COPY packages/ui/package.json ./packages/ui/
COPY packages/validation/package.json ./packages/validation/

RUN test -n "$APP_NAME" \
  && bun install --frozen-lockfile --filter "$APP_NAME"

FROM dependencies AS builder

ARG APP_NAME

COPY apps ./apps
COPY configs/ ./configs/
COPY packages ./packages

RUN bun run --filter "$APP_NAME" build

FROM nginx:1.27-alpine AS runtime

ARG APP_NAME

LABEL org.opencontainers.image.title="EMME frontend"
LABEL org.opencontainers.image.source="https://github.com/migangdelzar/emme-web"

ENV EMME_API_UPSTREAM=host.docker.internal:8081
ENV EMME_API_BASE_URL=
ENV EMME_APP_ENV=production
ENV EMME_APP_NAME=${APP_NAME}
ENV EMME_WEB_BASE_DOMAIN=localhost

RUN rm /etc/nginx/conf.d/default.conf
RUN sed -i 's#^pid .*#pid /tmp/nginx.pid;#' /etc/nginx/nginx.conf
COPY deploy/docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY deploy/docker/runtime-config.js.template /etc/nginx/runtime-config.js.template
COPY deploy/docker/runtime-config.sh /docker-entrypoint.d/40-runtime-config.sh
COPY --from=builder /workspace/apps/${APP_NAME}/dist /usr/share/nginx/html

RUN chown -R nginx:nginx \
    /etc/nginx/conf.d \
    /etc/nginx/templates \
    /etc/nginx/runtime-config.js.template \
    /docker-entrypoint.d/40-runtime-config.sh \
    /var/cache/nginx \
    /var/run \
    /usr/share/nginx/html

RUN chmod +x /docker-entrypoint.d/40-runtime-config.sh

USER nginx

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:8080/health || exit 1

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
