# Enforce Playwright APIs to be awaited (`missing-playwright-await`)

Identify false positives when async Playwright APIs are not properly awaited.

## Rule Details

This rule checks that async Playwright APIs are properly awaited or returned. This includes:

- Async matchers like `toBeVisible`, `toHaveText`, etc.
- `expect.poll` matchers
- `test.step` calls
- `waitFor*` page methods (`waitForResponse`, `waitForRequest`, etc.)

Example of **incorrect** code for this rule:

```javascript
expect(page).toMatchText('text')
expect.poll(() => foo).toBe(true)

test.step('clicks the button', async () => {
  await page.click('button')
})

page.waitForResponse('https://example.com/api')
```

Example of **correct** code for this rule:

```javascript
await expect(page).toMatchText('text')
await expect.poll(() => foo).toBe(true)

await test.step('clicks the button', async () => {
  await page.click('button')
})

await page.waitForResponse('https://example.com/api')

const responsePromise = page.waitForResponse('https://example.com/api')
await page.locator('button').click()
await responsePromise

await Promise.all([
  page.locator('button').click(),
  page.waitForResponse('https://example.com/api'),
])
```

## Options

The rule accepts a non-required option which can be used to specify custom
matchers which this rule should also warn about. This is useful when creating
your own async `expect` matchers.

```json
{
  "playwright/missing-playwright-await": ["error", { "customMatchers": ["toBeCustomThing"] }]
}
```
