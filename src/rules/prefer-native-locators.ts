import type { AST } from 'eslint'
import { getStringValue, isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

type Pattern = {
  messageId: string
  pattern: RegExp
  replacement: string
}

const compilePatterns = ({ testIdAttribute }: { testIdAttribute: string }): Pattern[] => {
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
    pattern: buildPattern(attribute),
  }))
}

/**
 * Matches a selector that is exactly one attribute selector for the given
 * attribute and nothing else. The value is either quoted, in which case the
 * only escapes it may contain are for a quote or a backslash, or unquoted, in
 * which case it may not contain whitespace, quotes, brackets or backslashes.
 *
 * Anchoring both ends means a selector that carries a descendant, a sibling
 * combinator or a second attribute does not match, since no single native
 * locator is equivalent to it.
 */
function buildPattern(attribute: string) {
  const doubleQuoted = `"((?:[^"\\\\]|\\\\["'\\\\])*)"`
  const singleQuoted = `'((?:[^'\\\\]|\\\\["'\\\\])*)'`
  const unquoted = `([^'"\\[\\]\\\\\\s]+)`
  return new RegExp(
    `^\\[${escapeRegExp(attribute)}=(?:${doubleQuoted}|${singleQuoted}|${unquoted})\\]$`,
  )
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Resolves the escapes a quoted CSS attribute value is allowed to contain. */
function unescapeValue(value: string) {
  return value.replace(/\\(["'\\])/g, '$1')
}

/**
 * Renders a value as a JavaScript string literal. Double quotes are used by
 * default to match the rest of the emitted fixes, and single quotes are used
 * when that keeps the literal free of escapes.
 */
function toStringLiteral(value: string) {
  const doubleQuoted = JSON.stringify(value)
  if (!value.includes('"') || value.includes("'")) {
    return doubleQuoted
  }
  return `'${doubleQuoted.slice(1, -1).replaceAll('\\"', '"')}'`
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
        if (node.callee.type !== 'MemberExpression') {
          return
        }
        const query = getStringValue(node.arguments[0])
        if (!isPropertyAccessor(node.callee, 'locator')) {
          return
        }

        for (const pattern of patterns) {
          const match = query.match(pattern.pattern)
          if (match) {
            const value = unescapeValue(match[1] ?? match[2] ?? match[3])

            context.report({
              fix(fixer) {
                const start =
                  node.callee.type === 'MemberExpression'
                    ? node.callee.property.range![0]
                    : node.range![0]
                const end = node.range![1]
                const rangeToReplace: AST.Range = [start, end]

                const newText = `${pattern.replacement}(${toStringLiteral(value)})`
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
