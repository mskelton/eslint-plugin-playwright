import { Rule } from 'eslint'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const stack: number[] = []

    function pushStepCallback(node: Rule.Node) {
      const { parent } = node

      if (parent?.type !== 'CallExpression' || !isTypeOfFnCall(context, parent, ['step'])) {
        return
      }

      stack.push(0)

      if (stack.length > 1) {
        context.report({
          messageId: 'noNestedStep',
          node: parent.callee,
        })
      }
    }

    function popStepCallback(node: Rule.Node) {
      const { parent } = node

      if (parent?.type === 'CallExpression' && isTypeOfFnCall(context, parent, ['step'])) {
        stack.pop()
      }
    }

    return {
      'ArrowFunctionExpression': pushStepCallback,
      'ArrowFunctionExpression:exit': popStepCallback,
      'FunctionExpression': pushStepCallback,
      'FunctionExpression:exit': popStepCallback,
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow nested `test.step()` methods',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-nested-step.md',
    },
    messages: {
      noNestedStep: 'Do not nest `test.step()` methods.',
    },
    schema: [],
    type: 'problem',
  },
})
