import { runRuleTester } from '../utils/rule-tester.js'
import rule from './require-soft-assertions.js'

const messageId = 'requireSoft'

runRuleTester('require-soft-assertions', rule, {
  invalid: [
    {
      code: 'expect(page).toHaveTitle("baz")',
      errors: [{ column: 1, endColumn: 7, line: 1, messageId }],
      output: 'expect.soft(page).toHaveTitle("baz")',
    },
    {
      code: 'expect(page.locator("foo")).toHaveText("bar")',
      errors: [{ column: 1, endColumn: 7, line: 1, messageId }],
      output: 'expect.soft(page.locator("foo")).toHaveText("bar")',
    },
    {
      code: 'await expect(page.locator("foo")).toHaveText("bar")',
      errors: [{ column: 7, endColumn: 13, line: 1, messageId }],
      output: 'await expect.soft(page.locator("foo")).toHaveText("bar")',
    },
    // Global aliases
    {
      code: 'assert(page).toHaveTitle("baz")',
      errors: [{ column: 1, endColumn: 7, line: 1, messageId }],
      output: 'assert.soft(page).toHaveTitle("baz")',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    'expect.soft(page).toHaveTitle("baz")',
    'expect.soft(page.locator("foo")).toHaveText("bar")',
    'expect["soft"](foo).toBe("bar")',
    'expect[`soft`](bar).toHaveText("bar")',
    'expect.poll(() => foo).toBe("bar")',
    'expect["poll"](() => foo).toBe("bar")',
    'expect[`poll`](() => foo).toBe("bar")',
    // Global aliases
    {
      code: 'assert.soft(page).toHaveTitle("baz")',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
