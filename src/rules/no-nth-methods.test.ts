import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-nth-methods.js'

const messageId = 'noNthMethod'

runRuleTester('no-nth-methods', rule, {
  invalid: [
    // First
    {
      code: 'page.locator("button").first()',
      errors: [{ column: 24, endColumn: 31, line: 1, messageId }],
    },
    {
      code: 'frame.locator("button").first()',
      errors: [{ column: 25, endColumn: 32, line: 1, messageId }],
    },
    {
      code: 'foo.locator("button").first()',
      errors: [{ column: 23, endColumn: 30, line: 1, messageId }],
    },
    {
      code: 'foo.first()',
      errors: [{ column: 5, endColumn: 12, line: 1, messageId }],
    },

    // Last
    {
      code: 'page.locator("button").last()',
      errors: [{ column: 24, endColumn: 30, line: 1, messageId }],
    },
    {
      code: 'frame.locator("button").last()',
      errors: [{ column: 25, endColumn: 31, line: 1, messageId }],
    },
    {
      code: 'foo.locator("button").last()',
      errors: [{ column: 23, endColumn: 29, line: 1, messageId }],
    },
    {
      code: 'foo.last()',
      errors: [{ column: 5, endColumn: 11, line: 1, messageId }],
    },

    // nth
    {
      code: 'page.locator("button").nth(3)',
      errors: [{ column: 24, endColumn: 30, line: 1, messageId }],
    },
    {
      code: 'frame.locator("button").nth(3)',
      errors: [{ column: 25, endColumn: 31, line: 1, messageId }],
    },
    {
      code: 'foo.locator("button").nth(3)',
      errors: [{ column: 23, endColumn: 29, line: 1, messageId }],
    },
    {
      code: 'foo.nth(32)',
      errors: [{ column: 5, endColumn: 12, line: 1, messageId }],
    },
  ],
  valid: [
    'page',
    'page.locator("button")',
    'frame.locator("button")',
    'foo.locator("button")',

    'page.locator("button").click()',
    'frame.locator("button").click()',
    'foo.locator("button").click()',
    'foo.click()',
  ],
})
