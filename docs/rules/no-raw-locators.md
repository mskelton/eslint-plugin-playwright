## Disallow using raw locators (`no-raw-locators`)

Prefer using user-facing locators over raw locators to make tests more robust.

Check out the [Playwright documentation](https://playwright.dev/docs/locators)
for more information.

## Rule Details

Example of **incorrect** code for this rule:

```javascript
await page.locator('button').click()
```

Example of **correct** code for this rule:

```javascript
await page.getByRole('button').click()
```

```javascript
await page.getByRole('button', {
  name: 'Submit',
})
```

## Options

```json
{
  "playwright/no-raw-locators": [
    "error",
    {
      "allowed": ["iframe", "[aria-busy='false']"]
    }
  ]
}
```

### `allowed`

An array of raw locators that are allowed. This helps for locators such as
`iframe` which does not have a ARIA role that you can select using `getByRole`.

By default, no raw locators are allowed (the equivalent of `{ "ignore": [] }`).

A template literal that contains an interpolation is always reported, since only
part of its value is known statically and it cannot be compared against this
option.

Example of **incorrect** code for the `{ "allowed": ["[aria-busy=false]"] }`
option:

```javascript
page.getByRole('navigation').and(page.locator('iframe'))
```

Example of **correct** code for the `{ "allowed": ["[aria-busy=false]"] }`
option:

```javascript
page.getByRole('navigation').and(page.locator('[aria-busy="false"]'))
```
