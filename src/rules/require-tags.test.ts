import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import requireTags from './require-tags.js'

runRuleTester('require-tags', requireTags, {
  invalid: [
    {
      code: "test('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: "test('my test', { timeout: 5000 }, async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: "test.skip('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: "test.fixme('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: "test.only('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    {
      code: 'test(`my test`, async ({ page }) => {})',
      errors: [{ messageId: 'missingTag' }],
    },
    {
      code: "it('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTag' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    {
      code: "test('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    {
      code: 'test(`@e2e my test`, async ({ page }) => {})',
    },
    {
      code: "test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
    },
    {
      code: "test('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test('@e2e @login my test', async ({ page }) => {})",
    },
    {
      code: "test('my test @e2e', async ({ page }) => {})",
    },
    {
      code: "test.skip('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test.skip('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    {
      code: "test.fixme('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test.fixme('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    {
      code: "test.only('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test.only('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
    },
    {
      code: dedent`
        test.describe('@suite outer', () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
    },
    {
      code: dedent`
        test.describe('outer', { tag: '@e2e' }, () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
    },
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('@suite inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('@e2e my test', async ({ page }) => {})
        })
      `,
    },
    {
      code: "test.describe('my suite', () => {})",
    },
    {
      code: dedent`
        test('@e2e my test', async ({ page }) => {
          await test.step('my step', async () => {})
        })
      `,
    },
  ],
})
