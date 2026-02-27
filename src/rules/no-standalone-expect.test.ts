import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
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
      code: dedent`
        test.describe('scenario', () => {
          const t = Math.random() ? test.only : test;
          t('testing', () => expect(true).toBe(false));
        });
      `,
      errors: [{ column: 22, endColumn: 46, messageId }],
    },
    {
      code: dedent`
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
      code: dedent`
        import { expect as pleaseExpect } from '@playwright/test';
        test.describe("a test", () => { pleaseExpect(1).toBe(1); });
      `,
      errors: [{ column: 33, endColumn: 56, messageId }],
    },
    // Global aliases
    {
      code: dedent`
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
    {
      code: dedent`
        const custom = test.extend({});
        custom.describe('a test', () => { expect(1).toBe(1); });
      `,
      errors: [{ column: 35, endColumn: 52, line: 2, messageId }],
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        test.describe('a test', () => { assuming(1).toBe(1); });
      `,
      errors: [{ column: 33, endColumn: 52, line: 2, messageId }],
    },
    {
      code: dedent`
        test.only('foo', () => { expect(1).toBe(1) })
        expect(2).toBe(2)
      `,
      errors: [{ column: 1, line: 2, messageId }],
      name: 'expect after test.only should be flagged',
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
      code: dedent`
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
      code: dedent`
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
    {
      code: dedent`
        const custom = test.extend({});
        custom('an it', () => expect(1).toBe(1));
      `,
    },
    // Fixtures
    {
      code: dedent`
        import { test as base, expect } from '@playwright/test';

        export const test = base.extend({
          clipboardContents: async ({ page }, use) => {
            await expect(page).toHaveURL('example.com');
            const text = await page.evaluate(() => navigator.clipboard.readText());
            await expect(page).toHaveURL('example.com');
            await use(text);
          }
        });

        export { expect } from '@playwright/test';
      `,
      name: 'Allows expect in fixture definitions',
    },
    {
      code: dedent`
        import { test, expect } from '@playwright/test';

        const customTest = test.extend({
          myFixture: async ({ page }, use) => {
            await expect(page).toBeDefined();
            await use(page);
          }
        });
      `,
      name: 'Allows expect in test.extend fixtures',
    },
    {
      code: dedent`
        import { test as base } from '@playwright/test';

        const test = base.extend({
          fixture: async ({}, use) => {
            const value = await Promise.resolve(42);
            expect(value).toBe(42);
            await use(value);
          }
        });
      `,
      name: 'Allows expect in fixture without await',
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        test('an it', () => assuming(1).toBe(1));
      `,
    },
  ],
})
