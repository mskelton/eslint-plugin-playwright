import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-duplicate-slow.js'

runRuleTester('no-duplicate-slow', rule, {
  invalid: [
    // Multiple test.slow() in same test
    {
      code: dedent`
        test('should do something', async ({ page }) => {
          test.slow();
          await doSomething();
          test.slow();
        });
      `,
      errors: [{ column: 3, line: 4, messageId: 'noDuplicateSlow' }],
    },
    // Multiple test.slow() in different steps (same test)
    {
      code: dedent`
        test('should do something', async ({ page }) => {
          await test.step('complete first form', async () => {
            test.slow();
            await fillForm();
          });

          await test.step('complete other form', async () => {
            test.slow();
            await page.reload();
            await fillForm();
          });
        });
      `,
      errors: [{ column: 5, line: 8, messageId: 'noDuplicateSlow' }],
    },
    // Three test.slow() calls
    {
      code: dedent`
        test('should do something', async ({ page }) => {
          test.slow();
          test.slow();
          test.slow();
        });
      `,
      errors: [
        { column: 3, line: 3, messageId: 'noDuplicateSlow' },
        { column: 3, line: 4, messageId: 'noDuplicateSlow' },
      ],
    },
    // Global alias
    {
      code: dedent`
        it('should do something', async ({ page }) => {
          it.slow();
          it.slow();
        });
      `,
      errors: [{ column: 3, line: 3, messageId: 'noDuplicateSlow' }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    // File-level test.slow() + test.slow() inside test
    {
      code: dedent`
        test.slow();

        test('should do something', async ({ page }) => {
          test.slow();
          await doSomething();
        });
      `,
      errors: [{ column: 3, line: 4, messageId: 'noDuplicateSlow' }],
    },
    // Multiple file-level test.slow() calls
    {
      code: dedent`
        test.slow(({ browserName }) => browserName === 'webkit', 'slow in Safari');

        test('slow in Safari 1', async ({ page }) => {});
        test('slow in Safari 2', async ({ page }) => {});

        test.slow();
      `,
      errors: [{ column: 1, line: 6, messageId: 'noDuplicateSlow' }],
    },
    // File-level conditional + another file-level
    {
      code: dedent`
        test.slow();
        test.slow();
      `,
      errors: [{ column: 1, line: 2, messageId: 'noDuplicateSlow' }],
    },
    // Multiple test.slow() in same describe
    {
      code: dedent`
        test.describe('suite', () => {
          test.slow();
          test.slow();
        });
      `,
      errors: [{ column: 3, line: 3, messageId: 'noDuplicateSlow' }],
    },
    // Describe-level + test-level in same describe

    {
      code: dedent`
        test.describe('suite', () => {
          test.slow();
          test('foo', async () => {
            test.slow();
          });
        });
      `,
      errors: [{ column: 5, line: 4, messageId: 'noDuplicateSlow' }],
    },
  ],
  valid: [
    // Single test.slow() is valid
    dedent`
      test('should do something', async ({ page }) => {
        test.slow();
        await doSomething();
      });
    `,
    // test.slow() in different tests is valid
    dedent`
      test('test one', async ({ page }) => {
        test.slow();
        await doSomething();
      });

      test('test two', async ({ page }) => {
        test.slow();
        await doSomething();
      });
    `,
    // Conditional test.slow() (single call)
    dedent`
      test('should do something', async ({ browserName }) => {
        test.slow(browserName === 'firefox', 'Slow on Firefox');
        await doSomething();
      });
    `,
    // No test.slow() calls
    dedent`
      test('should do something', async ({ page }) => {
        await doSomething();
      });
    `,
    // Single file-level test.slow() is valid
    'test.slow();',
    // Single file-level conditional test.slow() is valid
    'test.slow(browserName === "webkit", "This feature is slow on Mac")',
    // File-level test.slow() with multiple tests (no duplicates)
    dedent`
      test.slow(({ browserName }) => browserName === 'webkit', 'slow in Safari');

      test('slow in Safari 1', async ({ page }) => {});
      test('slow in Safari 2', async ({ page }) => {});
    `,
    // Global alias - single call is valid
    {
      code: dedent`
        it('should do something', async ({ page }) => {
          it.slow();
          await doSomething();
        });
      `,
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    // test.slow() in sibling describes is valid (separate scopes)
    dedent`
      test.describe('suite 1', () => {
        test.slow();
        test('foo', async () => {});
      });

      test.describe('suite 2', () => {
        test.slow();
        test('bar', async () => {});
      });
    `,
    // Single test.slow() in describe is valid
    dedent`
      test.describe('suite', () => {
        test.slow();
        test('foo', async () => {});
      });
    `,
  ],
})
