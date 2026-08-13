import type * as ESTree from 'estree'
import { getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

// Action methods which accept a `timeout` option.
// https://playwright.dev/docs/api/class-locator
// https://playwright.dev/docs/api/class-page
const actionMethods = new Set([
  'blur',
  'check',
  'clear',
  'click',
  'dblclick',
  'dispatchEvent',
  'dragAndDrop',
  'dragTo',
  'fill',
  'focus',
  'hover',
  'press',
  'pressSequentially',
  'selectOption',
  'selectText',
  'setChecked',
  'setInputFiles',
  'tap',
  'type',
  'uncheck',
])

function findTimeoutOption(node: ESTree.CallExpression) {
  const arg = node.arguments.at(-1)

  return arg?.type === 'ObjectExpression'
    ? arg.properties.find(
        (property) => property.type === 'Property' && getStringValue(property.key) === 'timeout',
      )
    : undefined
}

export default createRule({
  create(context) {
    const allowed = new Set<string>(context.options[0]?.allow ?? [])

    return {
      MemberExpression(node) {
        const method = getStringValue(node.property)

        if (
          !actionMethods.has(method) ||
          allowed.has(method) ||
          node.parent.type !== 'CallExpression' ||
          node.parent.callee !== node
        ) {
          return
        }

        const timeout = findTimeoutOption(node.parent)

        if (timeout) {
          context.report({
            data: { method },
            messageId: 'noActionTimeout',
            node: timeout,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow the `timeout` option on actions',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-action-timeout.md',
    },
    messages: {
      noActionTimeout:
        'Unexpected `timeout` option on `{{ method }}()`. Configure timeouts globally instead.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allow: {
            items: { type: 'string' },
            type: 'array',
            uniqueItems: true,
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
