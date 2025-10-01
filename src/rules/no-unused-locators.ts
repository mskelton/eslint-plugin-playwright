import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isPageMethod(node, 'getByRole')) { // todo can't just be getByRole
          if (node.parent?.type === 'VariableDeclarator') {
            return false
          }
          context.report({ messageId: 'noUnusedLocator', node })
        }
      },
    }
  },
  meta: {
    docs: {
      // todo correct category?
      category: 'Best Practices',
      description: `Disallow usage of page locators that are not used`,
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-unused-locators.md',
    },
    // todo not fixable
    fixable: 'code',
    messages: {
      noUnusedLocator: 'A locator is created but never used.',
    },
    type: 'problem',
  },
})
