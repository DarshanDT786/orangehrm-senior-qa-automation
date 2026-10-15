
import { test as base, expect, type Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { PimPage } from '../pages/PimPage';
import { ApiClient } from '../api/ApiClient';
import { env } from '../config/env';

type TestFixtures = {
  loginPage: LoginPage;
  pimPage: PimPage;
  apiClient: ApiClient;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  pimPage: async ({ page }, use) => {
    await use(new PimPage(page));
  },

  apiClient: async ({ page }, use) => {
    const authenticatedRequest = page.context().request;
    await use(new ApiClient(authenticatedRequest, env.apiBaseUrl));
  },

  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();
    await loginPage.login(env.adminUsername, env.adminPassword);
    await loginPage.expectLoggedIn();

    await use(page);
  }
});

export { expect };
