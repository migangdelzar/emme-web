# Use Case: Sign In and Select Workspace

## Overview

**Use Case ID:** UC-001
**Use Case Name:** Sign In and Select Workspace
**Primary Actor:** Studio User
**Goal:** Authenticate and enter an authorized salon workspace.
**Status:** Implemented

## Preconditions

- The user has a web browser with the app URL.
- The user has valid credentials or a Keycloak account.

## Main Success Scenario

1. User opens the app and sees the branded landing page with "Enter" and "Register" options.
2. User taps "Enter" to go to the sign-in form.
3. User enters email and password.
4. System validates credentials and returns a session.
5. If the user belongs to multiple salons, the app displays the tenant selector showing each salon name and role.
6. User selects a salon workspace.
7. System loads the dashboard for the selected salon.

## Alternative Flows

### A1: User Chooses to Register

**Trigger:** User taps "Register" on the landing page (step 2)
**Flow:**

1. App redirects to Keycloak's OAuth authorization page.
2. User completes registration in Keycloak.
3. On success, Keycloak redirects back to the app with a session.

### A2: Invalid Credentials

**Trigger:** Email or password is incorrect (step 4)
**Flow:**

1. App displays an inline error message ("Invalid credentials").
2. User corrects and retries.

### A3: First-Time User (Onboarding)

**Trigger:** User signs in to a workspace for the first time (step 7)
**Flow:**

1. App detects first-time access.
2. App presents the onboarding walkthrough (see UC-021).
3. User completes or skips onboarding.

## Postconditions

- User has an active session with a selected salon workspace.
- Subsequent API calls include the tenant context.

## Business Rules

### BR-001: Active Membership Required

Only active tenant memberships appear in the tenant selector. Suspended or deleted memberships are hidden.

### BR-002: Session Persistence

The access token is stored in browser localStorage. On app reload, the session is restored automatically without re-entering credentials.
