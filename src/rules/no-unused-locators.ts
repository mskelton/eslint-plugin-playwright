import { isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

const LOCATOR_REGEX = /locator|getBy(Role|Text|Label|Placeholder|AltText|Title|TestId)/

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (!isPageMethod(node, LOCATOR_REGEX)) {
          return
        }

        if (node.parent.type === 'ExpressionStatement' || node.parent.type === 'AwaitExpression') {
          context.report({ messageId: 'noUnusedLocator', node })
        }
      },
    }
  },
  meta: {
    docs: {
      description: `Disallow usage of page locators that are not used`,
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-unused-locators.md',
    },
    messages: {
      noUnusedLocator: 'Unused locator',
    },
    type: 'problem',
  },
})
