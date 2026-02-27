import type * as ESTree from 'estree'
import { isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'
import type { KnownCallExpression } from '../utils/types.js'

const isCatchCall = (node: ESTree.CallExpression): node is KnownCallExpression =>
  node.callee.type === 'MemberExpression' && isPropertyAccessor(node.callee, 'catch')

export default createRule({
  create(context) {
    let conditionalDepth = 0
    let inTestCase = false
    let inPromiseCatch = false

    const increaseConditionalDepth = () => inTestCase && conditionalDepth++
    const decreaseConditionalDepth = () => inTestCase && conditionalDepth--

    return {
      'CallExpression'(node: ESTree.CallExpression) {
        const call = parseFnCall(context, node)

        if (call?.type === 'test') {
          inTestCase = true
        }

        if (isCatchCall(node)) {
          inPromiseCatch = true
        }

        if (inTestCase && call?.type === 'expect' && conditionalDepth > 0) {
          context.report({
            messageId: 'conditionalExpect',
            node,
          })
        }

        if (inPromiseCatch && call?.type === 'expect') {
          context.report({
            messageId: 'conditionalExpect',
            node,
          })
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['test'])) {
          inTestCase = false
        }

        if (isCatchCall(node)) {
          inPromiseCatch = false
        }
      },
      'CatchClause': increaseConditionalDepth,
      'CatchClause:exit': decreaseConditionalDepth,
      'ConditionalExpression': increaseConditionalDepth,
      'ConditionalExpression:exit': decreaseConditionalDepth,
      'IfStatement': increaseConditionalDepth,
      'IfStatement:exit': decreaseConditionalDepth,
      'LogicalExpression': increaseConditionalDepth,
      'LogicalExpression:exit': decreaseConditionalDepth,
      'SwitchStatement': increaseConditionalDepth,
      'SwitchStatement:exit': decreaseConditionalDepth,
    }
  },
  meta: {
    docs: {
      description: 'Disallow calling `expect` conditionally',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-conditional-expect.md',
    },
    messages: {
      conditionalExpect: 'Avoid calling `expect` conditionally',
    },
    type: 'problem',
  },
})
