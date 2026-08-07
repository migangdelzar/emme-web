# Use Case: Configure Business

## Overview

**Use Case ID:** UC-007
**Use Case Name:** Configure Business
**Primary Actor:** Salon Owner
**Goal:** Configure business profile, operating hours, special dates, WhatsApp bot, promotions, and notification preferences.
**Status:** Implemented

## Preconditions

- Owner is signed in with an active workspace selected.

## Main Success Scenario

1. Owner opens the Settings view.
2. App displays a tabbed navigation with sections grouped by category: Business (Profile, Hours, WhatsApp Bot, Promotions), Preferences (Notifications, Google Workspace, Appearance, Language), Advanced (Data, Security).
3. Owner selects "Profile" and edits business name, owner name, phone, email, address, Instagram, and description. Owner saves.
4. Owner selects "Hours" and configures per-day opening/closing times with active toggles. Owner sets break times for each day. Owner saves.
5. Owner selects "Special Dates" within Hours and adds exceptions: holidays (full day off), vacations (date range), or reduced-hour days (custom open/close). Owner saves.
6. Owner selects "WhatsApp Bot" and enables auto-reply, sets a welcome message, and configures keyword-response pairs. Owner saves.
7. Owner selects "Promotions" and creates a promotion: title, target service, date range, discount type (percentage or fixed), and value. Owner saves.
8. Owner selects "Notifications" and configures reminder timing and notification templates. Owner saves.

## Alternative Flows

### A1: Remove Special Date

**Trigger:** Owner deletes a special date exception (step 5)
**Flow:**

1. App removes the date from the list immediately.
2. Standard operating hours apply for that date going forward.

### A2: Remove Promotion

**Trigger:** Owner deletes a promotion (step 7)
**Flow:**

1. App removes the promotion from the active list.

## Postconditions

- All saved settings take effect immediately across the app.
- Working hours and special dates affect available appointment slots.
- WhatsApp bot settings affect automated customer responses.

## Business Rules

### BR-013: Break Time Validation

Break times must fall within the day's operating hours. Setting break times outside operating hours has no effect.

### BR-014: Special Date Precedence

Special dates override standard operating hours. A vacation date range makes all days within the range unavailable for bookings.
