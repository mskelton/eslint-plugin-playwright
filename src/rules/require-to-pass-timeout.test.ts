import { runRuleTester } from '../utils/rule-tester.js'
import rule from './require-to-pass-timeout.js'

runRuleTester('require-to-pass-timeout', rule, {
  invalid: [
    // No options
    {
      code: 'await expect(async () => { await foo() }).toPass();',
      errors: [{ column: 43, line: 1, messageId: 'addTimeoutOption' }],
    },
    // Empty options
    {
      code: 'await expect(async () => { await foo() }).toPass({});',
      errors: [{ column: 43, line: 1, messageId: 'addTimeoutOption' }],
    },
    // Options without timeout
    {
      code: 'await expect(async () => { await foo() }).toPass({ intervals: [1000] });',
      errors: [{ column: 43, line: 1, messageId: 'addTimeoutOption' }],
    },
    // With soft modifier
    {
      code: 'await expect.soft(async () => { await foo() }).toPass();',
      errors: [{ column: 48, line: 1, messageId: 'addTimeoutOption' }],
    },
    // With poll modifier
    {
      code: 'await expect.poll(async () => { await foo() }).toPass();',
      errors: [{ column: 48, line: 1, messageId: 'addTimeoutOption' }],
    },
    // Global aliases
    {
      code: 'await assert(async () => { await foo() }).toPass();',
      errors: [{ column: 43, line: 1, messageId: 'addTimeoutOption' }],
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    // With timeout
    'await expect(async () => { await foo() }).toPass({ timeout: 5000 });',
    // With timeout and intervals
    'await expect(async () => { await foo() }).toPass({ timeout: 5000, intervals: [1000] });',
    // With soft modifier and timeout
    'await expect.soft(async () => { await foo() }).toPass({ timeout: 5000 });',
    // Other matchers don't require timeout
    'await expect(locator).toBeVisible();',
    'expect(1).toBe(1);',
    // Global aliases
    {
      code: 'await assert(async () => { await foo() }).toPass({ timeout: 5000 });',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
