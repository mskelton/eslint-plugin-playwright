# Enforce Playwright APIs to be awaited (`missing-playwright-await`)

Identify false positives when async Playwright APIs are not properly awaited.

## Rule Details

Example of **incorrect** code for this rule:

```javascript
expect(page).toMatchText('text')
expect.poll(() => foo).toBe(true)

test.step('clicks the button', async () => {
  await page.click('button')
})
```

Example of **correct** code for this rule:

```javascript
await expect(page).toMatchText('text')
await expect.poll(() => foo).toBe(true)

await test.step('clicks the button', async () => {
  await page.click('button')
})
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
