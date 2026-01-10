import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const options = {
      allow: [] as string[],
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (!call) return

        if (call.type === 'hook' && !options.allow.includes(call.name)) {
          context.report({
            data: { hookName: call.name },
            messageId: 'unexpectedHook',
            node,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow setup and teardown hooks',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-hooks.md',
    },
    messages: {
      unexpectedHook: "Unexpected '{{ hookName }}' hook",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            contains: ['beforeAll', 'beforeEach', 'afterAll', 'afterEach'],
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
