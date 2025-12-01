import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-wait-for-timeout.js'

const messageId = 'noWaitForTimeout'

runRuleTester('no-wait-for-timeout', rule, {
  invalid: [
    {
      code: 'async function fn() { await page.waitForTimeout(1000) }',
      errors: [
        {
          column: 29,
          endColumn: 54,
          endLine: 1,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await this.page.waitForTimeout(1000) }',
      errors: [
        {
          column: 29,
          endColumn: 59,
          endLine: 1,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await page["waitForTimeout"](1000) }',
      errors: [
        {
          column: 29,
          endColumn: 57,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await page[`waitForTimeout`](1000) }',
      errors: [
        {
          column: 29,
          endColumn: 57,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { return page.waitForTimeout(1000); }',
      errors: [
        {
          column: 30,
          endColumn: 55,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { page.waitForTimeout(1000); }',
      errors: [
        {
          column: 23,
          endColumn: 48,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: '(async function() { await page.waitForTimeout(500); })();',
      errors: [
        {
          column: 27,
          endColumn: 51,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForTimeout',
              output: '(async function() {  })();',
            },
          ],
        },
      ],
    },
    {
      code: 'page.waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 26,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'page["waitForTimeout"](2000)',
      errors: [
        {
          column: 1,
          endColumn: 29,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'page[`waitForTimeout`](2000)',
      errors: [
        {
          column: 1,
          endColumn: 29,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'foo.page().waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 32,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'this.foo().page().waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 39,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'page2.waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 27,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'this.page2.waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 32,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'myPage.waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 28,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
    {
      code: 'this.myPage.waitForTimeout(2000)',
      errors: [
        {
          column: 1,
          endColumn: 33,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForTimeout', output: '' }],
        },
      ],
    },
  ],
  valid: [
    'function waitForTimeout() {}',
    'async function fn() { await waitForTimeout(4343); }',
    'async function fn() { await this.foo.waitForTimeout(4343); }',
    '(async function() { await page.waitForSelector("#foo"); })();',
    'page.waitForSelector("#foo");',
    'page["waitForSelector"]("#foo");',
    'rampage.waitForTimeout(2000);',
    'myPage2.waitForTimeout(2000);',
  ],
})
