
import type { APIRequestContext, APIResponse } from '@playwright/test';

export interface EmployeeApiRecord {
  empNumber?: number | string;
  employeeId?: number | string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
}

export class ApiClient {
  private readonly employeeEndpoint =
    '/web/index.php/api/v2/pim/employees';

  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl: string
  ) {}

  async getEmployee(employeeNumber: string): Promise<APIResponse> {
    return this.request.get(
      `${this.baseUrl}${this.employeeEndpoint}/${encodeURIComponent(employeeNumber)}`
    );
  }

  async deleteEmployee(employeeNumber: string): Promise<APIResponse> {
    return this.request.delete(
      `${this.baseUrl}${this.employeeEndpoint}`,
      {
        data: {
          ids: [Number(employeeNumber)]
        }
      }
    );
  }

  async getEmployeeRecord(
    employeeNumber: string
  ): Promise<EmployeeApiRecord> {
    const response = await this.getEmployee(employeeNumber);

    if (!response.ok()) {
      throw new Error(
        `Get employee failed: HTTP ${response.status()}`
      );
    }

    const body: unknown = await response.json();

    if (
      typeof body !== 'object' ||
      body === null ||
      !('data' in body) ||
      typeof body.data !== 'object' ||
      body.data === null
    ) {
      throw new Error(
        'Get employee returned an invalid response: expected an employee data object.'
      );
    }

    const record = body.data as EmployeeApiRecord;

    if (
      typeof record.firstName !== 'string' ||
      typeof record.lastName !== 'string'
    ) {
      throw new Error(
        'Employee API response is missing firstName or lastName.'
      );
    }

    return record;
  }
}
