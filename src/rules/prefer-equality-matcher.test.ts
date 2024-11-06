import rule from '../../src/rules/prefer-equality-matcher.js'
import { equalityMatchers } from '../../src/utils/ast.js'
import { runRuleTester } from '../utils/rule-tester.js'

const expectSuggestions = (output: (matcher: string) => string) => {
  return [...equalityMatchers.keys()].map((matcher) => ({
    data: { matcher },
    messageId: 'suggestEqualityMatcher',
    output: output(matcher),
  }))
}

runRuleTester('prefer-equality-matcher: ===', rule, {
  invalid: [
    {
      code: 'expect(a === b).toBe(true);',
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b,).toBe(true,);',
      errors: [
        {
          column: 18,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a,).${m}(b,);`),
        },
      ],
      languageOptions: {
        parserOptions: { ecmaVersion: 2017 },
      },
    },
    {
      code: 'expect(a === b).toBe(false);',
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).not.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.toBe(true);',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).resolves.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.toBe(false);',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            (m) => `expect(a).resolves.not.${m}(b);`,
          ),
        },
      ],
    },
    {
      code: 'expect(a === b).not.toBe(true);',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).not.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b).not.toBe(false);',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.not.toBe(true);',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            (m) => `expect(a).resolves.not.${m}(b);`,
          ),
        },
      ],
    },
    {
      code: 'expect(a === b).resolves.not.toBe(false);',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).resolves.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b)["resolves"].not.toBe(false);',
      errors: [
        {
          column: 33,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).resolves.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a === b)["resolves"]["not"]["toBe"](false);',
      errors: [
        {
          column: 36,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).resolves.${m}(b);`),
        },
      ],
    },
    // Global aliases
    {
      code: 'assert(a === b).toBe(true);',
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `assert(a).${m}(b);`),
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
    'expect(true).toBe(...true)',
    'expect(a == 1).toBe(true)',
    'expect(1 == a).toBe(true)',
    'expect(a == b).toBe(true)',
    // Global aliases
    {
      code: 'expect(a == 1).toBe(true)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})

runRuleTester('prefer-equality-matcher: !==', rule, {
  invalid: [
    {
      code: 'expect(a !== b).toBe(true);',
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).not.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a !== b).toBe(false);',
      errors: [
        {
          column: 17,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.toBe(true);',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            (m) => `expect(a).resolves.not.${m}(b);`,
          ),
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.toBe(false);',
      errors: [
        {
          column: 26,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).resolves.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a !== b).not.toBe(true);',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a !== b).not.toBe(false);',
      errors: [
        {
          column: 21,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).not.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.not.toBe(true);',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions((m) => `expect(a).resolves.${m}(b);`),
        },
      ],
    },
    {
      code: 'expect(a !== b).resolves.not.toBe(false);',
      errors: [
        {
          column: 30,
          line: 1,
          messageId: 'useEqualityMatcher',
          suggestions: expectSuggestions(
            (m) => `expect(a).resolves.not.${m}(b);`,
          ),
        },
      ],
    },
  ],
  valid: [
    'expect(true).toBe(...true)',
    'expect(a != 1).toBe(true)',
    'expect(1 != a).toBe(true)',
    'expect(a != b).toBe(true)',
  ],
})
