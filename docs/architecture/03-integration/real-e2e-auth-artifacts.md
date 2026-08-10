# Real E2E authentication artifacts

Real-provider Playwright tests do not receive Keycloak credentials during the
normal run. The `emme-service` E2E provisioner generates one disposable JSON
auth file per provisioned salon. Each file contains all role-specific browser
storage states for that salon.

## Provisioner output contract

The provisioner writes one file per salon, for example
`provisioned-auth/e2e-studio.json`:

```json
{
  "version": 1,
  "tenantSlug": "e2e-studio",
  "users": {
    "admin": {
      "credentials": {
        "username": "admin",
        "password": "not-committed"
      },
      "storageState": {
        "cookies": [],
        "origins": []
      }
    },
    "owner": {
      "storageState": {
        "cookies": [],
        "origins": []
      }
    },
    "customer": {
      "storageState": {
        "cookies": [],
        "origins": []
      }
    }
  }
}
```

The same shape is written separately as `e2e-salon.json` for `e2e-salon`.
Each salon receives its own admin/owner role matrix by default. A staff state
can be added when staff workflows are introduced, but it is not part of the
default seed. The provisioner may also include a customer login artifact for
that salon, but the customer
identity is issued by the shared `emme-customers` realm rather than by the salon
realm. Platform admin users are global and belong outside the per-salon files.

Credential fields are optional and local-only. Browser storage state is the
preferred Playwright input; when credentials are present they are consumed by
setup code and never imported into application bundles or committed artifacts.

Each embedded `storageState` must contain the browser origin used by
`E2E_BASE_URL`. The salon JSON files must be disposable, local-only artifacts
with filesystem mode `0600`. They must never be committed, uploaded to normal
build artifacts, or embedded in frontend bundles.

Set `E2E_PROVISIONER_AUTH_DIR` to the directory containing the per-salon JSON
files, or set `E2E_PROVISIONER_AUTH_FILE` for one explicit file. Playwright
selects the file using `E2E_TENANT_SLUG` and the state using `E2E_USER_ROLE`.
The setup project writes a temporary selected-state file for the dependent
test project. If the provisioned state is absent or expired, it performs one
bootstrap login and refreshes only that temporary selected state. Set
`E2E_FORCE_LOGIN=true` to explicitly refresh it.

## Mise workflow

```bash
# Start the backend-owned provisioner first; it writes the auth files.
# Then start the production-like frontend containers.
mise run frontend:up

# Run real provider against salon-app at localhost:8080.
E2E_PROVISIONER_AUTH_DIR=/path/to/provisioned-auth \
  mise run test:e2e:real:deployed
```

The current web fallback can read local provisioner configuration for an
emergency bootstrap login, but the canonical path is the provisioner-generated
per-salon storage-state file. The backend repository must implement the artifact
writer described by this contract.
