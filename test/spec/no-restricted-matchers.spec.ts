import rule from '../../src/rules/no-restricted-matchers';
import { runRuleTester } from '../utils/rule-tester';

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
  ],
});
