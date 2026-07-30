import { expect, type Page } from '@playwright/test';

/** Navigate to a section via sidebar button */
export const navigateTo = async (page: Page, label: string) => {
  await page.locator('nav button').filter({ hasText: label }).click();
  await page.waitForTimeout(300);
};

/** Navigate through all sections and verify each loaded */
export const navigateAllSections = async (page: Page) => {
  const sections = [
    { label: 'Servicios', heading: /servicios/i },
    { label: 'Clientes', heading: /clientes|relaciones/i },
    { label: 'Agenda', heading: /agenda|calendario/i },
    { label: 'Finanzas', heading: /finanzas/i },
  ];

  for (const section of sections) {
    await navigateTo(page, section.label);
    await expect(page.getByRole('heading', { name: section.heading })).toBeVisible();
  }

  // Return to dashboard
  await page.goto('/#/dashboard');
  await expect(page.getByRole('heading', { name: /hola/i })).toBeVisible();
};
