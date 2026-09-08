# Disallow explicitly returning from tests (`no-test-return-statement`)

Playwright ignores whatever a test body returns. Returning a promise looks like
it makes the test wait for that promise, but it does not — the test finishes
immediately and any failure inside the promise is reported against a later test
or lost entirely. Use `await` instead.

A `return` that isn't returning anything is dead code, since it can only appear
at the end of the body.

## Rule details

This rule reports a `return` statement at the top level of a test body. Returns
nested inside conditionals, loops, or callbacks declared within the test are not
reported, since those are ordinary control flow.

Examples of **incorrect** code for this rule

```js
/* eslint playwright/no-test-return-statement: "error" */

test('foo', async ({ page }) => {
  return page.goto('https://example.com')
})

test('bar', () => {
  return expect(1).toBe(1)
})
```

Examples of **correct** code for this rule

```js
/* eslint playwright/no-test-return-statement: "error" */

test('foo', async ({ page }) => {
  await page.goto('https://example.com')
})

test('bar', () => {
  expect(1).toBe(1)
})

// Early returns inside the body are fine
test('baz', async ({ page, browserName }) => {
  if (browserName === 'webkit') {
    return
  }

  await expect(page.getByRole('button')).toBeVisible()
})
```
