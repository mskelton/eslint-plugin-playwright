import type { Rule } from 'eslint'
import type * as ESTree from 'estree'

export type NodeWithParent = ESTree.Node & Rule.NodeParentExtension

export type TypedNodeWithParent<T extends ESTree.Node['type']> = Extract<ESTree.Node, { type: T }> &
  Rule.NodeParentExtension

export type KnownCallExpression = ESTree.CallExpression & {
  callee: ESTree.MemberExpression
}

export interface Settings {
  playwright?: {
    globalAliases?: {
      expect?: string[]
      test?: string[]
    }
    messages?: {
      [messageId: string]: string | undefined
    }
  }
}
