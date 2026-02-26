import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const restrictedChains = (context.options?.[0] ?? {}) as {
      [key: string]: string | null
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect') {
          return
        }

        Object.entries(restrictedChains)
          .map(([restriction, message]) => {
            const chain = call.members
            const restrictionLinks = restriction.split('.').length

            // Find in the full chain, where the restriction chain starts
            const startIndex = chain.findIndex((_, i) => {
              // Construct the partial chain to compare against the restriction
              // chain string.
              const partial = chain
                .slice(i, i + restrictionLinks)
                .map(getStringValue)
                .join('.')

              return partial === restriction
            })

            return {
              // If the restriction chain was found, return the portion of the
              // chain that matches the restriction chain.
              chain:
                startIndex !== -1 ? chain.slice(startIndex, startIndex + restrictionLinks) : [],
              message,
              restriction,
            }
          })
          .filter(({ chain }) => chain.length)
          .forEach(({ chain, message, restriction }) => {
            context.report({
              data: { message: message ?? '', restriction },
              loc: {
                end: chain.at(-1)!.loc!.end,
                start: chain[0].loc!.start,
              },
              messageId: message ? 'restrictedWithMessage' : 'restricted',
            })
          })
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow specific matchers & modifiers',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-restricted-matchers.md',
    },
    messages: {
      restricted: 'Use of `{{restriction}}` is disallowed',
      restrictedWithMessage: '{{message}}',
    },
    schema: [
      {
        additionalProperties: {
          type: ['string', 'null'],
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
