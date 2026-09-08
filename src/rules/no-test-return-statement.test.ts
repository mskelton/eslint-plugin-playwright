import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-test-return-statement.js'

runRuleTester('no-test-return-statement', rule, {
  invalid: [
    {
      code: dedent`
        test('foo', () => {
          return expect(1).toBe(1)
        })
      `,
      errors: [{ column: 3, endColumn: 27, line: 2, messageId: 'noReturnValue' }],
    },
    {
      code: dedent`
        test('foo', async ({ page }) => {
          return page.goto('/')
        })
      `,
      errors: [{ column: 3, line: 2, messageId: 'noReturnValue' }],
    },
    // A bare return is still dead code at the top level of a test
    {
      code: dedent`
        test('foo', () => {
          return
        })
      `,
      errors: [{ column: 3, line: 2, messageId: 'noReturnValue' }],
    },
    // Options object between the title and the body
    {
      code: dedent`
        test('foo', { tag: '@slow' }, async ({ page }) => {
          return page.goto('/')
        })
      `,
      errors: [{ column: 3, line: 2, messageId: 'noReturnValue' }],
    },
    // Global aliases
    {
      code: dedent`
        it('foo', () => {
          return expect(1).toBe(1)
        })
      `,
      errors: [{ column: 3, line: 2, messageId: 'noReturnValue' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    dedent`
      test('foo', () => {
        expect(1).toBe(1)
      })
    `,
    dedent`
      test('foo', async ({ page }) => {
        await page.goto('/')
      })
    `,
    // Returns nested inside the test body are early exits, not test results
    dedent`
      test('foo', ({ page }) => {
        if (!page) {
          return
        }

        expect(1).toBe(1)
      })
    `,
    // Returns inside a callback declared in the test
    dedent`
      test('foo', async ({ page }) => {
        await test.step('bar', () => {
          return expect(1).toBe(1)
        })
      })
    `,
    // Concise arrow bodies are not return statements
    `test('foo', () => expect(1).toBe(1))`,
    // Hooks and describe blocks are not checked
    dedent`
      test.beforeEach(() => {
        return setup()
      })
    `,
    dedent`
      test.describe('foo', () => {
        return
      })
    `,
    // Functions that aren't used as a test body
    dedent`
      function helper() {
        return 1
      }

      test('foo', () => {
        expect(helper()).toBe(1)
      })
    `,
    // Test bodies passed by reference aren't parsed as tests by this plugin
    dedent`
      function testFoo() {
        return expect(1).toBe(1)
      }

      test('foo', testFoo)
    `,
  ],
})
