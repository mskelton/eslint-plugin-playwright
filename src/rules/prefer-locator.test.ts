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
    {
      code: test(`await page.hover('button')`),
      errors: [{ column: 34, endColumn: 54, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.hover should be flagged',
      output: null,
    },
    {
      code: test(`await page.press('input', 'Enter')`),
      errors: [{ column: 34, endColumn: 62, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.press should be flagged',
      output: null,
    },
    {
      code: test(`await page.textContent('div')`),
      errors: [{ column: 34, endColumn: 57, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.textContent should be flagged',
      output: null,
    },
    {
      code: test(`await page.isVisible('div')`),
      errors: [{ column: 34, endColumn: 55, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.isVisible should be flagged',
      output: null,
    },
    {
      code: test(`await page.selectOption('select', 'value')`),
      errors: [{ column: 34, endColumn: 70, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.selectOption should be flagged',
      output: null,
    },
    {
      code: test(`await page.tap('button')`),
      errors: [{ column: 34, endColumn: 52, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.tap should be flagged',
      output: null,
    },
    {
      code: test(`await page.focus('input')`),
      errors: [{ column: 34, endColumn: 53, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.focus should be flagged',
      output: null,
    },
    {
      code: test(`await page.getAttribute('div', 'id')`),
      errors: [{ column: 34, endColumn: 64, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.getAttribute should be flagged',
      output: null,
    },
    {
      code: test(`await page.innerHTML('div')`),
      errors: [{ column: 34, endColumn: 55, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.innerHTML should be flagged',
      output: null,
    },
    {
      code: test(`await page.innerText('div')`),
      errors: [{ column: 34, endColumn: 55, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.innerText should be flagged',
      output: null,
    },
    {
      code: test(`await page.inputValue('input')`),
      errors: [{ column: 34, endColumn: 58, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.inputValue should be flagged',
      output: null,
    },
    {
      code: test(`await page.isChecked('input')`),
      errors: [{ column: 34, endColumn: 57, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.isChecked should be flagged',
      output: null,
    },
    {
      code: test(`await page.isDisabled('button')`),
      errors: [{ column: 34, endColumn: 59, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.isDisabled should be flagged',
      output: null,
    },
    {
      code: test(`await page.isEditable('input')`),
      errors: [{ column: 34, endColumn: 58, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.isEditable should be flagged',
      output: null,
    },
    {
      code: test(`await page.isEnabled('button')`),
      errors: [{ column: 34, endColumn: 58, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.isEnabled should be flagged',
      output: null,
    },
    {
      code: test(`await page.isHidden('div')`),
      errors: [{ column: 34, endColumn: 54, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.isHidden should be flagged',
      output: null,
    },
    {
      code: test(`await page.dispatchEvent('div', 'click')`),
      errors: [{ column: 34, endColumn: 68, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.dispatchEvent should be flagged',
      output: null,
    },
    {
      code: test(`await page.setChecked('input', true)`),
      errors: [{ column: 34, endColumn: 64, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.setChecked should be flagged',
      output: null,
    },
    {
      code: test(`await page.setInputFiles('input', 'file.txt')`),
      errors: [{ column: 34, endColumn: 73, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.setInputFiles should be flagged',
      output: null,
    },
    {
      code: test(`await page.uncheck('input')`),
      errors: [{ column: 34, endColumn: 55, endLine: 1, line: 1, messageId: 'preferLocator' }],
      name: 'page.uncheck should be flagged',
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
