import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import requireTags from './require-tags.js'

runRuleTester('require-tags', requireTags, {
  invalid: [
    // Test without any tags
    {
      code: "test('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    // Test with options but no tag
    {
      code: "test('my test', { timeout: 5000 }, async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    // test.skip without tags
    {
      code: "test.skip('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    // test.fixme without tags
    {
      code: "test.fixme('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    // test.only without tags
    {
      code: "test.only('my test', async ({ page }) => {})",
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    // Test inside describe without tags (describe has no tags either)
    {
      code: dedent`
        test.describe('my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ data: { title: 'my test' }, messageId: 'missingTag' }],
    },
    // Nested describes - test with no tags and no parent tags
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
  ],
  valid: [
    // Test with tag in options
    {
      code: "test('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    // Test with array of tags
    {
      code: "test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
    },
    // Test with tag in title
    {
      code: "test('@e2e my test', async ({ page }) => {})",
    },
    // Test with multiple tags in title
    {
      code: "test('@e2e @login my test', async ({ page }) => {})",
    },
    // Test with tag at end of title
    {
      code: "test('my test @e2e', async ({ page }) => {})",
    },
    // test.skip with tag
    {
      code: "test.skip('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test.skip('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    // test.fixme with tag
    {
      code: "test.fixme('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test.fixme('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    // test.only with tag
    {
      code: "test.only('@e2e my test', async ({ page }) => {})",
    },
    {
      code: "test.only('my test', { tag: '@e2e' }, async ({ page }) => {})",
    },
    // Test inheriting tag from parent describe (in title)
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
    },
    // Test inheriting tag from parent describe (in options)
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
    },
    // Test inheriting tag from nested parent describe
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
    // Test inheriting tag from inner describe when outer has none
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('@suite inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
    },
    // Test with its own tag ignores parent inheritance check
    {
      code: dedent`
        test.describe('my suite', () => {
          test('@e2e my test', async ({ page }) => {})
        })
      `,
    },
    // describe blocks themselves should not be flagged
    {
      code: "test.describe('my suite', () => {})",
    },
    // step blocks should not be flagged
    {
      code: dedent`
        test('@e2e my test', async ({ page }) => {
          await test.step('my step', async () => {})
        })
      `,
    },
  ],
})
