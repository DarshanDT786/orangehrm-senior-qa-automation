
import 'dotenv/config';

function requiredEnv(name: string, fallback?: string): string {
  const value = process.env[name]?.trim() || fallback;

  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Check your .env file.`
    );
  }

  return value;
}

export const env = {
  get baseUrl(): string {
    return requiredEnv(
      'BASE_URL',
      'https://opensource-demo.orangehrmlive.com'
    ).replace(/\/$/, '');
  },

  get apiBaseUrl(): string {
    return requiredEnv('API_BASE_URL', this.baseUrl).replace(/\/$/, '');
  },

  get adminUsername(): string {
    return requiredEnv('ADMIN_USERNAME');
  },

  get adminPassword(): string {
    return requiredEnv('ADMIN_PASSWORD');
  },

  get essUsername(): string {
    return process.env.ESS_USERNAME?.trim() ?? '';
  },

  get essPassword(): string {
    return process.env.ESS_PASSWORD ?? '';
  }
};
