import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { getParent } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { sourceCode } = context

    function getStatementNode(
      node: ESTree.Node & Rule.NodeParentExtension,
    ): ESTree.Node {
      const parent = getParent(node)
      if (!parent) {
        return node
      }

      if (node.type === 'BlockStatement' || node.type === 'Program') {
        return node
      }

      return getStatementNode(parent)
    }

    function isFirstStatementInBlock(node: ESTree.Node): boolean {
      const parent = getParent(node)
      if (!parent) {
        return true
      }

      if (parent.type === 'BlockStatement' || parent.type === 'Program') {
        return parent.body[0] === node
      }

      return false
    }

    function checkSpacing(
      node: ESTree.CallExpression & Rule.NodeParentExtension,
    ) {
      const statementNode = getStatementNode(node)
      if (isFirstStatementInBlock(statementNode)) {
        return
      }

      const comments = sourceCode.getCommentsBefore(statementNode)
      const nodeToCheck = comments.length > 0 ? comments[0] : statementNode
      const lineNumber = nodeToCheck.loc!.start.line

      if (lineNumber === 1) {
        return
      }

      const lines = sourceCode.lines
      const previousLine = lines[lineNumber - 2]

      if (previousLine.trim() === '') {
        return
      }

      context.report({
        fix(fixer) {
          const nodeStart = nodeToCheck.range![0]
          const textBefore = sourceCode.text.substring(0, nodeStart)
          const lastNewlineIndex = textBefore.lastIndexOf('\n')
          const lineStart = lastNewlineIndex + 1

          return fixer.insertTextBeforeRange([lineStart, nodeStart], '\n')
        },
        loc: nodeToCheck.loc!,
        messageId: 'missingWhitespace',
        node: statementNode,
      })
    }

    return {
      CallExpression(node) {
        if (isTypeOfFnCall(context, node, ['test', 'hook', 'step'])) {
          checkSpacing(node)
        }
      },
    }
  },
  meta: {
    docs: {
      description:
        'Enforces a blank line between Playwright test blocks (e.g., test, test.step, test.beforeEach, etc.).',
      recommended: true,
    },
    fixable: 'whitespace',
    messages: {
      missingWhitespace: 'Expected blank line before this statement.',
    },
    schema: [],
    type: 'layout',
  },
})
