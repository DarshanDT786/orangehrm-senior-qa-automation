
import { test, expect } from '../../src/fixtures/testFixtures';
import { uniqueEmployee } from '../../src/utils/testData';

test.describe('Employee lifecycle @regression', () => {
  test('admin can create, update, verify by API and delete an employee @smoke', async ({
    authenticatedPage,
    pimPage,
    apiClient
  }) => {
    const employee = uniqueEmployee();
    const updatedFirstName = `${employee.firstName}Updated`;

    await pimPage.open();

    const employeeNumber = await pimPage.createEmployee(employee);

    // Verify the employee details in the UI.
    await expect(
      authenticatedPage.getByPlaceholder('First Name')
    ).toHaveValue(employee.firstName);

    // Verify the employee through the reusable API client.
    const createdRecord = await apiClient.getEmployeeRecord(employeeNumber);

    expect(String(createdRecord.empNumber ?? createdRecord.employeeId)).toBe(
      employeeNumber
    );
    expect(createdRecord.firstName).toBe(employee.firstName);
    expect(createdRecord.lastName).toBe(employee.lastName);

    // Update the employee and verify the persisted value.
    await pimPage.updateFirstName(updatedFirstName);

    await expect(
      authenticatedPage.getByPlaceholder('First Name')
    ).toHaveValue(updatedFirstName);

    const updatedRecord = await apiClient.getEmployeeRecord(employeeNumber);

    expect(updatedRecord.firstName).toBe(updatedFirstName);
    expect(updatedRecord.lastName).toBe(employee.lastName);

    // Delete through the UI; no API fallback is allowed.
    await pimPage.deleteEmployee(updatedFirstName, employee.lastName);

    // Verify the employee is no longer available through the API.
    const deletedResponse = await apiClient.getEmployee(employeeNumber);

    expect(
      [404, 422].includes(deletedResponse.status()),
      `Expected deleted employee to return 404 or 422, got ${deletedResponse.status()}`
    ).toBeTruthy();
  });

  test('authenticated admin can access PIM employee management @smoke', async ({
    authenticatedPage
  }) => {
    await expect(
      authenticatedPage.getByRole('link', { name: /pim/i })
    ).toBeVisible();
  });
});
