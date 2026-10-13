import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const failures = new Rate('request_failures');
const loginDuration = new Trend('login_duration', true);
const base = __ENV.K6_BASE_URL || 'http://localhost:3000';
const loginPath = __ENV.K6_LOGIN_PATH || '/api/auth/login';

export const options = {
  scenarios: { login_smoke: { executor: 'ramping-vus', startVUs: 1, stages: [
    { duration: '20s', target: 2 }, { duration: '40s', target: 2 }, { duration: '10s', target: 0 }
  ] } },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
    login_duration: ['p(95)<800'],
    request_failures: ['rate<0.01']
  }
};

export default function () {
  const payload = JSON.stringify({ username: __ENV.K6_USERNAME || 'load-test-user', password: __ENV.K6_PASSWORD || 'change-me' });
  const response = http.post(`${base}${loginPath}`, payload, { headers: { 'Content-Type': 'application/json' } });
  loginDuration.add(response.timings.duration);
  const ok = check(response, { 'login API returns expected status': (r) => r.status === 200 || r.status === 201 || r.status === 401 });
  failures.add(!ok);
  sleep(1);
}
