import type * as ESTree from 'estree'
import { dig, type FunctionExpression, isFunction } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

/** Returns the last function argument, which is the test/step body. */
function getBody(node: ESTree.CallExpression) {
  return node.arguments.filter(isFunction).at(-1)
}

/**
 * Returns the last statement of a function body, unwrapping expression and
 * return statements as well as concise arrow function bodies.
 */
function getLastStatement(fn: FunctionExpression): ESTree.Node | undefined {
  if (fn.body.type !== 'BlockStatement') {
    return fn.body
  }

  const lastStatement = fn.body.body.at(-1)

  return lastStatement?.type === 'ExpressionStatement'
    ? lastStatement.expression
    : lastStatement?.type === 'ReturnStatement'
      ? (lastStatement.argument ?? undefined)
      : lastStatement
}

export default createRule({
  create(context) {
    const options = {
      assertFunctionNames: [] as string[],
      assertFunctionPatterns: [] as string[],
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    const patterns = options.assertFunctionPatterns.map((pattern) => new RegExp(pattern))

    function isAssertion(node: ESTree.Node | undefined): boolean {
      if (node?.type === 'AwaitExpression') {
        return isAssertion(node.argument)
      }

      if (node?.type !== 'CallExpression') {
        return false
      }

      const call = parseFnCall(context, node)
      if (call?.type === 'expect') {
        return true
      }

      // A test may end with a step, so long as that step ends with an assertion
      if (call?.type === 'step') {
        const body = getBody(node)
        return !!body && isAssertion(getLastStatement(body))
      }

      return (
        options.assertFunctionNames.some((name) => dig(node.callee, name)) ||
        patterns.some((pattern) => dig(node.callee, pattern))
      )
    }

    return {
      CallExpression(node) {
        if (parseFnCall(context, node)?.type !== 'test') {
          return
        }

        const body = getBody(node)
        if (!body) {
          return
        }

        if (!isAssertion(getLastStatement(body))) {
          context.report({ messageId: 'mustEndWithExpect', node: node.callee })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Prefer having the last statement in a test be an assertion',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-ending-with-an-expect.md',
    },
    messages: {
      mustEndWithExpect: 'Tests should end with an assertion',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          assertFunctionNames: {
            items: { type: 'string' },
            type: 'array',
          },
          assertFunctionPatterns: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
