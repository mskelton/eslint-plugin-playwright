import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { getParent } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { sourceCode } = context

    /**
     * Finds the statement node that contains the given node. Returns
     * ExpressionStatement, VariableDeclaration, or null if not found.
     */
    function findContainingStatement(
      node: ESTree.Node & Rule.NodeParentExtension,
    ): ESTree.ExpressionStatement | ESTree.VariableDeclaration | null {
      let current: (ESTree.Node & Rule.NodeParentExtension) | null = node

      while (current) {
        const parent = getParent(current)
        if (!parent) break

        if (parent.type === 'ExpressionStatement') {
          return parent
        }

        if (parent.type === 'VariableDeclaration') {
          return parent
        }

        // Stop if we hit a block - we should have found a statement by now
        if (parent.type === 'BlockStatement' || parent.type === 'Program') {
          break
        }

        current = parent
      }

      return null
    }

    /** Checks if the statement is the first statement in its containing block. */
    function isFirstInBlock(
      statement: ESTree.ExpressionStatement | ESTree.VariableDeclaration,
    ): boolean {
      const parent = getParent(statement)
      if (!parent) return true

      if (parent.type === 'BlockStatement' || parent.type === 'Program') {
        return parent.body[0] === statement
      }

      return false
    }

    /** Checks if there's a blank line before the given node. */
    function hasBlankLineBefore(
      node:
        | ESTree.Comment
        | ESTree.ExpressionStatement
        | ESTree.VariableDeclaration,
    ): boolean {
      const lineNumber = node.loc!.start.line

      // Can't have a blank line before the first line
      if (lineNumber === 1) return true

      const previousLine = sourceCode.lines[lineNumber - 2]
      return previousLine.trim() === ''
    }

    return {
      CallExpression(node) {
        // Only check test, hook, step, and describe calls
        if (
          !isTypeOfFnCall(context, node, ['test', 'hook', 'step', 'describe'])
        ) {
          return
        }

        // Find the statement that contains this call
        const statement = findContainingStatement(node)
        if (!statement) return

        // Skip if it's the first statement in its block
        if (isFirstInBlock(statement)) return

        // Check for comments before the statement
        const comments = sourceCode.getCommentsBefore(statement)
        const nodeToCheck = comments.length > 0 ? comments[0] : statement

        // Skip if there's already a blank line
        if (hasBlankLineBefore(nodeToCheck)) return

        // Report the error
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
          node,
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
