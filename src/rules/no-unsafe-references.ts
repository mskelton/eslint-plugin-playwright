import { AST, Rule, Scope } from 'eslint'
import * as ESTree from 'estree'
import {
  getParent,
  getStringValue,
  isFunction,
  isPageMethod,
} from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { truthy } from '../utils/misc.js'
import { NodeWithParent } from '../utils/types.js'

/** Collect all variable references in the parent scopes recursively. */
function collectVariables(scope: Scope.Scope | null): string[] {
  if (!scope || scope.type === 'global') return []

  return [
    ...collectVariables(scope.upper),
    ...scope.variables.map((ref) => ref.name),
  ]
}

/**
 * Add the variables from the outer scope as arguments to `page.evaluate()` or
 * `page.addInitScript()`.
 */
function addArgument(
  fixer: Rule.RuleFixer,
  node: ESTree.CallExpression,
  refs: string,
) {
  // This should never happen, but just in case
  if (!node.arguments.length) return

  // If the only argument to the method is the function, we
  // have to add the references as the second argument.
  if (node.arguments.length === 1) {
    return fixer.insertTextAfter(node.arguments[0], `, [${refs}]`)
  }

  // If there are at least two arguments, we can add the references after the
  // last element of the second argument, which should be an array.
  const arg = node.arguments.at(-1)
  if (!arg) return

  // If the second argument is not an array, we have to replace it with an array
  // containing the existing argument and the new references.
  if (arg.type !== 'ArrayExpression') {
    return fixer.replaceText(arg, `[${getStringValue(arg)}, ${refs}]`)
  }

  // It's possible the array is provided but empty, in which case we can just
  // replace it with the references.
  const lastItem = arg.elements.at(-1)
  return lastItem
    ? fixer.insertTextAfter(lastItem, `, ${refs}`)
    : fixer.replaceText(arg, `[${refs}]`)
}

/** Get the opening parenthesis of the function. */
function getParen(
  context: Rule.RuleContext,
  node: ESTree.Node,
): AST.Token | null {
  let token: AST.Token | null = context.sourceCode.getFirstToken(node)

  while (token && token.value !== '(') {
    token = context.sourceCode.getTokenAfter(token)
  }

  return token
}

/** Add a parameter to the function. */
function addParam(
  context: Rule.RuleContext,
  fixer: Rule.RuleFixer,
  node: ESTree.ArrowFunctionExpression | ESTree.FunctionExpression,
  refs: string,
) {
  // If the function has params, add the reference after the last one
  const lastParam = node.params.at(-1)
  if (lastParam) {
    // If the last param is an array, add the reference after the last element
    // otherwise, replace the last param with an array containing the existing
    // param and the references.
    return lastParam.type === 'ArrayPattern'
      ? fixer.insertTextAfter(lastParam.elements.at(-1)!, `, ${refs}`)
      : fixer.replaceText(lastParam, `[${getStringValue(lastParam)}, ${refs}]`)
  }

  // If the function has no params, add the reference after the opening parenthesis
  const token = getParen(context, node)
  return token ? fixer.insertTextAfter(token, `[${refs}]`) : null
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        if (
          !isPageMethod(node, 'evaluate') &&
          !isPageMethod(node, 'addInitScript')
        )
          return

        const [fn] = node.arguments
        if (!fn || !isFunction(fn)) return

        const { through, upper } = context.sourceCode.getScope(fn.body)
        const allRefs = new Set(collectVariables(upper))

        // This logic is confusing at first. If we find a variable within the
        // function that is declared in the parent scope, we want to report it.
        // If a variable is used in the function, but not declared in the parent,
        // then it's likely a global variable such as `Promise` or `console`.
        through
          .filter((ref) => {
            const parent = (ref.identifier as NodeWithParent).parent
            return (parent?.type as string) !== 'TSTypeReference'
          })
          .filter((ref) => allRefs.has(ref.identifier.name))
          .forEach((ref, i, arr) => {
            const methodName = isPageMethod(node, 'evaluate')
              ? 'evaluate'
              : 'addInitScript'
            const descriptor: Rule.ReportDescriptor = {
              data: { method: methodName, variable: ref.identifier.name },
              messageId: 'noUnsafeReference',
              node: ref.identifier,
            }

            // We only report on the first unsafe reference since fixes overlap
            if (i !== 0) {
              context.report(descriptor)
              return
            }

            context.report({
              ...descriptor,
              fix(fixer) {
                const refs = arr.map((ref) => ref.identifier.name).join(', ')

                return [
                  addArgument(fixer, node, refs),
                  addParam(context, fixer, fn, refs),
                ].filter(truthy)
              },
            })
          })
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description:
        'Prevent unsafe variable references in page.evaluate() and page.addInitScript()',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-unsafe-references.md',
    },
    fixable: 'code',
    messages: {
      noUnsafeReference:
        'Unsafe reference to variable "{{ variable }}" in page.{{ method }}()',
    },
    type: 'problem',
  },
})
