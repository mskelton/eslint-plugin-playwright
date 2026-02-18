import { getStringValue, isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

type RestrictionOption = string | { message?: string; role: string }

interface NormalizedRestriction {
  message: string | null
  role: string
}

export default createRule({
  create(context) {
    const options = (context.options?.[0] ?? []) as RestrictionOption[]

    // Normalize configuration to handle both string and object formats
    const restrictions: NormalizedRestriction[] = options.map((option) => {
      if (typeof option === 'string') {
        return { message: null, role: option }
      }

      return {
        message: option.message ?? null,
        role: option.role,
      }
    })

    // Create a map for quick lookup
    const restrictionMap = new Map<string, string | null>()
    for (const restriction of restrictions) {
      restrictionMap.set(restriction.role, restriction.message)
    }

    return {
      CallExpression(node) {
        if (!isPageMethod(node, 'getByRole')) {
          return
        }

        const role = getStringValue(node.arguments[0])
        if (!role) {
          return
        }

        if (restrictionMap.has(role)) {
          const message = restrictionMap.get(role) ?? ''

          context.report({
            data: { message, role },
            messageId: message ? 'restrictedWithMessage' : 'restricted',
            node,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallows the usage of specific roles in getByRole()',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-restricted-roles.md',
    },
    messages: {
      restricted: 'Usage of role `{{role}}` in getByRole() is disallowed',
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
                role: { type: 'string' },
              },
              required: ['role'],
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
