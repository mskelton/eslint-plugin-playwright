import type * as ESTree from 'estree'
import {
  equalityMatchers,
  getStringValue,
  isBooleanLiteral,
  isPropertyAccessor,
} from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'
import type { KnownCallExpression, NodeWithParent } from '../utils/types.js'

type FixableIncludesCallExpression = KnownCallExpression

const isFixableIncludesCallExpression = (
  node: ESTree.Node,
): node is FixableIncludesCallExpression =>
  node.type === 'CallExpression' &&
  node.callee.type === 'MemberExpression' &&
  isPropertyAccessor(node.callee, 'includes') &&
  node.arguments.length === 1 &&
  node.arguments[0].type !== 'SpreadElement'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect' || call.matcherArgs.length === 0) {
          return
        }

        const expect = (call.head.node as NodeWithParent).parent
        if (expect?.type !== 'CallExpression') {
          return
        }

        const [includesCall] = expect.arguments
        const { matcher } = call
        const [matcherArg] = call.matcherArgs

        if (
          !includesCall ||
          matcherArg.type === 'SpreadElement' ||
          !equalityMatchers.has(getStringValue(matcher)) ||
          !isBooleanLiteral(matcherArg) ||
          !isFixableIncludesCallExpression(includesCall)
        ) {
          return
        }

        const notModifier = call.modifiers.find((node) => getStringValue(node) === 'not')

        context.report({
          fix(fixer) {
            // We need to negate the expectation if the current expected
            // value is itself negated by the "not" modifier
            const addNotModifier =
              matcherArg.type === 'Literal' && matcherArg.value === !!notModifier

            const fixes = [
              // remove the "includes" call entirely
              fixer.removeRange([
                includesCall.callee.property.range![0] - 1,
                includesCall.range![1],
              ]),
              // replace the current matcher with "toContain", adding "not" if needed
              fixer.replaceText(matcher, addNotModifier ? 'not.toContain' : 'toContain'),
              // replace the matcher argument with the value from the "includes"
              fixer.replaceText(
                call.matcherArgs[0],
                context.sourceCode.getText(includesCall.arguments[0]),
              ),
            ]

            // Remove the "not" modifier if needed
            if (notModifier) {
              fixes.push(fixer.removeRange([notModifier.range![0], notModifier.range![1] + 1]))
            }

            return fixes
          },
          messageId: 'useToContain',
          node: matcher,
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Suggest using toContain()',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-contain.md',
    },
    fixable: 'code',
    messages: {
      useToContain: 'Use toContain() instead',
    },
    type: 'suggestion',
  },
})
