import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-template-literal-title.js'

runRuleTester('no-template-literal-title', rule, {
  invalid: [
    {
      code: 'test(`login as ${user.role}`, async ({ page }) => {})',
      errors: [{ column: 6, data: { method: 'test' }, line: 1, messageId: 'interpolatedTitle' }],
    },
    {
      code: 'test.only(`login as ${role}`, async ({ page }) => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
    },
    {
      code: 'test.skip(`login as ${role}`, async ({ page }) => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
    },
    {
      code: 'test.fixme(`login as ${role}`, async ({ page }) => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
    },
    {
      code: 'test.describe(`${env.NAME} checkout`, () => {})',
      errors: [{ data: { method: 'test.describe' }, messageId: 'interpolatedTitle' }],
    },
    {
      code: 'test.describe.only(`${env.NAME} checkout`, () => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
    },
    {
      code: dedent`
        test('checkout', async ({ page }) => {
          await test.step(\`upload \${file.name}\`, async () => {})
        })
      `,
      errors: [{ data: { method: 'test.step' }, messageId: 'interpolatedTitle' }],
    },
    // Static template literals are fixable
    {
      code: 'test(`checkout completes`, async ({ page }) => {})',
      errors: [
        { column: 6, data: { method: 'test' }, line: 1, messageId: 'staticTemplateLiteral' },
      ],
      output: "test('checkout completes', async ({ page }) => {})",
    },
    {
      code: 'test.describe(`checkout`, () => {})',
      errors: [{ messageId: 'staticTemplateLiteral' }],
      output: "test.describe('checkout', () => {})",
    },
    {
      code: dedent`
        test('checkout', async ({ page }) => {
          await test.step(\`upload the invoice\`, async () => {})
        })
      `,
      errors: [{ messageId: 'staticTemplateLiteral' }],
      output: dedent`
        test('checkout', async ({ page }) => {
          await test.step('upload the invoice', async () => {})
        })
      `,
    },
    // Quotes and backslashes in the title are escaped by the fixer
    {
      code: 'test(`it\\`s fine`, async ({ page }) => {})',
      errors: [{ messageId: 'staticTemplateLiteral' }],
      output: "test('it`s fine', async ({ page }) => {})",
    },
    {
      code: "test(`user's cart`, async ({ page }) => {})",
      errors: [{ messageId: 'staticTemplateLiteral' }],
      output: "test('user\\'s cart', async ({ page }) => {})",
    },
    {
      code: 'test(`path C:\\\\temp`, async ({ page }) => {})',
      errors: [{ messageId: 'staticTemplateLiteral' }],
      output: "test('path C:\\\\temp', async ({ page }) => {})",
    },
    // Multiline titles are reported but not fixed
    {
      code: 'test(`line one\nline two`, async ({ page }) => {})',
      errors: [{ messageId: 'staticTemplateLiteral' }],
    },
    // Options
    {
      code: 'test.describe(`${env.NAME} checkout`, () => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
      options: [{ ignore: ['test'] }],
    },
    {
      code: 'test(`login as ${role}`, async ({ page }) => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
      options: [{ ignore: ['test.describe', 'test.step'] }],
    },
    // Global alias
    {
      code: 'it(`login as ${role}`, async ({ page }) => {})',
      errors: [{ messageId: 'interpolatedTitle' }],
      settings: { playwright: { globalAliases: { test: ['it'] } } },
    },
  ],
  valid: [
    "test('login as admin', async ({ page }) => {})",
    "test.describe('checkout', () => {})",
    "test.describe.parallel('checkout', () => {})",
    "test('checkout', async ({ page }) => { await test.step('upload the invoice', async () => {}) })",
    // Anonymous describe
    'test.describe(() => {})',
    // String concatenation is not a template literal
    "test('login as ' + role, async ({ page }) => {})",
    // Template literals elsewhere are untouched
    "test('checkout', async ({ page }) => { await page.locator(`#${id}`).click() })",
    'test.describe.configure({ mode: `parallel` })',
    // Not a Playwright call
    'describeSomething(`${name} thing`, () => {})',
    'foo(`${name} thing`, () => {})',
    // Options
    {
      code: 'test(`login as ${role}`, async ({ page }) => {})',
      options: [{ ignore: ['test'] }],
    },
    {
      code: 'test(`login as admin`, async ({ page }) => {})',
      options: [{ ignore: ['test'] }],
    },
    {
      code: 'test.describe(`${env.NAME} checkout`, () => {})',
      options: [{ ignore: ['test.describe'] }],
    },
    {
      code: "test('checkout', async ({ page }) => { await test.step(`upload ${file.name}`, async () => {}) })",
      options: [{ ignore: ['test.step'] }],
    },
    // Global alias not configured
    'it(`login as ${role}`, async ({ page }) => {})',
  ],
})
