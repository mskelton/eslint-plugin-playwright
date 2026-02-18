import type * as ESTree from 'estree'
import { dereference, getStringValue, isStringNode, type StringNode } from '../utils/ast.js'
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

const compileMatcherPatterns = (
  matchers: Partial<Record<MatcherGroups, string | MatcherAndMessage>> | MatcherAndMessage | string,
): Record<MatcherGroups, CompiledMatcherAndMessage | null> &
  Record<string, CompiledMatcherAndMessage | null> => {
  if (typeof matchers === 'string' || Array.isArray(matchers)) {
    const compiledMatcher = compileMatcherPattern(matchers)

    return {
      describe: compiledMatcher,
      step: compiledMatcher,
      test: compiledMatcher,
    }
  }

  return {
    describe: matchers.describe ? compileMatcherPattern(matchers.describe) : null,
    step: matchers.step ? compileMatcherPattern(matchers.step) : null,
    test: matchers.test ? compileMatcherPattern(matchers.test) : null,
  }
}

type CompiledMatcherAndMessage = [matcher: RegExp, message?: string]
type MatcherAndMessage = [matcher: string, message?: string]

const MatcherAndMessageSchema = {
  additionalItems: false,
  items: { type: 'string' },
  maxItems: 2,
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
  mustMatch?:
    | Partial<Record<MatcherGroups, string | MatcherAndMessage>>
    | MatcherAndMessage
    | string
  mustNotMatch?:
    | Partial<Record<MatcherGroups, string | MatcherAndMessage>>
    | MatcherAndMessage
    | string
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

    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.type !== 'test' && call?.type !== 'describe' && call?.type !== 'step') {
          return
        }

        const [argument] = node.arguments
        const title = dereference(context, argument) ?? argument
        if (!title) return

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

        const [firstWord] = titleString.split(' ')
        if (firstWord.toLowerCase() === functionName) {
          context.report({
            fix: (fixer) => [
              fixer.replaceTextRange(
                title.range!,
                quoteStringValue(title).replace(/^([`'"]).+? /u, '$1'),
              ),
            ],
            messageId: 'duplicatePrefix',
            node: title,
          })
        }

        const [mustNotMatchPattern, mustNotMatchMessage] = mustNotMatchPatterns[functionName] ?? []

        if (mustNotMatchPattern && mustNotMatchPattern.test(titleString)) {
          context.report({
            data: {
              functionName,
              message: mustNotMatchMessage ?? '',
              pattern: String(mustNotMatchPattern),
            },
            messageId: mustNotMatchMessage ? 'mustNotMatchCustom' : 'mustNotMatch',
            node: title,
          })

          return
        }

        const [mustMatchPattern, mustMatchMessage] = mustMatchPatterns[functionName] ?? []

        if (mustMatchPattern && !mustMatchPattern.test(titleString)) {
          context.report({
            data: {
              functionName,
              message: mustMatchMessage ?? '',
              pattern: String(mustMatchPattern),
            },
            messageId: mustMatchMessage ? 'mustMatchCustom' : 'mustMatch',
            node: title,
          })

          return
        }
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
              {
                additionalProperties: {
                  oneOf: [{ type: 'string' }, MatcherAndMessageSchema],
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
