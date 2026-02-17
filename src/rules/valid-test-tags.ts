import type { Rule } from 'eslint'
import { TSESTree } from '@typescript-eslint/utils'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

interface RuleOptions {
  allowedTags?: (string | RegExp)[]
  disallowedTags?: (string | RegExp)[]
}

export default createRule({
  create(context) {
    const options = (context.options[0] as RuleOptions) || {}
    const allowedTags = options.allowedTags || []
    const disallowedTags = options.disallowedTags || []

    // Validate that the options are not used together
    if (allowedTags.length > 0 && disallowedTags.length > 0) {
      throw new Error('The allowedTags and disallowedTags options cannot be used together')
    }

    // Validate that all configured tags start with @
    for (const tag of [...allowedTags, ...disallowedTags]) {
      if (typeof tag === 'string' && !tag.startsWith('@')) {
        throw new Error(`Invalid tag "${tag}" in configuration: tags must start with @`)
      }
    }

    const extractTagsFromTitle = (title: string): string[] => {
      // Only extract tags that start with @ - these are the actual tags
      return title.match(/@[\S]+/g) || []
    }

    const validateTag = (tag: string, node: Rule.Node) => {
      if (!tag.startsWith('@')) {
        context.report({
          messageId: 'invalidTagFormat',
          node,
        })
        return
      }

      if (allowedTags.length > 0) {
        const isAllowed = allowedTags.some((pattern) =>
          pattern instanceof RegExp ? pattern.test(tag) : pattern === tag,
        )
        if (!isAllowed) {
          context.report({
            data: { tag },
            messageId: 'unknownTag',
            node,
          })
          return
        }
      }

      if (disallowedTags.length > 0) {
        const isDisallowed = disallowedTags.some((pattern) =>
          pattern instanceof RegExp ? pattern.test(tag) : pattern === tag,
        )
        if (isDisallowed) {
          context.report({
            data: { tag },
            messageId: 'disallowedTag',
            node,
          })
        }
      }
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (!call) return

        const { type } = call
        if (type !== 'test' && type !== 'describe' && type !== 'step') return

        // Check for tags in the title (first argument)
        if (node.arguments.length > 0) {
          const titleArg = node.arguments[0]
          if (titleArg && titleArg.type === 'Literal' && typeof titleArg.value === 'string') {
            const titleTags = extractTagsFromTitle(titleArg.value)
            for (const tag of titleTags) {
              validateTag(tag, node)
            }
          }
        }

        // Check if there's an options object as the second argument
        if (node.arguments.length < 2) return
        const optionsArg = node.arguments[1]
        if (!optionsArg || optionsArg.type !== 'ObjectExpression') return

        // Look for the tag property in the options object
        const tagProperty = optionsArg.properties.find(
          (prop) =>
            prop.type === 'Property' &&
            !('argument' in prop) && // Ensure it's not a spread element
            prop.key.type === 'Identifier' &&
            prop.key.name === 'tag',
        ) as TSESTree.Property | undefined

        if (!tagProperty) return

        const tagValue = tagProperty.value
        if (tagValue.type === 'Literal') {
          // Handle string literal
          if (typeof tagValue.value !== 'string') {
            context.report({
              messageId: 'invalidTagValue',
              node,
            })
            return
          }
          validateTag(tagValue.value, node)
        } else if (tagValue.type === 'ArrayExpression') {
          // Handle array of strings
          for (const element of tagValue.elements) {
            if (!element || element.type !== 'Literal' || typeof element.value !== 'string') {
              return // Skip invalid elements, TypeScript will handle this
            }
            validateTag(element.value, node)
          }
        } else {
          context.report({
            messageId: 'invalidTagValue',
            node,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Enforce valid tag format in Playwright test blocks and titles',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-test-tags.md',
    },
    messages: {
      disallowedTag: 'Tag "{{tag}}" is not allowed',
      invalidTagFormat: 'Tag must start with @',
      invalidTagValue: 'Tag must be a string or array of strings',
      unknownTag: 'Unknown tag "{{tag}}"',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedTags: {
            items: {
              oneOf: [
                { type: 'string' },
                {
                  additionalProperties: false,
                  properties: { source: { type: 'string' } },
                  type: 'object',
                },
              ],
            },
            type: 'array',
          },
          disallowedTags: {
            items: {
              oneOf: [
                { type: 'string' },
                {
                  additionalProperties: false,
                  properties: { source: { type: 'string' } },
                  type: 'object',
                },
              ],
            },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
})
