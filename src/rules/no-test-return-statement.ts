import type * as ESTree from 'estree'
import { isFunction } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

/** Returns the top level statements of the test body, if there is one. */
function getBody(node: ESTree.CallExpression) {
  const body = node.arguments.filter(isFunction).at(-1)

  return body?.body.type === 'BlockStatement' ? body.body.body : []
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (!isTypeOfFnCall(context, node, ['test'])) {
          return
        }

        const returnStmt = getBody(node).find((statement) => statement.type === 'ReturnStatement')

        if (returnStmt) {
          context.report({ messageId: 'noReturnValue', node: returnStmt })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow explicitly returning from tests',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-test-return-statement.md',
    },
    messages: {
      noReturnValue: 'Tests should not return a value',
    },
    schema: [],
    type: 'suggestion',
  },
})
