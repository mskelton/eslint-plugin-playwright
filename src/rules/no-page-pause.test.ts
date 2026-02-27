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
    {
      code: test('page.pause()'),
      errors: [{ column: 28, endColumn: 40, line: 1, messageId }],
      name: 'page.pause() without await',
    },
    {
      code: test('this.page.pause()'),
      errors: [{ column: 28, endColumn: 45, line: 1, messageId }],
      name: 'this.page.pause() without await',
    },
    {
      code: test('await frame.pause()'),
      errors: [{ column: 34, endColumn: 47, line: 1, messageId }],
      name: 'frame.pause() is also caught',
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
