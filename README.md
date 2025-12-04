# ESLint Plugin Playwright

[![Test](https://github.com/playwright-community/eslint-plugin-playwright/actions/workflows/test.yml/badge.svg)](https://github.com/playwright-community/eslint-plugin-playwright/actions/workflows/test.yml)
[![npm](https://img.shields.io/npm/v/eslint-plugin-playwright)](https://www.npmjs.com/package/eslint-plugin-playwright)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

ESLint plugin for [Playwright](https://github.com/microsoft/playwright).

## Installation

npm

```bash
npm install -D eslint-plugin-playwright
```

Yarn

```bash
yarn add -D eslint-plugin-playwright
```

pnpm

```bash
pnpm add -D eslint-plugin-playwright
```

## Usage

The recommended setup is to use the `files` field to target only Playwright test
files. In the examples below, this is done by targeting files in the `tests`
directory and only applying the Playwright rules to those files. In your
project, you may need to change the `files` field to match your Playwright test
file patterns.

[Flat config](https://eslint.org/docs/latest/use/configure/configuration-files-new)
(**eslint.config.js**)

```javascript
import { defineConfig } from '@eslint/config'
import playwright from 'eslint-plugin-playwright'

export default defineConfig([
  {
    files: ['tests/**'],
    extends: [playwright.configs['flat/recommended']],
    rules: {
      // Customize Playwright rules
      // ...
    },
  },
])
```

[Legacy config](https://eslint.org/docs/latest/use/configure/configuration-files)
(**.eslintrc**)

```json
{
  "overrides": [
    {
      "files": "tests/**",
      "extends": "plugin:playwright/recommended"
    }
  ]
}
```

## Settings

### Aliased Playwright Globals

If you import Playwright globals (e.g. `test`, `expect`) with a custom name, you
can configure this plugin to be aware of these additional names.

```json
{
  "settings": {
    "playwright": {
      "globalAliases": {
        "test": ["myTest"],
        "expect": ["myExpect"]
      }
    }
  }
}
```

### Custom Messages

You can customize the error messages for rules using the
`settings.playwright.messages` property. This is useful if you would like to
increase the verbosity of error messages or provide additional context.

Only the message ids you define in this setting will be overridden, so any other
messages will use the default message defined by the plugin.

```json
{
  "settings": {
    "playwright": {
      "messages": {
        "conditionalExpect": "Avoid conditional expects as they can lead to false positives"
      }
    }
  }
}
```

## Rules

✅ Set in the `recommended` configuration\
🔧 Automatically fixable by the [`--fix`](https://eslint.org/docs/latest/user-guide/command-line-interface#--fix)
CLI option\
💡 Manually fixable by
[editor suggestions](https://eslint.org/docs/latest/developer-guide/working-with-rules#providing-suggestions)

| Rule                                                                                                                                                            | Description                                                        | ✅  | 🔧  | 💡  |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | :-: | :-: | :-: |
| [consistent-spacing-between-blocks](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/consistent-spacing-between-blocks.md) | Enforce consistent spacing between test blocks                     | ✅  | 🔧  |     |
| [expect-expect](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/expect-expect.md)                                         | Enforce assertion to be made in a test body                        | ✅  |     |     |
| [max-expects](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/max-expects.md)                                             | Enforces a maximum number assertion calls in a test body           |     |     |     |
| [max-nested-describe](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/max-nested-describe.md)                             | Enforces a maximum depth to nested describe calls                  | ✅  |     |     |
| [missing-playwright-await](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/missing-playwright-await.md)                   | Enforce Playwright APIs to be awaited                              | ✅  | 🔧  |     |
| [no-commented-out-tests](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-commented-out-tests.md)                       | Disallow commented out tests                                       |     |     |     |
| [no-conditional-expect](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-conditional-expect.md)                         | Disallow calling `expect` conditionally                            | ✅  |     |     |
| [no-conditional-in-test](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-conditional-in-test.md)                       | Disallow conditional logic in tests                                | ✅  |     |     |
| [no-duplicate-hooks](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-duplicate-hooks.md)                               | Disallow duplicate setup and teardown hooks                        |     |     |     |
| [no-element-handle](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-element-handle.md)                                 | Disallow usage of element handles                                  | ✅  |     | 💡  |
| [no-eval](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-eval.md)                                                     | Disallow usage of `page.$eval()` and `page.$$eval()`               | ✅  |     |     |
| [no-focused-test](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-focused-test.md)                                     | Disallow usage of `.only` annotation                               | ✅  |     | 💡  |
| [no-force-option](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-force-option.md)                                     | Disallow usage of the `{ force: true }` option                     | ✅  |     |     |
| [no-get-by-title](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-get-by-title.md)                                     | Disallow using `getByTitle()`                                      |     | 🔧  |     |
| [no-hooks](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-hooks.md)                                                   | Disallow setup and teardown hooks                                  |     |     |     |
| [no-nested-step](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-nested-step.md)                                       | Disallow nested `test.step()` methods                              | ✅  |     |     |
| [no-networkidle](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-networkidle.md)                                       | Disallow usage of the `networkidle` option                         | ✅  |     |     |
| [no-nth-methods](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-nth-methods.md)                                       | Disallow usage of `first()`, `last()`, and `nth()` methods         |     |     |     |
| [no-page-pause](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-page-pause.md)                                         | Disallow using `page.pause()`                                      | ✅  |     |     |
| [no-raw-locators](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-raw-locators.md)                                     | Disallow using raw locators                                        |     |     |     |
| [no-restricted-matchers](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-restricted-matchers.md)                       | Disallow specific matchers & modifiers                             |     |     |     |
| [no-skipped-test](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-skipped-test.md)                                     | Disallow usage of the `.skip` annotation                           | ✅  |     | 💡  |
| [no-slowed-test](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-slowed-test.md)                                       | Disallow usage of the `.slow` annotation                           |     |     | 💡  |
| [no-standalone-expect](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-standalone-expect.md)                           | Disallow using expect outside of `test` blocks                     | ✅  |     |     |
| [no-unsafe-references](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-unsafe-references.md)                           | Prevent unsafe variable references in `page.evaluate()`            | ✅  | 🔧  |     |
| [no-unused-locators](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-unused-locators.md)                               | Disallow usage of page locators that are not used                  | ✅  |     |     |
| [no-useless-await](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-useless-await.md)                                   | Disallow unnecessary `await`s for Playwright methods               | ✅  | 🔧  |     |
| [no-useless-not](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-useless-not.md)                                       | Disallow usage of `not` matchers when a specific matcher exists    | ✅  | 🔧  |     |
| [no-wait-for-navigation](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-navigation.md)                       | Disallow usage of `page.waitForNavigation()`                       | ✅  |     | 💡  |
| [no-wait-for-selector](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-selector.md)                           | Disallow usage of `page.waitForSelector()`                         | ✅  |     | 💡  |
| [no-wait-for-timeout](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/no-wait-for-timeout.md)                             | Disallow usage of `page.waitForTimeout()`                          | ✅  |     | 💡  |
| [prefer-comparison-matcher](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-comparison-matcher.md)                 | Suggest using the built-in comparison matchers                     |     | 🔧  |     |
| [prefer-equality-matcher](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-equality-matcher.md)                     | Suggest using the built-in equality matchers                       |     |     | 💡  |
| [prefer-hooks-in-order](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-hooks-in-order.md)                         | Prefer having hooks in a consistent order                          |     |     |     |
| [prefer-hooks-on-top](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-hooks-on-top.md)                             | Suggest having hooks before any test cases                         |     |     |     |
| [prefer-lowercase-title](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-lowercase-title.md)                       | Enforce lowercase test names                                       |     | 🔧  |     |
| [prefer-native-locators](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-native-locators.md)                       | Suggest built-in locators over `page.locator()`                    |     | 🔧  |     |
| [prefer-locator](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-locator.md)                                       | Suggest locators over page methods                                 |     |     |     |
| [prefer-strict-equal](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-strict-equal.md)                             | Suggest using `toStrictEqual()`                                    |     |     | 💡  |
| [prefer-to-be](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-be.md)                                           | Suggest using `toBe()`                                             |     | 🔧  |     |
| [prefer-to-contain](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-contain.md)                                 | Suggest using `toContain()`                                        |     | 🔧  |     |
| [prefer-to-have-count](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-have-count.md)                           | Suggest using `toHaveCount()`                                      |     | 🔧  |     |
| [prefer-to-have-length](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-to-have-length.md)                         | Suggest using `toHaveLength()`                                     |     | 🔧  |     |
| [prefer-web-first-assertions](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/prefer-web-first-assertions.md)             | Suggest using web first assertions                                 | ✅  | 🔧  |     |
| [require-hook](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/require-hook.md)                                           | Require setup and teardown code to be within a hook                |     |     |     |
| [require-soft-assertions](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/require-soft-assertions.md)                     | Require assertions to use `expect.soft()`                          |     | 🔧  |     |
| [require-to-throw-message](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/require-to-throw-message.md)                   | Require a message for `toThrow()`                                  |     |     |     |
| [require-top-level-describe](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/require-top-level-describe.md)               | Require test cases and hooks to be inside a `test.describe` block  |     |     |     |
| [valid-describe-callback](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/valid-describe-callback.md)                     | Enforce valid `describe()` callback                                | ✅  |     |     |
| [valid-expect-in-promise](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/valid-expect-in-promise.md)                     | Require promises that have expectations in their chain to be valid | ✅  |     |     |
| [valid-expect](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/valid-expect.md)                                           | Enforce valid `expect()` usage                                     | ✅  |     |     |
| [valid-title](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/valid-title.md)                                             | Enforce valid titles                                               | ✅  | 🔧  |     |
| [valid-test-tags](https://github.com/playwright-community/eslint-plugin-playwright/tree/main/docs/rules/valid-test-tags.md)                                     | Enforce valid tag format in test blocks                            | ✅  |     |     |
