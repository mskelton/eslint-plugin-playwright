import type * as ESTree from 'estree'
import { getStringValue, isStringLiteral } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

const messageId = 'noNetworkidle'
const methods = new Set([
  'goBack',
  'goForward',
  'goto',
  'reload',
  'setContent',
  'waitForLoadState',
  'waitForURL',
])

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') {
          return
        }

        const methodName = getStringValue(node.callee.property)
        if (!methods.has(methodName)) {
          return
        }

        // waitForLoadState has a single string argument
        if (methodName === 'waitForLoadState') {
          const arg = node.arguments[0]

          if (arg && isStringLiteral(arg, 'networkidle')) {
            context.report({ messageId, node: arg })
          }

          return
        }

        // All other methods have an options object
        if (node.arguments.length >= 2) {
          const [_, arg] = node.arguments
          if (arg.type !== 'ObjectExpression') {
            return
          }

          const property = arg.properties
            .filter((p): p is ESTree.Property => p.type === 'Property')
            .find((p) => isStringLiteral(p.value, 'networkidle'))

          if (property) {
            context.report({ messageId, node: property.value })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Prevent usage of the networkidle option',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-networkidle.md',
    },
    messages: {
      noNetworkidle: 'Unexpected use of networkidle.',
    },
    type: 'problem',
  },
})
