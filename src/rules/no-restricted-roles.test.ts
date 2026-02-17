import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-restricted-roles.js'

runRuleTester('no-restricted-roles', rule, {
  invalid: [
    // String array format
    {
      code: test('await page.getByRole("progressbar")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 63,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar']],
    },
    {
      code: test('await this.page.getByRole("progressbar")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 68,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar']],
    },
    {
      code: test('await page["getByRole"]("progressbar")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 66,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar']],
    },
    {
      code: test('await page[`getByRole`]("progressbar")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 66,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar']],
    },
    {
      code: test('await frame.getByRole("progressbar")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 64,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar']],
    },
    // Multiple restrictions
    {
      code: test('await page.getByRole("progressbar"); await page.getByRole("alert")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 63,
          line: 1,
          messageId: 'restricted',
        },
        {
          column: 71,
          data: { message: '', role: 'alert' },
          endColumn: 94,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar', 'alert']],
    },
    // Object array format
    {
      code: test('await page.getByRole("progressbar")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 63,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [[{ role: 'progressbar' }]],
    },
    {
      code: test('await page.getByRole("progressbar")'),
      errors: [
        {
          column: 34,
          data: {
            message:
              'Progressbar assertions are flaky. Assert on the actual content change instead.',
            role: 'progressbar',
          },
          endColumn: 63,
          line: 1,
          messageId: 'restrictedWithMessage',
        },
      ],
      options: [
        [
          {
            message:
              'Progressbar assertions are flaky. Assert on the actual content change instead.',
            role: 'progressbar',
          },
        ],
      ],
    },
    // Mixed format
    {
      code: test('await page.getByRole("progressbar"); await page.getByRole("alert")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 63,
          line: 1,
          messageId: 'restricted',
        },
        {
          column: 71,
          data: {
            message: 'Prefer asserting on specific content',
            role: 'alert',
          },
          endColumn: 94,
          line: 1,
          messageId: 'restrictedWithMessage',
        },
      ],
      options: [
        [
          'progressbar',
          {
            message: 'Prefer asserting on specific content',
            role: 'alert',
          },
        ],
      ],
    },
    // Different roles
    {
      code: test('await page.getByRole("alert")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'alert' },
          endColumn: 57,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['alert']],
    },
    {
      code: test('await page.getByRole("status")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'status' },
          endColumn: 58,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['status']],
    },
    {
      code: test('await page.getByRole("img")'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'img' },
          endColumn: 55,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['img']],
    },
    // With options object (role with name)
    {
      code: test('await page.getByRole("progressbar", { name: "Loading" })'),
      errors: [
        {
          column: 34,
          data: { message: '', role: 'progressbar' },
          endColumn: 84,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [['progressbar']],
    },
  ],
  valid: [
    // No restrictions configured
    test('await page.getByRole("button")'),
    test('await page.getByRole("progressbar")'),
    // Empty array
    {
      code: test('await page.getByRole("progressbar")'),
      options: [[]],
    },
    // Roles not in restrictions
    {
      code: test('await page.getByRole("button")'),
      options: [['progressbar']],
    },
    {
      code: test('await page.getByRole("heading")'),
      options: [['progressbar']],
    },
    // Other valid roles
    test('await page.getByRole("link")'),
    test('await page.getByRole("textbox")'),
    test('await page.getByRole("checkbox")'),
    // Other locator methods
    test('await page.getByTestId("progressbar")'),
    test('await page.getByText("Loading...")'),
    test('await page.locator("[role=progressbar]")'),
    // Chained calls
    test('const section = page.getByRole("region"); section.getByRole("button")'),
    // Variable reference for role (not string literal - can't determine value)
    test('const role = "progressbar"; await page.getByRole(role)'),
  ],
})
