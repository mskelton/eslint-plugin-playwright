# Suggest using native Playwright locators (`prefer-native-locators`)

Playwright has built-in locators for common query selectors such as finding
elements by placeholder text, ARIA role, accessible name, and more. This rule
suggests using these native locators instead of using `page.locator()` with an
equivalent selector.

In some cases this can be more robust too, such as finding elements by ARIA role
or accessible name, because some elements have implicit roles, and there are
multiple ways to specify accessible names.

## Rule details

Examples of **incorrect** code for this rule:

```javascript
page.locator('[aria-label="View more"]')
page.locator('[role="button"]')
page.locator('[placeholder="Enter some text..."]')
page.locator('[alt="Playwright logo"]')
page.locator('[title="Additional context"]')
page.locator('[data-testid="password-input"]')
```

Examples of **correct** code for this rule:

```javascript
page.getByLabel('View more')
page.getByRole('Button')
page.getByPlaceholder('Enter some text...')
page.getByAltText('Playwright logo')
page.getByTestId('password-input')
page.getByTitle('Additional context')
```

Only a selector that is exactly one attribute selector is reported. A selector
that also carries a descendant, a combinator or a second attribute is left
alone, because no single native locator matches the same set of elements:

```javascript
page.locator('[data-testid="row"] [role="button"]')
page.locator('[role="dialog"][data-state="open"]')
```

## Options

```json
{
  "playwright/prefer-native-locators": [
    "error",
    {
      "testIdAttribute": "data-testid"
    }
  ]
}
```

### `testIdAttribute`

Default: `data-testid`

This string option specifies the test ID attribute to look for and replace with
`page.getByTestId()` calls. If you are using
[`page.setTestIdAttribute()`](https://playwright.dev/docs/api/class-selectors#selectors-set-test-id-attribute),
this should be set to the same value as what you pass in to that method.

Examples of **incorrect** code when using
`{ "testIdAttribute": "data-custom-testid" }` option:

```js
page.locator('[data-custom-testid="password-input"]')
```

Examples of **correct** code when using
`{ "testIdAttribute": "data-custom-testid" }` option:

```js
page.getByTestId('password-input')
```
