import type { Rule } from 'eslint'
import type { Expression } from 'estree'
import { parseFnCall } from '../utils/parseFnCall.js'

/**
 * Unwraps a given expression to get the actual expression being called. This is
 * useful when checking the final expression specifically.
 *
 * This handles:
 *
 * - Assignment expressions like `result = test(...)`
 * - Async calls like `await test(...)`
 * - Chained function calls like `test.step().then(...)`
 *
 * @param node - The expression to unwrap
 * @returns The unwrapped expression
 */
export function unwrapExpression(node: Expression): Expression {
  // Resolve assignments to get the actual expression
  if (node.type === 'AssignmentExpression') {
    return unwrapExpression(node.right)
  }

  // Resolve async await expressions
  if (node.type === 'AwaitExpression') {
    return unwrapExpression(node.argument)
  }

  // Traverse chains recursively to find the actual call
  if (
    node.type === 'CallExpression' &&
    node.callee.type === 'MemberExpression' &&
    node.callee.object.type === 'CallExpression'
  ) {
    return unwrapExpression(node.callee.object)
  }

  return node
}

/**
 * Checks if a given expression is a test-related call. A test call is a call to
 * `test(...)` or one of its methods like `test.step(...)`.
 *
 * If the expression is chained, the calls are recursively traced back to find
 * the actual call. This also handles assignments and async calls with `await`.
 *
 * @param context - The ESLint rule context
 * @param node - The expression to check
 * @param methods - Optional list of specific methods to check for
 * @returns Whether it's a test block call
 */
export function isTestExpression(
  context: Rule.RuleContext,
  node: Expression,
  methods?: string[],
): boolean {
  // Unwrap the actual expression to check the call
  const unwrapped = unwrapExpression(node)

  // Must be a call expression to be a test call
  if (unwrapped.type !== 'CallExpression') {
    return false
  }

  // Use the existing parseFnCall to identify test-related calls
  const call = parseFnCall(context, unwrapped)
  if (!call) {
    return false
  }

  // If specific methods are requested, check if it's one of them
  if (methods !== undefined) {
    return (
      call.type === 'step' ||
      call.type === 'hook' ||
      (call.type === 'test' && methods.includes('test'))
    )
  }

  // Check if it's any test-related call
  return ['test', 'step', 'hook'].includes(call.type)
}
