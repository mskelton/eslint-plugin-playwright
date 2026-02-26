import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-slowed-test.js'

const messageId = 'removeSlowedTestAnnotation'

runRuleTester('no-slowed-test', rule, {
  invalid: [
    {
      code: 'test.slow("slow this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: 'test("slow this test", async ({ page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test["slow"]("slow this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 12,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: 'test("slow this test", async ({ page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test[`slow`]("slow this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 12,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: 'test("slow this test", async ({ page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.slow("a test", { tag: ["@fast", "@login"] }, () => {})',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: 'test("a test", { tag: ["@fast", "@login"] }, () => {})',
            },
          ],
        },
      ],
    },
    {
      code: 'test.slow(browserName === "firefox");',
      errors: [
        {
          column: 1,
          endColumn: 37,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.slow(browserName === "firefox", "Still working on it");',
      errors: [
        {
          column: 1,
          endColumn: 60,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.slow()',
      errors: [
        {
          column: 1,
          endColumn: 12,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test["slow"]()',
      errors: [
        {
          column: 1,
          endColumn: 15,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test[`slow`]()',
      errors: [
        {
          column: 1,
          endColumn: 15,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.slow("foo", ({}) => { expect(1).toBe(1) })',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: 'test("foo", ({}) => { expect(1).toBe(1) })',
            },
          ],
        },
      ],
    },
    // Global aliases
    {
      code: 'it.slow("slow this test", async ({ page }) => {});',
      errors: [
        {
          column: 4,
          endColumn: 8,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: 'it("slow this test", async ({ page }) => {});',
            },
          ],
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.slow("slow this test", async ({ page }) => {});
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          line: 2,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: dedent`
                const custom = test.extend({});
                custom("slow this test", async ({ page }) => {});
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'test("foo", ({}) => { test.slow(); })',
      errors: [
        {
          column: 23,
          endColumn: 34,
          line: 1,
          messageId: 'noSlowedTest',
          suggestions: [{ messageId, output: 'test("foo", ({}) => {  })' }],
        },
      ],
      options: [{ allowConditional: true }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom.slow("slow this test", async ({ page }) => {});
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          line: 2,
          messageId: 'noSlowedTest',
          suggestions: [
            {
              messageId,
              output: dedent`
                import { test as custom } from '@playwright/test';
                custom("slow this test", async ({ page }) => {});
              `,
            },
          ],
        },
      ],
    },
  ],
  valid: [
    'test("a test", () => {});',
    'test("a test", { tag: "@fast" }, () => {});',
    'test("a test", { tag: ["@fast", "@report"] }, () => {});',
    'test("one", async ({ page }) => {});',
    'test.only(isMobile, "Settings page does not work in mobile yet");',
    'test.skip();',
    'test["skip"]();',
    'test[`skip`]();',
    'const slow = true;',
    'function slow() { return null };',
    'this.slow();',
    'this["slow"]();',
    'this[`slow`]();',
    {
      code: 'test("foo", ({ browserName }) => { test.slow(browserName === "firefox", "Still working on it") })',
      options: [{ allowConditional: true }],
    },
    {
      code: 'test("foo", ({ browserName }) => { if (browserName === "firefox") { test.slow("Still working on it") } })',
      options: [{ allowConditional: true }],
    },
    {
      code: 'test("foo", ({ browserName }) => { if (browserName === "firefox") { test.slow() } })',
      options: [{ allowConditional: true }],
    },
    // Global aliases
    {
      code: 'it("a test", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("a test", () => {});
      `,
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("a test", () => {});
      `,
    },
  ],
})
