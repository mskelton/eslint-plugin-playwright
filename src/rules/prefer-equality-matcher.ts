import { equalityMatchers, getRawValue, getStringValue, isBooleanLiteral } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'
import { NodeWithParent } from '../utils/types.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect' || call.matcherArgs.length === 0) return

        const expect = (call.head.node as NodeWithParent).parent
        if (expect?.type !== 'CallExpression') return

        const [comparison] = expect.arguments
        const expectCallEnd = expect.range![1]
        const [matcherArg] = call.matcherArgs

        if (
          comparison?.type !== 'BinaryExpression' ||
          (comparison.operator !== '===' && comparison.operator !== '!==') ||
          !equalityMatchers.has(call.matcherName) ||
          !isBooleanLiteral(matcherArg)
        ) {
          return
        }

        const matcherValue = getRawValue(matcherArg) === 'true'
        const [modifier] = call.modifiers
        const hasNot = call.modifiers.some((node) => getStringValue(node) === 'not')

        // we need to negate the expectation if the current expected
        // value is itself negated by the "not" modifier
        const addNotModifier =
          (comparison.operator === '!==' ? !matcherValue : matcherValue) === hasNot

        context.report({
          messageId: 'useEqualityMatcher',
          node: call.matcher,
          suggest: [...equalityMatchers.keys()].map((equalityMatcher) => ({
            data: { matcher: equalityMatcher },
            fix(fixer) {
              // preserve the existing modifier if it's not a negation
              let modifierText =
                modifier && getStringValue(modifier) !== 'not' ? `.${getStringValue(modifier)}` : ''

              if (addNotModifier) {
                modifierText += `.not`
              }

              return [
                // replace the comparison argument with the left-hand side of the comparison
                fixer.replaceText(comparison, context.sourceCode.getText(comparison.left)),
                // replace the current matcher & modifier with the preferred matcher
                fixer.replaceTextRange(
                  [expectCallEnd, (call.matcher as NodeWithParent).parent!.range![1]],
                  `${modifierText}.${equalityMatcher}`,
                ),
                // replace the matcher argument with the right-hand side of the comparison
                fixer.replaceText(matcherArg, context.sourceCode.getText(comparison.right)),
              ]
            },
            messageId: 'suggestEqualityMatcher',
          })),
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using the built-in equality matchers',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-equality-matcher.md',
    },
    hasSuggestions: true,
    messages: {
      suggestEqualityMatcher: 'Use `{{ matcher }}`',
      useEqualityMatcher: 'Prefer using one of the equality matchers instead',
    },
    type: 'suggestion',
  },
})
