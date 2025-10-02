import ESTree, { CallExpression } from 'estree'
import { getParent, isPageMethod } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'

const locatorMethods = [
  'getByRole',
  'getByText',
  'getByLabel',
  'getByPlaceholder',
  'getByAltText',
  'getByTitle',
  'getByTestId',
]

const validPromiseTypes = new Set([
  'AwaitExpression',
  'ReturnStatement',
  'ArrowFunctionExpression',
])

const validVariableDeclarationTypes = new Set([
  'VariableDeclaration',
  'VariableDeclarator',
])

const isEventuallyAssignedToVariable = (node: ESTree.Node): boolean => {
  const parent = getParent(node)

  if (!parent) return false

  if (validVariableDeclarationTypes.has(parent.type)) return true

  return isEventuallyAssignedToVariable(parent)
}

const isEventuallyPromise = (node: ESTree.Node): boolean => {
  const parent = getParent(node)

  if (!parent) return false

  if (validPromiseTypes.has(parent.type)) return true

  return isEventuallyPromise(parent)
}

const isEventuallyCallingLocatorMethod = (node: ESTree.Node): boolean => {
  const parent = getParent(node)

  if (!parent) return false

  if (parent.type === 'MemberExpression' && parent.property.type === 'Identifier') return true

  return isEventuallyCallingLocatorMethod(parent)
}

const isEventuallyArgumentOfExpect = (node: ESTree.Node): boolean => {
  const parent = getParent(node)

  if (!parent) return false

  if (parent.type === 'CallExpression' && parent.callee.type === 'Identifier' && parent.callee.name === 'expect') return true

  return isEventuallyArgumentOfExpect(parent)
}

const isOneOfPageLocatorMethods = (node: CallExpression) => locatorMethods.some((method) => isPageMethod(node, method))

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (isOneOfPageLocatorMethods(node)) {
          if (
            !isEventuallyAssignedToVariable(node) &&
            !(isEventuallyPromise(node) && isEventuallyCallingLocatorMethod(node)) &&
            !isEventuallyArgumentOfExpect(node)
          ) {
            context.report({ messageId: 'noUnusedLocator', node })
          }
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: `Disallow usage of page locators that are not used`,
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-unused-locators.md',
    },
    messages: {
      noUnusedLocator: 'A locator is created but never used.',
    },
    type: 'problem',
  },
})
