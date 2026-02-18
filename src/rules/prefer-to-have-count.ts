import { dereference, equalityMatchers, isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { replaceAccessorFixer } from '../utils/fixer.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const matchers = new Set([...equalityMatchers, 'toHaveLength'])

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
        const argument = dereference(context, call.args[0])

        if (
          argument?.type !== 'AwaitExpression' ||
          argument.argument.type !== 'CallExpression' ||
          argument.argument.callee.type !== 'MemberExpression' ||
          !isPropertyAccessor(argument.argument.callee, accessor)
        ) {
          return
        }

        const callee = argument.argument.callee
        context.report({
          fix(fixer) {
            return [
              // remove the "await" expression
              fixer.removeRange([argument.range![0], argument.range![0] + 'await'.length + 1]),
              // remove the "count()" method accessor
              fixer.removeRange([callee.property.range![0] - 1, argument.argument.range![1]]),
              // replace the current matcher with "toHaveCount"
              replaceAccessorFixer(fixer, call.matcher, 'toHaveCount'),
              // insert "await" to before "expect()"
              fixer.insertTextBefore(node, 'await '),
            ]
          },
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
