import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

type RestrictedMethodConfig = string | { message?: string; type: string }

interface NormalizedRestriction {
  message: string | null
  type: string
}

export default createRule({
  create(context) {
    const options = (context.options?.[0] ?? []) as RestrictedMethodConfig[]

    // Normalize configuration to handle both string and object formats
    const restrictions: NormalizedRestriction[] = options.map((option) => {
      if (typeof option === 'string') {
        return { message: null, type: option }
      }

      return {
        message: option.message ?? null,
        type: option.type,
      }
    })

    // Create a map for quick lookup
    const restrictionMap = new Map<string, string | null>()
    for (const restriction of restrictions) {
      restrictionMap.set(restriction.type, restriction.message)
    }

    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') {
          return
        }

        // Check if this method is restricted
        for (const [restrictedType, message] of restrictionMap.entries()) {
          if (getStringValue(node.callee.property) === restrictedType) {
            context.report({
              data: {
                message: message ?? '',
                method: restrictedType,
              },
              messageId: message ? 'restrictedWithMessage' : 'restricted',
              node,
            })
            break
          }
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallows the usage of specific locator methods',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-restricted-locators.md',
    },
    messages: {
      restricted: 'Usage of `{{method}}` is disallowed',
      restrictedWithMessage: '{{message}}',
    },
    schema: [
      {
        items: {
          oneOf: [
            { type: 'string' },
            {
              additionalProperties: false,
              properties: {
                message: { type: 'string' },
                type: { type: 'string' },
              },
              required: ['type'],
              type: 'object',
            },
          ],
        },
        type: 'array',
      },
    ],
    type: 'suggestion',
  },
})
