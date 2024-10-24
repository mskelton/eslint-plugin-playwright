import { Rule } from 'eslint'
import ESTree from 'estree'
import { getParent, getStringValue, isIdentifier, isPage } from '../utils/ast'
import { createRule } from '../utils/createRule'
import { ParsedFnCall, parseFnCall } from '../utils/parseFnCall'

const validTypes = new Set([
  'AwaitExpression',
  'ReturnStatement',
  'ArrowFunctionExpression',
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
  'toBeChecked',
  'toBeDisabled',
  'toBeEditable',
  'toBeEmpty',
  'toBeEnabled',
  'toBeFocused',
  'toBeHidden',
  'toBeVisible',
  'toContainText',
  'toHaveAttribute',
  'toHaveClass',
  'toHaveCount',
  'toHaveCSS',
  'toHaveId',
  'toHaveJSProperty',
  'toBeOK',
  'toHaveScreenshot',
  'toHaveText',
  'toHaveTitle',
  'toHaveURL',
  'toHaveValue',
  'toHaveValues',
  'toBeAttached',
  'toBeInViewport',
]

const pageMethods = new Set([
  '$', // deprecated
  '$$', // deprecated
  '$eval', // deprecated
  '$$eval', // deprecated
  'addInitScript',
  'addLocatorHandler',
  'addScriptTag',
  'addStyleTag',
  'bringToFront',
  'check', // deprecated
  'click', // deprecated
  'close',
  'content',
  'dblclick', // deprecated
  'dispatchEvent', // deprecated
  'dragAndDrop',
  'emulateMedia',
  'evaluate',
  'evaluateHandle',
  'exposeBinding',
  'exposeFunction',
  'fill', // deprecated
  'focus', // deprecated
  'getAttribute', // deprecated
  'goBack',
  'goForward',
  'goto',
  'hover', // deprecated
  'innerHTML', // deprecated
  'innerText', // deprecated
  'inputValue', // deprecated
  'isChecked', // deprecated
  'isDisabled', // deprecated
  'isEditable', // deprecated
  'isEnabled', // deprecated
  'isHidden', // deprecated
  'isVisible', // deprecated
  'opener',
  'pause',
  'pdf',
  'press', // deprecated
  'reload',
  'removeLocatorHandler',
  'route',
  'routeFromHAR',
  'screenshot',
  'selectOption', // deprecated
  'setChecked', // deprecated
  'setContent',
  'setExtraHTTPHeaders',
  'setInputFiles', // deprecated
  'setViewportSize',
  'tap', // deprecated
  'textContent', // deprecated
  'title',
  'type', // deprecated
  'unroute',
  'unrouteAll',
  'waitForFunction',
  'waitForLoadState',
  'waitForNavigation', // deprecated
  'waitForSelector', // deprecated
  'waitForTimeout', // deprecated
  'waitForURL',
])

function getReportNode(node: ESTree.Node) {
  const parent = getParent(node)
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

    function checkValidity(node: ESTree.Node) {
      const parent = getParent(node)
      if (!parent) return false

      // If the parent is a valid type (e.g. return or await), we don't need to
      // check any further.
      if (validTypes.has(parent.type)) return true

      // If the parent is an array, we need to check the grandparent to see if
      // it's a Promise.all, or a variable.
      if (parent.type === 'ArrayExpression') {
        return checkValidity(parent)
      }

      // If the parent is a call expression, we need to check the grandparent
      // to see if it's a Promise.all.
      if (
        parent.type === 'CallExpression' &&
        parent.callee.type === 'MemberExpression' &&
        isIdentifier(parent.callee.object, 'Promise') &&
        isIdentifier(parent.callee.property, 'all')
      ) {
        return true
      }

      // If the parent is a variable declarator, we need to check the scope to
      // find where it is referenced. When we find the reference, we can
      // re-check validity.
      if (parent.type === 'VariableDeclarator') {
        const scope = context.sourceCode.getScope(parent.parent)

        for (const ref of scope.references) {
          const refParent = (ref.identifier as Rule.Node).parent

          // If the parent of the reference is valid, we can immediately return
          // true. Otherwise, we'll check the validity of the parent to continue
          // the loop.
          if (validTypes.has(refParent.type)) return true
          if (checkValidity(refParent)) return true
        }
      }

      return false
    }

    return {
      CallExpression(node) {
        // Checking validity of calls to methods on the page object
        if (isPage(node) && node.callee.type === 'MemberExpression') {
          const method = getStringValue(node.callee.property)
          const isValid = checkValidity(node)

          if (!isValid && pageMethods.has(method)) {
            context.report({
              data: { method },
              fix: (fixer) => fixer.insertTextBefore(node, 'await '),
              messageId: 'page',
              node: node.callee,
            })
          }
        }

        const call = parseFnCall(context, node)
        if (call?.type !== 'step' && call?.type !== 'expect') return

        const result = getCallType(call, awaitableMatchers)
        const isValid = result ? checkValidity(node) : false

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
      category: 'Possible Errors',
      description: `Identify false positives when async Playwright APIs are not properly awaited.`,
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/missing-playwright-await.md',
    },
    fixable: 'code',
    messages: {
      expect: "'{{matcherName}}' must be awaited or returned.",
      expectPoll: "'expect.poll' matchers must be awaited or returned.",
      page: "'{{method}}' must be awaited or returned.",
      testStep: "'test.step' must be awaited or returned.",
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
