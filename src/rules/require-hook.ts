import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { getNodeName, getStringValue, isFunction, isIdentifier } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const isNullOrUndefined = (node: ESTree.Expression): boolean => {
  return (node.type === 'Literal' && node.value === null) || isIdentifier(node, 'undefined')
}

const isAllowedFunctionCall = (
  node: ESTree.CallExpression,
  allowedFunctionCalls: readonly string[],
): boolean => {
  const name = getNodeName(node)
  if (name && allowedFunctionCalls.includes(name)) {
    return true
  }

  if (node.callee.type !== 'MemberExpression') {
    return false
  }

  const method = getStringValue(node.callee.property)
  return method !== '' && allowedFunctionCalls.includes(method)
}

const definesTests = (context: Rule.RuleContext, node: ESTree.Node): boolean => {
  switch (node.type) {
    case 'ExpressionStatement':
      return definesTests(context, node.expression)
    case 'BlockStatement':
      return node.body.some((statement) => definesTests(context, statement))
    case 'CallExpression':
      return isTypeOfFnCall(context, node, ['describe', 'test'])
    default:
      return false
  }
}

const callbackDefinesTests = (context: Rule.RuleContext, node: ESTree.CallExpression): boolean => {
  return node.arguments.some(
    (argument) => isFunction(argument) && definesTests(context, argument.body),
  )
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
        parseFnCall(context, node) ||
        isAllowedFunctionCall(node, allowedFunctionCalls) ||
        callbackDefinesTests(context, node)
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
