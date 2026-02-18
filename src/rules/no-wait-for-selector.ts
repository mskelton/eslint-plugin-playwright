import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isPageMethod(node, 'waitForSelector')) {
          context.report({
            messageId: 'noWaitForSelector',
            node,
            suggest: [
              {
                fix: (fixer) =>
                  fixer.remove(
                    node.parent && node.parent.type !== 'AwaitExpression'
                      ? node.parent
                      : node.parent.parent,
                  ),
                messageId: 'removeWaitForSelector',
              },
            ],
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Prevent usage of page.waitForSelector()',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-selector.md',
    },
    hasSuggestions: true,
    messages: {
      noWaitForSelector: 'Unexpected use of page.waitForSelector().',
      removeWaitForSelector: 'Remove the page.waitForSelector() method.',
    },
    type: 'suggestion',
  },
})
