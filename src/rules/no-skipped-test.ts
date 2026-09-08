import type { Rule, Scope } from 'eslint'
import type * as ESTree from 'estree'
import { findParent, getStringValue, isFunction } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'
import type { NodeWithParent } from '../utils/types.js'

/**
 * Resolves the variable an identifier refers to, walking up the scope chain
 * since the identifier may be declared in an outer scope.
 */
function resolveVariable(context: Rule.RuleContext, node: ESTree.Identifier) {
  let scope: Scope.Scope | null = context.sourceCode.getScope(node as Rule.Node)

  while (scope) {
    const variable = scope.variables.find((v) => v.name === node.name)
    if (variable) {
      return variable
    }

    scope = scope.upper
  }
}

/**
 * Checks if the node is the `testInfo` argument of a test or hook callback,
 * e.g. the `testInfo` in `test('name', async ({ page }, testInfo) => {})`.
 */
function isTestInfo(context: Rule.RuleContext, node: ESTree.Node) {
  if (node.type !== 'Identifier') {
    return false
  }

  const def = resolveVariable(context, node)?.defs[0]
  if (def?.type !== 'Parameter') {
    return false
  }

  // `testInfo` is always the second argument of the callback.
  const fn = def.node
  if (!isFunction(fn) || fn.params[1] !== def.name) {
    return false
  }

  // The callback has to be an argument of a test or hook call.
  const parent = (fn as NodeWithParent).parent
  if (parent?.type !== 'CallExpression' || !parent.arguments.includes(fn)) {
    return false
  }

  const call = parseFnCall(context, parent)
  return call?.group === 'test' || call?.group === 'hook' || call?.group === 'step'
}

export default createRule({
  create(context) {
    const options = context.options[0] || {}
    const disallowFixme = !!options.disallowFixme
    const allowConditional =
      typeof options.allowConditional === 'object'
        ? {
            fixme: !!options.allowConditional.fixme,
            skip: !!options.allowConditional.skip,
          }
        : {
            fixme: !!options.allowConditional,
            skip: !!options.allowConditional,
          }

    const isSkipAnnotation = (value: string) =>
      value === 'skip' || (disallowFixme && value === 'fixme')

    return {
      CallExpression(node) {
        // If the call is a standalone `test.skip()` call, and not a test
        // annotation, we have to treat it a bit differently.
        let isStandalone = false
        let skipNode: ESTree.Node | undefined

        const call = parseFnCall(context, node)
        if (call?.group === 'test' || call?.group === 'describe' || call?.group === 'step') {
          isStandalone = call.type === 'config'
          skipNode = call.members.find((member) => isSkipAnnotation(getStringValue(member)))
        } else if (
          node.callee.type === 'MemberExpression' &&
          isSkipAnnotation(getStringValue(node.callee.property)) &&
          isTestInfo(context, node.callee.object)
        ) {
          // `testInfo.skip()` behaves the same as a standalone `test.skip()`.
          isStandalone = true
          skipNode = node.callee.property
        }

        if (!skipNode) {
          return
        }

        const annotation = getStringValue(skipNode)

        // If allowConditional is enabled and it's not a test/describe function,
        // we ignore any `test.skip` calls that have no arguments.
        if (
          isStandalone &&
          allowConditional[annotation as 'fixme' | 'skip'] &&
          (node.arguments.length !== 0 ||
            findParent(node, 'BlockStatement')?.parent?.type === 'IfStatement' ||
            findParent(node, 'SwitchCase') !== undefined)
        ) {
          return
        }

        context.report({
          data: { annotation },
          messageId: 'noSkippedTest',
          node: isStandalone ? node : skipNode,
          suggest: [
            {
              data: { annotation },
              fix: (fixer) => {
                return isStandalone
                  ? fixer.remove((node as NodeWithParent).parent)
                  : fixer.removeRange([
                      skipNode.range![0] - 1,
                      skipNode.range![1] + Number(skipNode.type !== 'Identifier'),
                    ])
              },
              messageId: 'removeAnnotation',
            },
          ],
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Prevent usage of the `.skip()` skip test annotation.',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-skipped-test.md',
    },
    hasSuggestions: true,
    messages: {
      noSkippedTest: 'Unexpected use of the `.{{annotation}}()` annotation.',
      removeAnnotation: 'Remove the `.{{annotation}}()` annotation.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowConditional: {
            anyOf: [
              {
                type: 'boolean',
              },
              {
                additionalProperties: false,
                properties: {
                  fixme: {
                    type: 'boolean',
                  },
                  skip: {
                    type: 'boolean',
                  },
                },
                type: 'object',
              },
            ],
            default: false,
          },
          disallowFixme: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
