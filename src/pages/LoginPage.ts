import { Page, expect } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/web/index.php/auth/login');
    await expect(this.page.getByRole('heading', { name: /login/i })).toBeVisible();
  }

  async login(username: string, password: string) {
    await this.page.getByPlaceholder('Username').fill(username);
    await this.page.getByPlaceholder('Password').fill(password);
    await this.page.getByRole('button', { name: /login/i }).click();
  }

  async expectLoggedIn() {
    await expect(this.page.getByRole('navigation', { name: 'Sidepanel' })).toBeVisible();
    await expect(this.page.getByText(/dashboard/i).first()).toBeVisible();
  }
}
