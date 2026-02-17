import type { Rule, Scope } from 'eslint'
import type * as ESTree from 'estree'
import type { KnownCallExpression, NodeWithParent } from '../utils/types.js'
import { isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const isCatchCall = (node: ESTree.CallExpression): node is KnownCallExpression =>
  node.callee.type === 'MemberExpression' && isPropertyAccessor(node.callee, 'catch')

const getTestCallExpressionsFromDeclaredVariables = (
  context: Rule.RuleContext,
  declaredVariables: readonly Scope.Variable[],
): ESTree.CallExpression[] => {
  return declaredVariables.reduce(
    (acc, { references }) => [
      ...acc,
      ...references
        .map(({ identifier }) => (identifier as NodeWithParent).parent)
        .filter(
          // ESLint types are infurating
          (node): node is any =>
            node?.type === 'CallExpression' && isTypeOfFnCall(context, node, ['test']),
        ),
    ],
    [] as ESTree.CallExpression[],
  )
}

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
      'FunctionDeclaration'(node) {
        const declaredVariables = context.sourceCode.getDeclaredVariables(node)
        const testCallExpressions = getTestCallExpressionsFromDeclaredVariables(
          context,
          declaredVariables,
        )

        if (testCallExpressions.length > 0) {
          inTestCase = true
        }
      },
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
      category: 'Best Practices',
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
