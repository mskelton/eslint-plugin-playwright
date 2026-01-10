## Disallow specific locator methods (`no-restricted-locators`)

This rule bans specific locator methods from being used, and can suggest
alternatives.

## Rule Details

Bans are expressed in the form of an array, where each element can be either:

- A string: the method name to restrict (uses default message)
- An object: `{ type: "methodName", message: "Custom message" }` (optional
  message)

By default, the array is empty, meaning no locator methods are banned.

For example:

```json
{
  "playwright/no-restricted-locators": [
    "error",
    [
      "getByTestId",
      {
        "type": "getByTitle",
        "message": "Prefer getByRole or getByLabel instead"
      }
    ]
  ]
}
```

Examples of **incorrect** code for this rule with the above configuration:

```javascript
test('find button', async () => {
  await page.getByTestId('submit-button')
})

test('find tooltip', async () => {
  await page.getByTitle('Additional info')
})
```

Examples of **correct** code for this rule with the above configuration:

```javascript
test('find button', async () => {
  await page.getByRole('button', { name: 'Submit' })
})

test('find tooltip', async () => {
  await page.getByLabel('Additional info')
})
```

## Options

The rule accepts an array where each element can be:

### String format

A simple string with the method name to restrict:

```json
{
  "playwright/no-restricted-locators": ["error", ["getByTestId", "getByTitle"]]
}
```

### Object format

An object with `type` (required) and optional `message`:

```json
{
  "playwright/no-restricted-locators": [
    "error",
    [
      {
        "type": "getByTestId",
        "message": "Prefer getByRole or getByLabel instead"
      },
      { "type": "getByTitle" }
    ]
  ]
}
```

### Mixed format

You can mix string and object entries in the same array:

```json
{
  "playwright/no-restricted-locators": [
    "error",
    [
      "getByTestId",
      {
        "type": "getByTitle",
        "message": "Prefer getByRole or getByLabel instead"
      }
    ]
  ]
}
```

## Common Locator Methods

Common locator methods that can be restricted:

- `getByTestId` - Find elements by test ID attribute
- `getByTitle` - Find elements by title attribute
- `getByAltText` - Find elements by alt text
- `getByPlaceholder` - Find elements by placeholder text
- `getByLabel` - Find elements by label
- `getByRole` - Find elements by ARIA role
- `getByText` - Find elements by text content

## When to Use This Rule

This rule is useful when:

- Your team wants to discourage certain locator methods (e.g., `getByTestId` for
  accessibility reasons)
- You want to enforce consistent locator strategies across your test suite
- You need to provide custom guidance on which alternatives to use
