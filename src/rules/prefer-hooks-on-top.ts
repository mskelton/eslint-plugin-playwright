import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const stack = [false]

    return {
      'CallExpression'(node) {
        if (isTypeOfFnCall(context, node, ['test'])) {
          stack[stack.length - 1] = true
        }

        if (stack.at(-1) && isTypeOfFnCall(context, node, ['hook'])) {
          context.report({ messageId: 'noHookOnTop', node })
        }

        stack.push(false)
      },
      'CallExpression:exit'() {
        stack.pop()
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest having hooks before any test cases',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-hooks-on-top.md',
    },
    messages: {
      noHookOnTop: 'Hooks should come before test cases',
    },
    type: 'suggestion',
  },
})
