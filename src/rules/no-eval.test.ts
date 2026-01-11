import dedent from 'dedent'
import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-eval.js'

runRuleTester('no-eval', rule, {
  invalid: [
    {
      code: test('const searchValue = await page.$eval("#search", el => el.value);'),
      errors: [{ column: 54, endColumn: 64, line: 1, messageId: 'noEval' }],
    },
    {
      code: test('const searchValue = await this.page.$eval("#search", el => el.value);'),
      errors: [{ column: 54, endColumn: 69, line: 1, messageId: 'noEval' }],
    },
    {
      code: test('const searchValue = await page["$eval"]("#search", el => el.value);'),
      errors: [{ column: 54, endColumn: 67, line: 1, messageId: 'noEval' }],
    },
    {
      code: test('const searchValue = await page[`$eval`]("#search", el => el.value);'),
      errors: [{ column: 54, endColumn: 67, line: 1, messageId: 'noEval' }],
    },
    {
      code: test('await page.$eval("#search", el => el.value);'),
      errors: [{ column: 34, endColumn: 44, line: 1, messageId: 'noEval' }],
    },
    {
      code: test('await this.page.$eval("#search", el => el.value);'),
      errors: [{ column: 34, endColumn: 49, line: 1, messageId: 'noEval' }],
    },
    {
      code: test('await page.$$eval("#search", el => el.value);'),
      errors: [{ column: 34, endColumn: 45, line: 1, messageId: 'noEvalAll' }],
    },
    {
      code: test('await this.page.$$eval("#search", el => el.value);'),
      errors: [{ column: 34, endColumn: 50, line: 1, messageId: 'noEvalAll' }],
    },
    {
      code: test('await page["$$eval"]("#search", el => el.value);'),
      errors: [{ column: 34, endColumn: 48, line: 1, messageId: 'noEvalAll' }],
    },
    {
      code: test('await page[`$$eval`]("#search", el => el.value);'),
      errors: [{ column: 34, endColumn: 48, line: 1, messageId: 'noEvalAll' }],
    },
    {
      code: test(
        'const html = await page.$eval(".main-container", (e, suffix) => e.outerHTML + suffix, "hello");',
      ),
      errors: [{ column: 47, endColumn: 57, line: 1, messageId: 'noEval' }],
    },
    {
      code: test(
        'const divCounts = await page.$$eval("div", (divs, min) => divs.length >= min, 10);',
      ),
      errors: [{ column: 52, endColumn: 63, line: 1, messageId: 'noEvalAll' }],
    },

    // Custom messages
    // Note: This is one of the only test in the project to tests custom
    // messages since it's implementation is global in the `createRule` method.
    {
      code: dedent`
        page.$eval("#search", el => el.value);
        page.$$eval("#search", el => el.value);
      `,
      errors: [
        { column: 1, endColumn: 11, line: 1, message: 'no eval' },
        { column: 1, endColumn: 12, line: 2, message: 'no eval all' },
      ],
      name: 'Custom messages',
      settings: {
        playwright: {
          messages: {
            noEval: 'no eval',
            noEvalAll: 'no eval all',
          },
        },
      },
    },
  ],
  valid: [
    test('await page.locator(".tweet").evaluate(node => node.innerText)'),
    test('await this.page.locator(".tweet").evaluate(node => node.innerText)'),
    test('await page.locator(".tweet")["evaluate"](node => node.innerText)'),
    test('await page.locator(".tweet")[`evaluate`](node => node.innerText)'),
    test('await (await page.$(".tweet")).$eval(".like", node => node.innerText)'),
    test('await (await page.$(".tweet"))["$eval"](".like", node => node.innerText)'),
    test('await (await page.$(".tweet")).$$eval(".like", node => node.innerText)'),
    test('await (await page.$(".tweet"))[`$$eval`](".like", node => node.innerText)'),
    test('await page.locator("div").evaluateAll((divs, min) => divs.length >= min, 10);'),
    test('await this.page.locator("div").evaluateAll((divs, min) => divs.length >= min, 10);'),
  ],
})
