# Frontend Code Splitting Rules

Split by user outcome and lifecycle:

```text
app/       composition root and cross-feature providers
features/  user-facing capabilities
api/       feature-facing transport adapters
shared/    stable, genuinely reused UI/platform code
```

Avoid global `components`, `hooks`, or `utils` buckets for code that belongs to
one feature. Move tests with the feature. Promote code to a shared package only
when its contract is stable and it has more than one real consumer.
