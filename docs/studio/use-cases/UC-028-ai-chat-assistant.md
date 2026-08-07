# Use Case: Use AI Chat Assistant

## Overview

**Use Case ID:** UC-028
**Use Case Name:** Use AI Chat Assistant
**Primary Actor:** Staff Member
**Goal:** Ask the AI assistant questions and receive answers grounded in the salon's knowledge base.
**Status:** Implemented (backend), Pending (frontend)

## Preconditions

- Staff member is signed in with an active workspace selected.
- The `ai_chat` feature flag is enabled for the workspace.
- Knowledge documents have been uploaded to the workspace (see UC-013).

## Main Success Scenario

1. Staff member opens the AI Chat interface.
2. Staff member types a question in natural language.
3. System retrieves relevant content from the salon's knowledge documents.
4. System generates a response grounded in the retrieved context.
5. Staff member reads the response and may continue with follow-up questions.

## Alternative Flows

### A1: Feature Flag Disabled

**Trigger:** The `ai_chat` flag is disabled (step 1)
**Flow:**

1. App indicates the AI assistant is not available.

### A2: No Knowledge Sources

**Trigger:** No documents have been uploaded (step 3)
**Flow:**

1. System generates a response based on general salon domain knowledge without salon-specific context.

## Postconditions

- Staff member has received an AI-generated answer. No business data is changed.

## Business Rules

### BR-038: Tenant Knowledge Isolation

AI responses draw only from the requesting workspace's indexed documents and general salon domain knowledge.

## Frontend Implementation Note

The backend `POST /api/ai/chat` endpoint is implemented. The frontend React component for the AI chat interface is yet to be built. The route is defined in `@emme/contracts` as `API.AI_CHAT`.
