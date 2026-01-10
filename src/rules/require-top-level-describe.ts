import ESTree from 'estree'
import { createRule } from '../utils/createRule.js'
import { getAmountData } from '../utils/misc.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { maxTopLevelDescribes } = {
      maxTopLevelDescribes: Infinity,
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    let topLevelDescribeCount = 0
    let describeCount = 0

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (!call) return

        if (call.type === 'describe') {
          describeCount++

          if (describeCount === 1) {
            topLevelDescribeCount++

            if (topLevelDescribeCount > maxTopLevelDescribes) {
              context.report({
                data: getAmountData(maxTopLevelDescribes),
                messageId: 'tooManyDescribes',
                node: node.callee,
              })
            }
          }
        } else if (!describeCount) {
          if (call.type === 'test') {
            context.report({ messageId: 'unexpectedTest', node: node.callee })
          } else if (call.type === 'hook') {
            context.report({ messageId: 'unexpectedHook', node: node.callee })
          }
        }
      },
      'CallExpression:exit'(node: ESTree.CallExpression) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          describeCount--
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description:
        'Require test cases and hooks to be inside a `test.describe` block',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-top-level-describe.md',
    },
    messages: {
      tooManyDescribes:
        'There should not be more than {{amount}} describe{{s}} at the top level',
      unexpectedHook: 'All hooks must be wrapped in a describe block.',
      unexpectedTest: 'All test cases must be wrapped in a describe block.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          maxTopLevelDescribes: {
            minimum: 1,
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
