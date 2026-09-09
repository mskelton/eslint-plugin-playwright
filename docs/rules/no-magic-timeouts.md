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

The rule is not restricted to spec files. Page objects and helper modules are
where a mature suite tends to concentrate its waits, so they are checked too.

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

## Adopting this rule on an existing suite

Turned on at full strength, this rule will report every inline timeout in a
mature suite at once — potentially hundreds. That is not a useful first day, and
`allow` does not help, because the problem values are all different.

Two staged paths work better, and they compose:

**Start with the repeated values.** The real harm is rarely that one number is
inline; it is that the same number appears at five sites for three different
reasons and then drifts apart. `minOccurrences` targets exactly that, and gives
a much better signal-to-noise ratio on a large suite:

```json
{
  "playwright/no-magic-timeouts": ["warn", { "minOccurrences": 2 }]
}
```

Note the limit: ESLint sees one file at a time, so `minOccurrences` counts
repetitions _within a file_. It catches the page object that waits `15_000`
three times; it will not catch the same `15_000` spread across four different
page objects. For that, the second path:

**Ratchet by scope.** Enable the rule at `error` for new and changed files only
— via `lint-staged`, or an `overrides` block scoped to the directories you have
already cleaned — and widen the glob as you go. This keeps the number of
existing reports at zero while making it impossible to add new ones.

Once the suite is clean, drop `minOccurrences` and raise the level.

## Options

### `allow`

An array of numbers that may be used inline. Defaults to `[]`.

Be deliberate about `0`. It is tempting to allow it, since Playwright treats it
as "disable this timeout" and it is therefore self-documenting. But
[`no-action-timeout`](./no-action-timeout.md) singles out `{ timeout: 0 }` as
the worst case precisely because it removes the bound entirely and lets a broken
test hang until the run is killed. If you enable both rules, allowing `0` here
means one rule blesses what the other condemns. The default of `[]` is the
consistent choice.

### `minOccurrences`

The number of times a value must appear in a file before it is reported.
Defaults to `1`, which reports every inline timeout.

Set it to `2` or more to report only values that repeat — see
[Adopting this rule on an existing suite](#adopting-this-rule-on-an-existing-suite)
above.

```json
{
  "playwright/no-magic-timeouts": ["warn", { "minOccurrences": 2 }]
}
```

With the above configuration, this is **correct**, because each value appears
once:

```js
await page.getByTestId('spinner').waitFor({ timeout: 15_000 })
await page.getByTestId('total').waitFor({ timeout: 45_000 })
```

...and this is **incorrect**, with both sites reported:

```js
await page.getByTestId('spinner').waitFor({ timeout: 15_000 })
await page.getByTestId('total').waitFor({ timeout: 15_000 })
```

Values are grouped by what they evaluate to, so `15_000` and `15 * 1000` count
as the same timeout. Values excluded by `allow` are never counted.

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
