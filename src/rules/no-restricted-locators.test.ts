import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-restricted-locators.js'

const restrictedMessageId = 'restricted'
const restrictedWithMessageMessageId = 'restrictedWithMessage'

runRuleTester('no-restricted-locators', rule, {
  invalid: [
    // String array format
    {
      code: test('await page.getByTestId("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 60,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByTestId']],
    },
    {
      code: test('await this.page.getByTestId("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 65,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByTestId']],
    },
    {
      code: test('await page["getByTestId"]("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 63,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByTestId']],
    },
    {
      code: test('await page[`getByTestId`]("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 63,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByTestId']],
    },
    {
      code: test('await frame.getByTestId("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 61,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByTestId']],
    },
    // Multiple restrictions
    {
      code: test('await page.getByTestId("btn"); await page.getByTitle("tip")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 57,
          line: 1,
          messageId: restrictedMessageId,
        },
        {
          column: 65,
          data: { message: '', method: 'getByTitle' },
          endColumn: 87,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByTestId', 'getByTitle']],
    },
    // Object array format
    {
      code: test('await page.getByTestId("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 60,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [[{ type: 'getByTestId' }]],
    },
    {
      code: test('await page.getByTestId("button")'),
      errors: [
        {
          column: 34,
          data: {
            message: 'Prefer getByRole or getByLabel instead',
            method: 'getByTestId',
          },
          endColumn: 60,
          line: 1,
          messageId: restrictedWithMessageMessageId,
        },
      ],
      options: [
        [
          {
            message: 'Prefer getByRole or getByLabel instead',
            type: 'getByTestId',
          },
        ],
      ],
    },
    // Mixed format
    {
      code: test('await page.getByTestId("btn"); await page.getByTitle("tip")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByTestId' },
          endColumn: 57,
          line: 1,
          messageId: restrictedMessageId,
        },
        {
          column: 65,
          data: {
            message: 'Prefer getByRole or getByLabel instead',
            method: 'getByTitle',
          },
          endColumn: 87,
          line: 1,
          messageId: restrictedWithMessageMessageId,
        },
      ],
      options: [
        [
          'getByTestId',
          {
            message: 'Prefer getByRole or getByLabel instead',
            type: 'getByTitle',
          },
        ],
      ],
    },
    // Different locator methods
    {
      code: test('await page.getByAltText("logo")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByAltText' },
          endColumn: 59,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByAltText']],
    },
    {
      code: test('await page.getByPlaceholder("Email")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByPlaceholder' },
          endColumn: 64,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByPlaceholder']],
    },
    {
      code: test('await page.getByLabel("Email")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByLabel' },
          endColumn: 58,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByLabel']],
    },
    {
      code: test('await page.getByRole("button")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByRole' },
          endColumn: 58,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByRole']],
    },
    {
      code: test('await page.getByText("Submit")'),
      errors: [
        {
          column: 34,
          data: { message: '', method: 'getByText' },
          endColumn: 58,
          line: 1,
          messageId: restrictedMessageId,
        },
      ],
      options: [['getByText']],
    },
  ],
  valid: [
    // No restrictions configured
    test('await page.getByTestId("button")'),
    test('await page.getByTitle("tooltip")'),
    // Empty array
    {
      code: test('await page.getByTestId("button")'),
      options: [[]],
    },
    // Methods not in restrictions
    {
      code: test('await page.getByTestId("button")'),
      options: [['getByTitle']],
    },
    {
      code: test('await page.getByTitle("tooltip")'),
      options: [['getByTestId']],
    },
    // Other valid methods
    test('await page.getByRole("button")'),
    test('await page.getByText("Submit")'),
    test('await page.getByLabel("Email")'),
    test('await page.locator(".btn")'),
    test('await page.click()'),
    // Chained calls
    test(
      'const section = page.getByRole("section"); section.getByRole("button")',
    ),
    // Variable references
    test(
      'const button = page.getByRole("button", { name: "common button" }); page.locator(button)',
    ),
  ],
})
