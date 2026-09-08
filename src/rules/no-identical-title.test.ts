import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-identical-title.js'

runRuleTester('no-identical-title', rule, {
  invalid: [
    {
      code: dedent`
        test('foo', () => {})
        test('foo', () => {})
      `,
      errors: [{ column: 6, endColumn: 11, line: 2, messageId: 'multipleTestTitle' }],
    },
    {
      code: dedent`
        test.describe('foo', () => {})
        test.describe('foo', () => {})
      `,
      errors: [{ column: 15, endColumn: 20, line: 2, messageId: 'multipleDescribeTitle' }],
    },
    {
      code: dedent`
        test.describe('parent', () => {
          test('foo', () => {})
          test('foo', () => {})
        })
      `,
      errors: [{ column: 8, endColumn: 13, line: 3, messageId: 'multipleTestTitle' }],
    },
    {
      code: dedent`
        test.describe('parent', () => {
          test.describe('child', () => {})
          test.describe('child', () => {})
        })
      `,
      errors: [{ column: 17, endColumn: 24, line: 3, messageId: 'multipleDescribeTitle' }],
    },
    // Template literals are compared by value
    {
      code: dedent`
        test(\`foo\`, () => {})
        test('foo', () => {})
      `,
      errors: [{ line: 2, messageId: 'multipleTestTitle' }],
    },
    // Modifiers don't change the title comparison
    {
      code: dedent`
        test('foo', () => {})
        test.skip('foo', () => {})
      `,
      errors: [{ line: 2, messageId: 'multipleTestTitle' }],
    },
    {
      code: dedent`
        test.describe.serial('foo', () => {})
        test.describe.parallel('foo', () => {})
      `,
      errors: [{ line: 2, messageId: 'multipleDescribeTitle' }],
    },
    // More than two duplicates report once per extra
    {
      code: dedent`
        test('foo', () => {})
        test('foo', () => {})
        test('foo', () => {})
      `,
      errors: [
        { line: 2, messageId: 'multipleTestTitle' },
        { line: 3, messageId: 'multipleTestTitle' },
      ],
    },
    // Global aliases
    {
      code: dedent`
        it('foo', () => {})
        it('foo', () => {})
      `,
      errors: [{ line: 2, messageId: 'multipleTestTitle' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    dedent`
      test('foo', () => {})
      test('bar', () => {})
    `,
    dedent`
      test.describe('foo', () => {})
      test.describe('bar', () => {})
    `,
    // A test and a describe may share a title
    dedent`
      test.describe('foo', () => {})
      test('foo', () => {})
    `,
    // Sibling describe blocks each get their own scope
    dedent`
      test.describe('parent 1', () => {
        test('foo', () => {})
      })
      test.describe('parent 2', () => {
        test('foo', () => {})
      })
    `,
    // A nested describe may repeat a title used in an ancestor
    dedent`
      test.describe('parent', () => {
        test('foo', () => {})

        test.describe('child', () => {
          test('foo', () => {})
        })
      })
    `,
    // Steps are not checked
    dedent`
      test('foo', async () => {
        await test.step('bar', async () => {})
        await test.step('bar', async () => {})
      })
    `,
    // Non-static titles can't be compared
    dedent`
      test(title, () => {})
      test(title, () => {})
    `,
    dedent`
      test(\`foo \${bar}\`, () => {})
      test(\`foo \${bar}\`, () => {})
    `,
    // Anonymous describe blocks have no title
    dedent`
      test.describe(() => {})
      test.describe(() => {})
    `,
  ],
})
