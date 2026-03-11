import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-skipped-test.js'

const messageId = 'removeAnnotation'

runRuleTester('no-skipped-test', rule, {
  invalid: [
    {
      code: 'test.skip("skip this test", async ({ page }) => {});',
      errors: [
        {
          column: 6,
          data: { annotation: 'skip' },
          endColumn: 10,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 12,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 12,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 10,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 19,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 21,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 21,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 37,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ data: { annotation: 'skip' }, messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.skip(browserName === "firefox", "Still working on it");',
      errors: [
        {
          column: 1,
          data: { annotation: 'skip' },
          endColumn: 60,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ data: { annotation: 'skip' }, messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test.describe.parallel("run in parallel", () => { test.skip(); expect(true).toBe(true); })',
      errors: [
        {
          column: 51,
          data: { annotation: 'skip' },
          endColumn: 62,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 12,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ data: { annotation: 'skip' }, messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test["skip"]()',
      errors: [
        {
          column: 1,
          data: { annotation: 'skip' },
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ data: { annotation: 'skip' }, messageId, output: '' }],
        },
      ],
    },
    {
      code: 'test[`skip`]()',
      errors: [
        {
          column: 1,
          data: { annotation: 'skip' },
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [{ data: { annotation: 'skip' }, messageId, output: '' }],
        },
      ],
    },
    // Global aliases
    {
      code: 'it.skip("skip this test", async ({ page }) => {});',
      errors: [
        {
          column: 4,
          data: { annotation: 'skip' },
          endColumn: 8,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
      code: dedent`
        const custom = test.extend({});
        custom.skip("skip this test", async ({ page }) => {});
      `,
      errors: [
        {
          column: 8,
          data: { annotation: 'skip' },
          endColumn: 12,
          line: 2,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
              messageId,
              output: dedent`
                const custom = test.extend({});
                custom("skip this test", async ({ page }) => {});
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'it.describe.skip("describe a test", async ({ page }) => {});',
      errors: [
        {
          column: 13,
          data: { annotation: 'skip' },
          endColumn: 17,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 15,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 13,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
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
          data: { annotation: 'skip' },
          endColumn: 34,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            { data: { annotation: 'skip' }, messageId, output: 'test("foo", ({}) => {  })' },
          ],
        },
      ],
      options: [{ allowConditional: true }],
    },
    {
      code: 'test.skip("foo", ({}) => { expect(1).toBe(1) })',
      errors: [
        {
          column: 6,
          data: { annotation: 'skip' },
          endColumn: 10,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
              messageId,
              output: 'test("foo", ({}) => { expect(1).toBe(1) })',
            },
          ],
        },
      ],
      options: [{ allowConditional: true }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom.skip("skip this test", async ({ page }) => {});
      `,
      errors: [
        {
          column: 8,
          data: { annotation: 'skip' },
          endColumn: 12,
          line: 2,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
              messageId,
              output: dedent`
                import { test as custom } from '@playwright/test';
                custom("skip this test", async ({ page }) => {});
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'test.describe.serial.skip("foo", () => {})',
      errors: [
        {
          column: 22,
          data: { annotation: 'skip' },
          endColumn: 26,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
              messageId,
              output: 'test.describe.serial("foo", () => {})',
            },
          ],
        },
      ],
      name: 'describe.serial.skip should be flagged',
    },
    {
      code: 'test.describe.parallel.skip("foo", () => {})',
      errors: [
        {
          column: 24,
          data: { annotation: 'skip' },
          endColumn: 28,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'skip' },
              messageId,
              output: 'test.describe.parallel("foo", () => {})',
            },
          ],
        },
      ],
      name: 'describe.parallel.skip should be flagged',
    },
    // fixme (only when disallowFixme: true)
    {
      code: "test.fixme('temporarily disabled', async ({ page }) => {});",
      errors: [
        {
          column: 6,
          data: { annotation: 'fixme' },
          endColumn: 11,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'fixme' },
              messageId: 'removeAnnotation',
              output: "test('temporarily disabled', async ({ page }) => {});",
            },
          ],
        },
      ],
      options: [{ disallowFixme: true }],
    },
    {
      code: 'test.fixme();',
      errors: [
        {
          column: 1,
          data: { annotation: 'fixme' },
          endColumn: 13,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            { data: { annotation: 'fixme' }, messageId: 'removeAnnotation', output: '' },
          ],
        },
      ],
      options: [{ disallowFixme: true }],
    },
    {
      code: dedent`
        test.describe('group', () => {
          test.fixme('case', async () => {});
        });
      `,
      errors: [
        {
          column: 8,
          data: { annotation: 'fixme' },
          endColumn: 13,
          line: 2,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'fixme' },
              messageId: 'removeAnnotation',
              output: dedent`
                test.describe('group', () => {
                  test('case', async () => {});
                });
              `,
            },
          ],
        },
      ],
      options: [{ disallowFixme: true }],
    },
    {
      code: 'test.describe.fixme("skip this describe", () => {});',
      errors: [
        {
          column: 15,
          data: { annotation: 'fixme' },
          endColumn: 20,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            {
              data: { annotation: 'fixme' },
              messageId: 'removeAnnotation',
              output: 'test.describe("skip this describe", () => {});',
            },
          ],
        },
      ],
      options: [{ disallowFixme: true }],
    },
    {
      code: 'test.fixme(isMobile, "Settings page does not work in mobile yet");',
      errors: [
        {
          column: 1,
          data: { annotation: 'fixme' },
          endColumn: 66,
          line: 1,
          messageId: 'noSkippedTest',
          suggestions: [
            { data: { annotation: 'fixme' }, messageId: 'removeAnnotation', output: '' },
          ],
        },
      ],
      options: [{ disallowFixme: true }],
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
    'test.fixme(isMobile, "Settings page does not work in mobile yet");',
    'test["fixme"](isMobile, "Settings page does not work in mobile yet");',
    'test[`fixme`](isMobile, "Settings page does not work in mobile yet");',
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
    {
      code: dedent`
        test("foo", ({ browserName }) => {
          switch (browserName) {
            case "firefox":
              test.skip();
              break;
          }
        })
      `,
      name: 'allowConditional with switch statement',
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
    {
      code: dedent`
        const custom = test.extend({});
        custom("a test", () => {});
      `,
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe("describe tests", () => {});
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
