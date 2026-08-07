# Use Case: Manage Studio Data and Account

## Overview

**Use Case ID:** UC-024
**Use Case Name:** Manage Studio Data and Account
**Primary Actor:** Salon Owner
**Goal:** Export business data, clear local cache, manage theme and language, and handle account lifecycle.
**Status:** Implemented

## Preconditions

- Owner is signed in with an active workspace selected.

## Main Success Scenario

1. Owner opens Settings and navigates to the Data section.
2. Owner taps "Export Backup" — app compiles all business data into a JSON file and triggers a browser download.
3. Owner taps "Clear Cache" — app purges local storage and TanStack Query cache, then reloads.
4. Owner navigates to the Security section.
5. Owner taps "Sign Out" — app clears the session and redirects to the landing page.
6. Owner taps "Delete Account" — app presents a multi-step confirmation requiring the owner to type a confirmation phrase.
7. Owner completes the confirmation. App stages the account for deletion.

### Appearance

8. Owner opens the Appearance tab.
9. Owner selects Light, Dark, or System theme. App applies the theme immediately.
10. Owner opens the Language tab and selects Spanish or English. App switches the interface language.

## Alternative Flows

### A1: Backup Fails

**Trigger:** Data compilation fails (step 2)
**Flow:**

1. App displays an error message. Owner may retry.

### A2: Deletion Cancelled

**Trigger:** Owner cancels the deletion flow before completing confirmation (step 7)
**Flow:**

1. App dismisses the deletion dialog. Account remains unchanged.

## Postconditions

- Backup JSON file is saved to the owner's device.
- Cache is cleared and app reloads with fresh data.
- Theme and language changes persist across sessions.

## Business Rules

### BR-030: Confirmation Phrase Required

Account deletion requires typing the salon name exactly as confirmation. One-click deletion is not allowed.

### BR-031: Backup Content

The backup JSON includes profile, services, clients, appointments, and settings. System metadata is excluded.
