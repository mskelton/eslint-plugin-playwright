# Disallow magic numbers as Playwright timeout values (`no-magic-timeouts`)

Playwright's auto-waiting means an explicit `timeout` is an escape hatch, and
inline timeout literals are the most common place a suite quietly rots.

A number like `{ timeout: 5000 }` records no reason. Nobody can tell whether it
was measured, guessed, or bumped in a hurry to get CI green — so nobody dares
lower it, and the only safe edit is to raise it. Because each literal lives at
its own call site, "make the suite less flaky" turns into a hunt through every
spec file, and identical values drift apart until the suite has no coherent
timing policy at all. The tests then take their upper bound from whichever
number happens to be largest, and a real regression that used to fail in two
seconds instead fails in sixty.

Naming the value fixes both halves. `await expect(row).toBeVisible({ timeout:
REPORT_GENERATION_TIMEOUT })` says why the wait exists, and changing the
constant changes every site that shares that reason. Better still, most
timeouts belong in `playwright.config.ts` — as `timeout`, `expect.timeout`,
`use.actionTimeout`, or `use.navigationTimeout` — where they apply suite-wide
and can be overridden per project.

This rule reports numeric timeout values passed inline to a Playwright call. It
deliberately does not report timeouts declared inside `defineConfig()`, since
that is where they are supposed to live.

## Rule details

Examples of **incorrect** code for this rule:

```js
test('example', async ({ page }) => {
  await page.goto('/reports', { timeout: 60000 })
  await page.getByRole('button', { name: 'Generate' }).click({ timeout: 5000 })
  await expect(page.getByText('Ready')).toBeVisible({ timeout: 30 * 1000 })
})

test('slow example', { timeout: 90000 }, async ({ page }) => {
  test.setTimeout(120000)
})
```

Examples of **correct** code for this rule:

```js
const REPORT_GENERATION_TIMEOUT = 30_000

test('example', async ({ page }) => {
  // Rely on the timeouts configured in playwright.config.ts
  await page.goto('/reports')
  await page.getByRole('button', { name: 'Generate' }).click()

  // Or name the value when a specific wait genuinely needs to differ
  await expect(page.getByText('Ready')).toBeVisible({
    timeout: REPORT_GENERATION_TIMEOUT,
  })
})
```

Timeouts in your Playwright config are never reported:

```js
export default defineConfig({
  expect: { timeout: 10_000 },
  timeout: 30_000,
  use: { actionTimeout: 5_000 },
})
```

Neither is an options object that already has a name, since the binding
supplies the missing meaning:

```js
const uploadOptions = { timeout: 120_000 }

test('example', async ({ page }) => {
  await page.getByLabel('File').setInputFiles('big.csv', uploadOptions)
})
```

## Options

### `allow`

An array of numbers that may be used inline. Defaults to `[]`.

Playwright treats `0` as "disable this timeout", which is self-documenting, so
allowing it is a common choice:

```json
{
  "playwright/no-magic-timeouts": ["error", { "allow": [0] }]
}
```

### `properties`

The property names treated as timeouts. Defaults to `["timeout"]`.

Extend it to cover the fixture-level timeout options you set through
`test.use()`:

```json
{
  "playwright/no-magic-timeouts": [
    "error",
    { "properties": ["timeout", "actionTimeout", "navigationTimeout"] }
  ]
}
```
