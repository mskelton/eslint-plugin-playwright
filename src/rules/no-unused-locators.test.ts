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
    // page.locator() - the rule's primary target
    {
      code: "page.locator('.btn')",
      errors: [
        {
          column: 1,
          endColumn: 21,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused page.locator() should be flagged',
    },
    {
      code: "await page.locator('.btn')",
      errors: [
        {
          column: 7,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused awaited page.locator() should be flagged',
    },
    // getByAltText
    {
      code: "page.getByAltText('logo')",
      errors: [
        {
          column: 1,
          endColumn: 26,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused getByAltText should be flagged',
    },
    // Nested locators - variable-based
    {
      code: "table.getByRole('row')",
      errors: [
        {
          column: 1,
          endColumn: 23,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused variable-based nested getByRole should be flagged',
    },
    {
      code: "sidebar.locator('.nav-item')",
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused variable-based nested locator should be flagged',
    },
    // Nested locators - chained
    {
      code: "page.locator('.container').getByRole('button')",
      errors: [
        {
          column: 1,
          endColumn: 47,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused chained getByRole should be flagged',
    },
    {
      code: "page.getByRole('region').locator('.btn')",
      errors: [
        {
          column: 1,
          endColumn: 41,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused chained locator should be flagged',
    },
    // getByTitle
    {
      code: "page.getByTitle('heading')",
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 1,
          line: 1,
          messageId: 'noUnusedLocator',
        },
      ],
      name: 'Unused getByTitle should be flagged',
    },
  ],
  valid: [
    `await page.getByRole('button', { name: 'Sign in' }).all()`,
    "const btn = page.getByLabel('Sign in')",
    "const btn = page.getByPlaceholder('User Name').first()",
    "await page.getByRole('button', { name: 'Sign in' }).click()",
    "expect(page.getByTestId('User Name')).toBeVisible()",
    "expect(page.getByRole('User Name').first()).toBeVisible()",
    // page.locator() used correctly
    "const el = page.locator('.btn')",
    "await page.locator('.btn').click()",
    // Locator in return statement should not be flagged
    {
      code: "function fn() { return page.getByRole('button') }",
      name: 'Locator in return statement is not unused',
    },
    // Locator as function argument should not be flagged
    {
      code: "expect(page.locator('.btn')).toBeVisible()",
      name: 'Locator as function argument is not unused',
    },
    // Nested locators used correctly - variable-based
    "await table.getByRole('row').click()",
    "const item = sidebar.locator('.nav-item')",
    // Nested locators used correctly - chained
    "await page.locator('.container').getByRole('button').click()",
    "const btn = page.getByRole('region').getByRole('button')",
  ],
})
