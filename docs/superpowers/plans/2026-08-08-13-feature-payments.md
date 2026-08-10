# Payments Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Define payment state, totals, deposits, refunds, and provider ports for salon and client workflows without embedding provider secrets or SDKs in business code.

**Architecture:** Domain rules and application ports are provider-neutral. Infrastructure implements a provider adapter only after the backend contract is verified. UI displays payment states but never authorizes transactions.

**Tech Stack:** TypeScript, `@emme/kernel`, `@emme/api`, React, Vitest, Testing Library.

## Global Constraints

- Never store card data or secrets in frontend source/storage/logs.
- Monetary values use integer minor units with explicit currency.
- Backend is authoritative for charge/refund status and authorization.

## Files

- Create: `packages/features/src/payments/domain/`, `packages/features/src/payments/application/`, `packages/features/src/payments/api/`, `packages/features/src/payments/infrastructure/`, `packages/features/src/payments/validation/`, `packages/features/src/payments/presentation/`, `packages/features/src/payments/i18n/`, and `packages/features/src/payments/test/`.
- Create app workflows under salon checkout/finance and client payment/confirmation paths only after contracts exist.
- Test: money/value rules, payment state transitions, API parsing, provider adapters, UI states, and boundaries.

### Task 1: Money and payment domain

- [x] **Step 1:** Write tests for non-negative amounts, currency consistency, totals, deposit limits, refundable states, and duplicate operation keys.
- [x] **Step 2:** Implement `Money`, `Payment`, status transitions, `PaymentRepository`, and typed payment errors.
- [x] **Step 3:** Run focused tests; expected result is PASS.

### Task 2: Application ports

- [x] **Step 1:** Write fake-provider tests for create intent, confirm, capture, refund, get status, and idempotent retry.
- [x] **Step 2:** Implement `PaymentProvider`, `PaymentRepository`, and application commands/queries with injected dependencies.
- [x] **Step 3:** Verify backend-denied, pending, failed, expired, duplicate, and network failure cases.

### Task 3: Contracts and UI

- [x] **Step 1:** Write tests for API status mapping, redaction, currency, and minor-unit conversion.
- [x] **Step 2:** Implement API contracts/adapters and reusable `PaymentStatusBadge`, `PaymentSummary`, and failure/retry states.
- [x] **Step 3:** Run package tests, typecheck, and boundary checks.

### Task 4: Commit

```bash
git add packages/features
git commit -m "feat(payments): add provider-neutral payment contracts"
```

## Definition of Done

- [x] Payment behavior is provider-neutral and backend-authoritative.
- [x] No sensitive payment material appears in code, fixtures, logs, or UI state.

**Status:** Complete
