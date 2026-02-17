import type { AST, Rule, SourceCode } from 'eslint'
import type * as ESTree from 'estree'
import type { NodeWithParent } from '../utils/types.js'
import { areTokensOnSameLine, getActualLastToken, getPaddingLineSequences } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'
import { createScopeInfo, type ScopeInfo } from '../utils/scope.js'

interface Context {
  ruleContext: Rule.RuleContext
  scopeInfo: ScopeInfo
  sourceCode: SourceCode
}

const STATEMENT_LIST_PARENTS = new Set([
  'Program',
  'BlockStatement',
  'SwitchCase',
  'SwitchStatement',
])

function isValidParent(parentType: string): boolean {
  return STATEMENT_LIST_PARENTS.has(parentType)
}

/**
 * This autofix inserts a blank line between the given 2 statements. If
 * the`prevNode` has trailing comments, it inserts a blank line after the
 * trailing comments.
 */
function fixPadding(prevNode: ESTree.Node, nextNode: ESTree.Node, ctx: Context): void {
  const { ruleContext, sourceCode } = ctx
  const paddingLines = getPaddingLineSequences(prevNode, nextNode, sourceCode)

  // We've got some padding lines. Great.
  if (paddingLines.length > 0) {
    return
  }

  // Missing padding line
  ruleContext.report({
    fix(fixer: Rule.RuleFixer) {
      let prevToken = getActualLastToken(sourceCode, prevNode)

      const nextToken = (sourceCode.getFirstTokenBetween(prevToken, nextNode, {
        /**
         * Skip the trailing comments of the previous node. This inserts a blank
         * line after the last trailing comment.
         *
         * For example:
         *
         *     foo() // trailing comment.
         *     // comment.
         *     bar()
         *
         * Get fixed to:
         *
         *     foo() // trailing comment.
         *
         *     // comment.
         *     bar()
         */
        filter(token): boolean {
          if (areTokensOnSameLine(prevToken, token)) {
            prevToken = token as AST.Token
            return false
          }

          return true
        },
        includeComments: true,
      }) || nextNode) as AST.Token

      const insertText = areTokensOnSameLine(prevToken, nextToken) ? '\n\n' : '\n'

      return fixer.insertTextAfter(prevToken, insertText)
    },
    messageId: 'missingWhitespace',
    node: nextNode,
  })
}

function isTestNode(node: ESTree.Node, ctx: Context): boolean {
  let curNode = node

  if (curNode.type === 'ExpressionStatement') {
    curNode = curNode.expression
  } else if (curNode.type === 'VariableDeclaration') {
    const decl = curNode.declarations.at(-1)!
    if (decl.init == null) {
      return false
    }

    curNode = decl.init
  }

  // Unfurl await expressions
  if (curNode.type === 'AwaitExpression') {
    curNode = curNode.argument
  }

  if (curNode.type !== 'CallExpression') {
    return false
  }

  return isTypeOfFnCall(ctx.ruleContext, curNode, ['describe', 'test', 'step', 'hook'])
}

function testPadding(prevNode: ESTree.Node, nextNode: ESTree.Node, ctx: Context) {
  while (nextNode.type === 'LabeledStatement') {
    nextNode = nextNode.body
  }

  if (isTestNode(prevNode, ctx) || isTestNode(nextNode, ctx)) {
    fixPadding(prevNode, nextNode, ctx)
    return
  }
}

function verifyNode(node: ESTree.Node, ctx: Context) {
  const { scopeInfo } = ctx

  if (!isValidParent((node as NodeWithParent).parent.type)) {
    return
  }

  if (scopeInfo.prevNode) {
    testPadding(scopeInfo.prevNode, node, ctx)
  }

  scopeInfo.prevNode = node
}

export default createRule({
  create(context) {
    const scopeInfo = createScopeInfo()
    const ctx: Context = {
      ruleContext: context,
      scopeInfo,
      sourceCode: context.sourceCode,
    }

    return {
      ':statement': (node: ESTree.Node) => verifyNode(node, ctx),
      'BlockStatement': scopeInfo.enter,
      'BlockStatement:exit': scopeInfo.exit,
      'Program': scopeInfo.enter,
      'Program:exit': scopeInfo.enter,
      'SwitchCase'(node) {
        verifyNode(node, ctx)
        scopeInfo.enter()
      },
      'SwitchCase:exit': scopeInfo.exit,
      'SwitchStatement': scopeInfo.enter,
      'SwitchStatement:exit': scopeInfo.exit,
    }
  },
  meta: {
    docs: {
      description:
        'Enforces a blank line between Playwright test blocks (e.g., test, test.step, test.beforeEach, etc.).',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/consistent-spacing-between-blocks.md',
    },
    fixable: 'whitespace',
    messages: {
      missingWhitespace: 'Expected blank line before this statement.',
    },
    schema: [],
    type: 'layout',
  },
})
