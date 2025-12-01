import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './expect-expect.js'

runRuleTester('expect-expect', rule, {
  invalid: [
    {
      code: 'test("should fail", () => {});',
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
    },
    {
      code: dedent`
        import { test as stuff } from '@playwright/test';
        stuff("should fail", () => {});
      `,
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
      name: 'Imported alias for test without assertions',
    },
    {
      code: 'test.skip("should fail", () => {});',
      errors: [{ messageId: 'noAssertions', type: 'MemberExpression' }],
    },
    {
      code: dedent`
        import { test as stuff } from '@playwright/test';
        stuff.skip("should fail", () => {});
      `,
      errors: [{ messageId: 'noAssertions', type: 'MemberExpression' }],
      name: 'Imported alias for test.skip without assertions',
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
      name: 'Custom assert function',
      options: [{ assertFunctionNames: ['wayComplexCustomCondition'] }],
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
      name: 'Custom assert function pattern mismatch',
      options: [{ assertFunctionPatterns: ['^verify.*', '^check.*'] }],
    },
    {
      code: 'it("should pass", () => hi(true).toBeDefined())',
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
      name: 'Global aliases',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'foo();',
    '["bar"]();',
    'testing("will test something eventually", () => {})',
    'test("should pass", () => expect(true).toBeDefined())',
    'test("should pass", () => test.expect(true).toBeDefined())',
    'test.slow("should pass", () => expect(true).toBeDefined())',
    'test.skip("should pass", () => expect(true).toBeDefined())',
    // Config methods
    'test.describe.configure({ mode: "parallel" })',
    'test.info()',
    'test.use({ locale: "en-US" })',
    // test.skip
    'test.skip();',
    'test.skip(true);',
    'test.skip(browserName === "Chrome", "This feature is skipped on Chrome")',
    'test.skip(({ browserName }) => browserName === "Chrome");',
    'test.skip("foo", () => { expect(true).toBeDefined(); })',
    // test.slow
    'test.slow();',
    'test.slow(true);',
    'test.slow(browserName === "webkit", "This feature is slow on Mac")',
    'test.slow(({ browserName }) => browserName === "Chrome");',
    'test.slow("foo", () => { expect(true).toBeDefined(); })',
    // test.step
    {
      code: dedent`
        test('steps', async ({ page }) => {
          await test.step('first tab', async () => {
            await expect(page.getByText('Hello')).toBeVisible();
          });
        });
      `,
    },
    {
      code: dedent`
        test.only('steps', async ({ page }) => {
          await test.step('first tab', async () => {
            await expect(page.getByText('Hello')).toBeVisible();
          });
        });
      `,
    },
    {
      code: dedent`
        test.only('steps', async ({ page }) => {
          await test.step.skip('first tab', async () => {
            await expect(page.getByText('Hello')).toBeVisible();
          });
        });
      `,
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      name: 'Custom assert function',
      options: [{ assertFunctionNames: ['assertCustomCondition'] }],
    },
    {
      code: dedent`
        test('should fail', async ({ myPage, page }) => {
          await myPage.assertCustomCondition(page)
        })
      `,
      name: 'Custom assert class method',
      options: [{ assertFunctionNames: ['assertCustomCondition'] }],
    },
    {
      code: dedent`
        import { test as stuff, expect as check } from '@playwright/test';
        stuff('works', () => { check(1).toBe(1); });
      `,
      name: 'Imported aliases for test and expect',
    },
    {
      code: dedent`
        import { test as stuff } from '@playwright/test';
        stuff('works', () => { stuff.expect(1).toBe(1); });
      `,
      name: 'Aliased test with property expect',
    },
    {
      code: dedent`
        import { test as stuff, expect } from '@playwright/test';
        stuff('works', () => { expect(1).toBe(1); });
      `,
      name: 'Aliased test with direct expect',
    },
    {
      code: dedent`
        import { test, expect as check } from '@playwright/test';
        test('works', () => { check(1).toBe(1); });
      `,
      name: 'Direct test with aliased expect',
    },
    {
      code: dedent`
        test('should pass', async ({ page }) => {
          await verifyElementVisible(page.locator('button'))
        })
      `,
      name: 'Custom assert function matching regex pattern',
      options: [{ assertFunctionPatterns: ['^verify.*'] }],
    },
    {
      code: dedent`
        test('should pass', async ({ page }) => {
          await page.checkTextContent('Hello')
          await validateUserLoggedIn(page)
        })
      `,
      name: 'Multiple custom assert functions matching different regex patterns',
      options: [{ assertFunctionPatterns: ['^check.*', '^validate.*'] }],
    },
    {
      code: dedent`
        test('should pass', async ({ page }) => {
          await myCustomAssert(page)
          await anotherAssertion(true)
        })
      `,
      name: 'Mixed string and regex pattern matching',
      options: [
        {
          assertFunctionNames: ['myCustomAssert'],
          assertFunctionPatterns: ['.*Assertion$'],
        },
      ],
    },
    {
      code: 'it("should pass", () => expect(true).toBeDefined())',
      name: 'Global alias - test',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: 'test("should pass", () => assert(true).toBeDefined())',
      name: 'Global alias - assert',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
