import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './prefer-locator.js'

runRuleTester('prefer-locator', rule, {
  invalid: [
    {
      code: test(`await page.fill('input[type="password"]', 'password')`),
      errors: [
        {
          column: 34,
          endColumn: 81,
          endLine: 1,
          line: 1,
          messageId: 'preferLocator',
        },
      ],
      output: null,
    },
    {
      code: test(`await page.dblclick('xpath=//button')`),
      errors: [
        {
          column: 34,
          endColumn: 65,
          endLine: 1,
          line: 1,
          messageId: 'preferLocator',
        },
      ],
      output: null,
    },
    {
      code: `page.click('xpath=//button')`,
      errors: [
        {
          column: 1,
          endColumn: 29,
          endLine: 1,
          line: 1,
          messageId: 'preferLocator',
        },
      ],
      output: null,
    },
    {
      code: test(`await page.frame('frame-name').click('css=button')`),
      errors: [
        {
          column: 34,
          endColumn: 78,
          endLine: 1,
          line: 1,
          messageId: 'preferLocator',
        },
      ],
      output: null,
    },
    {
      code: `page.frame('frame-name').click('css=button')`,
      errors: [
        {
          column: 1,
          endColumn: 45,
          endLine: 1,
          line: 1,
          messageId: 'preferLocator',
        },
      ],
      output: null,
    },
  ],
  valid: [
    {
      code: `const locator = page.locator('input[type="password"]')`,
    },
    {
      code: test(`await page.locator('input[type="password"]').fill('password')`),
    },
    {
      code: test(`await page.locator('xpath=//button').dblclick()`),
    },
    {
      code: `page.locator('xpath=//button').click()`,
    },
    {
      code: test(`await page.frameLocator('#my-iframe').locator('css=button').click()`),
    },
    {
      code: test(`await page.evaluate('1 + 2')`),
    },
    {
      code: `page.frame('frame-name')`,
    },
  ],
})
