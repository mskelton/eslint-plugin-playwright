import { runRuleTester } from '../utils/rule-tester.js'
import rule from './prefer-native-locators.js'

runRuleTester('prefer-native-locators', rule, {
  invalid: [
    {
      code: `page.locator('[aria-label="View more"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedLabelQuery' }],
      output: 'page.getByLabel("View more")',
    },
    {
      code: `page.locator('[aria-label=Edit]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedLabelQuery' }],
      output: 'page.getByLabel("Edit")',
    },
    {
      code: `page.locator('[role="button"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      output: 'page.getByRole("button")',
    },
    {
      code: `page.locator('[role=button]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      output: 'page.getByRole("button")',
    },
    {
      code: `page.locator('[placeholder="Enter some text..."]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedPlaceholderQuery' }],
      output: 'page.getByPlaceholder("Enter some text...")',
    },
    {
      code: `page.locator('[placeholder=Name]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedPlaceholderQuery' }],
      output: 'page.getByPlaceholder("Name")',
    },
    {
      code: `page.locator('[alt="Playwright logo"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedAltTextQuery' }],
      output: 'page.getByAltText("Playwright logo")',
    },
    {
      code: `page.locator('[alt=Logo]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedAltTextQuery' }],
      output: 'page.getByAltText("Logo")',
    },
    {
      code: `page.locator('[title="Additional context"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTitleQuery' }],
      output: 'page.getByTitle("Additional context")',
    },
    {
      code: `page.locator('[title=Context]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTitleQuery' }],
      output: 'page.getByTitle("Context")',
    },
    {
      code: `page.locator('[data-testid="password-input"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTestIdQuery' }],
      output: 'page.getByTestId("password-input")',
    },
    {
      code: `page.locator('[data-testid=input]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTestIdQuery' }],
      output: 'page.getByTestId("input")',
    },
    {
      code: `page.locator('[data-custom-testid="password-input"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTestIdQuery' }],
      options: [{ testIdAttribute: 'data-custom-testid' }],
      output: 'page.getByTestId("password-input")',
    },
    {
      code: `page.locator('[data-custom-testid=input]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTestIdQuery' }],
      options: [{ testIdAttribute: 'data-custom-testid' }],
      output: 'page.getByTestId("input")',
    },
    // Works when locators are chained
    {
      code: `this.page.locator('[role="heading"]').first()`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      output: 'this.page.getByRole("heading").first()',
    },
    // Works when used inside an assertion
    {
      code: `await expect(page.locator('[role="alert"]')).toBeVisible()`,
      errors: [{ column: 14, line: 1, messageId: 'unexpectedRoleQuery' }],
      output: 'await expect(page.getByRole("alert")).toBeVisible()',
    },
    {
      code: `await expect(page.locator('[data-testid="top"]')).toContainText(firstRule)`,
      errors: [{ column: 14, line: 1, messageId: 'unexpectedTestIdQuery' }],
      output: 'await expect(page.getByTestId("top")).toContainText(firstRule)',
    },
    // Works when used as part of an action
    {
      code: `await page.locator('[placeholder="New password"]').click()`,
      errors: [{ column: 7, line: 1, messageId: 'unexpectedPlaceholderQuery' }],
      output: 'await page.getByPlaceholder("New password").click()',
    },
    // Works as part of a declaration or other usage
    {
      code: `const dialog = page.locator('[role="dialog"]')`,
      errors: [{ column: 16, line: 1, messageId: 'unexpectedRoleQuery' }],
      output: 'const dialog = page.getByRole("dialog")',
    },
    {
      code: `this.closeModalLocator = this.page.locator('[data-test=close-modal]');`,
      errors: [{ column: 26, line: 1, messageId: 'unexpectedTestIdQuery' }],
      options: [{ testIdAttribute: 'data-test' }],
      output: 'this.closeModalLocator = this.page.getByTestId("close-modal");',
    },
    {
      code: `export class TestClass {
        container = () => this.page.locator('[data-testid="container"]');
      }`,
      errors: [{ column: 27, line: 2, messageId: 'unexpectedTestIdQuery' }],
      output: `export class TestClass {
        container = () => this.page.getByTestId("container");
      }`,
    },
    {
      code: `export class TestClass {
        get alert() {
          return this.page.locator("[role='alert']");
        }
      }`,
      errors: [{ column: 18, line: 3, messageId: 'unexpectedRoleQuery' }],
      output: `export class TestClass {
        get alert() {
          return this.page.getByRole("alert");
        }
      }`,
    },
    {
      code: 'page.locator(`[role="button"]`)',
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      name: 'Template literal role selector should be flagged',
      output: 'page.getByRole("button")',
    },
    {
      code: `page.frameLocator("#frame").locator('[role="button"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      name: 'frameLocator().locator() chain should be flagged',
      output: 'page.frameLocator("#frame").getByRole("button")',
    },
    // Nested locators - variable-based
    {
      code: `table.locator('[role="row"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      name: 'Variable-based nested locator with role selector should be flagged',
      output: 'table.getByRole("row")',
    },
    {
      code: `sidebar.locator('[data-testid="nav-item"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTestIdQuery' }],
      name: 'Variable-based nested locator with testid selector should be flagged',
      output: 'sidebar.getByTestId("nav-item")',
    },
    // Nested locators - chained
    {
      code: `page.getByRole("region").locator('[role="button"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedRoleQuery' }],
      name: 'Chained locator with role selector should be flagged',
      output: 'page.getByRole("region").getByRole("button")',
    },
    {
      code: `page.locator(".container").locator('[data-testid="input"]')`,
      errors: [{ column: 1, line: 1, messageId: 'unexpectedTestIdQuery' }],
      name: 'Chained locator with testid selector should be flagged',
      output: 'page.locator(".container").getByTestId("input")',
    },
  ],
  valid: [
    { code: 'page.getByLabel("View more")' },
    { code: 'page.getByRole("button")' },
    { code: 'page.getByRole("button", {name: "Open"})' },
    { code: 'page.getByPlaceholder("Enter some text...")' },
    { code: 'page.getByAltText("Playwright logo")' },
    { code: 'page.getByTestId("password-input")' },
    { code: 'page.getByTitle("Additional context")' },
    { code: 'this.page.getByLabel("View more")' },
    { code: 'this.page.getByRole("button")' },
    { code: 'this.page.getByPlaceholder("Enter some text...")' },
    { code: 'this.page.getByAltText("Playwright logo")' },
    { code: 'this.page.getByTestId("password-input")' },
    { code: 'this.page.getByTitle("Additional context")' },
    { code: 'page.locator(".class")' },
    { code: 'page.locator("#id")' },
    { code: 'this.page.locator("#id")' },
    // Does not match on more complex queries
    {
      code: `page.locator('[complex-query] > [aria-label="View more"]')`,
    },
    {
      code: `page.locator('[complex-query] > [role="button"]')`,
    },
    {
      code: `page.locator('[complex-query] > [placeholder="Enter some text..."]')`,
    },
    {
      code: `page.locator('[complex-query] > [alt="Playwright logo"]')`,
    },
    {
      code: `page.locator('[complex-query] > [data-testid="password-input"]')`,
    },
    {
      code: `page.locator('[complex-query] > [title="Additional context"]')`,
    },
    {
      code: `this.page.locator('[complex-query] > [title="Additional context"]')`,
    },
    // Works for empty string and no arguments
    { code: `page.locator('')` },
    { code: `page.locator()` },
    // Works for classes and declarations
    { code: `const dialog = page.getByRole("dialog")` },
    {
      code: `export class TestClass {
        get alert() {
          return this.page.getByRole("alert");
        }
      }`,
    },
    {
      code: `export class TestClass {
        container = () => this.page.getByTestId("container");
      }`,
    },
    { code: `this.closeModalLocator = this.page.getByTestId("close-modal");` },
  ],
})
