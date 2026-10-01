import { getStringValue, isPropertyAccessor, isStringNode } from '../utils/ast.js'
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
        if (
          node.callee.type !== 'MemberExpression' ||
          !isPropertyAccessor(node.callee, 'locator')
        ) {
          return
        }

        const arg = node.arguments[0]

        // A template literal with interpolation is still a raw locator. Only
        // part of its value is known statically, so it can never be matched
        // against the `allowed` option and is always reported.
        if (arg?.type === 'TemplateLiteral' && arg.quasis.length > 1) {
          context.report({ messageId: 'noRawLocator', node })
          return
        }

        if ((node.arguments.length === 0 || isStringNode(arg)) && !isAllowed(getStringValue(arg))) {
          context.report({ messageId: 'noRawLocator', node })
          return
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
