import { runRuleTester } from '../utils/rule-tester.js'
import rule from './valid-test-annotations.js'

runRuleTester('valid-test-annotations', rule, {
  invalid: [
    // String annotation instead of object
    {
      code: 'test("my test", { annotation: "bug" }, async ({ page }) => {})',
      errors: [{ messageId: 'invalidAnnotationFormat' }],
    },
    // Number annotation
    {
      code: 'test("my test", { annotation: 123 }, async ({ page }) => {})',
      errors: [{ messageId: 'invalidAnnotationFormat' }],
    },
    // Array with string instead of object
    {
      code: 'test("my test", { annotation: ["bug"] }, async ({ page }) => {})',
      errors: [{ messageId: 'invalidAnnotationFormat' }],
    },
    // Object with tag property (should use tag, not annotation)
    {
      code: 'test("my test", { annotation: { tag: ["@XRAY-123"] } }, async ({ page }) => {})',
      errors: [{ messageId: 'tagInAnnotation' }],
    },
    // Object with tag property in array
    {
      code: 'test("my test", { annotation: [{ tag: ["@XRAY-123"], annotation: "bug" }] }, async ({ page }) => {})',
      errors: [{ messageId: 'tagInAnnotation' }],
    },
    // Missing type property
    {
      code: 'test("my test", { annotation: { description: "some description" } }, async ({ page }) => {})',
      errors: [{ messageId: 'missingType' }],
    },
    // Type is not a string
    {
      code: 'test("my test", { annotation: { type: 123, description: "desc" } }, async ({ page }) => {})',
      errors: [{ messageId: 'invalidTypeValue' }],
    },
    // Description is not a string
    {
      code: 'test("my test", { annotation: { type: "issue", description: 123 } }, async ({ page }) => {})',
      errors: [{ messageId: 'invalidDescriptionValue' }],
    },
    // Invalid property in annotation object
    {
      code: 'test("my test", { annotation: { type: "issue", description: "desc", invalid: true } }, async ({ page }) => {})',
      errors: [
        {
          data: { property: 'invalid' },
          messageId: 'invalidAnnotationProperty',
        },
      ],
    },
    // Multiple errors in array
    {
      code: 'test("my test", { annotation: [{ type: "issue" }, { description: "no type" }] }, async ({ page }) => {})',
      errors: [{ messageId: 'missingType' }],
    },
    // test.describe with invalid annotation
    {
      code: 'test.describe("group", { annotation: "bug" }, () => {})',
      errors: [{ messageId: 'invalidAnnotationFormat' }],
    },
    // test.skip with invalid annotation
    {
      code: 'test.skip("my test", { annotation: { tag: "@bug" } }, async ({ page }) => {})',
      errors: [{ messageId: 'tagInAnnotation' }],
    },
  ],
  valid: [
    // Valid annotation with type only
    'test("my test", { annotation: { type: "issue" } }, async ({ page }) => {})',
    // Valid annotation with type and description
    'test("my test", { annotation: { type: "issue", description: "https://github.com/microsoft/playwright/issues/23180" } }, async ({ page }) => {})',
    // Valid annotation array
    'test("my test", { annotation: [{ type: "issue", description: "BUG-123" }, { type: "performance" }] }, async ({ page }) => {})',
    // Valid annotation with tag (separate properties)
    'test("my test", { tag: "@e2e", annotation: { type: "issue", description: "BUG-123" } }, async ({ page }) => {})',
    // Valid annotation in test.describe
    'test.describe("group", { annotation: { type: "category", description: "report" } }, () => {})',
    // Valid annotation in test.skip
    'test.skip("my test", { annotation: { type: "issue", description: "BUG-123" } }, async ({ page }) => {})',
    // Valid annotation in test.only
    'test.only("my test", { annotation: { type: "issue" } }, async ({ page }) => {})',
    // No annotation property
    'test("my test", async ({ page }) => {})',
    // Only tag property
    'test("my test", { tag: "@e2e" }, async ({ page }) => {})',
    // Empty options object
    'test("my test", {}, async ({ page }) => {})',
    // test.step with annotation
    'test.step("step", { annotation: { type: "issue" } }, async () => {})',
  ],
})

