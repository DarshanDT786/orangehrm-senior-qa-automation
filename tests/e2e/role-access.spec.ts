
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { env } from '../../src/config/env';

test('low-privilege user cannot access admin-only employee management @role', async ({
  page
}) => {
  test.skip(
    !env.essUsername || !env.essPassword,
    'Role-based access test skipped: valid ESS credentials are not configured.'
  );

  const login = new LoginPage(page);

  await login.open();
  await login.login(env.essUsername, env.essPassword);
  await login.expectLoggedIn();

  // Navigate directly to the employee-management URL.
  await page.goto('/web/index.php/pim/viewEmployeeList');

  // Confirm the ESS user remains authenticated.
  await expect(
    page.getByRole('link', { name: /my info/i })
  ).toBeVisible();

  // Confirm the PIM menu is unavailable to the ESS user.
  await expect(
    page.getByRole('link', { name: /^pim$/i })
  ).toHaveCount(0);

  // Confirm the employee-management page is not displayed.
  await expect(
    page.getByRole('heading', { name: /employee information/i })
  ).toHaveCount(0);
});
