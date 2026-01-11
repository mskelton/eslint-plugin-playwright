import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-to-have-length.js'

runRuleTester('prefer-to-have-length', rule, {
  invalid: [
    {
      code: 'expect(files.length).toBe(1)',
      errors: [{ column: 22, endColumn: 26, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect(files).toHaveLength(1)',
    },
    {
      code: 'expect(files.length).not.toBe(1)',
      errors: [{ column: 26, endColumn: 30, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect(files).not.toHaveLength(1)',
    },
    {
      code: 'expect.soft(files["length"]).not.toBe(1)',
      errors: [{ column: 34, endColumn: 38, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect.soft(files).not.toHaveLength(1)',
    },
    {
      code: 'expect(files["length"]).not["toBe"](1)',
      errors: [{ column: 29, endColumn: 35, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect(files).not["toHaveLength"](1)',
    },
    {
      code: 'expect(files.length)[`toEqual`](1)',
      errors: [{ column: 22, endColumn: 31, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect(files)[`toHaveLength`](1)',
    },
    {
      code: 'expect(files.length).toStrictEqual(1)',
      errors: [{ column: 22, endColumn: 35, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect(files).toHaveLength(1)',
    },
    {
      code: 'expect(files.length).not.toStrictEqual(1)',
      errors: [{ column: 26, endColumn: 39, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect(files).not.toHaveLength(1)',
    },
    // Global aliases
    {
      code: 'assert(files.length).toBe(1)',
      errors: [{ column: 22, endColumn: 26, line: 1, messageId: 'useToHaveLength' }],
      output: 'assert(files).toHaveLength(1)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: 'expect((await table.rows.all()).length).toBe(5)',
      errors: [{ column: 41, endColumn: 45, line: 1, messageId: 'useToHaveLength' }],
      output: 'expect((await table.rows.all())).toHaveLength(5)',
    },
  ],
  valid: [
    'expect(files).toHaveLength(1)',
    "expect(files.name).toBe('file')",
    "expect(files['name']).toBe('file')",
    "expect(files[`name`]).toBe('file')",
    'expect(result).toBe(true)',
    `expect(user.getUserName(5)).not.toEqual('Paul')`,
    'expect(a)',
    // Global aliases
    {
      code: 'assert(files).toHaveLength(1)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
  ],
})
