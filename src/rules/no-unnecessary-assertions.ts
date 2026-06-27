import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { dereference, findParent, getStringValue } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const locatorMethods = new Set([
  'getByAltText',
  'getByLabel',
  'getByPlaceholder',
  'getByRole',
  'getByTestId',
  'getByText',
  'getByTitle',
  'locator',
])

// Methods that return a Locator: the creators above plus chainable locator-returning
// methods. A chain that ends in anything else (count, isVisible, textContent, ...)
// yields a value or Promise, not a Locator.
const locatorReturning = new Set([...locatorMethods, 'and', 'filter', 'first', 'last', 'nth', 'or'])

// Matchers that always hold for a Locator object, grouped by polarity. A
// Locator is a synchronous handle: always defined, truthy, and non-null.
const positiveAlwaysTrue: Record<string, string> = {
  toBeDefined: 'undefined',
  toBeTruthy: 'falsy',
}
const negatedAlwaysTrue: Record<string, string> = {
  toBeFalsy: 'falsy',
  toBeNull: 'null',
  toBeUndefined: 'undefined',
}

/**
 * True when the chain is anchored by a locator creator AND still a Locator at the
 * end. The outermost call must return a Locator, so `page.locator('.x').count()`
 * (a Promise) is not treated as one.
 */
function isLocatorChain(node: ESTree.Node | null | undefined): boolean {
  if (
    node?.type !== 'CallExpression' ||
    node.callee.type !== 'MemberExpression' ||
    !locatorReturning.has(getStringValue(node.callee.property))
  ) {
    return false
  }
  let current: ESTree.Node | undefined = node
  while (current) {
    if (current.type === 'CallExpression') {
      current = current.callee
    } else if (current.type === 'MemberExpression') {
      if (locatorMethods.has(getStringValue(current.property))) {
        return true
      }
      current = current.object
    } else {
      return false
    }
  }
  return false
}

/** True when an `await` may legally be inserted at `node` (async scope, and not inside a class field initializer or static block). */
function awaitIsAllowed(node: ESTree.Node): boolean {
  let current = (node as Rule.Node).parent as Rule.Node | null
  while (current) {
    switch (current.type) {
      case 'ArrowFunctionExpression':
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        return current.async === true
      case 'PropertyDefinition':
      case 'StaticBlock':
        return false
    }
    current = current.parent as Rule.Node | null
  }
  return false
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect') {
          return
        }

        const modifierNames = call.modifiers.map((mod) => getStringValue(mod))
        // `.resolves` / `.rejects` change the semantics entirely; never flag.
        if (modifierNames.some((name) => name === 'resolves' || name === 'rejects')) {
          return
        }

        const negated = modifierNames.includes('not')
        const value = negated
          ? negatedAlwaysTrue[call.matcherName]
          : positiveAlwaysTrue[call.matcherName]
        if (value === undefined) {
          return
        }

        // The expect() argument must resolve to an inline locator chain.
        // dereference resolves `const x = page.getBy...()`, so variable-stored locators are caught.
        // Unresolved identifiers (e.g. function params) come back undefined and are left alone.
        if (call.args.length === 0) {
          return
        }
        const subject = dereference(context, call.args[0])
        if (!isLocatorChain(subject)) {
          return
        }

        const expectCall = findParent(call.head.node, 'CallExpression')
        const matcherCall = findParent(call.matcher, 'CallExpression')
        if (!expectCall || !matcherCall) {
          return
        }

        context.report({
          data: {
            matcher: negated ? `not.${call.matcherName}` : call.matcherName,
            value,
          },
          fix(fixer) {
            // Auto-fix only when it is safe (otherwise report-only).
            // - await must be legal here (no sync callback / class field / static block)
            // - no comment between expect(...) and the matcher (the replacement would delete it)
            if (
              !awaitIsAllowed(matcherCall) ||
              context.sourceCode.commentsExistBetween(expectCall, call.matcher)
            ) {
              return null
            }
            const fixes = [
              fixer.replaceTextRange(
                [expectCall.range![1], matcherCall.range![1]],
                '.toBeVisible()',
              ),
            ]
            const alreadyAwaited = (matcherCall as Rule.Node).parent?.type === 'AwaitExpression'
            if (!alreadyAwaited) {
              fixes.unshift(fixer.insertTextBefore(expectCall, 'await '))
            }
            return fixes
          },
          messageId: 'noUnnecessaryAssertions',
          node: matcherCall,
        })
      },
    }
  },
  meta: {
    docs: {
      description: 'Disallow assertions on a Locator that can never fail',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-unnecessary-assertions.md',
    },
    fixable: 'code',
    messages: {
      noUnnecessaryAssertions:
        'This assertion can never fail: a Playwright Locator is never {{value}}, so `expect(locator).{{matcher}}()` always passes. Assert rendered state with a web-first matcher such as `toBeVisible()`.',
    },
    type: 'problem',
  },
})
