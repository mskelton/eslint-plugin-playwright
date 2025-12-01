import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-page-pause.js'

const messageId = 'noPagePause'

runRuleTester('no-page-pause', rule, {
  invalid: [
    {
      code: test('await page.pause()'),
      errors: [{ column: 34, endColumn: 46, line: 1, messageId }],
    },
    {
      code: test('await this.page.pause()'),
      errors: [{ column: 34, endColumn: 51, line: 1, messageId }],
    },
    {
      code: test('await page["pause"]()'),
      errors: [{ column: 34, endColumn: 49, line: 1, messageId }],
    },
    {
      code: test('await page[`pause`]()'),
      errors: [{ column: 34, endColumn: 49, line: 1, messageId }],
    },
  ],
  valid: [
    test('await page.click()'),
    test('await this.page.click()'),
    test('await page["hover"]()'),
    test('await page[`check`]()'),
    test('await expect(page).toBePaused()'),
  ],
})
