import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-raw-locators.js'

const messageId = 'noRawLocator'

runRuleTester('no-raw-locators', rule, {
  invalid: [
    {
      code: test('await page.locator()'),
      errors: [{ column: 34, endColumn: 48, line: 1, messageId }],
    },
    {
      code: test('const locator = await page.locator()'),
      errors: [{ column: 50, endColumn: 64, line: 1, messageId }],
    },
    {
      code: test('let locator = await page.locator()'),
      errors: [{ column: 48, endColumn: 62, line: 1, messageId }],
    },
    {
      code: test('await this.page.locator()'),
      errors: [{ column: 34, endColumn: 53, line: 1, messageId }],
    },
    {
      code: test("await page.locator('.btn')"),
      errors: [{ column: 34, endColumn: 54, line: 1, messageId }],
    },
    {
      code: test('await page["locator"](".btn")'),
      errors: [{ column: 34, endColumn: 57, line: 1, messageId }],
    },
    {
      code: test('await page[`locator`](".btn")'),
      errors: [{ column: 34, endColumn: 57, line: 1, messageId }],
    },

    {
      code: test('await frame.locator()'),
      errors: [{ column: 34, endColumn: 49, line: 1, messageId }],
    },

    {
      code: test('const section = await page.getByRole("section"); section.locator(".btn")'),
      errors: [{ column: 77, endColumn: 100, line: 1, messageId }],
    },
    {
      code: test('const button = page.locator(); page.locator(button)'),
      errors: [{ column: 43, endColumn: 57, line: 1, messageId }],
    },
    {
      code: test('await page.frameLocator("#frame").locator(".btn")'),
      errors: [{ column: 34, endColumn: 77, line: 1, messageId }],
      name: 'frameLocator().locator() chain should be flagged',
    },
    // Nested locators - variable-based
    {
      code: test('table.locator(".btn")'),
      errors: [{ column: 28, endColumn: 49, line: 1, messageId }],
    },
    {
      code: test('dialog.locator("#close")'),
      errors: [{ column: 28, endColumn: 52, line: 1, messageId }],
    },
    // Nested locators - chained
    {
      code: test('await page.getByRole("region").locator(".btn")'),
      errors: [{ column: 34, endColumn: 74, line: 1, messageId }],
    },
    {
      code: test('await page.locator(".container").locator(".btn")'),
      errors: [
        { column: 34, endColumn: 76, line: 1, messageId },
        { column: 34, endColumn: 60, line: 1, messageId },
      ],
    },
    {
      code: test('let button = page.locator(); page.locator(button)'),
      errors: [{ column: 41, endColumn: 55, line: 1, messageId }],
    },
    // Allowed
    {
      code: test('await page.locator("[aria-busy=false]")'),
      errors: [{ column: 34, endColumn: 67, line: 1, messageId }],
      options: [{ allowed: ['iframe'] }],
    },
    {
      code: test(`await page.locator('[aria-busy=false]')`),
      errors: [{ column: 34, endColumn: 67, line: 1, messageId }],
      options: [{ allowed: ['iframe'] }],
    },
    {
      code: test(`await page.locator("[aria-busy=false]")`),
      errors: [{ column: 34, endColumn: 67, line: 1, messageId }],
      options: [{ allowed: [`[aria-busy=true]`] }],
    },
    {
      code: test(`await page.locator("[aria-busy='false']")`),
      errors: [{ column: 34, endColumn: 69, line: 1, messageId }],
      options: [{ allowed: [`[aria-busy=true]`] }],
    },
  ],
  valid: [
    test('await page.click()'),
    test('await this.page.click()'),
    test('await page["hover"]()'),
    test('await page[`check`]()'),

    // Preferred user facing locators
    test('await page.getByText("lorem ipsum")'),
    test('await page.getByLabel(/Email/)'),
    test('await page.getByRole("button", { name: /submit/i })'),
    test('await page.getByTestId("my-test-button").click()'),
    test('await page.getByRole("button").filter({ hasText: "Add to cart" }).click()'),

    test('await frame.getByRole("button")'),

    test('const section = page.getByRole("section"); section.getByRole("button")'),

    // Variable references with proper locators
    test(
      'const button = page.getByRole("button", { name: "common button" }); page.locator(button)',
    ),
    test(
      'const firstButton = page.getByRole("region", { name: "first" }).locator(button); const secondButton = page.getByRole("region", { name: "second" }).locator(button)',
    ),

    // Nested locator with variable reference
    test('const button = page.getByRole("button"); page.getByRole("region").locator(button)'),
    test('table.locator(rowLocator)'),

    // bare calls
    test('() => page.locator'),

    // Allowed
    {
      code: test('await page.locator("iframe")'),
      options: [{ allowed: ['iframe'] }],
    },
    {
      code: test(`await page.locator("[aria-busy=false]")`),
      options: [{ allowed: [`[aria-busy=false]`] }],
    },
    {
      code: test(`await page.locator("[aria-busy='false']")`),
      options: [{ allowed: [`[aria-busy=false]`] }],
    },
    {
      code: test(`await page.locator('[aria-busy="false"]')`),
      options: [{ allowed: [`[aria-busy=false]`] }],
    },
    {
      code: test(`await page.locator("[aria-busy=false]")`),
      options: [{ allowed: [`[aria-busy='false']`] }],
    },
    {
      code: test(`await page.locator('[aria-busy=false]')`),
      options: [{ allowed: [`[aria-busy="false"]`] }],
    },
    {
      code: test(`await page.locator("[aria-busy='false']")`),
      options: [{ allowed: [`[aria-busy='false']`] }],
    },
    {
      code: test(`await page.locator('[aria-busy="false"]')`),
      options: [{ allowed: [`[aria-busy="false"]`] }],
    },
    {
      code: test(`await page.locator("[aria-busy='false']")`),
      options: [{ allowed: [`[aria-busy="false"]`] }],
    },
    {
      code: test(`await page.locator('[aria-busy="false"]')`),
      options: [{ allowed: [`[aria-busy='false']`] }],
    },
  ],
})
