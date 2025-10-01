import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-unused-locators.js'

runRuleTester('no-unused-locators', rule, {
  // todo there's a way to name tests for better identification
  invalid: [
    {
      code: "page.getByRole('button', { name: 'Sign in' })",
      errors:  [
        {
          column: 1,
          endColumn: 46,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator'
        }
      ],
    },
    // {
    //   code: "page.getByTestId('my-test-id)",
    //   errors:  [
    //     {
    //       column: 14,
    //       endColumn: 59,
    //       endLine: 1,
    //       line: 1,
    //       message: 'A locator is created but never used.',
    //       messageId: 'noUnusedLocator'
    //     }
    //   ],
    // },
  ],
  valid: [
    "const btn = page.getByRole('button', { name: 'Sign in' })",
    "await page.getByRole('button', { name: 'Sign in' }).click()",
    "await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()",
  ],
})
