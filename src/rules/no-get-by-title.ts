import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isPageMethod(node, 'getByTitle')) {
          context.report({ messageId: 'noGetByTitle', node })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallows the usage of getByTitle()',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-get-by-title.md',
    },
    messages: {
      noGetByTitle:
        'The HTML title attribute is not an accessible name. Prefer getByRole() or getByLabelText() instead.',
    },
    type: 'suggestion',
  },
})
