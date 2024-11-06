import { javascript, runRuleTester } from '../utils/rule-tester.js'
import rule from './require-to-throw-message.js'

runRuleTester('require-to-throw-message', rule, {
  invalid: [
    // Empty toThrow
    {
      code: "expect(() => { throw new Error('a'); }).toThrow();",
      errors: [
        {
          column: 41,
          data: { matcherName: 'toThrow' },
          line: 1,
          messageId: 'addErrorMessage',
        },
      ],
    },
    // Empty toThrowError
    {
      code: "expect(() => { throw new Error('a'); }).toThrowError();",
      errors: [
        {
          column: 41,
          data: { matcherName: 'toThrowError' },
          line: 1,
          messageId: 'addErrorMessage',
        },
      ],
    },

    // Empty rejects.toThrow / rejects.toThrowError
    {
      code: javascript`
        test('empty rejects.toThrow', async () => {
          const throwErrorAsync = async () => { throw new Error('a') };
          await expect(throwErrorAsync()).rejects.toThrow();
          await expect(throwErrorAsync()).rejects.toThrowError();
        })
      `,
      errors: [
        {
          column: 43,
          data: { matcherName: 'toThrow' },
          line: 3,
          messageId: 'addErrorMessage',
        },
        {
          column: 43,
          data: { matcherName: 'toThrowError' },
          line: 4,
          messageId: 'addErrorMessage',
        },
      ],
    },
    // Global aliases
    {
      code: "assert(() => { throw new Error('a'); }).toThrow();",
      errors: [
        {
          column: 41,
          data: { matcherName: 'toThrow' },
          line: 1,
          messageId: 'addErrorMessage',
        },
      ],
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    // String
    "expect(() => { throw new Error('a'); }).toThrow('a');",
    "expect(() => { throw new Error('a'); }).toThrowError('a');",
    javascript`
      test('string', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow('a');
        await expect(throwErrorAsync()).rejects.toThrowError('a');
      })
    `,

    // Template literal
    "const a = 'a'; expect(() => { throw new Error('a'); }).toThrow(`${a}`);",
    "const a = 'a'; expect(() => { throw new Error('a'); }).toThrowError(`${a}`);",
    javascript`
      test('Template literal', async () => {
        const a = 'a';
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow(\`\${a}\`);
        await expect(throwErrorAsync()).rejects.toThrowError(\`\${a}\`);
      })
    `,

    // Regex
    "expect(() => { throw new Error('a'); }).toThrow(/^a$/);",
    "expect(() => { throw new Error('a'); }).toThrowError(/^a$/);",
    javascript`
      test('Regex', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).rejects.toThrow(/^a$/);
        await expect(throwErrorAsync()).rejects.toThrowError(/^a$/);
      })
    `,

    // Function
    "expect(() => { throw new Error('a'); }).toThrow((() => { return 'a'; })());",
    "expect(() => { throw new Error('a'); }).toThrowError((() => { return 'a'; })());",
    javascript`
      test('Function', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        const fn = () => { return 'a'; };
        await expect(throwErrorAsync()).rejects.toThrow(fn());
        await expect(throwErrorAsync()).rejects.toThrowError(fn());
      })
    `,

    // Allow no message for `not`.
    "expect(() => { throw new Error('a'); }).not.toThrow();",
    "expect(() => { throw new Error('a'); }).not.toThrowError();",
    javascript`
      test('Allow no message for "not"', async () => {
        const throwErrorAsync = async () => { throw new Error('a') };
        await expect(throwErrorAsync()).resolves.not.toThrow();
        await expect(throwErrorAsync()).resolves.not.toThrowError();
      })
    `,
    'expect(a);',

    // Global aliases
    {
      code: "assert(() => { throw new Error('a'); }).toThrow('a');",
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
