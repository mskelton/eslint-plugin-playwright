import dedent from 'dedent'
import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './missing-playwright-await.js'

runRuleTester('missing-playwright-await', rule, {
  invalid: [
    {
      code: test('expect(page).toBeChecked()'),
      errors: [
        {
          column: 28,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      output: test('await expect(page).toBeChecked()'),
    },
    {
      code: test('expect(page).not.toBeEnabled()'),
      errors: [
        {
          column: 28,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      output: test('await expect(page).not.toBeEnabled()'),
    },
    {
      code: dedent(
        test(`expect(async () => {
          expect(await page.evaluate(() => window.foo)).toBe('bar')
        }).toPass()`),
      ),
      errors: [
        {
          column: 28,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      output: dedent(
        test(`await expect(async () => {
          expect(await page.evaluate(() => window.foo)).toBe('bar')
        }).toPass()`),
      ),
    },
    // Custom matchers
    {
      code: test('expect(page).toBeCustomThing(false)'),
      errors: [
        {
          column: 28,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      options: [{ customMatchers: ['toBeCustomThing'] }],
      output: test('await expect(page).toBeCustomThing(false)'),
    },
    {
      code: test('expect(page)["not"][`toBeCustomThing`](true)'),
      errors: [
        {
          column: 28,
          endColumn: 34,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      options: [{ customMatchers: ['toBeCustomThing'] }],
      output: test('await expect(page)["not"][`toBeCustomThing`](true)'),
    },
    // expect.soft
    {
      code: test('expect.soft(page).toBeChecked()'),
      errors: [
        {
          column: 28,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      output: test('await expect.soft(page).toBeChecked()'),
    },
    {
      code: test('expect["soft"](page)["toBeChecked"]()'),
      errors: [
        {
          column: 28,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      output: test('await expect["soft"](page)["toBeChecked"]()'),
    },
    {
      code: test('expect[`soft`](page)[`toBeChecked`]()'),
      errors: [
        {
          column: 28,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'expect',
        },
      ],
      output: test('await expect[`soft`](page)[`toBeChecked`]()'),
    },
    // expect.poll
    {
      code: test('expect.poll(() => foo).toBe(true)'),
      errors: [
        {
          column: 28,
          endColumn: 39,
          endLine: 1,
          line: 1,
          messageId: 'expectPoll',
        },
      ],
      output: test('await expect.poll(() => foo).toBe(true)'),
    },
    {
      code: test('expect["poll"](() => foo)["toContain"]("bar")'),
      errors: [
        {
          column: 28,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'expectPoll',
        },
      ],
      output: test('await expect["poll"](() => foo)["toContain"]("bar")'),
    },
    {
      code: test('expect[`poll`](() => foo)[`toBeTruthy`]()'),
      errors: [
        {
          column: 28,
          endColumn: 42,
          endLine: 1,
          line: 1,
          messageId: 'expectPoll',
        },
      ],
      output: test('await expect[`poll`](() => foo)[`toBeTruthy`]()'),
    },
    // expect.configure
    {
      code: dedent`
        test('test', async () => {
          const softExpect = expect.configure({ soft: true })
          softExpect(foo).toBeChecked()
        })
     `,
      errors: [
        {
          column: 3,
          endColumn: 13,
          endLine: 3,
          line: 3,
          messageId: 'expect',
        },
      ],
      output: dedent`
        test('test', async () => {
          const softExpect = expect.configure({ soft: true })
          await softExpect(foo).toBeChecked()
        })
     `,
    },
    // test.step
    {
      code: test("test.step('foo', async () => {})"),
      errors: [
        {
          column: 28,
          endColumn: 37,
          endLine: 1,
          line: 1,
          messageId: 'testStep',
        },
      ],
      output: test("await test.step('foo', async () => {})"),
    },
    {
      code: test("test['step']('foo', async () => {})"),
      errors: [
        {
          column: 28,
          endColumn: 40,
          endLine: 1,
          line: 1,
          messageId: 'testStep',
        },
      ],
      output: test("await test['step']('foo', async () => {})"),
    },

    // Lack of Promise.all
    {
      code: dedent(
        test(`
          const promises = [
            expect(page.locator("foo")).toHaveText("bar"),
            expect(page).toHaveTitle("baz"),
          ]
        `),
      ),
      errors: [
        { column: 4, endColumn: 10, endLine: 3, line: 3, messageId: 'expect' },
        { column: 4, endColumn: 10, endLine: 4, line: 4, messageId: 'expect' },
      ],
      output: dedent(
        test(`
          const promises = [
            await expect(page.locator("foo")).toHaveText("bar"),
            await expect(page).toHaveTitle("baz"),
          ]
        `),
      ),
    },
    {
      code: test('assert(page).toBeChecked()'),
      errors: [{ column: 28, endColumn: 34, endLine: 1, line: 1, messageId: 'expect' }],
      output: test('await assert(page).toBeChecked()'),
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('test', async () => { expect(page).toBeChecked() })
      `,
      errors: [
        {
          column: 30,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'expect',
        },
      ],
      output: dedent`
        const custom = test.extend({});
        custom('test', async () => { await expect(page).toBeChecked() })
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        test('test', async () => { assuming(page).toBeChecked() })
      `,
      errors: [
        {
          column: 28,
          endColumn: 36,
          endLine: 2,
          line: 2,
          messageId: 'expect',
        },
      ],
      output: dedent`
        import { expect as assuming } from '@playwright/test';
        test('test', async () => { await assuming(page).toBeChecked() })
      `,
    },

    // waitFor methods
    {
      code: test('page.waitForResponse("https://example.com")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page.waitForRequest("https://example.com")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page.waitForEvent("download")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page["waitForResponse"]("https://example.com")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page[`waitForResponse`]("https://example.com")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('this.page.waitForResponse("https://example.com")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: dedent(
        test(`
          const promise = page.waitForResponse("https://example.com")
        `),
      ),
      errors: [{ line: 2, messageId: 'waitFor' }],
    },
    // .then() / .catch() without await on the chain is still invalid
    {
      code: test('page.waitForResponse("https://example.com").then(res => res.json())'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page.waitForResponse("https://example.com").catch(() => null)'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page.waitForResponse("https://example.com").then(r => r).catch(() => null)'),
      errors: [{ column: 28, messageId: 'waitFor' }],
    },
    {
      code: test('page.waitForPopup()'),
      errors: [{ column: 28, messageId: 'waitFor' }],
      name: 'waitForPopup without await should be flagged',
    },
    {
      code: test('page.waitForConsoleMessage()'),
      errors: [{ column: 28, messageId: 'waitFor' }],
      name: 'waitForConsoleMessage without await should be flagged',
    },
    {
      code: test('page.waitForDownload()'),
      errors: [{ column: 28, messageId: 'waitFor' }],
      name: 'waitForDownload without await should be flagged',
    },
    {
      code: test('page.waitForFileChooser()'),
      errors: [{ column: 28, messageId: 'waitFor' }],
      name: 'waitForFileChooser without await should be flagged',
    },
    {
      code: test('page.waitForFunction(() => true)'),
      errors: [{ column: 28, messageId: 'waitFor' }],
      name: 'waitForFunction without await should be flagged',
    },
    {
      code: test('page.waitForWebSocket("wss://example.com")'),
      errors: [{ column: 28, messageId: 'waitFor' }],
      name: 'waitForWebSocket without await should be flagged',
    },
  ],
  valid: [
    // Basic
    { code: test('await expect(page).toBeEditable') },
    { code: test('await expect(page).toEqualTitle("text")') },
    { code: test('await expect(page).not.toHaveText("text")') },
    // Invalid expect calls are ignored
    { code: 'expect.soft(page.locator("foo"))' },
    // Doesn't require an await when returning
    { code: test('return expect(page).toHaveText("text")') },
    {
      code: test('const a = () => expect(page).toHaveText("text")'),
      options: [{ customMatchers: ['toBeCustomThing'] }],
    },
    // Custom matchers
    {
      code: test('await expect(page).toBeCustomThing(true)'),
      options: [{ customMatchers: ['toBeCustomThing'] }],
    },
    { code: test('await expect(page).toBeCustomThing(true)') },
    { code: test('expect(page).toBeCustomThing(true)') },
    {
      code: test('await expect(page).toBeAsync(true)'),
      options: [{ customMatchers: ['toBeAsync'] }],
    },
    // expect.soft
    { code: test('await expect.soft(page).toHaveText("text")') },
    { code: test('await expect.soft(page).not.toHaveText("text")') },
    // expect.poll
    { code: test('await expect.poll(() => foo).toBe("text")') },
    { code: test('await expect["poll"](() => foo).toContain("text")') },
    { code: test('await expect[`poll`](() => foo).toBeTruthy()') },
    // test.step
    { code: test("await test.step('foo', async () => {})") },
    // Promise.all
    {
      code: test(`
        await Promise.all([
          expect(page.locator("foo")).toHaveText("bar"),
          expect(page).toHaveTitle("baz"),
        ])
      `),
    },

    // Variable references
    {
      code: dedent(
        test(`
          const promise = expect(page.locator('foo')).toBeHidden();
          await page.locator('bar').click();
          await promise;
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const promises = [
            expect(page.locator("foo")).toHaveText("bar"),
            expect(page).toHaveTitle("baz"),
          ]

          await Promise.all(promises)
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const promises = [
            expect(page.locator("foo")).toHaveText("bar"),
            expect(page).toHaveTitle("baz"),
          ]

          return promises
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const foo = [
            expect(page.locator("foo")).toHaveText("bar"),
            expect(page).toHaveTitle("baz"),
          ]

          const bar = await Promise.all(foo)
          return bar
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const foo = [
            expect(page.locator("foo")).toHaveText("bar"),
            expect(page).toHaveTitle("baz"),
          ]

          const bar = foo
          return bar
        `),
      ),
    },
    // Global aliases
    {
      code: test('await assert(page).toHaveText("text")'),
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: test('await assert.soft(page).toHaveText("text")'),
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('test', async () => { await expect(page).toBeChecked() })
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        test('test', async () => { await assuming(page).toBeChecked() })
      `,
    },
    // Regression: variable passed to getByText (should not crash or false positive)
    {
      code: dedent(
        test(`
          const thisIsCausingTheBug = 'some text';
          const pageCover = page.getByText(thisIsCausingTheBug);
          const expectation = expect(pageCover, "message").toBeVisible();
          await page.clock.runFor(60_000);
          await expectation;
        `),
      ),
    },

    // waitFor methods - valid patterns
    { code: test('await page.waitForResponse("https://example.com")') },
    { code: test('await page.waitForRequest("https://example.com")') },
    { code: test('await page.waitForEvent("download")') },
    { code: test('await page.waitForConsoleMessage()') },
    { code: test('await page.waitForDownload()') },
    { code: test('await page.waitForFileChooser()') },
    { code: test('await page.waitForFunction(() => true)') },
    { code: test('await page.waitForPopup()') },
    { code: test('await page.waitForWebSocket("wss://example.com")') },
    { code: test('return page.waitForResponse("https://example.com")') },
    { code: test('await page.waitForResponse("https://example.com").then(res => res.json())') },
    { code: test('await page.waitForResponse("https://example.com").catch(() => null)') },
    { code: test('await page.waitForResponse("https://example.com").finally(() => {})') },
    {
      code: test(
        'await page.waitForResponse("https://example.com").then(res => res.json()).catch(() => null)',
      ),
    },
    { code: test('return page.waitForResponse("https://example.com").then(res => res.json())') },
    { code: test('const fn = () => page.waitForResponse("https://example.com").then(r => r)') },
    { code: test('await expect(page).toBeVisible().catch(() => {})') },
    { code: test('const fn = () => page.waitForResponse("https://example.com")') },
    {
      code: test(`
        await Promise.all([
          page.locator("button").click(),
          page.waitForResponse("https://example.com"),
        ])
      `),
    },
    {
      code: dedent(
        test(`
          const responsePromise = page.waitForResponse("https://example.com")
          await page.locator("button").click()
          await responsePromise
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const responsePromise = page.waitForResponse("https://example.com")
          await page.locator("button").click()
          return responsePromise
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const currentIdentityResponse = page.waitForResponse('**/v1/auth/users/current-identity')
          const currentIdentity = await currentIdentityResponse.then((res) => res.json())
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const downloadPromise = page.waitForEvent('download')
          await page.getByRole('option', { name: /download/i }).click()
          if (help) {
            await downloadPromise
          }
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const response = filterUrl
            ? page.waitForResponse((response) => response.url().endsWith(filterUrl))
            : null
          if (response) {
            await response
          }
        `),
      ),
    },
    { code: test('await this.page.waitForResponse("https://example.com")') },
    { code: test('await page["waitForResponse"]("https://example.com")') },
    { code: test('await page[`waitForResponse`]("https://example.com")') },
    {
      code: dedent(
        test(`
          const requestPromise = page.waitForRequest("https://example.com/resource")
          await page.getByText("trigger request").click()
          const request = await requestPromise
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const results = await Promise.all([
            expect(locator).toBeVisible(),
            ...(someCondition ? [page.waitForResponse('https://example.com')] : []),
          ])
        `),
      ),
    },
  ],
})
