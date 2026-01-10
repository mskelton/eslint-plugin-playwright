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
    {
      code: dedent`
        const someText = 'abc';
        test.afterAll(() => {
        });
        describe('someText', () => {
          const something = 'abc';
          // A comment
          test.afterAll(() => {
            // stuff
          });
          test.afterAll(() => {
            // other stuff
          });
        });

        describe('someText', () => {
          const something = 'abc';
          test.afterAll(() => {
            // stuff
          });
        });
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 4, messageId: 'missingWhitespace' },
        { line: 6, messageId: 'missingWhitespace' },
        { line: 10, messageId: 'missingWhitespace' },
        { line: 17, messageId: 'missingWhitespace' },
      ],
      name: 'padding around test blocks with describe blocks',
      output: dedent`
        const someText = 'abc';

        test.afterAll(() => {
        });

        describe('someText', () => {
          const something = 'abc';

          // A comment
          test.afterAll(() => {
            // stuff
          });

          test.afterAll(() => {
            // other stuff
          });
        });

        describe('someText', () => {
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
      errors: [{ line: 2, messageId: 'missingWhitespace' }],
      name: 'semicolon before test block',
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
      errors: [{ line: 3, messageId: 'missingWhitespace' }],
      name: 'label before test block',
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
              await test.step('check oranges', () => {
                expect(expr).toBe('Oranges');
              });
              break;
            case 'Mangoes':
            case 'Papayas':
              const v = 1;
              await test.step('check value', () => {
                expect(v).toBe(1);
              });
              await test.step('log message', () => {
                console.log('Mangoes and papayas are $2.79 a pound.');
              });
              // Expected output: "Mangoes and papayas are $2.79 a pound."
              break;
            default:
              console.log(\`Sorry, we are out of $\{expr}.\`);
          }
        });
      `,
      errors: [
        { line: 2, messageId: 'missingWhitespace' },
        { line: 3, messageId: 'missingWhitespace' },
        { line: 8, messageId: 'missingWhitespace' },
        { line: 13, messageId: 'missingWhitespace' },
        { line: 16, messageId: 'missingWhitespace' },
      ],
      name: 'complex test with switch statement and nested test.step blocks',
      output: dedent`
        const expr = 'Papayas';

        test.beforeEach(() => {});

        test('does something?', async () => {
          switch (expr) {
            case 'Oranges':
              await test.step('check oranges', () => {
                expect(expr).toBe('Oranges');
              });

              break;
            case 'Mangoes':
            case 'Papayas':
              const v = 1;

              await test.step('check value', () => {
                expect(v).toBe(1);
              });

              await test.step('log message', () => {
                console.log('Mangoes and papayas are $2.79 a pound.');
              });
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
        const someText = 'abc';

        test.afterAll(() => {
        });

        describe('someText', () => {
          const something = 'abc';

          // A comment
          test.afterAll(() => {
            // stuff
          });

          test.afterAll(() => {
            // other stuff
          });
        });

        describe('someText', () => {
          const something = 'abc';

          test.afterAll(() => {
            // stuff
          });
        });

        describe('someText', () => {
          test.afterAll(() => {
            // stuff
          });
        });
      `,
      name: 'padding around test blocks with describe blocks (valid)',
    },
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
