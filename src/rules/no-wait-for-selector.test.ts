import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-wait-for-selector.js'

const messageId = 'noWaitForSelector'

runRuleTester('no-wait-for-selector', rule, {
  invalid: [
    {
      code: 'async function fn() { await page.waitForSelector(".bar") }',
      errors: [
        {
          column: 29,
          endColumn: 57,
          endLine: 1,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await this.page.waitForSelector(".bar") }',
      errors: [
        {
          column: 29,
          endColumn: 62,
          endLine: 1,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await page["waitForSelector"](".bar") }',
      errors: [
        {
          column: 29,
          endColumn: 60,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await page[`waitForSelector`](".bar") }',
      errors: [
        {
          column: 29,
          endColumn: 60,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { return page.waitForSelector(".bar"); }',
      errors: [
        {
          column: 30,
          endColumn: 58,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { page.waitForSelector(".bar"); }',
      errors: [
        {
          column: 23,
          endColumn: 51,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: '(async function() { await page.waitForSelector("#foo"); })();',
      errors: [
        {
          column: 27,
          endColumn: 55,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForSelector',
              output: '(async function() {  })();',
            },
          ],
        },
      ],
    },
    {
      code: 'page.waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 29,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'page["waitForSelector"]("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 32,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'page[`waitForSelector`]("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 32,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'foo.page().waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 35,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'this.foo().page().waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 42,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'page2.waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 30,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'this.page2.waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 35,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'myPage.waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 31,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
    {
      code: 'this.myPage.waitForSelector("#foo")',
      errors: [
        {
          column: 1,
          endColumn: 36,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForSelector', output: '' }],
        },
      ],
    },
  ],
  valid: [
    'function waitForSelector() {}',
    'async function fn() { await waitForSelector("#foo"); }',
    'async function fn() { await this.foo.waitForSelector("#foo"); }',
    '(async function() { await page.waitForTimeout(2000); })();',
    'page.waitForTimeout(2000);',
    'page["waitForTimeout"](2000);',
    'rampage.waitForSelector("#foo");',
    'myPage2.waitForSelector("#foo");',
  ],
})
