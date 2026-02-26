import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-to-have-count.js'

runRuleTester('prefer-to-have-count', rule, {
  invalid: [
    {
      code: 'expect(await files.count()).toBe(1)',
      errors: [{ column: 29, endColumn: 33, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files).toHaveCount(1)',
    },
    {
      code: 'expect(await files.count()).not.toBe(1)',
      errors: [{ column: 33, endColumn: 37, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files).not.toHaveCount(1)',
    },
    {
      code: 'expect.soft(await files["count"]()).not.toBe(1)',
      errors: [{ column: 41, endColumn: 45, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect.soft(files).not.toHaveCount(1)',
    },
    {
      code: 'expect(await files["count"]()).not["toBe"](1)',
      errors: [{ column: 36, endColumn: 42, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files).not["toHaveCount"](1)',
    },
    {
      code: 'expect(await files.count())[`toEqual`](1)',
      errors: [{ column: 29, endColumn: 38, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files)[`toHaveCount`](1)',
    },
    {
      code: 'expect(await files.count()).toStrictEqual(1)',
      errors: [{ column: 29, endColumn: 42, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files).toHaveCount(1)',
    },
    {
      code: 'expect(await files.count()).not.toStrictEqual(1)',
      errors: [{ column: 33, endColumn: 46, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files).not.toHaveCount(1)',
    },
    {
      code: 'expect(await files.count()).toBe(foo)',
      errors: [{ column: 29, endColumn: 33, line: 1, messageId: 'useToHaveCount' }],
      output: 'await expect(files).toHaveCount(foo)',
    },
    // Global aliases
    {
      code: 'assert(await files.count()).toBe(1)',
      errors: [{ column: 29, endColumn: 33, line: 1, messageId: 'useToHaveCount' }],
      output: 'await assert(files).toHaveCount(1)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("test", async () => { expect(await files.count()).toBe(1); });
      `,
      errors: [{ column: 58, endColumn: 62, line: 2, messageId: 'useToHaveCount' }],
      output: dedent`
        const custom = test.extend({});
        custom("test", async () => { await expect(files).toHaveCount(1); });
      `,
    },
    {
      code: `
        const filesCount = await files.count();
        expect(filesCount).toBe(1)
      `,
      errors: [{ column: 28, endColumn: 32, line: 3, messageId: 'useToHaveCount' }],
      output: `
        const filesCount = files;
        await expect(filesCount).toHaveCount(1)
      `,
    },
    {
      code: `
        const filesCount = await files.count();
        const unrelatedConst = unrelated;
        expect(filesCount).toBe(1)
      `,
      errors: [{ column: 28, endColumn: 32, line: 4, messageId: 'useToHaveCount' }],
      output: `
        const filesCount = files;
        const unrelatedConst = unrelated;
        await expect(filesCount).toHaveCount(1)
      `,
    },
    {
      code: `
        let filesCount = 3;
        filesCount = await files.count();
        expect(filesCount).toBe(1);
      `,
      errors: [{ column: 28, endColumn: 32, line: 4, messageId: 'useToHaveCount' }],
      output: `
        let filesCount = 3;
        filesCount = files;
        await expect(filesCount).toHaveCount(1);
      `,
    },
    {
      code: `
        let filesCount = 3;
        filesCount = await files.count();
        let unrelatedVar = unrelated;
        expect(filesCount).toBe(1);
      `,
      errors: [{ column: 28, endColumn: 32, line: 5, messageId: 'useToHaveCount' }],
      output: `
        let filesCount = 3;
        filesCount = files;
        let unrelatedVar = unrelated;
        await expect(filesCount).toHaveCount(1);
      `,
    },
    {
      code: `
        let filesCount = 3;
        filesCount = await files.count();
        expect(filesCount).toBe(1);
        filesCount = 0;
      `,
      errors: [{ column: 28, endColumn: 32, line: 4, messageId: 'useToHaveCount' }],
      output: `
        let filesCount = 3;
        filesCount = files;
        await expect(filesCount).toHaveCount(1);
        filesCount = 0;
      `,
    },
    {
      code: "expect(await page.getByText('test').all()).toHaveLength(2)",
      errors: [{ column: 44, endColumn: 56, line: 1, messageId: 'useToHaveCount' }],
      output: "await expect(page.getByText('test')).toHaveCount(2)",
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(await files.count()).toBe(1);
      `,
      errors: [{ column: 31, endColumn: 35, line: 2, messageId: 'useToHaveCount' }],
      output: dedent`
        import { expect as assuming } from '@playwright/test';
        await assuming(files).toHaveCount(1);
      `,
    },
  ],
  valid: [
    { code: 'await expect(files).toHaveCount(1)' },
    { code: 'await expect(files).toHaveCount(foo)' },
    { code: 'await expect(files.length).toBe(1)' },
    { code: "expect(files.name).toBe('file')" },
    { code: "expect(files['name']).toBe('file')" },
    { code: "expect(files[`name`]).toBe('file')" },
    { code: 'expect(result).toBe(true)' },
    { code: `expect(user.getUserName(5)).not.toEqual('Paul')` },
    { code: 'expect(a)' },
    {
      code: `expect(await page.evaluate(() => document.querySelectorAll("*").length)).toBe(10);`,
    },
    // `toHaveLength`
    { code: 'expect(files.length).toBe(1)' },
    { code: 'expect(files).toHaveLength(1)' },
    // Global aliases
    {
      code: 'await assert(files).toHaveCount(1)',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("test", async () => { await expect(files).toHaveCount(1); });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        await assuming(files).toHaveCount(1);
      `,
    },
  ],
})
