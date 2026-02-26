import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    // Stack tracking slow() calls. Index 0 is file-level, rest are test scopes.
    const scopes: boolean[] = [false]

    return {
      'CallExpression'(node) {
        const call = parseFnCall(context, node)
        if (!call) {
          return
        }

        if (call.type === 'test' || call.type === 'describe') {
          // Inherit parent scope's slow status
          scopes.push(scopes[scopes.length - 1])
        }

        if (call.group === 'test' && call.type === 'config') {
          const isSlowCall = call.members.some((s) => getStringValue(s) === 'slow')

          if (isSlowCall) {
            const current = scopes.length - 1
            if (scopes[current]) {
              context.report({ messageId: 'noDuplicateSlow', node })
            } else {
              scopes[current] = true
            }
          }
        }
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['test', 'describe'])) {
          scopes.pop()
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow multiple `test.slow()` calls in the same test',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-duplicate-slow.md',
    },
    messages: {
      noDuplicateSlow:
        'Multiple `test.slow()` calls will multiply the timeout. Use only one `test.slow()` per test.',
    },
    type: 'problem',
  },
})
