import type * as ESTree from 'estree'
import type { NodeWithParent } from '../utils/types.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const options = {
      max: 5,
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    let count = 0

    const maybeResetCount = (node: ESTree.Node) => {
      const parent = (node as NodeWithParent).parent
      const isTestFn =
        parent?.type !== 'CallExpression' || isTypeOfFnCall(context, parent, ['test'])

      if (isTestFn) {
        count = 0
      }
    }

    return {
      'ArrowFunctionExpression': maybeResetCount,
      'ArrowFunctionExpression:exit': maybeResetCount,
      'CallExpression'(node) {
        const call = parseFnCall(context, node)

        if (
          call?.type !== 'expect' ||
          (call.head.node as NodeWithParent).parent?.type === 'MemberExpression'
        ) {
          return
        }

        count += 1

        if (count > options.max) {
          context.report({
            data: {
              count: count.toString(),
              max: options.max.toString(),
            },
            messageId: 'exceededMaxAssertion',
            node,
          })
        }
      },
      'FunctionExpression': maybeResetCount,
      'FunctionExpression:exit': maybeResetCount,
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforces a maximum number assertion calls in a test body',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/max-expects.md',
    },
    messages: {
      exceededMaxAssertion: 'Too many assertion calls ({{ count }}) - maximum allowed is {{ max }}',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          max: {
            minimum: 1,
            type: 'integer',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
