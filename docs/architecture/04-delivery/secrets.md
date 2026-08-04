# Secrets and Configuration Boundary

> **Scope:** This document is the frontend-specific secret inventory for
> `emme-web`. The backend runtime inventory is maintained by
> [`emme-service`](https://github.com/migangdelzar/emme-service/blob/main/docs/architecture/04-delivery/secrets.md).

## Operating rule

GitHub Actions secrets are for CI/CD execution only. Local values should come
from Bitwarden Secrets Manager, 1Password, or the macOS Keychain. Production
values should come from the deployment platform's secret manager. Never expose
private credentials through `VITE_*` variables: Vite embeds them into browser
assets.

`GITHUB_TOKEN` is supplied automatically by GitHub Actions and must not be
created manually.

## GitHub Actions secrets

| Secret | Scope | Workflow | Required when | Notes |
|---|---|---|---|---|
| `E2E_KEYCLOAK_PASSWORD` | `e2e` environment secret | `real-e2e-recordings.yml` | Real regression or recording execution | Disposable tenant-owner password |
| `E2E_KEYCLOAK_ADMIN_PASSWORD` | `e2e` environment secret, or `k3s-staging`/`k3s-production` for those targets | `real-e2e-recordings.yml` | Compose, k3d, or k3s real execution | Disposable Keycloak admin password; protect production environments |

The current repository has no GitHub environments configured. Create `e2e`,
`k3s-staging`, and `k3s-production` before relying on the workflow's dynamic
environment selection. Production environments require reviewers and branch or
tag restrictions.

## Browser-safe configuration

The following values are public runtime configuration and may be injected into
the web build when needed:

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Public service origin |
| `VITE_OIDC_ISSUER` | Public OIDC issuer URL |
| `VITE_OIDC_CLIENT_ID` | Public browser OAuth client ID |
| `VITE_WEB_BASE_DOMAIN` | Public web domain |
| `VITE_APP_ENV` | Non-secret environment label |
| `VITE_SENTRY_DSN` | Public client telemetry DSN, if enabled |
| `VITE_FIREBASE_*` | Public Firebase browser configuration, if enabled |

Never place API keys, client secrets, refresh tokens, signing keys, database
credentials, or provider tokens in `VITE_*` variables. In particular,
`VITE_GEMINI_API_KEY` is forbidden.

## Safe setup commands

After creating the environments and rotating any exposed credential:

```bash
gh secret set E2E_KEYCLOAK_PASSWORD --repo migangdelzar/emme-web --env e2e
gh secret set E2E_KEYCLOAK_ADMIN_PASSWORD --repo migangdelzar/emme-web --env e2e
```

For k3s, set the same logical credentials in the selected protected environment
when that environment is used by the workflow. Enter values interactively or
pipe them from a secret manager; do not place them in command arguments copied
into logs or tickets.

## Verification checklist

- [ ] `gh secret list --repo migangdelzar/emme-web` contains no unexpected values.
- [ ] Real E2E uses only disposable or protected environment credentials.
- [ ] Playwright web-server configuration passes an allowlist of public values,
      never the complete local process environment.
- [ ] No generated report, trace, video, or screenshot contains credentials.
- [ ] Frontend bundle inspection confirms no private value is embedded.
