import type { Rule } from 'eslint'
import type { BlockStatement, CallExpression, Program } from 'estree'
import { getParent } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { sourceCode } = context

    function isBlockOrProgram(
      node: Rule.Node,
    ): node is
      | (BlockStatement & Rule.NodeParentExtension)
      | (Program & Rule.NodeParentExtension) {
      return node.type === 'BlockStatement' || node.type === 'Program'
    }

    function getStatementNode(node: Rule.Node): Rule.Node {
      const parent = getParent(node)
      if (!parent) return node
      if (isBlockOrProgram(parent)) return node
      return getStatementNode(parent)
    }

    function isFirstStatementInBlock(node: Rule.Node): boolean {
      const parent = getParent(node)
      if (!parent) return true
      if (isBlockOrProgram(parent)) return parent.body[0] === node
      return false
    }

    function checkSpacing(node: CallExpression & Rule.NodeParentExtension) {
      const statementNode = getStatementNode(node)

      if (isFirstStatementInBlock(statementNode)) return

      const comments = sourceCode.getCommentsBefore(statementNode)
      const nodeToCheck = comments.length > 0 ? comments[0] : statementNode
      const lineNumber = nodeToCheck.loc!.start.line

      if (lineNumber === 1) return

      const lines = sourceCode.lines
      const previousLine = lines[lineNumber - 2]

      if (previousLine.trim() === '') return

      context.report({
        data: {
          source: sourceCode.getText(statementNode).split('\n')[0],
        },
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
        const call = parseFnCall(context, node)
        if (
          call?.type === 'test' ||
          call?.type === 'hook' ||
          call?.type === 'step'
        ) {
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
      missingWhitespace:
        "A blank line is required before the test block '{{source}}'.",
    },
    schema: [],
    type: 'layout',
  },
})
