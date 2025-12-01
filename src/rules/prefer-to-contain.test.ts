import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-to-contain.js'

const messageId = 'useToContain'

runRuleTester('prefer-to-contain', rule, {
  invalid: [
    {
      code: 'expect(a.includes(b)).toEqual(true);',
      errors: [{ column: 23, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b,),).toEqual(true,);',
      errors: [{ column: 25, line: 1, messageId }],
      output: 'expect(a,).toContain(b,);',
    },
    {
      code: "expect(a['includes'](b)).toEqual(true);",
      errors: [{ column: 26, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: "expect(a['includes'](b)).toEqual(false);",
      errors: [{ column: 26, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: "expect(a['includes'](b)).not.toEqual(false);",
      errors: [{ column: 30, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).toEqual(false);',
      errors: [{ column: 23, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).not.toEqual(false);',
      errors: [{ column: 27, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).not.toEqual(true);',
      errors: [{ column: 27, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).toBe(true);',
      errors: [{ column: 23, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).toBe(false);',
      errors: [{ column: 23, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).not.toBe(false);',
      errors: [{ column: 27, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).not.toBe(true);',
      errors: [{ column: 27, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).toStrictEqual(true);',
      errors: [{ column: 23, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).toStrictEqual(false);',
      errors: [{ column: 23, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).not.toStrictEqual(false);',
      errors: [{ column: 27, line: 1, messageId }],
      output: 'expect(a).toContain(b);',
    },
    {
      code: 'expect(a.includes(b)).not.toStrictEqual(true);',
      errors: [{ column: 27, line: 1, messageId }],
      output: 'expect(a).not.toContain(b);',
    },
    {
      code: 'expect(a.test(t).includes(b.test(p))).toEqual(true);',
      errors: [{ column: 39, line: 1, messageId }],
      output: 'expect(a.test(t)).toContain(b.test(p));',
    },
    {
      code: 'expect(a.test(t).includes(b.test(p))).toEqual(false);',
      errors: [{ column: 39, line: 1, messageId }],
      output: 'expect(a.test(t)).not.toContain(b.test(p));',
    },
    {
      code: 'expect(a.test(t).includes(b.test(p))).not.toEqual(true);',
      errors: [{ column: 43, line: 1, messageId }],
      output: 'expect(a.test(t)).not.toContain(b.test(p));',
    },
    {
      code: 'expect(a.test(t).includes(b.test(p))).not.toEqual(false);',
      errors: [{ column: 43, line: 1, messageId }],
      output: 'expect(a.test(t)).toContain(b.test(p));',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).toBe(true);',
      errors: [{ column: 33, line: 1, messageId }],
      output: 'expect([{a:1}]).toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).toBe(false);',
      errors: [{ column: 33, line: 1, messageId }],
      output: 'expect([{a:1}]).not.toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).not.toBe(true);',
      errors: [{ column: 37, line: 1, messageId }],
      output: 'expect([{a:1}]).not.toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).not.toBe(false);',
      errors: [{ column: 37, line: 1, messageId }],
      output: 'expect([{a:1}]).toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).toStrictEqual(true);',
      errors: [{ column: 33, line: 1, messageId }],
      output: 'expect([{a:1}]).toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).toStrictEqual(false);',
      errors: [{ column: 33, line: 1, messageId }],
      output: 'expect([{a:1}]).not.toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).not.toStrictEqual(true);',
      errors: [{ column: 37, line: 1, messageId }],
      output: 'expect([{a:1}]).not.toContain({a:1});',
    },
    {
      code: 'expect([{a:1}].includes({a:1})).not.toStrictEqual(false);',
      errors: [{ column: 37, line: 1, messageId }],
      output: 'expect([{a:1}]).toContain({a:1});',
    },
  ],
  valid: [
    'expect().toBe(false);',
    'expect(a).toContain(b);',
    "expect(a.name).toBe('b');",
    'expect(a).toBe(true);',
    `expect(a).toEqual(b)`,
    `expect(a.test(c)).toEqual(b)`,
    `expect(a.includes(b)).toEqual()`,
    `expect(a.includes(b)).toEqual("test")`,
    `expect(a.includes(b)).toBe("test")`,
    `expect(a.includes()).toEqual()`,
    `expect(a.includes()).toEqual(true)`,
    `expect(a.includes(b,c)).toBe(true)`,
    `expect([{a:1}]).toContain({a:1})`,
    `expect([1].includes(1)).toEqual`,
    `expect([1].includes).toEqual`,
    `expect([1].includes).not`,
    `expect(a.test(b)).resolves.toEqual(true)`,
    `expect(a.test(b)).resolves.not.toEqual(true)`,
    `expect(a).not.toContain(b)`,
    'expect(a.includes(...[])).toBe(true)',
    'expect(a.includes(b)).toBe(...true)',
    'expect(a);',
    // Global aliases
    {
      code: 'assert(a).toContain(b);',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
