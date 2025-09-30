import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './max-expects.js'

runRuleTester('max-expects', rule, {
  invalid: [
    {
      code: javascript`
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
      code: javascript`
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
      code: javascript`
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
      code: javascript`
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
      code: javascript`
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
      code: javascript`
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
      code: javascript`
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
  ],
  valid: [
    `test('should pass')`,
    `test('should pass', () => {})`,
    `test.skip('should pass', () => {})`,
    javascript`
      test('should pass', function () {
        expect(true).toBeDefined();
      });
    `,
    javascript`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    javascript`
      test('should pass', () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        // expect(true).toBeDefined();
      });
    `,
    javascript`
      test('should pass', async () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    javascript`
      test('should pass', async () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toEqual(expect.any(Boolean));
      });
    `,
    javascript`
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
    javascript`
      test.each(['should', 'pass'], () => {
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
        expect(true).toBeDefined();
      });
    `,
    javascript`
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
    javascript`
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
    javascript`
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
    javascript`
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
    javascript`
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
      code: javascript`
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
  ],
})
