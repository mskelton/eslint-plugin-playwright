import { Rule } from 'eslint';
import { isCalleeObject, isCalleeProperty } from '../utils/ast';

export default {
  create(context) {
    return {
      CallExpression(node) {
        if (
          isCalleeObject(node, 'page') &&
          (isCalleeProperty(node, '$eval') || isCalleeProperty(node, '$$eval'))
        ) {
          context.report({
            messageId: isCalleeProperty(node, '$eval') ? 'noEval' : 'noEvalAll',
            node,
          });
        }
      },
    };
  },
  meta: {
    docs: {
      category: 'Possible Errors',
      description:
        'The use of `page.$eval` and `page.$$eval` are discouraged, use `locator.evaluate` or `locator.evaluateAll` instead',
      recommended: true,
      url: 'https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-eval.md',
    },
    messages: {
      noEval: 'Unexpected use of page.$eval().',
      noEvalAll: 'Unexpected use of page.$$eval().',
    },
    type: 'problem',
  },
} as Rule.RuleModule;
