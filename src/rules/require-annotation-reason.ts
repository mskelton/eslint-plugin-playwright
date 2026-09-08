import { getStringValue, isStringNode } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

/**
 * `.fail()` and `.slow()` don't remove coverage the way `.skip()` and
 * `.fixme()` do, so they are opt-in rather than checked by default.
 */
const DEFAULT_ANNOTATIONS = ['fixme', 'skip']

export default createRule({
  create(context) {
    const { annotations = DEFAULT_ANNOTATIONS, pattern } = (context.options?.[0] ?? {}) as {
      annotations?: string[]
      pattern?: string
    }

    const names = new Set(annotations)
    const regex = pattern ? new RegExp(pattern, 'u') : undefined

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)

        // Only the standalone form — `test.skip(condition, description)` — takes
        // a description. The declaration form (`test.skip('title', fn)`) has
        // nowhere to put one, so it is left to `no-skipped-test`.
        if (call?.type !== 'config') {
          return
        }

        const member = call.members.find((m) => names.has(getStringValue(m)))
        if (!member) {
          return
        }

        const annotation = getStringValue(member)
        const reasonNode = node.arguments[1]

        if (!reasonNode) {
          context.report({ data: { annotation }, messageId: 'missingReason', node })
          return
        }

        // A reason built at runtime is still a reason, but it can't be checked
        // against `pattern` statically.
        if (!isStringNode(reasonNode)) {
          return
        }

        const reason = getStringValue(reasonNode).trim()
        if (!reason) {
          context.report({ data: { annotation }, messageId: 'missingReason', node: reasonNode })
          return
        }

        if (regex && !regex.test(reason)) {
          context.report({
            data: { annotation, pattern: String(regex) },
            messageId: 'reasonMustMatch',
            node: reasonNode,
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Require a reason for `.skip()` and `.fixme()` annotations',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/require-annotation-reason.md',
    },
    messages: {
      missingReason:
        'The `.{{ annotation }}()` annotation should say why. Add a reason as the last argument.',
      reasonMustMatch: 'The `.{{ annotation }}()` reason should match {{ pattern }}.',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          annotations: {
            items: { enum: ['fail', 'fixme', 'skip', 'slow'], type: 'string' },
            type: 'array',
          },
          pattern: {
            type: 'string',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
