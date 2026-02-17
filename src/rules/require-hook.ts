import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { getStringValue, isFunction, isIdentifier } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const isNullOrUndefined = (node: ESTree.Expression): boolean => {
  return (node.type === 'Literal' && node.value === null) || isIdentifier(node, 'undefined')
}

const shouldBeInHook = (
  context: Rule.RuleContext,
  node: ESTree.Node,
  allowedFunctionCalls: readonly string[] = [],
): boolean => {
  switch (node.type) {
    case 'ExpressionStatement':
      return shouldBeInHook(context, node.expression, allowedFunctionCalls)
    case 'CallExpression':
      return !(
        parseFnCall(context, node) || allowedFunctionCalls.includes(getStringValue(node.callee))
      )
    case 'VariableDeclaration': {
      if (node.kind === 'const') {
        return false
      }

      return node.declarations.some(({ init }) => init != null && !isNullOrUndefined(init))
    }

    default:
      return false
  }
}

export default createRule({
  create(context) {
    const options = {
      allowedFunctionCalls: [] as string[],
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    const checkBlockBody = (body: ESTree.Program['body']) => {
      for (const statement of body) {
        if (shouldBeInHook(context, statement, options.allowedFunctionCalls)) {
          context.report({
            messageId: 'useHook',
            node: statement,
          })
        }
      }
    }

    return {
      CallExpression(node) {
        if (!isTypeOfFnCall(context, node, ['describe'])) {
          return
        }

        const testFn = node.arguments.at(-1)
        if (!isFunction(testFn) || testFn.body.type !== 'BlockStatement') {
          return
        }

        checkBlockBody(testFn.body.body)
      },
      Program(program) {
        checkBlockBody(program.body)
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Require setup and teardown code to be within a hook',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-hook.md',
    },
    messages: {
      useHook: 'This should be done within a hook',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedFunctionCalls: {
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
