import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-unused-locators.js'

runRuleTester('no-unused-locators', rule, {
  invalid: [
    {
      code: "page.getByRole('button', { name: 'Sign in' })",
      errors: [
        {
          column: 1,
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
    },
    {
      code: "await page.getByTestId('my-test-id')",
      errors: [
        {
          column: 7,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
    },
  ],
  valid: [
    `await page.getByRole('button', { name: 'Sign in' }).all()`,
    "const btn = page.getByLabel('Sign in')",
    "const btn = page.getByPlaceholder('User Name').first()",
    "await page.getByRole('button', { name: 'Sign in' }).click()",
    "expect(page.getByTestId('User Name')).toBeVisible()",
    "expect(page.getByRole('User Name').first()).toBeVisible()",
  ],
})
