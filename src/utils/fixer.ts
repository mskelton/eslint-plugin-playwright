import type { AST, Rule } from 'eslint'
import type * as ESTree from 'estree'
import type { NodeWithParent } from './types.js'

export const getRangeOffset = (node: ESTree.Node) => (node.type === 'Identifier' ? 0 : 1)

/**
 * Replaces an accessor node with the given `text`.
 *
 * This ensures that fixes produce valid code when replacing both dot-based and
 * bracket-based property accessors.
 */
export function replaceAccessorFixer(fixer: Rule.RuleFixer, node: ESTree.Node, text: string) {
  const [start, end] = node.range!

  return fixer.replaceTextRange([start + getRangeOffset(node), end - getRangeOffset(node)], text)
}

/**
 * Removes an object property, and if it's parent object contains no other keys,
 * removes the object in it's entirety.
 */
export function removePropertyFixer(fixer: Rule.RuleFixer, property: ESTree.Property) {
  const parent = (property as NodeWithParent).parent
  if (parent?.type !== 'ObjectExpression') {
    return
  }

  // If the property is the only one in the object, remove the entire object.
  if (parent.properties.length === 1) {
    return fixer.remove(parent)
  }

  // If the property is the first in the object, remove the trailing comma,
  // otherwise remove the property and the preceding comma.
  const index = parent.properties.indexOf(property)
  const range: AST.Range = index
    ? [parent.properties[index - 1].range![1], property.range![1]]
    : [property.range![0], parent.properties[1].range![0]]

  return fixer.removeRange(range)
}
