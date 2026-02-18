import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect' || call.matcherName !== 'toPass') {
          return
        }

        // Check if toPass has an argument with timeout property
        const [options] = call.matcherArgs

        if (!options || options.type !== 'ObjectExpression') {
          context.report({
            messageId: 'addTimeoutOption',
            node: call.matcher,
          })
          return
        }

        const hasTimeout = options.properties.some(
          (prop) =>
            prop.type === 'Property' &&
            prop.key.type === 'Identifier' &&
            prop.key.name === 'timeout',
        )

        if (!hasTimeout) {
          context.report({
            messageId: 'addTimeoutOption',
            node: call.matcher,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Require a timeout option for `toPass()`',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-to-pass-timeout.md',
    },
    messages: {
      addTimeoutOption: 'Add a timeout option to toPass()',
    },
    schema: [],
    type: 'suggestion',
  },
})
