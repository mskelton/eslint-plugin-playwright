import type * as ESTree from 'estree'
import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const tagRegex = /@[\S]+/

type AllowedFormat = 'both' | 'options' | 'title'

interface RuleOptions {
  allowedFormat?: AllowedFormat
}

interface TagPresence {
  options: boolean
  title: boolean
}

function hasTagInOptions(node: ESTree.CallExpression): boolean {
  const options = node.arguments[1]
  if (!options || options.type !== 'ObjectExpression') {
    return false
  }

  return options.properties.some(
    (prop) => prop.type === 'Property' && prop.key.type === 'Identifier' && prop.key.name === 'tag',
  )
}

function hasTagInTitle(node: ESTree.CallExpression): boolean {
  const title = node.arguments[0]
  if (!title) {
    return false
  }

  const value = getStringValue(title)
  return !!value && tagRegex.test(value)
}

function getTagPresence(node: ESTree.CallExpression): TagPresence {
  return {
    options: hasTagInOptions(node),
    title: hasTagInTitle(node),
  }
}

export default createRule({
  create(context) {
    const { allowedFormat = 'both' } = (context.options[0] ?? {}) as RuleOptions
    const allowsOptions = allowedFormat !== 'title'
    const allowsTitle = allowedFormat !== 'options'
    const missingMessageId =
      allowedFormat === 'options'
        ? 'missingOptionsTag'
        : allowedFormat === 'title'
          ? 'missingTitleTag'
          : 'missingTag'

    // True when an ancestor describe has a tag in an accepted format.
    const describeStack: boolean[] = []

    const reportDisallowedFormat = (node: ESTree.CallExpression, tags: TagPresence) => {
      // A tag that is present but written in a format this config does not
      // accept. Describes are not required to have a tag, but a tag they do
      // have still has to use an accepted format, and it is not inherited.
      if (tags.options && !allowsOptions) {
        context.report({ messageId: 'disallowedOptionsTag', node })
      }

      if (tags.title && !allowsTitle) {
        context.report({ messageId: 'disallowedTitleTag', node })
      }
    }

    return {
      'CallExpression'(node) {
        const call = parseFnCall(context, node)
        if (!call || (call.type !== 'describe' && call.type !== 'test')) {
          return
        }

        const tags = getTagPresence(node)
        const hasAllowedTag = (allowsOptions && tags.options) || (allowsTitle && tags.title)
        const inherited = !!describeStack.at(-1)

        if (call.type === 'describe') {
          describeStack.push(hasAllowedTag || inherited)
          reportDisallowedFormat(node, tags)
          return
        }

        reportDisallowedFormat(node, tags)

        // A disallowed tag is already reported. Don't also report it as missing.
        if (hasAllowedTag || inherited || tags.options || tags.title) {
          return
        }

        context.report({ messageId: missingMessageId, node })
      },
      'CallExpression:exit'(node) {
        if (isTypeOfFnCall(context, node, ['describe'])) {
          describeStack.pop()
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Require test blocks to have tags',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-tags.md',
    },
    messages: {
      disallowedOptionsTag: 'Tags must be specified in the title, not the options object',
      disallowedTitleTag: 'Tags must be specified in the options object, not the title',
      missingOptionsTag: 'Test must have at least one tag in the options object',
      missingTag: 'Test must have at least one tag',
      missingTitleTag: 'Test must have at least one tag in the title',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowedFormat: {
            default: 'both',
            enum: ['both', 'options', 'title'],
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
