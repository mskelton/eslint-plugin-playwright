import type { Rule } from 'eslint'
import type { Settings } from './types.js'

/** Interpolate a message replacing any data placeholders (e.g. `{{foo}}`) */
function interpolate(str: string, data: Record<string, string> | undefined) {
  return str.replace(/{{\s*(\w+)\s*}}/g, (_, key) => data?.[key] ?? '')
}

export function createRule(rule: Rule.RuleModule): Rule.RuleModule {
  return {
    create(context: Rule.RuleContext) {
      const messages = (context.settings as Settings)?.playwright?.messages

      // If there are no custom messages, we don't need to modify the rule context
      if (!messages) {
        return rule.create(context)
      }

      /** Custom wrapper around `context.report` to support custom messages. */
      const report = (options: Rule.ReportDescriptor) => {
        // Support overriding the default messages from global settings
        if (messages && 'messageId' in options) {
          const { data, messageId, ...rest } = options
          const message = messages?.[messageId]

          // If the message is not found, fallback to the default messageId
          // in the options.
          return context.report(
            message
              ? {
                  ...rest,
                  message: interpolate(message, data as Record<string, string>),
                }
              : options,
          )
        }

        return context.report(options)
      }

      // ESLint does not allow modifying the context object, so we have to create
      // a new context object. Also, destructuring the context object will not work
      // because the properties are not enumerable, so we have to manually copy
      // the properties we need.
      const ruleContext = Object.freeze({
        ...context,
        cwd: context.cwd,
        filename: context.filename,
        id: context.id,
        languageOptions: context.languageOptions,
        options: context.options,
        // @ts-expect-error - Legacy context property
        parserOptions: context.parserOptions,
        // @ts-expect-error - Legacy context property
        parserPath: context.parserPath,
        physicalFilename: context.physicalFilename,
        report,
        settings: context.settings,
        sourceCode: context.sourceCode,
      })

      return rule.create(ruleContext)
    },
    meta: rule.meta,
  }
}
