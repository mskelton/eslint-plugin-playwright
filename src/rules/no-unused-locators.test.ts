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
      name: 'locator called without usage',
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
      name: 'awaited locator called without usage. Playwright does not fail when a locator results in no elements found, by forcing it to be used in some way it may highlight issues.',
    },
  ],
  valid: [
    {
      code: `await page.getByRole('button', { name: 'Sign in' }).all()
      `,
      name: 'If a locator method is called and then not used, do not report it as unused (rule is not set up to handle)',
    },
    {
      code: "const btn = page.getByLabel('Sign in')",
      name: 'Result of locator assigned to a variable',
    },
    {
      code: "const btn = page.getByPlaceholder('User Name').first()",
      name: 'Result of locator assigned to a variable (chained method)',
    },
    {
      code: "await page.getByRole('button', { name: 'Sign in' }).click()",
      name: "Result of locator method action, awaited",
    },
    {
      code: "expect(page.getByTestId('User Name')).toBeVisible()",
      name: 'Result of non-awaited expect assertions are not reported as unused (expected to be caught by other rule missing-playwright-async)',
    },
    {
      code: "expect(page.getByRole('User Name').first()).toBeVisible()",
      name: 'Result of non-awaited expect assertions are not reported as unused (expected to be caught by other rule missing-playwright-async) (grandparent)',
    },
  ],
})
