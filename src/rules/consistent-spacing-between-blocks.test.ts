import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './consistent-spacing-between-blocks.js'

runRuleTester('consistent-spacing-between-blocks', rule, {
  invalid: [
    {
      code: dedent`
        test.beforeEach('should pass', () => {});
        test('should fail', async () => {
            await test.step('should pass', () => {});
            // a comment
            test.step('should fail', () => {});
            test.step('should fail', () => {});
            const foo = await test.step('should fail', () => {});
            foo = await test.step('should fail', () => {});
        });
        /**
         * another comment
         */
        test('should fail', () => {});
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 5, messageId: 'missingWhitespace' },
        { line: 6, messageId: 'missingWhitespace' },
        { line: 7, messageId: 'missingWhitespace' },
        { line: 8, messageId: 'missingWhitespace' },
        { line: 13, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        test.beforeEach('should pass', () => {});

        test('should fail', async () => {
            await test.step('should pass', () => {});

            // a comment
            test.step('should fail', () => {});

            test.step('should fail', () => {});

            const foo = await test.step('should fail', () => {});

            foo = await test.step('should fail', () => {});
        });

        /**
         * another comment
         */
        test('should fail', () => {});
      `,
    },
    {
      code: dedent`
        const someText = 'abc';
        test.afterAll(() => {
        });
        test.describe('someText', () => {
          const something = 'abc';
          // A comment
          test.afterAll(() => {
            // stuff
          });
          test.afterAll(() => {
            // other stuff
          });
        });

        test.describe('someText', () => {
          const something = 'abc';
          test.afterAll(() => {
            // stuff
          });
        });
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 4, messageId: 'missingWhitespace' },
        { line: 7, messageId: 'missingWhitespace' },
        { line: 10, messageId: 'missingWhitespace' },
        { line: 17, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        const someText = 'abc';

        test.afterAll(() => {
        });

        test.describe('someText', () => {
          const something = 'abc';

          // A comment
          test.afterAll(() => {
            // stuff
          });

          test.afterAll(() => {
            // other stuff
          });
        });

        test.describe('someText', () => {
          const something = 'abc';

          test.afterAll(() => {
            // stuff
          });
        });
      `,
    },
    {
      code: dedent`
        test('does something', () => {});
        const someVariable = 'value';
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        test('does something', () => {});

        const someVariable = 'value';
      `,
    },
    {
      code: dedent`
        test('does something', () => {});
        function helperFunction() {
          return true;
        }
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        test('does something', () => {});

        function helperFunction() {
          return true;
        }
      `,
    },
    {
      code: dedent`
        test('does something', () => {});
        // A comment after test
        const x = 1;
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        test('does something', () => {});

        // A comment after test
        const x = 1;
      `,
    },
    {
      code: dedent`
        test.describe('My Test', () => {
          test('does something', () => {});
          const helper = 'value';
        });
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('My Test', () => {
          test('does something', () => {});

          const helper = 'value';
        });
      `,
    },
    {
      code: dedent`
        test('first test', () => {});
        export const config = { timeout: 5000 };
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        test('first test', () => {});

        export const config = { timeout: 5000 };
      `,
    },
    {
      code: dedent`
        test.beforeEach(() => {});
        const setup = 'value';
        test('does something', () => {});
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 3, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        test.beforeEach(() => {});

        const setup = 'value';

        test('does something', () => {});
      `,
    },
    {
      code: dedent`
        test("first", () => {});test("second", () => {});
        test.describe("suite", () => {});test("test", () => {});
      `,
      errors: [
        { line: 1, messageId: 'missingWhitespace' },
        { line: 2, messageId: 'missingWhitespace' },
        { line: 2, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        test("first", () => {});

        test("second", () => {});

        test.describe("suite", () => {});

        test("test", () => {});
      `,
    },
  ],
  valid: [
    {
      code: dedent`
        const a = 'value';
        doSomething('does something', () => {});
        const b = 'value';
        testing('does something', () => {});
        testing.beforeEach(() => {});
        helloWorld();
        class C{}
        function helloWorld() {}
        let d = 'value';
        if (e) {
          doSomething('does something', () => {});
        }
      `,
    },
    {
      code: dedent`
        test('does something', () => {});

        const someVariable = 'value';
      `,
    },
    {
      code: dedent`
        test('does something', () => {});

        function helperFunction() {
          return true;
        }
      `,
    },
    {
      code: dedent`
        test('does something', () => {});

        // A comment after test
        const x = 1;
      `,
    },
    {
      code: dedent`
        test.describe('My Test', () => {
          test('does something', () => {});

          const helper = 'value';
        });
      `,
    },
    {
      code: dedent`
        test('first test', () => {});

        export const config = { timeout: 5000 };
      `,
    },
    {
      code: dedent`
        test.beforeEach(() => {});

        const setup = 'value';

        test('does something', () => {});
      `,
    },
  ],
})

runRuleTester('consistent-spacing-between-blocks - globalAliases', rule, {
  invalid: [
    {
      code: dedent`
        it('first test', () => {});
        it('second test', () => {});
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        it('first test', () => {});

        it('second test', () => {});
      `,
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
    {
      code: dedent`
        it.describe('suite', () => {
          it.beforeEach(() => {});
          it('does something', () => {});
        });
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        it.describe('suite', () => {
          it.beforeEach(() => {});

          it('does something', () => {});
        });
      `,
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [],
})

runRuleTester('consistent-spacing-between-blocks - import alias', rule, {
  invalid: [
    {
      code: dedent`
        import { test as base } from '@playwright/test';
        base('first test', () => {});
        base('second test', () => {});
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 3, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        import { test as base } from '@playwright/test';

        base('first test', () => {});

        base('second test', () => {});
      `,
    },
    {
      code: dedent`
        import { test as base } from '@playwright/test';
        base.describe('suite', () => {
          base.beforeEach(() => {});
          base('does something', () => {});
        });
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 4, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        import { test as base } from '@playwright/test';

        base.describe('suite', () => {
          base.beforeEach(() => {});

          base('does something', () => {});
        });
      `,
    },
  ],
  valid: [],
})

runRuleTester('consistent-spacing-between-blocks - test.extend', rule, {
  invalid: [
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom('first test', () => {});
        custom('second test', () => {});
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 3, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });

        custom('first test', () => {});

        custom('second test', () => {});
      `,
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom.describe('suite', () => {
          custom.beforeEach(() => {});
          custom('does something', () => {});
        });
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });

        custom.describe('suite', () => {
          custom.beforeEach(() => {});
          custom('does something', () => {});
        });
      `,
    },
  ],
  valid: [],
})

runRuleTester('consistent-spacing-between-blocks - Mocha tests', rule, {
  invalid: [
    {
      code: dedent`
        test.describe('My Test', function () {
          test('does something', () => {});
          test.afterEach(() => {});
        });
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('My Test', function () {
          test('does something', () => {});

          test.afterEach(() => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('My Test', () => {
          test.beforeEach(() => {});
          test('does something', () => {});
        });
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('My Test', () => {
          test.beforeEach(() => {});

          test('does something', () => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('Variable declaration', () => {
          const a = 1;
          test('uses a variable', () => {});
        });
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('Variable declaration', () => {
          const a = 1;

          test('uses a variable', () => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('Same line blocks', () => {
          test('block one', () => {});
          test('block two', () => {});
        });
      `,
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('Same line blocks', () => {
          test('block one', () => {});

          test('block two', () => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('Same line blocks', () => {
          test('block one', () => {})
            .timeout(42);
          test('block two', () => {});
        });
      `,
      errors: [{ line: 4, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('Same line blocks', () => {
          test('block one', () => {})
            .timeout(42);

          test('block two', () => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe("", () => {});
        test.describe("", () => {});
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe("", () => {});

        test.describe("", () => {});
      `,
    },
    {
      code: dedent`
        test.describe('one', () => {});
        test.describe('two', () => {});
      `,
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      output: dedent`
        test.describe('one', () => {});

        test.describe('two', () => {});
      `,
    },
  ],
  valid: [
    {
      code: dedent`
        test.describe('one', () => {});

        test.describe('two', () => {});
      `,
    },
    {
      code: dedent`
        test.describe('My Test', () => {
          test('does something', () => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('My Test', () => {
          test('performs action one', () => {});

          test('performs action two', () => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('Outer block', () => {
          test.describe('Inner block', () => {
            test('performs an action', () => {});
          });

          test.afterEach(() => {});
        });
      `,
    },
    {
      code: dedent`
        test.describe('My Test With Comments', () => {
          test('does something', () => {});

          // Some comment
          test.afterEach(() => {});
        });
      `,
    },
    {
      code: dedent`
        test('does something outside a describe block', () => {});

        test.afterEach(() => {});
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('bar', () => {}).timeout(42);
        });
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('bar', () => {}).timeout(42);

          test('baz', () => {}).timeout(42);
        });
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          test('bar', () => {})
            .timeout(42);

          test('baz', () => {})
            .timeout(42);
        });
      `,
    },
    {
      code: dedent`
        test.describe('foo', () => {
          [
            { title: 'bar' },
            { title: 'baz' },
          ].forEach((testCase) => {
            test(testCase.title, () => {});
          });
        });
      `,
    },
  ],
})

runRuleTester('consistent-spacing-between-blocks - Jest tests', rule, {
  invalid: [
    {
      code: dedent`
        const someText = 'abc';
        test.afterAll(() => {
        });
        test.describe('someText', () => {
          const something = 'abc';
          // A comment
          test.afterAll(() => {
            // stuff
          });
          test.afterAll(() => {
            // other stuff
          });
        });

        test.describe('someText', () => {
          const something = 'abc';
          test.afterAll(() => {
            // stuff
          });
        });
      `,
      errors: [
        { column: 1, line: 2, messageId: 'missingWhitespace' },
        { column: 1, line: 4, messageId: 'missingWhitespace' },
        { column: 3, line: 7, messageId: 'missingWhitespace' },
        { column: 3, line: 10, messageId: 'missingWhitespace' },
        { column: 3, line: 17, messageId: 'missingWhitespace' },
      ],
      output: dedent`
        const someText = 'abc';

        test.afterAll(() => {
        });

        test.describe('someText', () => {
          const something = 'abc';

          // A comment
          test.afterAll(() => {
            // stuff
          });

          test.afterAll(() => {
            // other stuff
          });
        });

        test.describe('someText', () => {
          const something = 'abc';

          test.afterAll(() => {
            // stuff
          });
        });
      `,
    },
    {
      code: dedent`
        const someText = 'abc'
        ;test.afterEach(() => {})
      `,
      errors: [
        {
          column: 2,
          line: 2,
          messageId: 'missingWhitespace',
        },
      ],
      output: dedent`
        const someText = 'abc'

        ;test.afterEach(() => {})
      `,
    },
    {
      code: dedent`
        const someText = 'abc';
        xyz:
        test.afterEach(() => {});
      `,
      errors: [
        {
          column: 1,
          line: 3,
          messageId: 'missingWhitespace',
        },
      ],
      output: dedent`
        const someText = 'abc';

        xyz:
        test.afterEach(() => {});
      `,
    },
    {
      code: dedent`
        const expr = 'Papayas';
        test.beforeEach(() => {});
        test('does something?', async () => {
          switch (expr) {
            case 'Oranges':
              await test.step('should pass', () => {});
              break;
            case 'Mangoes':
            case 'Papayas':
              const v = 1;
              await test.step('should pass', () => {});
              console.log('Mangoes and papayas are $2.79 a pound.');
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            default:
              console.log(\`Sorry, we are out of $\{expr}.\`);
          }
        });
      `,
      errors: [
        {
          column: 1,
          endColumn: 27,
          endLine: 2,
          line: 2,
          messageId: 'missingWhitespace',
        },
        {
          column: 1,
          endColumn: 4,
          endLine: 18,
          line: 3,
          messageId: 'missingWhitespace',
        },
        {
          column: 7,
          endColumn: 13,
          endLine: 7,
          line: 7,
          messageId: 'missingWhitespace',
        },
        {
          column: 7,
          endColumn: 48,
          endLine: 11,
          line: 11,
          messageId: 'missingWhitespace',
        },
        {
          column: 7,
          endColumn: 61,
          endLine: 12,
          line: 12,
          messageId: 'missingWhitespace',
        },
      ],
      output: dedent`
        const expr = 'Papayas';

        test.beforeEach(() => {});

        test('does something?', async () => {
          switch (expr) {
            case 'Oranges':
              await test.step('should pass', () => {});

              break;
            case 'Mangoes':
            case 'Papayas':
              const v = 1;

              await test.step('should pass', () => {});

              console.log('Mangoes and papayas are $2.79 a pound.');
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            default:
              console.log(\`Sorry, we are out of $\{expr}.\`);
          }
        });
      `,
    },
  ],
  valid: [
    {
      code: dedent`
        xyz:
        test.afterEach(() => {});
      `,
    },
    {
      code: dedent`
        const someText = 'abc';

        test.afterAll(() => {
        });

        test.describe('someText', () => {
          const something = 'abc';

          // A comment
          test.afterAll(() => {
            // stuff
          });

          test.afterAll(() => {
            // other stuff
          });
        });

        test.describe('someText', () => {
          const something = 'abc';

          test.afterAll(() => {
            // stuff
          });
        });
      `,
    },
  ],
})
