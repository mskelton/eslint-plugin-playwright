import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-strict-equal.js'

runRuleTester('prefer-strict-equal', rule, {
  invalid: [
    {
      code: 'expect(something).toEqual(somethingElse);',
      errors: [
        {
          column: 19,
          endColumn: 26,
          line: 1,
          messageId: 'useToStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceWithStrictEqual',
              output: 'expect(something).toStrictEqual(somethingElse);',
            },
          ],
        },
      ],
    },
    {
      code: 'expect(something)["toEqual"](somethingElse);',
      errors: [
        {
          column: 19,
          endColumn: 28,
          line: 1,
          messageId: 'useToStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceWithStrictEqual',
              output: 'expect(something)["toStrictEqual"](somethingElse);',
            },
          ],
        },
      ],
    },
    // Global aliases
    {
      code: 'assert(something).toEqual(somethingElse);',
      errors: [
        {
          column: 19,
          endColumn: 26,
          line: 1,
          messageId: 'useToStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceWithStrictEqual',
              output: 'assert(something).toStrictEqual(somethingElse);',
            },
          ],
        },
      ],
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
          expect(something).toEqual(somethingElse);
        });
      `,
      errors: [
        {
          column: 21,
          endColumn: 28,
          line: 3,
          messageId: 'useToStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceWithStrictEqual',
              output: dedent`
                const custom = test.extend({});
                custom("foo", () => {
                  expect(something).toStrictEqual(somethingElse);
                });
              `,
            },
          ],
        },
      ],
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(something).toEqual(somethingElse);
      `,
      errors: [
        {
          column: 21,
          endColumn: 28,
          line: 2,
          messageId: 'useToStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceWithStrictEqual',
              output: dedent`
                import { expect as assuming } from '@playwright/test';
                assuming(something).toStrictEqual(somethingElse);
              `,
            },
          ],
        },
      ],
    },
    {
      code: 'expect(a).not.toEqual(b)',
      errors: [
        {
          column: 15,
          endColumn: 22,
          line: 1,
          messageId: 'useToStrictEqual',
          suggestions: [
            {
              messageId: 'suggestReplaceWithStrictEqual',
              output: 'expect(a).not.toStrictEqual(b)',
            },
          ],
        },
      ],
      name: 'not.toEqual should still suggest toStrictEqual',
    },
  ],
  valid: [
    'expect(something).toStrictEqual(somethingElse);',
    "a().toEqual('b')",
    'expect(a);',
    // Global aliases
    {
      code: 'assert(something).toStrictEqual(somethingElse);',
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
          expect(something).toStrictEqual(somethingElse);
        });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(something).toStrictEqual(somethingElse);
      `,
    },
  ],
})
