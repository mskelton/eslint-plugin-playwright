import type { Rule } from 'eslint'
import type { CallExpression } from 'estree'
import { getParent } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const { sourceCode } = context

    function isPrecededByTokens(node: Rule.Node, testTokens: string[]) {
      const tokenBefore = sourceCode.getTokenBefore(node)
      return tokenBefore && testTokens.includes(tokenBefore.value)
    }

    function isFirstNode(node: Rule.Node) {
      const parent = getParent(node)
      if (!parent) return true

      const parentType = parent.type
      if (
        parentType === 'ExpressionStatement' ||
        parentType === 'VariableDeclaration'
      ) {
        const realParent = getParent(parent)
        if ('body' in realParent && realParent.body) {
          const { body } = realParent
          return Array.isArray(body) ? body[0] === node : body === parent
        }
        return false
      }

      if (parentType === 'IfStatement') {
        return isPrecededByTokens(node, ['else', ')'])
      }

      if (parentType === 'DoWhileStatement') {
        return isPrecededByTokens(node, ['do'])
      }

      if (parentType === 'SwitchCase') {
        return isPrecededByTokens(node, [':'])
      }

      if ('body' in parent && parent.body) {
        const { body } = parent
        return Array.isArray(body) ? body[0] === node : body === node
      }

      return isPrecededByTokens(node, [')'])
    }

    function calcCommentLines(node: Rule.Node, lineNumTokenBefore: number) {
      const comments = sourceCode.getCommentsBefore(node)
      let numLinesComments = 0

      if (!comments.length) {
        return numLinesComments
      }

      comments.forEach((comment) => {
        numLinesComments++

        if (comment.type === 'Block') {
          numLinesComments += comment.loc!.end.line - comment.loc!.start.line
        }

        // avoid counting lines with inline comments twice
        if (comment.loc!.start.line === lineNumTokenBefore) {
          numLinesComments--
        }

        if (comment.loc!.end.line === node.loc!.start.line) {
          numLinesComments--
        }
      })

      return numLinesComments
    }

    function hasNewlineBefore(node: Rule.Node) {
      const tokenBefore = sourceCode.getTokenBefore(node)
      const lineNumTokenBefore = !tokenBefore ? 0 : tokenBefore.loc.end.line
      const lineNumNode = node.loc!.start.line
      const commentLines = calcCommentLines(node, lineNumTokenBefore)

      return lineNumNode - lineNumTokenBefore - commentLines > 1
    }

    function getRealNodeToCheck(
      node: CallExpression & Rule.NodeParentExtension,
    ) {
      const parent = getParent(node)
      if (!parent) return node

      if (parent.type === 'ExpressionStatement') {
        return parent
      }
      if (parent.type === 'AwaitExpression') {
        const awaitParent = getParent(parent)
        return awaitParent.type === 'ExpressionStatement'
          ? awaitParent
          : getParent(awaitParent)
      }
      if (
        parent.type === 'VariableDeclarator' ||
        parent.type === 'AssignmentExpression'
      ) {
        return getParent(parent)
      }

      return node
    }

    function checkSpacing(node: CallExpression & Rule.NodeParentExtension) {
      const nodeToCheck = getRealNodeToCheck(node)

      if (isFirstNode(nodeToCheck)) return
      if (hasNewlineBefore(nodeToCheck)) return

      const leadingComments = sourceCode.getCommentsBefore(nodeToCheck)
      const firstComment = leadingComments[0]
      const reportLoc = firstComment?.loc ?? nodeToCheck.loc

      context.report({
        data: {
          source: sourceCode.getText(nodeToCheck).split('\n')[0],
        },
        fix(fixer) {
          const tokenBefore = sourceCode.getTokenBefore(nodeToCheck)
          if (!tokenBefore) return null

          const newlines =
            nodeToCheck.loc?.start.line === tokenBefore.loc.end.line
              ? '\n\n'
              : '\n'
          const targetNode = firstComment ?? nodeToCheck
          const nodeStart = targetNode.range?.[0] ?? 0
          const textBeforeNode = sourceCode.text.substring(0, nodeStart)
          const lastNewlineIndex = textBeforeNode.lastIndexOf('\n')
          const insertPosition = lastNewlineIndex + 1

          return fixer.insertTextBeforeRange(
            [insertPosition, nodeStart],
            newlines,
          )
        },
        loc: reportLoc!,
        messageId: 'missingWhitespace',
        node: nodeToCheck,
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
