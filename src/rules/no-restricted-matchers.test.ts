import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-restricted-matchers.js'

runRuleTester('no-restricted-matchers', rule, {
  invalid: [
    {
      code: 'expect(a).toBe(b)',
      errors: [
        {
          column: 11,
          data: { message: '', restriction: 'toBe' },
          endColumn: 15,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ toBe: null }],
    },
    {
      code: 'expect.soft(a).toBe(b)',
      errors: [
        {
          column: 16,
          data: { message: '', restriction: 'toBe' },
          endColumn: 20,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ toBe: null }],
    },
    {
      code: 'expect["poll"](() => a)["toBe"](b)',
      errors: [
        {
          column: 25,
          data: { message: '', restriction: 'toBe' },
          endColumn: 31,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ toBe: null }],
    },
    {
      code: 'expect(a).not.toBe()',
      errors: [
        {
          column: 11,
          data: { message: '', restriction: 'not' },
          endColumn: 14,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ not: null }],
    },
    {
      code: 'expect(a).not.toBeTruthy()',
      errors: [
        {
          column: 11,
          data: { message: '', restriction: 'not.toBeTruthy' },
          endColumn: 25,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ 'not.toBeTruthy': null }],
    },
    {
      code: 'expect[`soft`](a)[`not`]["toBe"]()',
      errors: [
        {
          column: 19,
          data: { message: '', restriction: 'not' },
          endColumn: 24,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ not: null }],
    },
    {
      code: 'expect.poll(() => true).not.toBeTruthy()',
      errors: [
        {
          column: 25,
          data: { message: '', restriction: 'not.toBeTruthy' },
          endColumn: 39,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ 'not.toBeTruthy': null }],
    },
    {
      code: 'expect(a).toBe(b)',
      errors: [
        {
          column: 11,
          data: {
            message: 'Prefer `toStrictEqual` instead',
            restriction: 'toBe',
          },
          endColumn: 15,
          line: 1,
          messageId: 'restrictedWithMessage',
        },
      ],
      options: [{ toBe: 'Prefer `toStrictEqual` instead' }],
    },
    {
      code: "expect(foo).not.toHaveText('bar')",
      errors: [
        {
          column: 13,
          data: {
            message: 'Use not.toContainText instead',
            restriction: 'not.toHaveText',
          },
          endColumn: 27,
          messageId: 'restrictedWithMessage',
        },
      ],
      options: [{ 'not.toHaveText': 'Use not.toContainText instead' }],
    },
    // Global aliases
    {
      code: 'assert(a).toBe(b)',
      errors: [
        {
          column: 11,
          data: { message: '', restriction: 'toBe' },
          endColumn: 15,
          line: 1,
          messageId: 'restricted',
        },
      ],
      options: [{ toBe: null }],
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
          expect(a).toBe(b);
        });
      `,
      errors: [
        {
          column: 13,
          data: { message: '', restriction: 'toBe' },
          endColumn: 17,
          line: 3,
          messageId: 'restricted',
        },
      ],
      options: [{ toBe: null }],
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(a).toBe(b);
      `,
      errors: [
        {
          column: 13,
          data: { message: '', restriction: 'toBe' },
          endColumn: 17,
          line: 2,
          messageId: 'restricted',
        },
      ],
      options: [{ toBe: null }],
    },
  ],
  valid: [
    'expect(a)',
    'expect(a).toBe()',
    'expect(a).not.toContain()',
    'expect(a).toHaveText()',
    'expect(a).toThrow()',
    'expect.soft(a)',
    'expect.soft(a).toHaveText()',
    'expect.poll(() => true).toThrow()',
    'expect["soft"](a).toHaveText()',
    'expect[`poll`](() => true).toThrow()',
    {
      code: 'expect(a).toBe(b)',
      options: [{ 'not.toBe': null }],
    },
    {
      code: 'expect.soft(a).toBe(b)',
      options: [{ 'not.toBe': null }],
    },
    {
      code: 'expect.poll(() => true).toBe(b)',
      options: [{ 'not.toBe': null }],
    },
    {
      code: 'expect["soft"](a)["toBe"](b)',
      options: [{ 'not.toBe': null }],
    },
    {
      code: 'expect[`poll`](() => true)[`toBe`](b)',
      options: [{ 'not.toBe': null }],
    },
    {
      code: 'expect(a).toHaveKnot(b)',
      options: [{ not: null }],
    },
    {
      code: 'expect(a).nothing(b)',
      options: [{ not: null }],
    },
    // Global aliases
    {
      code: 'assert(a).nothing(b)',
      options: [{ not: null }],
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
          expect(a).toHaveText();
        });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(something).toBe(something);
      `,
    },
  ],
})
