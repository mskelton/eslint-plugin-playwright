import type { Rule } from 'eslint'
import { findParent } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    function checkConditional(node: Rule.Node & Rule.NodeParentExtension) {
      // Skip nullish coalescing and logical OR operators - they're not conditionals
      if (node.type === 'LogicalExpression' && (node.operator === '??' || node.operator === '||')) {
        return
      }

      const call = findParent(node, 'CallExpression')
      if (!call) return

      if (isTypeOfFnCall(context, call, ['test', 'step'])) {
        // Check if the conditional is inside the test body (the function passed as the last argument)
        const testFunction = call.arguments[call.arguments.length - 1]

        // Use findParent to check if the conditional is inside the test function body
        const functionBody = findParent(node, 'BlockStatement')
        if (!functionBody) return

        // Check if this BlockStatement belongs to our test function
        let currentParent = functionBody.parent
        while (currentParent && currentParent !== testFunction) {
          currentParent = (currentParent as Rule.NodeParentExtension).parent
        }

        // Only report if the conditional is inside the test function body
        if (currentParent === testFunction) {
          context.report({ messageId: 'conditionalInTest', node })
        }
      }
    }

    return {
      ConditionalExpression: checkConditional,
      IfStatement: checkConditional,
      LogicalExpression: checkConditional,
      SwitchStatement: checkConditional,
    }
  },
  meta: {
    docs: {
      description: 'Disallow conditional logic in tests',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-conditional-in-test.md',
    },
    messages: {
      conditionalInTest: 'Avoid having conditionals in tests',
    },
    schema: [],
    type: 'problem',
  },
})
