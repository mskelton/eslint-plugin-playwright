import rule from '../../src/rules/no-nested-step.js'
import { javascript, runRuleTester } from '../utils/rule-tester.js'

const messageId = 'noNestedStep'

runRuleTester('max-nested-step', rule, {
  invalid: [
    {
      code: javascript`
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
      code: javascript`
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
    // Global aliases
    {
      code: javascript`
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
    {
      code: javascript`
        test('foo', async () => {
          await expect(true).toBe(true);
        });
      `,
    },
    {
      code: javascript`
        test('foo', async () => {
          await test.step("step1", async () => {
            await expect(true).toBe(true);
          });
        });
      `,
    },
    {
      code: javascript`
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
