import type * as ESTree from 'estree'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { options } = context
    const max: number = options[0]?.max ?? 5
    const describes: ESTree.CallExpression[] = []

    return {
      'CallExpression'(node) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          describes.unshift(node)

          if (describes.length > max) {
            context.report({
              data: {
                depth: describes.length.toString(),
                max: max.toString(),
              },
              messageId: 'exceededMaxDepth',
              node: node.callee,
            })
          }
        }
      },
      'CallExpression:exit'(node) {
        if (describes[0] === node) {
          describes.shift()
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforces a maximum depth to nested describe calls',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/max-nested-describe.md',
    },
    messages: {
      exceededMaxDepth:
        'Maximum describe call depth exceeded ({{ depth }}). Maximum allowed is {{ max }}.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          max: {
            minimum: 0,
            type: 'integer',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
