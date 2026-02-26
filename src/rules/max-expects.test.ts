import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './max-expects.js'

runRuleTester('max-expects', rule, {
  invalid: [
    {
      code: dedent`
        test('should not pass', function () {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', async () => {
          await test.step('part 1', async () => {
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
          })

          await test.step('part 1', async () => {
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
          })
        });
      `,
      errors: [
        {
          column: 5,
          line: 11,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'exceededMaxAssertion',
        },
        {
          column: 3,
          line: 15,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
    {
      code: dedent`
        describe('test', () => {
          test('should not pass', () => {
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
            expect(true).toBeDefined();
          });
        });
      `,
      errors: [
        {
          column: 5,
          line: 8,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
    {
      code: dedent`
        test('should not pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 3,
          messageId: 'exceededMaxAssertion',
        },
      ],
      options: [
        {
          max: 1,
        },
      ],
    },
    // Global aliases
    {
      code: dedent`
        it('should not pass', function () {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 7,
          messageId: 'exceededMaxAssertion',
        },
      ],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('should not pass', function () {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 8,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
    {
      code: dedent`
        import { test as custom, expect as assuming } from '@playwright/test';
        custom('should not pass', function () {
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
        });
      `,
      errors: [
        {
          column: 3,
          line: 8,
          messageId: 'exceededMaxAssertion',
        },
      ],
    },
  ],
  valid: [
    `test('should pass')`,
    `test('should pass', () => {})`,
    `test.skip('should pass', () => {})`,
    dedent`
      test('should pass', function () {
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        // expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', async () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', async () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toEqual(expect.any(Boolean));
      });
    `,
    dedent`
      describe('test', () => {
        test('should pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      });
    `,
    dedent`
      test.each(['should', 'pass'], () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      function myHelper() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };

      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    dedent`
      function myHelper1() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };

      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });

      function myHelper2() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };
    `,
    dedent`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });

      function myHelper() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };
    `,
    dedent`
      const myHelper1 = () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };

      test('should pass', function() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });

      const myHelper2 = function() {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      };
    `,
    {
      code: dedent`
        test('should pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
      options: [
        {
          max: 10,
        },
      ],
    },
    // Global aliases
    {
      code: `it('should pass')`,
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('should pass');
      `,
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom('should pass', () => {
          expect(true).toBeDefined();
          expect(true).toBeDefined();
          expect(true).toBeDefined();
        });
      `,
    },
    {
      code: dedent`
        import { test as custom, expect as assuming } from '@playwright/test';
        custom('should pass', () => {
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
          assuming(true).toBeDefined();
        });
      `,
    },
  ],
})
