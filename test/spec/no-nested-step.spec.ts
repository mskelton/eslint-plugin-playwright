import dedent from 'dedent';
import rule from '../../src/rules/no-nested-step';
import { runRuleTester } from '../utils/rule-tester';

const messageId = 'noNestedStep';

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
  ],
  valid: [
    'await test.step("step1", () => {});',
    'await test.step("step1", async () => {});',
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
  ],
});
