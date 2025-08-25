import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './consistent-spacing-between-blocks.js'

runRuleTester('consistent-spacing-between-blocks', rule, {
  invalid: [
    {
      code: javascript`
        test.beforeEach('Test 1', () => {});
        test('Test 2', async () => {
            await test.step('Step 1', () => {});
            // a comment
            test.step('Step 2', () => {});
            test.step('Step 3', () => {});
            const foo = await test.step('Step 4', () => {});
            foo = await test.step('Step 5', () => {});
        });
        /**
         * another comment
         */
        test('Test 6', () => {});
      `,
      errors: [
        { messageId: 'missingWhitespace' },
        { messageId: 'missingWhitespace' },
        { messageId: 'missingWhitespace' },
        { messageId: 'missingWhitespace' },
        { messageId: 'missingWhitespace' },
        { messageId: 'missingWhitespace' },
      ],
      name: 'missing blank lines before test blocks',
      output: javascript`
        test.beforeEach('Test 1', () => {});

        test('Test 2', async () => {
            await test.step('Step 1', () => {});

            // a comment
            test.step('Step 2', () => {});

            test.step('Step 3', () => {});

            const foo = await test.step('Step 4', () => {});

            foo = await test.step('Step 5', () => {});
        });

        /**
         * another comment
         */
        test('Test 6', () => {});
      `,
    },
  ],
  valid: [
    {
      code: javascript`
        test('Test 1', () => {});

        test('Test 2', () => {});
      `,
      name: 'blank line between simple test blocks',
    },
    {
      code: javascript`
        test.beforeEach(() => {});

        test.skip('Test 2', () => {});
      `,
      name: 'blank line between test modifiers',
    },
    {
      code: javascript`
        test('Test', async () => {
            await test.step('Step 1', () => {});

            await test.step('Step 2', () => {});
        });
      `,
      name: 'blank line between nested steps in async test',
    },
    {
      code: javascript`
        test('Test', async () => {
            await test.step('Step 1', () => {});

            // some comment
            await test.step('Step 2', () => {});
        });
      `,
      name: 'nested steps with a line comment in between',
    },
    {
      code: javascript`
        test('Test', async () => {
            await test.step('Step 1', () => {});

            /**
             * another comment
             */
            await test.step('Step 2', () => {});
        });
      `,
      name: 'nested steps with a block comment in between',
    },
    {
      code: javascript`
        test('assign', async () => {
            let foo = await test.step('Step 1', () => {});

            foo = await test.step('Step 2', () => {});
        });
      `,
      name: 'assignments initialized by test.step',
    },
    {
      code: javascript`
        test('assign', async () => {
            let { foo } = await test.step('Step 1', () => {});

            ({ foo } = await test.step('Step 2', () => {}));
        });
      `,
      name: 'destructuring assignments initialized by test.step',
    },
  ],
})
