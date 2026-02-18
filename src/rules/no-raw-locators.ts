import { getStringValue, isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

/** Normalize data attribute locators */
function normalize(str: string) {
  const match = /\[([^=]+?)=['"]?([^'"]+?)['"]?\]/.exec(str)
  return match ? `[${match[1]}=${match[2]}]` : str
}

export default createRule({
  create(context) {
    const options = {
      allowed: [] as string[],
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    function isAllowed(arg: string) {
      return options.allowed.some((a) => normalize(a) === normalize(arg))
    }

    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression' || node.arguments[0]?.type === 'Identifier')
          return
        const method = getStringValue(node.callee.property)
        const arg = getStringValue(node.arguments[0])
        const isLocator = isPageMethod(node, 'locator') || method === 'locator'

        if (isLocator && !isAllowed(arg)) {
          context.report({ messageId: 'noRawLocator', node })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallows the usage of raw locators',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-raw-locators.md',
    },
    messages: {
      noRawLocator:
        'Usage of raw locator detected. Use methods like .getByRole() or .getByText() instead of raw locators.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowed: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
