import { findParent, getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const options = context.options[0] || {}
        const allowConditional = !!options.allowConditional

        const call = parseFnCall(context, node)
        if (call?.group !== 'test') {
          return
        }

        const slowNode = call.members.find((s) => getStringValue(s) === 'slow')
        if (!slowNode) {
          return
        }

        // If the call is a standalone `test.slow()` call, and not a test
        // annotation, we have to treat it a bit differently.
        const isStandalone = call.type === 'config'

        // If allowConditional is enabled and it's not a test function,
        // we ignore any `test.slow` calls that have no arguments.
        if (
          isStandalone &&
          allowConditional &&
          (node.arguments.length !== 0 ||
            findParent(node, 'BlockStatement')?.parent?.type === 'IfStatement')
        ) {
          return
        }

        context.report({
          messageId: 'noSlowedTest',
          node: isStandalone ? node : slowNode,
          suggest: [
            {
              fix: (fixer) => {
                return isStandalone
                  ? fixer.remove(node.parent)
                  : fixer.removeRange([
                      slowNode.range![0] - 1,
                      slowNode.range![1] + Number(slowNode.type !== 'Identifier'),
                    ])
              },
              messageId: 'removeSlowedTestAnnotation',
            },
          ],
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Prevent usage of the `.slow()` slow test annotation.',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-slowed-test.md',
    },
    hasSuggestions: true,
    messages: {
      noSlowedTest: 'Unexpected use of the `.slow()` annotation.',
      removeSlowedTestAnnotation: 'Remove the `.slow()` annotation.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowConditional: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
