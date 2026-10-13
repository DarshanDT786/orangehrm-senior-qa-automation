import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { env } from '../../src/config/env';

test('low-privilege user cannot access admin-only employee management @role', async ({ page }) => {
  test.skip(!env.essUsername || !env.essPassword,
    'Set ESS_USERNAME and ESS_PASSWORD to a valid low-privilege OrangeHRM account to run role authorization checks.');
  const login = new LoginPage(page);
  await login.open();
  await login.login(env.essUsername, env.essPassword);
  await login.expectLoggedIn();
  await page.goto('/web/index.php/pim/viewEmployeeList');
  // The exact restriction depends on the configured OrangeHRM role and environment.
  await expect(page.getByText(/access denied|not authorized|forbidden/i)).toBeVisible();
});
