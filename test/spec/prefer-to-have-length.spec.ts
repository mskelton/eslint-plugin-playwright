import rule from '../../src/rules/prefer-to-have-length';
import { runRuleTester } from '../utils/rule-tester';

runRuleTester('prefer-to-have-length', rule, {
  invalid: [
    {
      code: 'expect(files.length).toBe(1)',
      errors: [
        { column: 22, endColumn: 26, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect(files).toHaveLength(1)',
    },
    {
      code: 'expect(files.length).not.toBe(1)',
      errors: [
        { column: 26, endColumn: 30, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect(files).not.toHaveLength(1)',
    },
    {
      code: 'expect.soft(files["length"]).not.toBe(1)',
      errors: [
        { column: 34, endColumn: 38, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect.soft(files).not.toHaveLength(1)',
    },
    {
      code: 'expect(files["length"]).not["toBe"](1)',
      errors: [
        { column: 29, endColumn: 35, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect(files).not["toHaveLength"](1)',
    },
    {
      code: 'expect(files.length)[`toEqual`](1)',
      errors: [
        { column: 22, endColumn: 31, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect(files)[`toHaveLength`](1)',
    },
    {
      code: 'expect(files.length).toStrictEqual(1)',
      errors: [
        { column: 22, endColumn: 35, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect(files).toHaveLength(1)',
    },
    {
      code: 'expect(files.length).not.toStrictEqual(1)',
      errors: [
        { column: 26, endColumn: 39, line: 1, messageId: 'useToHaveLength' },
      ],
      output: 'expect(files).not.toHaveLength(1)',
    },
  ],
  valid: [
    'expect(files).toHaveLength(1)',
    "expect(files.name).toBe('file')",
    "expect(files['name']).toBe('file')",
    "expect(files[`name`]).toBe('file')",
    'expect(result).toBe(true)',
    `expect(user.getUserName(5)).not.toEqual('Paul')`,
    `expect(user.getUserName(5)).not.toEqual('Paul')`,
    'expect(a)',
  ],
});
