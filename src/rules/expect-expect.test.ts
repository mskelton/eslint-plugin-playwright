import rule from '../../src/rules/expect-expect.js'
import { javascript, runRuleTester } from '../utils/rule-tester.js'

runRuleTester('expect-expect', rule, {
  invalid: [
    {
      code: 'test("should fail", () => {});',
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
    },
    {
      code: 'test.skip("should fail", () => {});',
      errors: [{ messageId: 'noAssertions', type: 'MemberExpression' }],
    },
    {
      code: javascript`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
    },
    {
      code: javascript`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      errors: [{ messageId: 'noAssertions', type: 'Identifier' }],
      name: 'Custom assert function',
      options: [{ assertFunctionNames: ['wayComplexCustomCondition'] }],
    },
    {
      code: javascript`
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
      code: javascript`
        test('steps', async ({ page }) => {
          await test.step('first tab', async () => {
            await expect(page.getByText('Hello')).toBeVisible();
          });
        });
      `,
    },
    {
      code: javascript`
        test.only('steps', async ({ page }) => {
          await test.step('first tab', async () => {
            await expect(page.getByText('Hello')).toBeVisible();
          });
        });
      `,
    },
    {
      code: javascript`
        test.only('steps', async ({ page }) => {
          await test.step.skip('first tab', async () => {
            await expect(page.getByText('Hello')).toBeVisible();
          });
        });
      `,
    },
    {
      code: javascript`
        test('should fail', async ({ page }) => {
          await assertCustomCondition(page)
        })
      `,
      name: 'Custom assert function',
      options: [{ assertFunctionNames: ['assertCustomCondition'] }],
    },
    {
      code: javascript`
        test('should fail', async ({ myPage, page }) => {
          await myPage.assertCustomCondition(page)
        })
      `,
      name: 'Custom assert class method',
      options: [{ assertFunctionNames: ['assertCustomCondition'] }],
    },
    {
      code: javascript`
        test('should pass', async ({ page }) => {
          await verifyElementVisible(page.locator('button'))
        })
      `,
      name: 'Custom assert function matching regex pattern',
      options: [{ assertFunctionPatterns: ['^verify.*'] }],
    },
    {
      code: javascript`
        test('should pass', async ({ page }) => {
          await page.checkTextContent('Hello')
          await validateUserLoggedIn(page)
        })
      `,
      name: 'Multiple custom assert functions matching different regex patterns',
      options: [{ assertFunctionPatterns: ['^check.*', '^validate.*'] }],
    },
    {
      code: javascript`
        test('should pass', async ({ page }) => {
          await myCustomAssert(page)
          await anotherAssertion(true)
        })
      `,
      name: 'Mixed string and regex pattern matching',
      options: [{ 
        assertFunctionNames: ['myCustomAssert'],
        assertFunctionPatterns: ['.*Assertion$'] 
      }],
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
