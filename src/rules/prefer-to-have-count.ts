import type { Rule, Scope } from 'eslint'
import type * as ESTree from 'estree'
import { dereference, equalityMatchers, isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { replaceAccessorFixer } from '../utils/fixer.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const matchers = new Set([...equalityMatchers, 'toHaveLength'])

/** Find the variable an identifier resolves to, walking up the scope chain. */
function findVariable(scope: Scope.Scope, name: string) {
  let current: Scope.Scope | null = scope
  while (current) {
    const variable = current.set.get(name)
    if (variable) {
      return variable
    }
    current = current.upper
  }
}

/**
 * The fixer rewrites the variable declaration the expect argument was
 * dereferenced from. If that variable is read anywhere besides this expect
 * call, applying the fix would leave those usages operating on a Locator
 * instead of a number (#505), so no autofix may be offered. Other writes are
 * harmless — the fixer only touches the awaited count() assignment.
 */
function isUnsafeDereference(
  context: Rule.RuleContext,
  argNode: ESTree.Node | undefined,
  argument: ESTree.Node | undefined,
) {
  if (argNode?.type !== 'Identifier' || argument === argNode) {
    return false
  }

  const variable = findVariable(context.sourceCode.getScope(argNode), argNode.name)
  if (!variable) {
    return false
  }

  // Reads of the variable other than this expect argument would break if the
  // declaration were rewritten to hold a Locator instead of a number.
  return variable.references.some(
    (ref) => ref.isRead() && ref.identifier.range?.[0] !== argNode.range?.[0],
  )
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect' || !matchers.has(call.matcherName)) {
          return
        }

        // If the matcher is `toHaveLength`, we expect the inner call to be
        // `all()`, otherwise we expect `count()`.
        const accessor = call.matcherName === 'toHaveLength' ? 'all' : 'count'
        const argNode = call.args[0]
        const argument = dereference(context, argNode)

        if (
          argument?.type !== 'AwaitExpression' ||
          argument.argument.type !== 'CallExpression' ||
          argument.argument.callee.type !== 'MemberExpression' ||
          !isPropertyAccessor(argument.argument.callee, accessor)
        ) {
          return
        }

        const callee = argument.argument.callee
        // #505: when the argument was dereferenced from a variable that is
        // used elsewhere, the fixer would rewrite its declaration and break
        // those usages — report without an autofix in that case.
        const fix = isUnsafeDereference(context, argNode, argument)
          ? undefined
          : (fixer: Rule.RuleFixer) => [
              // remove the "await" expression
              fixer.removeRange([argument.range![0], argument.range![0] + 'await'.length + 1]),
              // remove the "count()" method accessor
              fixer.removeRange([callee.property.range![0] - 1, argument.argument.range![1]]),
              // replace the current matcher with "toHaveCount"
              replaceAccessorFixer(fixer, call.matcher, 'toHaveCount'),
              // insert "await" to before "expect()"
              fixer.insertTextBefore(node, 'await '),
            ]
        context.report({
          fix,
          messageId: 'useToHaveCount',
          node: call.matcher,
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Suggest using `toHaveCount()`',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-have-count.md',
    },
    fixable: 'code',
    messages: {
      useToHaveCount: 'Use toHaveCount() instead',
    },
    schema: [],
    type: 'suggestion',
  },
})
