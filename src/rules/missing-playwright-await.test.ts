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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
        { column: 4, endColumn: 10, endLine: 3, line: 3, messageId: 'missingAwait' },
        { column: 4, endColumn: 10, endLine: 4, line: 4, messageId: 'missingAwait' },
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
      errors: [{ column: 28, endColumn: 34, endLine: 1, line: 1, messageId: 'missingAwait' }],
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
          messageId: 'missingAwait',
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
          messageId: 'missingAwait',
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
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForRequest("https://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForEvent("download")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page["waitForResponse"]("https://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page[`waitForResponse`]("https://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('this.page.waitForResponse("https://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: dedent(
        test(`
          const promise = page.waitForResponse("https://example.com")
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
    },
    // Variable re-assignment: re-assigned but never awaited
    {
      code: dedent(
        test(`
          let res
          res = page.waitForResponse('/abc')
        `),
      ),
      errors: [{ line: 3, messageId: 'missingAwait' }],
    },
    // Variable re-assignment: re-assigned without any subsequent await
    {
      code: dedent(
        test(`
          let res = page.waitForResponse('/foo')
          res = page.waitForResponse('/abc')
        `),
      ),
      errors: [
        { line: 2, messageId: 'missingAwait' },
        { line: 3, messageId: 'missingAwait' },
      ],
    },
    // .then() / .catch() without await on the chain is still invalid
    {
      code: test('page.waitForResponse("https://example.com").then(res => res.json())'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForResponse("https://example.com").catch(() => null)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForResponse("https://example.com").then(r => r).catch(() => null)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForPopup()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForConsoleMessage()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForDownload()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForFileChooser()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForFunction(() => true)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: test('page.waitForWebSocket("wss://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
    },
    {
      code: dedent(
        test(`
          const response = page.waitForResponse("https://example.com")
          expect(response).resolves.toBeTruthy()
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
    },
    {
      code: dedent(
        test(`
          const downloadPromise = page.waitForEvent('download')
          expect(downloadPromise).resolves.toBeTruthy()
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
    },
    // page / locator methods behind a flag
    {
      code: test('page.click("foo")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.fill("foo", "bar")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.goto("https://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").click()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const foo = page.locator("foo")
          foo.click()
        `),
      ),
      errors: [{ line: 3, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").hover()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // More page methods (includePageLocatorMethods)
    {
      code: test('page.reload()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.press("body", "Enter")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.check("input")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.uncheck("input")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.screenshot()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.goBack()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.goForward()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.setContent("<html></html>")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.waitForLoadState("domcontentloaded")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.evaluate(() => document.title)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.getAttribute("body", "id")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // Locator-only methods (not on Page)
    {
      code: test('page.locator("foo").waitFor()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").count()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("input").clear()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").dragTo(page.locator("bar"))'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").scrollIntoViewIfNeeded()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("input").pressSequentially("hello")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("li").allTextContents()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").textContent()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").getAttribute("href")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").selectOption("bar")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").setChecked(true)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").dblclick()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").focus()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").blur()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // Bracket notation for page/locator methods
    {
      code: test('page["click"]("foo")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page[\'goto\']("https://example.com")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo")["fill"]("bar")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // context.page and this.page (isPageMethod accepts these)
    {
      code: dedent(
        test(`
          context.page.click("foo")
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          context.page.goto("https://example.com")
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          this.page.click("foo")
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          this.page.goto("https://example.com")
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // Chained locator
    {
      code: test('page.locator("a").locator("b").click()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // .then() / .catch() without awaiting the outer call
    {
      code: test('page.click("foo").then(() => {})'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('page.locator("foo").click().catch(() => {})'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // Variable assigned but not consumed
    {
      code: dedent(
        test(`
          const p = page.goto("https://example.com")
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const p = page.locator("foo").click()
        `),
      ),
      errors: [{ line: 2, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    // Non-page/non-locator objects calling locator methods (reported when flag on: method name matches)
    {
      code: test('foo.click()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('customThing.click()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('bar.fill("selector", "value")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('element.hover()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('widget.press("Enter")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('node.focus()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('control.blur()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('item.check()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('input.uncheck()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('el.dblclick()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('selector.clear()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('list.count()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('elem.getAttribute("href")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('node.textContent()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('loc.waitFor()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('btn.setChecked(true)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('dropdown.selectOption("x")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('el.scrollIntoViewIfNeeded()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('field.pressSequentially("text")'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('items.allTextContents()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('row.dragTo(target)'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('component.screenshot()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('elem["click"]()'),
      errors: [{ column: 28, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const button = getButton()
          button.click()
        `),
      ),
      errors: [{ line: 3, messageId: 'missingAwait' }],
      options: [{ includePageLocatorMethods: true }],
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
    // Promise.race / Promise.any / Promise.allSettled
    {
      code: test(`
        await Promise.race([
          expect(page.locator("foo")).toHaveText("bar"),
          page.waitForSelector("baz"),
        ])
      `),
    },
    {
      code: test(`
        await Promise.any([
          expect(page.locator("foo")).toHaveText("bar"),
          expect(page).toHaveTitle("baz"),
        ])
      `),
    },
    {
      code: test(`
        await Promise.allSettled([
          expect(page.locator("foo")).toHaveText("bar"),
          page.waitForResponse("https://example.com"),
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
    {
      code: dedent(
        test(`
          const response = page.waitForResponse("https://example.com")
          await expect(response).resolves.toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const response = page.waitForResponse('**/page')
          await expect(response).resolves.toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const responsePromise = page.waitForResponse("https://example.com")
          return expect(responsePromise).resolves.toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const response = page.waitForResponse("https://example.com")
          await expect(response).resolves.not.toBeNull()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const downloadPromise = page.waitForEvent('download')
          await expect(downloadPromise).resolves.toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const requestPromise = page.waitForRequest("https://example.com/resource")
          await expect(requestPromise).resolves.toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const response = page.waitForResponse("https://example.com")
          await expect(response)["resolves"].toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const response = page.waitForResponse("https://example.com")
          await page.locator("button").click()
          await expect(response).resolves.toBeTruthy()
        `),
      ),
    },
    {
      code: dedent(
        test(`
          const downloadPromise = this.hcPage.waitForEvent('download')
          await button.click()
          return downloadPromise
            .then((download) => download.createReadStream())
            .then((stream) => getStream(stream))
            .then((contents) => JSON.parse(contents))
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
    // Variable re-assignment: await on re-used variable
    {
      code: dedent(
        test(`
          let res = page.waitForResponse('/foo')
          await res

          res = page.waitForResponse('/abc')
          await res
        `),
      ),
    },
    // Variable re-assignment: return instead of await
    {
      code: dedent(
        test(`
          let res = page.waitForResponse('/foo')
          await res

          res = page.waitForResponse('/abc')
          return res
        `),
      ),
    },
    // Variable re-assignment: no initial value, assigned then awaited
    {
      code: dedent(
        test(`
          let res
          res = page.waitForResponse('/abc')
          await res
        `),
      ),
    },
    // Variable re-assignment: three assignments all properly consumed
    {
      code: dedent(
        test(`
          let res = page.waitForResponse('/foo')
          await res

          res = page.waitForResponse('/bar')
          await res

          res = page.waitForResponse('/baz')
          await res
        `),
      ),
    },
    // page / locator methods are not checked by default
    { code: test('page.click("foo")') },
    { code: test('customThing.click()') },
    // Non-page objects calling page-only methods (no report: method not in locatorMethods, isPageMethod false)
    {
      code: test('table.nextPage.goto("https://example.com")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('something.goto("https://example.com")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('other.reload()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('obj.goBack()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('nav.goForward()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('p.setContent("<html></html>")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('view.waitForLoadState("load")'),
      options: [{ includePageLocatorMethods: true }],
    },
    // Non-page objects: when awaited/returned the rule is satisfied
    {
      code: test('await foo.click()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('return customThing.click()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await bar.fill("sel", "val")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await element.hover()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const button = getButton()
          await button.click()
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const el = getElement()
          return el.click()
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    // page / locator methods behind a flag
    {
      code: test('await page.click("foo")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('return page.goto("https://example.com")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("foo").click()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const foo = page.locator("foo")
          await foo.click()
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    // More valid page/locator patterns with flag
    {
      code: test('await page.reload()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.press("body", "Enter")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.screenshot()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.goBack()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.setContent("<html></html>")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("foo").waitFor()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("foo").count()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("input").clear()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("foo").textContent()'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("foo").getAttribute("href")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page["click"]("foo")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page[\'goto\']("https://example.com")'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          await context.page.click("foo")
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          await this.page.goto("https://example.com")
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("a").locator("b").click()'),
      options: [{ includePageLocatorMethods: true }],
    },
    // Promise.all with page/locator methods
    {
      code: test(`
        await Promise.all([
          page.click("foo"),
          page.locator("bar").click(),
        ])
      `),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test(`
        await Promise.all([
          page.goto("https://a.com"),
          page.goto("https://b.com"),
        ])
      `),
      options: [{ includePageLocatorMethods: true }],
    },
    // .then() chain awaited
    {
      code: test('await page.click("foo").then(() => {})'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('await page.locator("foo").click().catch(() => {})'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('return page.click("foo").then(() => {})'),
      options: [{ includePageLocatorMethods: true }],
    },
    // Variable assigned and later awaited/returned
    {
      code: dedent(
        test(`
          const p = page.goto("https://example.com")
          await p
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const p = page.locator("foo").click()
          await p
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: dedent(
        test(`
          const p = page.goto("https://example.com")
          return p
        `),
      ),
      options: [{ includePageLocatorMethods: true }],
    },
    // Array.fill and similar Array methods should not be flagged
    {
      code: test('new Array(5).fill(0)'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('[].fill(0)'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('[1, 2, 3].fill(0)'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('Array.from({ length: 5 }).fill(0)'),
      options: [{ includePageLocatorMethods: true }],
    },
    {
      code: test('Array.of(1, 2, 3).fill(0)'),
      options: [{ includePageLocatorMethods: true }],
    },
    // Option combined with customMatchers
    {
      code: test('await page.click("foo")'),
      options: [{ customMatchers: ['toBeCustomThing'], includePageLocatorMethods: true }],
    },
    {
      code: test('await expect(page).toBeCustomThing(true)'),
      options: [{ customMatchers: ['toBeCustomThing'], includePageLocatorMethods: true }],
    },
  ],
})
