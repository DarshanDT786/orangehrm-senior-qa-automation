
import { Page, expect } from '@playwright/test';

export interface EmployeeInput {
  firstName: string;
  middleName?: string;
  lastName: string;
}

export class PimPage {
  constructor(private readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.getByRole('link', { name: /pim/i }).click();
    await expect(
      this.page.getByRole('heading', { name: /pim/i })
    ).toBeVisible();
  }

  async createEmployee(employee: EmployeeInput): Promise<string> {
    await this.page.getByRole('button', { name: /add/i }).click();

    await expect(
      this.page.getByRole('heading', { name: /add employee/i })
    ).toBeVisible();

    await this.page.getByPlaceholder('First Name').fill(employee.firstName);

    if (employee.middleName) {
      await this.page.getByPlaceholder('Middle Name').fill(employee.middleName);
    }

    await this.page.getByPlaceholder('Last Name').fill(employee.lastName);
    await this.page.getByRole('button', { name: /save/i }).click();

    await expect(
      this.page.getByRole('heading', { name: /personal details/i })
    ).toBeVisible({ timeout: 30_000 });

    const match = this.page.url().match(/empNumber\/(\d+)/);

    if (!match) {
      throw new Error(
        `Could not extract employee number from URL: ${this.page.url()}`
      );
    }

    return match[1];
  }

  async updateFirstName(firstName: string): Promise<void> {
    const firstNameField = this.page.getByPlaceholder('First Name');
    const employeeForm = this.page
      .locator('form')
      .filter({ has: firstNameField })
      .first();

    await firstNameField.waitFor({ state: 'visible' });
    await firstNameField.fill(firstName);
    await employeeForm.getByRole('button', { name: /save/i }).click();

    await expect(
      this.page.getByText(/successfully updated/i)
    ).toBeVisible({ timeout: 15_000 });
  }

  async searchEmployee(firstName: string, lastName: string): Promise<void> {
    await this.page.getByRole('link', { name: /employee list/i }).click();

    const employeeNameFields = this.page.getByPlaceholder('Type for hints...');
    await expect(employeeNameFields.first()).toBeVisible();

    // OrangeHRM Employee List uses the first autocomplete field for Employee Name.
    // Search using the first name only, then identify the exact row below.
    await employeeNameFields.first().fill(firstName);

    await this.page.getByRole('button', { name: /search/i }).click();

    const matchingRow = this.page
      .getByRole('row')
      .filter({ hasText: firstName })
      .filter({ hasText: lastName });

    await expect(matchingRow.first()).toBeVisible({ timeout: 15_000 });
  }
  async deleteEmployee(firstName: string, lastName: string): Promise<void> {
    await this.searchEmployee(firstName, lastName);

    const row = this.page
      .getByRole('row')
      .filter({ hasText: firstName })
      .filter({ hasText: lastName })
      .first();

    await expect(row).toBeVisible({ timeout: 15_000 });

    const checkbox = row.locator('span.oxd-checkbox-input');
    await expect(checkbox).toBeVisible();
    await checkbox.click();

    await this.page.getByRole('button', { name: /delete selected/i }).click();
    await this.page.getByRole('button', { name: /yes, delete/i }).click();

    await expect(
      this.page.getByText(/successfully deleted/i)
    ).toBeVisible({ timeout: 15_000 });

    // Verify the deleted employee is absent from the results.
    const employeeRows = this.page
      .getByRole('row')
      .filter({ hasText: firstName })
      .filter({ hasText: lastName });

    await expect(employeeRows).toHaveCount(0, { timeout: 15_000 });
  }

}
