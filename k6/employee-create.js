import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const failures = new Rate('employee_create_failures');
const createDuration = new Trend('employee_create_duration', true);
const base = __ENV.K6_BASE_URL || 'http://localhost:3000';
const path = __ENV.K6_EMPLOYEE_PATH || '/api/employees';

export const options = {
  vus: 2, duration: '60s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<1000'],
    employee_create_duration: ['p(95)<1000'],
    employee_create_failures: ['rate<0.01']
  }
};

export default function () {
  const id = `${__VU}-${__ITER}-${Date.now()}`;
  const payload = JSON.stringify({ firstName: `Load${id}`, lastName: 'Automation', employeeId: id });
  const response = http.post(`${base}${path}`, payload, { headers: { 'Content-Type': 'application/json' } });
  createDuration.add(response.timings.duration);
  const ok = check(response, { 'create API returns success or validation/auth response': (r) => [200, 201, 400, 401, 403, 409].includes(r.status) });
  failures.add(!ok);
  sleep(1);
}
