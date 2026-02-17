## Disallow specific roles in `getByRole()` (`no-restricted-roles`)

This rule bans specific ARIA roles from being used with `getByRole()`, and can
suggest alternatives.

## Rule Details

Bans are expressed in the form of an array, where each element can be either:

- A string: the role name to restrict (uses default message)
- An object: `{ role: "roleName", message: "Custom message" }` (optional message)

By default, the array is empty, meaning no roles are banned.

For example:

```json
{
  "playwright/no-restricted-roles": [
    "error",
    [
      "progressbar",
      {
        "role": "alert",
        "message": "Prefer asserting on specific content instead"
      }
    ]
  ]
}
```

Examples of **incorrect** code for this rule with the above configuration:

```javascript
test('wait for loading', async () => {
  await expect(page.getByRole('progressbar')).toBeHidden()
})

test('check alert', async () => {
  await expect(page.getByRole('alert')).toBeVisible()
})
```

Examples of **correct** code for this rule with the above configuration:

```javascript
test('wait for loading', async () => {
  // Assert on the actual content that should appear after loading
  await expect(page.getByRole('table')).toBeVisible()
})

test('check alert', async () => {
  // Assert on the specific alert text
  await expect(page.getByText('Operation completed')).toBeVisible()
})
```
