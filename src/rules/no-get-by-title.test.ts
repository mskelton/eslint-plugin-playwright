import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-get-by-title.js'

const messageId = 'noGetByTitle'

runRuleTester('no-get-by-title', rule, {
  invalid: [
    {
      code: test('await page.getByTitle("lorem ipsum")'),
      errors: [{ column: 34, endColumn: 64, line: 1, messageId }],
    },
    {
      code: test('await this.page.getByTitle("lorem ipsum")'),
      errors: [{ column: 34, endColumn: 69, line: 1, messageId }],
    },
    {
      code: test('await page.locator("div").getByTitle("lorem ipsum")'),
      errors: [{ column: 34, endColumn: 79, line: 1, messageId }],
      name: 'getByTitle on locator receiver is also flagged',
    },
  ],
  valid: [
    test('await page.locator("[title=lorem ipsum]")'),
    test('await page.getByRole("button")'),
  ],
})
