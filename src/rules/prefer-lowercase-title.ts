import { AST } from 'eslint'
import ESTree from 'estree'
import { getStringValue, isStringNode } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

type Method = 'test' | 'test.describe'

export default createRule({
  create(context) {
    const { allowedPrefixes, ignore, ignoreTopLevelDescribe } = {
      allowedPrefixes: [] as string[],
      ignore: [] as Method[],
      ignoreTopLevelDescribe: false,
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    let describeCount = 0

    return {
      'CallExpression'(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'describe' && call?.type !== 'test') {
          return
        }

        if (call.type === 'describe') {
          describeCount++

          if (ignoreTopLevelDescribe && describeCount === 1) {
            return
          }
        }

        const [title] = node.arguments
        if (!isStringNode(title)) {
          return
        }

        const description = getStringValue(title)
        if (!description || allowedPrefixes.some((name) => description.startsWith(name))) {
          return
        }

        const method = call.type === 'describe' ? 'test.describe' : 'test'
        const firstCharacter = description.charAt(0)
        if (
          !firstCharacter ||
          firstCharacter === firstCharacter.toLowerCase() ||
          ignore.includes(method)
        ) {
          return
        }

        context.report({
          data: { method },
          fix(fixer) {
            const rangeIgnoringQuotes: AST.Range = [title.range![0] + 1, title.range![1] - 1]

            const newDescription =
              description.substring(0, 1).toLowerCase() + description.substring(1)

            return fixer.replaceTextRange(rangeIgnoringQuotes, newDescription)
          },
          messageId: 'unexpectedLowercase',
          node: node.arguments[0],
        })
      },
      'CallExpression:exit'(node: ESTree.CallExpression) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          describeCount--
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce lowercase test names',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-lowercase-title.md',
    },
    fixable: 'code',
    messages: {
      unexpectedLowercase: '`{{method}}`s should begin with lowercase',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedPrefixes: {
            additionalItems: false,
            items: { type: 'string' },
            type: 'array',
          },
          ignore: {
            additionalItems: false,
            items: {
              enum: ['test.describe', 'test'],
            },
            type: 'array',
          },
          ignoreTopLevelDescribe: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
