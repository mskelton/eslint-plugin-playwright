import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import type { Settings } from '../utils/types.js'
import { createRule } from '../utils/createRule.js'

function getTestNames(context: Rule.RuleContext) {
  const settings = context.settings as unknown as Settings | undefined
  const aliases = settings?.playwright?.globalAliases?.test ?? []

  return ['test', ...aliases]
}

function hasTests(context: Rule.RuleContext, node: ESTree.Comment) {
  const testNames = getTestNames(context)
  const names = testNames.join('|')
  const regex = new RegExp(`^\\s*(${names}|describe)(\\.\\w+|\\[['"]\\w+['"]\\])?\\s*\\(`, 'mu')
  return regex.test(node.value)
}

export default createRule({
  create(context) {
    function checkNode(node: ESTree.Comment) {
      if (!hasTests(context, node)) return

      context.report({
        messageId: 'commentedTests',
        node: node as unknown as ESTree.Node,
      })
    }

    return {
      Program() {
        context.sourceCode.getAllComments().forEach(checkNode)
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow commented out tests',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-commented-out-tests.md',
    },
    messages: {
      commentedTests: 'Some tests seem to be commented',
    },
    type: 'problem',
  },
})
