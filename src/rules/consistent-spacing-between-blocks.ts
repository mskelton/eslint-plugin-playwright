import type { AST } from 'eslint'
import type { Comment, Expression, Node } from 'estree'
import { createRule } from '../utils/createRule.js'
import { isTestExpression, unwrapExpression } from '../utils/test-expression.js'

/**
 * An ESLint rule that ensures consistent spacing between test blocks (e.g.
 * `test`, `test.step`, `test.beforeEach`, etc.). This rule helps improve the
 * readability and maintainability of test code by ensuring that test blocks are
 * clearly separated from each other.
 */
export default createRule({
  create(context) {
    /**
     * Recursively determines the previous token (if present) and, if necessary,
     * a stand-in token to check spacing against. Therefore, the current start
     * token can optionally be passed through and used as the comparison token.
     *
     * Returns the previous token that is not a comment or a grouping expression
     * (`previous`), the first token to compare (`start`), and the actual token
     * being examined (`origin`).
     *
     * If there is no previous token for the expression, `null` is returned for
     * it. Ideally, the first comparable token is the same as the actual token.
     *
     *            | 1 | test('foo', async () => {
     * previous > | 2 |     await test.step(...);
     *            | 3 |
     *    start > | 4 |     // Erster Kommentar
     *            | 5 |     // weiterer Kommentar
     *   origin > | 6 |     await test.step(...);
     */
    function getPreviousToken(
      node: AST.Token | Node,
      start?: AST.Token | Comment | Node,
    ): {
      /** The token actually being checked */
      origin: AST.Token | Node

      /**
       * The previous token that is neither a comment nor a grouping expression,
       * if present
       */
      previous: AST.Token | null

      /**
       * The first token used for comparison, e.g. the start of the test
       * expression
       */
      start: AST.Token | Comment | Node
    } {
      const current = start ?? node
      const previous = context.sourceCode.getTokenBefore(current, {
        includeComments: true,
      })

      // no predecessor present
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

      // Recursively traverse comments and determine a stand-in
      // and unwrap parenthesized expressions
      if (
        previous.type === 'Line' || // line comment
        previous.type === 'Block' || // block comment
        previous.value === '(' // grouping operator
      ) {
        return getPreviousToken(node, previous)
      }

      // Return result
      return {
        origin: node,
        previous: previous as AST.Token,
        start: current,
      }
    }

    /**
     * Checks whether the spacing before the given test block meets
     * expectations. Optionally an offset token can be provided to check
     * against, for example in the case of an assignment.
     *
     * @param node - The node to be checked.
     * @param offset - Optional offset token to check spacing against.
     */
    function checkSpacing(node: Expression, offset?: AST.Token | Node) {
      const { previous, start } = getPreviousToken(node, offset)

      // First expression or no previous token
      if (previous === null) return

      // Ignore when there is one or more blank lines between
      if (previous.loc.end.line < start.loc!.start.line - 1) {
        return
      }

      // Since the hint in the IDE may not appear on the affected test expression
      // but possibly on the preceding comment, include the test expression in the message
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
      // Checks call expressions that could be test steps,
      // e.g. `test(...)`, `test.step(...)`, or `await test.step(...)`, but also `foo = test(...)`
      ExpressionStatement(node) {
        if (isTestExpression(context, node.expression)) {
          checkSpacing(node.expression)
        }
      },
      // Checks declarations that might be initialized from return values of test steps,
      // e.g. `let result = await test(...)` or `const result = await test.step(...)`
      VariableDeclaration(node) {
        node.declarations.forEach((declaration) => {
          if (declaration.init && isTestExpression(context, declaration.init)) {
            // When declaring a variable, our examined test expression is used for initialization.
            // Therefore, to check spacing we use the keyword token (let, const, var) before it:
            //  1 | const foo = test('foo', () => {});
            //  2 | ^
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
