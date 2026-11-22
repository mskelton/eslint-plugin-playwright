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
    const {
      allow = [],
      checkDefaults = false,
      minOccurrences = 1,
      parameterNames = 'timeout(Ms)?$|budgetMs$|^(ms|wait|poll)(Ms)?$',
      properties = ['timeout'],
    } = (context.options?.[0] ?? {}) as {
      allow?: number[]
      checkDefaults?: boolean
      minOccurrences?: number
      parameterNames?: string
      properties?: string[]
    }

    // Only compiled when used, so a bad pattern can't break linting for
    // configs that never enable `checkDefaults`.
    let budgetName: RegExp | undefined
    if (checkDefaults) {
      try {
        budgetName = new RegExp(parameterNames, 'i')
      } catch (error) {
        throw new Error(
          `no-magic-timeouts: invalid \`parameterNames\` pattern: ${(error as Error).message}`,
          { cause: error },
        )
      }
    }

    const allowed = new Set(allow)
    const timeoutProperties = new Set(properties)

    // Collected rather than reported immediately so that `minOccurrences` can
    // be applied once the whole file has been walked. Values are grouped by
    // what they evaluate to, so `15_000` and `15 * 1000` count as the same
    // timeout.
    const occurrences = new Map<number, ESTree.Node[]>()

    function collect(node: ESTree.Node & Partial<NodeWithParent>) {
      const value = evaluate(node)
      if (value === undefined || allowed.has(value) || isInsideConfig(node as NodeWithParent)) {
        return
      }

      const nodes = occurrences.get(value)
      if (nodes) {
        nodes.push(node)
      } else {
        occurrences.set(value, [node])
      }
    }

    return {
      // `(timeout = 15_000) => {}`, `({ budgetMs = 60_000 } = {}) => {}`, and
      // the renamed `({ timeout: t = 5000 }) => {}`
      'AssignmentPattern'(node) {
        if (!budgetName || node.left.type !== 'Identifier') {
          return
        }

        const parent = (node as NodeWithParent).parent
        const renamedKey =
          parent.type === 'Property' &&
          parent.value === node &&
          (!parent.computed || parent.key.type === 'Literal') &&
          timeoutProperties.has(getStringValue(parent.key))

        if (renamedKey || budgetName.test(node.left.name)) {
          collect(node.right)
        }
      },
      'CallExpression'(node) {
        // `test.setTimeout(30000)` and `testInfo.setTimeout(30000)`
        if (
          node.callee.type === 'MemberExpression' &&
          getStringValue(node.callee.property) === 'setTimeout' &&
          node.arguments.length === 1 &&
          node.arguments[0].type !== 'SpreadElement'
        ) {
          collect(node.arguments[0])
        }
      },
      'Program:exit'() {
        for (const nodes of occurrences.values()) {
          if (nodes.length < minOccurrences) {
            continue
          }

          for (const node of nodes) {
            context.report({
              data: {
                count: String(nodes.length),
                value: context.sourceCode.getText(node),
              },
              messageId: minOccurrences > 1 ? 'repeatedMagicTimeout' : 'noMagicTimeout',
              node,
            })
          }
        }
      },
      'Property'(node) {
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
        // `options = { timeout: 15_000 }` is a default that is forwarded as-is
        const isDefault =
          checkDefaults &&
          object.parent.type === 'AssignmentPattern' &&
          object.parent.right === object
        if (!isCallArgument(object) && !isDefault) {
          return
        }

        collect(node.value)
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
      repeatedMagicTimeout:
        'The magic timeout `{{ value }}` is used {{ count }} times in this file. Extract it to a named constant, or configure it globally in your Playwright config.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: { type: 'number' },
            type: 'array',
          },
          checkDefaults: {
            type: 'boolean',
          },
          minOccurrences: {
            minimum: 1,
            type: 'integer',
          },
          parameterNames: {
            minLength: 1,
            type: 'string',
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
