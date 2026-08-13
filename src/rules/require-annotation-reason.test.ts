import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './require-annotation-reason.js'

runRuleTester('require-annotation-reason', rule, {
  invalid: [
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.skip(isMobile)
        })
      `,
      errors: [{ column: 3, data: { annotation: 'skip' }, line: 2, messageId: 'missingReason' }],
    },
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.fixme(isMobile)
        })
      `,
      errors: [{ data: { annotation: 'fixme' }, line: 2, messageId: 'missingReason' }],
    },
    // No arguments at all
    {
      code: dedent`
        test.describe('foo', () => {
          test.skip()

          test('bar', () => {})
        })
      `,
      errors: [{ line: 2, messageId: 'missingReason' }],
    },
    // A lone string is a condition to Playwright, not a description
    {
      code: dedent`
        test('foo', async () => {
          test.skip('not ready')
        })
      `,
      errors: [{ line: 2, messageId: 'missingReason' }],
    },
    // An empty or whitespace-only reason says nothing
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.skip(isMobile, '')
        })
      `,
      errors: [{ column: 23, endColumn: 25, line: 2, messageId: 'missingReason' }],
    },
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.skip(isMobile, '   ')
        })
      `,
      errors: [{ line: 2, messageId: 'missingReason' }],
    },
    // pattern
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.fixme(isMobile, 'flaky')
        })
      `,
      errors: [
        {
          column: 24,
          data: { annotation: 'fixme', pattern: '/\\b[A-Z]+-\\d+\\b/u' },
          endColumn: 31,
          line: 2,
          messageId: 'reasonMustMatch',
        },
      ],
      options: [{ pattern: '\\b[A-Z]+-\\d+\\b' }],
    },
    // Opt-in annotations
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.slow(isMobile)
        })
      `,
      errors: [{ data: { annotation: 'slow' }, line: 2, messageId: 'missingReason' }],
      options: [{ annotations: ['slow'] }],
    },
    {
      code: dedent`
        test('foo', async ({ browserName }) => {
          test.fail(browserName === 'firefox')
        })
      `,
      errors: [{ data: { annotation: 'fail' }, line: 2, messageId: 'missingReason' }],
      options: [{ annotations: ['fail'] }],
    },
    // Template literal reasons are read too
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.skip(isMobile, \`flaky\`)
        })
      `,
      errors: [{ line: 2, messageId: 'reasonMustMatch' }],
      options: [{ pattern: '\\b[A-Z]+-\\d+\\b' }],
    },
    // Global aliases
    {
      code: dedent`
        it('foo', async ({ isMobile }) => {
          it.skip(isMobile)
        })
      `,
      errors: [{ line: 2, messageId: 'missingReason' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    dedent`
      test('foo', async ({ isMobile }) => {
        test.skip(isMobile, 'ref WET-204 — layout breaks below 768px')
      })
    `,
    dedent`
      test('foo', async ({ isMobile }) => {
        test.fixme(isMobile, 'ref WET-204')
      })
    `,
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.fixme(isMobile, 'ref WET-204')
        })
      `,
      options: [{ pattern: '\\b[A-Z]+-\\d+\\b' }],
    },
    // Describe-level conditional with a callback condition
    dedent`
      test.describe('foo', () => {
        test.skip(({ browserName }) => browserName === 'firefox', 'ref WET-88')

        test('bar', () => {})
      })
    `,
    // A reason built at runtime can't be checked statically, so it's left alone
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.skip(isMobile, reason)
        })
      `,
      options: [{ pattern: '\\b[A-Z]+-\\d+\\b' }],
    },
    dedent`
      test('foo', async ({ isMobile }) => {
        test.skip(isMobile, \`ref \${ticket}\`)
      })
    `,
    // Annotations that aren't configured
    dedent`
      test('foo', async ({ isMobile }) => {
        test.slow(isMobile)
      })
    `,
    dedent`
      test('foo', async ({ browserName }) => {
        test.fail(browserName === 'firefox')
      })
    `,
    {
      code: dedent`
        test('foo', async ({ isMobile }) => {
          test.skip(isMobile)
        })
      `,
      options: [{ annotations: ['fixme'] }],
    },
    // The declaration form has nowhere to put a reason — see no-skipped-test
    `test.skip('foo', async () => {})`,
    `test.fixme('foo', async () => {})`,
    `test.describe.skip('foo', () => {})`,
    // Unrelated config calls
    `test.use({ locale: 'en-GB' })`,
    `test.describe.configure({ mode: 'parallel' })`,
    dedent`
      test('foo', async () => {
        test.setTimeout(60_000)
      })
    `,
  ],
})
