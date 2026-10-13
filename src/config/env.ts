import 'dotenv/config';

export const env = {
  baseUrl: process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  apiBaseUrl: process.env.API_BASE_URL || process.env.BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  adminUsername: process.env.ADMIN_USERNAME || 'Admin',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  essUsername: process.env.ESS_USERNAME || '',
  essPassword: process.env.ESS_PASSWORD || ''
};
