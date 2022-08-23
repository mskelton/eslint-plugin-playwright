import { runRuleTester } from '../utils/rule-tester';
import rule from '../../src/rules/no-focused-test';

const invalid = (code: string, output: string) => ({
  code,
  errors: [
    {
      messageId: 'noFocusedTest',
      suggestions: [{ messageId: 'suggestRemoveOnly', output }],
    },
  ],
});

runRuleTester('no-focused-test', rule, {
  invalid: [
    invalid(
      'test.describe.only("skip this describe", () => {});',
      'test.describe("skip this describe", () => {});'
    ),
    invalid(
      'test.describe["only"]("skip this describe", () => {});',
      'test.describe("skip this describe", () => {});'
    ),
    invalid(
      'test.describe[`only`]("skip this describe", () => {});',
      'test.describe("skip this describe", () => {});'
    ),
    invalid(
      'test.describe.parallel.only("skip this describe", () => {});',
      'test.describe.parallel("skip this describe", () => {});'
    ),
    invalid(
      'test.describe.serial.only("skip this describe", () => {});',
      'test.describe.serial("skip this describe", () => {});'
    ),
    invalid(
      'test.only("skip this test", async ({ page }) => {});',
      'test("skip this test", async ({ page }) => {});'
    ),
    invalid(
      'test["only"]("skip this test", async ({ page }) => {});',
      'test("skip this test", async ({ page }) => {});'
    ),
    invalid(
      'test[`only`]("skip this test", async ({ page }) => {});',
      'test("skip this test", async ({ page }) => {});'
    ),
  ],
  valid: [
    'test.describe("describe tests", () => {});',
    'test.describe.skip("describe tests", () => {});',
    'test("one", async ({ page }) => {});',
    'test.fixme(isMobile, "Settings page does not work in mobile yet");',
    'test["fixme"](isMobile, "Settings page does not work in mobile yet");',
    'test[`fixme`](isMobile, "Settings page does not work in mobile yet");',
    'test.slow();',
    'test["slow"]();',
    'test[`slow`]();',
    'const only = true;',
    'function only() { return null };',
    'this.only();',
  ],
});
