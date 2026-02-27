import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-useless-not.js'

runRuleTester('no-useless-not', rule, {
  invalid: [
    {
      code: 'expect(locator).not.toBeVisible()',
      errors: [
        {
          column: 17,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeHidden()',
    },
    {
      code: 'expect(locator).not.toBeVisible({ visible: true })',
      errors: [
        {
          column: 17,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeHidden()',
    },
    {
      code: 'expect(locator).toBeVisible({ visible: true })',
      errors: [
        {
          column: 31,
          data: {
            new: 'toBeVisible',
            old: 'toBeVisible',
            property: 'visible',
          },
          endColumn: 44,
          line: 1,
          messageId: 'noUselessTruthy',
        },
      ],
      output: 'expect(locator).toBeVisible()',
    },
    {
      code: 'expect(locator).toBeVisible({ visible: false })',
      errors: [
        {
          column: 31,
          data: {
            new: 'toBeHidden',
            old: 'toBeVisible',
            property: 'visible',
          },
          endColumn: 45,
          line: 1,
          messageId: 'noUselessProperty',
        },
      ],
      output: 'expect(locator).toBeHidden()',
    },
    {
      code: 'expect(locator).not.toBeVisible({ timeout: 1000, visible: true })',
      errors: [
        {
          column: 17,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeHidden({ timeout: 1000 })',
    },
    {
      code: 'expect(locator).not.toBeVisible({ visible: true, timeout: 1000 })',
      errors: [
        {
          column: 17,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeHidden({ timeout: 1000 })',
    },
    {
      code: 'expect(locator).not.toBeVisible({ visible: false })',
      errors: [
        {
          column: 17,
          data: { new: 'toBeVisible', old: 'toBeVisible' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeVisible()',
    },
    {
      code: 'expect(locator).not.toBeHidden()',
      errors: [
        {
          column: 17,
          data: { new: 'toBeVisible', old: 'toBeHidden' },
          endColumn: 31,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeVisible()',
    },
    {
      code: 'expect(locator).not.toBeEnabled()',
      errors: [
        {
          column: 17,
          data: { new: 'toBeDisabled', old: 'toBeEnabled' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeDisabled()',
    },
    {
      code: 'expect(locator).toBeEnabled({ enabled: true })',
      errors: [
        {
          column: 31,
          data: {
            new: 'toBeEnabled',
            old: 'toBeEnabled',
            property: 'enabled',
          },
          endColumn: 44,
          line: 1,
          messageId: 'noUselessTruthy',
        },
      ],
      output: 'expect(locator).toBeEnabled()',
    },
    {
      code: 'expect(locator).not.toBeEnabled({ enabled: true })',
      errors: [
        {
          column: 17,
          data: { new: 'toBeDisabled', old: 'toBeEnabled' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeDisabled()',
    },
    {
      code: 'expect(locator).toBeEnabled({ enabled: false })',
      errors: [
        {
          column: 31,
          data: {
            new: 'toBeDisabled',
            old: 'toBeEnabled',
            property: 'enabled',
          },
          endColumn: 45,
          line: 1,
          messageId: 'noUselessProperty',
        },
      ],
      output: 'expect(locator).toBeDisabled()',
    },
    {
      code: 'expect(locator).not.toBeEnabled({ enabled: false })',
      errors: [
        {
          column: 17,
          data: { new: 'toBeEnabled', old: 'toBeEnabled' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeEnabled()',
    },
    {
      code: 'expect(locator).not.toBeDisabled()',
      errors: [
        {
          column: 17,
          data: { new: 'toBeEnabled', old: 'toBeDisabled' },
          endColumn: 33,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator).toBeEnabled()',
    },
    {
      code: 'expect(locator)["not"]["toBeHidden"]()',
      errors: [
        {
          column: 17,
          endColumn: 36,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator)["toBeVisible"]()',
    },
    {
      code: 'expect(locator)[`not`][`toBeHidden`]()',
      errors: [
        {
          column: 17,
          endColumn: 36,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect(locator)[`toBeVisible`]()',
    },
    {
      code: 'expect.soft(locator).not.toBeVisible()',
      errors: [
        {
          column: 22,
          endColumn: 37,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect.soft(locator).toBeHidden()',
    },
    {
      code: 'expect.poll(() => locator)[`not`][`toBeHidden`]()',
      errors: [
        {
          column: 28,
          endColumn: 47,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'expect.poll(() => locator)[`toBeVisible`]()',
    },
    // Global aliases
    {
      code: 'assert(locator).not.toBeVisible()',
      errors: [
        {
          column: 17,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 32,
          line: 1,
          messageId: 'noUselessNot',
        },
      ],
      output: 'assert(locator).toBeHidden()',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("foo", () => {
          expect(locator).not.toBeVisible();
        });
      `,
      errors: [
        {
          column: 19,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 34,
          line: 3,
          messageId: 'noUselessNot',
        },
      ],
      output: dedent`
        const custom = test.extend({});
        custom("foo", () => {
          expect(locator).toBeHidden();
        });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(locator).not.toBeVisible();
      `,
      errors: [
        {
          column: 19,
          data: { new: 'toBeHidden', old: 'toBeVisible' },
          endColumn: 34,
          line: 2,
          messageId: 'noUselessNot',
        },
      ],
      output: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(locator).toBeHidden();
      `,
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("foo", () => {
          expect(locator).not.toBeDisabled();
        });
      `,
      errors: [
        {
          column: 19,
          data: { new: 'toBeEnabled', old: 'toBeDisabled' },
          endColumn: 35,
          line: 3,
          messageId: 'noUselessNot',
        },
      ],
      name: 'not.toBeDisabled in multiline should be flagged',
      output: dedent`
        const custom = test.extend({});
        custom("foo", () => {
          expect(locator).toBeEnabled();
        });
      `,
    },
  ],
  valid: [
    'expect(locator).toBeVisible()',
    'expect(locator).toBeHidden()',
    'expect(locator).toBeEnabled()',
    'expect(locator).toBeDisabled()',
    'expect.soft(locator).toBeEnabled()',
    'expect.poll(() => locator).toBeDisabled()',
    'expect(locator)[`toBeEnabled`]()',
    'expect(locator)["toBeDisabled"]()',
    // Ignores matchers with options
    'expect(locator).toBeVisible({ visible })',
    'expect(locator).not.toBeVisible({ visible })',
    'expect(locator).toBeEnabled({ enabled })',
    'expect(locator).not.toBeEnabled({ enabled })',
    // Incomplete call expression
    'expect(locator).toBeVisible',
    'expect(locator).toBeEnabled',
    'expect(locator).not.toBeHidden',
    // Doesn't impact non-complimentary matchers
    "expect(locator).not.toHaveText('foo')",
    'expect(locator).not.toBeChecked()',
    'expect(locator).not.toBeChecked({ checked })',
    'expect(locator).not.toBeChecked({ checked: false })',
    'expect(locator).not.toBeFocused()',
    // Global aliases
    {
      code: 'assert(locator).toBeVisible()',
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom("foo", () => {
          expect(locator).toBeVisible();
        });
      `,
    },
    {
      code: dedent`
        import { expect as assuming } from '@playwright/test';
        assuming(locator).toBeVisible();
      `,
    },
  ],
})
