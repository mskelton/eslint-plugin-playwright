import parser from '@typescript-eslint/parser'
import { RuleTester } from 'eslint'
import { describe, it } from 'vitest'

// Override the default `it` and `describe` functions to use `vitest`
RuleTester.it = it
RuleTester.describe = describe
RuleTester.itOnly = it.only

/**
 * @example
 *   import rule from './missing-playwright-await';
 *
 *   runRuleTester('missing-playwright-await', rule, {
 *   invalid: ['expect(page.locator('checkbox')).toBeChecked()'],
 *   valid: ['await expect(page.locator('checkbox')).toBeChecked()'],
 *   });
 */
export function runRuleTester(...args: Parameters<RuleTester['run']>) {
  return new RuleTester({
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  }).run(...args)
}

export function runTSRuleTester(...args: Parameters<RuleTester['run']>) {
  return new RuleTester({
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  }).run(...args)
}

export const test = (input: string) => `test('test', async () => { ${input} })`
