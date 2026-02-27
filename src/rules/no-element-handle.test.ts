import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-element-handle.js'

runRuleTester('no-element-handle', rule, {
  invalid: [
    // element handle as const
    {
      code: test('const handle = await page.$("text=Submit");'),
      errors: [
        {
          column: 49,
          endColumn: 55,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('const handle = page.locator("text=Submit");'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await this.page.$("text=Submit");'),
      errors: [
        {
          column: 49,
          endColumn: 60,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('const handle = this.page.locator("text=Submit");'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await page["$$"]("text=Submit");'),
      errors: [
        {
          column: 49,
          endColumn: 59,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handle = page["locator"]("text=Submit");'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await page[`$$`]("text=Submit");'),
      errors: [
        {
          column: 49,
          endColumn: 59,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handle = page[`locator`]("text=Submit");'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await this.page.$$("text=Submit");'),
      errors: [
        {
          column: 49,
          endColumn: 61,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handle = this.page.locator("text=Submit");'),
            },
          ],
        },
      ],
    },
    // element handle as let
    {
      code: test('let handle = await page.$("text=Submit");'),
      errors: [
        {
          column: 47,
          endColumn: 53,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('let handle = page.locator("text=Submit");'),
            },
          ],
        },
      ],
    },
    // element handle as expression statement without await
    {
      code: test('page.$("div")'),
      errors: [
        {
          column: 28,
          endColumn: 34,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('page.locator("div")'),
            },
          ],
        },
      ],
    },
    // element handles as expression statement without await
    {
      code: test('page.$$("div")'),
      errors: [
        {
          column: 28,
          endColumn: 35,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('page.locator("div")'),
            },
          ],
        },
      ],
    },
    // element handle as expression statement
    {
      code: test('await page.$("div")'),
      errors: [
        {
          column: 34,
          endColumn: 40,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('page.locator("div")'),
            },
          ],
        },
      ],
    },
    // element handle click
    {
      code: test('await (await page.$$("div")).click();'),
      errors: [
        {
          column: 41,
          endColumn: 48,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('await (page.locator("div")).click();'),
            },
          ],
        },
      ],
    },
    // element handles as const
    {
      code: test('const handles = await page.$$("a")'),
      errors: [
        {
          column: 50,
          endColumn: 57,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handles = page.locator("a")'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await page["$$"]("a");'),
      errors: [
        {
          column: 49,
          endColumn: 59,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handle = page["locator"]("a");'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await page[`$$`]("a");'),
      errors: [
        {
          column: 49,
          endColumn: 59,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handle = page[`locator`]("a");'),
            },
          ],
        },
      ],
    },
    // element handles as let
    {
      code: test('let handles = await page.$$("a")'),
      errors: [
        {
          column: 48,
          endColumn: 55,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('let handles = page.locator("a")'),
            },
          ],
        },
      ],
    },
    // element handles as expression statement
    {
      code: test('await page.$$("a")'),
      errors: [
        {
          column: 34,
          endColumn: 41,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('page.locator("a")'),
            },
          ],
        },
      ],
    },
    // return element handle without awaiting it
    {
      code: test('function getHandle() { return page.$("button"); }'),
      errors: [
        {
          column: 58,
          endColumn: 64,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('function getHandle() { return page.locator("button"); }'),
            },
          ],
        },
      ],
    },
    // return element handles without awaiting it
    {
      code: test('function getHandle() { return page.$$("button"); }'),
      errors: [
        {
          column: 58,
          endColumn: 65,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('function getHandle() { return page.locator("button"); }'),
            },
          ],
        },
      ],
    },
    // missed return for the element handle
    {
      code: test('function getHandle() { page.$("button"); }'),
      errors: [
        {
          column: 51,
          endColumn: 57,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('function getHandle() { page.locator("button"); }'),
            },
          ],
        },
      ],
    },
    // arrow function return element handle without awaiting it
    {
      code: test('const getHandles = () => page.$("links");'),
      errors: [
        {
          column: 53,
          endColumn: 59,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('const getHandles = () => page.locator("links");'),
            },
          ],
        },
      ],
    },
    // arrow function return element handles without awaiting it
    {
      code: test('const getHandles = () => page.$$("links");'),
      errors: [
        {
          column: 53,
          endColumn: 60,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const getHandles = () => page.locator("links");'),
            },
          ],
        },
      ],
    },
    {
      code: test('const handle = await frame.$("text=Submit");'),
      errors: [
        {
          column: 49,
          endColumn: 56,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandleWithLocator',
              output: test('const handle = frame.locator("text=Submit");'),
            },
          ],
        },
      ],
      name: 'frame.$ should be flagged',
    },
    {
      code: test('const handles = await frame.$$("text=Submit");'),
      errors: [
        {
          column: 50,
          endColumn: 58,
          line: 1,
          messageId: 'noElementHandle',
          suggestions: [
            {
              messageId: 'replaceElementHandlesWithLocator',
              output: test('const handles = frame.locator("text=Submit");'),
            },
          ],
        },
      ],
      name: 'frame.$$ should be flagged',
    },
  ],
  valid: [
    test('page.locator("a")'),
    test('this.page.locator("a")'),
    test('await page.locator("a").click();'),
    test('const $ = "text";'),
    test('$("a");'),
    test('this.$("a");'),
    test('this["$"]("a");'),
    test('this[`$`]("a");'),
    test('something.$("a");'),
    test('this.page.$$$("div");'),
    test('page.$$$("div");'),
  ],
})
