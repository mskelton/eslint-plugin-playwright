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
  ],
})
