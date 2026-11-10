import type * as ESTree from 'estree'
import {
  dereference,
  getStringValue,
  isFunction,
  isStringNode,
  type StringNode,
} from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const doesBinaryExpressionContainStringNode = (binaryExp: ESTree.BinaryExpression): boolean => {
  if (isStringNode(binaryExp.right)) {
    return true
  }

  if (binaryExp.left.type === 'BinaryExpression') {
    return doesBinaryExpressionContainStringNode(binaryExp.left)
  }

  return isStringNode(binaryExp.left)
}

const quoteStringValue = (node: StringNode): string =>
  node.type === 'TemplateLiteral' ? `\`${node.quasis[0].value.raw}\`` : (node.raw ?? '')

const compileMatcherPattern = (
  matcherMaybeWithMessage: MatcherAndMessage | string,
): CompiledMatcherAndMessage => {
  const [matcher, message] = Array.isArray(matcherMaybeWithMessage)
    ? matcherMaybeWithMessage
    : [matcherMaybeWithMessage]

  return [new RegExp(matcher, 'u'), message]
}

// A list is an array of pairs. A one or two string array stays a single pattern
// plus an optional message, which is the existing tuple form.
const isMatcherList = (matcher: MatcherAndMessage | MatcherList): matcher is MatcherList =>
  matcher.some((item) => Array.isArray(item))

const compileMatcherOption = (matcher: MatcherOption): CompiledMatcherAndMessage[] => {
  if (!Array.isArray(matcher)) {
    return [compileMatcherPattern(matcher)]
  }

  if (matcher.length === 0) {
    return []
  }

  if (isMatcherList(matcher)) {
    return matcher.map((item) => compileMatcherPattern(item))
  }

  return [compileMatcherPattern(matcher)]
}

const compileMatcherPatterns = (
  matchers: Matchers,
): Record<MatcherGroups, CompiledMatcherAndMessage[]> => {
  if (typeof matchers === 'string' || Array.isArray(matchers)) {
    const compiledMatchers = compileMatcherOption(matchers)

    return {
      describe: compiledMatchers,
      step: compiledMatchers,
      test: compiledMatchers,
    }
  }

  return {
    describe: matchers.describe ? compileMatcherOption(matchers.describe) : [],
    step: matchers.step ? compileMatcherOption(matchers.step) : [],
    test: matchers.test ? compileMatcherOption(matchers.test) : [],
  }
}

type CompiledMatcherAndMessage = [matcher: RegExp, message?: string]
type MatcherAndMessage = [matcher: string, message?: string]
type MatcherList = MatcherAndMessage[]
type MatcherOption = MatcherAndMessage | MatcherList | string
type Matchers = MatcherOption | Partial<Record<MatcherGroups, MatcherOption>>

const MatcherAndMessageSchema = {
  additionalItems: false,
  items: { type: 'string' },
  maxItems: 2,
  minItems: 1,
  type: 'array',
} as const

const MatcherListSchema = {
  items: MatcherAndMessageSchema,
  minItems: 1,
  type: 'array',
} as const

type MatcherGroups = 'describe' | 'step' | 'test'

interface Options {
  disallowedWords?: string[]
  ignoreSpaces?: boolean
  ignoreTypeOfDescribeName?: boolean
  ignoreTypeOfStepName?: boolean
  ignoreTypeOfTestName?: boolean
  mustMatch?: Matchers
  mustNotMatch?: Matchers
}

export default createRule({
  create(context) {
    const opts: Options = context.options?.[0] ?? {}
    const {
      disallowedWords = [],
      ignoreSpaces = false,
      ignoreTypeOfDescribeName = false,
      ignoreTypeOfStepName = true,
      ignoreTypeOfTestName = false,
      mustMatch,
      mustNotMatch,
    } = opts
    const disallowedWordsRegexp = new RegExp(`\\b(${disallowedWords.join('|')})\\b`, 'iu')

    const mustNotMatchPatterns = compileMatcherPatterns(mustNotMatch ?? {})
    const mustMatchPatterns = compileMatcherPatterns(mustMatch ?? {})

    const reportMatcherViolations = (
      patterns: readonly CompiledMatcherAndMessage[],
      title: StringNode,
      functionName: MatcherGroups,
      violates: (pattern: RegExp) => boolean,
      defaultMessageId: 'mustMatch' | 'mustNotMatch',
      customMessageId: 'mustMatchCustom' | 'mustNotMatchCustom',
    ) => {
      let reported = false

      for (const [pattern, message] of patterns) {
        if (!violates(pattern)) {
          continue
        }

        context.report({
          data: {
            functionName,
            message: message ?? '',
            pattern: String(pattern),
          },
          messageId: message ? customMessageId : defaultMessageId,
          node: title,
        })
        reported = true
      }

      return reported
    }

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'test' && call?.type !== 'describe' && call?.type !== 'step') {
          return
        }

        const [argument] = node.arguments

        // Anonymous describe: test.describe(() => { ... })
        if (call.type === 'describe' && isFunction(argument)) {
          return
        }

        const title = dereference(context, argument) ?? argument
        if (!title) {
          return
        }

        if (!isStringNode(title)) {
          if (title.type === 'BinaryExpression' && doesBinaryExpressionContainStringNode(title)) {
            return
          }

          // Skip type checking for identifiers and member expressions we
          // couldn't dereference - we can't determine their type statically.
          if (title.type === 'Identifier' || title.type === 'MemberExpression') {
            return
          }

          if (
            !(
              (call.type === 'describe' && ignoreTypeOfDescribeName) ||
              (call.type === 'test' && ignoreTypeOfTestName) ||
              (call.type === 'step' && ignoreTypeOfStepName)
            ) &&
            (title as ESTree.Node).type !== 'TemplateLiteral'
          ) {
            context.report({
              loc: title.loc!,
              messageId: 'titleMustBeString',
            })
          }

          return
        }

        const titleString = getStringValue(title)
        const functionName = call.type

        if (!titleString) {
          context.report({
            data: { functionName: call.type },
            messageId: 'emptyTitle',
            node,
          })

          return
        }

        if (disallowedWords.length > 0) {
          const disallowedMatch = disallowedWordsRegexp.exec(titleString)

          if (disallowedMatch) {
            context.report({
              data: { word: disallowedMatch[1] },
              messageId: 'disallowedWord',
              node: title,
            })

            return
          }
        }

        if (ignoreSpaces === false && titleString.trim().length !== titleString.length) {
          context.report({
            fix: (fixer) => [
              fixer.replaceTextRange(
                title.range!,
                quoteStringValue(title)
                  .replace(/^([`'"]) +?/u, '$1')
                  .replace(/ +?([`'"])$/u, '$1'),
              ),
            ],
            messageId: 'accidentalSpace',
            node: title,
          })
        }

        const [firstWord, ...rest] = titleString.split(' ')
        if (firstWord.toLowerCase() === functionName) {
          context.report({
            fix:
              rest.length > 0
                ? (fixer) => [
                    fixer.replaceTextRange(
                      title.range!,
                      quoteStringValue(title).replace(/^([`'"]).+? /u, '$1'),
                    ),
                  ]
                : undefined,
            messageId: 'duplicatePrefix',
            node: title,
          })
        }

        if (
          reportMatcherViolations(
            mustNotMatchPatterns[functionName],
            title,
            functionName,
            (pattern) => pattern.test(titleString),
            'mustNotMatch',
            'mustNotMatchCustom',
          )
        ) {
          // A mustNotMatch failure skips mustMatch, same as a single pattern.
          return
        }

        reportMatcherViolations(
          mustMatchPatterns[functionName],
          title,
          functionName,
          (pattern) => !pattern.test(titleString),
          'mustMatch',
          'mustMatchCustom',
        )
      },
    }
  },
  meta: {
    docs: {
      description: 'Enforce valid titles',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-title.md',
    },
    fixable: 'code',
    messages: {
      accidentalSpace: 'should not have leading or trailing spaces',
      disallowedWord: '"{{ word }}" is not allowed in test titles',
      duplicatePrefix: 'should not have duplicate prefix',
      emptyTitle: '{{ functionName }} should not have an empty title',
      mustMatch: '{{ functionName }} should match {{ pattern }}',
      mustMatchCustom: '{{ message }}',
      mustNotMatch: '{{ functionName }} should not match {{ pattern }}',
      mustNotMatchCustom: '{{ message }}',
      titleMustBeString: 'Title must be a string',
    },
    schema: [
      {
        additionalProperties: false,
        patternProperties: {
          [/^must(?:Not)?Match$/u.source]: {
            oneOf: [
              { type: 'string' },
              MatcherAndMessageSchema,
              MatcherListSchema,
              {
                additionalProperties: {
                  oneOf: [{ type: 'string' }, MatcherAndMessageSchema, MatcherListSchema],
                },
                propertyNames: { enum: ['describe', 'test', 'step'] },
                type: 'object',
              },
            ],
          },
        },
        properties: {
          disallowedWords: {
            items: { type: 'string' },
            type: 'array',
          },
          ignoreSpaces: {
            default: false,
            type: 'boolean',
          },
          ignoreTypeOfDescribeName: {
            default: false,
            type: 'boolean',
          },
          ignoreTypeOfStepName: {
            default: true,
            type: 'boolean',
          },
          ignoreTypeOfTestName: {
            default: false,
            type: 'boolean',
          },
        },
        type: 'object',
      },
    ],
    type: 'suggestion',
  },
})
