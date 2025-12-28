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
        { line: 4, messageId: 'missingWhitespace' },
        { line: 6, messageId: 'missingWhitespace' },
        { line: 7, messageId: 'missingWhitespace' },
        { line: 8, messageId: 'missingWhitespace' },
        { line: 10, messageId: 'missingWhitespace' },
      ],
      name: 'missing blank lines before test blocks',
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
  ],
  valid: [
    {
      code: dedent`
        test('should pass', () => {});

        test('should pass', () => {});
      `,
      name: 'blank line between simple test blocks',
    },
    {
      code: dedent`
        test.beforeEach(() => {});

        test.skip('should pass', () => {});
      `,
      name: 'blank line between test modifiers',
    },
    {
      code: dedent`
        test('should pass', async () => {
            await test.step('should pass', () => {});

            await test.step('should pass', () => {});
        });
      `,
      name: 'blank line between nested steps in async test',
    },
    {
      code: dedent`
        test('should pass', async () => {
            await test.step('should pass', () => {});

            // some comment
            await test.step('should pass', () => {});
        });
      `,
      name: 'nested steps with a line comment in between',
    },
    {
      code: dedent`
        test('should pass', async () => {
            await test.step('should pass', () => {});

            /**
             * another comment
             */
            await test.step('should pass', () => {});
        });
      `,
      name: 'nested steps with a block comment in between',
    },
    {
      code: dedent`
        test('assign', async () => {
            let foo = await test.step('should pass', () => {});

            foo = await test.step('should pass', () => {});
        });
      `,
      name: 'assignments initialized by test.step',
    },
    {
      code: dedent`
        test('assign', async () => {
            let { foo } = await test.step('should pass', () => {});

            ({ foo } = await test.step('should pass', () => {}));
        });
      `,
      name: 'destructuring assignments initialized by test.step',
    },
  ],
})
