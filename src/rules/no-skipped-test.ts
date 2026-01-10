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
        if (
          call?.group !== 'test' &&
          call?.group !== 'describe' &&
          call?.group !== 'step'
        ) {
          return
        }

        const skipNode = call.members.find((s) => getStringValue(s) === 'skip')
        if (!skipNode) return

        // If the call is a standalone `test.skip()` call, and not a test
        // annotation, we have to treat it a bit differently.
        const isStandalone = call.type === 'config'

        // If allowConditional is enabled and it's not a test/describe function,
        // we ignore any `test.skip` calls that have no arguments.
        if (
          isStandalone &&
          allowConditional &&
          (node.arguments.length !== 0 ||
            findParent(node, 'BlockStatement')?.parent?.type === 'IfStatement')
        ) {
          return
        }

        context.report({
          messageId: 'noSkippedTest',
          node: isStandalone ? node : skipNode,
          suggest: [
            {
              fix: (fixer) => {
                return isStandalone
                  ? fixer.remove(node.parent)
                  : fixer.removeRange([
                      skipNode.range![0] - 1,
                      skipNode.range![1] +
                        Number(skipNode.type !== 'Identifier'),
                    ])
              },
              messageId: 'removeSkippedTestAnnotation',
            },
          ],
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prevent usage of the `.skip()` skip test annotation.',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-skipped-test.md',
    },
    hasSuggestions: true,
    messages: {
      noSkippedTest: 'Unexpected use of the `.skip()` annotation.',
      removeSkippedTestAnnotation: 'Remove the `.skip()` annotation.',
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
