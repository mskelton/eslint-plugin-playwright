import * as ESTree from 'estree'
import { getStringValue, isBooleanLiteral } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { getRangeOffset, removePropertyFixer, replaceAccessorFixer } from '../utils/fixer.js'
import { truthy } from '../utils/misc.js'
import { type ParsedExpectFnCall, parseFnCall } from '../utils/parseFnCall.js'

const matcherConfig: Record<string, { argName?: string; inverse: string }> = {
  toBeDisabled: { inverse: 'toBeEnabled' },
  toBeEnabled: {
    argName: 'enabled',
    inverse: 'toBeDisabled',
  },
  toBeHidden: { inverse: 'toBeVisible' },
  toBeVisible: {
    argName: 'visible',
    inverse: 'toBeHidden',
  },
}

function getOptions(call: ParsedExpectFnCall, name: string) {
  const [arg] = call.matcherArgs
  if (arg?.type !== 'ObjectExpression') return

  const property = arg.properties.find(
    (p): p is ESTree.Property =>
      p.type === 'Property' && getStringValue(p.key) === name && isBooleanLiteral(p.value),
  )

  return {
    arg,
    property,
    value: (property?.value as { value: boolean })?.value,
  }
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'expect') return

        // This rule only applies to specific matchers that have opposites
        const config = matcherConfig[call.matcherName]
        if (!config) return

        // If the matcher has an options argument, we need to check if it has
        // a `visible` or `enabled` property that is a boolean literal.
        const options = config.argName ? getOptions(call, config.argName) : undefined

        // If an argument is provided to the `visible` or `enabled` property, but
        // we can't determine it's value, we can't safely remove the `not` modifier.
        if (options?.arg && options.value === undefined) return

        const notModifier = call.modifiers.find((mod) => getStringValue(mod) === 'not')

        // If the matcher is not negated, or the matcher has no options, we can
        // safely ignore it.
        if (!notModifier && !options?.property) return

        // If the matcher is inverted, we need to remove the `not` modifier and
        // replace the matcher with it's inverse.
        const isInverted = !!notModifier !== (options?.value === false)
        const newMatcherName = isInverted ? config.inverse : call.matcherName

        context.report({
          data: {
            new: newMatcherName,
            old: call.matcherName,
            property: config.argName ?? '',
          },
          fix: (fixer) => {
            return [
              // Remove the `not` modifier if it exists
              notModifier &&
                fixer.removeRange([
                  notModifier.range![0] - getRangeOffset(notModifier),
                  notModifier.range![1] + 1,
                ]),
              // Remove the `visible` or `enabled` property if it exists
              options?.property && removePropertyFixer(fixer, options.property),
              // Swap the matcher name if it's different
              call.matcherName !== newMatcherName &&
                replaceAccessorFixer(fixer, call.matcher, newMatcherName),
            ].filter(truthy)
          },
          loc: notModifier
            ? { end: call.matcher.loc!.end, start: notModifier.loc!.start }
            : options!.property!.loc!,
          messageId: notModifier
            ? 'noUselessNot'
            : isInverted
              ? 'noUselessProperty'
              : 'noUselessTruthy',
        })
      },
    }
  },
  meta: {
    docs: {
      category: 'Best Practices',
      description: `Disallow usage of 'not' matchers when a more specific matcher exists`,
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/no-useless-not.md',
    },
    fixable: 'code',
    messages: {
      noUselessNot: 'Unexpected usage of not.{{old}}(). Use {{new}}() instead.',
      noUselessProperty:
        "Unexpected usage of '{{old}}({ {{property}}: false })'. Use '{{new}}()' instead.",
      noUselessTruthy:
        "Unexpected usage of '{{old}}({ {{property}}: true })'. Use '{{new}}()' instead.",
    },
    type: 'problem',
  },
})
