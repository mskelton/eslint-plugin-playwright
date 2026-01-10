import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { findParent, getParent } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { sourceCode } = context

    function getStatementNode(
      node: ESTree.Node & Rule.NodeParentExtension,
    ): ESTree.Node | null {
      // Find the statement that contains this node
      // Check for ExpressionStatement and VariableDeclaration first (these are the actual statements)
      // before checking BlockStatement (which is a container)
      let current: (ESTree.Node & Rule.NodeParentExtension) | null = node

      while (current) {
        const parent = getParent(current)
        if (!parent) break

        // If we find an ExpressionStatement or VariableDeclaration, that's our statement
        if (
          parent.type === 'ExpressionStatement' ||
          parent.type === 'VariableDeclaration'
        ) {
          return parent
        }

        // If we hit a BlockStatement or Program, return the current node
        // (which should be the statement inside the block)
        if (parent.type === 'BlockStatement' || parent.type === 'Program') {
          return current
        }

        current = parent
      }

      return node
    }

    function isFirstStatementInBlock(
      node: ESTree.Node & Rule.NodeParentExtension,
    ): boolean {
      const parent = getParent(node)
      if (!parent) {
        return true
      }

      if (parent.type === 'BlockStatement' || parent.type === 'Program') {
        return parent.body[0] === node
      }

      return false
    }

    return {
      CallExpression(node) {
        if (
          !isTypeOfFnCall(context, node, ['test', 'hook', 'step', 'describe'])
        ) {
          return
        }

        const statementNode = getStatementNode(node)
        if (!statementNode || isFirstStatementInBlock(statementNode)) {
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
