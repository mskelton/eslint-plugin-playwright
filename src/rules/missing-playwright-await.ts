import type * as ESTree from 'estree'
import { getStringValue, isIdentifier, isPageMethod, isPromiseAccessor } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { type ParsedFnCall, parseFnCall } from '../utils/parseFnCall.js'
import type { NodeWithParent } from '../utils/types.js'

const validTypes = new Set(['AwaitExpression', 'ReturnStatement', 'ArrowFunctionExpression'])

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
    return { messageId: 'testStep', node: call.head.node }
  }

  if (call.type === 'expect') {
    const isPoll = call.modifiers.some((m) => getStringValue(m) === 'poll')

    // The node needs to be checked if it's an expect.poll expression or an
    // awaitable matcher.
    if (isPoll || awaitableMatchers.has(call.matcherName)) {
      return {
        data: { matcherName: call.matcherName },
        messageId: isPoll ? 'expectPoll' : 'expect',
        node: call.head.node,
      }
    }
  }
}

export default createRule({
  create(context) {
    const options = context.options[0] || {}
    const awaitableMatchers = new Set([
      ...expectPlaywrightMatchers,
      ...playwrightTestMatchers,
      // Add any custom matchers to the set
      ...(options.customMatchers || []),
    ])

    /**
     * When a promise is assigned to a variable (e.g. `const x = page.waitForResponse(...)`),
     * we only consider it "consumed" if that variable is read in a valid place (await/return)
     * or passed to another variable that is. This checks only references to the declared
     * variable(s), not every identifier in the scope.
     */
    function isVariableConsumed(
      declarator: ESTree.VariableDeclarator,
      checkValidity: (node: ESTree.Node, visited: Set<ESTree.Node>) => boolean,
      validTypes: Set<string>,
      visited: Set<ESTree.Node>,
    ): boolean {
      // e.g. `const x = ...` → one variable; destructuring → possibly several
      const variables = context.sourceCode.getDeclaredVariables(declarator)
      for (const variable of variables) {
        for (const ref of variable.references) {
          // Skip the declaration itself (the write); we only care where the value is read
          if (!ref.isRead()) {
            continue
          }

          const refParent = (ref.identifier as NodeWithParent).parent
          if (visited.has(refParent)) {
            continue
          }

          // Read is in a valid place: await x, return x, or (x) => ...
          if (validTypes.has(refParent.type)) {
            return true
          }

          // Value flows to another variable (e.g. const bar = foo); recurse so we
          // check whether that variable is consumed
          if (refParent.type === 'VariableDeclarator') {
            if (checkValidity(ref.identifier as ESTree.Node, visited)) return true
            continue
          }

          // Walk up (e.g. through .then(), ternary) to see if we end up in a valid place
          if (checkValidity(refParent, visited)) return true
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

      // Inside a spread (e.g. ...[promise]); walk up
      if (parent.type === 'SpreadElement') {
        return checkValidity(parent, visited)
      }

      // Inside Promise.all(...) — valid
      if (
        parent.type === 'CallExpression' &&
        parent.callee.type === 'MemberExpression' &&
        isIdentifier(parent.callee.object, 'Promise') &&
        isIdentifier(parent.callee.property, 'all')
      ) {
        return true
      }

      // Assigned to a variable — valid only if that variable is consumed (see above)
      if (parent.type === 'VariableDeclarator') {
        return isVariableConsumed(parent, checkValidity, validTypes, visited)
      }

      return false
    }

    return {
      CallExpression(node) {
        if (isPageMethod(node, waitForMethodsRegex)) {
          if (!checkValidity(node, new Set())) {
            const methodName = getStringValue((node.callee as ESTree.MemberExpression).property)
            context.report({
              data: { methodName },
              messageId: 'waitFor',
              node,
            })
          }
          return
        }

        const call = parseFnCall(context, node)
        if (call?.type !== 'step' && call?.type !== 'expect') return

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
      expect: "'{{matcherName}}' must be awaited or returned.",
      expectPoll: "'expect.poll' matchers must be awaited or returned.",
      testStep: "'test.step' must be awaited or returned.",
      waitFor: "'{{methodName}}' must be awaited or returned.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          customMatchers: {
            items: { type: 'string' },
            type: 'array',
          },
        },
        type: 'object',
      },
    ],
    type: 'problem',
  },
})
