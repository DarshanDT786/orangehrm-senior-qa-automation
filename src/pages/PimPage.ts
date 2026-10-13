import { Page, expect } from '@playwright/test';
import { env } from '../config/env';

export interface EmployeeInput { firstName: string; middleName?: string; lastName: string; }

export class PimPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.getByRole('link', { name: /pim/i }).click();
    await expect(this.page.getByRole('heading', { name: /pim/i })).toBeVisible();
  }

  async createEmployee(employee: EmployeeInput): Promise<string> {
    await this.page.getByRole('button', { name: /add/i }).click();
    await expect(this.page.getByRole('heading', { name: /add employee/i })).toBeVisible();
    await this.page.getByPlaceholder('First Name').fill(employee.firstName);
    if (employee.middleName) await this.page.getByPlaceholder('Middle Name').fill(employee.middleName);
    await this.page.getByPlaceholder('Last Name').fill(employee.lastName);
    await this.page.getByRole('button', { name: /save/i }).click();
    await expect(this.page.getByRole('heading', { name: /personal details/i })).toBeVisible({ timeout: 30_000 });
    const match = this.page.url().match(/empNumber\/(\d+)/);
    if (!match) throw new Error(`Could not extract employee number from URL: ${this.page.url()}`);
    return match[1];
  }

  async updateFirstName(firstName: string) {
    const firstNameField = this.page.getByPlaceholder('First Name');
    const employeeForm = this.page.locator('form').filter({ has: firstNameField }).first();

    await firstNameField.waitFor({ state: 'visible' });
    await firstNameField.fill(firstName);
    await employeeForm.getByRole('button', { name: /save/i }).click();
    await expect(this.page.getByText(/successfully updated/i)).toBeVisible({ timeout: 15_000 });
  }

  async searchEmployee(firstName: string, lastName: string) {
    await this.page.getByRole('link', { name: /employee list/i }).click();
    await this.page.getByPlaceholder('Type for hints...').first().fill(firstName);
    await this.page.getByPlaceholder('Type for hints...').last().fill(lastName);
    await this.page.getByRole('button', { name: /search/i }).click();
    await expect(this.page.getByRole('table')).toBeVisible();
  }

  async deleteEmployee(firstName: string, lastName: string, employeeNumber?: string) {
    await this.searchEmployee(firstName, lastName);
    const row = this.page.getByRole('row').filter({ hasText: firstName }).filter({ hasText: lastName }).first();

    if (await row.count()) {
      await expect(row).toBeVisible();
      await row.locator('input[type="checkbox"]').check();
      await this.page.getByRole('button', { name: /delete selected/i }).click();
      await this.page.getByRole('button', { name: /yes, delete/i }).click();
      await expect(this.page.getByText(/successfully deleted/i)).toBeVisible({ timeout: 15_000 });
      return;
    }

    if (!employeeNumber) {
      throw new Error(`Employee ${firstName} ${lastName} was not found in the list and no employee number was provided for API deletion.`);
    }

    const deleteResponse = await this.page.context().request.delete(
      `${env.apiBaseUrl}/web/index.php/api/v2/pim/employees`,
      { data: { ids: [Number(employeeNumber)] } }
    );

    expect(deleteResponse.ok(), `Employee delete API returned ${deleteResponse.status()}`).toBeTruthy();
  }
}
