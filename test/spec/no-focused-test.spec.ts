import rule from '../../src/rules/no-focused-test';
import { runRuleTester } from '../utils/rule-tester';

const messageId = 'noFocusedTest';

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
  ],
});
