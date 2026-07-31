# Web Release

## Release flow

```mermaid
flowchart TD
    Commit["Web commit"] --> Verify["Typecheck + lint + tests + build"]
    Verify --> Image["Build and scan image"]
    Image --> Sign["Sign / attest"]
    Sign --> Promote["Promote immutable digest"]
    Promote --> Smoke["Browser + health smoke"]
    Smoke -->|pass| Release
    Smoke -->|fail| Rollback["Redeploy previous digest"]
    Rollback --> Incident["Record incident evidence"]
```

## Rules

- Record web commit, image digest, service compatibility window, and target.
- Promote the same immutable digest between environments.
- Do not use `latest` as production release evidence.
- Validate cache invalidation and service-worker upgrade behavior.
- Rollback means redeploying a known-good digest; it does not undo backend data
  migrations.
- Breaking service contracts require coordinated release evidence.
