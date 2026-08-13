import type { Scope } from 'eslint'
import type * as ESTree from 'estree'
import { isIdentifier } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { isTypeOfFnCall } from '../utils/parseFnCall.js'

/**
 * Walks up the scope chain looking for a declared variable with the given name.
 * Globals are ignored since they have no definitions.
 */
function isDeclaredInScope(scope: Scope.Scope | null, name: string) {
  let currentScope = scope

  while (currentScope) {
    const variable = currentScope.set.get(name)
    if (variable && variable.defs.length > 0) {
      return true
    }

    currentScope = currentScope.upper
  }

  return false
}

export default createRule({
  create(context) {
    const exportNodes: ESTree.Node[] = []
    let hasTestCase = false

    return {
      'AssignmentExpression > MemberExpression'(node: ESTree.MemberExpression) {
        let { object, property } = node

        // Handle `module.exports.foo = ...` in addition to `module.exports = ...`
        if (object.type === 'MemberExpression') {
          ;({ object, property } = object)
        }

        if (
          !isIdentifier(object, 'module') ||
          isDeclaredInScope(context.sourceCode.getScope(object), 'module')
        ) {
          return
        }

        if (isIdentifier(property, /^exports?$/)) {
          exportNodes.push(node)
        }
      },
      'CallExpression'(node) {
        if (isTypeOfFnCall(context, node, ['describe', 'test'])) {
          hasTestCase = true
        }
      },
      'ExportAllDeclaration, ExportDefaultDeclaration, ExportNamedDeclaration, TSExportAssignment'(
        node: ESTree.Node,
      ) {
        exportNodes.push(node)
      },
      'Program:exit'() {
        if (!hasTestCase) {
          return
        }

        for (const node of exportNodes) {
          context.report({ messageId: 'unexpectedExport', node })
        }
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow using `export` in files containing tests',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-export.md',
    },
    messages: {
      unexpectedExport: 'Do not export from a test file',
    },
    schema: [],
    type: 'suggestion',
  },
})
