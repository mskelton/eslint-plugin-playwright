import dedent from 'dedent'
import { runRuleTester, runTSRuleTester } from '../utils/rule-tester.js'
import rule from './no-export.js'

runRuleTester('no-export', rule, {
  invalid: [
    {
      code: dedent`
        export const myThing = 'foo'
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        export default function () {}
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        export * from './helpers'
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        const myThing = 'foo'
        export { myThing }
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 2, messageId: 'unexpectedExport' }],
    },
    // A describe block is enough to make this a test file
    {
      code: dedent`
        export const myThing = 'foo'
        test.describe('foo', () => {
          test('bar', () => {})
        })
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
    // Every export is reported
    {
      code: dedent`
        export const a = 'a'
        export const b = 'b'
        test('foo', () => {})
      `,
      errors: [
        { line: 1, messageId: 'unexpectedExport' },
        { line: 2, messageId: 'unexpectedExport' },
      ],
    },
    // CommonJS exports
    {
      code: dedent`
        module.exports = {}
        test('foo', () => {})
      `,
      errors: [{ column: 1, endColumn: 15, line: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        module.exports.myThing = 'foo'
        test('foo', () => {})
      `,
      errors: [{ column: 1, endColumn: 23, line: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        module.export.myThing = 'foo'
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
    // Global aliases
    {
      code: dedent`
        export const myThing = 'foo'
        it('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    // No tests in the file, so it's not a test file
    `export const myThing = 'foo'`,
    `export default function () {}`,
    `module.exports = {}`,
    // Tests without exports
    dedent`
      test('foo', () => {})
      test.describe('bar', () => {
        test('baz', () => {})
      })
    `,
    // Imports are fine
    dedent`
      import { expect, test } from '@playwright/test'

      test('foo', async ({ page }) => {
        await expect(page).toHaveTitle('foo')
      })
    `,
    // A local `module` variable is not CommonJS
    dedent`
      const module = { exports: {} }
      module.exports = {}
      test('foo', () => {})
    `,
    // Not an assignment to module.exports
    dedent`
      thing.module.exports = {}
      test('foo', () => {})
    `,
  ],
})

runTSRuleTester('no-export (typescript)', rule, {
  invalid: [
    {
      code: dedent`
        export = myThing
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
    {
      code: dedent`
        export type Foo = string
        test('foo', () => {})
      `,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedExport' }],
    },
  ],
  valid: [`export = myThing`],
})
