import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'test' && call?.type !== 'describe') {
          return
        }

        const onlyNode = call.members.find((s) => getStringValue(s) === 'only')
        if (!onlyNode) {
          return
        }

        context.report({
          messageId: 'noFocusedTest',
          node: onlyNode,
          suggest: [
            {
              fix: (fixer) => {
                // - 1 to remove the `.only` annotation with dot notation
                return fixer.removeRange([
                  onlyNode.range![0] - 1,
                  onlyNode.range![1] + Number(onlyNode.type !== 'Identifier'),
                ])
              },
              messageId: 'suggestRemoveOnly',
            },
          ],
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Prevent usage of `.only()` focus test annotation',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-focused-test.md',
    },
    hasSuggestions: true,
    messages: {
      noFocusedTest: 'Unexpected focused test.',
      suggestRemoveOnly: 'Remove .only() annotation.',
    },
    type: 'problem',
  },
})
