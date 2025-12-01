import { Rule } from 'eslint'
import ESTree, { AssignmentExpression } from 'estree'
import { isSupportedAccessor } from './parseFnCall.js'
import { NodeWithParent, TypedNodeWithParent } from './types.js'

export function getStringValue(node: ESTree.Node | undefined) {
  if (!node) return ''

  return node.type === 'Identifier'
    ? node.name
    : node.type === 'TemplateLiteral'
      ? node.quasis[0].value.raw
      : node.type === 'Literal' && typeof node.value === 'string'
        ? node.value
        : ''
}

export function getRawValue(node: ESTree.Node) {
  return node.type === 'Literal' ? node.raw : undefined
}

export function isIdentifier(
  node: ESTree.Node | undefined,
  name?: string | RegExp,
) {
  return (
    node?.type === 'Identifier' &&
    (!name ||
      (typeof name === 'string' ? node.name === name : name.test(node.name)))
  )
}

function isLiteral<T>(
  node: ESTree.Node,
  type: string,
  value?: T,
): node is ESTree.Literal {
  return (
    node.type === 'Literal' &&
    (value === undefined
      ? typeof node.value === type
      : (node.value as any) === value)
  )
}

const isTemplateLiteral = (
  node: ESTree.Node,
  value?: string,
): node is ESTree.TemplateLiteral =>
  node.type === 'TemplateLiteral' &&
  node.quasis.length === 1 && // bail out if not simple
  (value === undefined || node.quasis[0].value.raw === value)

export function isStringLiteral(
  node: ESTree.Node,
  value?: string,
): node is ESTree.Literal {
  return isLiteral(node, 'string', value)
}

export function isBooleanLiteral(
  node: ESTree.Node,
  value?: boolean,
): node is ESTree.Literal {
  return isLiteral(node, 'boolean', value)
}

export type StringNode = ESTree.Literal | ESTree.TemplateLiteral

export function isStringNode(
  node: ESTree.Node,
  value?: string,
): node is StringNode {
  return (
    node && (isStringLiteral(node, value) || isTemplateLiteral(node, value))
  )
}

export function isPropertyAccessor(
  node: ESTree.MemberExpression,
  name: string | RegExp,
) {
  const value = getStringValue(node.property)
  return typeof name === 'string' ? value === name : name.test(value)
}

export function getParent(
  node: ESTree.Node,
): ESTree.Node & Rule.NodeParentExtension {
  return (node as NodeWithParent).parent
}

export function findParent<T extends ESTree.Node['type']>(
  node: ESTree.Node,
  type: T,
): TypedNodeWithParent<T> | undefined {
  const parent = (node as NodeWithParent).parent
  if (!parent) return

  return parent.type === type
    ? (parent as unknown as TypedNodeWithParent<T>)
    : findParent(parent, type)
}

/**
 * Digs through a series of MemberExpressions and CallExpressions to find an
 * Identifier with the given name.
 */
export function dig(node: ESTree.Node, identifier: string | RegExp): boolean {
  return node.type === 'MemberExpression'
    ? dig(node.property, identifier)
    : node.type === 'CallExpression'
      ? dig(node.callee, identifier)
      : node.type === 'Identifier'
        ? isIdentifier(node, identifier)
        : false
}

export function isPageMethod(
  node: ESTree.CallExpression,
  name: string | RegExp,
) {
  return (
    node.callee.type === 'MemberExpression' &&
    dig(node.callee.object, /(^(page|frame)|(Page|Frame)$)/) &&
    isPropertyAccessor(node.callee, name)
  )
}

export type FunctionExpression = (
  | ESTree.ArrowFunctionExpression
  | ESTree.FunctionExpression
) &
  Rule.NodeParentExtension

/** Returns a boolean to indicate if the node is a function or arrow function */
export function isFunction(
  node: ESTree.Node | undefined,
): node is FunctionExpression {
  return (
    node?.type === 'ArrowFunctionExpression' ||
    node?.type === 'FunctionExpression'
  )
}

export const equalityMatchers = new Set(['toBe', 'toEqual', 'toStrictEqual'])

const joinNames = (a: string | null, b: string | null): string | null =>
  a && b ? `${a}.${b}` : null

export function getNodeName(node: ESTree.Node): string | null {
  if (isSupportedAccessor(node)) {
    return getStringValue(node)
  }

  switch (node.type) {
    case 'TaggedTemplateExpression':
      return getNodeName(node.tag)
    case 'MemberExpression':
      return joinNames(getNodeName(node.object), getNodeName(node.property))
    case 'NewExpression':
    case 'CallExpression':
      return getNodeName(node.callee)
  }

  return null
}

const isVariableDeclarator = (
  node: ESTree.Node,
): node is TypedNodeWithParent<'VariableDeclarator'> =>
  node.type === 'VariableDeclarator'

const isAssignmentExpression = (
  node: ESTree.Node,
): node is TypedNodeWithParent<'AssignmentExpression'> =>
  node.type === 'AssignmentExpression'

/**
 * Given a Node and an assignment expression, finds out if the assignment
 * expression happens before the node identifier (based on their range
 * properties) and if the assignment expression left side is of the same name as
 * the name of the given node.
 *
 * @param node The node we are comparing the assignment expression to.
 * @param assignment The assignment that will be verified to see if its left
 *   operand is the same as the node.name and if it happens before it.
 * @returns True if the assignment left hand operator belongs to the node and
 *   occurs before it, false otherwise. If either the node or the assignment
 *   expression doesn't contain a range array, this will also return false
 *   because their relative positions cannot be calculated.
 */
function isNodeLastAssignment(
  node: ESTree.Identifier,
  assignment: AssignmentExpression,
) {
  if (node.range && assignment.range && node.range[0] < assignment.range[1]) {
    return false
  }

  return (
    assignment.left.type === 'Identifier' && assignment.left.name === node.name
  )
}

/**
 * If the node argument is a variable reference, finds the variable initializer
 * or last variable assignment and returns the assigned value.
 *
 * If a variable is assigned after initialization we have to look for the last
 * time it was assigned because it could have been changed multiple times. We
 * then use its right hand assignment operator as the dereferenced node.
 *
 * @example <caption>Dereference a `const` initialized node:</caption>
 *   // returns 1
 *   const variable = 1
 *   console.log(variable) // dereferenced value of the 'variable' node is 1
 *
 * @example <caption>Dereference a `let` re-assigned node:</caption>
 *   // returns 1
 *   let variable = 0
 *   variable = 1
 *   console.log(variable) // dereferenced value of the 'variable' node is 1
 */
export function dereference(
  context: Rule.RuleContext,
  node: ESTree.Node | undefined,
) {
  if (node?.type !== 'Identifier') {
    return node
  }

  const scope = context.sourceCode.getScope(node)
  const parents = scope.references
    .map((ref) => ref.identifier as Rule.Node)
    .map((ident) => ident.parent)

  // Look for any variable declarators in the scope references that match the
  // dereferenced node variable name
  const decl = parents
    .filter(isVariableDeclarator)
    .find((p) => p.id.type === 'Identifier' && p.id.name === node.name)

  // Look for any variable assignments in the scope references and pick the last
  // one that matches the dereferenced node variable name
  const expr = parents
    .filter(isAssignmentExpression)
    .reverse()
    .find((assignment) => isNodeLastAssignment(node, assignment))

  return expr?.right ?? decl?.init
}
