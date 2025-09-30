import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './no-standalone-expect.js'

const messageId = 'unexpectedExpect'

runRuleTester('no-standalone-expect', rule, {
  invalid: [
    {
      code: 'test.describe("a test", () => { expect(1).toBe(1); });',
      errors: [{ column: 33, endColumn: 50, messageId }],
    },
    {
      code: 'test.describe("a test", () => { expect.soft(1).toBe(1); });',
      errors: [{ column: 33, endColumn: 55, messageId }],
    },
    {
      code: 'test.describe("a test", () => { expect.poll(() => 1).toBe(1); });',
      errors: [{ column: 33, endColumn: 61, messageId }],
    },
    {
      code: "(() => {})('testing', () => expect(true).toBe(false))",
      errors: [{ column: 29, endColumn: 53, messageId }],
    },
    {
      code: javascript`
        test.describe('scenario', () => {
          const t = Math.random() ? test.only : test;
          t('testing', () => expect(true).toBe(false));
        });
      `,
      errors: [{ column: 22, endColumn: 46, messageId }],
    },
    {
      code: javascript`
        it.describe('scenario', () => {
          it('testing', () => expect(true).toBe(false));
        });
      `,
      errors: [{ column: 23, endColumn: 47, messageId }],
    },
    {
      code: 'test.describe("a test", () => expect(6).toBe(1));',
      errors: [{ column: 31, endColumn: 48, messageId }],
    },
    {
      code: 'test.describe("a test", () => { const func = () => { expect(6).toBe(1); }; expect(1).toBe(1); });',
      errors: [{ column: 76, endColumn: 93, messageId }],
    },
    {
      code: 'test.describe("a test", () => {  test("foo", () => { expect(1).toBe(1); }); expect(1).toBe(1); });',
      errors: [{ column: 77, endColumn: 94, messageId }],
    },
    {
      code: 'expect(1).toBe(1);',
      errors: [{ column: 1, endColumn: 18, messageId }],
    },
    {
      code: '{expect(1).toBe(1)}',
      errors: [{ column: 2, endColumn: 19, messageId }],
    },
    {
      code: javascript`
        import { expect as pleaseExpect } from '@playwright/test';
        test.describe("a test", () => { pleaseExpect(1).toBe(1); });
      `,
      errors: [{ column: 33, endColumn: 56, messageId }],
    },
    // Global aliases
    {
      code: javascript`
        test.describe('scenario', () => {
          const t = Math.random() ? test.only : test;
          t('testing', () => assert(true).toBe(false));
        });
      `,
      errors: [{ column: 22, endColumn: 46, messageId }],
      settings: {
        playwright: {
          globalAliases: {
            expect: ['assert'],
            test: ['it'],
          },
        },
      },
    },
  ],
  valid: [
    'expect.any(String)',
    'expect.extend({})',
    'test.describe("a test", () => { test("an it", () => {expect(1).toBe(1); }); });',
    'test.describe("a test", () => { test("an it", () => { const func = () => { expect(1).toBe(1); }; }); });',
    'test.describe("a test", () => { const func = () => { expect(1).toBe(1); }; });',
    'test.describe("a test", () => { function func() { expect(1).toBe(1); }; });',
    'test.describe("a test", () => { const func = function(){ expect(1).toBe(1); }; });',
    'test("an it", () => expect(1).toBe(1))',
    'test("an it", () => expect.soft(1).toBe(1))',
    'test("an it", () => expect.poll(() => locator)[`not`][`toBeHidden`]())',
    'const func = function(){ expect(1).toBe(1); };',
    'const func = () => expect(1).toBe(1);',
    '{}',
    'test.only("an only", value => { expect(value).toBe(true); });',
    'class Helper { foo() { expect(1).toBe(1); } }',
    'class Helper { foo = () => { expect(1).toBe(1); } }',
    {
      code: javascript`
        test.describe('Test describe', () => {
          test.beforeAll(async ({ page }) => {
            await page.goto('https://google.com');
            await expect(page.getByRole('button')).toBeVisible();
          });
        });
      `,
      name: 'Allows expect in hooks',
    },
    // Global aliases
    {
      code: javascript`
        it.describe('scenario', () => {
          it('testing', () => assert(true));
        });
      `,
      settings: {
        playwright: {
          globalAliases: {
            expect: ['assert'],
            test: ['it'],
          },
        },
      },
    },
  ],
})
