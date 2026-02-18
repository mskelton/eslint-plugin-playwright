import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isPageMethod(node, 'waitForNavigation')) {
          context.report({
            messageId: 'noWaitForNavigation',
            node,
            suggest: [
              {
                fix: (fixer) =>
                  fixer.remove(
                    node.parent &&
                      node.parent.type !== 'AwaitExpression' &&
                      node.parent.type !== 'VariableDeclarator'
                      ? node.parent
                      : node.parent.parent,
                  ),
                messageId: 'removeWaitForNavigation',
              },
            ],
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Prevent usage of page.waitForNavigation()',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-navigation.md',
    },
    hasSuggestions: true,
    messages: {
      noWaitForNavigation: 'Unexpected use of page.waitForNavigation().',
      removeWaitForNavigation: 'Remove the page.waitForNavigation() method.',
    },
    type: 'suggestion',
  },
})
