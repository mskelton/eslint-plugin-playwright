import dedent from 'dedent'
import { runRuleTester } from '../utils/rule-tester.js'
import rule from './no-hooks.js'

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
    {
      code: dedent`
        test.describe("outer", () => {
          test.describe("inner", () => {
            test.beforeEach(() => {})
          })
        })
      `,
      errors: [{ data: { hookName: 'beforeEach' }, messageId }],
      name: 'Hooks in nested describe should be flagged',
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
