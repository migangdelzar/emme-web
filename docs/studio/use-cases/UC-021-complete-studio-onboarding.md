# Use Case: Complete Studio Onboarding

## Overview

**Use Case ID:** UC-021
**Use Case Name:** Complete Studio Onboarding
**Primary Actor:** Salon Owner
**Goal:** Complete a guided first-time walkthrough to become familiar with the app's main features.
**Status:** Implemented

## Preconditions

- Owner is signing in for the first time after workspace provisioning.
- The `isFirstTime` flag is set in the UI store.

## Main Success Scenario

1. Owner signs in and selects the workspace.
2. App detects first-time access and presents the onboarding overlay.
3. App walks through 5 steps, each displaying an illustration, title, and description:
   - Step 1: Welcome to EmmeNails
   - Step 2: Manage your calendar
   - Step 3: Build client relationships
   - Step 4: Track your finances
   - Step 5: Configure your studio
4. Owner taps "Next" through each step or swipes to navigate.
5. After the final step, owner taps "Get Started."
6. App dismisses the onboarding and sets the `isFirstTime` flag to false.
7. Owner arrives at the dashboard.

## Alternative Flows

### A1: Owner Dismisses Onboarding

**Trigger:** Owner taps the close button on any step (step 3)
**Flow:**

1. App dismisses the onboarding.
2. Owner is taken to the dashboard.
3. The `isFirstTime` flag remains true; onboarding will appear on next sign-in until completed.

### A2: Owner Revisits Onboarding

**Trigger:** Owner later wants to review the walkthrough
**Flow:**

1. Owner can access the onboarding again through Settings.

## Postconditions

- Onboarding is marked as completed.
- Owner has a high-level understanding of the app's main sections.

## Business Rules

### BR-023: Onboarding Persistence

The `isFirstTime` flag persists across sessions until the owner completes or dismisses onboarding. If dismissed, it reappears on next sign-in.
