import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const order = ['beforeAll', 'beforeEach', 'afterEach', 'afterAll']

export default createRule({
  create(context) {
    let previousHookIndex = -1
    let inHook = false

    return {
      'CallExpression'(node) {
        // Ignore everything that is passed into a hook
        if (inHook) return

        const call = parseFnCall(context, node)
        if (call?.type !== 'hook') {
          previousHookIndex = -1
          return
        }

        inHook = true
        const currentHook = call.name
        const currentHookIndex = order.indexOf(currentHook)

        if (currentHookIndex < previousHookIndex) {
          context.report({
            data: {
              currentHook,
              previousHook: order[previousHookIndex],
            },
            messageId: 'reorderHooks',
            node,
          })

          return
        }

        previousHookIndex = currentHookIndex
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['hook'])) {
          inHook = false
          return
        }

        if (inHook) return
        previousHookIndex = -1
      },
    }
  },
  meta: {
    docs: {
      description: 'Prefer having hooks in a consistent order',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-hooks-in-order.md',
    },
    messages: {
      reorderHooks: '`{{ currentHook }}` hooks should be before any `{{ previousHook }}` hooks',
    },
    type: 'suggestion',
  },
})
