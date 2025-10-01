import type { AST } from 'eslint'
import type { Comment, Expression, Node } from 'estree'
import { createRule } from '../utils/createRule.js'
import { isTestExpression, unwrapExpression } from '../utils/test-expression.js'

export default createRule({
  create(context) {
    function getPreviousToken(
      node: AST.Token | Node,
      start?: AST.Token | Comment | Node,
    ): {
      origin: AST.Token | Node
      previous: AST.Token | null
      start: AST.Token | Comment | Node
    } {
      const current = start ?? node
      const previous = context.sourceCode.getTokenBefore(current, {
        includeComments: true,
      })

      if (
        previous === null ||
        previous === undefined ||
        previous.value === '{'
      ) {
        return {
          origin: node,
          previous: null,
          start: current,
        }
      }

      if (
        previous.type === 'Line' ||
        previous.type === 'Block' ||
        previous.value === '('
      ) {
        return getPreviousToken(node, previous)
      }

      return {
        origin: node,
        previous: previous as AST.Token,
        start: current,
      }
    }

    function checkSpacing(node: Expression, offset?: AST.Token | Node) {
      const { previous, start } = getPreviousToken(node, offset)
      if (previous === null) return
      if (previous.loc.end.line < start.loc!.start.line - 1) {
        return
      }

      const source = context.sourceCode.getText(unwrapExpression(node))
      context.report({
        data: { source },
        fix(fixer) {
          return fixer.insertTextAfter(previous, '\n')
        },
        loc: {
          end: {
            column: start.loc!.start.column,
            line: start.loc!.start.line,
          },
          start: {
            column: 0,
            line: previous.loc.end.line + 1,
          },
        },
        messageId: 'missingWhitespace',
        node,
      })
    }

    return {
      ExpressionStatement(node) {
        if (isTestExpression(context, node.expression)) {
          checkSpacing(node.expression)
        }
      },
      VariableDeclaration(node) {
        node.declarations.forEach((declaration) => {
          if (declaration.init && isTestExpression(context, declaration.init)) {
            const offset = context.sourceCode.getTokenBefore(declaration)
            checkSpacing(declaration.init, offset ?? undefined)
          }
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
      missingWhitespace:
        "A blank line is required before the test block '{{source}}'.",
    },
    schema: [],
    type: 'layout',
  },
})
