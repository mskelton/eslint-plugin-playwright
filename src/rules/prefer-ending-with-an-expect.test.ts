import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-ending-with-an-expect.js'

runRuleTester('prefer-ending-with-an-expect', rule, {
  invalid: [
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await expect(page.locator('.foo')).toBeVisible()
          await page.click('.bar')
        })
      `,
      errors: [{ column: 1, endColumn: 5, line: 1, messageId: 'mustEndWithExpect' }],
    },
    {
      code: `test('foo', async ({ page }) => {})`,
      errors: [{ messageId: 'mustEndWithExpect' }],
    },
    {
      code: `test('foo', async ({ page }) => page.click('.bar'))`,
      errors: [{ messageId: 'mustEndWithExpect' }],
    },
    // Modifiers and tag options still resolve to a test
    {
      code: dedent`
        test.only('foo', { tag: '@slow' }, async ({ page }) => {
          await page.click('.bar')
        })
      `,
      errors: [{ column: 1, endColumn: 10, line: 1, messageId: 'mustEndWithExpect' }],
    },
    // A trailing step that doesn't end with an assertion
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await test.step('bar', async () => {
            await page.click('.bar')
          })
        })
      `,
      errors: [{ messageId: 'mustEndWithExpect' }],
    },
    // A custom assertion function that isn't configured
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await assertFoo(page)
        })
      `,
      errors: [{ messageId: 'mustEndWithExpect' }],
    },
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await assertBar(page)
        })
      `,
      errors: [{ messageId: 'mustEndWithExpect' }],
      options: [{ assertFunctionNames: ['assertFoo'] }],
    },
    // Global aliases
    {
      code: dedent`
        it('foo', async ({ page }) => {
          await page.click('.bar')
        })
      `,
      errors: [{ messageId: 'mustEndWithExpect' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    dedent`
      test('foo', async ({ page }) => {
        await page.click('.bar')
        await expect(page.locator('.foo')).toBeVisible()
      })
    `,
    // Non-awaited assertions
    dedent`
      test('foo', () => {
        expect(1).toBe(1)
      })
    `,
    // Concise arrow body
    `test('foo', () => expect(1).toBe(1))`,
    // Soft and poll assertions
    dedent`
      test('foo', async ({ page }) => {
        await expect.soft(page.locator('.foo')).toBeVisible()
      })
    `,
    dedent`
      test('foo', async ({ page }) => {
        await expect.poll(() => page.title()).toBe('foo')
      })
    `,
    // Return statements are unwrapped by the last statement lookup
    dedent`
      test('foo', () => {
        return expect(1).toBe(1)
      })
    `,
    // A trailing step that ends with an assertion
    dedent`
      test('foo', async ({ page }) => {
        await test.step('bar', async () => {
          await expect(page.locator('.foo')).toBeVisible()
        })
      })
    `,
    // Nested steps
    dedent`
      test('foo', async ({ page }) => {
        await test.step('bar', async () => {
          await test.step('baz', async () => {
            await expect(page.locator('.foo')).toBeVisible()
          })
        })
      })
    `,
    // Tests without a body are skipped
    `test('foo')`,
    `test.skip('foo')`,
    // Hooks and describe blocks are not checked
    dedent`
      test.beforeEach(async ({ page }) => {
        await page.goto('/')
      })
    `,
    dedent`
      test.describe('foo', () => {
        test('bar', () => {
          expect(1).toBe(1)
        })
      })
    `,
    // Custom assertion functions
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await assertFoo(page)
        })
      `,
      options: [{ assertFunctionNames: ['assertFoo'] }],
    },
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await helpers.assertFoo(page)
        })
      `,
      options: [{ assertFunctionNames: ['assertFoo'] }],
    },
    {
      code: dedent`
        test('foo', async ({ page }) => {
          await assertFoo(page)
        })
      `,
      options: [{ assertFunctionPatterns: ['^assert'] }],
    },
  ],
})
