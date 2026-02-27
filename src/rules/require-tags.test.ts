import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import requireTags from './require-tags.js'

runRuleTester('require-tags', requireTags, {
  invalid: [
    {
      code: "test('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
      name: 'Test without any tags',
    },
    {
      code: "test('my test', { timeout: 5000 }, async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
      name: 'Test with options but no tag',
    },
    {
      code: "test.skip('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
      name: 'test.skip without tags',
    },
    {
      code: "test.fixme('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
      name: 'test.fixme without tags',
    },
    {
      code: "test.only('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
      name: 'test.only without tags',
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
      name: 'Test inside describe without tags (describe has no tags either)',
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
      name: 'Nested describes - test with no tags and no parent tags',
    },
    {
      code: "it('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTag' }],
      name: 'globalAliases: it should require tags',
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    {
      code: "test('my test', { tag: '@e2e' }, async ({ page }) => {})",
      name: 'Test with tag in options',
    },
    {
      code: 'test(`@e2e my test`, async ({ page }) => {})',
      name: 'Template literal title with tag is recognized',
    },
    {
      code: "test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
    },
    {
      code: "test('@e2e my test', async ({ page }) => {})",
      name: 'Test with tag in title',
    },
    {
      code: "test('@e2e @login my test', async ({ page }) => {})",
      name: 'Test with multiple tags in title',
    },
    {
      code: "test('my test @e2e', async ({ page }) => {})",
      name: 'Test with tag at end of title',
    },
    {
      code: "test.skip('@e2e my test', async ({ page }) => {})",
      name: 'test.skip with tag',
    },
    {
      code: "test.skip('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    {
      code: "test.fixme('@e2e my test', async ({ page }) => {})",
      name: 'test.fixme with tag',
    },
    {
      code: "test.fixme('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    {
      code: "test.only('@e2e my test', async ({ page }) => {})",
      name: 'test.only with tag',
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
      name: 'Test inheriting tag from parent describe (in title)',
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      name: 'Test inheriting tag from parent describe (in options)',
    },
    {
      code: dedent`
        test.describe('@suite outer', () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      name: 'Test inheriting tag from nested parent describe',
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
      name: 'Test inheriting tag from inner describe when outer has none',
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('@e2e my test', async ({ page }) => {})
        })
      `,
      name: 'Test with its own tag ignores parent inheritance check',
    },
    {
      code: "test.describe('my suite', () => {})",
      name: 'describe blocks themselves should not be flagged',
    },
    {
      code: dedent`
        test('@e2e my test', async ({ page }) => {
          await test.step('my step', async () => {})
        })
      `,
      name: 'step blocks should not be flagged',
    },
  ],
})
