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

Timeouts belong in configuration, where they apply consistently and can be
tuned in one place:

```js
// playwright.config.js
export default defineConfig({
  use: {
    actionTimeout: 10_000,
  },
})
```

If a single test genuinely needs more time, raise the budget for the test with
`test.setTimeout()` or `test.slow()` instead of sprinkling timeouts across the
interactions inside it.

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
