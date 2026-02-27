import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-useless-await.js'

const messageId = 'noUselessAwait'

runRuleTester('no-useless-await', rule, {
  invalid: [
    // Page, frames, and locators
    {
      code: 'await page.locator(".my-element")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.locator(".my-element")',
    },
    {
      code: 'await frame.locator(".my-element")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.locator(".my-element")',
    },
    {
      code: 'await foo.locator(".my-element")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'foo.locator(".my-element")',
    },

    // nth methods
    {
      code: 'await foo.first()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'foo.first()',
    },
    {
      code: 'await foo.last()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'foo.last()',
    },
    {
      code: 'await foo.nth(3)',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'foo.nth(3)',
    },
    {
      code: 'await foo.and(page.locator(".my-element"))',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'foo.and(page.locator(".my-element"))',
    },
    {
      code: 'await foo.or(page.locator(".my-element"))',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'foo.or(page.locator(".my-element"))',
    },

    // Testing library methods
    {
      code: 'await page.getByAltText("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.getByAltText("foo")',
    },
    {
      code: 'await page["getByRole"]("button")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page["getByRole"]("button")',
    },
    {
      code: 'await page[`getByLabel`]("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page[`getByLabel`]("foo")',
    },
    {
      code: 'await page.getByPlaceholder("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.getByPlaceholder("foo")',
    },
    {
      code: 'await page.getByTestId("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.getByTestId("foo")',
    },
    {
      code: 'await page.getByText("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.getByText("foo")',
    },
    {
      code: 'await page.getByTitle("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.getByTitle("foo")',
    },

    // Event handlers
    {
      code: 'await page.on("console", () => {})',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.on("console", () => {})',
    },
    {
      code: 'await frame.on("console", () => {})',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.on("console", () => {})',
    },

    // Misc page methods
    {
      code: 'await page.frame("foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.frame("foo")',
    },
    {
      code: 'await page.frameLocator("#foo")',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.frameLocator("#foo")',
    },
    {
      code: 'await page.frames()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.frames()',
    },
    {
      code: 'await page.mainFrame()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.mainFrame()',
    },
    {
      code: 'await page.isClosed()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.isClosed()',
    },
    {
      code: 'await page.setDefaultNavigationTimeout()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.setDefaultNavigationTimeout()',
    },
    {
      code: 'await page.setDefaultTimeout()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.setDefaultTimeout()',
    },
    {
      code: 'await page.url()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.url()',
    },
    {
      code: 'await page.video()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.video()',
    },
    {
      code: 'await page.viewportSize()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.viewportSize()',
    },
    {
      code: 'await page.workers()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'page.workers()',
    },

    // Misc frame methods
    {
      code: 'await frame.childFrames()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.childFrames()',
    },
    {
      code: 'await frame.isDetached()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.isDetached()',
    },
    {
      code: 'await frame.name()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.name()',
    },
    {
      code: 'await frame.page()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.page()',
    },
    {
      code: 'await frame.parentFrame()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'frame.parentFrame()',
    },

    // Expect methods
    {
      code: 'await expect(true).toBe(true)',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'expect(true).toBe(true)',
    },
    {
      code: 'await expect(true).toBeTruthy()',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'expect(true).toBeTruthy()',
    },
    {
      code: 'await expect(true).toEqual(true)',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      output: 'expect(true).toEqual(true)',
    },
    {
      code: 'await expect.soft(true).toBe(true)',
      errors: [{ column: 1, endColumn: 6, line: 1, messageId }],
      name: 'expect.soft with non-async matcher',
      output: 'expect.soft(true).toBe(true)',
    },
  ],
  valid: [
    'await foo()',
    'await foo(".my-element")',
    'await foo.bar()',
    'await foo.bar(".my-element")',
    'await foo.isClosed(".my-selector")',

    'page.getByRole(".my-element")',
    'page.locator(".my-element")',

    'await page.waitForLoadState({ waitUntil: "load" })',
    'await page.waitForURL(url, { waitUntil: "load" })',
    'await page.locator(".hello-world").waitFor()',

    'expect(true).toBe(true)',
    'expect(true).toBeTruthy()',
    'expect(true).toEqual(true)',

    'await expect(page.locator(".my-element")).toBeVisible()',
    'await expect(page.locator(".my-element")).toHaveText("test")',

    'await expect.poll(() => getSlowStorageValue(page, "key")).toBe("value")',
    'await expect(doSomething()).resolves.toThrow("No element found")',
    'await expect(doSomething()).rejects.toThrow("No element found")',
  ],
})
