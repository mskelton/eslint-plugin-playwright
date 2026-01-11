import * as ESTree from 'estree'

export interface Scope {
  prevNode: ESTree.Node | null
  upper: Scope | null
}

export interface ScopeInfo {
  enter(): void
  exit(): void
  prevNode: ESTree.Node | null
}

export function createScopeInfo(): ScopeInfo {
  let scope: Scope | null = null

  return {
    enter() {
      scope = { prevNode: null, upper: scope }
    },
    exit() {
      scope = scope!.upper
    },
    get prevNode() {
      return scope!.prevNode
    },
    set prevNode(node: ESTree.Node | null) {
      scope!.prevNode = node
    },
  }
}
