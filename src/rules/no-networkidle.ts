import type * as ESTree from 'estree'
import { getStringValue, isStringNode } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

const messageId = 'noNetworkidle'
// Methods where the options object is the first argument instead of the
// second (e.g. `page.reload([options])` vs `page.goto(url[, options])`).
const optionsArgIndex: Record<string, number> = {
  goBack: 0,
  goForward: 0,
  reload: 0,
}
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

          if (arg && isStringNode(arg, 'networkidle')) {
            context.report({ messageId, node: arg })
          }

          return
        }

        // All other methods have an options object. For `goto`, `setContent`,
        // and `waitForURL` the options are the second argument, while `goBack`,
        // `goForward`, and `reload` take the options as their first argument.
        const argIndex = optionsArgIndex[methodName] ?? 1
        const arg = node.arguments[argIndex]

        if (arg && arg.type === 'ObjectExpression') {
          const property = arg.properties
            .filter((p): p is ESTree.Property => p.type === 'Property')
            .find((p) => isStringNode(p.value, 'networkidle'))

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
