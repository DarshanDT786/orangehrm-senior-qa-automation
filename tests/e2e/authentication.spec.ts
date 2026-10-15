
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test('user cannot log in with invalid credentials @smoke', async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.open();
  await loginPage.login('invalid_user_12345', 'WrongPassword123!');

  await expect(page).toHaveURL(/auth\/login/);
  await expect(page.getByRole('alert')).toBeVisible();
});
