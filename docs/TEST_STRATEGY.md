# Test strategy

## Employee lifecycle
1. Authenticate with a permitted admin test account.
2. Confirm dashboard and PIM access.
3. Create a uniquely named employee and retain the generated employee number.
4. Read the employee record through the authenticated API context and verify identity fields.
5. Update the first name and verify both UI state and API persistence.
6. Search for the updated employee and delete it.
7. Verify deletion using the UI confirmation and follow-up API response.

## Risk controls
- Use an isolated tenant with seeded test users for repeatable evaluation.
- Do not run concurrent destructive tests against a shared public demo.
- If a test fails, inspect trace/video/screenshot and the first failing assertion before increasing timeouts or retries.
- Validate endpoint schema and status codes against the actual application version.

## Role-based testing
Use an account with a known restricted role and assert the documented access policy (hidden navigation, denied direct route, or server-side 403). UI hiding alone is not sufficient authorization proof; API/server-side enforcement should be checked when the application exposes an appropriate endpoint.
