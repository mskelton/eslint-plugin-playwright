import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { getNodeName, getStringValue, isFunction, isIdentifier } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import {
  findTopMostCallExpression,
  isSupportedAccessor,
  isTypeOfFnCall,
  parseFnCall,
} from '../utils/parseFnCall.js'
import type { KnownCallExpression, NodeWithParent } from '../utils/types.js'

const isPromiseChainCall = (node: ESTree.Node): node is KnownCallExpression => {
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    isSupportedAccessor(node.callee.property)
  ) {
    // promise methods should have at least 1 argument
    if (node.arguments.length === 0) {
      return false
    }

    switch (getStringValue(node.callee.property)) {
      case 'then':
        return node.arguments.length < 3
      case 'catch':
      case 'finally':
        return node.arguments.length < 2
    }
  }

  return false
}

const isTestCaseCallWithCallbackArg = (
  context: Rule.RuleContext,
  node: ESTree.CallExpression,
): boolean => {
  const jestCallFn = parseFnCall(context, node)

  if (jestCallFn?.type !== 'test') {
    return false
  }

  const isJestEach = jestCallFn.members.some((s) => getStringValue(s) === 'each')

  if (isJestEach && node.callee.type !== 'TaggedTemplateExpression') {
    // isJestEach but not a TaggedTemplateExpression, so this must be
    // the `jest.each([])()` syntax which this rule doesn't support due
    // to its complexity (see jest-community/eslint-plugin-jest#710)
    // so we return true to trigger bailout
    return true
  }

  const [, callback] = node.arguments

  const callbackArgIndex = Number(isJestEach)

  return callback && isFunction(callback) && callback.params.length === 1 + callbackArgIndex
}

const isPromiseMethodThatUsesValue = (
  node: ESTree.AwaitExpression | ESTree.ReturnStatement,
  identifier: ESTree.Identifier | ESTree.Pattern,
): boolean => {
  const name = getStringValue(identifier)
  if (node.argument == null) return false

  if (node.argument.type === 'CallExpression' && node.argument.arguments.length > 0) {
    const nodeName = getNodeName(node.argument)

    if (['Promise.all', 'Promise.allSettled'].includes(nodeName as string)) {
      const [firstArg] = node.argument.arguments

      if (
        firstArg.type === 'ArrayExpression' &&
        firstArg.elements.some((nod) => nod && isIdentifier(nod, name))
      ) {
        return true
      }
    }

    if (
      ['Promise.resolve', 'Promise.reject'].includes(nodeName as string) &&
      node.argument.arguments.length === 1
    ) {
      return isIdentifier(node.argument.arguments[0], name)
    }
  }

  return isIdentifier(node.argument, name)
}

/**
 * Attempts to determine if the runtime value represented by the given
 * `identifier` is `await`ed within the given array of elements
 */
const isValueAwaitedInElements = (
  name: string,
  elements: ESTree.ArrayExpression['elements'] | ESTree.CallExpression['arguments'],
): boolean => {
  for (const element of elements) {
    if (element?.type === 'AwaitExpression' && isIdentifier(element.argument, name)) {
      return true
    }

    if (element?.type === 'ArrayExpression' && isValueAwaitedInElements(name, element.elements)) {
      return true
    }
  }

  return false
}

/**
 * Attempts to determine if the runtime value represented by the given
 * `identifier` is `await`ed as an argument along the given call expression
 */
const isValueAwaitedInArguments = (name: string, call: ESTree.CallExpression): boolean => {
  let node: ESTree.Node = call

  while (node) {
    if (node.type === 'CallExpression') {
      if (isValueAwaitedInElements(name, node.arguments)) {
        return true
      }

      node = node.callee
    }

    if (node.type !== 'MemberExpression') {
      break
    }

    node = node.object
  }

  return false
}

const getLeftMostCallExpression = (call: ESTree.CallExpression): ESTree.CallExpression => {
  let leftMostCallExpression: ESTree.CallExpression = call
  let node: ESTree.Node = call

  while (node) {
    if (node.type === 'CallExpression') {
      leftMostCallExpression = node
      node = node.callee
    }

    if (node.type !== 'MemberExpression') {
      break
    }

    node = node.object
  }

  return leftMostCallExpression
}

/**
 * Attempts to determine if the runtime value represented by the given
 * `identifier` is `await`ed or `return`ed within the given `body` of
 * statements
 */
const isValueAwaitedOrReturned = (
  context: Rule.RuleContext,
  identifier: ESTree.Identifier | ESTree.Pattern,
  body: ESTree.Statement[],
): boolean => {
  const name = getStringValue(identifier)

  for (const node of body) {
    // skip all nodes that are before this identifier, because they'd probably
    // be affecting a different runtime value (e.g. due to reassignment)
    if (node.range![0] <= identifier.range![0]) {
      continue
    }

    if (node.type === 'ReturnStatement') {
      return isPromiseMethodThatUsesValue(node, identifier)
    }

    if (node.type === 'ExpressionStatement') {
      // it's possible that we're awaiting the value as an argument
      if (node.expression.type === 'CallExpression') {
        if (isValueAwaitedInArguments(name, node.expression)) {
          return true
        }

        const leftMostCall = getLeftMostCallExpression(node.expression)
        const call = parseFnCall(context, node.expression)

        if (
          call?.type === 'expect' &&
          leftMostCall.arguments.length > 0 &&
          isIdentifier(leftMostCall.arguments[0], name)
        ) {
          if (
            call.members.some((m) => {
              const v = getStringValue(m)

              return v === 'resolves' || v === 'rejects'
            })
          ) {
            return true
          }
        }
      }

      if (
        node.expression.type === 'AwaitExpression' &&
        isPromiseMethodThatUsesValue(node.expression, identifier)
      ) {
        return true
      }

      // (re)assignment changes the runtime value, so if we've not found an
      // await or return already we act as if we've reached the end of the body
      if (node.expression.type === 'AssignmentExpression') {
        // unless we're assigning to the same identifier, in which case
        // we might be chaining off the existing promise value
        if (
          isIdentifier(node.expression.left, name) &&
          getNodeName(node.expression.right)?.startsWith(`${name}.`) &&
          isPromiseChainCall(node.expression.right)
        ) {
          continue
        }

        break
      }
    }

    if (
      node.type === 'BlockStatement' &&
      isValueAwaitedOrReturned(context, identifier, node.body)
    ) {
      return true
    }
  }

  return false
}

const findFirstBlockBodyUp = (node: ESTree.Node): ESTree.BlockStatement['body'] => {
  let parent: ESTree.Node = node

  while (parent) {
    if (parent.type === 'BlockStatement') {
      return parent.body
    }

    parent = (parent as NodeWithParent).parent
  }

  throw new Error(
    `Could not find BlockStatement - please file a github issue at https://github.com/mskelton/eslint-plugin-playwright`,
  )
}

const isDirectlyWithinTestCaseCall = (context: Rule.RuleContext, node: ESTree.Node): boolean => {
  let parent: ESTree.Node = node

  while (parent) {
    if (isFunction(parent)) {
      parent = parent.parent

      return parent?.type === 'CallExpression' && isTypeOfFnCall(context, parent, ['test'])
    }

    parent = (parent as NodeWithParent).parent
  }

  return false
}

const isVariableAwaitedOrReturned = (
  context: Rule.RuleContext,
  variable: ESTree.VariableDeclarator,
): boolean => {
  const body = findFirstBlockBodyUp(variable)

  // it's pretty much impossible for us to track destructuring assignments,
  // so we return true to bailout gracefully
  if (!isIdentifier(variable.id)) {
    return true
  }

  return isValueAwaitedOrReturned(context, variable.id, body)
}

export default createRule({
  create(context) {
    let inTestCaseWithDoneCallback = false
    // an array of booleans representing each promise chain we enter, with the
    // boolean value representing if we think a given chain contains an expect
    // in it's body.
    //
    // since we only care about the inner-most chain, we represent the state in
    // reverse with the inner-most being the first item, as that makes it
    // slightly less code to assign to by not needing to know the length
    const chains: boolean[] = []

    return {
      'CallExpression'(node: ESTree.CallExpression) {
        // there are too many ways that the done argument could be used with
        // promises that contain expect that would make the promise safe for us
        if (isTestCaseCallWithCallbackArg(context, node)) {
          inTestCaseWithDoneCallback = true

          return
        }

        // if this call expression is a promise chain, add it to the stack with
        // value of "false", as we assume there are no expect calls initially
        if (isPromiseChainCall(node)) {
          chains.unshift(false)

          return
        }

        // if we're within a promise chain, and this call expression looks like
        // an expect call, mark the deepest chain as having an expect call
        if (chains.length > 0 && isTypeOfFnCall(context, node, ['expect'])) {
          chains[0] = true
        }
      },
      'CallExpression:exit'(node: ESTree.CallExpression) {
        // there are too many ways that the "done" argument could be used to
        // make promises containing expects safe in a test for us to be able to
        // accurately check, so we just bail out completely if it's present
        if (inTestCaseWithDoneCallback) {
          if (isTypeOfFnCall(context, node, ['test'])) {
            inTestCaseWithDoneCallback = false
          }

          return
        }

        if (!isPromiseChainCall(node)) {
          return
        }

        // since we're exiting this call expression (which is a promise chain)
        // we remove it from the stack of chains, since we're unwinding
        const hasExpectCall = chains.shift()

        // if the promise chain we're exiting doesn't contain an expect,
        // then we don't need to check it for anything
        if (!hasExpectCall) {
          return
        }

        const { parent } = findTopMostCallExpression(node)

        // if we don't have a parent (which is technically impossible at runtime)
        // or our parent is not directly within the test case, we stop checking
        // because we're most likely in the body of a function being defined
        // within the test, which we can't track
        if (!parent || !isDirectlyWithinTestCaseCall(context, parent)) {
          return
        }

        switch (parent.type) {
          case 'VariableDeclarator': {
            if (isVariableAwaitedOrReturned(context, parent)) {
              return
            }

            break
          }

          case 'AssignmentExpression': {
            if (
              parent.left.type === 'Identifier' &&
              isValueAwaitedOrReturned(context, parent.left, findFirstBlockBodyUp(parent))
            ) {
              return
            }

            break
          }

          case 'ExpressionStatement':
            break

          case 'ReturnStatement':
          case 'AwaitExpression':
          default:
            return
        }

        context.report({
          messageId: 'expectInFloatingPromise',
          node: parent,
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Require promises that have expectations in their chain to be valid',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-expect-in-promise.md',
    },
    messages: {
      expectInFloatingPromise:
        'This promise should either be returned or awaited to ensure the expects in its chain are called',
    },
    schema: [],
    type: 'suggestion',
  },
})
