import rule from '../../src/rules/no-hooks.js'
import { runRuleTester } from '../utils/rule-tester.js'

const messageId = 'unexpectedHook'

runRuleTester('no-hooks', rule, {
  invalid: [
    {
      code: 'test.beforeAll(() => {})',
      errors: [{ data: { hookName: 'beforeAll' }, messageId }],
    },
    {
      code: 'test.beforeEach(() => {})',
      errors: [
        {
          data: { hookName: 'beforeEach' },
          messageId,
        },
      ],
    },
    {
      code: 'test.afterAll(() => {})',
      errors: [{ data: { hookName: 'afterAll' }, messageId }],
    },
    {
      code: 'test.afterEach(() => {})',
      errors: [{ data: { hookName: 'afterEach' }, messageId }],
    },
    {
      code: 'test.beforeEach(() => {}); afterEach(() => { doStuff() });',
      errors: [
        {
          data: { hookName: 'beforeEach' },
          messageId,
        },
      ],
      options: [{ allow: ['afterEach'] }],
    },
  ],
  valid: [
    'test("foo")',
    'test.describe("foo", () => { test("bar") })',
    'test("foo", () => { expect(subject.beforeEach()).toBe(true) })',
    {
      code: 'test.afterEach(() => {}); afterAll(() => {});',
      options: [{ allow: ['afterEach', 'afterAll'] }],
    },
    { code: 'test("foo")', options: [{ allow: undefined }] },
  ],
})
