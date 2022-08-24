import rule from '../../src/rules/no-restricted-matchers';
import { runRuleTester } from '../utils/rule-tester';

runRuleTester('no-restricted-matchers', rule, {
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
  ],
  invalid: [
    {
      code: 'expect(a).toBe(b)',
      options: [{ toBe: null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'toBe' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect.soft(a).toBe(b)',
      options: [{ toBe: null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'toBe' },
          column: 16,
          line: 1,
        },
      ],
    },
    {
      code: 'expect["poll"](() => a)["toBe"](b)',
      options: [{ toBe: null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'toBe' },
          column: 25,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).not.toBe()',
      options: [{ not: null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'not' },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).not.toBeTruthy()',
      options: [{ 'not.toBeTruthy': null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'not.toBeTruthy' },
          endColumn: 25,
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: 'expect[`soft`](a)[`not`]["toBe"]()',
      options: [{ not: null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'not' },
          column: 19,
          line: 1,
        },
      ],
    },
    {
      code: 'expect.poll(() => true).not.toBeTruthy()',
      options: [{ 'not.toBeTruthy': null }],
      errors: [
        {
          messageId: 'restricted',
          data: { message: '', chain: 'not.toBeTruthy' },
          endColumn: 39,
          column: 25,
          line: 1,
        },
      ],
    },
    {
      code: 'expect(a).toBe(b)',
      options: [{ toBe: 'Prefer `toStrictEqual` instead' }],
      errors: [
        {
          messageId: 'restrictedWithMessage',
          data: {
            message: 'Prefer `toStrictEqual` instead',
            chain: 'toBe',
          },
          column: 11,
          line: 1,
        },
      ],
    },
    {
      code: "expect(foo).not.toHaveText('bar')",
      options: [{ 'not.toHaveText': 'Use not.toContainText instead' }],
      errors: [
        {
          messageId: 'restrictedWithMessage',
          data: {
            message: 'Use not.toContainText instead',
            chain: 'not.toHaveText',
          },
          endColumn: 27,
          column: 13,
        },
      ],
    },
  ],
});
