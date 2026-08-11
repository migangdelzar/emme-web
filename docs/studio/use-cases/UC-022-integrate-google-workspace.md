# Use Case: Integrate Google Workspace

## Overview

**Use Case ID:** UC-022
**Use Case Name:** Integrate Google Workspace
**Primary Actor:** Salon Owner
**Goal:** Connect Google Calendar and Google Sheets for automatic sync and data export.
**Status:** Implemented

## Preconditions

- Owner is signed in with an active workspace selected.
- Owner has a Google account.

## Main Success Scenario

1. Owner opens Settings and navigates to the Google Workspace tab.
2. If not connected, app displays a "Connect Google Workspace" section with a description and a connect button.
3. Owner taps "Connect Google Workspace."
4. App redirects to Google's OAuth consent screen.
5. Owner grants calendar and sheets permissions.
6. App receives the callback and displays the connected account email with a green "Connected" indicator.
7. Owner toggles "Auto-sync to Google Calendar" to enable automatic appointment sync.
8. Owner triggers a manual "Sync Now" if desired.
9. Owner selects an export type (Appointments, Clients, or Full) and taps "Export to Sheets."
10. App creates a Google Sheet and displays the link.
11. Owner views the list of previously exported spreadsheets.

## Alternative Flows

### A1: Google Account Already Connected

**Trigger:** Owner revisits the tab after connecting (step 2)
**Flow:**

1. App shows the connected status with the account email and a "Disconnect" button.
2. Owner can disconnect to revoke access.

### A2: Export In Progress

**Trigger:** Owner triggers an export (step 9)
**Flow:**

1. App shows a loading spinner with "Exporting..." text.
2. On completion, the spreadsheet appears in the list.

## Postconditions

- Appointments sync to Google Calendar according to the sync preference.
- Exported spreadsheets are accessible in the owner's Google Drive.

## Business Rules

### BR-025: One Google Account per Workspace

Only one Google account can be connected at a time. Connecting a new account requires disconnecting the existing one first.
