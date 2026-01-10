import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isPageMethod(node, 'waitForTimeout')) {
          context.report({
            messageId: 'noWaitForTimeout',
            node,
            suggest: [
              {
                fix: (fixer) =>
                  fixer.remove(
                    node.parent && node.parent.type !== 'AwaitExpression'
                      ? node.parent
                      : node.parent.parent,
                  ),
                messageId: 'removeWaitForTimeout',
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
      description: 'Prevent usage of page.waitForTimeout()',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-timeout.md',
    },
    hasSuggestions: true,
    messages: {
      noWaitForTimeout: 'Unexpected use of page.waitForTimeout().',
      removeWaitForTimeout: 'Remove the page.waitForTimeout() method.',
    },
    type: 'suggestion',
  },
})
