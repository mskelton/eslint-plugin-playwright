import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-focused-test.js'

const messageId = 'noFocusedTest'

runRuleTester('no-focused-test', rule, {
  invalid: [
    {
      code: 'test.describe.only("skip this describe", () => {});',
      errors: [
        {
          column: 15,
          endColumn: 19,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test.describe("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.describe["only"]("skip this describe", () => {});',
      errors: [
        {
          column: 15,
          endColumn: 21,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test.describe("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test["describe"][`only`]("skip this describe", () => {});',
      errors: [
        {
          column: 18,
          endColumn: 24,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test["describe"]("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.describe.parallel.only("skip this describe", () => {});',
      errors: [
        {
          column: 24,
          endColumn: 28,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test.describe.parallel("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.describe.serial.only("skip this describe", () => {});',
      errors: [
        {
          column: 22,
          endColumn: 26,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test.describe.serial("skip this describe", () => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test.only("skip this test", async ({code: page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 10,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test("skip this test", async ({code: page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test["only"]("skip this test", async ({code: page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 12,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test("skip this test", async ({code: page }) => {});',
            },
          ],
        },
      ],
    },
    {
      code: 'test[`only`]("skip this test", async ({code: page }) => {});',
      errors: [
        {
          column: 6,
          endColumn: 12,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'test("skip this test", async ({code: page }) => {});',
            },
          ],
        },
      ],
    },
    // Global aliases
    {
      code: 'it.only("skip this test", () => {});',
      errors: [
        {
          column: 4,
          endColumn: 8,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'it("skip this test", () => {});',
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
        custom.only("skip this test", () => {});
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          line: 2,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: dedent`
                const custom = test.extend({});
                custom("skip this test", () => {});
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'it.describe.only("skip this describe", () => {});',
      errors: [
        {
          column: 13,
          endColumn: 17,
          line: 1,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: 'it.describe("skip this describe", () => {});',
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
        import { test as custom } from '@playwright/test';
        custom.only("skip this test", () => {});
      `,
      errors: [
        {
          column: 8,
          endColumn: 12,
          line: 2,
          messageId,
          suggestions: [
            {
              messageId: 'suggestRemoveOnly',
              output: dedent`
                import { test as custom } from '@playwright/test';
                custom("skip this test", () => {});
              `,
            },
          ],
        },
      ],
    },
  ],
  valid: [
    'test.describe("describe tests", () => {});',
    'test.describe.skip("describe tests", () => {});',
    'test("one", async ({code: page }) => {});',
    'test.fixme(isMobile, "Settings page does not work in mobile yet");',
    'test["fixme"](isMobile, "Settings page does not work in mobile yet");',
    'test[`fixme`](isMobile, "Settings page does not work in mobile yet");',
    'test.slow();',
    'test["slow"]();',
    'test[`slow`]();',
    'const only = true;',
    'function only() {code: return null };',
    'this.only();',
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
      code: 'it.describe("a describe", () => {});',
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
        custom.describe("a describe", () => {});
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
