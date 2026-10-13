export function uniqueEmployee() {
  const stamp = Date.now().toString().slice(-7);
  return { firstName: `QA${stamp}`, middleName: 'Automation', lastName: `User${stamp}` };
}
