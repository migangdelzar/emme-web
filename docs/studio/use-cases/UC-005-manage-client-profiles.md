# Use Case: Manage Client Profiles

## Overview

**Use Case ID:** UC-005
**Use Case Name:** Manage Client Profiles
**Primary Actor:** Staff Member
**Goal:** Register, search, filter, edit, and review client profiles and their service history.
**Status:** Implemented

## Preconditions

- Staff member is signed in with an active workspace selected.

## Main Success Scenario

1. Staff member opens the Clients view.
2. App displays a paginated card grid showing each client's avatar, name, phone, total spent, and visit count.
3. Staff member searches by name or phone, filters by VIP/new/loyal/inactive, and sorts by recency, name, spending, or visits.
4. Staff member taps "+" to register a new client. App opens a 2-step form:
   - Step 1: Enter name, phone, email, and VIP toggle.
   - Step 2: Enter birthday, allergies, and notes.
5. Staff member completes the form. App creates the client.
6. Staff member taps an existing client card to view their full profile.
7. App displays the client detail: avatar, name, phone, email, total spent, visit count, allergies, preferences, notes, birthday, first-visit date, and a timeline of past appointments with service names, dates, and prices.
8. Staff member can: edit the profile, contact via WhatsApp, call, or delete the client.

## Alternative Flows

### A1: Edit Client Profile

**Trigger:** Staff member taps "Edit Profile" on a client detail (step 8)
**Flow:**

1. App switches to edit mode showing all editable fields: name, phone, email, birthday, allergies, preferences, VIP status, notes.
2. Staff member modifies fields and saves.
3. App updates the profile and returns to detail view.

### A2: Delete Client

**Trigger:** Staff member taps "Delete" on a client (step 8)
**Flow:**

1. App shows a confirmation dialog warning that the profile and history will be permanently deleted.
2. Staff member confirms. App deletes the client.

### A3: Empty State

**Trigger:** Workspace has no clients (step 2)
**Flow:**

1. App displays an empty-state illustration with a message encouraging the staff member to register the first client.

## Postconditions

- New client appears in the card grid.
- Edited profile reflects changes immediately.
- Deleted client is removed from the grid.

## Business Rules

### BR-009: Required Fields

Client registration requires at minimum a name and a phone number with at least 10 digits.
