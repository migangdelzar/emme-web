# Catalog Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Organize services, prices, durations, active state, and design-catalog behavior in a reusable vertical catalog module.

**Architecture:** Catalog owns pure service/design rules and ports. Salon owns management forms; client owns discovery and browsing workflows.

**Tech Stack:** TypeScript, Zod, `@emme/kernel`, `@emme/api`, React, `@emme/ui`, Vitest.

## Global Constraints

- Negative prices and non-positive durations are rejected in domain rules.
- API payloads are parsed before entering feature application code.
- Feature schemas stay in `validation/`; app form schemas stay in apps.

## Files

- Create: `packages/features/src/catalog/domain/`, `packages/features/src/catalog/application/`, `packages/features/src/catalog/api/`, `packages/features/src/catalog/infrastructure/`, `packages/features/src/catalog/validation/`, `packages/features/src/catalog/presentation/`, `packages/features/src/catalog/i18n/`, and `packages/features/src/catalog/test/`.
- Migrate: `packages/domain/src/services/**`, `packages/api/src/services/**`, `packages/features/src/services/**`, and current salon service components/hooks.
- Test: service rules, design catalog rules, API mappers, repository adapters, forms, and boundary tests.

### Task 1: Service and design domain

- [ ] **Step 1:** Write failing tests for non-negative prices, positive durations, active/bookable services, design visibility, and catalog tenant ownership.
- [ ] **Step 2:** Implement `Service`, `Design`, price/duration value objects, and catalog errors under `domain/`.
- [ ] **Step 3:** Run `bunx vitest run packages/features/src/catalog/domain`; expected result is PASS.

### Task 2: Catalog application ports and operations

- [ ] **Step 1:** Write tests for list, create, update, retire, browse, and search operations using `CatalogRepository` and `DesignCatalogRepository` fakes.
- [ ] **Step 2:** Implement protocols and use cases with injected repositories and clock where needed.
- [ ] **Step 3:** Verify duplicate action, missing item, invalid input, and permission errors.

### Task 3: API, validation, and presentation

- [ ] **Step 1:** Write mapper tests for `basePrice`/`price`, `durationMinutes`/`duration`, status normalization, and optional descriptions.
- [ ] **Step 2:** Implement feature API operations, schemas, adapters, `ServiceCard`, `DesignGallery`, and `CatalogEmptyState`.
- [ ] **Step 3:** Run component, API, adapter, and boundary tests; expected result is PASS.

### Task 4: Migration and commit

- [ ] **Step 1:** Update salon imports to `@emme/features/catalog` and preserve current routes and labels.
- [ ] **Step 2:** Remove duplicate service business logic only after package consumers pass.
- [ ] **Step 3:** Run `bun run typecheck`, `bun run test`, and `bun run build`.

```bash
git add packages/features packages/domain packages/api apps/emme-salon-app
git commit -m "feat(catalog): organize services and designs as vertical feature"
```

## Definition of Done

- [ ] Studio service lifecycle and client discovery contracts are covered.
- [ ] Domain, application, API, adapter, validation, presentation, and boundary tests pass.
