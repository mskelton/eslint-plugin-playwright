import { equalityMatchers, isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { replaceAccessorFixer } from '../utils/fixer.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (
          call?.type !== 'expect' ||
          !equalityMatchers.has(call.matcherName)
        ) {
          return
        }

        const [argument] = call.args
        if (
          argument?.type !== 'MemberExpression' ||
          !isPropertyAccessor(argument, 'length')
        ) {
          return
        }

        context.report({
          fix(fixer) {
            return [
              // remove the "length" property accessor
              fixer.removeRange([
                argument.property.range![0] - 1,
                argument.range![1],
              ]),
              // replace the current matcher with "toHaveLength"
              replaceAccessorFixer(fixer, call.matcher, 'toHaveLength'),
            ]
          },
          messageId: 'useToHaveLength',
          node: call.matcher,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toHaveLength()`',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-have-length.md',
    },
    fixable: 'code',
    messages: {
      useToHaveLength: 'Use toHaveLength() instead',
    },
    schema: [],
    type: 'suggestion',
  },
})
