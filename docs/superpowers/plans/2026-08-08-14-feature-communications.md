# Communications Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Define channel-neutral messaging, reminders, notifications, and AI interaction contracts for client and salon workflows.

**Architecture:** The feature owns message/conversation models, application ports, transport mapping, and reusable presentation. WhatsApp, web chat, AI, and notification providers are adapters, not domain dependencies.

**Tech Stack:** TypeScript, React, `@emme/api`, `@emme/core`, `@emme/ui`, Vitest, Playwright for critical chat flows.

## Global Constraints

- External channel SDKs never enter domain/application code.
- Message content and media metadata are treated as untrusted input.
- Provider failures render explicit retry/offline states.

## Files

- Create: `packages/features/src/communications/domain/`, `packages/features/src/communications/application/`, `packages/features/src/communications/api/`, `packages/features/src/communications/infrastructure/`, `packages/features/src/communications/validation/`, `packages/features/src/communications/presentation/`, `packages/features/src/communications/i18n/`, and `packages/features/src/communications/test/`.
- Create app workflows under `apps/client-app/src/features/communications/` and salon assistant views only when required by studio requirements.
- Test: message rules, ports, API mapping, provider adapters, chat components, and boundary tests.

### Task 1: Conversation domain

- [ ] **Step 1:** Write tests for message roles, channel values, attachment metadata, ordering, unread state, and safe content limits.
- [ ] **Step 2:** Implement `Conversation`, `Message`, `Attachment`, notification/reminder value types, and typed communication errors.
- [ ] **Step 3:** Run focused tests; expected result is PASS.

### Task 2: Application ports

- [ ] **Step 1:** Write fake-port tests for send message, load history, upload attachment, subscribe updates, send reminder, and request AI guidance.
- [ ] **Step 2:** Implement `ConversationRepository`, `MessageTransport`, `NotificationPort`, `AiAssistantPort`, and use cases with DI.
- [ ] **Step 3:** Verify offline, retry, duplicate send, unauthorized, and provider timeout behavior.

### Task 3: API/adapters/presentation

- [ ] **Step 1:** Write mapper tests for text, voice, image, status, timestamps, and provider errors.
- [ ] **Step 2:** Implement API contracts, adapters, `ConversationView`, `MessageList`, `MessageComposer`, and attachment error states.
- [ ] **Step 3:** Run package/component tests and a mocked chat integration test.

### Task 4: Commit

```bash
git add packages/features
git commit -m "feat(communications): add channel-neutral messaging contracts"
```

## Definition of Done

- [ ] Client communication requirements have typed, testable frontend boundaries.
- [ ] Provider implementations remain replaceable and isolated.
