import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dockerfile = readFileSync(
  resolve(process.cwd(), '../../deploy/docker/frontend.Dockerfile'),
  'utf8'
);
const compose = readFileSync(
  resolve(process.cwd(), '../../deploy/compose/frontend.compose.yaml'),
  'utf8'
);
const mise = readFileSync(resolve(process.cwd(), '../../mise.toml'), 'utf8');

describe('shared frontend production image workspace boundary', () => {
  it('copies every workspace manifest and shared build input required by each app', () => {
    expect(dockerfile).toContain('COPY apps/client-app/package.json ./apps/client-app/');
    expect(dockerfile).toContain('COPY apps/admin-app/package.json ./apps/admin-app/');
    expect(dockerfile).toContain('COPY packages/kernel/package.json ./packages/kernel/');
    expect(dockerfile).toContain('COPY packages/features/package.json ./packages/features/');
    expect(dockerfile).toContain('COPY configs/ ./configs/');
    expect(dockerfile).toContain("sed -i 's#^pid .*#pid /tmp/nginx.pid;#'");
    expect(dockerfile).toContain('CMD ["nginx", "-g", "daemon off;"]');
    expect(dockerfile).toContain('COPY deploy/docker/runtime-config.js.template');
    expect(dockerfile).toContain('COPY deploy/docker/runtime-config.sh');
  });

  it('keeps local Compose services separate for all three deployable apps', () => {
    expect(compose).toContain('admin-frontend:');
    expect(compose).toContain('salon-frontend:');
    expect(compose).toContain('client-frontend:');
    expect(compose).toContain('APP_NAME: admin-app');
    expect(compose).toContain('APP_NAME: salon-app');
    expect(compose).toContain('APP_NAME: client-app');
  });

  it('keeps HMR and production-like workflows explicit in Mise', () => {
    expect(mise).toContain('[tasks."dev:admin"]');
    expect(mise).toContain('[tasks."dev:salon"]');
    expect(mise).toContain('[tasks."dev:client"]');
    expect(mise).toContain('[tasks."frontend:up"]');
    expect(mise).toContain('docker-compose -f deploy/compose/frontend.compose.yaml');
  });
});
