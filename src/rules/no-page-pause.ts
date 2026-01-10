import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isPageMethod(node, 'pause')) {
          context.report({ messageId: 'noPagePause', node })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Prevent usage of page.pause()',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-page-pause.md',
    },
    messages: {
      noPagePause: 'Unexpected use of page.pause().',
    },
    type: 'problem',
  },
})
