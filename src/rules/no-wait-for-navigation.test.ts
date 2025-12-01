import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-wait-for-navigation.js'

const messageId = 'noWaitForNavigation'

runRuleTester('no-wait-for-navigation', rule, {
  invalid: [
    {
      code: `const navigationPromise = page.waitForNavigation();`,
      errors: [
        {
          column: 27,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'async function fn() { await page.waitForNavigation() }',
      errors: [
        {
          column: 29,
          endColumn: 53,
          endLine: 1,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await this.page.waitForNavigation() }',
      errors: [
        {
          column: 29,
          endColumn: 58,
          endLine: 1,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await page["waitForNavigation"]() }',
      errors: [
        {
          column: 29,
          endColumn: 56,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { await page[`waitForNavigation`]() }',
      errors: [
        {
          column: 29,
          endColumn: 56,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { return page.waitForNavigation(); }',
      errors: [
        {
          column: 30,
          endColumn: 54,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: 'async function fn() { page.waitForNavigation(); }',
      errors: [
        {
          column: 23,
          endColumn: 47,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: 'async function fn() {  }',
            },
          ],
        },
      ],
    },
    {
      code: '(async function() { await page.waitForNavigation(); })();',
      errors: [
        {
          column: 27,
          endColumn: 51,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'removeWaitForNavigation',
              output: '(async function() {  })();',
            },
          ],
        },
      ],
    },
    {
      code: 'page.waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 25,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'page["waitForNavigation"]()',
      errors: [
        {
          column: 1,
          endColumn: 28,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'page[`waitForNavigation`]()',
      errors: [
        {
          column: 1,
          endColumn: 28,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'foo.page().waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 31,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'this.foo().page().waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 38,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'page2.waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 26,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'this.page2.waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 31,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'myPage.waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 27,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'this.myPage.waitForNavigation()',
      errors: [
        {
          column: 1,
          endColumn: 32,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'page.waitForNavigation({ waitUntil: "load" })',
      errors: [
        {
          column: 1,
          endColumn: 46,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
    {
      code: 'page.waitForNavigation({ waitUntil: "domcontentloaded" })',
      errors: [
        {
          column: 1,
          endColumn: 58,
          line: 1,
          messageId,
          suggestions: [{ messageId: 'removeWaitForNavigation', output: '' }],
        },
      ],
    },
  ],
  valid: [
    'function waitForNavigation() {}',
    'async function fn() { await waitForNavigation(); }',
    'async function fn() { await this.foo.waitForNavigation(); }',
    '(async function() { await page.waitForSelector("#foo"); })();',
    'page.waitForSelector("#foo");',
    'page["waitForSelector"]("#foo");',
    'page.waitForTimeout(2000);',
    'page["waitForTimeout"](2000);',
    'rampage.waitForNavigation();',
    'myPage2.waitForNavigation();',
    'page.waitForLoadState("load");',
    'page.waitForLoadState("domcontentloaded");',
    'page.waitForLoadState("networkidle");',
  ],
})
