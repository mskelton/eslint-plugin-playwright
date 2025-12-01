import dedent from 'dedent'
import { runRuleTester, test } from '../utils/rule-tester.js'
import rule from './prefer-web-first-assertions.js'

runRuleTester('prefer-web-first-assertions', rule, {
  invalid: [
    // isVisible
    {
      code: test('expect(await page.locator(".tweet").isVisible()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeVisible()'),
    },
    {
      code: test('expect(page.locator(".tweet").isVisible()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 70,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeVisible()'),
    },
    {
      code: test(
        'expect(await page.locator(".tweet").isVisible()).toBe(false)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeHidden()'),
    },
    {
      code: test(`
        const unrelatedAssignment = 'unrelated'
        const isTweetVisible = await page.locator(".tweet").isVisible()
        expect(isTweetVisible).toBe(true)
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 31,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const unrelatedAssignment = 'unrelated'
        const isTweetVisible = page.locator(".tweet")
        await expect(isTweetVisible).toBeVisible()
      `),
    },
    {
      code: test(`
        const unrelatedAssignment = 'unrelated'
        const isTweetVisible = await page.locator(".tweet").isVisible()
        expect(isTweetVisible).toBe(false)
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toBeHidden', method: 'isVisible' },
          endColumn: 31,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const unrelatedAssignment = 'unrelated'
        const isTweetVisible = page.locator(".tweet")
        await expect(isTweetVisible).toBeHidden()
      `),
    },
    {
      code: test(`
        const locatorFoo = page.locator(".foo")
        const isBarVisible = await locatorFoo.locator(".bar").isVisible()
        expect(isBarVisible).toBe(false)
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toBeHidden', method: 'isVisible' },
          endColumn: 29,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const locatorFoo = page.locator(".foo")
        const isBarVisible = locatorFoo.locator(".bar")
        await expect(isBarVisible).toBeHidden()
      `),
    },
    {
      code: test(`
        const locatorFoo = page.locator(".foo")
        const isBarVisible = await locatorFoo.locator(".bar").isVisible()
        expect(isBarVisible).toBe(true)
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 29,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const locatorFoo = page.locator(".foo")
        const isBarVisible = locatorFoo.locator(".bar")
        await expect(isBarVisible).toBeVisible()
      `),
    },
    {
      code: test(
        'expect(await page.locator(".tweet").isVisible()).toEqual(true)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeVisible()'),
    },
    {
      code: test(
        'expect(await page.locator(".tweet").isVisible()).toEqual(false)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeHidden()'),
    },
    {
      code: test(
        'expect(await page.locator(".tweet").isVisible()).not.toBe(true)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeHidden()'),
    },
    {
      code: test(
        'expect(await page.locator(".tweet").isVisible()).not.toBe(false)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".tweet")).toBeVisible()'),
    },
    {
      code: test('expect(page.locator(".button").isVisible()).toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isVisible' },
          endColumn: 71,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".button")).toBeHidden()'),
    },

    // isHidden
    {
      code: test('expect(await foo.isHidden()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isHidden' },
          endColumn: 56,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeHidden()'),
    },
    {
      code: test('expect(await foo.isHidden()).not.toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isHidden' },
          endColumn: 56,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeVisible()'),
    },
    {
      code: test('expect(await foo.isHidden()).toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isHidden' },
          endColumn: 56,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeVisible()'),
    },
    {
      code: test('expect(await foo.isHidden()).not.toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isHidden' },
          endColumn: 56,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeHidden()'),
    },
    {
      code: test('expect(page.locator(".link").isHidden()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeHidden', method: 'isHidden' },
          endColumn: 68,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".link")).toBeHidden()'),
    },

    // getAttribute
    {
      code: test(
        'expect.soft(await foo.getAttribute("aria-label")).toBe("bar")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveAttribute', method: 'getAttribute' },
          endColumn: 77,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect.soft(foo).toHaveAttribute("aria-label", "bar")',
      ),
    },
    {
      code: test(
        'expect.soft(await foo.getAttribute("aria-label")).not.toBe("bar")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveAttribute', method: 'getAttribute' },
          endColumn: 77,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect.soft(foo).not.toHaveAttribute("aria-label", "bar")',
      ),
    },
    {
      code: test(
        'expect.soft(await page.locator("foo").getAttribute("aria-label")).toBe("bar")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveAttribute', method: 'getAttribute' },
          endColumn: 93,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect.soft(page.locator("foo")).toHaveAttribute("aria-label", "bar")',
      ),
    },
    {
      code: test(
        'expect.soft(await page.locator("foo").getAttribute("aria-label")).not.toBe("bar")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveAttribute', method: 'getAttribute' },
          endColumn: 93,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect.soft(page.locator("foo")).not.toHaveAttribute("aria-label", "bar")',
      ),
    },
    {
      code: test(
        'expect(page.locator(".element").getAttribute("data-testid")).toBe("submit")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveAttribute', method: 'getAttribute' },
          endColumn: 88,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(page.locator(".element")).toHaveAttribute("data-testid", "submit")',
      ),
    },

    // innerText
    {
      code: test('expect.soft(await foo.innerText()).toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 62,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect.soft(foo).toHaveText("bar", { useInnerText: true })',
      ),
    },
    {
      code: test('expect.soft(await foo.innerText()).not.toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 62,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect.soft(foo).not.toHaveText("bar", { useInnerText: true })',
      ),
    },
    {
      code: test(
        'expect(page.locator(".text").innerText()).toBe("Hello World")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 69,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(page.locator(".text")).toHaveText("Hello World", { useInnerText: true })',
      ),
    },
    {
      code: test('expect(await foo.innerText()).toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(foo).toHaveText("bar", { useInnerText: true })',
      ),
    },
    {
      code: test('expect(await foo.innerText()).not.toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(foo).not.toHaveText("bar", { useInnerText: true })',
      ),
    },
    {
      code: test('expect(await foo.innerText()).toEqual("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(foo).toHaveText("bar", { useInnerText: true })',
      ),
    },
    {
      code: test(`
        const fooLocator = page.locator('.fooClass');
        const fooLocatorText = await fooLocator.innerText();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'innerText' },
          endColumn: 31,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const fooLocator = page.locator('.fooClass');
        const fooLocatorText = fooLocator;
        await expect(fooLocatorText).toHaveText('foo', { useInnerText: true });
      `),
    },

    // inputValue
    {
      code: test('expect["soft"](await foo.inputValue()).toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveValue', method: 'inputValue' },
          endColumn: 66,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect["soft"](foo).toHaveValue("bar")'),
    },
    {
      code: test('expect[`soft`](await foo.inputValue()).not.toEqual("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveValue', method: 'inputValue' },
          endColumn: 66,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect[`soft`](foo).not.toHaveValue("bar")'),
    },
    {
      code: test(
        'expect(page.locator(".input").inputValue()).toBe("user input")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveValue', method: 'inputValue' },
          endColumn: 71,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(page.locator(".input")).toHaveValue("user input")',
      ),
    },

    // textContent
    {
      code: test('expect(await foo.textContent()).toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 59,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toHaveText("bar")'),
    },
    {
      code: test('expect(await foo.textContent()).not.toBe("bar")'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 59,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).not.toHaveText("bar")'),
    },
    {
      code: test(`
        const fooLocator = page.locator('.fooClass');
        const fooLocatorText = await fooLocator.textContent();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 31,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const fooLocator = page.locator('.fooClass');
        const fooLocatorText = fooLocator;
        await expect(fooLocatorText).toHaveText('foo');
      `),
    },
    {
      code: test(`
        const fooLocator = page.locator('.fooClass');
        let fooLocatorText = await fooLocator.textContent();
        expect(fooLocatorText).toEqual('foo');
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 31,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const fooLocator = page.locator('.fooClass');
        let fooLocatorText = fooLocator;
        await expect(fooLocatorText).toHaveText('foo');
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
      `),
    },
    {
      code: test(`
        let fooLocatorText;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = 'Unrelated';
        fooLocatorText = await fooLocator.textContent();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 31,
          line: 6,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        let fooLocatorText;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = 'Unrelated';
        fooLocatorText = fooLocator;
        await expect(fooLocatorText).toHaveText('foo');
      `),
    },
    {
      code: test(`
        let fooLocatorText;
        let fooLocatorText2;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = await fooLocator.textContent();
        fooLocatorText2 = await fooLocator.textContent();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 31,
          line: 7,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        let fooLocatorText;
        let fooLocatorText2;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = fooLocator;
        fooLocatorText2 = await fooLocator.textContent();
        await expect(fooLocatorText).toHaveText('foo');
      `),
    },
    {
      code: test(`
        let fooLocatorText;
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
        fooLocatorText = await page.locator('.fooClass').textContent();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 31,
          line: 6,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        let fooLocatorText;
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
        fooLocatorText = page.locator('.fooClass');
        await expect(fooLocatorText).toHaveText('foo');
      `),
    },
    {
      code: test(`
        const unrelatedAssignment = "unrelated";
        const fooLocatorText = await page.locator('.foo').textContent();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 31,
          line: 4,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const unrelatedAssignment = "unrelated";
        const fooLocatorText = page.locator('.foo');
        await expect(fooLocatorText).toHaveText('foo');
      `),
    },
    {
      code: test(
        'expect(page.locator(".content").textContent()).toBe("Some content")',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 74,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(page.locator(".content")).toHaveText("Some content")',
      ),
    },

    // allTextContents
    {
      code: javascript('expect(await foo.allTextContents()).toBe("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript(`
          const myText = page.locator('foo li').allTextContents();
          expect(myText).toEqual(['Alpha', 'Beta', 'Gamma'])`),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript('expect(await foo.allTextContents()).not.toBe("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript('expect(await foo.allTextContents()).toEqual("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript('expect.soft(await foo.allTextContents()).toBe("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript(
        'expect["soft"](await foo.allTextContents()).not.toEqual("bar")',
      ),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript(`
        const fooLocator = page.locator('.fooClass');
        const fooLocatorText = await fooLocator.allTextContents();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: javascript(`
        const fooLocator = page.locator('.fooClass');
        let fooLocatorText = await fooLocator.allTextContents();
        expect(fooLocatorText).toEqual('foo');
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        let fooLocatorText;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = 'Unrelated';
        fooLocatorText = await fooLocator.allTextContents();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        let fooLocatorText;
        let fooLocatorText2;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = await fooLocator.allTextContents();
        fooLocatorText2 = await fooLocator.allTextContents();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        let fooLocatorText;
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
        fooLocatorText = await page.locator('.fooClass').allTextContents();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const unrelatedAssignment = "unrelated";
        const fooLocatorText = await page.locator('.foo').allTextContents();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const locatorFoo = page.locator(".foo")
        const isBarText = await locatorFoo.locator(".bar").allTextContents()
        expect(isBarText).toBe("bar")
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const content = await foo.allTextContents();
        expect(content).toBe("bar")
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },

    // allInnerTexts
    {
      code: test('expect(await foo.allInnerTexts()).toBe("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test('expect(await foo.allInnerTexts()).not.toBe("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test('expect(await foo.allInnerTexts()).toEqual("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test('expect.soft(await foo.allInnerTexts()).toBe("bar")'),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(
        'expect["soft"](await foo.allInnerTexts()).not.toEqual("bar")',
      ),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const fooLocator = page.locator('.fooClass');
        const fooLocatorText = await fooLocator.allInnerTexts();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        let fooLocatorText;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = 'Unrelated';
        fooLocatorText = await fooLocator.allInnerTexts();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        let fooLocatorText;
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
        fooLocatorText = await page.locator('.fooClass').allInnerTexts();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const unrelatedAssignment = "unrelated";
        const fooLocatorText = await page.locator('.foo').allInnerTexts();
        expect(fooLocatorText).toEqual('foo');
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const locatorFoo = page.locator(".foo")
        const isBarText = await locatorFoo.locator(".bar").allInnerTexts()
        expect(isBarText).toBe("bar")
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },
    {
      code: test(`
        const content = await foo.allInnerTexts();
        expect(content).toBe("bar")
      `),
      errors: [{ messageId: 'useWebFirstAssertion' }],
    },

    // isChecked
    {
      code: test('expect(await page.locator("howdy").isChecked()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).toBeChecked()'),
    },
    {
      code: test('expect(await page.locator("howdy").isChecked()).toBe(foo)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(page.locator("howdy")).toBeChecked({ checked: foo })',
      ),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isChecked()).toBeTruthy()',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).toBeChecked()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isChecked()).not.toBe(true)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).not.toBeChecked()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isChecked()).not.toBe(bar)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(
        'await expect(page.locator("howdy")).not.toBeChecked({ checked: bar })',
      ),
    },
    {
      code: test('expect(await page.locator("howdy").isChecked()).toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).not.toBeChecked()'),
    },
    {
      code: test('expect(await page.locator("howdy").isChecked()).toBeFalsy()'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).not.toBeChecked()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isChecked()).not.toBe(false)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 75,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).toBeChecked()'),
    },
    {
      code: test('expect(page.locator(".checkbox").isChecked()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeChecked', method: 'isChecked' },
          endColumn: 73,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".checkbox")).toBeChecked()'),
    },

    // isDisabled
    {
      code: test('expect(await foo.isDisabled()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeDisabled', method: 'isDisabled' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeDisabled()'),
    },
    {
      code: test('expect(await foo.isDisabled()).not.toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEnabled', method: 'isDisabled' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeEnabled()'),
    },
    {
      code: test('expect(await foo.isDisabled()).toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEnabled', method: 'isDisabled' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeEnabled()'),
    },
    {
      code: test('expect(await foo.isDisabled()).not.toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeDisabled', method: 'isDisabled' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeDisabled()'),
    },
    {
      code: test('expect(page.locator(".input").isDisabled()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeDisabled', method: 'isDisabled' },
          endColumn: 71,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".input")).toBeDisabled()'),
    },

    // isEnabled
    {
      code: test('expect(await foo.isEnabled()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEnabled', method: 'isEnabled' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeEnabled()'),
    },
    {
      code: test('expect(await foo.isEnabled()).not.toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeDisabled', method: 'isEnabled' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeDisabled()'),
    },
    {
      code: test('expect(await foo.isEnabled()).toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeDisabled', method: 'isEnabled' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeDisabled()'),
    },
    {
      code: test('expect(await foo.isEnabled()).not.toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEnabled', method: 'isEnabled' },
          endColumn: 57,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeEnabled()'),
    },
    {
      code: test('expect(page.locator(".field").isEnabled()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEnabled', method: 'isEnabled' },
          endColumn: 70,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".field")).toBeEnabled()'),
    },

    // isEditable
    {
      code: test('expect(await foo.isEditable()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeEditable()'),
    },
    {
      code: test('expect(await foo.isEditable()).not.toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).not.toBeEditable()'),
    },
    {
      code: test('expect(await foo.isEditable()).toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).not.toBeEditable()'),
    },
    {
      code: test('expect(await foo.isEditable()).not.toBe(false)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 58,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(foo).toBeEditable()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isEditable()).not.toBe(true)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).not.toBeEditable()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isEditable()).toBe(false)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).not.toBeEditable()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isEditable()).toBeFalsy()',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).not.toBeEditable()'),
    },
    {
      code: test(
        'expect(await page.locator("howdy").isEditable()).not.toBe(false)',
      ),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator("howdy")).toBeEditable()'),
    },
    {
      code: test('expect(page.locator(".textarea").isEditable()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeEditable', method: 'isEditable' },
          endColumn: 74,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await expect(page.locator(".textarea")).toBeEditable()'),
    },
    // Global aliases
    {
      code: test('assert(await page.locator(".tweet").isVisible()).toBe(true)'),
      errors: [
        {
          column: 28,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 76,
          line: 1,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test('await assert(page.locator(".tweet")).toBeVisible()'),
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    // Variable references
    {
      code: test(`
        const myValue = await page.locator('.foo').isVisible();
        expect(myValue).toBe(true);
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toBeVisible', method: 'isVisible' },
          endColumn: 24,
          line: 3,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const myValue = page.locator('.foo');
        await expect(myValue).toBeVisible();
      `),
    },
    {
      code: test(`
        const content = await foo.textContent();
        expect(content).toBe("bar")
      `),
      errors: [
        {
          column: 9,
          data: { matcher: 'toHaveText', method: 'textContent' },
          endColumn: 24,
          line: 3,
          messageId: 'useWebFirstAssertion',
        },
      ],
      output: test(`
        const content = foo;
        await expect(content).toHaveText("bar")
      `),
    },
  ],
  valid: [
    { code: test('await expect(page.locator(".tweet")).toBeVisible()') },
    { code: test('await expect(bar).toBeEnabled()') },
    { code: test('await expect.soft(page.locator(".tweet")).toBeDisabled()') },
    { code: test('await expect["soft"](bar).toBeEnabled()') },
    { code: test('const text = await page.locator(".tweet").innerText()') },
    { code: test('let visible = await foo.isVisible()') },
    { code: test('const value = await bar["inputValue"]()') },
    { code: test('const isEditable = await baz[`isEditable`]()') },
    { code: test('await expect(await locator.toString()).toBe("something")') },
    { code: test('const myText = page.locator("foo li").allTextContents()') },
    {
      code: dedent`
        import { expect } from '@playwright/test';

        test('my test', async ({ page }) => {
          await expect
            .poll(() => foo, { message })
            .toEqual(expect.objectContaining({ bar: expect.anything() }));
        });
      `,
    },
    // Global aliases
    {
      code: test('await assert(page.locator(".tweet")).toBeVisible()'),
      settings: {
        playwright: {
          globalAliases: { expect: ['assert'] },
        },
      },
    },
    // Variable references
    {
      code: test(`
        const myValue = page.locator('.foo');
        expect(myValue).toBeVisible();
      `),
    },
    {
      code: test(`
        let fooLocatorText;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = await fooLocator.textContent();
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo');
      `),
    },
    {
      code: test(`
        let fooLocatorText;
        let fooLocatorText2;
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = 'foo';
        fooLocatorText2 = await fooLocator.textContent();
        expect(fooLocatorText).toEqual('foo');
      `),
    },
    {
      code: test(`
        let fooLocatorText;
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo')
        const fooLocator = page.locator('.fooClass');
        fooLocatorText = fooLocator;
        expect(fooLocatorText).toHaveText('foo');
      `),
    },
    {
      code: test(`
        const fooLocator = page.locator('.fooClass');
        let fooLocatorText;
        fooLocatorText = fooLocator;
        expect(fooLocatorText).toHaveText('foo');
        fooLocatorText = 'foo';
        expect(fooLocatorText).toEqual('foo')
      `),
    },
  ],
})
