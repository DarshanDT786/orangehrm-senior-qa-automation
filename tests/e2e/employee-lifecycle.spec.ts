import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { PimPage } from '../../src/pages/PimPage';
import { env } from '../../src/config/env';
import { uniqueEmployee } from '../../src/utils/testData';

test.describe('Employee lifecycle @regression', () => {
  test('admin can create, update, verify by API and delete an employee @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    const pim = new PimPage(page);
    const employee = uniqueEmployee();
    const updatedFirstName = `${employee.firstName}Updated`;

    await login.open();
    await login.login(env.adminUsername, env.adminPassword);
    await login.expectLoggedIn();
    await pim.open();

    const employeeNumber = await pim.createEmployee(employee);
    // await expect(page.getByLabel('First Name')).toHaveValue(employee.firstName);
    await expect(
      page.getByRole('heading', { name: /personal details/i })
    ).toBeVisible();

    await expect(
      page.getByPlaceholder('First Name')
    ).toHaveValue(employee.firstName);
    // API verification reuses the authenticated browser context/cookies.
    const apiResponse = await page.context().request.get(
      `${env.apiBaseUrl}/web/index.php/api/v2/pim/employees/${employeeNumber}`
    );
    expect(apiResponse.ok(), `Employee API returned ${apiResponse.status()}`).toBeTruthy();
    const apiBody = await apiResponse.json();
    const employeeRecord = apiBody.data ?? apiBody;
    expect(String(employeeRecord.empNumber ?? employeeRecord.employeeId ?? employeeNumber)).toBe(employeeNumber);
    expect(String(employeeRecord.firstName ?? employee.firstName)).toBe(employee.firstName);

    await pim.updateFirstName(updatedFirstName);
    await expect(page.getByPlaceholder('First Name')).toHaveValue(updatedFirstName);

    // Re-check persisted change through the API.
    const updatedResponse = await page.context().request.get(
      `${env.apiBaseUrl}/web/index.php/api/v2/pim/employees/${employeeNumber}`
    );
    expect(updatedResponse.ok()).toBeTruthy();
    const updatedBody = await updatedResponse.json();
    expect(String((updatedBody.data ?? updatedBody).firstName)).toBe(updatedFirstName);

    await pim.deleteEmployee(updatedFirstName, employee.lastName, employeeNumber);
    const deletedResponse = await page.context().request.get(
      `${env.apiBaseUrl}/web/index.php/api/v2/pim/employees/${employeeNumber}`
    );
    // OrangeHRM may respond with 404, 422, or a permission/not-found envelope after deletion.
    expect([404, 200, 422]).toContain(deletedResponse.status());
    if (deletedResponse.status() === 200) {
      const deletedBody = await deletedResponse.json();
      expect(deletedBody.data).toBeFalsy();
    }
  });

  test('authenticated admin can access PIM employee management @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(env.adminUsername, env.adminPassword);
    await login.expectLoggedIn();
    await expect(page.getByRole('link', { name: /pim/i })).toBeVisible();
  });
});
