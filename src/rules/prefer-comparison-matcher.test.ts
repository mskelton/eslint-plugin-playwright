import dedent from 'dedent'
import { RuleTester } from 'eslint'
import { equalityMatchers } from '../../src/utils/ast.js'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-comparison-matcher.js'

const generateInvalidCases = (
  operator: string,
  equalityMatcher: string,
  preferredMatcher: string,
  preferredMatcherWhenNegated: string,
): RuleTester.InvalidTestCase[] => {
  return [
    {
      code: `expect(value ${operator} 1).${equalityMatcher}(true);`,
      errors: [
        {
          column: 18 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1,).${equalityMatcher}(true,);`,
      errors: [
        {
          column: 19 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      languageOptions: {
        parserOptions: { ecmaVersion: 2017 },
      },
      output: `expect(value,).${preferredMatcher}(1,);`,
    },
    {
      code: `expect(value ${operator} 1)['${equalityMatcher}'](true);`,
      errors: [
        {
          column: 18 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1).resolves.${equalityMatcher}(true);`,
      errors: [
        {
          column: 27 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1).${equalityMatcher}(false);`,
      errors: [
        {
          column: 18 + operator.length,
          data: { preferredMatcher: preferredMatcherWhenNegated },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcherWhenNegated}(1);`,
    },
    {
      code: `expect(value ${operator} 1)['${equalityMatcher}'](false);`,
      errors: [
        {
          column: 18 + operator.length,
          data: { preferredMatcher: preferredMatcherWhenNegated },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcherWhenNegated}(1);`,
    },
    {
      code: `expect(value ${operator} 1).resolves.${equalityMatcher}(false);`,
      errors: [
        {
          column: 27 + operator.length,
          data: { preferredMatcher: preferredMatcherWhenNegated },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcherWhenNegated}(1);`,
    },
    {
      code: `expect(value ${operator} 1).not.${equalityMatcher}(true);`,
      errors: [
        {
          column: 22 + operator.length,
          data: { preferredMatcher: preferredMatcherWhenNegated },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcherWhenNegated}(1);`,
    },
    {
      code: `expect(value ${operator} 1)['not'].${equalityMatcher}(true);`,
      errors: [
        {
          column: 25 + operator.length,
          data: { preferredMatcher: preferredMatcherWhenNegated },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcherWhenNegated}(1);`,
    },
    {
      code: `expect(value ${operator} 1).resolves.not.${equalityMatcher}(true);`,
      errors: [
        {
          column: 31 + operator.length,
          data: { preferredMatcher: preferredMatcherWhenNegated },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcherWhenNegated}(1);`,
    },
    {
      code: `expect(value ${operator} 1).not.${equalityMatcher}(false);`,
      errors: [
        {
          column: 22 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1).resolves.not.${equalityMatcher}(false);`,
      errors: [
        {
          column: 31 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1)["resolves"].not.${equalityMatcher}(false);`,
      errors: [
        {
          column: 34 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1)["resolves"]["not"].${equalityMatcher}(false);`,
      errors: [
        {
          column: 37 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcher}(1);`,
    },
    {
      code: `expect(value ${operator} 1)["resolves"]["not"]['${equalityMatcher}'](false);`,
      errors: [
        {
          column: 37 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).resolves.${preferredMatcher}(1);`,
    },
    // Global aliases
    {
      code: `expect(value ${operator} 1).${equalityMatcher}(true);`,
      errors: [
        {
          column: 18 + operator.length,
          data: { preferredMatcher },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      output: `expect(value).${preferredMatcher}(1);`,
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ]
}

const generateValidStringLiteralCases = (operator: string, matcher: string) => {
  return [
    ['x', "'y'"],
    ['x', '`y`'],
    ['x', '`y${z}`'],
  ].flatMap(([a, b]) => [
    `expect(${a} ${operator} ${b}).${matcher}(false)`,
    `expect(${a} ${operator} ${b}).${matcher}(true)`,
    `expect(${a} ${operator} ${b}).not.${matcher}(false)`,
    `expect(${a} ${operator} ${b}).not.${matcher}(true)`,
    `expect(${b} ${operator} ${a}).${matcher}(false)`,
    `expect(${b} ${operator} ${a}).${matcher}(true)`,
    `expect(${b} ${operator} ${a}).not.${matcher}(false)`,
    `expect(${b} ${operator} ${a}).not.${matcher}(true)`,
    `expect(${b} ${operator} ${b}).not.${matcher}(false)`,
    `expect(${b} ${operator} ${b}).resolves.${matcher}(false)`,
    `expect(${b} ${operator} ${b}).resolves.not.${matcher}(false)`,
  ])
}

const testComparisonOperator = (
  operator: string,
  preferredMatcher: string,
  preferredMatcherWhenNegated: string,
) => {
  runRuleTester(`prefer-comparison-matcher: ${operator}`, rule, {
    invalid: [...equalityMatchers.keys()].reduce<RuleTester.InvalidTestCase[]>(
      (cases, equalityMatcher) => [
        ...cases,
        ...generateInvalidCases(
          operator,
          equalityMatcher,
          preferredMatcher,
          preferredMatcherWhenNegated,
        ),
      ],
      [],
    ),
    valid: [
      'expect()',
      'expect({}).toStrictEqual({})',
      `expect(value).${preferredMatcher}(1);`,
      `expect(value).${preferredMatcherWhenNegated}(1);`,
      `expect(value).not.${preferredMatcher}(1);`,
      `expect(value).not.${preferredMatcherWhenNegated}(1);`,
      ...['toBe', 'toEqual', 'toStrictEqual'].reduce<string[]>(
        (cases, equalityMatcher) => [
          ...cases,
          ...generateValidStringLiteralCases(operator, equalityMatcher),
        ],
        [],
      ),
    ],
  })
}

testComparisonOperator('>', 'toBeGreaterThan', 'toBeLessThanOrEqual')
testComparisonOperator('<', 'toBeLessThan', 'toBeGreaterThanOrEqual')
testComparisonOperator('>=', 'toBeGreaterThanOrEqual', 'toBeLessThan')
testComparisonOperator('<=', 'toBeLessThanOrEqual', 'toBeGreaterThan')

runRuleTester('prefer-comparison-matcher', rule, {
  invalid: [
    {
      code: 'expect.soft(value > 1).toBe(true)',
      errors: [
        {
          column: 24,
          data: { preferredMatcher: 'toBeGreaterThan' },
          line: 1,
          messageId: 'useToBeComparison',
        },
      ],
      name: 'expect.soft with comparison should be flagged',
      output: 'expect.soft(value).toBeGreaterThan(1)',
    },
  ],
  valid: [
    'expect(true).toBe(...true)',
    'expect()',
    'expect({}).toStrictEqual({})',
    'expect(a === b).toBe(true)',
    'expect(a !== 2).toStrictEqual(true)',
    'expect(a === b).not.toEqual(true)',
    'expect(a !== "string").toStrictEqual(true)',
    'expect(5 != a).toBe(true)',
    'expect(a == "string").toBe(true)',
    'expect(a == "string").not.toBe(true)',
    // Global aliases
    {
      code: 'assert(a === b).toBe(true)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("foo", () => {
          expect(a === b).toBe(true);
        });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(a).toBeGreaterThan(1);
      `,
    },
  ],
})
