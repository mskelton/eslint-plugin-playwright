import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-to-be.js'

runRuleTester('prefer-to-be', rule, {
  invalid: [
    {
      code: 'expect(value).toEqual("my string");',
      errors: [{ column: 15, endColumn: 22, line: 1, messageId: 'useToBe' }],
      output: 'expect(value).toBe("my string");',
    },
    {
      code: 'expect(value).toStrictEqual("my string");',
      errors: [{ column: 15, endColumn: 28, line: 1, messageId: 'useToBe' }],
      output: 'expect(value).toBe("my string");',
    },
    {
      code: 'expect(value).toStrictEqual(1);',
      errors: [{ column: 15, endColumn: 28, line: 1, messageId: 'useToBe' }],
      output: 'expect(value).toBe(1);',
    },
    {
      code: 'expect(value).toStrictEqual(-1);',
      errors: [{ column: 15, endColumn: 28, line: 1, messageId: 'useToBe' }],
      output: 'expect(value).toBe(-1);',
    },
    {
      code: 'expect(value).toEqual(`my string`);',
      errors: [{ column: 15, endColumn: 22, line: 1, messageId: 'useToBe' }],
      output: 'expect(value).toBe(`my string`);',
    },
    {
      code: 'expect(value)["toEqual"](`my string`);',
      errors: [{ column: 15, endColumn: 24, line: 1, messageId: 'useToBe' }],
      output: 'expect(value)["toBe"](`my string`);',
    },
    {
      code: 'expect(value).toStrictEqual(`my ${string}`);',
      errors: [{ column: 15, endColumn: 28, line: 1, messageId: 'useToBe' }],
      output: 'expect(value).toBe(`my ${string}`);',
    },
    {
      code: 'expect(loadMessage()).resolves.toStrictEqual("hello world");',
      errors: [{ column: 32, endColumn: 45, line: 1, messageId: 'useToBe' }],
      output: 'expect(loadMessage()).resolves.toBe("hello world");',
    },
    {
      code: 'expect(loadMessage()).resolves["toStrictEqual"]("hello world");',
      errors: [{ column: 32, endColumn: 47, line: 1, messageId: 'useToBe' }],
      output: 'expect(loadMessage()).resolves["toBe"]("hello world");',
    },
    {
      code: 'expect(loadMessage())["resolves"].toStrictEqual("hello world");',
      errors: [{ column: 35, endColumn: 48, line: 1, messageId: 'useToBe' }],
      output: 'expect(loadMessage())["resolves"].toBe("hello world");',
    },
    {
      code: 'expect(loadMessage()).resolves.toStrictEqual(false);',
      errors: [{ column: 32, endColumn: 45, line: 1, messageId: 'useToBe' }],
      output: 'expect(loadMessage()).resolves.toBe(false);',
    },
    // Global aliases
    {
      code: 'assert(value).toEqual("my string");',
      errors: [{ column: 15, endColumn: 22, line: 1, messageId: 'useToBe' }],
      output: 'assert(value).toBe("my string");',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    'expect(null).toBeNull();',
    'expect(null).not.toBeNull();',
    'expect(null).toBe(1);',
    'expect(null).toBe(-1);',
    'expect(null).toBe(...1);',
    'expect(obj).toStrictEqual([ x, 1 ]);',
    'expect(obj).toStrictEqual({ x: 1 });',
    'expect(obj).not.toStrictEqual({ x: 1 });',
    'expect(value).toMatchSnapshot();',
    "expect(catchError()).toStrictEqual({ message: 'oh noes!' })",
    'expect("something");',
    'expect(token).toStrictEqual(/[abc]+/g);',
    "expect(token).toStrictEqual(new RegExp('[abc]+', 'g'));",
    'expect(value).toEqual(dedent`my string`);',
    // Global aliases
    {
      code: 'assert(null).toBeNull();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})

runRuleTester('prefer-to-be: null', rule, {
  invalid: [
    {
      code: 'expect(null).toBe(null);',
      errors: [
        { column: 14, endColumn: 18, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect(null).toEqual(null);',
      errors: [
        { column: 14, endColumn: 21, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect(null).toStrictEqual(null);',
      errors: [
        { column: 14, endColumn: 27, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect(null).toBeNull();',
    },
    {
      code: 'expect("a string").not.toBe(null);',
      errors: [
        { column: 24, endColumn: 28, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect("a string").not.toBeNull();',
    },
    {
      code: 'expect("a string").not["toBe"](null);',
      errors: [
        { column: 24, endColumn: 30, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect("a string").not["toBeNull"]();',
    },
    {
      code: 'expect("a string")["not"]["toBe"](null);',
      errors: [
        { column: 27, endColumn: 33, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect("a string")["not"]["toBeNull"]();',
    },
    {
      code: 'expect("a string").not.toEqual(null);',
      errors: [
        { column: 24, endColumn: 31, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect("a string").not.toBeNull();',
    },
    {
      code: 'expect("a string").not.toStrictEqual(null);',
      errors: [
        { column: 24, endColumn: 37, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'expect("a string").not.toBeNull();',
    },
    // Global aliases
    {
      code: 'assert(null).toBe(null);',
      errors: [
        { column: 14, endColumn: 18, line: 1, messageId: 'useToBeNull' },
      ],
      output: 'assert(null).toBeNull();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    'expect(null).toBeNull();',
    'expect(null).not.toBeNull();',
    'expect(null).toBe(1);',
    'expect(obj).toStrictEqual([ x, 1 ]);',
    'expect(obj).toStrictEqual({ x: 1 });',
    'expect(obj).not.toStrictEqual({ x: 1 });',
    'expect(value).toMatchSnapshot();',
    "expect(catchError()).toStrictEqual({ message: 'oh noes!' })",
    'expect("something");',
    'expect(null).not.toEqual();',
    'expect(null).toBe();',
    'expect(null).toMatchSnapshot();',
    'expect("a string").toMatchSnapshot(null);',
    'expect("a string").not.toMatchSnapshot();',
    'expect(null).toBe',
    // Global aliases
    {
      code: 'assert(null).toBeNull();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})

runRuleTester('prefer-to-be: undefined', rule, {
  invalid: [
    {
      code: 'expect(undefined).toBe(undefined);',
      errors: [
        { column: 19, endColumn: 23, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect(undefined).toEqual(undefined);',
      errors: [
        { column: 19, endColumn: 26, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect(undefined).toStrictEqual(undefined);',
      errors: [
        { column: 19, endColumn: 32, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toBe(undefined);',
      errors: [
        { column: 24, endColumn: 28, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").toBeDefined();',
    },
    {
      code: 'expect("a string").rejects.not.toBe(undefined);',
      errors: [
        { column: 32, endColumn: 36, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").rejects.toBeDefined();',
    },
    {
      code: 'expect("a string").rejects.not["toBe"](undefined);',
      errors: [
        { column: 32, endColumn: 38, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").rejects["toBeDefined"]();',
    },
    {
      code: 'expect("a string").not.toEqual(undefined);',
      errors: [
        { column: 24, endColumn: 31, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").toBeDefined();',
    },
    {
      code: 'expect("a string").not.toStrictEqual(undefined);',
      errors: [
        { column: 24, endColumn: 37, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").toBeDefined();',
    },
    // Global aliases
    {
      code: 'assert(undefined).toBe(undefined);',
      errors: [
        { column: 19, endColumn: 23, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'assert(undefined).toBeUndefined();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],

  valid: [
    'expect(undefined).toBeUndefined();',
    'expect(true).toBeDefined();',
    'expect({}).toEqual({});',
    'expect(something).toBe()',
    'expect(something).toBe(somethingElse)',
    'expect(something).toEqual(somethingElse)',
    'expect(something).not.toBe(somethingElse)',
    'expect(something).not.toEqual(somethingElse)',
    'expect(undefined).toBe',
    'expect("something");',
    // Global aliases
    {
      code: 'assert(undefined).toBeUndefined();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})

runRuleTester('prefer-to-be: NaN', rule, {
  invalid: [
    {
      code: 'expect(NaN).toBe(NaN);',
      errors: [{ column: 13, endColumn: 17, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect(NaN).toBeNaN();',
    },
    {
      code: 'expect(NaN).toEqual(NaN);',
      errors: [{ column: 13, endColumn: 20, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect(NaN).toBeNaN();',
    },
    {
      code: 'expect(NaN).toStrictEqual(NaN);',
      errors: [{ column: 13, endColumn: 26, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect(NaN).toBeNaN();',
    },
    {
      code: 'expect("a string").not.toBe(NaN);',
      errors: [{ column: 24, endColumn: 28, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect("a string").not.toBeNaN();',
    },
    {
      code: 'expect("a string").rejects.not.toBe(NaN);',
      errors: [{ column: 32, endColumn: 36, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect("a string").rejects.not.toBeNaN();',
    },
    {
      code: 'expect("a string")["rejects"].not.toBe(NaN);',
      errors: [{ column: 35, endColumn: 39, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect("a string")["rejects"].not.toBeNaN();',
    },
    {
      code: 'expect("a string").not.toEqual(NaN);',
      errors: [{ column: 24, endColumn: 31, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect("a string").not.toBeNaN();',
    },
    {
      code: 'expect("a string").not.toStrictEqual(NaN);',
      errors: [{ column: 24, endColumn: 37, line: 1, messageId: 'useToBeNaN' }],
      output: 'expect("a string").not.toBeNaN();',
    },
    // Global aliases
    {
      code: 'assert(NaN).toBe(NaN);',
      errors: [{ column: 13, endColumn: 17, line: 1, messageId: 'useToBeNaN' }],
      output: 'assert(NaN).toBeNaN();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    'expect(NaN).toBeNaN();',
    'expect(true).not.toBeNaN();',
    'expect({}).toEqual({});',
    'expect(something).toBe()',
    'expect(something).toBe(somethingElse)',
    'expect(something).toEqual(somethingElse)',
    'expect(something).not.toBe(somethingElse)',
    'expect(something).not.toEqual(somethingElse)',
    'expect(undefined).toBe',
    'expect("something");',
    // Global aliases
    {
      code: 'assert(NaN).toBeNaN();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})

runRuleTester('prefer-to-be: undefined vs defined', rule, {
  invalid: [
    {
      code: 'expect(undefined).not.toBeDefined();',
      errors: [
        { column: 23, endColumn: 34, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'expect(undefined).toBeUndefined();',
    },
    {
      code: 'expect(undefined).resolves.not.toBeDefined();',
      errors: [
        { column: 32, endColumn: 43, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'expect(undefined).resolves.toBeUndefined();',
    },
    {
      code: 'expect(undefined).resolves.toBe(undefined);',
      errors: [
        { column: 28, endColumn: 32, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'expect(undefined).resolves.toBeUndefined();',
    },
    {
      code: 'expect("a string").not.toBeUndefined();',
      errors: [
        { column: 24, endColumn: 37, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").toBeDefined();',
    },
    {
      code: 'expect("a string").rejects.not.toBeUndefined();',
      errors: [
        { column: 32, endColumn: 45, line: 1, messageId: 'useToBeDefined' },
      ],
      output: 'expect("a string").rejects.toBeDefined();',
    },
    // Global aliases
    {
      code: 'assert(undefined).not.toBeDefined();',
      errors: [
        { column: 23, endColumn: 34, line: 1, messageId: 'useToBeUndefined' },
      ],
      output: 'assert(undefined).toBeUndefined();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
  valid: [
    'expect(NaN).toBeNaN();',
    'expect(true).not.toBeNaN();',
    'expect({}).toEqual({});',
    'expect(something).toBe()',
    'expect(something).toBe(somethingElse)',
    'expect(something).toEqual(somethingElse)',
    'expect(something).not.toBe(somethingElse)',
    'expect(something).not.toEqual(somethingElse)',
    'expect(undefined).toBe',
    'expect("something");',
    // Global aliases
    {
      code: 'assert(NaN).toBeNaN();',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
