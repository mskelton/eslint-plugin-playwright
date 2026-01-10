import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (
          call?.type !== 'expect' ||
          call.modifiers.some((m) => {
            const name = getStringValue(m)
            return name === 'soft' || name === 'poll'
          })
        ) {
          return
        }

        context.report({
          fix: (fixer) => fixer.insertTextAfter(call.head.node, '.soft'),
          messageId: 'requireSoft',
          node: call.head.node,
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Require all assertions to use `expect.soft`',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-soft-assertions.md',
    },
    fixable: 'code',
    messages: {
      requireSoft: 'Unexpected non-soft assertion',
    },
    schema: [],
    type: 'suggestion',
  },
})
