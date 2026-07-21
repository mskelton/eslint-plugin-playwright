import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-unnecessary-assertions.js'

runRuleTester('no-unnecessary-assertions', rule, {
  invalid: [
    {
      code: 'test("t", async () => { expect(page.getByText("x")).toBeDefined() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output: 'test("t", async () => { await expect(page.getByText("x")).toBeVisible() })',
            },
          ],
        },
      ],
    },
    {
      code: 'test("t", async () => { expect(page.locator(".x")).not.toBeNull() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output: 'test("t", async () => { await expect(page.locator(".x")).toBeVisible() })',
            },
          ],
        },
      ],
    },
    {
      code: 'test("t", async () => { expect(page.getByRole("button")).toBeTruthy() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output:
                'test("t", async () => { await expect(page.getByRole("button")).toBeVisible() })',
            },
          ],
        },
      ],
    },
    {
      code: 'test("t", async () => { expect(page.getByTestId("row").first()).not.toBeUndefined() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output:
                'test("t", async () => { await expect(page.getByTestId("row").first()).toBeVisible() })',
            },
          ],
        },
      ],
    },
    {
      code: 'test("t", async () => { expect(page.locator(".menu").filter({ hasText: "A" })).not.toBeFalsy() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output:
                'test("t", async () => { await expect(page.locator(".menu").filter({ hasText: "A" })).toBeVisible() })',
            },
          ],
        },
      ],
    },
    // Already awaited: reuse the existing `await`, do not emit `await await`.
    {
      code: 'test("t", async () => { await expect(page.getByTestId("x")).toBeTruthy() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output:
                'test("t", async () => { await expect(page.getByTestId("x")).toBeVisible() })',
            },
          ],
        },
      ],
    },
    // Locator stored in a variable is resolved via `dereference`.
    {
      code: 'test("t", async () => { const btn = page.getByRole("button"); expect(btn).toBeDefined() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output:
                'test("t", async () => { const btn = page.getByRole("button"); await expect(btn).toBeVisible() })',
            },
          ],
        },
      ],
    },
    // expect.soft is covered (and preserved).
    {
      code: 'test("t", async () => { await expect.soft(page.getByText("x")).toBeTruthy() })',
      errors: [
        {
          messageId: 'noUnnecessaryAssertions',
          suggestions: [
            {
              messageId: 'replaceWithToBeVisible',
              output:
                'test("t", async () => { await expect.soft(page.getByText("x")).toBeVisible() })',
            },
          ],
        },
      ],
    },
    // Sync callback: reported, but NO suggestion offered (await would be a SyntaxError).
    {
      code: 'test("t", () => { expect(page.getByText("x")).toBeDefined() })',
      errors: [{ messageId: 'noUnnecessaryAssertions', suggestions: [] }],
    },
    // A comment between expect() and the matcher: reported, but NO suggestion
    // (the fix would delete the comment).
    {
      code: 'test("t", async () => { expect(page.getByText("x")) /* keep */ .toBeDefined() })',
      errors: [{ messageId: 'noUnnecessaryAssertions', suggestions: [] }],
    },
  ],
  valid: [
    'await expect(page.getByText("x")).toBeVisible()',
    'await expect(page.locator(".x")).toBeHidden()',
    // Non-locator subjects genuinely need these matchers.
    'expect(count).toBeDefined()',
    'expect(user).not.toBeNull()',
    'expect(result).toBeTruthy()',
    // Polarity: these ALWAYS FAIL on a Locator, so must not be flagged.
    'expect(page.locator(".x")).toBeNull()',
    'expect(page.locator(".x")).not.toBeDefined()',
    'expect(page.getByRole("button")).toBeFalsy()',
    // Generic chains without a Playwright locator anchor.
    'expect(arr.filter((x) => x)).toBeDefined()',
    'expect(items.first()).toBeTruthy()',
    // Terminal returns a Promise/value, not a Locator (prefer-web-first territory).
    'expect(page.locator(".x").count()).toBeTruthy()',
    'expect(page.getByRole("button").isVisible()).not.toBeFalsy()',
    // Unresolvable identifier (function param) is left alone.
    'function check(loc) { expect(loc).toBeDefined() }',
    // resolves/rejects change the semantics.
    'expect(page.getByText("x")).resolves.toBeTruthy()',
  ],
})
