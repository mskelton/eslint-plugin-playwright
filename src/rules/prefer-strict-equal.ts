import { createRule } from '../utils/createRule.js'
import { replaceAccessorFixer } from '../utils/fixer.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect') return

        if (call.matcherName === 'toEqual') {
          context.report({
            messageId: 'useToStrictEqual',
            node: call.matcher,
            suggest: [
              {
                fix: (fixer) => {
                  return replaceAccessorFixer(
                    fixer,
                    call.matcher,
                    'toStrictEqual',
                  )
                },
                messageId: 'suggestReplaceWithStrictEqual',
              },
            ],
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toStrictEqual()`',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-strict-equal.md',
    },
    fixable: 'code',
    hasSuggestions: true,
    messages: {
      suggestReplaceWithStrictEqual: 'Replace with `toStrictEqual()`',
      useToStrictEqual: 'Use toStrictEqual() instead',
    },
    schema: [],
    type: 'suggestion',
  },
})
