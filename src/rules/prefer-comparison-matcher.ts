import * as ESTree from 'estree'
import {
  equalityMatchers,
  getParent,
  getRawValue,
  getStringValue,
  isBooleanLiteral,
  isStringLiteral,
} from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const isString = (node: ESTree.Node) => {
  return isStringLiteral(node) || node.type === 'TemplateLiteral'
}

const isComparingToString = (expression: ESTree.BinaryExpression) => {
  return isString(expression.left) || isString(expression.right)
}

const invertedOperators: Record<string, string | undefined> = {
  '<': '>=',
  '<=': '>',
  '>': '<=',
  '>=': '<',
}

const operatorMatcher: Record<string, string | undefined> = {
  '<': 'toBeLessThan',
  '<=': 'toBeLessThanOrEqual',
  '>': 'toBeGreaterThan',
  '>=': 'toBeGreaterThanOrEqual',
}

const determineMatcher = (
  operator: string,
  negated: boolean,
): string | null => {
  const op = negated ? invertedOperators[operator] : operator
  return operatorMatcher[op!] ?? null
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect' || call.matcherArgs.length === 0) return

        const expect = getParent(call.head.node)
        if (expect?.type !== 'CallExpression') return

        const [comparison] = expect.arguments
        const expectCallEnd = expect.range![1]
        const [matcherArg] = call.matcherArgs

        if (
          comparison?.type !== 'BinaryExpression' ||
          isComparingToString(comparison) ||
          !equalityMatchers.has(call.matcherName) ||
          !isBooleanLiteral(matcherArg)
        ) {
          return
        }

        const hasNot = call.modifiers.some(
          (node) => getStringValue(node) === 'not',
        )

        const preferredMatcher = determineMatcher(
          comparison.operator,
          getRawValue(matcherArg) === hasNot.toString(),
        )

        if (!preferredMatcher) {
          return
        }

        context.report({
          data: { preferredMatcher },
          fix(fixer) {
            // Preserve the existing modifier if it's not a negation
            const [modifier] = call.modifiers
            const modifierText =
              modifier && getStringValue(modifier) !== 'not'
                ? `.${getStringValue(modifier)}`
                : ''

            return [
              // Replace the comparison argument with the left-hand side of the comparison
              fixer.replaceText(
                comparison,
                context.sourceCode.getText(comparison.left),
              ),
              // Replace the current matcher & modifier with the preferred matcher
              fixer.replaceTextRange(
                [expectCallEnd, getParent(call.matcher)!.range![1]],
                `${modifierText}.${preferredMatcher}`,
              ),
              // Replace the matcher argument with the right-hand side of the comparison
              fixer.replaceText(
                matcherArg,
                context.sourceCode.getText(comparison.right),
              ),
            ]
          },
          messageId: 'useToBeComparison',
          node: call.matcher,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using the built-in comparison matchers',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-comparison-matcher.md',
    },
    fixable: 'code',
    messages: {
      useToBeComparison: 'Prefer using `{{ preferredMatcher }}` instead',
    },
    type: 'suggestion',
  },
})
