import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import type { NodeWithParent } from '../utils/types.js'
import { isFunction, isPropertyAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall, parseFnCall } from '../utils/parseFnCall.js'

const getBlockType = (
  context: Rule.RuleContext,
  statement: ESTree.BlockStatement,
): 'function' | 'describe' | null => {
  const func = (statement as NodeWithParent).parent

  if (!func) {
    throw new Error(
      `Unexpected BlockStatement. No parent defined. - please file a github issue at https://github.com/mskelton/eslint-plugin-playwright`,
    )
  }

  // functionDeclaration: function func() {}
  if (func.type === 'FunctionDeclaration') {
    return 'function'
  }

  if (isFunction(func) && func.parent) {
    const expr = func.parent

    // arrow function or function expr
    if (expr.type === 'VariableDeclarator' || expr.type === 'MethodDefinition') {
      return 'function'
    }

    // if it's not a variable, it will be callExpr, we only care about describe
    if (expr.type === 'CallExpression' && isTypeOfFnCall(context, expr, ['describe'])) {
      return 'describe'
    }
  }

  return null
}

type BlockType = 'arrow' | 'describe' | 'fixture' | 'function' | 'hook' | 'template' | 'test'

export default createRule({
  create(context: Rule.RuleContext) {
    const callStack: BlockType[] = []

    return {
      'ArrowFunctionExpression'(node) {
        if (node.parent?.type !== 'CallExpression') {
          callStack.push('arrow')
        }
      },
      'ArrowFunctionExpression:exit'() {
        if (callStack.at(-1) === 'arrow') {
          callStack.pop()
        }
      },
      'BlockStatement'(statement) {
        const blockType = getBlockType(context, statement)

        if (blockType) {
          callStack.push(blockType)
        }
      },
      'BlockStatement:exit'(statement: ESTree.BlockStatement) {
        if (callStack.at(-1) === getBlockType(context, statement)) {
          callStack.pop()
        }
      },
      'CallExpression'(node) {
        const call = parseFnCall(context, node)

        if (call?.type === 'expect') {
          if (
            (call.head.node as NodeWithParent).parent?.type === 'MemberExpression' &&
            call.members.length === 1
          ) {
            return
          }

          const parent = callStack.at(-1)
          if (!parent || parent === 'describe') {
            context.report({ messageId: 'unexpectedExpect', node })
          }

          return
        }

        if (call?.type === 'test') {
          callStack.push('test')
        }

        if (call?.type === 'hook') {
          callStack.push('hook')
        }

        if (node.callee.type === 'MemberExpression' && isPropertyAccessor(node.callee, 'extend')) {
          callStack.push('fixture')
        }

        if (node.callee.type === 'TaggedTemplateExpression') {
          callStack.push('template')
        }
      },
      'CallExpression:exit'(node: ESTree.CallExpression) {
        const top = callStack.at(-1)

        if (
          (top === 'test' &&
            isTypeOfFnCall(context, node, ['test']) &&
            node.callee.type !== 'MemberExpression') ||
          (top === 'template' && node.callee.type === 'TaggedTemplateExpression') ||
          (top === 'fixture' &&
            node.callee.type === 'MemberExpression' &&
            isPropertyAccessor(node.callee, 'extend'))
        ) {
          callStack.pop()
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Disallow using `expect` outside of `test` blocks',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-standalone-expect.md',
    },
    fixable: 'code',
    messages: {
      unexpectedExpect: 'Expect must be inside of a test block',
    },
    type: 'suggestion',
  },
})
