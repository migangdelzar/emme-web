# Use Case: Manage Service Catalog

## Overview

**Use Case ID:** UC-004
**Use Case Name:** Manage Service Catalog
**Primary Actor:** Salon Manager
**Goal:** Maintain the salon's service offerings with accurate names, categories, durations, and prices.
**Status:** Implemented

## Preconditions

- Manager is signed in with an active workspace selected.

## Main Success Scenario

1. Manager opens the Services view.
2. App displays services grouped by category, each showing name, duration, and price.
3. Manager filters by category or searches by name.
4. Manager taps "+" to create a new service: enters name, selects category, sets duration (minutes), enters price, and optionally adds a description.
5. Manager confirms. App adds the service to the catalog.
6. Manager taps a service to edit its details or toggle its active/inactive status.
7. Manager deletes a service with a confirmation dialog.

## Alternative Flows

### A1: Toggle Service Inactive

**Trigger:** Manager toggles a service to inactive (step 6)
**Flow:**

1. App immediately hides the service from the active list.
2. The service cannot be selected for new appointments but history is preserved.

### A2: Empty Catalog

**Trigger:** Workspace has no services (step 2)
**Flow:**

1. App displays an empty-state prompting the manager to create the first service.

## Postconditions

- New services are available for appointment booking.
- Inactive services are hidden from the booking wizard but retained in history.

## Business Rules

### BR-007: Required Service Fields

A service requires at minimum a name, category, duration (positive minutes), and price (positive number).
