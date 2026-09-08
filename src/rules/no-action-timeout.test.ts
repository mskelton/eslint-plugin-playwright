import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-action-timeout.js'

const messageId = 'noActionTimeout'

runRuleTester('no-action-timeout', rule, {
  invalid: [
    {
      code: test('await page.locator("button").click({ timeout: 5000 })'),
      errors: [{ column: 65, endColumn: 78, line: 1, messageId }],
    },
    {
      code: test('await page.locator("button").click({ ["timeout"]: 5000 })'),
      errors: [{ column: 65, endColumn: 82, line: 1, messageId }],
    },
    {
      code: test('await page.locator("button").click({ [`timeout`]: 5000 })'),
      errors: [{ column: 65, endColumn: 82, line: 1, messageId }],
    },
    {
      code: test('await page.locator("input").fill("hello", { timeout: 5000 })'),
      errors: [{ column: 72, endColumn: 85, line: 1, messageId }],
    },
    {
      code: test('await page.locator("checkbox").check({ force: true, timeout: 1000 })'),
      errors: [{ column: 80, endColumn: 93, line: 1, messageId }],
    },
    {
      code: test('await page.locator("checkbox").uncheck({ timeout: 0 })'),
      errors: [{ column: 69, endColumn: 79, line: 1, messageId }],
    },
    {
      code: test(
        'await page.locator("select").selectOption({ label: "Blue" }, { timeout: TIMEOUT })',
      ),
      errors: [{ column: 91, endColumn: 107, line: 1, messageId }],
    },
    {
      code: test('await page.getByRole("button").hover({ timeout: 200 })'),
      errors: [{ column: 67, endColumn: 79, line: 1, messageId }],
    },
    {
      code: test('await page.dragAndDrop("#a", "#b", { timeout: 200 })'),
      errors: [{ column: 65, endColumn: 77, line: 1, messageId }],
    },
    {
      code: test(`
        const button = page.locator("button")
        await button.dblclick({ timeout: 500 })
      `),
      errors: [{ column: 33, endColumn: 45, endLine: 3, line: 3, messageId }],
    },
    {
      code: test('await page.locator("input").pressSequentially("abc", { timeout: 500 })'),
      errors: [{ column: 83, endColumn: 95, line: 1, messageId }],
    },
    {
      code: test('await page.locator("button").click({ timeout: 5000 })'),
      errors: [{ column: 65, endColumn: 78, line: 1, messageId }],
      options: [{ allow: ['fill'] }],
    },
    {
      code: `it('test', async () => { await page.locator("button").click({ timeout: 1 }) })`,
      errors: [{ column: 63, endColumn: 73, line: 1, messageId }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    test('await page.locator("button").click()'),
    test('await page.locator("input").fill("hello")'),
    test('await page.locator("checkbox").check({ force: true })'),
    test('await page.locator("select").selectOption({ label: "Blue" })'),
    // Non-action methods are allowed to have timeouts
    test('await page.goto("https://example.com", { timeout: 5000 })'),
    test('await page.waitForSelector(".foo", { timeout: 5000 })'),
    test('await expect(page.locator("button")).toBeVisible({ timeout: 5000 })'),
    test('await page.locator("button").waitFor({ timeout: 5000 })'),
    test('await page.screenshot({ timeout: 5000 })'),
    // Timeout is not in the options object
    test('await page.locator("button").click({ ...options })'),
    test('await page.locator("input").fill(timeout)'),
    // Allowed methods
    {
      code: test('await page.locator("input").fill("hello", { timeout: 5000 })'),
      options: [{ allow: ['fill'] }],
    },
  ],
})
