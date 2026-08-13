# Disallow the `timeout` option on actions (`no-action-timeout`)

Playwright actions such as `click()`, `fill()`, and `check()` accept a `timeout`
option which overrides the configured action timeout for that single call.

Per-call timeouts are almost always a workaround for a flaky or slow
application rather than a property of the interaction itself. They hide real
problems (a slow API call, a missing loading state, an unstable element), they
drift out of sync with each other as the suite grows, and they make the actual
timeout budget of a test impossible to reason about. `{ timeout: 0 }` is worse
still — it disables the timeout entirely, so a broken test hangs until the whole
run is killed.

## Fixing a violation

Reach for these in order — the first one resolves most reports.

### 1. Delete it

In practice the most common legitimate-looking case is already redundant: a
`waitFor()` or a web-first assertion directly above has established the very
condition the timeout was guarding, so the override does nothing but add a
second, conflicting budget.

```javascript
// Before
await page.getByRole('alert').waitFor({ state: 'visible' })
await page.getByRole('button', { name: 'Retry' }).click({ timeout: 15_000 })

// After — the wait above already proved the UI is ready
await page.getByRole('alert').waitFor({ state: 'visible' })
await page.getByRole('button', { name: 'Retry' }).click()
```

Check for this before doing anything else. If the condition is already
established, the timeout is not protecting the test from anything.

### 2. Give the test more room

If a single test genuinely needs more time, raise the budget for the whole test
with `test.setTimeout()` or `test.slow()` rather than sprinkling timeouts across
the interactions inside it. This keeps the budget in one visible place instead
of distributing it across a chain of calls.

### 3. Raise `actionTimeout`, carefully

```js
// playwright.config.js
export default defineConfig({
  use: {
    actionTimeout: 10_000,
  },
})
```

This is a real option, but it is a bigger hammer than it looks: `actionTimeout`
caps **every** action in the suite, so raising it to accommodate one slow
interaction slows down the failure of every other one. Prefer it only when the
new value is right for the suite as a whole, not as a place to put a number that
belonged to a single call.

## A note on deliberately short timeouts

This rule reports any `timeout` value, but the argument above is strongest for
values _longer_ than the configured default. A deliberately short timeout is the
opposite problem — it makes a test stricter and fail faster, which is a
legitimate pattern when probing for optional UI:

```javascript
// Dismiss the cookie banner if it shows up quickly, otherwise move on
await page.getByRole('button', { name: 'Accept' }).click({ timeout: 1000 })
```

A rule cannot know statically whether a literal exceeds the configured default,
so there is no option to separate the two cases. The alternative that keeps the
intent explicit is to wait, then act:

```javascript
const accept = page.getByRole('button', { name: 'Accept' })

if (await accept.isVisible()) {
  await accept.click()
}
```

If your suite relies on the short-timeout form deliberately, use `allow` to
exempt the specific methods involved rather than disabling the rule.

## Rule details

Examples of **incorrect** code for this rule:

```javascript
await page.locator('button').click({ timeout: 5000 })
await page.locator('input').fill('hello', { timeout: 5000 })
await page.locator('checkbox').check({ force: true, timeout: 1000 })
await page.locator('button').dblclick({ timeout: 0 })
```

Examples of **correct** code for this rule:

```javascript
await page.locator('button').click()
await page.locator('input').fill('hello')
await page.locator('checkbox').check({ force: true })

// Waits, navigations, and assertions are not actions and are not reported
await page.goto('https://example.com', { timeout: 30_000 })
await expect(page.locator('button')).toBeVisible({ timeout: 10_000 })
```

The following methods are checked:

`blur`, `check`, `clear`, `click`, `dblclick`, `dispatchEvent`, `dragAndDrop`,
`dragTo`, `fill`, `focus`, `hover`, `press`, `pressSequentially`,
`selectOption`, `selectText`, `setChecked`, `setInputFiles`, `tap`, `type`,
`uncheck`

## Options

### `allow`

An array of action method names which are allowed to specify a `timeout`
option. Defaults to `[]`.

```json
{
  "playwright/no-action-timeout": ["error", { "allow": ["setInputFiles"] }]
}
```

With the above configuration, the following is **correct**:

```javascript
await page.locator('input[type=file]').setInputFiles('huge.zip', { timeout: 60_000 })
```
