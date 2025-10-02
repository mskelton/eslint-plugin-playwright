# Disallow usage of page locators that are not used (`no-unused-locators`)

Using locators without performing any actions or assertions on them can lead to 
unexpected behavior/flakiness in tests. 
This rule helps ensure that locators are used in some way by requiring that they 
are either acted upon or asserted against.

## Rule Details

Examples of **incorrect** code for this rule:

```javascript
page.getByRole('button', { name: 'Sign in' })
```

By itself, the following line 

```javascript
await page.getByRole('button', { name: 'Sign in' })
```

Examples of **correct** code for this rule:

```javascript
const btn = page.getByRole('button', { name: 'Sign in' })

await page.getByRole('button', { name: 'Sign in' }).click()

await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
```
