import type * as ESTree from 'estree'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const tagRegex = /@[\S]+/

function hasTagInOptions(node: ESTree.CallExpression): boolean {
  const options = node.arguments[1]
  if (!options || options.type !== 'ObjectExpression') {
    return false
  }

  return options.properties.some(
    (prop) => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'tag',
  )
}

function hasTagInTitle(node: ESTree.CallExpression): boolean {
  const title = node.arguments[0]
  if (!title || title.type !== 'Literal' || typeof title.value !== 'string') {
    return false
  }

  return tagRegex.test(title.value)
}

function hasTags(node: ESTree.CallExpression): boolean {
  return hasTagInTitle(node) || hasTagInOptions(node)
}

export default createRule({
  create(context) {
    const describeStack: boolean[] = []

    return {
      'CallExpression'(node) {
        const call = parseFnCall(context, node)
        if (!call) {
          return
        }

        if (call.type === 'describe') {
          describeStack.push(hasTags(node) || !!describeStack.at(-1))
          return
        }

        if (call.type === 'test') {
          if (hasTags(node) || !!describeStack.at(-1)) {
            return
          }

          context.report({ messageId: 'missingTag', node })
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          describeStack.pop()
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Require test blocks to have tags',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-tags.md',
    },
    messages: {
      missingTag: 'Test must have at least one tag',
    },
    schema: [],
    type: 'suggestion',
  },
})
