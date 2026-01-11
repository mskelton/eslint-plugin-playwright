import { Rule } from 'eslint'
import ESTree from 'estree'
import { getStringValue, isIdentifier, isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const locatorMethods = new Set([
  'and',
  'first',
  'getByAltText',
  'getByLabel',
  'getByPlaceholder',
  'getByRole',
  'getByTestId',
  'getByText',
  'getByTitle',
  'last',
  'locator',
  'nth',
  'or',
])

const pageMethods = new Set([
  'childFrames',
  'frame',
  'frameLocator',
  'frames',
  'isClosed',
  'isDetached',
  'mainFrame',
  'name',
  'on',
  'page',
  'parentFrame',
  'setDefaultNavigationTimeout',
  'setDefaultTimeout',
  'url',
  'video',
  'viewportSize',
  'workers',
])

const expectMatchers = new Set([
  'toBe',
  'toBeCloseTo',
  'toBeDefined',
  'toBeFalsy',
  'toBeGreaterThan',
  'toBeGreaterThanOrEqual',
  'toBeInstanceOf',
  'toBeLessThan',
  'toBeLessThanOrEqual',
  'toBeNaN',
  'toBeNull',
  'toBeTruthy',
  'toBeUndefined',
  'toContain',
  'toContainEqual',
  'toEqual',
  'toHaveLength',
  'toHaveProperty',
  'toMatch',
  'toMatchObject',
  'toStrictEqual',
  'toThrow',
  'toThrowError',
])

function isSupportedMethod(node: ESTree.CallExpression) {
  if (node.callee.type !== 'MemberExpression') return false

  const name = getStringValue(node.callee.property)
  return locatorMethods.has(name) || (pageMethods.has(name) && isPageMethod(node, name))
}

export default createRule({
  create(context) {
    function fix(node: ESTree.Node) {
      const start = node.loc!.start
      const range = node.range!

      context.report({
        fix: (fixer) => fixer.removeRange([range[0], range[0] + 6]),
        loc: {
          end: {
            column: start.column + 5,
            line: start.line,
          },
          start,
        },
        messageId: 'noUselessAwait',
      })
    }

    return {
      'AwaitExpression > CallExpression'(node: ESTree.CallExpression & Rule.NodeParentExtension) {
        // await page.locator('.foo')
        if (node.callee.type === 'MemberExpression' && isSupportedMethod(node)) {
          return fix(node.parent)
        }

        // await expect(true).toBe(true)
        const call = parseFnCall(context, node)
        if (
          call?.type === 'expect' &&
          !call.modifiers.some((modifier) => isIdentifier(modifier, /^(resolves|rejects)$/)) &&
          !call.members.some((member) => isIdentifier(member, 'poll')) &&
          expectMatchers.has(call.matcherName)
        ) {
          return fix(node.parent)
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Disallow unnecessary awaits for Playwright methods',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-useless-await.md',
    },
    fixable: 'code',
    messages: {
      noUselessAwait: 'Unnecessary await expression. This method does not return a Promise.',
    },
    type: 'problem',
  },
})
