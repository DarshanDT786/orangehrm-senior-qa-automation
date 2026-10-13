# Flaky test detection and mitigation

## Detection
- Capture first-attempt result separately from retry result.
- Trend retry-pass rate, failure type, browser, environment, and duration.
- Use Playwright traces plus screenshot/video to classify timing, selector, data, environment, or product defects.

## Mitigation
- Prefer role/label/test-id selectors over brittle DOM structure.
- Use locator auto-waiting and state-based assertions instead of fixed sleeps.
- Give each test unique data and deterministic cleanup.
- Avoid tests depending on execution order or a shared mutable account.
- Keep retries bounded; a retry-pass remains a signal to investigate.
- Quarantine only temporarily with an owner, issue link, and expiry date.
