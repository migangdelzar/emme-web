# Customers Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Move customer profile, tenant-scoped customer lifecycle, and reusable customer presentation into a vertical module.

**Architecture:** The feature owns customer rules, repository ports, DTO mapping, profile components, and client-facing profile contracts. Salon management and client self-service pages remain app-local.

**Tech Stack:** TypeScript, Zod, React, `@emme/api`, `@emme/core`, `@emme/ui`, Vitest.

## Global Constraints

- Customer data is tenant-scoped and never cached without tenant identity.
- Phone/email/profile input is validated at API and feature boundaries.
- Sensitive fields are redacted from logs and fixtures.

## Files

- Create: `packages/features/src/customers/domain/`, `packages/features/src/customers/application/`, `packages/features/src/customers/api/`, `packages/features/src/customers/infrastructure/`, `packages/features/src/customers/validation/`, `packages/features/src/customers/presentation/`, `packages/features/src/customers/i18n/`, and `packages/features/src/customers/test/`.
- Migrate: `packages/application/src/clients/**`, `packages/api/src/clients/**`, `packages/features/src/clients/**`, and existing client components/hooks.
- Test: domain rules, repository fakes, API mappers, form/view components, and boundary tests.

### Task 1: Domain and repository contract

- [ ] **Step 1:** Write tests for required name/phone, optional fields, duplicate phone detection, retirement, and tenant mismatch.
- [ ] **Step 2:** Implement `Customer`, profile value objects, `CustomerRepository`, and typed customer errors.
- [ ] **Step 3:** Run domain tests; expected result is PASS.

### Task 2: Application operations

- [ ] **Step 1:** Write fake-repository tests for `listCustomers`, `getCustomer`, `createCustomer`, `updateCustomer`, and `retireCustomer`.
- [ ] **Step 2:** Implement operations with explicit tenant and permission inputs and injected repository ports.
- [ ] **Step 3:** Verify not-found, duplicate, invalid input, unauthorized, and adapter failure cases.

### Task 3: API, validation, and presentation

- [ ] **Step 1:** Write payload mapper tests for customer fields, optional values, and backend error envelopes.
- [ ] **Step 2:** Implement API operations, schemas, HTTP adapter, `CustomerSummaryCard`, `CustomerProfile`, and reusable empty/error states.
- [ ] **Step 3:** Run package tests and `bun run architecture:check`; expected result is PASS.

### Task 4: App migration and commit

- [ ] **Step 1:** Update salon routes/components to use the public customer feature API.
- [ ] **Step 2:** Create client profile contract exports without adding client pages to the shared module.
- [ ] **Step 3:** Run full typecheck/test/build and commit.

```bash
git add packages/features packages/application packages/api apps/emme-salon-app
git commit -m "feat(customers): move customer lifecycle into vertical feature"
```

## Definition of Done

- [ ] Studio customer lifecycle and client profile contracts are reusable and tested.
- [ ] Tenant mismatch and sensitive-data redaction are covered.
