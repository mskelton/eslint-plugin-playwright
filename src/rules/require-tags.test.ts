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

const bothFormats = [{ allowedFormat: 'both' }]
const optionsFormat = [{ allowedFormat: 'options' }]
const titleFormat = [{ allowedFormat: 'title' }]
const itAlias = { playwright: { globalAliases: { test: ['it'] } } }

runRuleTester('require-tags allowedFormat both', requireTags, {
  invalid: [
    {
      code: "test('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTag' }],
      options: bothFormats,
    },
    {
      code: "test('my test', { timeout: 5000 }, async ({ page }) => {})",
      errors: [{ messageId: 'missingTag' }],
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'missingTag' }],
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      errors: [{ messageId: 'missingTag' }],
      options: bothFormats,
    },
    {
      code: "test.skip('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTag' }],
      options: bothFormats,
    },
  ],
  valid: [
    {
      code: "test('@e2e my test', async ({ page }) => {})",
      options: bothFormats,
    },
    {
      code: "test('my test @e2e', async ({ page }) => {})",
      options: bothFormats,
    },
    {
      code: "test('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: bothFormats,
    },
    {
      code: "test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
      options: bothFormats,
    },
    {
      code: "test('@e2e my test', { tag: ['@slow', '@a11y'] }, async ({ page }) => {})",
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('@suite outer', () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      options: bothFormats,
    },
    {
      code: dedent`
        test.describe('outer', { tag: '@e2e' }, () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      options: bothFormats,
    },
    {
      code: "test.skip('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: bothFormats,
    },
    {
      code: "test.describe('my suite', () => {})",
      options: bothFormats,
    },
  ],
})

runRuleTester('require-tags allowedFormat title', requireTags, {
  invalid: [
    {
      code: "test('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test('my test', { timeout: 5000 }, async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: 'test(`my test`, async ({ page }) => {})',
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test('my test', { tag: '@e2e' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test('@e2e my test', { tag: '@slow' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test('@e2e @login my test', { tag: ['@slow', '@a11y'] }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test.skip('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test.fixme('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test.only('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test.fail('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test.slow('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test.skip('my test', { tag: '@e2e' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test.fixme('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test.only('my test', { tag: '@e2e' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test.fail('my test', { tag: ['@e2e', '@a11y'] }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test.slow('@e2e my test', { tag: '@slow' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('outer', { tag: '@e2e' }, () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite outer', () => {
          test.describe('inner', { tag: '@e2e' }, () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', { tag: '@e2e' }, async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('@slow my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('one', async ({ page }) => {})
          test('two', async ({ page }) => {})
        })
      `,
      errors: [
        { messageId: 'disallowedOptionsTag' },
        { messageId: 'missingTitleTag' },
        { messageId: 'missingTitleTag' },
      ],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('@e2e one', async ({ page }) => {})
          test('two', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "test.describe('my suite', { tag: '@e2e' }, () => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: "test.describe('my suite', { tag: ['@e2e', '@login'] }, () => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.skip('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.fixme('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.only('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
    },
    {
      code: "it('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingTitleTag' }],
      options: titleFormat,
      settings: itAlias,
    },
    {
      code: "it('my test', { tag: '@e2e' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedOptionsTag' }],
      options: titleFormat,
      settings: itAlias,
    },
    {
      code: dedent`
        it.describe('my suite', { tag: ['@e2e', '@login'] }, () => {
          it('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedOptionsTag' }, { messageId: 'missingTitleTag' }],
      options: titleFormat,
      settings: itAlias,
    },
  ],
  valid: [
    {
      code: "test('@e2e my test', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: "test('my test @e2e', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: "test('@e2e @login my test', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: 'test(`@e2e my test`, async ({ page }) => {})',
      options: titleFormat,
    },
    {
      code: "test.skip('@e2e my test', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: "test.fixme('@e2e my test', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: "test.only('@e2e my test', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: "test.fail('my test @e2e', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: "test.slow('@e2e @login my test', async ({ page }) => {})",
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite outer', () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('@suite inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('@e2e my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.skip('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.fixme('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.only('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.serial('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe.parallel('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test.describe.configure({ mode: 'parallel' })
          test('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: "test.describe('my suite', () => {})",
      options: titleFormat,
    },
    {
      code: dedent`
        test('@e2e my test', async ({ page }) => {
          await test.step('my step', async () => {})
          await test.step('my step', { tag: '@slow' }, async () => {})
        })
      `,
      options: titleFormat,
    },
    {
      code: "it('@e2e my test', async ({ page }) => {})",
      options: titleFormat,
      settings: itAlias,
    },
    {
      code: dedent`
        it.describe('@suite my suite', () => {
          it('my test', async ({ page }) => {})
        })
      `,
      options: titleFormat,
      settings: itAlias,
    },
  ],
})

runRuleTester('require-tags allowedFormat options', requireTags, {
  invalid: [
    {
      code: "test('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test('my test', { timeout: 5000 }, async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: 'test(`my test`, async ({ page }) => {})',
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test('@e2e my test', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test('my test @e2e', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test('@e2e @login my test', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: 'test(`@e2e my test`, async ({ page }) => {})',
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test('@e2e my test', { tag: '@slow' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test('@e2e @login my test', { tag: ['@slow', '@a11y'] }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test.skip('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test.fixme('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test.only('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test.fail('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test.slow('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test.skip('@e2e my test', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test.fixme('my test @e2e', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test.only('@e2e @login my test', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test.fail('@e2e my test', { tag: '@slow' }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: "test.slow('@e2e my test', { tag: ['@slow', '@a11y'] }, async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }, { messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('@suite inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }, { messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('outer', { tag: '@e2e' }, () => {
          test.describe('@suite inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('@slow my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test @slow', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('@suite my suite', () => {
          test('one', async ({ page }) => {})
          test('two', async ({ page }) => {})
        })
      `,
      errors: [
        { messageId: 'disallowedTitleTag' },
        { messageId: 'missingOptionsTag' },
        { messageId: 'missingOptionsTag' },
      ],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('one', { tag: '@e2e' }, async ({ page }) => {})
          test('two', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "test.describe('@suite my suite', () => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.skip('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }, { messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.fixme('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }, { messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.only('@suite my suite', () => {
          test('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }, { messageId: 'missingOptionsTag' }],
      options: optionsFormat,
    },
    {
      code: "it('my test', async ({ page }) => {})",
      errors: [{ messageId: 'missingOptionsTag' }],
      options: optionsFormat,
      settings: itAlias,
    },
    {
      code: "it('@e2e my test', async ({ page }) => {})",
      errors: [{ messageId: 'disallowedTitleTag' }],
      options: optionsFormat,
      settings: itAlias,
    },
    {
      code: dedent`
        it.describe('@suite my suite', () => {
          it('my test', async ({ page }) => {})
        })
      `,
      errors: [{ messageId: 'disallowedTitleTag' }, { messageId: 'missingOptionsTag' }],
      options: optionsFormat,
      settings: itAlias,
    },
  ],
  valid: [
    {
      code: "test('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test('my test', { tag: '@e2e', timeout: 5000 }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test.skip('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test.fixme('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test.only('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test.fail('my test', { tag: ['@e2e', '@a11y'] }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: "test.slow('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('outer', { tag: '@e2e' }, () => {
          test.describe('inner', () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('outer', () => {
          test.describe('inner', { tag: ['@e2e', '@login'] }, () => {
            test('my test', async ({ page }) => {})
          })
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', () => {
          test('my test', { tag: '@e2e' }, async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.skip('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.fixme('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.only('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.serial('my suite', { tag: '@e2e' }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe.parallel('my suite', { tag: ['@e2e', '@login'] }, () => {
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: dedent`
        test.describe('my suite', { tag: '@e2e' }, () => {
          test.describe.configure({ mode: 'parallel' })
          test('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: "test.describe('my suite', () => {})",
      options: optionsFormat,
    },
    {
      code: dedent`
        test('my test', { tag: '@e2e' }, async ({ page }) => {
          await test.step('@slow my step', async () => {})
          await test.step('my step', { tag: '@slow' }, async () => {})
        })
      `,
      options: optionsFormat,
    },
    {
      code: "it('my test', { tag: '@e2e' }, async ({ page }) => {})",
      options: optionsFormat,
      settings: itAlias,
    },
    {
      code: "it('my test', { tag: ['@e2e', '@login'] }, async ({ page }) => {})",
      options: optionsFormat,
      settings: itAlias,
    },
    {
      code: dedent`
        it.describe('my suite', { tag: '@e2e' }, () => {
          it('my test', async ({ page }) => {})
        })
      `,
      options: optionsFormat,
      settings: itAlias,
    },
  ],
})
