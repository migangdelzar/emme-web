import type { Locator, Page, Response } from '@playwright/test';

export async function waitForVisible(locator: Locator, timeout = 10_000): Promise<void> {
  await locator.waitFor({ state: 'visible', timeout });
}

export async function waitForResponseStatus(
  page: Page,
  predicate: (response: Response) => boolean,
  timeout = 10_000,
): Promise<Response> {
  return page.waitForResponse(
    (response) => predicate(response) && response.status() >= 200 && response.status() < 300,
    { timeout },
  );
}

export async function pollUntil<T>(
  read: () => Promise<T>,
  satisfied: (value: T) => boolean,
  options: { timeout?: number; interval?: number } = {},
): Promise<T> {
  const timeout = options.timeout ?? 10_000;
  const interval = options.interval ?? 250;
  const deadline = Date.now() + timeout;
  let value = await read();

  while (!satisfied(value) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, interval));
    value = await read();
  }

  if (!satisfied(value)) throw new Error(`Condition was not satisfied within ${timeout}ms.`);
  return value;
}
