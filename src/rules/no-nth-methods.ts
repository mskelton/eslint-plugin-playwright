import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

const methods = new Set(['first', 'last', 'nth'])

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return

        const method = getStringValue(node.callee.property)
        if (!methods.has(method)) return

        context.report({
          data: { method },
          loc: {
            end: node.loc!.end,
            start: node.callee.property.loc!.start,
          },
          messageId: 'noNthMethod',
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow usage of nth methods',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-nth-methods.md',
    },
    messages: {
      noNthMethod: 'Unexpected use of {{method}}()',
    },
    type: 'problem',
  },
})
