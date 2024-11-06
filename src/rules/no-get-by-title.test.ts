import rule from '../../src/rules/no-get-by-title.js'
import { runRuleTester, test } from '../utils/rule-tester.js'

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
  ],
  valid: [
    test('await page.locator("[title=lorem ipsum]")'),
    test('await page.getByRole("button")'),
  ],
})
