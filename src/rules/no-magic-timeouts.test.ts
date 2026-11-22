import dedent from 'dedent'
import { Linter } from 'eslint'
import { expect, it } from 'vitest'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-magic-timeouts.js'

runRuleTester('no-magic-timeouts', rule, {
  invalid: [
    // Defaults on budget-named bindings
    {
      code: `async function waitUntilVisible(locator, timeout = 15_000) {}`,
      errors: [{ data: { value: '15_000' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    {
      code: `async function open({ budgetMs = 2 * 60_000 } = {}) {}`,
      errors: [{ data: { value: '2 * 60_000' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    {
      code: `const settle = (ms = 400) => page.waitForTimeout(ms)`,
      errors: [{ data: { value: '400' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    {
      code: `const { navigationTimeout = 30000 } = options`,
      errors: [{ data: { value: '30000' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    // Matching is case-insensitive
    {
      code: `function f(TIMEOUT = 5000, WaitMs = 100) {}`,
      errors: [{ messageId: 'noMagicTimeout' }, { messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    // Renamed destructuring is matched by its key, via `properties`
    {
      code: `function wait(locator, { timeout: limit = 15_000 } = {}) {}`,
      errors: [{ data: { value: '15_000' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    // Object-literal defaults that are forwarded as options
    {
      code: `function wait(locator, options = { timeout: 15_000 }) {}`,
      errors: [{ data: { value: '15_000' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    {
      code: `function open({ timeout } = { timeout: 15_000 }) {}`,
      errors: [{ data: { value: '15_000' }, messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    // Other binding contexts
    {
      code: dedent`
        ;({ timeout = 5000 } = opts)
        const [waitMs = 250] = list
        class Page { constructor(timeout = 5000) {} }
      `,
      errors: [
        { messageId: 'noMagicTimeout' },
        { messageId: 'noMagicTimeout' },
        { messageId: 'noMagicTimeout' },
      ],
      options: [{ checkDefaults: true }],
    },
    // The scope widens beyond Playwright calls once enabled
    {
      code: `function wait({ timeout = 5000 } = {}) {}`,
      errors: [{ messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true }],
    },
    // Custom name pattern
    {
      code: `function poll(fn, deadline = 5000) {}`,
      errors: [{ messageId: 'noMagicTimeout' }],
      options: [{ checkDefaults: true, parameterNames: '^deadline$' }],
    },
    // Defaults count towards minOccurrences alongside options
    {
      code: dedent`
        async function waitFor(page, timeout = 15_000) {
          await page.getByTestId('total').waitFor({ timeout: 15_000 })
        }
      `,
      errors: [
        { messageId: 'repeatedMagicTimeout' },
        { messageId: 'repeatedMagicTimeout' },
      ],
      options: [{ checkDefaults: true, minOccurrences: 2 }],
    },
    // Action options
    {
      code: test(`await page.getByRole('button').click({ timeout: 5000 })`),
      errors: [
        {
          column: 84,
          data: { value: '5000' },
          line: 1,
          messageId: 'noMagicTimeout',
        },
      ],
    },
    // Assertion options
    {
      code: test(`await expect(page.getByText('Done')).toBeVisible({ timeout: 10_000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // expect.toPass
    {
      code: test(`await expect(async () => {}).toPass({ timeout: 15000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // Navigation options
    {
      code: test(`await page.goto('/', { timeout: 60000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // Arithmetic is still magic
    {
      code: test(`await page.waitForURL('/done', { timeout: 30 * 1000 })`),
      errors: [{ data: { value: '30 * 1000' }, messageId: 'noMagicTimeout' }],
    },
    {
      code: test(`await page.waitForURL('/done', { timeout: 2 * 60 * 1000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // Quoted property key
    {
      code: test(`await page.getByRole('button').click({ 'timeout': 5000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // Computed string key
    {
      code: test(`await page.getByRole('button').click({ ['timeout']: 5000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // test.setTimeout
    {
      code: test(`test.setTimeout(120000)`),
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    {
      code: dedent`
        test('example', async ({ page }, testInfo) => {
          testInfo.setTimeout(120000)
        })
      `,
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // Test-level options object
    {
      code: `test('example', { timeout: 90000 }, async ({ page }) => {})`,
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // describe.configure
    {
      code: `test.describe.configure({ timeout: 90000 })`,
      errors: [{ messageId: 'noMagicTimeout' }],
    },
    // test.use
    {
      code: `test.use({ actionTimeout: 5000 })`,
      errors: [{ messageId: 'noMagicTimeout' }],
      options: [{ properties: ['actionTimeout'] }],
    },
    // A value outside the allow list is still reported
    {
      code: test(`await page.getByRole('button').click({ timeout: 5000 })`),
      errors: [{ messageId: 'noMagicTimeout' }],
      options: [{ allow: [0] }],
    },
    // Global alias
    {
      code: `it('example', { timeout: 90000 }, async ({ page }) => {})`,
      errors: [{ messageId: 'noMagicTimeout' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
    // A page object is exactly where waits concentrate, and is not gated out
    {
      code: dedent`
        export class CheckoutPage {
          constructor(page) {
            this.page = page
          }

          async waitForTotal() {
            await this.page.getByTestId('total').waitFor({ timeout: 15_000 })
          }
        }
      `,
      errors: [{ column: 61, endColumn: 67, line: 7, messageId: 'noMagicTimeout' }],
    },
    // minOccurrences reports every site once the threshold is met
    {
      code: dedent`
        async function waitForBoth(page) {
          await page.getByTestId('spinner').waitFor({ timeout: 15_000 })
          await page.getByTestId('total').waitFor({ timeout: 15_000 })
        }
      `,
      errors: [
        { data: { count: '2', value: '15_000' }, line: 2, messageId: 'repeatedMagicTimeout' },
        { data: { count: '2', value: '15_000' }, line: 3, messageId: 'repeatedMagicTimeout' },
      ],
      options: [{ minOccurrences: 2 }],
    },
    // Values are grouped by what they evaluate to, not how they are written
    {
      code: dedent`
        async function waitForBoth(page) {
          await page.getByTestId('spinner').waitFor({ timeout: 15_000 })
          await page.getByTestId('total').waitFor({ timeout: 15 * 1000 })
        }
      `,
      errors: [
        { data: { count: '2', value: '15_000' }, line: 2, messageId: 'repeatedMagicTimeout' },
        { data: { count: '2', value: '15 * 1000' }, line: 3, messageId: 'repeatedMagicTimeout' },
      ],
      options: [{ minOccurrences: 2 }],
    },
  ],
  valid: [
    // Named constants are the point of the rule
    test(`await page.getByRole('button').click({ timeout: TIMEOUTS.short })`),
    test(`await page.getByRole('button').click({ timeout: SHORT_TIMEOUT })`),
    test(`await expect(page.getByText('Done')).toBeVisible({ timeout: LONG })`),
    test(`test.setTimeout(LONG_TIMEOUT)`),
    dedent`
      const NAVIGATION_TIMEOUT = 60_000
      test('example', async ({ page }) => {
        await page.goto('/', { timeout: NAVIGATION_TIMEOUT })
      })
    `,
    // Relying on the global config is also fine
    test(`await page.getByRole('button').click()`),
    test(`await expect(page.getByText('Done')).toBeVisible()`),
    // A named options object gives the value a name already
    dedent`
      const options = { timeout: 5000 }
      test('example', async ({ page }) => {
        await page.getByRole('button').click(options)
      })
    `,
    // The config file is where timeouts belong
    dedent`
      export default defineConfig({
        expect: { timeout: 10_000 },
        timeout: 30_000,
        use: { actionTimeout: 5_000 },
      })
    `,
    `export default { timeout: 30_000 }`,
    // Unrelated properties
    test(`await page.getByRole('button').click({ force: true })`),
    test(`await page.getByRole('button').click({ delay: 100 })`),
    // Explicitly allowed values
    {
      code: test(`await page.getByRole('button').click({ timeout: 0 })`),
      options: [{ allow: [0] }],
    },
    {
      code: test(`await page.goto('/', { timeout: 60_000 })`),
      options: [{ allow: [60000] }],
    },
    // Non-numeric timeout values are left to other rules
    test(`await page.getByRole('button').click({ timeout: opts.timeout })`),
    test(`await page.getByRole('button').click({ ...defaults })`),
    test(`await page.getByRole('button').click({ [key]: 5000 })`),
    // Below the minOccurrences threshold
    {
      code: test(`await page.getByRole('button').click({ timeout: 15_000 })`),
      options: [{ minOccurrences: 2 }],
    },
    // Distinct values never accumulate towards the threshold
    {
      code: dedent`
        async function waitForBoth(page) {
          await page.getByTestId('spinner').waitFor({ timeout: 15_000 })
          await page.getByTestId('total').waitFor({ timeout: 45_000 })
        }
      `,
      options: [{ minOccurrences: 2 }],
    },
    // Allowed values are excluded before they are counted
    {
      code: dedent`
        async function waitForBoth(page) {
          await page.getByTestId('spinner').waitFor({ timeout: 15_000 })
          await page.getByTestId('total').waitFor({ timeout: 15_000 })
        }
      `,
      options: [{ allow: [15000], minOccurrences: 2 }],
    },
    // Not a Playwright timeout at all
    `function wait({ timeout = 5000 } = {}) {}`,
    // checkDefaults: names that are not budgets
    {
      code: `function at(nowMs = 0, closedAtMs = 1700000000000, waitForIdle = 1) {}`,
      options: [{ checkDefaults: true }],
    },
    // checkDefaults: counts and non-duration names are not budgets
    {
      code: dedent`
        function f(retryBudget = 3, budget = 500, maxTimeouts = 2, timeoutRetries = 3) {}
        function click(el, delay = 100) {}
      `,
      options: [{ checkDefaults: true }],
    },
    // checkDefaults: defaults inside defineConfig() are exempt
    {
      code: `export default defineConfig({ projects: targets.map(({ name, timeout = 30_000 }) => ({ name, timeout })) })`,
      options: [{ checkDefaults: true }],
    },
    // checkDefaults: object-literal defaults are ignored when disabled
    `function wait(locator, options = { timeout: 15_000 }) {}`,
    // parameterNames is not compiled unless checkDefaults is on
    {
      code: `const a = 1`,
      options: [{ parameterNames: '(' }],
    },
    // checkDefaults: non-literal and allowed defaults
    {
      code: `function open(timeout = DEFAULT_TIMEOUT, delay = 2 * BASE) {}`,
      options: [{ checkDefaults: true }],
    },
    {
      code: `function open(timeout = 0) {}`,
      options: [{ allow: [0], checkDefaults: true }],
    },
  ],
})

it('reports an invalid parameterNames pattern clearly', () => {
  const linter = new Linter({ configType: 'flat' })
  expect(() =>
    linter.verify('function f(timeout = 1) {}', {
      plugins: { p: { rules: { r: rule } } },
      rules: { 'p/r': ['error', { checkDefaults: true, parameterNames: '(' }] },
    }),
  ).toThrow(/no-magic-timeouts: invalid `parameterNames` pattern/)
})

it('rejects an empty parameterNames pattern', () => {
  const linter = new Linter({ configType: 'flat' })
  expect(() =>
    linter.verify('const a = 1', {
      plugins: { p: { rules: { r: rule } } },
      rules: { 'p/r': ['error', { checkDefaults: true, parameterNames: '' }] },
    }),
  ).toThrow(/should NOT be shorter than 1 character/)
})

function test(input: string) {
  return `test('test', async ({ page }) => { ${input} })`
}
