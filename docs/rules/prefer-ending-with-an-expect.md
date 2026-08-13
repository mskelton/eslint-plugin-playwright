# Prefer having the last statement in a test be an assertion (`prefer-ending-with-an-expect`)

A test that ends with an action rather than an assertion is often unfinished —
the setup and interaction were written, but the check that makes the test
meaningful was never added. Ending on an assertion also makes it obvious what
each test is actually verifying.

## Rule details

This rule reports a test whose body does not end with an assertion. A trailing
`test.step` counts, as long as that step itself ends with an assertion.

Examples of **incorrect** code for this rule

```js
/* eslint playwright/prefer-ending-with-an-expect: "error" */

test('foo', async ({ page }) => {
  await expect(page.getByRole('button')).toBeVisible()
  await page.getByRole('button').click()
})

test('bar', async ({ page }) => {
  await page.goto('https://example.com')
})
```

Examples of **correct** code for this rule

```js
/* eslint playwright/prefer-ending-with-an-expect: "error" */

test('foo', async ({ page }) => {
  await page.getByRole('button').click()
  await expect(page.getByRole('alert')).toBeVisible()
})

test('bar', async ({ page }) => {
  await test.step('submit the form', async () => {
    await page.getByRole('button').click()
    await expect(page.getByRole('alert')).toBeVisible()
  })
})
```

## Options

```json
{
  "playwright/prefer-ending-with-an-expect": [
    "error",
    {
      "assertFunctionNames": ["assertCustomCondition"],
      "assertFunctionPatterns": ["^assert"]
    }
  ]
}
```

### `assertFunctionNames`

An array of function names that should be treated as assertions in addition to
`expect`. Defaults to `[]`.

```js
/* eslint playwright/prefer-ending-with-an-expect: ["error", { "assertFunctionNames": ["assertCustomCondition"] }] */

test('foo', async ({ page }) => {
  await page.goto('https://example.com')
  await assertCustomCondition(page)
})
```

### `assertFunctionPatterns`

An array of regular expression patterns matching function names that should be
treated as assertions in addition to `expect`. Defaults to `[]`.

```js
/* eslint playwright/prefer-ending-with-an-expect: ["error", { "assertFunctionPatterns": ["^assert"] }] */

test('foo', async ({ page }) => {
  await page.goto('https://example.com')
  await assertCustomCondition(page)
})
```
