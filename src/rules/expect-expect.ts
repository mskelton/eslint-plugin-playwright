import ESTree from 'estree'
import { dig } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

export default createRule({
  create(context) {
    const options = {
      assertFunctionNames: [] as string[],
      assertFunctionPatterns: [] as string[],
      ...((context.options?.[0] as Record<string, unknown>) ?? {}),
    }

    const patterns = options.assertFunctionPatterns.map(
      (pattern) => new RegExp(pattern),
    )

    const unchecked: ESTree.CallExpression[] = []

    function checkExpressions(nodes: ESTree.Node[]) {
      for (const node of nodes) {
        const index =
          node.type === 'CallExpression' ? unchecked.indexOf(node) : -1

        if (index !== -1) {
          unchecked.splice(index, 1)
          break
        }
      }
    }

    function matches(node: ESTree.CallExpression) {
      if (options.assertFunctionNames.some((name) => dig(node.callee, name))) {
        return true
      }

      if (patterns.some((pattern) => dig(node.callee, pattern))) {
        return true
      }

      return false
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)

        if (call?.type === 'test') {
          unchecked.push(node)
        } else if (call?.type === 'expect' || matches(node)) {
          const ancestors = context.sourceCode.getAncestors(node)
          checkExpressions(ancestors)
        }
      },
      'Program:exit'() {
        unchecked.forEach((node) => {
          context.report({ messageId: 'noAssertions', node: node.callee })
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Enforce assertion to be made in a test body',
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/expect-expect.md',
    },
    messages: {
      noAssertions: 'Test has no assertions',
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          assertFunctionNames: {
            items: [{ type: 'string' }],
            type: 'array',
          },
          assertFunctionPatterns: {
            items: [{ type: 'string' }],
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
})
