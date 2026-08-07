# Use Case: View Business Dashboard

## Overview

**Use Case ID:** UC-003
**Use Case Name:** View Business Dashboard
**Primary Actor:** Salon Manager
**Goal:** Review today's business performance at a glance and take quick actions.
**Status:** Implemented

## Preconditions

- Manager is signed in with an active workspace selected.

## Main Success Scenario

1. Manager opens or returns to the Dashboard.
2. App displays KPI cards: today's income, confirmed appointments, occupancy rate, new clients this month.
3. App displays a progress bar tracking monthly revenue against the configured goal.
4. App displays today's appointments sorted chronologically, showing client name, service, time, and status.
5. Manager taps an appointment to open its detail modal without leaving the dashboard.
6. Manager taps "Quick Actions" to create an appointment or register a client directly.
7. Manager taps the monthly goal to update the target.

## Alternative Flows

### A1: No Appointments Today

**Trigger:** No appointments exist for today (step 4)
**Flow:**

1. App displays an empty-state message.

### A2: Greeting Adapts to Time of Day

**Trigger:** Dashboard loads (step 1)
**Flow:**

1. App displays a greeting that changes based on time: "Good morning," "Good afternoon," or "Good evening."

## Postconditions

- Manager has reviewed today's KPIs and upcoming appointments.
- Any quick actions (create appointment, register client) complete within the dashboard flow.

## Business Rules

### BR-005: KPI Computation

Today's income counts only completed and confirmed appointments. Occupancy rate is based on available operating hours vs booked time.
