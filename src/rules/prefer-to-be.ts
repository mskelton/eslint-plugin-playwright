import type { Rule } from 'eslint'
import type * as ESTree from 'estree'
import { equalityMatchers, getStringValue, isIdentifier } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { replaceAccessorFixer } from '../utils/fixer.js'
import { type ParsedExpectFnCall, parseFnCall } from '../utils/parseFnCall.js'

function shouldUseToBe(call: ParsedExpectFnCall) {
  let arg = call.matcherArgs[0]

  if (arg.type === 'UnaryExpression' && arg.operator === '-') {
    arg = arg.argument
  }

  if (arg.type === 'Literal') {
    // regex literals are classed as literals, but they're actually objects
    // which means "toBe" will give different results than other matchers
    return !('regex' in arg)
  }

  return arg.type === 'TemplateLiteral'
}

function reportPreferToBe(
  context: Rule.RuleContext,
  call: ParsedExpectFnCall,
  whatToBe: string,
  notModifier?: ESTree.Node,
) {
  context.report({
    fix(fixer) {
      const fixes = [replaceAccessorFixer(fixer, call.matcher, `toBe${whatToBe}`)]

      if (call.matcherArgs?.length && whatToBe !== '') {
        fixes.push(fixer.remove(call.matcherArgs[0]))
      }

      if (notModifier) {
        const [start, end] = notModifier.range!
        fixes.push(fixer.removeRange([start - 1, end]))
      }

      return fixes
    },
    messageId: `useToBe${whatToBe}`,
    node: call.matcher,
  })
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect') return

        const notMatchers = ['toBeUndefined', 'toBeDefined']
        const notModifier = call.modifiers.find((node) => getStringValue(node) === 'not')

        if (notModifier && notMatchers.includes(call.matcherName)) {
          return reportPreferToBe(
            context,
            call,
            call.matcherName === 'toBeDefined' ? 'Undefined' : 'Defined',
            notModifier,
          )
        }

        const firstArg = call.matcherArgs[0]
        if (!equalityMatchers.has(call.matcherName) || !firstArg) {
          return
        }

        if (firstArg.type === 'Literal' && firstArg.value === null) {
          return reportPreferToBe(context, call, 'Null')
        }

        if (isIdentifier(firstArg, 'undefined')) {
          const name = notModifier ? 'Defined' : 'Undefined'
          return reportPreferToBe(context, call, name, notModifier)
        }

        if (isIdentifier(firstArg, 'NaN')) {
          return reportPreferToBe(context, call, 'NaN')
        }

        if (shouldUseToBe(call) && call.matcherName !== 'toBe') {
          reportPreferToBe(context, call, '')
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: 'Suggest using `toBe()` for primitive literals',
      recommended: false,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-be.md',
    },
    fixable: 'code',
    messages: {
      useToBe: 'Use `toBe` when expecting primitive literals',
      useToBeDefined: 'Use `toBeDefined` instead',
      useToBeNaN: 'Use `toBeNaN` instead',
      useToBeNull: 'Use `toBeNull` instead',
      useToBeUndefined: 'Use `toBeUndefined` instead',
    },
    schema: [],
    type: 'suggestion',
  },
})
