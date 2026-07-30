import { expect, type Page } from '@playwright/test';

/** Expect the heading for a page is visible */
export const expectPageHeading = (page: Page, pattern: RegExp) =>
  expect(page.getByRole('heading', { name: pattern })).toBeVisible();

/** Expect the page body rendered (any main content) */
export const expectContentLoaded = (page: Page) =>
  expect(page.getByTestId('main-content')).toBeVisible();

/** Expect dashboard loaded — checks sidebar nav is visible (renders immediately after auth) */
export const expectDashboardLoaded = (page: Page) =>
  expect(page.getByTestId('sidebar-container')).toBeVisible();

/** Expect a heading with greeting — use after data loads */
export const expectDashboardGreeting = (page: Page) =>
  expect(page.getByRole('heading', { name: /hola/i })).toBeVisible();
