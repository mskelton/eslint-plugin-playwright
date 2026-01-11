# Disallow usage of `page.$eval` and `page.$$eval` (`no-eval`)

## Rule Details

Examples of **incorrect** code for this rule:

```javascript
const searchValue = await page.$eval('#search', (el) => el.value)

const divCounts = await page.$$eval('div', (divs, min) => divs.length >= min, 10)

await page.$eval('#search', (el) => el.value)
await page.$$eval('#search', (el) => el.value)
```

Example of **correct** code for this rule:

```javascript
await page.locator('button').evaluate((node) => node.innerText)
await page.locator('div').evaluateAll((divs, min) => divs.length >= min, 10)
```
