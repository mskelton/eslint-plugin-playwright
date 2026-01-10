import * as ESTree from 'estree'
import { getStringValue, isFunction, isStringLiteral } from '../utils/ast.js'
import { createRule } from '../utils/createRule.js'
import { parseFnCall } from '../utils/parseFnCall.js'

const paramsLocation = (
  params: ESTree.CallExpression['arguments'] | ESTree.Pattern[],
) => {
  const [first] = params
  const last = params[params.length - 1]

  return {
    end: last.loc!.end,
    start: first.loc!.start,
  }
}

export default createRule({
  create(context) {
    return {
      CallExpression(node) {
        const call = parseFnCall(context, node)
        if (call?.group !== 'describe') return

        // Ignore `describe.configure()` calls
        if (call.members.some((s) => getStringValue(s) === 'configure')) {
          return
        }

        const callback = node.arguments.at(-1)

        // e.g., test.describe()
        if (!callback) {
          return context.report({
            loc: node.loc!,
            messageId: 'missingCallback',
          })
        }

        // e.g., test.describe("foo")
        if (node.arguments.length === 1 && isStringLiteral(callback)) {
          return context.report({
            loc: paramsLocation(node.arguments),
            messageId: 'missingCallback',
          })
        }

        // e.g., test.describe("foo", "foo2");
        if (!isFunction(callback)) {
          return context.report({
            loc: paramsLocation(node.arguments),
            messageId: 'invalidCallback',
          })
        }

        // e.g., test.describe("foo", async () => {});
        if (callback.async) {
          context.report({
            messageId: 'noAsyncDescribeCallback',
            node: callback,
          })
        }

        // e.g., test.describe("foo", (done) => {});
        if (callback.params.length) {
          context.report({
            loc: paramsLocation(callback.params),
            messageId: 'unexpectedDescribeArgument',
          })
        }

        // e.g., test.describe("foo", () => { return; });
        if (callback.body.type === 'CallExpression') {
          context.report({
            messageId: 'unexpectedReturnInDescribe',
            node: callback,
          })
        }

        if (callback.body.type === 'BlockStatement') {
          callback.body.body.forEach((node) => {
            if (node.type === 'ReturnStatement') {
              context.report({
                messageId: 'unexpectedReturnInDescribe',
                node,
              })
            }
          })
        }
      },
    }
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description: 'Enforce valid `describe()` callback',
      recommended: true,
      url: 'https://github.com/mskelton/eslint-plugin-playwright/tree/main/docs/rules/valid-describe-callback.md',
    },
    messages: {
      invalidCallback: 'Callback argument must be a function',
      missingCallback: 'Describe requires a callback',
      noAsyncDescribeCallback: 'No async describe callback',
      unexpectedDescribeArgument: 'Unexpected argument(s) in describe callback',
      unexpectedReturnInDescribe:
        'Unexpected return statement in describe callback',
    },
    schema: [],
    type: 'problem',
  },
})
