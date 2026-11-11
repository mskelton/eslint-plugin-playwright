import type { Rule, Scope } from 'eslint'
import type * as ESTree from 'estree'
import { getStringValue, isIdentifier, isPageMethod, isPromiseAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { type ParsedFnCall, parseFnCall } from '../utils/parseFnCall.js'
import type { NodeWithParent } from '../utils/types.js'

const validTypes = new Set(['AwaitExpression', 'ReturnStatement', 'ArrowFunctionExpression'])

const builtinCollections = /^(Array|Map|Set|WeakMap|WeakSet)$/

/**
 * Checks if an expression creates a built-in collection (`[]`, `new Map()`,
 * `Array.from()`, ...). Their `fill` and `clear` methods are not Playwright
 * methods, so they never need to be awaited.
 */
function isCollectionExpression(node: ESTree.Node | null | undefined) {
  if (!node) {
    return false
  }

  return (
    node.type === 'ArrayExpression' ||
    ((node.type === 'NewExpression' || node.type === 'CallExpression') &&
      isIdentifier(node.callee, builtinCollections)) ||
    (node.type === 'CallExpression' &&
      node.callee.type === 'MemberExpression' &&
      isIdentifier(node.callee.object, 'Array'))
  )
}

/**
 * Checks if a method receiver is a built-in collection, either inline
 * (`new Map().clear()`) or through a variable whose every assignment is a
 * collection (`const cache = new Map(); cache.clear()`).
 */
function isBuiltinCollection(context: Rule.RuleContext, node: ESTree.Node) {
  if (isCollectionExpression(node)) {
    return true
  }
  if (node.type !== 'Identifier') {
    return false
  }

  const ref = context.sourceCode.getScope(node).references.find((r) => r.identifier === node)
  const variable = ref?.resolved

  if (!variable || variable.defs.length !== 1 || variable.defs[0].type !== 'Variable') {
    return false
  }

  const writes = variable.references.filter((r) => r.isWrite())

  return (
    writes.length > 0 &&
    writes.every((r) => isDirectWrite(r) && isCollectionExpression(r.writeExpr))
  )
}

/**
 * Checks if a write stores `writeExpr` itself in the variable. For
 * destructuring (`const [a] = [x]`) and loops (`for (const a of [x])`) the
 * write expression is the whole right side, not the variable's value.
 */
function isDirectWrite(ref: Scope.Reference) {
  const parent = (ref.identifier as NodeWithParent).parent

  return (
    (parent.type === 'VariableDeclarator' &&
      parent.id === ref.identifier &&
      parent.init === ref.writeExpr) ||
    (parent.type === 'AssignmentExpression' &&
      parent.operator === '=' &&
      parent.left === ref.identifier &&
      parent.right === ref.writeExpr)
  )
}

const waitForMethods = [
  'waitForConsoleMessage',
  'waitForDownload',
  'waitForEvent',
  'waitForFileChooser',
  'waitForFunction',
  'waitForPopup',
  'waitForRequest',
  'waitForResponse',
  'waitForWebSocket',
]

const waitForMethodsRegex = new RegExp(`^(${waitForMethods.join('|')})$`)

const pageMethods = new Set([
  'addInitScript',
  'addScriptTag',
  'addStyleTag',
  'bringToFront',
  'check',
  'click',
  'close',
  'dblclick',
  'dispatchEvent',
  'dragAndDrop',
  'emulateMedia',
  'evaluate',
  'evaluateHandle',
  'exposeBinding',
  'exposeFunction',
  'fill',
  'focus',
  'getAttribute',
  'goBack',
  'goForward',
  'goto',
  'hover',
  'innerHTML',
  'innerText',
  'inputValue',
  'isChecked',
  'isDisabled',
  'isEditable',
  'isEnabled',
  'isHidden',
  'isVisible',
  'pdf',
  'press',
  'reload',
  'route',
  'routeFromHAR',
  'screenshot',
  'selectOption',
  'setBypassCSP',
  'setContent',
  'setChecked',
  'setExtraHTTPHeaders',
  'setInputFiles',
  'setViewportSize',
  'tap',
  'textContent',
  'title',
  'type',
  'uncheck',
  'unroute',
  'unrouteAll',
  'waitForLoadState',
  'waitForTimeout',
  'waitForURL',
])

const locatorMethods = new Set([
  'all',
  'allInnerTexts',
  'allTextContents',
  'blur',
  'boundingBox',
  'check',
  'clear',
  'click',
  'count',
  'dblclick',
  'dispatchEvent',
  'dragTo',
  'evaluate',
  'evaluateAll',
  'evaluateHandle',
  'fill',
  'focus',
  'getAttribute',
  'hover',
  'innerHTML',
  'innerText',
  'inputValue',
  'isChecked',
  'isDisabled',
  'isEditable',
  'isEnabled',
  'isHidden',
  'isVisible',
  'press',
  'pressSequentially',
  'screenshot',
  'scrollIntoViewIfNeeded',
  'selectOption',
  'selectText',
  'setChecked',
  'setInputFiles',
  'tap',
  'textContent',
  'type',
  'uncheck',
  'waitFor',
])

const expectPlaywrightMatchers = [
  'toBeChecked',
  'toBeDisabled',
  'toBeEnabled',
  'toEqualText', // deprecated
  'toEqualUrl',
  'toEqualValue',
  'toHaveFocus',
  'toHaveSelector',
  'toHaveSelectorCount',
  'toHaveText', // deprecated
  'toMatchAttribute',
  'toMatchComputedStyle',
  'toMatchText',
  'toMatchTitle',
  'toMatchURL',
  'toMatchValue',
  'toPass',
]

const playwrightTestMatchers = [
  'toBeAttached',
  'toBeChecked',
  'toBeDisabled',
  'toBeEditable',
  'toBeEmpty',
  'toBeEnabled',
  'toBeFocused',
  'toBeHidden',
  'toBeInViewport',
  'toBeOK',
  'toBeVisible',
  'toContainText',
  'toHaveAccessibleErrorMessage',
  'toHaveAttribute',
  'toHaveCSS',
  'toHaveClass',
  'toHaveCount',
  'toHaveId',
  'toHaveJSProperty',
  'toHaveScreenshot',
  'toHaveText',
  'toHaveTitle',
  'toHaveURL',
  'toHaveValue',
  'toHaveValues',
  'toContainClass',
]

/** For fix/error placement: report on the MemberExpression (e.g. expect) when present, else the node itself. */
function getReportNode(node: ESTree.Node) {
  const parent = (node as NodeWithParent).parent
  return parent?.type === 'MemberExpression' ? parent : node
}

function getCallType(call: ParsedFnCall, awaitableMatchers: Set<string>) {
  if (call.type === 'step') {
    return {
      data: { name: 'test.step' },
      messageId: 'missingAwait',
      node: call.head.node,
    }
  }

  if (call.type === 'expect') {
    const isPoll = call.modifiers.some((m) => getStringValue(m) === 'poll')

    // The node needs to be checked if it's an expect.poll expression or an
    // awaitable matcher.
    if (isPoll || awaitableMatchers.has(call.matcherName)) {
      return {
        data: { name: isPoll ? 'expect.poll' : call.matcherName },
        messageId: 'missingAwait',
        node: call.head.node,
      }
    }
  }
}

export default createRule({
  create(context) {
    const options = context.options[0] || {}
    const includePageLocatorMethods = !!options.includePageLocatorMethods
    const awaitableMatchers = new Set([
      ...expectPlaywrightMatchers,
      ...playwrightTestMatchers,
      // Add any custom matchers to the set
      ...(options.customMatchers || []),
    ])

    /**
     * When a promise is assigned to a variable (e.g. `const x = page.waitForResponse(...)`),
     * we only consider it "consumed" if that variable is read in a valid place (await/return)
     * or passed to another variable that is.
     */
    function isVariableConsumed(variable: Scope.Variable, visited: Set<ESTree.Node>): boolean {
      for (const ref of variable.references) {
        // Skip the declaration itself (the write); we only care where the value is read
        if (!ref.isRead()) {
          continue
        }

        const refParent = (ref.identifier as NodeWithParent).parent
        if (!refParent || visited.has(refParent)) {
          continue
        }

        // Read is in a valid place: await x, return x, or (x) => ...
        if (validTypes.has(refParent.type)) {
          return true
        }

        // Value flows to another variable (e.g. const bar = foo); recurse so we
        // check whether that variable is consumed
        if (refParent.type === 'VariableDeclarator') {
          if (checkValidity(ref.identifier as ESTree.Node, visited)) {
            return true
          }
          continue
        }

        // Walk up (e.g. through .then(), ternary) to see if we end up in a valid place
        if (checkValidity(refParent, visited)) {
          return true
        }
      }
      return false
    }

    function checkValidity(node: ESTree.Node, visited: Set<ESTree.Node>) {
      const parent = (node as NodeWithParent).parent
      if (!parent) {
        return false
      }

      if (visited.has(parent)) {
        return false
      }

      visited.add(parent)

      // Directly in a valid context: await expr, return expr, or (expr) => ...
      if (validTypes.has(parent.type)) {
        return true
      }

      // We're the right-hand side of .then/.catch/.finally (e.g. in promise.then(...));
      // walk up to the CallExpression so we can then see if it's awaited
      if (isPromiseAccessor(parent) && parent.parent?.type === 'CallExpression') {
        return checkValidity(parent.parent, visited)
      }

      // We're the promise in promise.then(...) — we're the object of the .then
      // MemberExpression; walk up to the call so the next step can see await
      if (parent.type === 'CallExpression' && parent.callee === node && isPromiseAccessor(node)) {
        return checkValidity(parent, visited)
      }

      // Inside an array (e.g. [a, b] or Promise.all([...])); keep walking up
      if (parent.type === 'ArrayExpression') {
        return checkValidity(parent, visited)
      }

      // Inside a ternary (e.g. x ? promise : null); walk up to the declarator/assignment
      if (parent.type === 'ConditionalExpression') {
        return checkValidity(parent, visited)
      }

      // Optional chaining wraps calls in ChainExpression, e.g. await page?.unrouteAll()
      if (parent.type === 'ChainExpression') {
        return checkValidity(parent, visited)
      }

      // Inside a spread (e.g. ...[promise]); walk up
      if (parent.type === 'SpreadElement') {
        return checkValidity(parent, visited)
      }

      // Inside Promise.all/allSettled/race/any(...) — valid
      if (
        parent.type === 'CallExpression' &&
        parent.callee.type === 'MemberExpression' &&
        isIdentifier(parent.callee.object, 'Promise') &&
        isIdentifier(parent.callee.property, /^(all|allSettled|race|any)$/)
      ) {
        return true
      }

      // expect(promise).resolves.* — the promise is awaited via .resolves
      if (
        parent.type === 'MemberExpression' &&
        parent.object === node &&
        getStringValue(parent.property) === 'resolves' &&
        node.type === 'CallExpression' &&
        isIdentifier(node.callee, 'expect')
      ) {
        return checkValidity(parent, visited)
      }

      // Part of a chain (e.g. expect(x).resolves.toBeTruthy()); walk up
      if (parent.type === 'MemberExpression' && parent.object === node) {
        return checkValidity(parent, visited)
      }
      if (
        parent.type === 'CallExpression' &&
        (parent.callee === node || isIdentifier(parent.callee, 'expect'))
      ) {
        return checkValidity(parent, visited)
      }

      // Assigned to a variable — valid only if that variable is consumed (see above)
      if (parent.type === 'VariableDeclarator') {
        return context.sourceCode
          .getDeclaredVariables(parent)
          .some((v) => isVariableConsumed(v, visited))
      }

      // Re-assigned to an existing variable (e.g. `res = page.waitForResponse(...)`)
      if (
        parent.type === 'AssignmentExpression' &&
        parent.right === node &&
        parent.left.type === 'Identifier'
      ) {
        const parentName = parent.left.name
        let scope: Scope.Scope | null = context.sourceCode.getScope(node)

        while (scope) {
          const variable = scope.variables.find((v) => v.name === parentName)
          if (variable) {
            return isVariableConsumed(variable, visited)
          }

          scope = scope.upper
        }

        return false
      }

      return false
    }

    return {
      CallExpression(node) {
        if (isPageMethod(node, waitForMethodsRegex)) {
          if (!checkValidity(node, new Set())) {
            const methodName = getStringValue((node.callee as ESTree.MemberExpression).property)
            context.report({
              data: { name: methodName },
              messageId: 'missingAwait',
              node,
            })
          }
          return
        }

        if (includePageLocatorMethods && node.callee.type === 'MemberExpression') {
          const methodName = getStringValue(node.callee.property)
          const isPlaywrightMethod =
            !isBuiltinCollection(context, node.callee.object) &&
            (locatorMethods.has(methodName) ||
              (pageMethods.has(methodName) && isPageMethod(node, methodName)))

          if (isPlaywrightMethod) {
            if (!checkValidity(node, new Set())) {
              context.report({
                data: { name: methodName },
                messageId: 'missingAwait',
                node,
              })
            }
            return
          }
        }

        const call = parseFnCall(context, node)
        if (call?.type !== 'step' && call?.type !== 'expect') {
          return
        }

        const result = getCallType(call, awaitableMatchers)
        const isValid = result ? checkValidity(node, new Set()) : false

        if (result && !isValid) {
          context.report({
            data: result.data,
            fix: (fixer) => fixer.insertTextBefore(node, 'await '),
            messageId: result.messageId,
            node: getReportNode(result.node),
          })
        }
      },
    }
  },
  meta: {
    docs: {
      description: `Identify false positives when async Playwright APIs are not properly awaited.`,
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/missing-playwright-await.md',
    },
    fixable: 'code',
    messages: {
      missingAwait: "'{{name}}' must be awaited or returned.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          customMatchers: {
            items: { type: 'string' },
            type: 'array',
          },
          includePageLocatorMethods: {
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
})
