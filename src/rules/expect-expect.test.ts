import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './expect-expect.js'

runRuleTester('expect-expect', rule, {
  invalid: [
    {
      code: 'test("should fail", () => {});',
      errors: [{ column: 1, endColumn: 5, line: 1, messageId: 'noAssertions' }],
    },
    {
      code: 'test.skip("should fail", () => {});',
      errors: [{ column: 1, endColumn: 10, line: 1, messageId: 'noAssertions' }],
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ column: 1, endColumn: 5, line: 1, messageId: 'noAssertions' }],
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ column: 1, endColumn: 5, line: 1, messageId: 'noAssertions' }],
      name: 'Custom assert function',
      options: [{ assertFunctionNames: ['wayComplexCustomCondition'] }],
    },
    {
      code: dedent`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ column: 1, endColumn: 5, line: 1, messageId: 'noAssertions' }],
      name: 'Custom assert function pattern mismatch',
      options: [{ assertFunctionPatterns: ['^verify.*', '^check.*'] }],
    },
    {
      code: 'it("should pass", () => hi(true).toBeDefined())',
      errors: [{ column: 1, endColumn: 3, line: 1, messageId: 'noAssertions' }],
      name: 'Global aliases',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("should fail", () => {});
      `,
      errors: [{ column: 1, endColumn: 7, line: 2, messageId: 'noAssertions' }],
    },
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("should fail", () => {});
      `,
      errors: [{ column: 1, endColumn: 7, line: 2, messageId: 'noAssertions' }],
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
      code: dedent`
        const custom = test.extend({});
        custom("should pass", () => expect(true).toBeDefined());
      `,
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
    {
      code: dedent`
        import { test as custom } from '@playwright/test';
        custom("should pass", () => expect(true).toBeDefined());
      `,
    },
  ],
})
