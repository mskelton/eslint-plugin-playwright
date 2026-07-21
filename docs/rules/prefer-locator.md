# Suggest using `page.locator()` (`prefer-locator`)

Suggest using locators and their associated methods instead of page methods for
performing actions. `Page` methods that have `Locator` equivalents [are discouraged
in Playwright](https://playwright.dev/docs/api/class-page#page-click).

## Rule details

This rule triggers a warning if page methods are used, instead of locators.

The following patterns are considered warnings:

```javascript
page.click('css=button')
await page.click('css=button')
await page.dblclick('xpath=//button')
await page.fill('input[type="password"]', 'password')

await page.frame('frame-name').click('css=button')
```

The following pattern are **not** warnings:

```javascript
const locator = page.locator('css=button')
await page.getByRole('password').fill('password')
await page.getByLabel('User Name').fill('John')
await page.getByRole('button', { name: 'Sign in' }).click()
await page.locator('input[type="password"]').fill('password')
await page.locator('css=button').click()
await page.locator('xpath=//button').dblclick()

await page.frameLocator('#my-iframe').getByText('Submit').click()
```
