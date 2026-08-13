import type * as ESTree from 'estree'
import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import type { NodeWithParent } from '../utils/types.js'

/**
 * Statically evaluates an expression built exclusively out of number literals
 * and arithmetic operators, e.g. `30 * 1000` or `2 * 60 * 1000`.
 *
 * Returns `undefined` for anything that references a binding, since a named
 * reference is exactly what this rule is asking for.
 */
function evaluate(node: ESTree.Node): number | undefined {
  if (node.type === 'Literal') {
    return typeof node.value === 'number' ? node.value : undefined
  }

  if (node.type === 'UnaryExpression' && (node.operator === '-' || node.operator === '+')) {
    const value = evaluate(node.argument)
    return value === undefined ? undefined : node.operator === '-' ? -value : value
  }

  if (node.type === 'BinaryExpression') {
    const left = node.left.type === 'PrivateIdentifier' ? undefined : evaluate(node.left)
    const right = evaluate(node.right)
    if (left === undefined || right === undefined) {
      return undefined
    }

    switch (node.operator) {
      case '*':
        return left * right
      case '/':
        return left / right
      case '+':
        return left + right
      case '-':
        return left - right
      default:
        return undefined
    }
  }

  return undefined
}

/**
 * Timeouts declared inside `defineConfig()` are the canonical place to put
 * them, so they are never magic.
 */
function isInsideConfig(node: NodeWithParent): boolean {
  let current: NodeWithParent | undefined = node

  while (current) {
    if (
      current.type === 'CallExpression' &&
      getStringValue(
        current.callee.type === 'MemberExpression' ? current.callee.property : current.callee,
      ) === 'defineConfig'
    ) {
      return true
    }

    current = (current as NodeWithParent).parent as NodeWithParent | undefined
  }

  return false
}

/**
 * Only flags option objects that are passed directly to a call, so a named
 * object such as `const options = { timeout: 5000 }` is left alone — the
 * binding already gives the value a name.
 */
function isCallArgument(object: NodeWithParent): boolean {
  const parent = object.parent as NodeWithParent | undefined

  return (
    (parent?.type === 'CallExpression' || parent?.type === 'NewExpression') &&
    parent.arguments.includes(object as ESTree.Expression)
  )
}

export default createRule({
  create(context) {
    const { allow = [], properties = ['timeout'] } = (context.options?.[0] ?? {}) as {
      allow?: number[]
      properties?: string[]
    }

    const allowed = new Set(allow)
    const timeoutProperties = new Set(properties)

    function report(node: ESTree.Node & Partial<NodeWithParent>) {
      const value = evaluate(node)
      if (value === undefined || allowed.has(value)) {
        return
      }

      context.report({
        data: { value: context.sourceCode.getText(node) },
        messageId: 'noMagicTimeout',
        node,
      })
    }

    return {
      CallExpression(node) {
        // `test.setTimeout(30000)` and `testInfo.setTimeout(30000)`
        if (
          node.callee.type === 'MemberExpression' &&
          getStringValue(node.callee.property) === 'setTimeout' &&
          node.arguments.length === 1 &&
          node.arguments[0].type !== 'SpreadElement'
        ) {
          report(node.arguments[0])
        }
      },
      Property(node) {
        if (node.computed && node.key.type !== 'Literal') {
          return
        }
        if (!timeoutProperties.has(getStringValue(node.key))) {
          return
        }
        if (node.value.type === 'AssignmentPattern' || node.value.type === 'RestElement') {
          return
        }

        const object = (node as NodeWithParent).parent as NodeWithParent | undefined
        if (object?.type !== 'ObjectExpression') {
          return
        }
        if (!isCallArgument(object)) {
          return
        }
        if (isInsideConfig(object)) {
          return
        }

        report(node.value)
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow magic numbers as Playwright timeout values',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-magic-timeouts.md',
    },
    messages: {
      noMagicTimeout:
        'Avoid the magic timeout `{{ value }}`. Extract it to a named constant, or configure it globally in your Playwright config.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: { type: 'number' },
            type: 'array',
          },
          properties: {
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
