import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-magic-timeouts.js'

runRuleTester('no-magic-timeouts', rule, {
  invalid: [
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
  ],
})

function test(input: string) {
  return `test('test', async ({ page }) => { ${input} })`
}
