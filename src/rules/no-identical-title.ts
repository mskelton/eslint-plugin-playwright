import { getStringValue, isStringNode } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

interface DescribeContext {
  describeTitles: string[]
  testTitles: string[]
}

const newDescribeContext = (): DescribeContext => ({
  describeTitles: [],
  testTitles: [],
})

export default createRule({
  create(context) {
    const contexts: DescribeContext[] = [newDescribeContext()]

    return {
      'CallExpression'(node) {
        const currentLayer = contexts[contexts.length - 1]
        const call = parseFnCall(context, node)
        if (!call) {
          return
        }

        if (call.type === 'describe') {
          contexts.push(newDescribeContext())
        }

        if (call.type !== 'describe' && call.type !== 'test') {
          return
        }

        const [argument] = node.arguments
        if (!argument || !isStringNode(argument)) {
          return
        }

        const title = getStringValue(argument)
        const titles =
          call.type === 'describe' ? currentLayer.describeTitles : currentLayer.testTitles

        if (titles.includes(title)) {
          context.report({
            messageId: call.type === 'describe' ? 'multipleDescribeTitle' : 'multipleTestTitle',
            node: argument,
          })
        }

        titles.push(title)
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          contexts.pop()
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow identical titles',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-identical-title.md',
    },
    messages: {
      multipleDescribeTitle:
        'Describe block title is used multiple times in the same describe block',
      multipleTestTitle: 'Test title is used multiple times in the same describe block',
    },
    schema: [],
    type: 'suggestion',
  },
})
