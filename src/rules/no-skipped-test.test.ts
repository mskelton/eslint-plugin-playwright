import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-skipped-test.js'

const messageId = 'removeSkippedTestAnnotation'

runRuleTester('no-skipped-test', rule, {
  invalid: [
    {
      code: 'test.skip("skip this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test("skip this test", async ({ page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test["skip"]("skip this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 12,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test("skip this test", async ({ page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test[`skip`]("skip this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 12,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test("skip this test", async ({ page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.skip("a test", { tag: ["@fast", "@login"] }, () => {})',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId: 'noSkippedTest',
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
      code: 'test.describe.skip("skip this describe", () => {});',
      errors: [
        {
          column: 15,
          endColumn: 19,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test.describe("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.describe["skip"]("skip this describe", () => {});',
      errors: [
        {
          column: 15,
          endColumn: 21,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test.describe("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.describe[`skip`]("skip this describe", () => {});',
      errors: [
        {
          column: 15,
          endColumn: 21,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test.describe("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.skip(browserName === "firefox");',
      errors: [
        {
          column: 1,
          endColumn: 37,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.skip(browserName === "firefox", "Still working on it");',
      errors: [
        {
          column: 1,
          endColumn: 60,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.describe.parallel("run in parallel", () => { test.skip(); expect(true).toBe(true); })',
      errors: [
        {
          column: 51,
          endColumn: 62,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output:
                'test.describe.parallel("run in parallel", () => {  expect(true).toBe(true); })',
            },
          ],
        },
      ],
    },
    {
      code: 'test.skip()',
      errors: [
        {
          column: 1,
          endColumn: 12,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test["skip"]()',
      errors: [
        {
          column: 1,
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test[`skip`]()',
      errors: [
        {
          column: 1,
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ messageId, output: '' }],
        },
      ],
    },
    // Global aliases
    {
      code: 'it.skip("skip this test", async ({ page }) => {});',
      errors: [
        {
          column: 4,
          endColumn: 8,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'it("skip this test", async ({ page }) => {});',
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
      code: 'it.describe.skip("describe a test", async ({ page }) => {});',
      errors: [
        {
          column: 13,
          endColumn: 17,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'it.describe("describe a test", async ({ page }) => {});',
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
      code: 'test.step.skip("a step", async () => {});',
      errors: [
        {
          column: 11,
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test.step("a step", async () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.step.skip("a step", async () => {}, { timeout: 1000 });',
      errors: [
        {
          column: 11,
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test.step("a step", async () => {}, { timeout: 1000 });',
            },
          ],
        },
      ],
    },
    {
      code: 'it.step.skip("a step", async () => {});',
      errors: [
        {
          column: 9,
          endColumn: 13,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'it.step("a step", async () => {});',
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
      code: 'test("foo", ({}) => { test.skip(); })',
      errors: [
        {
          column: 23,
          endColumn: 34,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ messageId, output: 'test("foo", ({}) => {  })' }],
        },
      ],
      options: [{ allowConditional: true }],
    },
    {
      code: 'test.skip("foo", ({}) => { expect(1).toBe(1) })',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              messageId,
              output: 'test("foo", ({}) => { expect(1).toBe(1) })',
            },
          ],
        },
      ],
      options: [{ allowConditional: true }],
    },
  ],
  valid: [
    'test("a test", () => {});',
    'test("a test", { tag: "@fast" }, () => {});',
    'test("a test", { tag: ["@fast", "@report"] }, () => {});',
    'test.describe("describe tests", () => {});',
    'test.describe.only("describe focus tests", () => {});',
    'test.describ["only"]("describe focus tests", () => {});',
    'test.describ[`only`]("describe focus tests", () => {});',
    'test("one", async ({ page }) => {});',
    'test.only(isMobile, "Settings page does not work in mobile yet");',
    'test.slow();',
    'test["slow"]();',
    'test[`slow`]();',
    'const skip = true;',
    'function skip() { return null };',
    'this.skip();',
    'this["skip"]();',
    'this[`skip`]();',
    {
      code: 'test("foo", ({ browserName }) => { test.skip(browserName === "firefox", "Still working on it") })',
      options: [{ allowConditional: true }],
    },
    {
      code: 'test("foo", ({ browserName }) => { if (browserName === "firefox") { test.skip("Still working on it") } })',
      options: [{ allowConditional: true }],
    },
    {
      code: 'test("foo", ({ browserName }) => { if (browserName === "firefox") { test.skip() } })',
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
      code: 'it.describe("describe tests", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})
