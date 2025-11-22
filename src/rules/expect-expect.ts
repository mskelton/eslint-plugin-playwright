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


    function matchesAssertFunction(node: ESTree.CallExpression): boolean {
      // Check exact string matches
      if (options.assertFunctionNames.some((name) => dig(node.callee, name))) {
        return true
      }


      // Check regex patterns
      if (options.assertFunctionPatterns.some((pattern) => {
        try {
          const regex = new RegExp(pattern)
          return dig(node.callee, regex)
        } catch {
          // Invalid regex pattern, skip it
          return false
        }
      })) {
        return true
      }


      return false
    }


    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)


        if (call?.type === 'test') {
          unchecked.push(node)
        } else if (
          call?.type === 'expect' ||
          matchesAssertFunction(node)
        ) {
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
