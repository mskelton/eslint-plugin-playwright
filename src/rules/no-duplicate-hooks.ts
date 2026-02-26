import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const hookContexts: Array<Record<string, number>> = [{}]

    return {
      'CallExpression'(node) {
        const call = parseFnCall(context, node)
        if (!call) {
          return
        }

        if (call.type === 'describe') {
          hookContexts.push({})
        }

        if (call.type !== 'hook') {
          return
        }

        const currentLayer = hookContexts[hookContexts.length - 1]
        const name =
          node.callee.type === 'MemberExpression' ? getStringValue(node.callee.property) : ''

        currentLayer[name] ||= 0
        currentLayer[name] += 1

        if (currentLayer[name] > 1) {
          context.report({
            data: { hook: name },
            messageId: 'noDuplicateHook',
            node,
          })
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          hookContexts.pop()
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow duplicate setup and teardown hooks',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-duplicate-hooks.md',
    },
    messages: {
      noDuplicateHook: 'Duplicate {{ hook }} in describe block',
    },
    type: 'suggestion',
  },
})
