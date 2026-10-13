import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { env } from '../../src/config/env';

test('low-privilege user cannot access admin-only employee management @role', async ({ page }) => {
  test.skip(
  !env.essUsername || !env.essPassword,
  'Role-based access test skipped: valid ESS credentials are not configured. Configure a low-privilege account to verify admin-only access restrictions.'
);
  const login = new LoginPage(page);
  await login.open();
  await login.login(env.essUsername, env.essPassword);
  await login.expectLoggedIn();
  await page.goto('/web/index.php/pim/viewEmployeeList');
  // The exact restriction depends on the configured OrangeHRM role and environment.
  await expect(page.getByText(/access denied|not authorized|forbidden/i)).toBeVisible();
});
