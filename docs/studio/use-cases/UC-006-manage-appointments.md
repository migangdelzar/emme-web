# Use Case: Manage Appointments

## Overview

**Use Case ID:** UC-006
**Use Case Name:** Manage Appointments
**Primary Actor:** Staff Member
**Goal:** View, create, and manage salon appointments through the calendar interface.
**Status:** Implemented

## Preconditions

- Staff member is signed in with an active workspace selected.
- Services and clients exist in the workspace.

## Main Success Scenario

1. Staff member opens the Agenda view.
2. App displays today's appointments in list view with a 5-day date strip and collapsible monthly calendar.
3. Staff member navigates dates or switches between list, day, week, and month views.
4. Staff member taps "+" to create a new appointment.
5. App opens a 3-step wizard:
   - Step 1: Search or select a client (shows name, phone, VIP badge).
   - Step 2: Filter services by category, select a service (shows duration and price).
   - Step 3: Choose a date and an available time slot. Slots are computed from salon hours, service duration, existing bookings, and break times. Staff member optionally adds notes.
6. Staff member confirms. App creates the appointment and shows a success confirmation with a Google Calendar link option.
7. Staff member taps an existing appointment to view its detail: client info, service, time, price, status, allergies, preferences, and notes.
8. From the detail view, staff member can: send a WhatsApp reminder, share to Google Calendar, download ICS file, change status, or cancel.

## Alternative Flows

### A1: No Available Slots

**Trigger:** Selected date has no available time slots (step 5)
**Flow:**

1. App displays "No available times for the selected date."
2. Staff member selects a different date.

### A2: Cancel Appointment

**Trigger:** Staff member selects "Cancel" on an appointment (step 8)
**Flow:**

1. App shows a confirmation dialog warning the slot will be freed.
2. Staff member confirms. App cancels the appointment.

### A3: Drag-and-Drop Reschedule (Visual Only)

**Trigger:** Staff member drags an appointment card to a different day or time (step 3)
**Flow:**

1. App validates the target slot for availability.
2. If unavailable, app shows a toast error.
3. If available, app shows a toast noting that backend reschedule is not yet available.

## Postconditions

- Created appointments appear on the calendar for the selected date.
- Cancelled appointments are removed from the active schedule.

## Business Rules

### BR-011: Slot Availability

Available slots exclude: times outside operating hours, times overlapping existing appointments, and times within configured break periods. Special dates (holidays, vacations, reduced hours) override standard hours.

### BR-012: Service Duration

The end time of a new appointment is computed as start time + service duration in minutes.
