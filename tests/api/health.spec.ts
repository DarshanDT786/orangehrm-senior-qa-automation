import { test, expect } from '@playwright/test';
import { env } from '../../src/config/env';

test('OrangeHRM login page is reachable @api @smoke', async ({ request }) => {
  const response = await request.get(`${env.baseUrl}/web/index.php/auth/login`);
  expect(response.status()).toBe(200);
  expect(await response.text()).toContain('OrangeHRM');
});
