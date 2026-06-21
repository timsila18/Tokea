import { expect, test } from '@playwright/test';

const pages = [
  '/',
  '/events/nairobi-jazz-festival-2027',
  '/search',
  '/dashboard/attendee',
  '/dashboard/organizer',
  '/admin',
];

for (const path of pages) {
  test(`loads ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByText('Tokea').first()).toBeVisible();
  });
}
