import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './no-force-option.js'

const messageId = 'noForceOption'

runRuleTester('no-force-option', rule, {
  invalid: [
    {
      code: test('await page.locator("check").check({ force: true })'),
      errors: [{ column: 64, endColumn: 75, line: 1, messageId }],
    },
    {
      code: test('await page.locator("check").uncheck({ ["force"]: true })'),
      errors: [{ column: 66, endColumn: 81, line: 1, messageId }],
    },
    {
      code: test('await page.locator("button").click({ [`force`]: true })'),
      errors: [{ column: 65, endColumn: 80, line: 1, messageId }],
    },
    {
      code: test(`
        const button = page["locator"]("button")
        await button.click({ force: true })
      `),
      errors: [{ column: 30, endColumn: 41, endLine: 3, line: 3, messageId }],
    },
    {
      code: test('await page[`locator`]("button").locator("btn").click({ force: true })'),
      errors: [{ column: 83, endColumn: 94, line: 1, messageId }],
    },
    {
      code: test('await page.locator("button").dblclick({ force: true })'),
      errors: [{ column: 68, endColumn: 79, line: 1, messageId }],
    },
    {
      code: test('await page.locator("input").dragTo({ force: true })'),
      errors: [{ column: 65, endColumn: 76, line: 1, messageId }],
    },
    {
      code: test('await page.locator("input").fill("test", { force: true })'),
      errors: [{ column: 71, endColumn: 82, line: 1, messageId }],
    },
    {
      code: test('await page[`locator`]("input").fill("test", { ["force"]: true })'),
      errors: [{ column: 74, endColumn: 89, line: 1, messageId }],
    },
    {
      code: test('await page["locator"]("input").fill("test", { [`force`]: true })'),
      errors: [{ column: 74, endColumn: 89, line: 1, messageId }],
    },
    {
      code: test('await page.locator("elm").hover({ force: true })'),
      errors: [{ column: 62, endColumn: 73, line: 1, messageId }],
    },
    {
      code: test('await page.locator("select").selectOption({ label: "Blue" }, { force: true })'),
      errors: [{ column: 91, endColumn: 102, line: 1, messageId }],
    },
    {
      code: test('await page.locator("select").selectText({ force: true })'),
      errors: [{ column: 70, endColumn: 81, line: 1, messageId }],
    },
    {
      code: test('await page.locator("checkbox").setChecked(true, { force: true })'),
      errors: [{ column: 78, endColumn: 89, line: 1, messageId }],
    },
    {
      code: test('await page.locator("button").tap({ force: true })'),
      errors: [{ column: 63, endColumn: 74, line: 1, messageId }],
    },
  ],
  valid: [
    test("await page.locator('check').check()"),
    test("await page.locator('check').uncheck()"),
    test("await page.locator('button').click()"),
    test("await page.locator('button').locator('btn').click()"),
    test("await page.locator('button').click({ delay: 500, noWaitAfter: true })"),
    test("await page.locator('button').dblclick()"),
    test("await page.locator('input').dragTo()"),
    test("await page.locator('input').fill('something', { timeout: 1000 })"),
    test("await page.locator('elm').hover()"),
    test("await page.locator('select').selectOption({ label: 'Blue' })"),
    test("await page.locator('select').selectText()"),
    test("await page.locator('checkbox').setChecked(true)"),
    test("await page.locator('button').tap()"),
    test('doSomething({ force: true })'),
    test('await doSomething({ ["force"]: true })'),
    test('await doSomething({ [`force`]: true })'),
  ],
})
