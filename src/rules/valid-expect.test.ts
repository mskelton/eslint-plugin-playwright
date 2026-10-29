import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './valid-expect.js'

runRuleTester('valid-expect', rule, {
  invalid: [
    // Matcher not found
    {
      code: 'expect(foo)',
      errors: [{ column: 1, endColumn: 12, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'softExpect(foo)',
      errors: [{ column: 1, endColumn: 16, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect(foo).not',
      errors: [{ column: 13, endColumn: 16, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect.soft(foo)',
      errors: [{ column: 1, endColumn: 17, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect.soft(foo).not',
      errors: [{ column: 18, endColumn: 21, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect["soft"](foo)["not"]',
      errors: [{ column: 21, endColumn: 26, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect.poll(foo)',
      errors: [{ column: 1, endColumn: 17, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect.poll(foo).not',
      errors: [{ column: 18, endColumn: 21, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect[`poll`](foo)[`not`]',
      errors: [{ column: 21, endColumn: 26, line: 1, messageId: 'matcherNotFound' }],
    },
    // Matcher not called
    {
      code: 'expect(foo).toBe',
      errors: [{ column: 13, endColumn: 17, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect(foo).not.toBe',
      errors: [{ column: 17, endColumn: 21, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect(foo)["not"].toBe',
      errors: [{ column: 20, endColumn: 24, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'something(expect(foo).not.toBe)',
      errors: [{ column: 27, endColumn: 31, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect.soft(foo).toEqual',
      errors: [{ column: 18, endColumn: 25, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect.soft(foo).not.toEqual',
      errors: [{ column: 22, endColumn: 29, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'something(expect.soft(foo).not.toEqual)',
      errors: [{ column: 32, endColumn: 39, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect.poll(() => foo).toBe',
      errors: [{ column: 24, endColumn: 28, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect.poll(() => foo).not.toBe',
      errors: [{ column: 28, endColumn: 32, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'expect["poll"](() => foo)["not"][`toBe`]',
      errors: [{ column: 34, endColumn: 40, line: 1, messageId: 'matcherNotCalled' }],
    },
    {
      code: 'something(expect["poll"](() => foo)["not"][`toBe`])',
      errors: [{ column: 44, endColumn: 50, line: 1, messageId: 'matcherNotCalled' }],
    },
    // minArgs
    {
      code: 'expect().toContain(true)',
      errors: [
        {
          column: 7,
          data: { amount: 1, s: '' },
          endColumn: 8,
          line: 1,
          messageId: 'notEnoughArgs',
        },
      ],
    },
    {
      code: 'expect(foo).toBe(true)',
      errors: [
        {
          column: 7,
          data: { amount: 2, s: 's' },
          endColumn: 8,
          line: 1,
          messageId: 'notEnoughArgs',
        },
      ],
      options: [{ minArgs: 2 }],
    },
    // maxArgs
    {
      code: 'expect(foo, "bar", "baz").toBe(true)',
      errors: [
        {
          column: 20,
          data: { amount: 2, s: 's' },
          endColumn: 25,
          line: 1,
          messageId: 'tooManyArgs',
        },
      ],
    },
    {
      code: 'expect(foo, "bar").toBe(true)',
      errors: [
        {
          column: 13,
          data: { amount: 1, s: '' },
          endColumn: 18,
          line: 1,
          messageId: 'tooManyArgs',
        },
      ],
      options: [{ maxArgs: 1 }],
    },
    {
      code: 'expect()',
      errors: [
        {
          column: 1,
          endColumn: 9,
          line: 1,
          messageId: 'matcherNotFound',
        },
      ],
    },
    {
      code: 'expect().toHaveText',
      errors: [
        {
          column: 10,
          endColumn: 20,
          line: 1,
          messageId: 'matcherNotCalled',
        },
      ],
    },
    // Global aliases
    {
      code: 'assert(foo)',
      errors: [{ column: 1, endColumn: 12, line: 1, messageId: 'matcherNotFound' }],
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("foo", () => { expect(foo) });
      `,
      errors: [{ column: 23, endColumn: 34, line: 2, messageId: 'matcherNotFound' }],
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(foo)
      `,
      errors: [{ column: 1, endColumn: 14, line: 2, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect(foo).blah.toBe(1)',
      errors: [{ column: 1, endColumn: 25, line: 1, messageId: 'modifierUnknown' }],
    },
    // expect.soft.poll is valid only in that order, before the expect call
    {
      code: 'expect.poll.soft(() => foo).toBe(1)',
      errors: [{ column: 1, endColumn: 36, line: 1, messageId: 'modifierUnknown' }],
    },
    {
      code: 'expect.soft(foo).poll.toBe(1)',
      errors: [{ column: 1, endColumn: 30, line: 1, messageId: 'modifierUnknown' }],
    },
    {
      code: 'expect.poll(() => foo).soft.toBe(1)',
      errors: [{ column: 1, endColumn: 36, line: 1, messageId: 'modifierUnknown' }],
    },
    {
      code: 'expect.soft.poll.poll(() => foo).toBe(1)',
      errors: [{ column: 1, endColumn: 41, line: 1, messageId: 'modifierUnknown' }],
    },
    {
      code: 'expect(foo).soft.poll(() => foo).toBe(1)',
      errors: [{ column: 1, endColumn: 41, line: 1, messageId: 'modifierUnknown' }],
    },
    {
      code: 'expect.soft.poll(() => foo)',
      errors: [{ column: 1, endColumn: 28, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect.soft.poll(() => foo).not',
      errors: [{ column: 29, endColumn: 32, line: 1, messageId: 'matcherNotFound' }],
    },
    {
      code: 'expect.soft.poll(() => foo).toBe',
      errors: [{ column: 29, endColumn: 33, line: 1, messageId: 'matcherNotCalled' }],
    },
  ],
  valid: [
    { code: 'expectPayButtonToBeEnabled()' },
    { code: 'expect("something").toBe("else")' },
    { code: 'expect.anything()' },
    { code: 'expect.arrayContaining()' },
    { code: 'expect.not.arrayContaining()' },
    { code: 'expect.objectContaining(expected)' },
    { code: 'expect.not.objectContaining(expected)' },
    { code: 'expect("something").toBe(expect.anything())' },
    { code: 'expect("something").toEqual({ foo: expect.anything() })' },
    { code: 'expect("something").toBe(expect.arrayContaining([1, 2, 3]))' },
    { code: 'softExpect("something").toBe("else")' },
    { code: 'expect.soft("something").toBe("else")' },
    { code: 'expect.poll(() => "something").toBe("else")' },
    { code: 'expect.soft.poll(() => "something").toBe("else")' },
    { code: 'expect.soft.poll(() => "something").not.toBe("else")' },
    { code: 'expect["soft"].poll(() => 1)["toBe"](2)' },
    { code: 'expect.soft["poll"](() => 1).not.toBe(2)' },
    { code: 'expect[`soft`][`poll`](() => 1)[`not`][`toBe`](2)' },
    { code: 'expect(true).toBeDefined()' },
    { code: 'expect(undefined).not.toBeDefined()' },
    { code: 'expect([1, 2, 3]).toEqual([1, 2, 3])' },
    { code: 'expect(1, "1 !== 2").toBe(2)' },
    { code: 'expect.soft(1, "1 !== 2").toBe(2)' },
    { code: 'expect["soft"](1, "1 !== 2")["toBe"](2)' },
    { code: 'expect[`poll`](() => 1, { message: "1 !== 2" })[`toBe`](2)' },
    { code: 'expect.soft.poll(() => 1, { message: "1 !== 2" }).toBe(2)' },
    { code: 'expect["soft"]["poll"](() => 1, { message: "1 !== 2" })["toBe"](2)' },
    // minArgs
    {
      code: 'expect(1, "1 !== 2").toBe(2)',
      options: [{ minArgs: 2 }],
    },
    {
      code: 'expect(1, 2, 3).toBe(4)',
      options: [{ minArgs: 3 }],
    },
    // maxArgs
    {
      code: 'expect(1).toBe(2)',
      options: [{ maxArgs: 1 }],
    },
    {
      code: 'expect(1, 2, 3).toBe(4)',
      options: [{ maxArgs: 3 }],
    },
    // Global aliases
    {
      code: 'assert("something").toBe("else")',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("foo", () => { expect("something").toBe("else") });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(1).toBe(1);
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming.soft.poll(() => 1).toBe(1);
      `,
    },
    {
      code: 'assert.soft.poll(() => 1).toBe(1)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
