import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-nested-step.js'

const messageId = 'noNestedStep'

runRuleTester('max-nested-step', rule, {
  invalid: [
    {
      code: dedent`
        test('foo', async () => {
          await test.step("step1", async () => {
            await test.step("nested step1", async () => {
              await expect(true).toBe(true);
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 20, endLine: 3, line: 3, messageId }],
    },
    {
      code: dedent`
        test('foo', async () => {
          await test.step("step1", async () => {
            await test.step("nested step1", async () => {
              await expect(true).toBe(true);
            });
            await test.step("nested step1", async () => {
              await expect(true).toBe(true);
            });
          });
        });
      `,
      errors: [
        { column: 11, endColumn: 20, endLine: 3, line: 3, messageId },
        { column: 11, endColumn: 20, endLine: 6, line: 6, messageId },
      ],
    },
    {
      code: dedent`
        test('foo', async () => {
          await test.step("step1", async () => {
            await test.step("nested step1", async () => {
              await expect(true).toBe(true);
            });
            await test.step.skip("nested step2", async () => {
              await expect(true).toBe(true);
            });
          });
        });
      `,
      errors: [
        { column: 11, endColumn: 20, endLine: 3, line: 3, messageId },
        { column: 11, endColumn: 25, endLine: 6, line: 6, messageId },
      ],
    },
    // Global aliases
    {
      code: dedent`
        it('foo', async () => {
          await it.step("step1", async () => {
            await it.step("nested step1", async () => {
              await expect(true).toBe(true);
            });
          });
        });
      `,
      errors: [{ column: 11, endColumn: 18, endLine: 3, line: 3, messageId }],
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
  valid: [
    'await test.step("step1", () => {});',
    'await test.step("step1", async () => {});',
    'await test.step.skip("step1", async () => {});',
    {
      code: dedent`
        test('foo', async () => {
          await expect(true).toBe(true);
        });
      `,
    },
    {
      code: dedent`
        test('foo', async () => {
          await test.step("step1", async () => {
            await expect(true).toBe(true);
          });
        });
      `,
    },
    {
      code: dedent`
        test('foo', async () => {
          await test.step("step1", async () => {
            await expect(true).toBe(true);
          });
          await test.step("step2", async () => {
            await expect(true).toBe(true);
          });
        });
      `,
    },
    {
      code: dedent`
        test('foo', async () => {
          await test.step("step1", async () => {
            await expect(true).toBe(true);
          });
          await test.step.skip("step2", async () => {
            await expect(true).toBe(true);
          });
        });
      `,
    },
    // Global aliases
    {
      code: 'await it.step("step1", () => {});',
      settings: {
        playwright: {
          globalAliases: { test: ['it'] },
        },
      },
    },
  ],
})
