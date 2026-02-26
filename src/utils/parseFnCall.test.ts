import dedent from 'dedent'
import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { getStringValue } from './ast.js'
import {
  isSupportedAccessor,
  type ParsedFnCall,
  parseFnCallWithReason,
  type ResolvedFnWithNode,
} from './parseFnCall.js'
import { runRuleTester, runTSRuleTester } from './rule-tester.js'

const isNode = (obj: unknown): obj is ESTree.Node => {
  if (typeof obj === 'object' && obj !== null) {
    return ['type', 'loc', 'range', 'parent'].every((p) => p in obj)
  }

  return false
}

const rule = {
  create: (context) => ({
    CallExpression(node) {
      const call = parseFnCallWithReason(context, node)

      if (typeof call === 'string') {
        context.report({ messageId: call, node })
      } else if (call) {
        const sorted = sortKeys({
          ...call,
          head: sortKeys(call.head),
        })

        context.report({
          data: {
            data: JSON.stringify(sortKeys(sorted), (_key, value) => {
              if (isNode(value)) {
                if (isSupportedAccessor(value)) {
                  return getStringValue(value)
                }

                return undefined
              }

              return value
            }),
          },
          messageId: 'details',
          node,
        })
      }
    },
  }),
  meta: {
    docs: {
      description: 'Fake rule for testing parseFnCall',
      recommended: false,
    },
    messages: {
      'details': '{{ data }}',
      'matcher-not-called': 'matcherNotCalled',
      'matcher-not-found': 'matcherNotFound',
      'modifier-unknown': 'modifierUnknown',
    },
    schema: [],
    type: 'problem',
  },
} as Rule.RuleModule

interface TestResolvedFnWithNode extends Omit<ResolvedFnWithNode, 'node'> {
  node: string
}

interface TestParsedFnCall extends Omit<ParsedFnCall, 'head' | 'members' | 'modifiers'> {
  args?: (string | null)[]
  head: TestResolvedFnWithNode
  matcher?: string
  matcherArgs?: string[]
  matcherName?: string
  members: string[]
  modifiers?: string[]
}

const sortKeys = (obj: unknown) =>
  Object.fromEntries(Object.entries(obj as Record<string, unknown>).sort())

const expectedParsedFnCallResultData = (result: TestParsedFnCall) => ({
  data: JSON.stringify({
    args: result.args,
    group: result.group,
    head: sortKeys(result.head),
    matcher: result.matcher,
    matcherArgs: result.matcherArgs,
    matcherName: result.matcherName,
    members: result.members,
    modifiers: result.modifiers,
    name: result.name,
    type: result.type,
  }),
})

runRuleTester('nonexistent methods', rule, {
  invalid: [],
  valid: [
    'describe.something()',
    'describe.me()',
    'test.me()',
    'it.fails()',
    'context()',
    'context.each``()',
    'context.each()',
    'describe.context()',
    'describe.concurrent()()',
    'describe.concurrent``()',
    'describe.every``()',
    '/regex/.test()',
    '"something".describe()',
    '[].describe()',
    'new describe().only()',
    '``.test()',
    'test``.only()',
  ],
})

runRuleTester('expect', rule, {
  invalid: [
    {
      code: 'expect(x).toBe(y);',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['toBe'],
            modifiers: [],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'expect.soft(x).toBe(y);',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['soft', 'toBe'],
            modifiers: ['soft'],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'expect.poll(() => x).toBe(y);',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: [null],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['poll', 'toBe'],
            modifiers: ['poll'],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'expect["poll"](() => x).toBe(y);',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: [null],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['poll', 'toBe'],
            modifiers: ['poll'],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'expect[`poll`](() => x).toBe(y);',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: [null],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['poll', 'toBe'],
            modifiers: ['poll'],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@playwright/test';

        expect(x).toBe(y);
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['toBe'],
            modifiers: [],
            name: 'expect',
            type: 'expect',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        import { expect } from '@playwright/test';

        expect(x).not.toBe(y);
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['not', 'toBe'],
            modifiers: ['not'],
            name: 'expect',
            type: 'expect',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'something(expect(x).not.toBe(y))',
      errors: [
        {
          column: 11,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'expect',
              node: 'expect',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['not', 'toBe'],
            modifiers: ['not'],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'something(expect(x).not.toBe)',
      errors: [{ column: 11, line: 1, messageId: 'matcher-not-called' }],
    },
    {
      code: dedent`
        import { expect } from '@playwright/test';

        expect;
        expect(x);
        expect(x).toBe;
        expect(x).not.toBe;
        //expect(x).toBe(x).not();
      `,
      errors: [
        { column: 1, line: 4, messageId: 'matcher-not-found' },
        { column: 1, line: 5, messageId: 'matcher-not-called' },
        { column: 1, line: 6, messageId: 'matcher-not-called' },
      ],
    },
    {
      code: dedent`
        import { expect } from '@playwright/test';

        expect(x).is.toBe(x);
      `,
      errors: [{ column: 1, line: 3, messageId: 'modifier-unknown' }],
    },
    {
      code: 'expect(x).not(y);',
      errors: [{ column: 1, line: 1, messageId: 'matcher-not-found' }],
    },
    {
      code: dedent`
        import { expect } from '@playwright/test';

        expect(x).not.resolves.toBe(x);
      `,
      errors: [{ column: 1, line: 3, messageId: 'modifier-unknown' }],
    },
    {
      code: 'test.expect(x).toBe(y);',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['toBe'],
            modifiers: [],
            name: 'expect',
            type: 'expect',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
  ],
  valid: [],
})

runRuleTester('test', rule, {
  invalid: [
    {
      code: 'test("a test", () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test("a test", { tag: ["@fast", "@login"] }, () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        test('test full report', {
          annotation: [
            { type: 'issue', description: 'https://github.com/microsoft/playwright/issues/23180' },
            { type: 'docs', description: 'https://playwright.dev/docs/test-annotations#tag-tests' },
          ],
        }, async ({ page }) => {
          // ...
        });
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.step("a step", () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'step',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['step'],
            name: 'step',
            type: 'step',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.step.skip("a step", () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'step',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['step', 'skip'],
            name: 'step',
            type: 'step',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.step("a step", () => {}, { timeout: 1000 });',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'step',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['step'],
            name: 'step',
            type: 'step',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.only("a test", () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['only'],
            name: 'test',
            type: 'test',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.skip("a test", () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['skip'],
            name: 'test',
            type: 'test',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.slow("a test", () => {});',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['slow'],
            name: 'test',
            type: 'test',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.use({ locale: "en-US" })',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['use'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.skip()',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['skip'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.skip(true)',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['skip'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.skip(({ browserName }) => browserName === "Chrome")',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['skip'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.skip(browserName === "Chrome", "This feature is skipped on Chrome")',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['skip'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.slow()',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['slow'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.slow(true)',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['slow'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.slow(({ browserName }) => browserName === "Chrome")',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['slow'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.slow(browserName === "Chrome", "This feature is skipped on Chrome")',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['slow'],
            name: 'test',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
  ],
  valid: [
    // Other functions
    'it("is a  function", () => {});',
    'ByDefault.sayHello();',
  ],
})

runRuleTester('describe', rule, {
  invalid: [
    {
      code: 'describe("when there is an error", () => {})',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'describe',
              node: 'describe',
              original: null,
            },
            members: [],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'describe.skip("when there is an error", () => {})',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'describe',
              node: 'describe',
              original: null,
            },
            members: ['skip'],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.describe("when there is an error", () => {})',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['describe'],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.describe.skip("when there is an error", () => {})',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['describe', 'skip'],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        test.describe('group', {
          tag: '@report',
        }, () => {
          test('test report header', async ({ page }) => {
            // ...
          });

          test('test full report', {
            tag: ['@slow', '@vrt'],
          }, async ({ page }) => {
            // ...
          });
        });
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['describe'],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
        {
          column: 3,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 4,
          messageId: 'details',
        },
        {
          column: 3,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 8,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'context("when there is an error", () => {})',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'context',
              node: 'context',
              original: 'describe',
            },
            members: [],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
      settings: { playwright: { globalAliases: { describe: ['context'] } } },
    },
    {
      code: 'context.skip("when there is an error", () => {})',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'context',
              node: 'context',
              original: 'describe',
            },
            members: ['skip'],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
      settings: { playwright: { globalAliases: { describe: ['context'] } } },
    },
    {
      code: dedent`
        context("when there is an error", () => {})
        describe("when there is an error", () => {})
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'context',
              node: 'context',
              original: 'describe',
            },
            members: [],
            name: 'describe',
            type: 'describe',
          }),
          line: 1,
          messageId: 'details',
        },
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'describe',
              node: 'describe',
              original: null,
            },
            members: [],
            name: 'describe',
            type: 'describe',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
      settings: { playwright: { globalAliases: { describe: ['context'] } } },
    },
    {
      code: 'describe.configure({ mode: "parallel" })',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'describe',
              node: 'describe',
              original: null,
            },
            members: ['configure'],
            name: 'describe',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
    {
      code: 'test.describe.configure({ mode: "parallel" })',
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: ['describe', 'configure'],
            name: 'describe',
            type: 'config',
          }),
          line: 1,
          messageId: 'details',
        },
      ],
    },
  ],
  valid: [
    {
      code: 'mycontext("skip this please", () => {});',
      settings: { playwright: { globalAliases: { describe: ['context'] } } },
    },
  ],
})

runRuleTester('test.extend', rule, {
  invalid: [
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom("a test", () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom.only("a test", () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: ['only'],
            name: 'test',
            type: 'test',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        const custom = test.extend({ myFixture: async ({}, use) => { await use('') } });
        custom.describe("a suite", () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: ['describe'],
            name: 'describe',
            type: 'describe',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        const custom = test.extend({});
        const custom2 = custom.extend({});
        custom2("a test", () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'custom2',
              node: 'custom2',
              original: 'test',
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        const custom = it.extend({});
        custom("a test", () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.beforeEach(async ({ myFixture }) => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'hook',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: ['beforeEach'],
            name: 'beforeEach',
            type: 'hook',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        const custom = test.extend({});
        custom.step("a step", async () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'step',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: ['step'],
            name: 'step',
            type: 'step',
          }),
          line: 2,
          messageId: 'details',
        },
      ],
    },
  ],
  valid: [
    'const custom = test.extend({})',
    'something.extend({})',
    'unknown("not a test", () => {})',
  ],
})

runTSRuleTester('import aliases', rule, {
  invalid: [
    {
      code: dedent`
        import { test as stuff } from '@playwright/test';

        stuff('a test', () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'stuff',
              node: 'stuff',
              original: 'test',
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        import { test as stuff } from '@playwright/test';

        stuff.describe('a suite', () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'describe',
            head: {
              local: 'stuff',
              node: 'stuff',
              original: 'test',
            },
            members: ['describe'],
            name: 'describe',
            type: 'describe',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        import { test as base } from '@playwright/test';

        const custom = base.extend({});
        custom('a test', () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'custom',
              node: 'custom',
              original: 'test',
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 4,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        import { expect as assert } from '@playwright/test';

        assert(x).toBe(y);
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'assert',
              node: 'assert',
              original: 'expect',
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['toBe'],
            modifiers: [],
            name: 'expect',
            type: 'expect',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
    {
      code: dedent`
        import { expect as e } from '@playwright/test';

        e.soft(x).toBe(y);
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            args: ['x'],
            group: 'expect',
            head: {
              local: 'e',
              node: 'e',
              original: 'expect',
            },
            matcher: 'toBe',
            matcherArgs: ['y'],
            matcherName: 'toBe',
            members: ['soft', 'toBe'],
            modifiers: ['soft'],
            name: 'expect',
            type: 'expect',
          }),
          line: 3,
          messageId: 'details',
        },
      ],
    },
  ],
  valid: [],
})

runTSRuleTester('typescript', rule, {
  invalid: [
    {
      code: dedent`
        import { test } from '../it-utils';
        import { test } from '@playwright/test';

        test('is a  function', () => {});
      `,
      errors: [
        {
          column: 1,
          data: expectedParsedFnCallResultData({
            group: 'test',
            head: {
              local: 'test',
              node: 'test',
              original: null,
            },
            members: [],
            name: 'test',
            type: 'test',
          }),
          line: 4,
          messageId: 'details',
        },
      ],
    },
  ],
  valid: [
    {
      code: dedent`
        function it(message: string, fn: () => void): void;
        function it(cases: unknown[], message: string, fn: () => void): void;
        function it(...all: any[]): void {}

        it('is not a  function', () => {});
      `,
    },
    {
      code: dedent`
        interface it {}
        function it(...all: any[]): void {}

        it('is not a  function', () => {});
      `,
    },
    "it('is not a  function', () => {});",
    'typescript()',
    'expect.assertions()',
    'expect.anything()',
    'expect.arrayContaining()',
    'expect.objectContaining(expected)',
    'expect.not.objectContaining(expected)',
    {
      code: dedent`
        import { expect } from '@playwright/test';

        expect.assertions();
        expect.anything();
      `,
    },
  ],
})
