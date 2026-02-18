# Require a timeout option for `toPass()` (`require-to-pass-timeout`)

The `toPass()` assertion is used to retry a function until it passes. However,
by default it has a timeout of 0, which means it will retry indefinitely until
the test's overall timeout is reached. This can lead to tests running much
longer than expected before failing.

From the [Playwright documentation](https://playwright.dev/docs/test-assertions#expect-to-pass):

> By default, `.toPass()` has a timeout of 0 and does not respect the custom
> expect timeout.

Requiring a timeout ensures that the assertion fails quickly if the expected
condition is not met.

## Rule details

This rule triggers a warning if `toPass()` is used without a `timeout` option.

The following patterns are considered warnings:

```js
test('retrying', async () => {
  await expect(async () => {
    const response = await fetch('https://example.com')
    expect(response.status).toBe(200)
  }).toPass()

  await expect(async () => {
    await page.click('button')
  }).toPass({})

  await expect(async () => {
    await page.click('button')
  }).toPass({ intervals: [1000, 2000] })
})
```

The following patterns are **not** considered warnings:

```js
test('retrying', async () => {
  await expect(async () => {
    const response = await fetch('https://example.com')
    expect(response.status).toBe(200)
  }).toPass({ timeout: 10000 })

  await expect(async () => {
    await page.click('button')
  }).toPass({ timeout: 5000, intervals: [1000, 2000] })
})
```
