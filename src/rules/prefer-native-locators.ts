import { AST } from 'eslint'
import { getStringValue, isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

type Pattern = {
  messageId: string
  pattern: RegExp
  replacement: string
}

const compilePatterns = ({
  testIdAttribute,
}: {
  testIdAttribute: string
}): Pattern[] => {
  const patterns = [
    {
      attribute: 'aria-label',
      messageId: 'unexpectedLabelQuery',
      replacement: 'getByLabel',
    },
    {
      attribute: 'role',
      messageId: 'unexpectedRoleQuery',
      replacement: 'getByRole',
    },
    {
      attribute: 'placeholder',
      messageId: 'unexpectedPlaceholderQuery',
      replacement: 'getByPlaceholder',
    },
    {
      attribute: 'alt',
      messageId: 'unexpectedAltTextQuery',
      replacement: 'getByAltText',
    },
    {
      attribute: 'title',
      messageId: 'unexpectedTitleQuery',
      replacement: 'getByTitle',
    },
    {
      attribute: testIdAttribute,
      messageId: 'unexpectedTestIdQuery',
      replacement: 'getByTestId',
    },
  ]
  return patterns.map(({ attribute, ...pattern }) => ({
    ...pattern,
    pattern: new RegExp(`^\\[${attribute}=['"]?(.+?)['"]?\\]$`),
  }))
}

export default createRule({
  create(context) {
    const { testIdAttribute } = {
      testIdAttribute: 'data-testid',
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    const patterns = compilePatterns({ testIdAttribute })

    return {
      CallExpression(node) {
        if (node.callee.type !== 'MemberExpression') return
        const query = getStringValue(node.arguments[0])
        if (!isPageMethod(node, 'locator')) return

        for (const pattern of patterns) {
          const match = query.match(pattern.pattern)
          if (match) {
            context.report({
              fix(fixer) {
                const start =
                  node.callee.type === 'MemberExpression'
                    ? node.callee.property.range![0]
                    : node.range![0]
                const end = node.range![1]
                const rangeToReplace: AST.Range = [start, end]

                const newText = `${pattern.replacement}("${match[1]}")`
                return fixer.replaceTextRange(rangeToReplace, newText)
              },
              messageId: pattern.messageId,
              node,
            })
            return
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Prefer native locator functions',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-native-locators.md',
    },
    fixable: 'code',
    messages: {
      unexpectedAltTextQuery: 'Use getByAltText() instead',
      unexpectedLabelQuery: 'Use getByLabel() instead',
      unexpectedPlaceholderQuery: 'Use getByPlaceholder() instead',
      unexpectedRoleQuery: 'Use getByRole() instead',
      unexpectedTestIdQuery: 'Use getByTestId() instead',
      unexpectedTitleQuery: 'Use getByTitle() instead',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          testIdAttribute: {
            default: 'data-testid',
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
