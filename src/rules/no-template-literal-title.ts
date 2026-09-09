import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

type Method = 'test' | 'test.describe' | 'test.step'

const methods: Record<'describe' | 'step' | 'test', Method> = {
  describe: 'test.describe',
  step: 'test.step',
  test: 'test',
}

/**
 * Quotes the cooked value of a template literal as a single quoted string,
 * matching the quote style used by string literal titles.
 */
function quote(value: string) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`
}

export default createRule({
  create(context) {
    const { ignore } = {
      ignore: [] as Method[],
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'test' && call?.type !== 'describe' && call?.type !== 'step') {
          return
        }

        const [title] = node.arguments
        if (title?.type !== 'TemplateLiteral') {
          return
        }

        const method = methods[call.type]
        if (ignore.includes(method)) {
          return
        }

        if (title.expressions.length > 0) {
          context.report({
            data: { method },
            messageId: 'interpolatedTitle',
            node: title,
          })

          return
        }

        // The cooked value is null when the template contains an invalid
        // escape sequence, and a multiline title can't be moved into a string
        // literal without changing the reported name.
        const cooked = title.quasis[0].value.cooked
        const fixable = typeof cooked === 'string' && !/[\n\r]/.test(cooked)

        context.report({
          data: { method },
          fix: fixable ? (fixer) => fixer.replaceText(title, quote(cooked)) : undefined,
          messageId: 'staticTemplateLiteral',
          node: title,
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow template literals in test, describe, and step titles',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-template-literal-title.md',
    },
    fixable: 'code',
    messages: {
      interpolatedTitle:
        'Do not interpolate values into `{{method}}` titles. Titles are used by reporters and `--grep`, so they should be stable.',
      staticTemplateLiteral:
        'Use a string literal instead of a template literal for `{{method}}` titles.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          ignore: {
            additionalItems: false,
            items: {
              enum: ['test', 'test.describe', 'test.step'],
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
