import type * as ESTree from 'estree'
import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { getAmountData } from '../utils/misc.js'
import { isSupportedAccessor, modifiers, parseFnCallWithReason } from '../utils/parseFnCall.js'
import type { NodeWithParent } from '../utils/types.js'

const findTopMostMemberExpression = (node: ESTree.MemberExpression): ESTree.MemberExpression => {
  let topMostMemberExpression = node
  let parent = (node as NodeWithParent).parent

  while (parent) {
    if (parent.type !== 'MemberExpression') {
      break
    }

    topMostMemberExpression = parent
    parent = (parent as NodeWithParent).parent
  }

  return topMostMemberExpression
}

export default createRule({
  create(context) {
    const options = {
      maxArgs: 2,
      minArgs: 1,
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    const minArgs = Math.min(options.minArgs, options.maxArgs)
    const maxArgs = Math.max(options.minArgs, options.maxArgs)

    return {
      CallExpression(node) {
        const call = parseFnCallWithReason(context, node)

        if (typeof call === 'string') {
          const reportingNode =
            node.parent?.type === 'MemberExpression'
              ? findTopMostMemberExpression(node.parent)!.property
              : node

          if (call === 'matcher-not-found') {
            context.report({
              messageId: 'matcherNotFound',
              node: reportingNode,
            })

            return
          }

          if (call === 'matcher-not-called') {
            context.report({
              messageId:
                isSupportedAccessor(reportingNode) && modifiers.has(getStringValue(reportingNode))
                  ? 'matcherNotFound'
                  : 'matcherNotCalled',
              node: reportingNode,
            })
          }

          if (call === 'modifier-unknown') {
            context.report({
              messageId: 'modifierUnknown',
              node: reportingNode,
            })

            return
          }

          return
        } else if (call?.type !== 'expect') {
          return
        }

        const { parent: expect } = call.head.node as NodeWithParent
        if (expect?.type !== 'CallExpression') return

        if (expect.arguments.length < minArgs) {
          const expectLength = getStringValue(call.head.node).length

          const loc: ESTree.SourceLocation = {
            end: {
              column: expect.loc!.start.column + expectLength + 1,
              line: expect.loc!.start.line,
            },
            start: {
              column: expect.loc!.start.column + expectLength,
              line: expect.loc!.start.line,
            },
          }

          context.report({
            data: getAmountData(minArgs),
            loc,
            messageId: 'notEnoughArgs',
            node: expect,
          })
        }

        if (expect.arguments.length > maxArgs) {
          const { start } = expect.arguments[maxArgs].loc!
          const { end } = expect.arguments.at(-1)!.loc!

          const loc = {
            end: {
              column: end.column,
              line: end.line,
            },
            start,
          }

          context.report({
            data: getAmountData(maxArgs),
            loc,
            messageId: 'tooManyArgs',
            node: expect,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Enforce valid `expect()` usage',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-expect.md',
    },
    messages: {
      matcherNotCalled: 'Matchers must be called to assert.',
      matcherNotFound: 'Expect must have a corresponding matcher call.',
      notEnoughArgs: 'Expect requires at least {{amount}} argument{{s}}.',
      tooManyArgs: 'Expect takes at most {{amount}} argument{{s}}.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          maxArgs: {
            minimum: 1,
            type: 'number',
          },
          minArgs: {
            minimum: 1,
            type: 'number',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
})
